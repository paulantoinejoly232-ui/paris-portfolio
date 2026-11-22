import React,{useEffect,useMemo,useRef,useState} from 'react';
import * as THREE from 'three';
import {Canvas,useThree,useFrame} from '@react-three/fiber';
import {Html} from '@react-three/drei';
import './photo-tour.css';

const PHOTO='/assets/photo-apartment-reference.jpg';
const DEPTH='/assets/photo-apartment-depth.png';
const FOV=64;
const MARKERS=[
 {id:'story',u:.26,v:.72,label:'My story'},
 {id:'projects',u:.12,v:.49,label:'Projects & ideas'},
 {id:'socgen',u:.52,v:.59,label:'Société Générale'},
 {id:'microsoft',u:.75,v:.66,label:'Microsoft'},
 {id:'contact',u:.91,v:.45,label:'Get in touch'}
];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const depthMeters=d=>2+7.5*Math.pow(1-d,1.25);
function depthAt(pixels,w,h,u,v){
 const x=clamp(Math.round(u*(w-1)),0,w-1);
 const y=clamp(Math.round(v*(h-1)),0,h-1);
 return pixels[(y*w+x)*4]/255;
}
function pointAt(u,v,near,aspect){
 const d=depthMeters(near),span=Math.tan(FOV*Math.PI/360)*Math.max(1,aspect)*d*2;
 return new THREE.Vector3((u-.5)*span,(.5-v)*span,-d);
}
function depthGeometry(depth,aspect){
 const NX=255,NY=255,pts=new Float32Array((NX+1)*(NY+1)*3);
 const uv=new Float32Array((NX+1)*(NY+1)*2),dist=new Float32Array((NX+1)*(NY+1));
 for(let y=0;y<=NY;y++)for(let x=0;x<=NX;x++){
  const idx=y*(NX+1)+x,u=x/NX,v=y/NY;
  const p=pointAt(u,v,depthAt(depth.data,depth.width,depth.height,u,v),aspect);
  pts.set([p.x,p.y,p.z],3*idx);uv.set([u,1-v],2*idx);dist[idx]=-p.z;
 }
 const index=[];
 for(let y=0;y<NY;y++)for(let x=0;x<NX;x++){
  const a=y*(NX+1)+x,b=a+1,c=a+NX+1,d=c+1;
  function tri(i,j,k){
   const lo=Math.min(dist[i],dist[j],dist[k]),hi=Math.max(dist[i],dist[j],dist[k]);
   if(hi-lo<Math.max(.65,lo*.14))index.push(i,j,k);
  }
  tri(a,c,b);tri(b,c,d);
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.BufferAttribute(pts,3));
 geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 geo.setIndex(index);
 geo.computeBoundingSphere();
 return geo;
}
function Surface({photo,depth,active,onInteract}){
 const {size}=useThree(),aspect=size.width/size.height;
 const geometry=useMemo(()=>depthGeometry(depth,aspect),[depth,aspect]);
 const texture=useMemo(()=>{
  const t=new THREE.Texture(photo);t.needsUpdate=true;t.colorSpace=THREE.SRGBColorSpace;
  t.anisotropy=8;t.minFilter=THREE.LinearMipmapLinearFilter;return t;
 },[photo]);
 const anchors=useMemo(()=>MARKERS.map(m=>({...m,position:pointAt(m.u,m.v,depthAt(depth.data,depth.width,depth.height,m.u,m.v),aspect)})),[depth,aspect]);
 useEffect(()=>()=>{geometry.dispose();texture.dispose()},[geometry,texture]);
 return <>
  <mesh geometry={geometry} frustumCulled={false} renderOrder={1}>
   <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false}/>
  </mesh>
  <mesh position={[0,0,-18]} renderOrder={0}>
   <planeGeometry args={[18*Math.tan(FOV*Math.PI/360)*2*Math.max(aspect,1),18*Math.tan(FOV*Math.PI/360)*2*Math.max(aspect,1)]}/>
   <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} transparent={false} depthWrite={true}/>
  </mesh>
  {active&&anchors.map(m=><Html key={m.id} center position={m.position} zIndexRange={[20,0]} distanceFactor={3}>
   <button className="photo-depth-marker" onClick={e=>{e.stopPropagation();onInteract(m.id)}} title={m.label}>
    <span className="photo-depth-dot">+</span><span className="photo-depth-label">{m.label}</span>
   </button>
  </Html>)}
 </>;
}
function Walk({active,blocked,onInteract,held,touch,onStats}){
 const {camera,gl}=useThree();
 const yaw=useRef(0),pitch=useRef(0),goal=useRef(new THREE.Vector3(0,0,0)),near=useRef(null),tick=useRef(0);
 useEffect(()=>{
  const dom=gl.domElement;
  const move=e=>{
   if(!active||blocked)return;
   let dx=0,dy=0;
   if(document.pointerLockElement===dom&&e.type==='mousemove'){dx=e.movementX;dy=e.movementY}
   else if(e.pointerType==='touch'&&touch.current){
    dx=e.clientX-touch.current.x;dy=e.clientY-touch.current.y;
    touch.current={x:e.clientX,y:e.clientY};
   }else return;
   yaw.current=clamp(yaw.current-dx*.0014,-.30,.30);
   pitch.current=clamp(pitch.current-dy*.0014,-.18,.18);
  };
  const down=e=>{if(e.pointerType==='touch')touch.current={x:e.clientX,y:e.clientY}};
  const up=()=>touch.current=null;
  const select=e=>{if(!active||blocked||e.pointerType==='touch')return;dom.requestPointerLock?.()};
  dom.addEventListener('pointerdown',down);
  dom.addEventListener('pointermove',move);
  dom.addEventListener('pointerup',up);
  dom.addEventListener('click',select);
  document.addEventListener('mousemove',move);
  document.addEventListener('pointerup',up);
  return()=>{
   dom.removeEventListener('pointerdown',down);dom.removeEventListener('pointermove',move);
   dom.removeEventListener('pointerup',up);dom.removeEventListener('click',select);
   document.removeEventListener('mousemove',move);document.removeEventListener('pointerup',up);
  };
 },[active,blocked,touch,gl]);
 useEffect(()=>{
  const key=e=>{
   if(e.code==='KeyE'&&active&&!blocked&&near.current)onInteract(near.current);
   if(e.code==='Escape')document.exitPointerLock?.();
  };
  document.addEventListener('keydown',key);
  return()=>document.removeEventListener('keydown',key);
 },[active,blocked,onInteract]);
 useFrame((state,dt)=>{
  if(active&&!blocked){
   const k=held.current,step=Math.min(dt,.06)*.53;
   const f=Number(k.has('KeyW')||k.has('ArrowUp'))-Number(k.has('KeyS')||k.has('ArrowDown'));
   const s=Number(k.has('KeyD')||k.has('ArrowRight'))-Number(k.has('KeyA')||k.has('ArrowLeft'));
   goal.current.z=clamp(goal.current.z-f*step,-1.30,.3);
   goal.current.x=clamp(goal.current.x+s*step,-.75,.75);
  }
  camera.position.lerp(goal.current,1-Math.exp(-6*Math.min(dt,.06)));
  camera.rotation.set(pitch.current,yaw.current,0,'YXZ');
  const look=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
  let best=.23,closest=null;
  for(const m of MARKERS){
   const toward=new THREE.Vector3((m.u-.5)*2,(.5-m.v)*2,-1).normalize();
   const angle=toward.angleTo(look);
   if(angle<best){best=angle;closest=m.id}
  }
  near.current=closest;
  tick.current+=dt;
  if(tick.current>.25){tick.current=0;onStats({distance:Math.max(0,-goal.current.z),near:closest})}
  if(import.meta.env.DEV){
   window.__PHOTO_DEPTH_READY=true;
   window.__PHOTO_CAMERA={position:camera.position.toArray(),yaw:yaw.current,pitch:pitch.current};
   window.__PHOTO_TEST_MOVE=(x,z)=>{goal.current.x=clamp(x,-.75,.75);goal.current.z=clamp(z,-1.3,.3)};
  }
 });
 return null;
}
export default function PhotoTour({active,blocked=false,onInteract,onLoaded}){
 const [photo,setPhoto]=useState(null),[depth,setDepth]=useState(null),[error,setError]=useState('');
 const [stats,setStats]=useState({distance:0}),[mobile,setMobile]=useState(false);
 const keys=useRef(new Set()),touch=useRef(null),loaded=useRef(onLoaded);
 useEffect(()=>{loaded.current=onLoaded},[onLoaded]);
 useEffect(()=>{
  const mq=matchMedia('(pointer:coarse)');const fn=()=>setMobile(mq.matches);fn();
  mq.addEventListener('change',fn);return()=>mq.removeEventListener('change',fn);
 },[]);
 useEffect(()=>{
  let alive=true;
  const img=url=>new Promise((resolve,reject)=>{
   const el=new Image();el.onload=()=>resolve(el);el.onerror=()=>reject(new Error('Cannot load '+url));el.src=url;
  });
  Promise.all([img(PHOTO),img(DEPTH)]).then(([picture,depthImg])=>{
   if(!alive)return;
   const c=document.createElement('canvas');c.width=depthImg.naturalWidth;c.height=depthImg.naturalHeight;
   const context=c.getContext('2d',{willReadFrequently:true});context.drawImage(depthImg,0,0);
   setPhoto(picture);setDepth({data:context.getImageData(0,0,c.width,c.height).data,width:c.width,height:c.height});
   loaded.current?.();
  }).catch(e=>{if(alive){setError(e.message);loaded.current?.()}});
  return()=>{alive=false};
 },[]);
 useEffect(()=>{
  const down=e=>{
   if(!active||blocked)return;
   if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){
    e.preventDefault();keys.current.add(e.code);
   }
  };
  const up=e=>keys.current.delete(e.code);
  const clear=()=>keys.current.clear();
  document.addEventListener('keydown',down);document.addEventListener('keyup',up);window.addEventListener('blur',clear);
  return()=>{document.removeEventListener('keydown',down);document.removeEventListener('keyup',up);window.removeEventListener('blur',clear)};
 },[active,blocked]);
 function pad(k,e,on){
  e.preventDefault();if(on){keys.current.add(k);e.currentTarget.setPointerCapture(e.pointerId)}
  else keys.current.delete(k);
 }
 return <div className="photo-tour photo-depth-tour" aria-label="Depth-reconstructed interactive Paris apartment photograph">
  <div className="photo-depth-background" style={{backgroundImage:'url('+PHOTO+')'}}/>
  {photo&&depth?<Canvas className="photo-depth-canvas"
   dpr={[1,Math.min(devicePixelRatio,mobile?1.15:1.6)]}
   gl={{alpha:true,antialias:true,powerPreference:'high-performance'}}
   camera={{fov:FOV,near:.04,far:80,position:[0,0,0]}}
   onCreated={({gl})=>{gl.setClearColor(0x1e1611,0);gl.outputColorSpace=THREE.SRGBColorSpace;}}>
   <Surface photo={photo} depth={depth} active={active&&!blocked} onInteract={onInteract}/>
   <Walk active={active} blocked={blocked} onInteract={onInteract} held={keys} touch={touch} onStats={setStats}/>
  </Canvas>:<img src={PHOTO} alt="Photograph of Paris apartment" className="photo-depth-static"/>}
  <div className="photo-bottom-fade" aria-hidden="true"/>
  {error&&<div className="photo-failure" role="alert">Depth reconstruction not available. {error}</div>}
  {active&&!blocked&&<div className="photo-depth-hud"><span><strong>W A S D</strong> WALK INSIDE</span><span>MOUSE LOOK</span><span>E EXPLORE</span><span className="photo-hud-distance">STEP {stats.distance.toFixed(1)} m</span></div>}
  {mobile&&active&&!blocked&&<div className="photo-depth-pad">
   {[['KeyW','↑','f'],['KeyA','←','l'],['KeyS','↓','b'],['KeyD','→','r']].map(([key,txt,cls])=>
    <button key={key} className={cls} aria-label={key} onPointerDown={e=>pad(key,e,true)} onPointerUp={e=>pad(key,e,false)} onPointerCancel={e=>pad(key,e,false)}>{txt}</button>)}
  </div>}
  <div className="photo-attribution"><a href="https://majorkeys.fr/" target="_blank" rel="noopener noreferrer">Reference photo: Major Keys</a> · Single-photo 3D reconstruction</div>
 </div>;
}
