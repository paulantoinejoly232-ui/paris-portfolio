import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RoundedBox, ContactShadows, Sky } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function makeTexture(kind){
 const c=document.createElement('canvas');c.width=c.height=1024;
 const ctx=c.getContext('2d');
 let seed=9435;
 const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 if(kind==='oak'){
  ctx.fillStyle='#96633d';ctx.fillRect(0,0,1024,1024);
  for(let y=-60;y<1150;y+=70)for(let x=-80;x<1150;x+=70){
   ctx.save();ctx.translate(x+(Math.floor(y/70)%2)*36,y);
   ctx.rotate(((Math.floor(x/70)+Math.floor(y/70))%2?1:-1)*Math.PI/4);
   ctx.fillStyle='hsl('+(27+rand()*6)+','+(32+rand()*19)+'%,'+(35+rand()*18)+'%)';
   ctx.fillRect(-23,-52,46,104);
   ctx.strokeStyle='rgba(36,20,10,.23)';ctx.lineWidth=2;ctx.strokeRect(-23,-52,46,104);
   for(let k=0;k<13;k++){ctx.strokeStyle='rgba('+(rand()>.5?'72,43,21':'244,194,138')+','+(.02+rand()*.11)+')';ctx.beginPath();ctx.moveTo(-20+rand()*40,-51);ctx.lineTo(-20+rand()*40,51);ctx.stroke();}
   ctx.restore();
  }
 } else if(kind==='marble'){
  ctx.fillStyle='#e4d7c5';ctx.fillRect(0,0,1024,1024);
  for(let i=0;i<310;i++){
   const p=i/310,x=rand()*1050,y=rand()*1100,w=rand()*50+5;
   ctx.strokeStyle='rgba('+(rand()>.5?'122,110,103':'245,237,217')+','+(.018+rand()*.09)+')';
   ctx.lineWidth=rand()*2+.2;ctx.beginPath();ctx.moveTo(x,y);
   ctx.bezierCurveTo(x+w*3,y+w*.4,x-w*2,y+w*3,x+w*2,y+w*7);ctx.stroke();
  }
 } else if(kind==='fabric'){
  ctx.fillStyle='#ac9b8d';ctx.fillRect(0,0,1024,1024);
  for(let i=0;i<210000;i++){
   const k=rand()*1024,j=rand()*1024,a=rand()*.24;
   ctx.fillStyle='rgba('+(rand()>.5?'250,233,207':'54,40,28')+','+a+')';ctx.fillRect(k,j,rand()*2+.5,rand()*3+.5);
  }
 } else if(kind==='rug'){
  ctx.fillStyle='#b9aa96';ctx.fillRect(0,0,1024,1024);
  for(let i=0;i<190000;i++){const v=rand()*255;ctx.fillStyle='rgba('+(rand()>.5?'71,57,48':'251,243,219')+','+(rand()*.17)+')';ctx.fillRect(rand()*1024,rand()*1024,1.7,2.8);}
 }else{
  ctx.fillStyle='#f2e7d5';ctx.fillRect(0,0,1024,1024);
  for(let i=0;i<23000;i++){ctx.fillStyle='rgba(91,74,55,'+(rand()*.023)+')';ctx.fillRect(rand()*1024,rand()*1024,1.5,1.5);}
 }
 const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
 tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
 tex.repeat.set(kind==='oak'?2:1,kind==='oak'?2:1);return tex;
}
function useMaterials(){
 return useMemo(()=>{
  const mat=(color,rough=.75,metal=0,extra={})=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,...extra});
  const oak=mat('#c09a72',.36,0,{map:makeTexture('oak')});
  const marble=mat('#ffffff',.25,0,{map:makeTexture('marble')});
  const fabric=mat('#ffffff',.93,0,{map:makeTexture('fabric')});
  const rug=mat('#ffffff',1,0,{map:makeTexture('rug')});
  const plaster=mat('#ffffff',.89,0,{map:makeTexture('plaster')});
  return {
   oak,marble,fabric,rug,plaster,
   wall:mat('#ecddc8',.9),
   trim:mat('#fff0de',.68),wood:mat('#4b3426',.49),
   darkWood:mat('#38281f',.44),bronze:mat('#bb8750',.26,.77),
   brass:mat('#e8c38d',.2,.75),black:mat('#292622',.3,.37),
   velvet:mat('#77706c',.93),beige:mat('#c8b8a4',.92),
   glaze:new THREE.MeshPhysicalMaterial({color:'#d6e8e8',metalness:0,roughness:.045,transmission:.82,thickness:.02,transparent:true,opacity:.38,side:THREE.DoubleSide,depthWrite:false}),
   lamp:new THREE.MeshStandardMaterial({color:'#fff1dc',emissive:'#ffc17b',emissiveIntensity:.36,roughness:.18}),
   leaves:mat('#566342',.96),flower:mat('#f6e9d9',.85),
   screen:mat('#151e22',.21,.25,{emissive:'#172e39',emissiveIntensity:.27})
  };
 },[]);
}
const C=({position=[0,0,0],size=[1,1,1],material,round=0,rotation,children,cast=true})=>round?
 <RoundedBox args={size} radius={round} smoothness={4} position={position} rotation={rotation} castShadow={cast} receiveShadow><primitive object={material} attach="material"/>{children}</RoundedBox>:
 <mesh position={position} rotation={rotation} castShadow={cast} receiveShadow><boxGeometry args={size}/><primitive object={material} attach="material"/>{children}</mesh>;
