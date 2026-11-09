import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const $ = (s) => document.querySelector(s);
const isMobile = matchMedia('(pointer: coarse)').matches;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const exhibits = [
  {title:'Making AI Useful',org:'Microsoft · Product Strategy',category:'SELECTED WORK',subtitle:'Copilot for Education · Los Angeles',body:'Worked on understanding how educators adopt AI-powered tools and how product experiences can better support their needs. Led a five-person team across research, synthesis, and strategic recommendations.\n\nThe work connected user observations with product opportunities — a process I keep coming back to: listen carefully, find the actual problem, and build from there.',highlights:['100+ educator interviews','2,000+ data points','Product roadmap & recommendations'],symbol:'✳',color:'#9fafa8'},
  {title:'Making the Complex Simpler',org:'Société Générale · Market Risk',category:'SELECTED WORK',subtitle:'Risk Business Management · Paris',body:'Spent a summer in Paris working at the intersection of market risk, operations, and technology. Mapped business processes, built automation workflows, and helped teams make their work easier to understand and run.\n\nThere is something deeply satisfying about simplifying a system that initially looks impossible to untangle.',highlights:['Python & Power Automate','28 processes mapped','~90% less manual follow-up'],symbol:'◇',color:'#b78e7b'},
  {title:'The Future of Work',org:'Rostra · AI Strategy',category:'SELECTED WORK',subtitle:'AI impact research · Los Angeles',body:'Explored how artificial intelligence could change work across occupations and industries. Built structured research and analysis to turn a fast-moving technical question into clearer strategic implications.\n\nThe lesson: asking the right question is often more useful than having the fanciest model.',highlights:['800+ occupations','120 industries','AI strategy research'],symbol:'◈',color:'#c0a77b'},
  {title:'Strategy Is a Team Sport',org:'Bruin Strategy Network · Leadership',category:'LEADERSHIP',subtitle:'Vice President of Consulting · UCLA',body:'I love putting ambitious people together to tackle challenging problems. At Bruin Strategy Network, I have helped lead consulting projects, workshops, relationships, and case competitions.\n\nBuilding a great team feels a lot like building a product: clear purpose, lots of iteration, and genuine care for the people doing the work.',highlights:['Consulting leadership','Case competitions','Student community'],symbol:'✦',color:'#9e9bb7'},
  {title:'Curiosity, Everywhere',org:'About Me · Three cities',category:'THE PERSON',subtitle:'Hong Kong → Los Angeles → Paris',body:'I grew up in Hong Kong, now study mathematics and philosophy at UCLA, and keep finding reasons to return to Paris. I am interested in products, people, and the many ways ideas move from paper into the world.\n\nThe cities have changed. The curiosity has not.',highlights:['Hong Kong roots','UCLA · Class of 2028','French & English'],symbol:'◎',color:'#bc9b85'},
  {title:'Always in Motion',org:'Beyond the Desk · Interests',category:'PERSONAL NOTES',subtitle:'Tennis, Formula 1, running, and the outdoors',body:'Outside of work and university, you might find me following Formula 1, playing tennis, running along a new route, or planning a hike. I spent years in scouting, where I learned how much I enjoy working with people and making things happen.\n\nI am happiest when there is something new to learn and somewhere interesting to go.',highlights:['Formula 1 & tennis','Running & hiking','Scouting'],symbol:'✺',color:'#8aab9d'},
  {title:'A Founder in the Making',org:'What Comes Next · Product',category:'THE FUTURE',subtitle:'Ideas worth building',body:'I want to help make products that genuinely matter, eventually building something of my own. I am drawn to difficult problems, thoughtful design, early-stage teams, and the excitement of taking a concept from zero to one.\n\nThis little walk along the Seine is itself an experiment: what happens when a personal portfolio becomes a place worth exploring?',highlights:['Product development','AI & human experience','0 → 1 building'],symbol:'↗',color:'#d3a36d'},
  {title:'Say Bonjour',org:'The Last Art Stand · Contact',category:'GET IN TOUCH',subtitle:'Where should we go next?',body:'Thanks for taking the scenic route. If you would like to talk about product, strategy, an interesting project, or simply a good walk through Paris, I would love to hear from you.\n\nYou can find me on LinkedIn, or use my professional contact details on my résumé.',highlights:['Open to collaboration','Product & strategy','Always curious'],symbol:'♥',color:'#c78e92'}
];

