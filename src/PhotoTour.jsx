import React, { useEffect, useRef, useState } from 'react';
import './photo-tour.css';

// This is the actual photographic reference, not a generated mesh or CGI.
// Images require appropriate reuse rights before a permanent public launch.
const SOURCE='https://majorkeys.fr/assets/apartment-paris-3-C2GmvGUe.jpg';
const MARKERS=[
  {id:'story',x:26,y:72,label:'My story',caption:'The books and the journey'},
  {id:'projects',x:12,y:49,label:'Projects & ideas',caption:'Where curiosity leads'},
  {id:'socgen',x:52,y:59,label:'Société Générale',caption:'Experience in Paris'},
  {id:'microsoft',x:75,y:66,label:'Microsoft',caption:'Product & technology'},
  {id:'contact',x:91,y:45,label:'Get in touch',caption:'What comes next'}
];
const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
const lerp=(a,b,t)=>a+(b-a)*t;

export default function PhotoTour({active,blocked=false,onInteract,onLoaded}){
  const stage=useRef(null);
  const keys=useRef(new Set());
  const mouse=useRef({x:0,y:0});
  const pos=useRef({x:0,y:0,zoom:1.055});
  const drag=useRef(null);
  const [ready,setReady]=useState(false);
  const [selected,setSelected]=useState('');
  const [error,setError]=useState(false);

  useEffect(()=>{
    if(ready)onLoaded?.();
  },[ready,onLoaded]);

  useEffect(()=>{
    function down(e){
      if(e.repeat)return;
      if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){
        keys.current.add(e.code);
        if(active&&!blocked)e.preventDefault();
      }
    }
    const up=e=>keys.current.delete(e.code);
    const clear=()=>keys.current.clear();
    document.addEventListener('keydown',down);
    document.addEventListener('keyup',up);
    window.addEventListener('blur',clear);
    let raf=0,prev=0;
    function tick(ms){
      const dt=clamp((ms-prev)/1000,0,.06);prev=ms;
      const k=keys.current;
      const left=k.has('KeyA')||k.has('ArrowLeft');
      const right=k.has('KeyD')||k.has('ArrowRight');
      const forward=k.has('KeyW')||k.has('ArrowUp');
      const back=k.has('KeyS')||k.has('ArrowDown');
      if(active&&!blocked){
        // Only a small movement envelope is credible with a single photograph.
        // Larger motion would expose parts of the room the photograph never captured.
        const speed=dt*25;
        mouse.current.x=clamp(mouse.current.x+(Number(left)-Number(right))*speed,-1,1);
        mouse.current.y=clamp(mouse.current.y+(Number(forward)-Number(back))*speed,-1,1);
      }
      const targetX=mouse.current.x*(window.innerWidth>750?31:65);
      const targetY=mouse.current.y*(window.innerWidth>750?22:28);
      const targetZoom=1.055 + Math.max(0,mouse.current.y)*.052 + Math.max(0,-mouse.current.y)*-.035;
      const damp=1-Math.exp(-5*dt);
      pos.current.x=lerp(pos.current.x,targetX,damp);
      pos.current.y=lerp(pos.current.y,targetY,damp);
      pos.current.zoom=lerp(pos.current.zoom,targetZoom,damp);
      if(stage.current){
        stage.current.style.setProperty('--drift-x',pos.current.x.toFixed(2)+'px');
        stage.current.style.setProperty('--drift-y',pos.current.y.toFixed(2)+'px');
        stage.current.style.setProperty('--drift-scale',pos.current.zoom.toFixed(4));
      }
      raf=requestAnimationFrame(tick);
    }
    raf=requestAnimationFrame(tick);
    return()=>{
      cancelAnimationFrame(raf);document.removeEventListener('keydown',down);
      document.removeEventListener('keyup',up);window.removeEventListener('blur',clear);
    };
  },[active,blocked]);

  function pointerMove(e){
    if(!active||blocked)return;
    if(drag.current){
      const dx=e.clientX-drag.current.x,dy=e.clientY-drag.current.y;
      drag.current={x:e.clientX,y:e.clientY};
      mouse.current.x=clamp(mouse.current.x+dx/420,-1,1);
      mouse.current.y=clamp(mouse.current.y+dy/440,-1,1);
    } else if(e.pointerType==='mouse'){
      // Subtle inertial motion, not a simulated 360-degree rotation.
      mouse.current.x=clamp((e.clientX/window.innerWidth-.5)*.85,-.55,.55);
      mouse.current.y=clamp((e.clientY/window.innerHeight-.5)*.45,-.35,.35);
    }
  }

  return <div className="photo-tour" aria-label="Photographic Paris apartment experience"
    onPointerMove={pointerMove}
    onPointerDown={e=>{if(e.pointerType!=='mouse'&&!e.target.closest?.('.photo-marker'))drag.current={x:e.clientX,y:e.clientY};}}
    onPointerUp={()=>{drag.current=null}}
    onPointerCancel={()=>{drag.current=null}}>
    <div ref={stage} className="photo-stage">
      <img src={SOURCE} alt="Golden-hour Paris apartment with the Eiffel Tower outside, refined living room and kitchen"
        decoding="async" fetchPriority="high" draggable="false"
        onLoad={()=>{setReady(true);setError(false)}}
        onError={()=>{setError(true);setReady(true)}}/>
      {active&&!blocked&&MARKERS.map(m=><button
        key={m.id} type="button"
        className={'photo-marker '+(selected===m.id?'focused':'')}
        style={{left:m.x+'%',top:m.y+'%'}}
        onPointerEnter={()=>setSelected(m.id)} onPointerLeave={()=>setSelected('')}
        onFocus={()=>setSelected(m.id)} onBlur={()=>setSelected('')}
        onClick={e=>{e.stopPropagation();onInteract(m.id)}}
        aria-label={m.label}>
        <span className="marker-ring"><span className="marker-core"/></span>
        <span className="marker-label"><strong>{m.label}</strong><small>{m.caption}</small></span>
      </button>)}
    </div>
    <div className="photo-amber-glow" aria-hidden="true"/>
    <div className="photo-light-haze" aria-hidden="true"/>
    <div className="photo-bottom-fade" aria-hidden="true"/>
    {error&&<div className="photo-failure" role="status">
      The photographic reference cannot be loaded right now. Use Free Walk to explore the 3D room.
    </div>}
    {active&&!blocked&&<div className="photo-guide">
      <span className="photo-guide-k">W A S D</span>
      <span>GENTLE CAMERA MOVEMENT</span>
      <span className="photo-guide-divider">·</span>
      <span>CLICK AN OBJECT TO EXPLORE</span>
    </div>}
    <div className="photo-attribution">
      <a href="https://majorkeys.fr/" target="_blank" rel="noreferrer noopener">Reference photograph: Major Keys</a>
      <span> · Limited photographic viewpoint</span>
    </div>
  </div>;
}