function Cylinder({position,args,material,rotation}){return <mesh position={position} rotation={rotation} castShadow receiveShadow><cylinderGeometry args={args}/><primitive object={material} attach="material"/></mesh>}
function Orb({position,radius=.1,material}){return <mesh position={position} castShadow><sphereGeometry args={[radius,20,12]}/><primitive object={material} attach="material"/></mesh>}
function Rod({a,b,r=.025,material}){
 const data=useMemo(()=>{const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),v=vb.clone().sub(va);return {position:va.add(v.clone().multiplyScalar(.5)).toArray(),quat:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize()),len:v.length()};},[a.join(),b.join()]);
 return <mesh position={data.position} quaternion={data.quat} castShadow><cylinderGeometry args={[r,r,data.len,8]}/><primitive object={material} attach="material"/></mesh>;
}
const ROD=[[0,0,0],[0,0,0]];
function Ornament({x,z,mat}){
 const top=4.30;
 return <group>
 {[0,.07,.155,.23].map((v,i)=><C key={i} position={[x,top-v,z]} size={[13.65-i*.05,.045+i*.012,.055]} material={mat}/>)}
 </group>;
}
function Architecture({m}){
 return <group>
 <C position={[0,-.15,0]} size={[14,.3,14]} material={m.oak}/>
 <C position={[0,4.48,0]} size={[14,.26,14]} material={m.plaster}/>
 <C position={[-6.98,2.2,0]} size={[.18,4.4,14]} material={m.wall}/>
 <C position={[6.98,2.2,0]} size={[.18,4.4,14]} material={m.wall}/>
 <C position={[0,2.2,7.03]} size={[14,4.4,.18]} material={m.wall}/>
 <C position={[4.7,2.2,-6.95]} size={[4.6,4.4,.18]} material={m.wall}/>
 <C position={[-2.46,.3,-6.95]} size={[9.15,.6,.18]} material={m.wall}/>
 <C position={[-2.46,4.06,-6.95]} size={[9.15,.68,.18]} material={m.wall}/>
 <C position={[6.93,.3,-4.3]} size={[.13,.6,5]} material={m.wall}/>
 <C position={[6.93,4.07,-4.3]} size={[.13,.66,5]} material={m.wall}/>
 {/* Architectural cornices on each side. */}
 {[4.15,4.26,4.36].map((y,i)=><group key={i}>
 <C position={[0,y,-6.78]} size={[13.95,.085-i*.015,.14+i*.035]} material={m.trim}/>
 <C position={[0,y,6.78]} size={[13.95,.085-i*.015,.14+i*.035]} material={m.trim}/>
 <C position={[-6.78,y,0]} size={[.14+i*.035,.085-i*.015,13.95]} material={m.trim}/>
 <C position={[6.78,y,0]} size={[.14+i*.035,.085-i*.015,13.95]} material={m.trim}/>
 </group>)}
 {/* Lower wall mouldings and shadow gaps */}
 {[-6.78,6.78].map(z=><group key={z}><C position={[0,.115,z]} size={[13.9,.23,.11]} material={m.trim}/><C position={[0,.25,z]} size={[13.9,.014,.12]} material={m.wood}/></group>)}
 {[-6.78,6.78].map(x=><group key={x}><C position={[x,.115,0]} size={[.11,.23,13.9]} material={m.trim}/><C position={[x,.25,0]} size={[.12,.014,13.9]} material={m.wood}/></group>)}
 <C position={[1.42,4.32,0]} size={[.20,.16,14]} material={m.trim}/>
 <C position={[0,4.30,-2.5]} size={[14,.16,.2]} material={m.trim}/>
 {/* Elegant tall French windows. */}
 {Array.from({length:5},(_,i)=>{
  const x=-6.94+i*1.78;
  return <group key={'w'+i}>
   <C position={[x,2.19,-6.87]} size={[.09,3.43,.16]} material={m.trim}/>
   {i<4&&<group>
    <C position={[x+.89,2.19,-6.91]} size={[1.67,3.3,.015]} material={m.glaze} cast={false}/>
    <C position={[x+.89,2.08,-6.83]} size={[1.67,.05,.12]} material={m.trim}/>
    <C position={[x+.89,3.4,-6.83]} size={[1.67,.035,.12]} material={m.trim}/>
    <C position={[x+.89,1.5,-6.75]} size={[.028,.2,.06]} material={m.brass}/>
   </group>}
  </group>
 })}
 <C position={[.20,2.19,-6.87]} size={[.085,3.43,.17]} material={m.trim}/>
 {/* Perpendicular windows on right */}
 {[-6.80,-5.27,-3.74].map((z,i)=><group key={z}>
  <C position={[6.84,2.19,z]} size={[.18,3.43,.095]} material={m.trim}/>
  {i<2&&<C position={[6.88,2.19,z+.77]} size={[.025,3.32,1.45]} material={m.glaze} cast={false}/>}
 </group>)}
 {/* Balcony rail with small decorative ironwork */}
 {Array.from({length:38},(_,i)=>{
  const x=-6.8+i*.241;
  return <group key={i}><Rod a={[x,.12,-7.55]} b={[x,.93,-7.55]} r={.012} material={m.black}/>
  <Orb position={[x,.93,-7.55]} radius={.022} material={m.brass}/></group>
 })}
 <Rod a={[-6.82,.93,-7.55]} b={[2.25,.93,-7.55]} r={.038} material={m.black}/>
 <Rod a={[-6.82,.12,-7.55]} b={[2.25,.12,-7.55]} r={.032} material={m.black}/>
 {/* Haussmann panel embellishment on far right wall */}
 {[3.4,5.2].map((z,i)=><group key={i}>
 <C position={[6.78,2.1,z]} size={[.045,2.55,1.45]} material={m.trim}/>
 <C position={[6.74,2.1,z]} size={[.012,2.39,1.31]} material={m.wall}/>
 </group>)}
 </group>;
}
function Exterior({m}){
 const [photo,setPhoto]=useState(null);
 useEffect(()=>{
 const loader=new THREE.TextureLoader();
 loader.setCrossOrigin('anonymous');
 loader.load('/assets/paris-eiffel.jpg',t=>{
  t.colorSpace=THREE.SRGBColorSpace;setPhoto(t)
 },undefined,()=>{});
 },[]);
 return <group>
 {/* The photograph is scenery only, not a fake navigable room. */}
 <mesh position={[-4,3,-38]}><planeGeometry args={[58,36]}/>{photo?<meshBasicMaterial map={photo} toneMapped={false}/>:<meshBasicMaterial color="#b8aaa1"/>}</mesh>
 {Array.from({length:18},(_,i)=>{
  const x=(i-9)*5.8,z=-18-(i%4)*8,h=2+(i*7%8);
  return <group key={i} position={[x,-12,z]}>
   <C position={[0,h/2,0]} size={[4.2,h,3.6]} material={i%2?m.beige:m.wall}/>
   <C position={[0,h+.55,0]} size={[4.7,1.1,4]} material={m.black}/>
   {[0,1,2].map(k=><C key={k} position={[(-1+k)*.85,h+1.2,.2]} size={[.4,1.3,.43]} material={m.wall}/>)}
  </group>
 })}
 </group>;
}
function Rug({m}){return <C position={[-3.48,.01,.85]} size={[6,.028,4.05]} material={m.rug} round={.012}/>}
function Sofa({m}){return <group position={[-5.5,0,2.2]} rotation={[0,.16,0]}>
 <C position={[0,.52,0]} size={[2.5,.52,1.07]} material={m.fabric} round={.19}/>
 <C position={[0,.97,.48]} size={[2.5,.83,.29]} material={m.fabric} round={.135}/>
 {[-1.14,1.14].map(x=><C key={x} position={[x,.68,0]} size={[.3,.60,1.09]} material={m.fabric} round={.12}/>)}
 {[-.71,0,.71].map((x,i)=><group key={i}><C position={[x,.85,-.04]} size={[.71,.13,.84]} material={m.beige} round={.055}/>
 <C position={[x,1.07,.37]} size={[.52,.50,.13]} material={i===0?m.velvet:m.fabric} round={.07} rotation={[.18,0,x*.05]}/></group>)}
 {[-.98,.98].map(x=>[-.37,.37].map(z=><C key={x+','+z} position={[x,.17,z]} size={[.10,.28,.11]} material={m.wood} round={.015}/>))}
 </group>}