const scene = new THREE.Scene();
scene.background = new THREE.Color('#c5a198');
scene.fog = new THREE.FogExp2('#c7a79a',0.0045);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.08, 600);
camera.position.set(-2.8,1.82,25);
let yaw=0, pitch=-0.025, started=false, blocked=false, near=-1, current=-1;
const renderer = new THREE.WebGLRenderer({antialias:!isMobile, powerPreference:'high-performance', alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile?1.45:1.85));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=!isMobile;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.22;
$('#scene').appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xe9f0ff,0x9c7660,2.05);scene.add(hemi);
const warm = new THREE.DirectionalLight(0xffc292,3.0);warm.position.set(-85,48,-170);warm.castShadow=!isMobile;warm.shadow.mapSize.set(isMobile?512:2048,isMobile?512:2048);warm.shadow.camera.left=-80;warm.shadow.camera.right=80;warm.shadow.camera.top=75;warm.shadow.camera.bottom=-75;warm.shadow.normalBias=0.03;scene.add(warm);
const bounce = new THREE.DirectionalLight(0x95adcd,0.7);bounce.position.set(35,40,75);scene.add(bounce);
const sunPos=new THREE.Vector3(-160,76,-300).normalize();
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{uSun:{value:sunPos}},vertexShader:`varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 vPos;uniform vec3 uSun;void main(){vec3 d=normalize(vPos);float h=clamp(d.y*.5+.5,0.,1.);vec3 low=vec3(.96,.64,.48);vec3 mid=vec3(.68,.63,.68);vec3 high=vec3(.24,.38,.57);vec3 col=mix(low,mid,smoothstep(.16,.53,h));col=mix(col,high,smoothstep(.46,.98,h));float sun=pow(max(0.,dot(d,uSun)),650.);float glow=pow(max(0.,dot(d,uSun)),7.);col+=vec3(1.0,.66,.32)*glow*.54+vec3(1.0,.8,.55)*sun*1.7;gl_FragColor=vec4(col,1.);}`});
const sky=new THREE.Mesh(new THREE.SphereGeometry(440,48,32),skyMat);scene.add(sky);
const m=(color,roughness=.83,metalness=.03,more={})=>new THREE.MeshStandardMaterial({color,roughness,metalness,...more});
const mats={stone:m('#beb3a2'),stone2:m('#aaa293'),sand:m('#c4b39b'),lime:m('#b8bba8'),roof:m('#59646b',.85),road:m('#555d5a'),walk:m('#9e998c'),wall:m('#a69a87'),wood:m('#6a5141'),dark:m('#293b3d'),green:m('#315a49',.64,.2),greenLight:m('#46715a',.68,.12),bronze:m('#a78763',.36,.65),iron:m('#273f3e',.5,.5),gold:m('#eac08b',.38,.3,{emissive:'#5c321d',emissiveIntensity:.15}),glass:m('#546f77',.15,.7,{emissive:'#e9a678',emissiveIntensity:.15}),leaf:m('#416247',.93),leaf2:m('#5b7151',.93),curb:m('#c1b7a4')};
function mesh(geom,mat,x,y,z,shadow=true){const o=new THREE.Mesh(geom,mat);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=shadow;scene.add(o);return o;}
function box(w,h,d,mat,x,y,z,shadow=true){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,shadow)}
function cylinder(r1,r2,height,mat,x,y,z,segs=10){return mesh(new THREE.CylinderGeometry(r1,r2,height,segs),mat,x,y,z)}
const rng=(seed)=>{let x=seed;return ()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}};const rand=rng(74765);
function canvasTex(draw,size=512,repeat=[1,1]){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return t}
const cobble=canvasTex((ctx,n)=>{ctx.fillStyle='#9f9b8e';ctx.fillRect(0,0,n,n);const cell=42;for(let row=0;row<n/cell+1;row++)for(let col=-1;col<n/cell+1;col++){let xx=col*cell+(row%2)*cell/2,yy=row*cell;let v=145+rand()*38;ctx.fillStyle=`rgb(${v},${v-3},${v-12})`;ctx.fillRect(xx+2,yy+2,cell-3,cell-3);ctx.fillStyle='rgba(245,234,210,.06)';ctx.fillRect(xx+4,yy+3,cell-10,2)}for(let i=0;i<2200;i++){ctx.fillStyle=rand()>.5?'#ffffff0d':'#0000000c';ctx.fillRect(rand()*n,rand()*n,2+rand()*2,1+rand()*3)}},512,[7,60]);
const walkmat=m('#ffffff',.95,0,{map:cobble});
box(24,.55,410,walkmat,-.5,-.36,-157,false);
box(12,.5,410,m('#777772'),18,-.4,-157,false);
box(2.2,.36,410,mats.curb,11.3,-.26,-157,false);
box(2.0,2.3,410,mats.wall,-14.6,.75,-157,false);
box(1.3,.3,410,mats.stone2,-14.6,2.05,-157,false);
box(2,.8,410,mats.wall,-17.25,-1.5,-157,false);
box(155,1.4,510,m('#5d898d',.15,.28),-95,-1.7,-160,false);
const riverShader=new THREE.ShaderMaterial({transparent:false,uniforms:{uTime:{value:0},uSun:{value:new THREE.Vector3(-.6,.25,-1).normalize()}},vertexShader:`uniform float uTime; varying vec3 vPos;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*.19+uTime*.5)*.05+cos(p.y*.31-uTime*.65)*.07;vPos=(modelMatrix*vec4(p,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vPos,1.);}`,fragmentShader:`uniform float uTime;uniform vec3 uSun;varying vec3 vPos;varying vec2 vUv;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=vPos.xz;float a=sin(uv.y*2.9+uv.x*.29+uTime*1.3);float b=sin(uv.y*6.4-uv.x*.54-uTime*1.9);float c=cos(uv.y*12.2+uv.x*.15+uTime*2.7);float r=a*.5+b*.32+c*.18;float sunset=clamp(1.-abs(uv.x+55.)/93.,0.,1.);float shimmer=pow(max(0.,.5+.5*r),14.)*sunset;vec3 deep=vec3(.12,.27,.33);vec3 high=vec3(.39,.50,.51);vec3 col=mix(deep,high,.48+.30*r);col+=vec3(1.1,.59,.28)*shimmer*.85;col+=vec3(.65,.34,.22)*sunset*.08;gl_FragColor=vec4(col,1.);}`});
const water=new THREE.Mesh(new THREE.PlaneGeometry(160,515,150,220),riverShader);water.rotation.x=-Math.PI/2;water.position.set(-95,-.93,-158);scene.add(water);
// stone banks, carved railing posts, Paris street lamps
for(let z=34;z>-340;z-=4.5){box(.28,.95,.3,mats.stone2,-13.5,2.46,z);box(.15,.14,4.65,mats.dark,-13.5,2.87,z-2.2);box(.14,.14,4.65,mats.dark,-13.5,2.48,z-2.2)}
for(let z=40;z>-335;z-=24){box(.12,6,.12,mats.iron,-11.1,3.1,z);box(.45,.26,.52,mats.iron,-11.1,6.12,z);const light=cylinder(.26,.18,.63,m('#ffdfac',.15,.05,{emissive:'#ffc888',emissiveIntensity:1.6}),-11.1,6.52,z,8);box(.42,.12,.42,mats.iron,-11.1,6.92,z);if(z>-90){const glow=new THREE.PointLight('#ffcb8a',1.5,12,2);glow.position.set(-11,6.4,z);scene.add(glow)}}
function building(x,z,idx){let h=20+rand()*9,d=16+rand()*8;let base=m(['#c9b6a4','#d9c5aa','#bca995','#c6bcae','#d4c3a8'][idx%5],.96);let facade=box(13.5,h,d,base,x,h/2-0.2,z);box(14.2,.7,d+.75,mats.stone,x,h-.35,z);const roof=mesh(new THREE.ConeGeometry(Math.max(10,d*.65),5.8,4),mats.roof,x,h+2.6,z);roof.rotation.y=Math.PI/4;roof.scale.z=d/16;box(13.6,.32,d+.35,mats.stone2,x,4.5,z);box(13.6,.25,d+.3,mats.stone2,x,9.6,z);box(13.6,.24,d+.3,mats.stone2,x,14.6,z);for(let floor=0;floor<4;floor++){for(let win=-Math.floor(d/3.5)/2;win<=Math.floor(d/3.5)/2;win++){let wy=6.25+floor*4.25,wz=z+win*3.45;if(Math.abs(wz-z)>d/2-1.15)continue;box(.12,2.55,1.7,mats.stone2,x-6.85,wy,wz);box(.18,2.29,1.37,mats.glass,x-6.97,wy,wz);box(.18,.15,1.6,mats.stone2,x-7.1,wy-1.3,wz);if(floor===1||floor===2){box(.85,.14,1.8,mats.stone2,x-7.36,wy-1.35,wz);box(.08,.08,1.82,mats.iron,x-7.73,wy-.55,wz)}}}box(.3,3.7,3.8,m('#655f53'),x-7.0,1.9,z);box(.34,2.7,2.2,m('#45514d'),x-7.18,1.7,z);
}
for(let i=0;i<18;i++)building(25,-1-i*22,i);
// Trees on the sidewalk with asymmetrical foliage, exposed branches, iron grates.
function tree(x,z,t){const h=4+rand()*1.5;const bark=mats.wood;cylinder(.19,.27,h,bark,x,h/2,z);for(let k=0;k<7;k++){const ang=k*2.399+rand()*.4;const v=1.0+rand()*.7;const foliage=mesh(new THREE.IcosahedronGeometry(v,1),k%3?mats.leaf:mats.leaf2,x+Math.cos(ang)*1.45,h+.6+rand()*2.4,z+Math.sin(ang)*1.3);foliage.rotation.set(rand()*2,rand()*2,rand());foliage.castShadow=!isMobile}}
for(let i=0;i<27;i++)tree(8.0,-8-i*13.0,i);
// Monumental stone bridge crossing the river at z=-135.
function bridge(z){box(96,1.7,10,mats.stone,-55,2.5,z);for(let i=0;i<8;i++){let x=-101+i*13.2;box(2,10,9.7,mats.stone2,x,-1.8,z);const arch=mesh(new THREE.TorusGeometry(5.4,.65,8,20,Math.PI),mats.stone2,x,-2.25,z+5.1);arch.rotation.z=Math.PI;arch.rotation.y=Math.PI/2;}box(96,.5,.6,mats.stone2,-55,3.9,z-5);box(96,.5,.6,mats.stone2,-55,3.9,z+5);for(let x=-100;x<-9;x+=5){box(.75,1.2,.55,mats.wall,x,4.5,z-4.7);box(.75,1.2,.55,mats.wall,x,4.5,z+4.7)}}bridge(-138);
// Distant Eiffel silhouette with open lattice platforms and tapered steel legs.
function beam(a,b,r,material){const len=a.distanceTo(b);const item=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,7),material);item.position.copy(a).add(b).multiplyScalar(.5);item.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());item.castShadow=true;scene.add(item);return item}
const towerMat=m('#554943',.48,.34);const T=new THREE.Vector3(-75,0,-290);const local=(x,y,z)=>T.clone().add(new THREE.Vector3(x,y,z));
for(let dx of [-1,1])for(let dz of [-1,1]){beam(local(dx*13,1,dz*12),local(dx*6,28,dz*5.5),.58,towerMat);beam(local(dx*6,28,dz*5.5),local(dx*1.8,58,dz*1.8),.38,towerMat);for(let y=6;y<52;y+=7){let scale=13-(y/58)*11;const off=dx*scale;beam(local(off,Math.max(1,y-3),dz*(scale*.9)),local(dx*(scale-.8),y+4,dz*((scale-.9)*.9)),.16,towerMat)}}
for(let y of [20,31,57])box(y===20?25:y===31?14:4,1.2,y===20?22:y===31?11:4,towerMat,T.x,y,T.z);beam(local(0,59,0),local(0,71,0),.18,towerMat);
// Distant boats and stone staircases.
for(let i=0;i<5;i++){let z=-34-i*74;box(8,.6,2.3,m('#d7c7b2'),-39,-.35,z);box(3,1.1,2,mats.dark,-39,.65,z);box(.13,7,.13,mats.bronze,-40,3.7,z)}
for(let z=-47;z>-290;z-=64){for(let i=0;i<9;i++)box(3.3,.18,2.1,mats.stone2,-16.0-i*.7,1.78-i*.28,z-3.0)}
// Art stands: green Seine bouquiniste boxes with individually framed original text-based works.
const stands=[];
function artTexture(item,index){const c=document.createElement('canvas');c.width=512;c.height=610;const x=c.getContext('2d');const grad=x.createLinearGradient(0,0,512,610);grad.addColorStop(0,item.color);grad.addColorStop(1,'#253e47');x.fillStyle=grad;x.fillRect(0,0,512,610);x.fillStyle='#e2d4b9';x.globalAlpha=.12;for(let k=0;k<18;k++){x.beginPath();x.arc(100+rand()*320,80+rand()*460,20+rand()*95,0,Math.PI*2);x.fill()}x.globalAlpha=1;x.strokeStyle='#f9e9d5';x.lineWidth=3;for(let r of [70,115,170]){x.beginPath();x.ellipse(260,285,r,r*.9,Math.PI/6,0,Math.PI*2);x.stroke()}x.textAlign='center';x.fillStyle='#fff5e8';x.font='130px Georgia';x.fillText(item.symbol,256,340);x.font='bold 18px sans-serif';x.fillText('A WALK THROUGH PARIS',256,58);x.font='bold 27px sans-serif';x.fillText(item.title.toUpperCase().slice(0,22),256,517);x.font='14px sans-serif';x.fillText(item.org.toUpperCase().slice(0,35),256,556);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;return tex;}
function stand(z,i){const x=-10;const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
function b(w,h,d,mat,px,py,pz){const n=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);n.position.set(px,py,pz);n.castShadow=true;n.receiveShadow=true;g.add(n);return n}
b(2.4,1.3,4.2,mats.green,0,2.0,0);b(2.8,.16,4.4,mats.greenLight,0,2.7,0);
const lid=b(.17,2.4,4.4,mats.greenLight,.6,3.95,0);lid.rotation.z=-.48;
b(.15,1.5,3.9,mats.wood,.85,1.28,0);b(.95,.22,4.2,mats.wood,.8,2.15,0);
for(let k=0;k<4;k++)b(.7,.7,.08,mats.stone,.98,1.95,-1.5+k);
const artMat=new THREE.MeshStandardMaterial({map:artTexture(exhibits[i],i),roughness:.7,metalness:0,side:THREE.DoubleSide});
const paint=new THREE.Mesh(new THREE.PlaneGeometry(1.68,2.02),artMat);paint.position.set(1.18,2.5,0);paint.rotation.y=Math.PI/2;g.add(paint);
b(.2,2.24,1.91,mats.bronze,1.12,2.5,0);const art2=new THREE.Mesh(new THREE.PlaneGeometry(1.62,1.98),artMat);art2.rotation.y=Math.PI/2;art2.position.set(1.25,2.5,0);g.add(art2);
b(.17,.2,2.04,mats.gold,1.3,3.56,0);b(.17,.2,2.04,mats.gold,1.3,1.48,0);
const signTex=canvasTex((ctx,n)=>{ctx.fillStyle='#f0e8d9';ctx.fillRect(0,0,n,n);ctx.textAlign='center';ctx.fillStyle='#283b3c';ctx.font='bold 66px Georgia';ctx.fillText(String(i+1).padStart(2,'0'),256,270);ctx.font='bold 18px sans-serif';ctx.fillText('LA COLLECTION',256,340)},512);
const sign=new THREE.Mesh(new THREE.PlaneGeometry(.67,.67),new THREE.MeshBasicMaterial({map:signTex}));sign.rotation.y=Math.PI/2;sign.position.set(1.47,1.0,-1.36);g.add(sign);
for(let k=0;k<3;k++){const book=b(.56,.06,.75,m(['#a48860','#b47462','#849e91'][k]),1.15,1.4+k*.13,1.4-k*.4);book.rotation.y=(rand()-.5)*.2}
stands.push({x:x+1.2,z,item:exhibits[i],index:i,group:g});}
for(let i=0;i<exhibits.length;i++)stand(-19-i*37.5,i);
// Pigeons, terrace tables, hanging branches — restrained close-range detail.
for(let k=0;k<34;k++){let z=-6-rand()*325,x=rand()*18-10;if(x<-8)continue;const bird=mesh(new THREE.SphereGeometry(.13,5,5),m(['#737773','#858c8e','#686f6e'][k%3]),x,.08,z,false);bird.scale.set(1.3,.6,1.4)}
for(let z=-21;z>-310;z-=48){let x=11.0;cylinder(.68,.68,.12,mats.wood,x,1.55,z,12);cylinder(.08,.09,1.52,mats.iron,x,.8,z);for(let offset of [-1.35,1.35]){box(.85,.1,.72,mats.wood,x,.76,z+offset);box(.1,.75,.10,mats.iron,x,.38,z+offset)}}
const clock=new THREE.Clock();const keys=new Set();const forward=new THREE.Vector3();const right=new THREE.Vector3();const move=new THREE.Vector3();let mouseDown=false,lastX=0,lastY=0;
function updateCamera(){camera.rotation.order='YXZ';camera.rotation.y=yaw;camera.rotation.x=pitch;}
updateCamera();
function start(){started=true;$('#intro').classList.add('hidden');$('#hud').classList.remove('hidden');$('#instructions').classList.remove('hidden');$('#crosshair').classList.remove('hidden');$('#menu-btn').classList.remove('hidden');$('#walk-hint').classList.remove('hidden');if(isMobile){$('#mobile-controls').classList.remove('hidden');$('#instructions').classList.add('hidden')}setTimeout(()=>$('#walk-hint').classList.add('hidden'),9000);$('#scene').focus?.()}
function pointerLock(){if(started&&!blocked&&!isMobile&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock?.()}
$('#begin').addEventListener('click',()=>{start();if(!isMobile)pointerLock()});
renderer.domElement.addEventListener('click',pointerLock);
document.addEventListener('pointerlockchange',()=>{mouseDown=false});
document.addEventListener('mousemove',e=>{if(!started||blocked)return;if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0022;pitch=Math.max(-1.15,Math.min(.95,pitch-e.movementY*.00175));updateCamera()}else if(mouseDown){yaw-=(e.clientX-lastX)*.004;pitch=Math.max(-.9,Math.min(.85,pitch-(e.clientY-lastY)*.003));updateCamera();lastX=e.clientX;lastY=e.clientY}});
renderer.domElement.addEventListener('pointerdown',e=>{mouseDown=true;lastX=e.clientX;lastY=e.clientY});window.addEventListener('pointerup',()=>mouseDown=false);
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.code);if(e.code==='KeyE'&&started&&!blocked&&near>=0)openExhibit(near);if(e.code==='Escape'&&blocked)closeEverything();if(e.code==='KeyG')openGallery()});window.addEventListener('keyup',e=>keys.delete(e.code));
function hold(id,code){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(code);el.setPointerCapture(e.pointerId)});el.addEventListener('pointerup',()=>keys.delete(code));el.addEventListener('pointercancel',()=>keys.delete(code));}
hold('#forward','KeyW');hold('#backward','KeyS');hold('#left','TurnLeft');hold('#right','TurnRight');
$('#open-nearby').addEventListener('click',()=>near>=0&&openExhibit(near));
function showModal(){blocked=true;document.exitPointerLock?.();$('#modal-layer').classList.remove('hidden');$('#proximity').classList.add('hidden')}
function openExhibit(i){if(i<0)return;current=i;let d=exhibits[i];$('#story-title').textContent=d.title;$('#story-kicker').textContent=`EXHIBIT ${String(i+1).padStart(2,'0')} · ${d.category}`;$('#story-subtitle').textContent=d.org+' — '+d.subtitle;$('#story-body').textContent=d.body;$('#story-highlights').innerHTML=d.highlights.map(t=>`<span>${t.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</span>`).join('');$('#visual-number').textContent=String(i+1).padStart(2,'0');$('#visual-symbol').textContent=d.symbol;$('#modal-visual').style.background=`linear-gradient(150deg,${d.color},#a68872)`;showModal()}
function openGallery(){blocked=true;document.exitPointerLock?.();$('#gallery-layer').classList.remove('hidden');}
function closeEverything(){blocked=false;$('#modal-layer').classList.add('hidden');$('#gallery-layer').classList.add('hidden');if(started&&!isMobile)$('#walk-hint').classList.remove('hidden')}
$('#close-modal').onclick=closeEverything;$('#modal-backdrop').onclick=closeEverything;$('#next-exhibit').onclick=()=>openExhibit((current+1)%exhibits.length);
$('#close-gallery').onclick=closeEverything;$('#gallery-backdrop').onclick=closeEverything;$('#menu-btn').onclick=openGallery;$('#nav-work').onclick=openGallery;$('#nav-explore').onclick=()=>{closeEverything();if(!started)start()};$('#nav-about').onclick=()=>openExhibit(4);$('#nav-contact').onclick=()=>openExhibit(7);
$('#gallery-list').innerHTML=exhibits.map((d,i)=>`<button class="gallery-row" data-i="${i}"><span class="number">${String(i+1).padStart(2,'0')}</span><span><span class="title">${d.title}</span><small>${d.org}</small></span></button>`).join('');
$('#gallery-list').addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(b){$('#gallery-layer').classList.add('hidden');openExhibit(Number(b.dataset.i))}});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,isMobile?1.45:1.85))});
const vCam=new THREE.Vector3();
function animate(){requestAnimationFrame(animate);let dt=Math.min(clock.getDelta(),.05);let t=clock.elapsedTime;riverShader.uniforms.uTime.value=t;sky.position.copy(camera.position);if(started&&!blocked){if(keys.has('TurnLeft'))yaw+=dt*1.45;if(keys.has('TurnRight'))yaw-=dt*1.45;if(keys.has('ArrowLeft'))yaw+=dt*1.25;if(keys.has('ArrowRight'))yaw-=dt*1.25;updateCamera();let vz=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0);let vx=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);forward.set(-Math.sin(yaw),0,-Math.cos(yaw));right.set(Math.cos(yaw),0,-Math.sin(yaw));move.copy(forward).multiplyScalar(vz).addScaledVector(right,vx);if(move.lengthSq()>0){move.normalize().multiplyScalar(dt*(keys.has('ShiftLeft')?9:5.5));camera.position.add(move)}camera.position.x=THREE.MathUtils.clamp(camera.position.x,-11.4,10.45);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-316,34);camera.position.y=1.78+(move.lengthSq()>.0001?Math.sin(t*10)*.028:Math.sin(t*.9)*.008);let best=Infinity,close=-1;for(const stand of stands){let dist=Math.hypot(camera.position.x-stand.x,camera.position.z-stand.z);if(dist<best){best=dist;close=stand.index}}near=best<7.1?close:-1;$('#proximity').classList.toggle('hidden',near<0);if(near>=0)$('#proximity-text').textContent='View exhibit '+String(near+1).padStart(2,'0')+' · '+exhibits[near].title;const progress=THREE.MathUtils.clamp((25-camera.position.z)/320,0,1);$('#progress-bar').style.width=(progress*100).toFixed(1)+'%';$('#progress-value').textContent=Math.round(progress*100)+'%';$('#compass-direction').textContent=['N','E','S','W'][Math.round(((yaw%(Math.PI*2))+Math.PI*4)/(Math.PI/2))%4];}
renderer.render(scene,camera)}
animate();
$('#poster').classList.add('hide');setTimeout(()=>$('#poster').remove(),1300);$('#loading').style.opacity='0';setTimeout(()=>$('#loading').remove(),550);
