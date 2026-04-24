#!/usr/bin/env bash
set -euo pipefail

preferred_node_bin="${HOME}/.local/node-current/bin"

if [[ -x "${preferred_node_bin}/node" ]]; then
  export PATH="${preferred_node_bin}:${PATH}"
fi

exec "$@"
