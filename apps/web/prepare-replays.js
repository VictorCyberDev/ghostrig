import {writeFileSync,mkdirSync} from 'node:fs';
import {runHostPreview} from '../../packages/world-engine/index.js';
const scenario={schema_version:1,id:'AGV-01',world:'WAREHOUSE_BAY_01',seed:42,mode:'LOCKSTEP_WORLD',physics_version:'warehouse-planar-v1',simulation_dt_ms:50,duration_sim_ms:6000,faults:[{kind:'RANGE_FREEZE',start_tick:15}],assertions:[{kind:'NO_COLLISION'}]};
mkdirSync(new URL('./public/replays/',import.meta.url),{recursive:true});
for(const controller of ['vulnerable','guarded']){
 const run=runHostPreview(scenario,{controller});
 const output={manifest:run.manifest,events:run.events,frames:run.frames};
 writeFileSync(new URL('./public/replays/'+controller+'.json',import.meta.url),JSON.stringify(output));
 console.log(controller,run.manifest.verdict,run.frames.length,'authoritative host frames');
}
