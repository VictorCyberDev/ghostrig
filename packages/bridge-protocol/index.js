// Host-side bounded protocol validator. No guest socket transport is implemented yet.
import { createHmac, timingSafeEqual } from 'node:crypto';
export class BridgeProtocolError extends Error {}
const max=64*1024;
const safe=(ok,msg)=>{if(!ok)throw new BridgeProtocolError(msg);};
const integer=x=>Number.isSafeInteger(x)&&x>=0;
export const encode=msg=>{
 const payload=Buffer.from(JSON.stringify(msg));
 safe(payload.length>0&&payload.length<=max,'frame exceeds bounds');
 return payload;
};
export const sign=(key,frame)=>createHmac('sha256',key).update(encode(frame)).digest('hex');
export function verifySignature(key,frame,mac){
 safe(typeof mac==='string'&&/^[0-9a-f]{64}$/.test(mac),'invalid signature');
 const a=Buffer.from(mac,'hex'),b=Buffer.from(sign(key,frame),'hex');
 safe(timingSafeEqual(a,b),'signature mismatch');
}
export class GuestSession {
 constructor({key,runId,scenarioHash,controllerHash,timeoutMs=3000}){
   safe(typeof key==='string'&&key.length>=32,'private session key missing');
   safe(typeof runId==='string'&&runId.length>0,'runId required');
   for(const h of [scenarioHash,controllerHash])safe(typeof h==='string'&&/^[0-9a-f]{64}$/.test(h),'sha256 required');
   safe(integer(timeoutMs)&&timeoutMs>=100&&timeoutMs<=30000,'invalid timeout');
   Object.assign(this,{key,runId,scenarioHash,controllerHash,timeoutMs});
   this.state='WAIT_HANDSHAKE';this.lastSeq=-1;this.lastTick=-1;this.lastAt=null;
 }
 receive(frame,mac,nowMs){
   safe(this.state!=='ABORTED'&&this.state!=='COMPLETE','closed session');
   try {
     safe(integer(nowMs),'invalid host monotonic timestamp');
     verifySignature(this.key,frame,mac);
     safe(frame&&frame.protocol_version===1&&frame.run_id===this.runId,'protocol/run mismatch');
     safe(integer(frame.seq)&&frame.seq===this.lastSeq+1,'missing or duplicate seq');
     if(this.lastAt!==null)safe(nowMs>=this.lastAt&&nowMs-this.lastAt<=this.timeoutMs,'guest timeout/clock regression');
     if(this.state==='WAIT_HANDSHAKE') {
       safe(frame.kind==='HELLO'&&frame.seq===0,'HELLO required');
       safe(frame.scenario_sha256===this.scenarioHash&&frame.controller_sha256===this.controllerHash,'run identity mismatch');
       safe(typeof frame.qnx_build==='string'&&frame.qnx_build.length>0,'QNX build must be attested');
       safe(Array.isArray(frame.capabilities),'capabilities required');
       this.state='ACTIVE';
     } else {
       safe(integer(frame.sim_tick)&&frame.sim_tick>=this.lastTick,'sim tick regression');
       safe(['SENSOR_ACK','MOTOR_COMMAND','HEARTBEAT','END'].includes(frame.kind),'unsupported kind');
       if(frame.kind==='MOTOR_COMMAND')safe(Number.isFinite(frame.speed_mps)&&Math.abs(frame.speed_mps)<=2,'motor bound exceeded');
       this.lastTick=frame.sim_tick;
       if(frame.kind==='END')safe(frame.outcome==='INCOMPLETE'||frame.outcome==='ENDED','guest cannot assert PASS');
       if(frame.kind==='END')this.state='COMPLETE';
     }
     this.lastSeq=frame.seq;this.lastAt=nowMs;
     return {state:this.state,seq:this.lastSeq};
   }catch(err){this.state='ABORTED';throw err;}
 }
 checkTimeout(nowMs){
   if(this.state==='ACTIVE'&&this.lastAt!==null&&nowMs-this.lastAt>this.timeoutMs){this.state='ABORTED';throw new BridgeProtocolError('guest heartbeat timeout');}
   return this.state;
 }
 abort(){this.state='ABORTED';}
}
