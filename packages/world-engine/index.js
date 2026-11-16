import {validateScenario,sha256,verifyEventStream,EXECUTION_CLASS} from '../contracts/index.js';
const WORLD={obstacle_x_m:2.5,robot_radius_m:0.22,max_speed_mps:1,max_brake_mps2:2};
export function runHostPreview(input,{controller='vulnerable'}={}){
 const s=validateScenario(input);
 if(s.mode!=='LOCKSTEP_WORLD')throw new Error('Host preview supports LOCKSTEP_WORLD only');
 if(!['vulnerable','guarded'].includes(controller))throw new Error('unknown controller');
 const run_id='host-'+sha256({s,controller}).slice(0,16);
 let x=0,speed=0,lastRange=null,lastFreshTick=-1,collision=false,frozenValue=null;
 const frames=[],events=[];
 const emit=(tick,kind,payload)=>events.push({schema_version:1,run_id,seq:events.length,sim_tick:tick,kind,source:'HOST_WORLD',observed_or_inferred:'OBSERVED',payload});
 const dt=s.simulation_dt_ms/1000,n=s.duration_sim_ms/s.simulation_dt_ms;
 emit(0,'RUN_STARTED',{execution_class:EXECUTION_CLASS.HOST_MODEL_TEST,controller,scenario_sha256:sha256(s)});
 for(let tick=0;tick<n;tick++){
  const actualRange=Math.max(0,WORLD.obstacle_x_m-x-WORLD.robot_radius_m);
  const freeze=s.faults.find(f=>f.kind==='RANGE_FREEZE'&&tick>=f.start_tick);
  if(!freeze){lastRange=actualRange;lastFreshTick=tick;frozenValue=null;}
  else{if(frozenValue===null)frozenValue=lastRange;lastRange=frozenValue;}
  const ageMs=(tick-lastFreshTick)*s.simulation_dt_ms;
  if(freeze&&tick===freeze.start_tick)emit(tick,'RANGE_FROZEN',{range_m:lastRange});
  const requestedSpeed=(controller==='guarded'&&ageMs>100)||lastRange<0.5?0:WORLD.max_speed_mps;
  const delta=requestedSpeed-speed;
  speed+=Math.sign(delta)*Math.min(Math.abs(delta),WORLD.max_brake_mps2*dt);
  x+=speed*dt;
  if(x+WORLD.robot_radius_m>=WORLD.obstacle_x_m&&!collision){collision=true;emit(tick,'COLLISION',{position_m:x,obstacle_x_m:WORLD.obstacle_x_m});}
  const frame={run_id,sim_tick:tick,robot_pose:{x_m:x,y_m:0,yaw_rad:0},wheel_state:{speed_mps:speed},obstacles:[{id:'fixed-obstacle',x_m:WORLD.obstacle_x_m}],observed_sensor_values:{range_m:lastRange,age_ms:ageMs,fresh:!freeze},issued_motor_commands:{requested_speed_mps:requestedSpeed},collisions:collision?['fixed-obstacle']:[],current_faults:freeze?['RANGE_FREEZE']:[]};
  frames.push(frame);emit(tick,'WORLD_FRAME',{frame_index:frames.length-1,range_age_ms:ageMs,motor_command_mps:requestedSpeed,position_m:x});
 }
 const assertion_results=s.assertions.map(a=>({kind:a.kind,passed:a.kind==='NO_COLLISION'?!collision:a.kind==='REQUIRE_COLLISION'?collision:!collision&&speed<0.01}));
 const verdict=assertion_results.every(r=>r.passed)?'PASS':'FAIL';
 emit(n,'RUN_ENDED',{verdict,assertion_results});verifyEventStream(events);
 const manifest={schema_version:1,run_id,scenario_id:s.id,scenario_sha256:sha256(s),execution_class:EXECUTION_CLASS.HOST_MODEL_TEST,controller_source_commit:null,controller_binary_sha256:null,qnx_sdp:null,qnx_target:null,host_version:'r0-local',world_model_version:s.physics_version,time_domains:{simulated_dt_ms:s.simulation_dt_ms},events_sha256:sha256(events),verdict,limits:['HOST MODEL ONLY; NO QNX EXECUTION','Simplified planar model','Not a safety certification']};
 return {manifest,assertion_results,events,frames};
}
