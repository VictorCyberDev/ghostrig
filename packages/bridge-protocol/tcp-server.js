/**
 * GhostRig R1 authenticated TCP transport.
 *
 * Bound to loopback by default. Frames are 4-byte big-endian length-prefixed
 * JSON envelopes with {frame, mac}; HMAC over canonical JSON.stringify(frame).
 * QNX execution is NOT implied by using this protocol.
 */
import net from 'node:net';
import { GuestSession, BridgeProtocolError } from './index.js';

const MAX_WIRE_BYTES=65536;
const MAX_PENDING_BYTES=131072;

export function createPrivateBridge({
  key, runId, scenarioHash, controllerHash,
  port=0, host='127.0.0.1', timeoutMs=3000,
  onAcceptedFrame=()=>{}, onAbort=()=>{}
}) {
  if (!['127.0.0.1','::1'].includes(host)) throw new Error('private bridge must bind to loopback; use an authenticated private tunnel for remote QNX');
  const session=new GuestSession({key,runId,scenarioHash,controllerHash,timeoutMs});
  let active=null, completed=false;
  const server=net.createServer(socket=>{
    if (active || completed || session.state==='ABORTED') { socket.destroy();return; }
    active=socket;
    let pending=Buffer.alloc(0);
    socket.setTimeout(timeoutMs+100);
    const abort=err=>{
      if (session.state!=='ABORTED' && session.state!=='COMPLETE') session.abort();
      onAbort(err instanceof Error?err:new BridgeProtocolError(String(err)));
      socket.destroy();
    };
    socket.on('timeout',()=>abort(new BridgeProtocolError('socket inactivity timeout')));
    socket.on('error',abort);
    socket.on('close',()=>{
      if (!completed && session.state!=='ABORTED') {
        session.abort();
        onAbort(new BridgeProtocolError('guest disconnected before completed END'));
      }
    });
    socket.on('data',chunk=>{
      try {
        pending=Buffer.concat([pending,chunk]);
        if (pending.length>MAX_PENDING_BYTES) throw new BridgeProtocolError('receive buffer overflow');
        while (pending.length>=4) {
          const length=pending.readUInt32BE(0);
          if (length===0 || length>MAX_WIRE_BYTES) throw new BridgeProtocolError('invalid wire-frame length');
          if (pending.length<4+length) break;
          const raw=pending.subarray(4,4+length);
          pending=pending.subarray(4+length);
          const envelope=JSON.parse(raw.toString('utf8'));
          if (!envelope||typeof envelope!=='object') throw new BridgeProtocolError('invalid envelope');
          const nowMs=Math.round(performance.now());
          session.receive(envelope.frame,envelope.mac,nowMs);
          onAcceptedFrame(envelope.frame,session.state);
          if (session.state==='COMPLETE') {
            completed=true;
            socket.end();
            server.close();
            break;
          }
        }
      } catch(err){abort(err);}
    });
  });
  return {
    server,session,
    async listen(){
      await new Promise((resolve,reject)=>{
        server.once('error',reject);
        server.listen(port,host,()=>{server.off('error',reject);resolve();});
      });
      return server.address();
    },
    async close(){
      if(active&&!active.destroyed)active.destroy();
      if(server.listening)await new Promise(resolve=>server.close(resolve));
    }
  };
}
export function encodeWire(frame,mac) {
  const json=Buffer.from(JSON.stringify({frame,mac}));
  if(json.length===0||json.length>MAX_WIRE_BYTES)throw new BridgeProtocolError('oversized wire envelope');
  const buf=Buffer.allocUnsafe(4+json.length);
  buf.writeUInt32BE(json.length,0);json.copy(buf,4);
  return buf;
}
