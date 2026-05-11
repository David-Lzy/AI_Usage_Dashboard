#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
preferred_node_bin="${HOME}/.local/node-current/bin/node"
required_major=22
required_minor=12

version_satisfies() {
  local node_bin="$1"

  "$node_bin" - "$required_major" "$required_minor" <<'EOF'
const [, , requiredMajorArg, requiredMinorArg] = process.argv;
const [major, minor] = process.versions.node.split(".").map(Number);
const requiredMajor = Number(requiredMajorArg);
const requiredMinor = Number(requiredMinorArg);

if (
  Number.isNaN(major) ||
  Number.isNaN(minor) ||
  major < requiredMajor ||
  (major === requiredMajor && minor < requiredMinor)
) {
  process.exit(1);
}
EOF
}

resolve_node_launcher() {
  if [[ -x "$preferred_node_bin" ]] && version_satisfies "$preferred_node_bin"; then
    printf '%s\n' "$preferred_node_bin"
    return 0
  fi

  if command -v node >/dev/null 2>&1; then
    local system_node
    system_node="$(command -v node)"

    if version_satisfies "$system_node"; then
      printf '%s\n' "$system_node"
      return 0
    fi
  fi

  printf '\n'
}

exec_with_node_args() {
  local node_launcher="$1"
  shift

  if [[ -n "$node_launcher" ]]; then
    exec "$node_launcher" "$@"
  fi

  exec npx -y node@22 "$@"
}

exec_with_entrypoint() {
  local node_launcher="$1"
  local entrypoint="$2"
  shift 2

  exec_with_node_args "$node_launcher" "$entrypoint" "$@"
}

command_name="${1:-}"

if [[ -z "$command_name" ]]; then
  echo "Usage: ./scripts/with-preferred-node.sh <node|vite|vitest|tsc> [args...]" >&2
  exit 64
fi

shift

node_launcher="$(resolve_node_launcher)"

case "$command_name" in
  node)
    exec_with_node_args "$node_launcher" "$@"
    ;;
  vite)
    exec_with_entrypoint "$node_launcher" "$project_root/node_modules/vite/bin/vite.js" "$@"
    ;;
  vitest)
    exec_with_entrypoint "$node_launcher" "$project_root/node_modules/vitest/vitest.mjs" "$@"
    ;;
  tsc)
    exec_with_entrypoint "$node_launcher" "$project_root/node_modules/typescript/bin/tsc" "$@"
    ;;
  *)
    echo "Unsupported command '$command_name'. Expected one of: node, vite, vitest, tsc." >&2
    exit 64
    ;;
esac
