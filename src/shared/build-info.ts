// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 David-Lzy (https://github.com/David-Lzy). All rights reserved.
// Source: https://github.com/David-Lzy/AI_Usage_Dashboard

export const BUILD_INFO = {
  version:        __APP_VERSION__,
  buildTimestamp: __BUILD_TIMESTAMP__,
  gitCommit:      __GIT_COMMIT__,
  sourceOrigin:   __SOURCE_ORIGIN__,
} as const;