function Armchair({m,position,rotation=0}){
 return <group position={position} rotation={[0,rotation,0]}>
 <C position={[0,.56,0]} size={[1.08,.37,1]} material={m.fabric} round={.17}/>
 <C position={[0,.87,.39]} size={[1.07,.65,.23]} material={m.fabric} round={.105}/>
 {[-.46,.46].map(x=><C key={x} position={[x,.73,0]} size={[.24,.45,.96]} material={m.fabric} round={.1}/>)}
 <C position={[0,.84,.25]} size={[.43,.40,.11]} material={m.beige} round={.06}/>
 {[-.36,.36].map(x=>[-.34,.35].map(z=><C key={x+','+z} position={[x,.18,z]} size={[.065,.29,.065]} material={m.wood}/>))}
 </group>;
}
function RoundTable({m,position,radius=.75,height=.48}){
 return <group position={position}>
 <Cylinder args={[radius*.24,radius*.30,height-.08,24]} position={[0,(height-.08)/2,0]} material={m.wood}/>
 <Cylinder args={[radius,radius,.06,56]} position={[0,height,0]} material={m.marble}/>
 </group>;
}
function Books({m}){return <group position={[-3.0,.53,-.15]}>
 {[0,.045,.09].map((y,i)=><C key={i} position={[0,y,0]} size={[.52,.036,.34]} material={[m.trim,m.wood,m.beige][i]} round={.008}/>)}
 </group>}
