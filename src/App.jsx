import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import World from './World.jsx';

const CONTENT={
 story:{index:'01 — ORIGINS',title:'Across cultures, across disciplines.',text:'French by nationality and raised in Hong Kong, I now study Mathematics at UCLA. I am interested in the intersection of analytical reasoning, products and people—and in the decisions that shape what gets built.',tags:['Hong Kong','UCLA','Mathematics','French']},
 microsoft:{index:'02 — PRODUCT & STRATEGY',title:'Understanding how people learn.',text:'I lead a product-strategy engagement with Microsoft exploring how educators and students adopt Copilot. User research and product thinking help us turn feedback into practical recommendations for better learning experiences.',tags:['Microsoft','Product strategy','AI','User interviews']},
 socgen:{index:'03 — FINANCIAL SYSTEMS',title:'Where systems meet decisions.',text:'At Société Générale in Paris, I worked in market risk, mapping processes and building automations to reduce repetitive work. The experience shaped how I approach operational challenges in complex organizations.',tags:['Société Générale','Risk management','Paris','Automation']},
 projects:{index:'04 — WHAT I BUILD',title:'Curiosity becomes tangible.',text:'I enjoy building and testing new ideas—from go-to-market systems and strategy engagements to interactive digital experiences. This apartment is itself an experiment in making a portfolio something people can explore rather than simply read.',tags:['Strategy','Product','Startups','Experimentation']},
 contact:{index:'05 — THE NEXT CHAPTER',title:'Come say hello.',text:'Whether you are building something ambitious, thinking through a hard problem, or just want to connect, I would love to hear from you.',tags:['Los Angeles','Hong Kong','Paris'],cta:{name:'Email me',href:'mailto:paulantoinejoly232@gmail.com'}}
};
const LANDMARKS=[
 {id:'story',label:'The books · My story',xyz:[-3.0,.9,-.1]},
 {id:'microsoft',label:'The laptop · Microsoft',xyz:[1.25,1,-3.6]},
 {id:'socgen',label:'The folder · Société Générale',xyz:[3.03,1.2,1.22]},
 {id:'projects',label:'The suitcase · Projects',xyz:[-6.5,.7,4.72]},
 {id:'contact',label:'The door · Contact',xyz:[5.83,1.65,3.85]}
];
const blocks=[
 [-6.90,-4.35,1.1,3.15],
 [-4.10,-2.30,-1.70,-.50],
 [-2.30,-.98,-1.70,-.51],
 [-4.12,-2.40,-.75,.70],
 [-4.23,-2.22,.65,2.0],
 [-.35,2.8,-4.99,-2.65],
 [1.60,5.60,.24,2.14],
 [4.25,6.90,-6.75,-4.60],
 [3.02,6.90,-2.08,-.45]
];
function blocked(x,z){
 if(x < -6.57||x > 6.57||z < -6.57||z > 6.57)return true;
 return blocks.some(([a,b,c,d])=>x>a-.21&&x<b+.21&&z>c-.21&&z<d+.21);
}
function Controls({active,blockedByPanel,held,onNearby,mobile}){
 const {camera,gl}=useThree();
 const yaw=useRef(-.20),pitch=useRef(-.08),prev=useRef(null),lastNearby=useRef('');
 useEffect(()=>{
  camera.rotation.order='YXZ';
  camera.position.set(0,1.71,5.1);
  const move=e=>{
   if(!active||blockedByPanel)return;
   let dx=0,dy=0;
   if(document.pointerLockElement===gl.domElement){dx=e.movementX;dy=e.movementY}
   else if(prev.current){dx=e.clientX-prev.current[0];dy=e.clientY-prev.current[1];prev.current=[e.clientX,e.clientY]}
   else return;
   yaw.current-=dx*.00225;
   pitch.current=THREE.MathUtils.clamp(pitch.current-dy*.0021,-1.18,1.18);
  };
  const down=e=>{if(e.pointerType==='touch'||mobile){prev.current=[e.clientX,e.clientY]}};
  const up=()=>{prev.current=null};
  const touchMove=e=>{if(e.pointerType==='touch')move(e)};
  const canvas=gl.domElement;
  document.addEventListener('mousemove',move);
  canvas.addEventListener('pointermove',touchMove);
  canvas.addEventListener('pointerdown',down);
  document.addEventListener('pointerup',up);
  document.addEventListener('pointercancel',up);
  return()=>{document.removeEventListener('mousemove',move);canvas.removeEventListener('pointermove',touchMove);canvas.removeEventListener('pointerdown',down);document.removeEventListener('pointerup',up);document.removeEventListener('pointercancel',up)};
 },[active,blockedByPanel,camera,gl,mobile]);
 useFrame((state,dt)=>{
  camera.rotation.set(pitch.current,yaw.current,0,'YXZ');
  camera.position.y=1.71;
  if(active&&!blockedByPanel){
   const h=held.current;
   let forward=Number(h.has('KeyW')||h.has('ArrowUp'))-Number(h.has('KeyS')||h.has('ArrowDown'));
   let strafe=Number(h.has('KeyD')||h.has('ArrowRight'))-Number(h.has('KeyA')||h.has('ArrowLeft'));
   if(forward||strafe){
    const n=Math.hypot(forward,strafe);forward/=n;strafe/=n;
    const speed=h.has('ShiftLeft')?4.1:2.25,t=Math.min(dt,.07)*speed;
    const dx=(-Math.sin(yaw.current)*forward+Math.cos(yaw.current)*strafe)*t;
    const dz=(-Math.cos(yaw.current)*forward-Math.sin(yaw.current)*strafe)*t;
    if(!blocked(camera.position.x+dx,camera.position.z))camera.position.x+=dx;
    if(!blocked(camera.position.x,camera.position.z+dz))camera.position.z+=dz;
   }
  }
  let found='',best=2.85;
  for(const marker of LANDMARKS){
   const [x,y,z]=marker.xyz;
   const d=Math.hypot(camera.position.x-x,camera.position.z-z);
   if(d<best){best=d;found=marker.id}
  }
  if(found!==lastNearby.current){lastNearby.current=found;onNearby(found)}
 });
 return null;
}
function Scene({active,blockedByPanel,held,onNearby,onOpen,onReady,mobile}){
 const initialized=useRef(false);
 const onceReady=useCallback(()=>{if(!initialized.current){initialized.current=true;onReady()}},[onReady]);
 return <Canvas id="canvas" aria-label="Walk around a 3D Parisian apartment"
   shadows gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} dpr={[1,Math.min(devicePixelRatio,mobile?1.25:1.8)]}
   camera={{fov:66,near:.05,far:650,position:[0,1.71,5.1]}}
   onCreated={({gl})=>{gl.outputColorSpace=THREE.SRGBColorSpace;gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.16}}>
   <World onInteract={onOpen} onReady={onceReady}/>
   <Controls active={active} blockedByPanel={blockedByPanel} held={held} onNearby={onNearby} mobile={mobile}/>
 </Canvas>;
}
export default function App(){
 const [active,setActive]=useState(false),[loaded,setLoaded]=useState(false),[page,setPage]=useState(null),[near,setNear]=useState(''),[siteMode,setSiteMode]=useState(false);
 const [mobile,setMobile]=useState(false);
 const held=useRef(new Set());
 const canvas=()=>document.querySelector('#canvas canvas')||document.querySelector('#canvas');
 useEffect(()=>{
  const q=matchMedia('(pointer:coarse)');
  const update=()=>setMobile(q.matches);update();
  q.addEventListener('change',update);return()=>q.removeEventListener('change',update);
 },[]);
 const open=useCallback(id=>{if(!CONTENT[id])return;document.exitPointerLock?.();setPage(id)},[]);
 const close=()=>setPage(null);
 const enter=()=>{setActive(true);if(!mobile)canvas()?.requestPointerLock?.()};
 useEffect(()=>{
  const keydown=e=>{
   if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)||/^Key[WASDE]$/.test(e.code))e.preventDefault();
   held.current.add(e.code);
   if(e.code==='Escape'){setPage(null);return}
   if(e.code==='KeyE'&&near&&active&&!page)open(near);
  };
  const keyup=e=>held.current.delete(e.code);
  const blur=()=>held.current.clear();
  document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);window.addEventListener('blur',blur);
  return()=>{document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur)};
 },[near,active,page,open]);
 useEffect(()=>{
  if(!active||mobile||page||siteMode)return;
  const el=canvas();if(!el)return;
  const request=()=>{if(document.pointerLockElement!==el)el.requestPointerLock?.()};
  el.addEventListener('click',request);
  return()=>el.removeEventListener('click',request);
 },[active,mobile,page,siteMode]);
 const tapMove=(code,e,pressed)=>{
  e.preventDefault();if(pressed){held.current.add(code);e.currentTarget.setPointerCapture(e.pointerId)}
  else held.current.delete(code);
 };
 const p=page?CONTENT[page]:null;
 const nearby=LANDMARKS.find(l=>l.id===near);
 return <div className="app">
   <main className="view">
    {!siteMode&&<Scene active={active} blockedByPanel={!!page} held={held} onNearby={setNear} onOpen={open} onReady={()=>setLoaded(true)} mobile={mobile}/>}
    <div className="cinematic-shade" aria-hidden="true"/>
   </main>
   <header className="header">
    <button className="identity" onClick={()=>{close();setSiteMode(false)}}>Paul-Antoine Joly<small>An interactive portrait</small></button>
    <nav aria-label="Portfolio navigation">
     <button onClick={()=>open('story')}>About</button>
     <button onClick={()=>open('microsoft')}>Experience</button>
     <button onClick={()=>open('projects')}>Projects</button>
     <button onClick={()=>open('contact')}>Contact</button>
    </nav>
   </header>
   {!siteMode&&<div className="locator">PARIS, FRANCE <span className="dot"/> GOLDEN HOUR</div>}
   {!loaded&&!siteMode&&<div className="loader"><div className="loader-monogram">PJ</div><p>PREPARING THE APARTMENT</p></div>}
   {!active&&!siteMode&&<section className="welcome" aria-label="Enter the apartment">
    <div className="welcome-shade"/>
    <div className="welcome-content"><span className="eyebrow">AN INVITATION · PARIS</span>
     <h1>Step inside<br/><em>my world.</em></h1>
     <p>A different kind of portfolio. Explore a Parisian apartment and discover the places, people, and ideas behind my story.</p>
     <button className="enter" disabled={!loaded} onClick={enter}>{loaded?'ENTER THE APARTMENT':'LOADING THE SPACE'} <span>↗</span></button>
     <span className="intro-tip">W A S D TO EXPLORE · CLICK TO LOOK</span>
    </div>
   </section>}
   {active&&!siteMode&&!page&&<div className="hint">
    <span className="keycap">W</span><span className="keycap">A</span><span className="keycap">S</span><span className="keycap">D</span><span className="hint-words">MOVE</span>
    <span className="separator">/</span> MOUSE TO LOOK <span className="separator">/</span> <span className="keycap">E</span> INTERACT
   </div>}
   {active&&!siteMode&&!page&&nearby&&<button className="nearby" onClick={()=>open(nearby.id)}><span className="nearby-plus">+</span>{nearby.label} <span className="nearby-action">PRESS E</span></button>}
   {mobile&&active&&!siteMode&&!page&&<div className="mobile-pad">
    {[['ArrowUp','↑','forward'],['ArrowLeft','←','left'],['ArrowDown','↓','back'],['ArrowRight','→','right']].map(([code,sym,cls])=>
      <button key={code} className={cls} aria-label={cls} onPointerDown={e=>tapMove(code,e,true)} onPointerUp={e=>tapMove(code,e,false)} onPointerCancel={e=>tapMove(code,e,false)}>{sym}</button>)}
   </div>}
   <button className="toggle-site" onClick={()=>{document.exitPointerLock?.();close();setSiteMode(v=>!v)}}>{siteMode?'← BACK TO THE APARTMENT':'SKIP TO THE SITE ↗'}</button>
   {siteMode&&<div className="editorial">
     <div className="editorial-intro"><span>PAUL-ANTOINE JOLY / PORTFOLIO</span><h2>Curiosity, strategy,<br/><em>and building.</em></h2><p>A French student raised in Hong Kong, currently studying Mathematics at UCLA. Drawn to product, strategy, and problems worth solving.</p></div>
     <div className="editorial-sections">{Object.entries(CONTENT).map(([id,c])=><button key={id} className="editorial-link" onClick={()=>open(id)}><span>{c.index}</span><strong>{c.title}</strong><b>↗</b></button>)}</div>
    </div>}
   {p&&<div className="panel-backdrop" onClick={close}><aside className="panel" role="dialog" aria-modal="true" aria-label={p.title} onClick={e=>e.stopPropagation()}>
    <button aria-label="Close" className="panel-close" onClick={close}>×</button>
    <span className="panel-section">{p.index}</span>
    <h2>{p.title}</h2><div className="panel-rule"/><p>{p.text}</p>
    <div className="tags">{p.tags.map(tag=><span key={tag}>{tag}</span>)}</div>
    {p.cta&&<a href={p.cta.href} className="panel-cta">{p.cta.name} ↗</a>}
    <span className="panel-foot">THE APARTMENT · PAUL-ANTOINE JOLY</span>
   </aside></div>}
  </div>;
}