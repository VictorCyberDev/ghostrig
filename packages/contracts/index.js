import {createHash} from 'node:crypto';
export const SCHEMA_VERSION=1;
export const EXECUTION_CLASS=Object.freeze({ILLUSTRATIVE_SIM:'ILLUSTRATIVE_SIM',HOST_MODEL_TEST:'HOST_MODEL_TEST',QNX_EXECUTED:'QNX_EXECUTED',QNX_TRACE_VERIFIED:'QNX_TRACE_VERIFIED'});
export const sha256=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const ensure=(ok,message)=>{if(!ok)throw new TypeError(message);};
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function validateScenario(s){
 ensure(s&&typeof s==='object'&&!Array.isArray(s),'scenario object required');
 ensure(s.schema_version===1,'schema_version must equal 1');
 ensure(typeof s.id==='string'&&/^[A-Z0-9-]{3,40}$/.test(s.id),'invalid scenario id');
 ensure(s.world==='WAREHOUSE_BAY_01','unsupported world');
 ensure(Number.isSafeInteger(s.seed)&&s.seed>=0,'invalid seed');
 ensure(s.mode==='LOCKSTEP_WORLD'||s.mode==='WALLCLOCK_QNX','unknown execution mode');
 ensure(s.physics_version==='warehouse-planar-v1','unknown physics version');
 ensure(finite(s.simulation_dt_ms)&&s.simulation_dt_ms>=10&&s.simulation_dt_ms<=100,'dt out of bounds');
 ensure(finite(s.duration_sim_ms)&&s.duration_sim_ms>0&&s.duration_sim_ms<=60000,'duration out of bounds');
 ensure(Number.isInteger(s.duration_sim_ms/s.simulation_dt_ms),'duration not divisible by dt');
 ensure(Array.isArray(s.faults)&&s.faults.length<=8,'invalid faults');
 ensure(Array.isArray(s.assertions)&&s.assertions.length>=1,'assertions required');
 for(const f of s.faults)ensure(f&&f.kind==='RANGE_FREEZE'&&Number.isSafeInteger(f.start_tick)&&f.start_tick>=0,'invalid fault');
 for(const a of s.assertions)ensure(a&&['NO_COLLISION','REQUIRE_COLLISION','STOP_BEFORE_OBSTACLE'].includes(a.kind),'invalid assertion');
 ensure(!s.faults.some((f,i)=>s.faults.some((g,j)=>i!==j&&g.kind===f.kind)),'duplicate range freeze');
 return structuredClone(s);
}
export function validateEvent(e){
 ensure(e&&e.schema_version===1&&typeof e.run_id==='string'&&Number.isSafeInteger(e.seq)&&e.seq>=0,'bad identity');
 ensure(Number.isSafeInteger(e.sim_tick)&&e.sim_tick>=0,'bad tick');
 ensure(['HOST_WORLD','QNX_APP','QNX_KERNEL_TRACE'].includes(e.source),'bad event source');
 ensure(['OBSERVED','INFERRED'].includes(e.observed_or_inferred),'bad epistemics');
 ensure(typeof e.kind==='string'&&e.kind.length>0,'bad kind');
 return e;
}
export function verifyEventStream(events){
 ensure(Array.isArray(events)&&events.length>0,'missing events');
 const run=events[0].run_id;let prevTick=-1;
 for(let i=0;i<events.length;i++){const e=validateEvent(events[i]);ensure(e.seq===i,'sequence gap/replay');ensure(e.run_id===run,'mixed run');ensure(e.sim_tick>=prevTick,'tick regression');prevTick=e.sim_tick;}
 return true;
}