function Living({m,onInteract}){
 return <group>
 <Rug m={m}/><Sofa m={m}/>
 <Armchair m={m} position={[-3.30,0,-1.07]} rotation={.26}/>
 <Armchair m={m} position={[-1.72,0,-1.13]} rotation={-.16}/>
 <RoundTable m={m} position={[-3.43,0,1.4]}/>
 <C position={[-3.1,.29,-.05]} size={[1.43,.5,.89]} material={m.wood} round={.05}/>
 <C position={[-3.1,.51,-.05]} size={[1.54,.065,.98]} material={m.marble} round={.015}/>
 <Books m={m}/>
 <mesh position={[-3.0,.77,-.15]} onClick={()=>onInteract('story')}><sphereGeometry args={[.28,20,12]}/><meshBasicMaterial transparent opacity={0}/></mesh>
 <C position={[-6.25,.33,3.66]} size={[.58,.65,.58]} material={m.black} round={.25}/>
 <Orb position={[-6.25,.81,3.66]} radius={.16} material={m.brass}/>
 <pointLight color="#ffe3a5" intensity={1.4} distance={3} position={[-6.25,.95,3.66]}/>
 </group>;
}
function DiningChair({m,position,rotation=0}){
 return <group position={position} rotation={[0,rotation,0]}>
 <C position={[0,.54,0]} size={[.55,.11,.60]} material={m.velvet} round={.06}/>
 <C position={[0,.97,.25]} size={[.56,.83,.13]} material={m.velvet} round={.07}/>
 {[-.19,.19].map(x=>[-.20,.20].map(z=><C key={x+','+z} position={[x,.25,z]} size={[.042,.50,.042]} material={m.black}/>))}
 </group>;
}
function Kitchen({m,onInteract}){
 return <group>
 {/* Walnut cabinetry and built-in appliances */}
 <C position={[5.75,2.12,-5.48]} size={[2.22,4.14,1.04]} material={m.darkWood} round={.015}/>
 {[1.78,2.85].map(y=><group key={y}>
  <C position={[5.75,y,-4.95]} size={[.81,.81,.045]} material={m.black} round={.015}/>
  <C position={[5.75,y,-4.92]} size={[.69,.63,.006]} material={m.screen}/>
  <C position={[5.75,y-.29,-4.88]} size={[.55,.035,.035]} material={m.brass}/>
 </group>)}
 <C position={[5.07,.87,-1.3]} size={[3.83,1.75,.70]} material={m.darkWood}/>
 <C position={[5.07,1.8,-1.3]} size={[3.93,.08,.74]} material={m.marble}/>
 <C position={[5.09,3.29,-1.3]} size={[3.91,1.65,.64]} material={m.darkWood}/>
 <C position={[5.07,2.43,-1.62]} size={[3.87,.02,.06]} material={m.lamp}/>
 <C position={[3.63,.53,1.15]} size={[3.58,1.06,1.49]} material={m.darkWood} round={.045}/>
 <C position={[3.63,1.10,1.15]} size={[3.68,.09,1.58]} material={m.marble} round={.018}/>
 {[2.55,3.73,4.80].map(x=><C key={x} position={[x,.5,1.94]} size={[.016,.82,.025]} material={m.brass}/>)}
 {/* dark inset sink */}
 <C position={[4.47,1.15,.97]} size={[.76,.017,.54]} material={m.black} round={.015}/>
 <Rod a={[4.65,1.13,.97]} b={[4.65,1.78,.97]} r={.027} material={m.brass}/>
 <Rod a={[4.65,1.78,.97]} b={[4.40,1.78,.97]} r={.027} material={m.brass}/>
 <Rod a={[4.40,1.78,.97]} b={[4.40,1.58,.97]} r={.027} material={m.brass}/>
 {[2.88,4.13].map(x=><group key={x} position={[x,0,2.29]}>
  <Cylinder args={[.24,.24,.075,24]} position={[0,.77,0]} material={m.black}/>
  <C position={[0,1.03,.14]} size={[.49,.37,.09]} material={m.velvet} round={.07}/>
  {[-.17,.17].map(a=>[-.16,.16].map(b=><C key={a+','+b} position={[a,.36,b]} size={[.032,.69,.034]} material={m.black}/>))}
 </group>)}
 {/* dining table */}
 <Cylinder args={[.19,.24,.72,32]} material={m.wood} position={[1.24,.36,-3.6]}/>
 <Cylinder args={[1.04,1.04,.068,60]} material={m.darkWood} position={[1.24,.76,-3.60]}/>
 <DiningChair m={m} position={[.06,0,-3.6]} rotation={-1.1}/>
 <DiningChair m={m} position={[2.48,0,-3.6]} rotation={1.1}/>
 <DiningChair m={m} position={[1.28,0,-4.78]}/>
 <mesh onClick={()=>onInteract('microsoft')} position={[1.24,1.0,-3.6]}><boxGeometry args={[.85,.30,.68]}/><meshBasicMaterial transparent opacity={0}/></mesh>
 {/* realistic laptop silhouette */}
 <C position={[1.2,.80,-3.60]} size={[.50,.026,.34]} material={m.black}/>
 <C position={[1.2,1.02,-3.78]} size={[.50,.43,.025]} material={m.screen} rotation={[-.14,0,0]}/>
 <C position={[1.2,1.02,-3.76]} size={[.44,.37,.005]} material={m.black} rotation={[-.14,0,0]}/>
 <C position={[3.03,1.17,1.22]} size={[.49,.035,.35]} material={m.beige} round={.007}/>
 <mesh onClick={()=>onInteract('socgen')} position={[3.03,1.29,1.22]}><boxGeometry args={[.70,.28,.52]}/><meshBasicMaterial transparent opacity={0}/></mesh>
 </group>;
}
function Plant({m,position=[0,0,0],small=false}){
 const scale=small?.58:1;
 const twigs=useMemo(()=>Array.from({length:19},(_,i)=>{
  const a=i*2.4,rad=.12+(i%6)*.065;return {from:[0,.48,0],to:[Math.sin(a)*rad,1.23+(i%5)*.13,Math.cos(a)*rad],r:.09+(i%3)*.025}
 }),[]);
 return <group position={position} scale={scale}>
 <Cylinder position={[0,.25,0]} args={[.30,.22,.5,20]} material={m.marble}/>
 <Rod a={[0,.48,0]} b={[0,1.52,0]} r={.043} material={m.wood}/>
 {twigs.map((t,i)=><group key={i}><Rod a={t.from} b={t.to} r={.013} material={m.wood}/><Orb position={t.to} radius={t.r} material={m.leaves}/></group>)}
 </group>;
}
function Flowers({m}){return <group position={[-3.0,.53,-.32]}>
 <Cylinder position={[0,.15,0]} args={[.10,.13,.29,24]} material={m.glaze}/>
 {Array.from({length:17},(_,i)=>{
  const a=i*2.399,rad=.10+(i%4)*.038,x=Math.cos(a)*rad,z=Math.sin(a)*rad,y=.43+(i%5)*.066;
  return <group key={i}><Rod a={[0,.20,0]} b={[x,y,z]} r={.005} material={m.leaves}/>
  <Orb position={[x,y,z]} radius={.051} material={m.flower}/></group>
 })}
 </group>}
