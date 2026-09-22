import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { dump, load } from "js-yaml";
import { validateReleaseWorkflow } from "./release-workflow-quality.mjs";

const workflowText = await readFile(
  new URL("../../.github/workflows/build-packages.yml", import.meta.url),
  "utf8",
);

function mutate(change) {
  const workflow = load(workflowText);
  change(workflow);
  return validateReleaseWorkflow(dump(workflow));
}

describe("release workflow quality", () => {
  it("accepts the checked-in guarded workflow", () => {
    expect(validateReleaseWorkflow(workflowText)).toEqual([]);
  });

  it("rejects a release guard that lets pull requests forged as main publish", () => {
    const errors = mutate((workflow) => {
      workflow.jobs.release.if = "github.ref_name == 'main'";
    });
    expect(errors.join("\n")).toContain("release job guard is unsafe for fork pull request on main");
  });

  it("uses GitHub expression truthiness", () => {
    const errors = mutate((workflow) => {
      workflow.jobs.release.if = `(${workflow.jobs.release.if}) && 1`;
    });
    expect(errors).toEqual([]);
  });

  it("rejects weakened validation gates and a conditional build", () => {
    const errors = mutate((workflow) => {
      const docs = workflow.jobs.build.steps.find((step) =>
        String(step.run ?? "").trim() === "npm run docs:check",
      );
      docs.run = "npm run docs:check || true";
      docs["continue-on-error"] = true;
      workflow.jobs.build.if = "github.event_name == 'push'";
    });
    expect(errors.join("\n")).toContain("build must run npm run docs:check unconditionally");
    expect(errors.join("\n")).toContain("build job must not be conditional or continue after errors");
  });

  it("rejects unsafe triggers and a default-on CWS dispatch", () => {
    const errors = mutate((workflow) => {
      workflow.on.pull_request_target = { branches: ["main"] };
      workflow.on.pull_request.paths = ["src/**"];
      workflow.on.schedule = [{ cron: "0 0 * * *" }];
      workflow.on.workflow_dispatch.inputs.submit_chrome_web_store.default = true;
    });
    expect(errors.join("\n")).toContain("workflow must not use pull_request_target");
    expect(errors.join("\n")).toContain("workflow triggers must be limited");
    expect(errors.join("\n")).toContain("pull_request must target all changes on main only");
    expect(errors.join("\n")).toContain("submit_chrome_web_store as default-false boolean");
  });

  it("rejects root, build, and release secret references", () => {
    const errors = mutate((workflow) => {
      workflow.env = { ROOT_SECRET: "${{ secrets['ROOT_SECRET'] }}" };
      workflow.jobs.build.env = {
        CWS_SERVICE_ACCOUNT_JSON: "${{ secrets['CWS_SERVICE_ACCOUNT_JSON'] }}",
      };
      workflow.jobs.release.env = {
        OTHER_SECRET: "${{ secrets.OTHER_SECRET }}",
      };
    });
    expect(errors.join("\n")).toContain("workflow scope must not reference secrets");
    expect(errors.join("\n")).toContain("build job must not reference secrets");
    expect(errors.join("\n")).toContain("release must not reference secrets; use github.token only");
  });

  it("rejects broad build permissions and persisted checkout credentials", () => {
    const errors = mutate((workflow) => {
      workflow.permissions = { contents: "write" };
      workflow.jobs.build.permissions = { contents: "write" };
      const checkout = workflow.jobs.build.steps.find((step) =>
        String(step.uses ?? "").startsWith("actions/checkout@"),
      );
      checkout.with["persist-credentials"] = true;
    });
    expect(errors.join("\n")).toContain("workflow permissions must be contents: read only");
    expect(errors.join("\n")).toContain("build permissions may only inherit or set contents: read");
    expect(errors.join("\n")).toContain("checkout steps must disable persisted credentials");
  });

  it("rejects unexpected jobs", () => {
    const errors = mutate((workflow) => {
      workflow.jobs.unexpected = { "runs-on": "ubuntu-latest", steps: [] };
    });
    expect(errors.join("\n")).toContain("workflow jobs must be limited");
  });

  it("rejects unsafe CWS guards and malformed expressions", () => {
    const cwsErrors = mutate((workflow) => {
      workflow.jobs["chrome-web-store"].if =
        "github.ref_type == 'tag' && startsWith(github.ref_name, 'v')";
    });
    const expressionErrors = mutate((workflow) => {
      workflow.jobs.release.if = "github.event_name ==";
    });
    const manualErrors = mutate((workflow) => {
      workflow.jobs["chrome-web-store"].if = "github.event_name == 'workflow_dispatch'";
    });
    expect(cwsErrors.join("\n")).toContain("chrome-web-store job guard is unsafe for fork pull request forged as tag");
    expect(cwsErrors.join("\n")).toContain("chrome-web-store job guard is unsafe for dispatch false on tag");
    expect(manualErrors.join("\n")).toContain("chrome-web-store job guard is unsafe for dispatch false on main");
    expect(expressionErrors.join("\n")).toContain("release job guard is not a valid GitHub expression");
  });
});
