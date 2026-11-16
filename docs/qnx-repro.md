# R0 Native QNX reproduction — NOT YET VERIFIED

Use a privately authorized, properly licensed QNX 8.0 SDP/toolchain and QNX 8.0 target. Do not upload SDK/target image or credentials.

1. Follow the official QNX Everywhere / QEMU codelab for your installed host and license.
2. Record host OS, SDP version, target version, QEMU configuration and environment limitations.
3. On an authorized system, build `target/qnx/smoke` using `qcc` (verify Makefile against the installed SDP).
4. Start `ipc_server` on the guest, then run `ipc_client` on the same target.
5. Preserve raw stdout, exit status, timestamps, toolchain versions and binary SHA-256 hashes.
6. Only after independent verification mark IPC evidence as `QNX_EXECUTED`. Native application logs are not kernel trace artifacts.

This smoke test uses name attachment and native messages; it is **not** the actual range/motor resource manager, bridge, physical loop or A/B controller experiment.