function Lamps({m}){
 return <group>
 {[0,1,2].map(i=>{
  const x=2.55+i*.45,z=.36,y=3.31-i*.43,r=.21-i*.023;
  return <group key={i}>
   <Rod a={[x,4.38,z]} b={[x,y+r,z]} r={.009} material={m.brass}/>
   <Orb position={[x,y,z]} radius={r} material={m.lamp}/>
   <pointLight position={[x,y,z]} color="#ffe0a9" intensity={2} distance={5} decay={2}/>
  </group>
 })}
 {[-5.4,-2.8,1.8,5.4].map(x=>[-4.8,0,4.8].map(z=><group key={x+','+z}>
  <Cylinder position={[x,4.36,z]} args={[.078,.078,.018,16]} material={m.trim}/>
  <pointLight position={[x,4.25,z]} color="#ffdfbd" intensity={.21} distance={3.2}/>
 </group>))}
 </group>;
}
function Props({m,onInteract}){
 return <group>
 <Plant m={m} position={[-6.38,0,-6.1]}/>
 <Plant m={m} position={[.38,0,-6.13]} small/>
 <Flowers m={m}/>
 {/* travel books and a personal journal near entrance */}
 <C position={[-6.50,.37,4.72]} size={[.47,.71,.30]} material={m.wood} round={.055}/>
 <C position={[-6.50,.74,4.72]} size={[.44,.04,.25]} material={m.brass}/>
 <mesh onClick={()=>onInteract('projects')} position={[-6.50,.63,4.72]}><boxGeometry args={[.65,1.06,.60]}/><meshBasicMaterial transparent opacity={0}/></mesh>
 <C position={[5.80,1.66,3.85]} size={[.14,.24,.035]} material={m.brass} round={.01}/>
 <mesh onClick={()=>onInteract('contact')} position={[5.85,1.65,3.85]}><boxGeometry args={[.45,.42,.35]}/><meshBasicMaterial transparent opacity={0}/></mesh>
 </group>;
}
function ModelOverride({onLoad}){
 const [model,setModel]=useState(null);
 useEffect(()=>{
 let mounted=true;
 const loader=new GLTFLoader();
 fetch('/models/apartment.glb',{method:'HEAD'}).then(response=>{
  if(!response.ok || (response.headers.get('content-type')||'').includes('html'))return;
  loader.load('/models/apartment.glb',g=>{
  if(!mounted)return;
  g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  setModel(g.scene);onLoad(true);
 },undefined,()=>{onLoad(false)});
 }).catch(()=>{});
 return()=>{mounted=false};
 },[onLoad]);
 return model?<primitive object={model} />:null;
}
export default function World({onInteract,onReady}){
 const m=useMaterials(),[customLoaded,setCustomLoaded]=useState(false);
 const ready=useMemo(()=>()=>onReady?.(),[onReady]);
 useEffect(()=>{const t=setTimeout(ready,180);return()=>clearTimeout(t)},[ready]);
 return <group>
 <color attach="background" args={['#b49c84']}/>
 <fog attach="fog" args={['#d7a584',55,180]}/>
 <Sky distance={450000} sunPosition={[-80,9,-190]} turbidity={8} rayleigh={.3} mieCoefficient={.009} mieDirectionalG={.85}/>
 <hemisphereLight args={['#ffe0c1','#544635',1.22]}/>
 <ambientLight intensity={.18} color="#ffe9d6"/>
 <directionalLight position={[-29,23,-30]} color="#ffbb7d" intensity={3.2} castShadow shadow-mapSize={[2048,2048]} shadow-normalBias={.035}
 shadow-camera-near={.5} shadow-camera-far={95} shadow-camera-left={-24} shadow-camera-right={24} shadow-camera-top={24} shadow-camera-bottom={-24}/>
 <pointLight position={[-5,2.7,-5]} color="#ffd3a5" intensity={1.0} distance={11}/>
 <pointLight position={[3.2,3,1]} color="#ffe6c5" intensity={.75} distance={9}/>
 <Exterior m={m}/>
 {/* The Blender-generated GLB supersedes code geometry once committed. */}
 {!customLoaded&&<group><Architecture m={m}/><Living m={m} onInteract={onInteract}/><Kitchen m={m} onInteract={onInteract}/><Props m={m} onInteract={onInteract}/><Lamps m={m}/></group>}
 <ModelOverride onLoad={setCustomLoaded}/>
 <ContactShadows position={[0,-.005,0]} opacity={.24} scale={16} blur={2.6} far={5} resolution={512} color="#5d3a24"/>
 </group>;
}