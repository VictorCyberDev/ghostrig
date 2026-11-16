import React,{useEffect,useMemo,useRef,useState} from 'react';
import{createRoot}from'react-dom/client';
import{Canvas,useThree}from'@react-three/fiber';
import{OrbitControls,ContactShadows,Text}from'@react-three/drei';
import './style.css';
const PALETTE={steel:'#505C66',ivory:'#E7EAEB',amber:'#E9A23B',graphite:'#272D32',red:'#DA524B',green:'#2D9C74'};
function Rail({x,z,levels=3}){
 return <group position={[x,0,z]}>{[-2.25,2.25].map(dx=><mesh key={dx} position={[dx,1.9,0]} castShadow><boxGeometry args={[.12,3.8,.15]}/><meshStandardMaterial color="#56636d" metalness={.83} roughness={.38}/></mesh>)}
 {[.65,1.85,3.05].slice(0,levels).map((y,i)=><group key={i}><mesh position={[0,y,0]} castShadow receiveShadow><boxGeometry args={[4.75,.13,1.15]}/><meshStandardMaterial color="#7e878c" metalness={.8} roughness={.42}/></mesh>{[-1.45,0,1.45].map((p,j)=><group key={j} position={[p,y+.36,0]}><mesh castShadow><boxGeometry args={[1.2,.58,.82]}/><meshStandardMaterial color={j===1?'#b48a5b':'#a27f55'} roughness={.83}/></mesh><mesh position={[0,.31,0]}><boxGeometry args={[1.18,.02,.8]}/><meshStandardMaterial color="#806647"/></mesh></group>)}</group>)}
 </group>
}
function Warehouse(){
 const racks=[[0,-5.4],[6,-5.4],[0,5.4],[6,5.4]];
 return <group><mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,-.02,0]}><planeGeometry args={[80,80]}/><meshStandardMaterial color="#c7c6be" roughness={.89}/></mesh>
 <mesh position={[1,5.7,-8]} receiveShadow><boxGeometry args={[30,.3,.3]}/><meshStandardMaterial color="#737b7d" metalness={.6}/></mesh>
 {[-6.5,7.5].map(z=><mesh key={z} position={[2,.012,z]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[22,.13]}/><meshBasicMaterial color="#e4c389"/></mesh>)}
 {[-6,-3,0,3,6].map((x,i)=><mesh key={i} position={[x,.015,-1.75]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[1.15,.08]}/><meshBasicMaterial color="#efdfbd"/></mesh>)}
 {racks.map(([x,z],i)=><Rail key={i} x={x} z={z}/>)}
 {[-9,11].map((x,i)=><group key={i} position={[x,0,-7.5]}><mesh position={[0,2.5,0]} castShadow><boxGeometry args={[.48,5,.48]}/><meshStandardMaterial color="#8c9290" metalness={.65}/></mesh><mesh position={[0,4.8,0]}><boxGeometry args={[3,.18,.7]}/><meshStandardMaterial color="#a2a7a2"/></mesh></group>)}
 {[[-5,-3.6],[-5,3.6],[10,-3.6],[10,3.6]].map(([x,z],i)=><mesh key={i} position={[x,.43,z]} castShadow><cylinderGeometry args={[.16,.19,.86,16]}/><meshStandardMaterial color="#e2ac52" metalness={.35} roughness={.45}/></mesh>)}
 <mesh position={[2.5,.85,0]} castShadow><boxGeometry args={[.46,1.7,.92]}/><meshStandardMaterial color="#c18b57" roughness={.84}/></mesh>
 <mesh position={[2.5,1.73,0]}><boxGeometry args={[.5,.09,.96]}/><meshStandardMaterial color="#56595a" metalness={.7}/></mesh>
 
 </group>
}
function Robot({frame,selected,onSelect}){
 const x=frame?.robot_pose?.x_m??0;const crashed=frame?.collisions?.length>0;const wheels=[[-.3,-.46],[-.3,.46],[.3,-.46],[.3,.46]];
 return <group position={[x,.0,0]} onClick={e=>{e.stopPropagation();onSelect('robot')}}>
 <mesh position={[0,.35,0]} castShadow><boxGeometry args={[.82,.48,.96]}/><meshStandardMaterial color={PALETTE.ivory} metalness={.4} roughness={.31}/></mesh>
 <mesh position={[0,.64,0]} castShadow><boxGeometry args={[.56,.14,.63]}/><meshStandardMaterial color="#c6ccd0" metalness={.62} roughness={.28}/></mesh>
 <mesh position={[.29,.42,0]} castShadow><boxGeometry args={[.28,.23,.48]}/><meshStandardMaterial color={PALETTE.graphite} metalness={.62}/></mesh>
 {wheels.map(([dx,dz],i)=><mesh key={i} position={[dx,.18,dz]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.18,.18,.12,24]}/><meshStandardMaterial color="#252a2b" roughness={.86}/></mesh>)}
 <mesh position={[.02,.91,0]} castShadow><cylinderGeometry args={[.24,.21,.3,24]}/><meshStandardMaterial color={PALETTE.steel} metalness={.85} roughness={.23}/></mesh>
 <mesh position={[.05,1.11,0]} castShadow><sphereGeometry args={[.115,24,16]}/><meshStandardMaterial color="#1c343d" metalness={.65} roughness={.19}/></mesh>
 <mesh position={[.42,.44,0]}><boxGeometry args={[.05,.12,.28]}/><meshStandardMaterial emissive={crashed?PALETTE.red:PALETTE.amber} emissiveIntensity={.8} color={crashed?PALETTE.red:PALETTE.amber}/></mesh>
 {selected==='robot'&&<mesh position={[0,.5,0]}><boxGeometry args={[1.1,.9,1.23]}/><meshBasicMaterial color={crashed?PALETTE.red:PALETTE.amber} wireframe transparent opacity={.65}/></mesh>}
 </group>
}
function CameraPreset({preset}){
 const {camera}=useThree();
 useEffect(()=>{const coords=preset==='top'?[2,18,.01]:preset==='follow'?[-3,3,3.5]:[6,7,3.2];camera.position.set(...coords);camera.lookAt(1,.4,0);camera.updateProjectionMatrix()},[preset,camera]);
 return null;
}
function LabScene({frame,selected,setSelected,preset}){
 return <Canvas shadows dpr={[1,1.75]} camera={{position:[6,7,3.2],fov:48,near:.1,far:150}} onPointerMissed={()=>setSelected(null)}>
 <color attach="background" args={['#e5e7e3']}/><fog attach="fog" args={['#e5e7e3',18,70]}/>
 <ambientLight intensity={1.6}/><hemisphereLight intensity={1.25} color="#f7f4e8" groundColor="#89877d"/>
 <directionalLight position={[6,13,5]} castShadow intensity={3.0} shadow-mapSize={[2048,2048]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18}/>
 <CameraPreset preset={preset}/><Warehouse/><Robot frame={frame} selected={selected} onSelect={setSelected}/>
 <ContactShadows opacity={.23} position={[0,.01,0]} scale={24} blur={2.6} far={4}/>
 <OrbitControls enableDamping dampingFactor={.08} target={[1,.4,0]} maxPolarAngle={Math.PI*.49} minDistance={3} maxDistance={35}/>
 </Canvas>
}
function App(){
 const [runs,setRuns]=useState({}),[selectedRun,setSelectedRun]=useState('vulnerable'),[index,setIndex]=useState(0),[playing,setPlaying]=useState(false),[preset,setPreset]=useState('cinematic'),[selected,setSelected]=useState(null),[reduced,setReduced]=useState(false),[fallback,setFallback]=useState(false);
 useEffect(()=>{let mounted=true;Promise.all(['vulnerable','guarded'].map(c=>fetch('/replays/'+c+'.json').then(r=>{if(!r.ok)throw Error('Missing replay');return r.json()}).then(data=>[c,data]))).then(entries=>{if(mounted)setRuns(Object.fromEntries(entries))}).catch(e=>{if(mounted)setRuns({error:e.message})});return()=>{mounted=false}},[]);
 useEffect(()=>{const mq=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(mq.matches);update();mq.addEventListener('change',update);return()=>mq.removeEventListener('change',update)},[]);
 const run=runs[selectedRun];const frames=run?.frames||[];const current=frames[Math.min(index,frames.length-1)];const event=useMemo(()=>run?.events?.filter(e=>e.sim_tick<=index&&e.kind!=='WORLD_FRAME').slice(-1)[0], [run,index]);
 useEffect(()=>{setIndex(0);setPlaying(false)},[selectedRun]);
 useEffect(()=>{if(!playing||reduced||frames.length===0)return;const t=setInterval(()=>setIndex(n=>n+1>=frames.length?0:n+1),50);return()=>clearInterval(t)},[playing,reduced,frames.length]);
 const collision=Boolean(current?.collisions?.length);const passed=run?.manifest?.verdict==='PASS';
 const nextIncident=()=>{const i=frames.findIndex(f=>f.collisions?.length);setIndex(i<0?Math.max(0,frames.length-1):i);setPlaying(false);setSelected('robot')};
 return <div className="app"><header className="topbar"><div className="brand"><div className="brand-icon">G<span>↗</span></div><div><strong>GHOSTRIG</strong><small>PHYSICAL FAILURE INTELLIGENCE</small></div></div><div className="topnav"><span className="active">LABORATORY</span><span>STUDIO / R0</span><span>WAREHOUSE BAY 01</span></div><div className="status"><i/> HOST MODEL TEST <span>· NOT QNX</span></div></header>
 <main className="layout"><aside className="sidebar"><div className="eyebrow">EXPERIMENT 001 / 024 PLANNED</div><h1>When a sensor lies,<br/><em>physics doesn't.</em></h1><p className="intro">Watch an autonomous warehouse robot respond to a frozen range sensor. The 3D view is driven by recorded host simulation frames.</p>
 <div className="separator"/><div className="sectionlabel">CONTROLLER MODEL</div><div className="option-group"><button className={selectedRun==='vulnerable'?'picked':''} onClick={()=>setSelectedRun('vulnerable')}><span className="dot red"/> Vulnerable logic <small>baseline</small></button><button className={selectedRun==='guarded'?'picked':''} onClick={()=>setSelectedRun('guarded')}><span className="dot green"/> Guarded logic <small>corrected</small></button></div>
 <div className="separator"/><div className="sectionlabel">EXPERIMENT INPUT</div><dl className="facts"><div><dt>Scenario</dt><dd>AGV-01</dd></div><div><dt>Fault injection</dt><dd>Range freeze</dd></div><div><dt>Start tick</dt><dd>15 / 0.75s</dd></div><div><dt>Simulation step</dt><dd>50ms</dd></div><div><dt>Evidence</dt><dd>Host only</dd></div></dl>
 <div className="footer-note"><b>TRUTH BOUNDARY</b><p>This preview uses modeled JavaScript controllers. It does not execute QNX, capture kernel traces, or certify safety.</p></div></aside>
 <section className="workspace"><div className="viewer"><div className="viewer-head"><div><span className="eyebrow">SIMULATION / WAREHOUSE BAY 01</span><h2>Autonomous navigation lab</h2></div><div className="camera"><button className={preset==='cinematic'?'on':''} onClick={()=>setPreset('cinematic')}>Orbit</button><button className={preset==='follow'?'on':''} onClick={()=>setPreset('follow')}>Chase</button><button className={preset==='top'?'on':''} onClick={()=>setPreset('top')}>Top</button></div></div>
 <div className="viewport">{fallback||runs.error?<div className="accessible-view"><h3>2D accessible experiment view</h3><p>Robot position: {current?.robot_pose?.x_m?.toFixed(2)??'—'} meters</p><p>Obstacle: 2.50 meters</p><p>Speed: {current?.wheel_state?.speed_mps?.toFixed(2)??'—'} m/s</p><p>Sensor age: {current?.observed_sensor_values?.age_ms??'—'} ms</p><p>Collision: {collision?'Yes':'No'}</p>{runs.error&&<p role="alert">Replay unavailable: {runs.error}</p>}</div>:<LabScene frame={current} selected={selected} setSelected={setSelected} preset={preset}/>}
 <div className="viewport-label">HOST MODEL REPLAY <span>• 3D / EXPERIMENT STATE</span></div><div className="viewport-bottom"><span>SIM TIME {((index*50)/1000).toFixed(2)}s</span><span>REPRODUCIBLE SEED: 42</span></div></div>
 <div className="transport"><button onClick={()=>setFallback(v=>!v)}>{fallback?'3D view':'2D text view'}</button><button onClick={()=>setIndex(Math.max(0,index-1))} aria-label="Previous simulation step">◀</button><button className="play" onClick={()=>{if(reduced){setIndex(i=>(i+1)%Math.max(1,frames.length))}else setPlaying(v=>!v)}}>{playing?'Pause':'Play'}</button><button onClick={()=>setIndex(Math.min(frames.length-1,index+1))} aria-label="Next simulation step">▶</button><input aria-label="Simulation timeline" type="range" min="0" max={Math.max(0,frames.length-1)} step="1" value={index} onChange={e=>{setIndex(Number(e.target.value));setPlaying(false)}}/><button onClick={nextIncident}>Inspect outcome</button></div>
 <div className="bottompanels"><div><div className="sectionlabel">LATEST NON-FRAME EVENT</div><strong>{event?.kind?.replaceAll('_',' ')||'Awaiting replay'}</strong><p>{event?.kind==='COLLISION'?'World contact assertion triggered. Select the robot to highlight the affected system.':'Events are recorded in the host experiment log; no native QNX trace is available.'}</p></div><div><div className="sectionlabel">DETERMINISTIC ASSERTION</div><strong className={passed?'good':'bad'}>{run?(passed?'PASS — NO COLLISION':'FAIL — COLLISION'):'LOADING'}</strong><p>Based on the full recorded run, not the current animation frame.</p></div><div><div className="sectionlabel">SENSOR OBSERVATION</div><strong>{current?.observed_sensor_values?.range_m?.toFixed(2)??'—'} m</strong><p>Sample age {current?.observed_sensor_values?.age_ms??'—'} ms · speed {current?.wheel_state?.speed_mps?.toFixed(2)??'—'} m/s</p></div></div>
 </div></section></main><footer className="pagefoot">GhostRig R1 · ENGINEERING PROTOTYPE · HOST_MODEL_TEST · NO NATIVE QNX EVIDENCE <span>Open-source engineering laboratory</span></footer></div>
}
createRoot(document.getElementById('root')).render(<App/>);
