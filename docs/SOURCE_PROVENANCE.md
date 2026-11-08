# Source provenance and licensing checklist

## Historical game source reference only

The Chromium project documents that its network-error resources include the scripts and images for the offline dinosaur game:

- [Chromium network-error resources README](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/components/neterror/README.md)
- [Historical T-Rex runner source (Chromium 74.0.3719.3)](https://chromium.googlesource.com/chromium/src/+/refs/tags/74.0.3719.3/components/neterror/resources/offline.js)
- [Chromium source repository license](https://github.com/chromium/chromium/blob/main/LICENSE)

The historical runner file identifies its copyright as The Chromium Authors, 2014, and says it is governed by a BSD-style license. The Chromium repository's top-level license is BSD 3-Clause. This is a useful starting point, **not** proof that every game asset, dependency, or file in every historical revision has identical licensing.

## If considering Chromium source in the future

1. Choose and record the exact Chromium revision to be used.
2. Inventory every required JavaScript/TypeScript file, image, sound, font, and other asset.
3. Check the license and copyright notice for each file and any bundled dependency.
4. Preserve all required notices in source distributions and in the app's legal/third-party notices.
5. Record any modifications made to upstream files.
6. Do not use Google or Chrome names, logos, or artwork as app branding, and do not imply endorsement.
7. Have a parent/guardian review the final licensing and store-submission plan before public release.

## Important distinction

The open-source license for Chromium code does not grant rights to use Google trademarks or imply that every related brand asset is freely reusable. Do not publish an app-store listing until the source and asset audit is complete.

This document is project research, not legal advice.
