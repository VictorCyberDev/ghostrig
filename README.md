# GhostRig 2.0 — R0 Foundation (HOST MODEL ONLY)

**Physical Failure Intelligence for QNX:** discover, reproduce, visualize, explain, correct, verify.

This first engineering milestone includes a deterministic planar host world engine, versioned evidence contracts, a verified negative-case test suite, and QNX native IPC smoke-test source. **No QNX execution has been observed.** The host simulation is not a native QNX controller or a safety certification.

## Run

Node.js 22+, no npm dependencies:

```sh
npm test
npm run demo
```

The demo writes `artifacts/vulnerable.json` and `artifacts/guarded.json`, explicitly tagged `HOST_MODEL_TEST`. They show an illustrative fail/pass comparison, not two native QNX binaries.

See `docs/qnx-repro.md` for instructions and evidence requirements before claiming a QNX run.

## R0 remaining gates

* Boot lawful private QNX 8.0 guest; compile and observe native C IPC program.
* Build actual QNX resource manager and host/guest bridge (R1).
* Create cinematic industrial 3D Warehouse Bay 01 and accessibility fallback.
* Replace host model controller with distinct QNX controller executables; capture linked evidence.

No proprietary QNX binaries, images or credentials belong in this repository.
