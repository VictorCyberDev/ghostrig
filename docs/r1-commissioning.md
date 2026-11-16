# R1 commissioning and truthful acceptance

## Native device smoke test

**Status: source written; target compilation and execution NOT VERIFIED.**

QNX requires user-controlled entitlement and a lawful, private QNX SDP 8.0 environment. Use the official [QSTI/QEMU Ubuntu codelab](https://qnx.github.io/codelabs/setup-qsti-qemu-on-ubuntu/index.html) and follow the installed SDP's exact build guidance.

In an authorized QNX developer environment:

\`\`\`sh
cd target/qnx/resource-managers
make
./range_manager
# In a second QNX terminal, same guest / authorized user:
./range_client
\`\`\`

Capture actual compiler version, exit codes, OS version, actual stdout, PID, binary SHA-256, \`/dev/ghostr/range\` access behavior, and reboot persistence expectations. Confirm mode 0600 ownership permits the intended client. Verify repeated read, short read, invalid path and process-loss behavior. Revisit portability of \`_IO_SET_READ_NBYTES\` and IOFUNC flags against installed QNX headers. No logged native execution is included.

**Important:** the manager currently returns a clearly static GHRS1 fixture. This is a deliberate intermediate integration test, not a host-world-derived sensor, authenticated transport, motor resource manager, or functional AGV-01 native controller. No native client result may be fabricated from a host script.

## Host bridge security tests

The \`packages/bridge-protocol\` module implements bounded authenticated and sequenced message validation, run identity and abort on corruption, but **does not establish a network connection, attest installed QNX version, or enable execution on the guest**. QNX build strings in Node tests are placeholders.

## Remaining R1 acceptance gates

- Boot the lawfully licensed guest and verify compiler/target.
- Run IPC smoke and real resource-manager/client exchange on QNX.
- Implement private physical host↔guest bridge transport and authenticated session provisioning.
- Add host-derived generation/age sensor state and native motor command device; integrate with world engine.
- Run two independent compiled native QNX controller binaries and link run hashes to captured events.
- Validate screenshots, 3D measurements, accessibility and browser testing independently.

None of these can be claimed from host CI.
