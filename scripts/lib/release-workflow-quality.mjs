import { Evaluator, Lexer, Parser, data } from "@actions/expressions";
import { truthy } from "@actions/expressions/result";
import { load } from "js-yaml";

const EXPECTED_JOBS = ["build", "release", "chrome-web-store"];
const REQUIRED_BUILD_COMMANDS = [
  "npm run docs:check",
  "npm run provider:quality",
  "npm run i18n:check",
  "npm run typecheck",
  "npm run test",
  "npm run release:workflow:check",
];

const EVENT_FIXTURES = [
  { name: "fork pull request on main", eventName: "pull_request", refType: "branch", refName: "main", fork: true },
  { name: "fork pull request forged as tag", eventName: "pull_request", refType: "tag", refName: "v9.9.9", fork: true },
  { name: "ordinary pull request forged as main", eventName: "pull_request", refType: "branch", refName: "main" },
  { name: "ordinary pull request forged as tag", eventName: "pull_request", refType: "tag", refName: "v9.9.9" },
  { name: "ordinary pull request", eventName: "pull_request", refType: "branch", refName: "feature" },
  { name: "main push", eventName: "push", refType: "branch", refName: "main", release: true },
  { name: "version tag push", eventName: "push", refType: "tag", refName: "v1.2.3", release: true, cws: true },
  { name: "non-version tag push", eventName: "push", refType: "tag", refName: "release-1.2.3" },
  { name: "ordinary branch push", eventName: "push", refType: "branch", refName: "feature" },
  { name: "dispatch false on main", eventName: "workflow_dispatch", refType: "branch", refName: "main" },
  { name: "dispatch true on main", eventName: "workflow_dispatch", refType: "branch", refName: "main", submit: true, cws: true },
  { name: "dispatch false on tag", eventName: "workflow_dispatch", refType: "tag", refName: "v1.2.3" },
  { name: "dispatch true on tag", eventName: "workflow_dispatch", refType: "tag", refName: "v1.2.3", submit: true, cws: true },
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyPermission(permissions, contents) {
  return isObject(permissions) && Object.keys(permissions).length === 1 && permissions.contents === contents;
}

function hasExactValues(value, expected) {
  const actual = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  return actual.length === expected.length && expected.every((item) => actual.includes(item));
}

function needsBuild(job) { return hasExactValues(job?.needs, ["build"]); }

function containsSecretReference(value) {
  if (typeof value === "string") {
    return /\bsecrets\s*(?:\.|\[)/i.test(value);
  }
  if (Array.isArray(value)) {
    return value.some(containsSecretReference);
  }
  return isObject(value) && Object.values(value).some(containsSecretReference);
}

function hasSafeCheckouts(job) {
  return (job?.steps ?? []).every(
    (step) =>
      !String(step?.uses ?? "").startsWith("actions/checkout@") ||
      step?.with?.["persist-credentials"] === false ||
      step?.with?.["persist-credentials"] === "false",
  );
}

function expressionSource(value) {
  if (typeof value !== "string") {
    throw new Error("must be a string expression");
  }
  return value.trim().replace(/^\$\{\{\s*|\s*\}\}$/g, "");
}

function dictionary(values) {
  return new data.Dictionary(...Object.entries(values).map(([key, value]) => ({ key, value })));
}

function evaluateIf(source, fixture) {
  const github = dictionary({
    event_name: new data.StringData(fixture.eventName),
    ref_type: new data.StringData(fixture.refType),
    ref_name: new data.StringData(fixture.refName),
    event: dictionary({ pull_request: dictionary({ head: dictionary({ repo: dictionary({ fork: new data.BooleanData(fixture.fork === true) }) }) }) }),
  });
  const context = dictionary({
    github,
    inputs: dictionary({ submit_chrome_web_store: new data.BooleanData(fixture.submit === true) }),
  });
  const tokens = new Lexer(expressionSource(source)).lex().tokens;
  const expression = new Parser(tokens, ["github", "inputs"], []).parse();
  return truthy(new Evaluator(expression, context).evaluate());
}

function validateGuard(job, label, expectedKey, errors) {
  if (typeof job?.if !== "string") {
    errors.push(`${label} job must define an if guard`);
    return;
  }
  try {
    for (const fixture of EVENT_FIXTURES) {
      if (evaluateIf(job.if, fixture) !== (fixture[expectedKey] === true)) {
        errors.push(`${label} job guard is unsafe for ${fixture.name}`);
      }
    }
  } catch (error) {
    errors.push(`${label} job guard is not a valid GitHub expression: ${error.message}`);
  }
}

function validateTriggers(workflow, errors) {
  const triggers = workflow.on;
  if (!isObject(triggers)) {
    errors.push("workflow must define structured triggers");
    return;
  }
  if (Object.hasOwn(triggers, "pull_request_target")) {
    errors.push("workflow must not use pull_request_target");
  }
  if (!hasExactValues(Object.keys(triggers), ["pull_request", "push", "workflow_dispatch"])) {
    errors.push("workflow triggers must be limited to pull_request, push, and workflow_dispatch");
  }
  if (
    !isObject(triggers.pull_request) ||
    !hasExactValues(Object.keys(triggers.pull_request), ["branches"]) ||
    !hasExactValues(triggers.pull_request.branches, ["main"])
  ) {
    errors.push("pull_request must target all changes on main only");
  }
  if (
    !isObject(triggers.push) ||
    !hasExactValues(triggers.push.branches, ["main"]) ||
    !hasExactValues(triggers.push.tags, ["v*"])
  ) {
    errors.push("push must be limited to main and v* tags");
  }
  const input = triggers.workflow_dispatch?.inputs?.submit_chrome_web_store;
  if (!isObject(input) || input.type !== "boolean" || input.default !== false) {
    errors.push("workflow_dispatch must define submit_chrome_web_store as default-false boolean");
  }
}

export function validateReleaseWorkflow(workflowText) {
  let workflow;
  try {
    workflow = load(workflowText);
  } catch (error) {
    return [`workflow YAML is invalid: ${error.message}`];
  }
  if (!isObject(workflow) || !isObject(workflow.jobs)) {
    return ["workflow must contain a jobs mapping"];
  }

  const errors = [];
  validateTriggers(workflow, errors);
  if (!hasOnlyPermission(workflow.permissions, "read")) {
    errors.push("workflow permissions must be contents: read only");
  }

  const jobs = workflow.jobs;
  if (Object.keys(jobs).length !== EXPECTED_JOBS.length || !EXPECTED_JOBS.every((name) => Object.hasOwn(jobs, name))) {
    errors.push("workflow jobs must be limited to build, release, and chrome-web-store");
    return errors;
  }

  const build = jobs.build;
  if (!isObject(build)) {
    errors.push("build job is required");
  } else {
    if (Object.hasOwn(build, "if") || Object.hasOwn(build, "continue-on-error")) {
      errors.push("build job must not be conditional or continue after errors");
    }
    if (build.permissions !== undefined && !hasOnlyPermission(build.permissions, "read")) {
      errors.push("build permissions may only inherit or set contents: read");
    }
    if (Object.hasOwn(build, "secrets") || containsSecretReference(build)) {
      errors.push("build job must not reference secrets");
    }
    if (!hasSafeCheckouts(build)) {
      errors.push("checkout steps must disable persisted credentials");
    }
    for (const command of REQUIRED_BUILD_COMMANDS) {
      if (!(build.steps ?? []).some((step) =>
        step?.if === undefined &&
        !Object.hasOwn(step, "continue-on-error") &&
        String(step?.run ?? "").trim() === command,
      )) {
        errors.push(`build must run ${command} unconditionally`);
      }
    }
  }
  const rootWithoutJobs = { ...workflow };
  delete rootWithoutJobs.jobs;
  if (Object.hasOwn(workflow, "secrets") || containsSecretReference(rootWithoutJobs)) {
    errors.push("workflow scope must not reference secrets");
  }

  const release = jobs.release;
  if (!hasOnlyPermission(release?.permissions, "write")) {
    errors.push("release permissions must be contents: write only");
  }
  if (!needsBuild(release)) {
    errors.push("release must need build only");
  }
  if (containsSecretReference(release)) {
    errors.push("release must not reference secrets; use github.token only");
  }
  if (!hasSafeCheckouts(release)) {
    errors.push("checkout steps must disable persisted credentials");
  }
  validateGuard(release, "release", "release", errors);

  const cws = jobs["chrome-web-store"];
  if (!hasOnlyPermission(cws?.permissions, "read")) {
    errors.push("chrome-web-store permissions must be contents: read only");
  }
  if (!needsBuild(cws)) {
    errors.push("chrome-web-store must need build only");
  }
  if (!hasSafeCheckouts(cws)) {
    errors.push("checkout steps must disable persisted credentials");
  }
  validateGuard(cws, "chrome-web-store", "cws", errors);
  return errors;
}
