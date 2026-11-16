import {runHostPreview} from '../../packages/world-engine/index.js';
import {writeFileSync,mkdirSync} from 'node:fs';
const scenario={schema_version:1,id:'AGV-01',world:'WAREHOUSE_BAY_01',seed:42,mode:'LOCKSTEP_WORLD',physics_version:'warehouse-planar-v1',simulation_dt_ms:50,duration_sim_ms:6000,faults:[{kind:'RANGE_FREEZE',start_tick:15}],assertions:[{kind:'NO_COLLISION'}]};
mkdirSync('artifacts',{recursive:true});
for(const controller of ['vulnerable','guarded']){const result=runHostPreview(scenario,{controller});writeFileSync('artifacts/'+controller+'.json',JSON.stringify(result,null,2));console.log(controller,result.manifest.verdict,'collision',result.frames.at(-1).collisions.length>0,'events',result.events.length);}
console.log('HOST_MODEL_TEST artifacts ONLY; no QNX execution.');
