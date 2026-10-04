# Third-Party Notices

AI Usage Dashboard is licensed under AGPL-3.0-only. This file records bounded
third-party source adoption that requires preserved attribution in distributed
source code or packages.

## Current Provider Source Adoption

No Provider parser, normalizer, fixture, or bridge implementation currently
contains copied or translated/derived third-party source code.

CodexBar was used as a protocol discovery lead for official service-status
endpoint candidates. The endpoints were independently verified against the
official vendor domains, and no CodexBar source or fixture code was copied.
Its Provider descriptor and fetch-plan architecture was also reviewed as a
concept-only reference; the local browser-extension contracts were implemented
independently. The pinned records are maintained in
`config/provider-upstream-provenance.json`.

## Maintenance Rule

Any future `copied` or `translated/derived` Provider adoption must add a notice
section with a stable notice ID, upstream copyright and license text, source
file and pinned commit, local destination, and modification summary. The same
notice ID must be present in the provenance ledger and in applicable copied or
derived source headers. `npm run provider:quality` rejects incomplete records.

## Material Component Dependencies

The settings component adapter bundles MDUI 2.1.5 and the dependencies pinned in
package-lock.json. These are unmodified dependencies, not Provider source adoption.
No remote component scripts, icon fonts or stylesheets are loaded. This notice
is included in both browser build directories.

### MIT-Licensed Components

- MDUI 2.1.5: Copyright (c) 2016-present zdhxiong@gmail.com
- @mdui/jq 3.0.3: Copyright (c) 2018-present zdhxiong@gmail.com
- @mdui/shared 1.0.9 and @mdui/icons-shared 1.0.1:
  Copyright (c) 2021-present zdhxiong@gmail.com
- @floating-ui/utils 0.2.12: Copyright (c) 2021-present Floating UI contributors
- classcat 5.0.5: Copyright (c) Jorge Bucaran <https://jorgebucaran.com>
- is-promise 4.0.0: Copyright (c) 2014 Forbes Lindesay
- ssr-window 5.0.1: Copyright (c) 2018 Vladimir Kharlampidi

The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### BSD-Licensed Components

Lit 3.3.3, lit-html 3.3.3, lit-element 4.2.2, @lit/reactive-element 2.1.2:
Copyright (c) 2017 Google LLC. All rights reserved.

@lit/localize 0.12.2: Copyright (c) 2020 Google LLC. All rights reserved.

@lit-labs/ssr-dom-shim 1.6.0: Copyright 2019 Google LLC.

BSD 3-Clause License

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

### TypeScript Runtime Helpers

tslib 2.8.1

Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
