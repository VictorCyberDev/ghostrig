# Warehouse Bay 01 UI status

R1 implements a genuine React Three Fiber/WebGL scene for locally recorded host simulation frames, basic industrial warehouse geometry, racks, pallets, lighting, robot chassis and sensor, camera controls, replay stepping, incident selection, and text alternative.

## Run

\`\`\`sh
cd apps/web
npm install
npm run dev
\`\`\`

This is a **first integrated 3D art/engineering spike**, not the locked production-quality cinematic realism target. There is no Blender-authored hero GLB, sourced PBR asset manifest, performance benchmark, live QNX stream, authentic QNX run, accessibility audit or independently captured browser screenshot yet.

Viewer uses only JSON exported by the host world engine. Changing the controller toggles between two *host-model* runs, not two native QNX executables. The provenance badge MUST remain explicit. UI build CI is not a browser E2E test. Do not describe these visuals as 'game quality' until reviewed.
