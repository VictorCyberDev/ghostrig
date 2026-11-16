import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { createPrivateBridge,encodeWire } from '../packages/bridge-protocol/tcp-server.js';
import {sign} from '../packages/bridge-protocol/index.js';

const key='private-test-secret-32-characters-minimum';
const hash='a'.repeat(64),runId='bridge-integration';
const hello={protocol_version:1,run_id:runId,seq:0,kind:'HELLO',scenario_sha256:hash,controller_sha256:hash,qnx_build:'SIMULATED_GUEST_NOT_QNX',capabilities:[]};
const end={protocol_version:1,run_id:runId,seq:1,sim_tick:1,kind:'END',outcome:'ENDED'};
const make=(overrides={})=>createPrivateBridge({key,runId,scenarioHash:hash,controllerHash:hash,timeoutMs:500,...overrides});
async function connect(port){
 return await new Promise((resolve,reject)=>{const s=net.connect(port,'127.0.0.1',()=>resolve(s));s.once('error',reject)});
}
async function send(socket,frames){return await new Promise((resolve,reject)=>{
 socket.on('error',reject);socket.on('close',resolve);
 for(const [frame,mac] of frames)socket.write(encodeWire(frame,mac));
 setTimeout(()=>{socket.destroy();reject(new Error('guest socket did not close'))},1400).unref();
});}
test('loopback-only admission',()=>assert.throws(()=>make({host:'0.0.0.0'})));
test('valid authenticated TCP lifecycle',async()=>{
 const seen=[],bridge=make({onAcceptedFrame:f=>seen.push(f.kind)}); const {port}=await bridge.listen();
 try {const s=await connect(port);await send(s,[[hello,sign(key,hello)],[end,sign(key,end)]]);assert.deepEqual(seen,['HELLO','END']);assert.equal(bridge.session.state,'COMPLETE');}
 finally{await bridge.close();}
});
test('bad HMAC aborts and never passes',async()=>{
 const failures=[],bridge=make({onAbort:e=>failures.push(e.message)});const {port}=await bridge.listen();
 try {const s=await connect(port);await send(s,[[hello,'00'.repeat(32)]]);assert.equal(bridge.session.state,'ABORTED');assert.ok(failures.length>0);}
 finally{await bridge.close();}
});
test('oversized frame prefix aborts',async()=>{
 const bridge=make();const {port}=await bridge.listen();
 try {const s=await connect(port);const b=Buffer.alloc(4);b.writeUInt32BE(0xffffffff);await new Promise(resolve=>{s.on('close',resolve);s.write(b)});assert.equal(bridge.session.state,'ABORTED');}
 finally{await bridge.close();}
});
test('premature guest disconnect aborts',async()=>{
 const bridge=make();const {port}=await bridge.listen();
 try {const s=await connect(port);await new Promise(resolve=>{s.on('close',resolve);s.end(encodeWire(hello,sign(key,hello)))});assert.equal(bridge.session.state,'ABORTED');}
 finally{await bridge.close();}
});
