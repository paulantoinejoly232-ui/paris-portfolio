(async function citySite(){
  const $=s=>document.querySelector(s);
  const mobile=matchMedia('(pointer:coarse)').matches;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const stories=[
    {name:'Making AI useful.',company:'Microsoft',chapter:'PRODUCT STRATEGY',place:'Pont des Arts',coords:[2.33749,48.85834],symbol:'✳',accent:'#d9aa77',subtitle:'Copilot for Education · Los Angeles',lead:'Where product thinking meets real people.',detail:'Led a five-person team exploring how educators use and adopt Copilot. Synthesized user research and quantitative evidence into product opportunities, recommendations and a roadmap for improving adoption.',metrics:['100+ educator interviews','2,000+ data points','Product strategy & roadmap']},
    {name:'Making complexity simpler.',company:'Société Générale',chapter:'MARKET RISK & AUTOMATION',place:'Quai Voltaire',coords:[2.33035,48.85914],symbol:'◇',accent:'#b7c8bd',subtitle:'Risk Business Management · Paris',lead:'Automation at the intersection of risk and operations.',detail:'Mapped market risk business processes and developed automation workflows using Python and Power Automate. My work helped simplify follow-up processes, improve visibility and reduce manual work.',metrics:['28 processes mapped','~90% less manual follow-up','Python · Power Automate']},
    {name:'The future of work.',company:'Rostra',chapter:'AI RESEARCH & STRATEGY',place:'Île de la Cité',coords:[2.34885,48.85440],symbol:'◈',accent:'#d2c49e',subtitle:'AI impact research · Los Angeles',lead:'A strategy lens on the future of AI.',detail:'Worked on AI impact research across industries and occupations, combining structured analysis with strategic storytelling to understand how emerging technology could transform jobs.',metrics:['800+ occupations','120 industries','AI strategy analysis']},
    {name:'Strategy is a team sport.',company:'Bruin Strategy Network',chapter:'LEADERSHIP',place:'Jardin du Luxembourg',coords:[2.33645,48.84622],symbol:'✦',accent:'#b3b5d2',subtitle:'Vice President of Consulting · UCLA',lead:'Bringing people together to tackle hard problems.',detail:'Help lead consulting projects, workshops, firm relationships and case competitions. Working alongside curious, ambitious people is one of the most fulfilling parts of what I do.',metrics:['VP Consulting','Client projects','Student case competitions']},
    {name:'Three cities. One curiosity.',company:'About me',chapter:'THE PERSON',place:'Place des Vosges',coords:[2.36525,48.85559],symbol:'◎',accent:'#d5ae93',subtitle:'Hong Kong → Los Angeles → Paris',lead:'The places change. The curiosity stays.',detail:'I grew up in Hong Kong, study mathematics and philosophy at UCLA, and keep finding my way back to Paris. I am drawn to products, cultures, people and the opportunity to make ideas tangible.',metrics:['UCLA · Class of 2028','Math & Philosophy','French · English']},
    {name:'Always in motion.',company:'Beyond the desk',chapter:'PERSONAL NOTES',place:'Montmartre',coords:[2.34312,48.88672],symbol:'✺',accent:'#a1c1a7',subtitle:'Tennis, Formula 1, running & beyond',lead:'The things that keep me moving.',detail:'I love tennis, Formula 1, running, hiking and planning new routes. Years of scouting helped me discover how much I enjoy working alongside other people and exploring new places.',metrics:['Formula 1 & tennis','Running & hiking','Scouting']},
    {name:'Something worth building.',company:'The future',chapter:'THE NEXT CHAPTER',place:'Champ de Mars',coords:[2.29454,48.85837],symbol:'↗',accent:'#e6bf8c',subtitle:'Products and ideas worth making',lead:'Turning curiosity into something tangible.',detail:'I want to help build thoughtful products that solve real problems, and eventually start something of my own. I am excited by zero-to-one work, AI and human-centered design.',metrics:['Product development','AI & human experience','0 → 1 building']},
    {name:'Say bonjour.',company:'Contact',chapter:'GET IN TOUCH',place:'Île Saint-Louis',coords:[2.35638,48.85182],symbol:'♥',accent:'#d59a9f',subtitle:'Where should we go next?',lead:'The best conversations start somewhere.',detail:'Thanks for walking through this imagined Paris with me. If you want to discuss product, technology, strategy or an interesting project, feel free to reach out.',metrics:['Open to collaboration','Product & strategy','paulantoinejoly@g.ucla.edu']}
  ];
  let maplibregl=null;
  const bike={coord:[2.33749,48.85834],heading:-32,speed:0,distance:0,lookOffset:0,active:false,warned:false};
  let map=null, entered=false, ready=false, walking=true, nearby=-1, current=-1, lastWheel=0;
  const visited=new Set(), keys=new Set();
  const home={center:[2.3374,48.8581],zoom:13.6,pitch:68,bearing:-28};
  const bound={west:2.217,east:2.430,south:48.801,north:48.908};
  const clean=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const dist=(a,b)=>Math.hypot((a[0]-b[0])*111320*Math.cos((a[1]+b[1])*Math.PI/360),(a[1]-b[1])*111320);
  const overlay=()=>!$('#project-modal').classList.contains('hidden')||!$('#collection-layer').classList.contains('hidden');
  function setPlace(s){$('#district').textContent=s;}
  function setMode(val) {
  walking=val;
  $('#walk-toggle').classList.toggle('active',val);
  $('#walk-toggle').innerHTML=val?'RIDE MODE <span>✳</span>':'FREE CAMERA <span>↗</span>';
  $('#walk-help').classList.toggle('dim',!val);
  if(map){
    if(val){map.dragPan.disable();map.dragRotate.disable();map.scrollZoom.disable();if(bike.active)applyBikeCamera();}
    else{map.dragPan.enable();map.dragRotate.enable();map.scrollZoom.enable();}
  }
}
  function count(){
    $('#visited-count').textContent=String(visited.size).padStart(2,'0')+' / 08';
    document.querySelectorAll('[data-visit]').forEach(el=>el.classList.toggle('seen',visited.has(Number(el.dataset.visit))));
  }
  function near(){
  if(!entered||!ready||overlay()){$('#nearest-prompt').classList.add('hidden');return;}
  const c=walking?bike.coord:[map.getCenter().lng,map.getCenter().lat];
  let m=Infinity,i=-1;
  stories.forEach((s,j)=>{const d=dist(c,s.coords);if(d<m){m=d;i=j;}});
  nearby=m<180&&map.getZoom()>15.3?i:-1;
  $('#nearest-prompt').classList.toggle('hidden',nearby<0);
  if(nearby>=0)$('#nearest-text').textContent=stories[nearby].company+' · EXPLORE EXHIBIT';
}
  function display(showWelcome){
    $('#welcome').classList.toggle('hidden',!showWelcome);
    $('#exploration').classList.toggle('hidden',showWelcome);
    document.body.classList.toggle('exploring',!showWelcome);
  }
  function start(){
  if(!ready)return;
  entered=true;display(false);setMode(true);
  bike.speed=0;bike.lookOffset=0;bike.coord=[2.33749,48.85834];bike.heading=-32;
  bike.active=false;
  map.resize();
  map.once('moveend',()=>{if(!entered||!walking)return;bike.active=true;applyBikeCamera();near();});
  map.flyTo({center:bike.coord,zoom:18.0,pitch:79,bearing:bike.heading,duration:reduced?0:3200,essential:true});
  setPlace('QUAI DE SEINE · PARIS');
  $('#wayfinder-title').textContent='The midnight ride begins.';
  $('#wayfinder-description').textContent='Pedal with W. Steer with A and D. Brake with S. Paris is yours to explore.';
}
  function overview(){
  if(!ready)return;
  bike.active=false;bike.speed=0;
  entered=true;display(false);setMode(false);
  map.flyTo({center:[2.339,48.864],zoom:12.6,pitch:63,bearing:-25,duration:reduced?0:2600,essential:true});
  setPlace('PARIS · CITY OVERVIEW');
  $('#wayfinder-title').textContent='Paris, all lit up.';
  $('#wayfinder-description').textContent='Explore from above or choose any landmark. Ride Mode returns you to your bike.';
  $('#bicycle-cockpit').style.opacity='0';
}
  function fly(i){
  if(!ready)return;
  const s=stories[i];if(!s)return;
  if(!entered){entered=true;display(false);}
  bike.active=false;bike.speed=0;bike.coord=[...s.coords];bike.heading=[-30,22,-18,38,-28,32,-45,35][i];
  setMode(true);
  map.once('moveend',()=>{if(!walking||!entered)return;bike.active=true;applyBikeCamera();near();});
  map.flyTo({center:s.coords,zoom:18.0,pitch:78,bearing:bike.heading,duration:reduced?0:2300,essential:true,curve:1.5});
  setPlace(s.place.toUpperCase()+' · PARIS');
  $('#wayfinder-title').textContent=s.name;
  $('#wayfinder-description').textContent=s.lead;
  $('#bicycle-cockpit').style.removeProperty('opacity');
}
  function openStory(i){
    const s=stories[i];if(!s)return;
    closeCollection();current=i;visited.add(i);count();
    $('#modal-index').textContent=String(i+1).padStart(2,'0')+' / 08';
    $('#modal-category').textContent=String(i+1).padStart(2,'0')+' / '+s.chapter;
    $('#modal-title').textContent=s.name;
    $('#modal-company').textContent=s.company+' · '+s.subtitle;
    $('#modal-intro').textContent=s.lead;
    $('#modal-description').textContent=s.detail;
    $('#modal-location').textContent=s.place.toUpperCase();
    $('#modal-symbol').textContent=s.symbol;
    $('#modal-metrics').innerHTML=s.metrics.map(m=>'<span>'+clean(m)+'</span>').join('');
    $('.sheet-art').style.setProperty('--exhibit-accent',s.accent);
    $('#project-modal').classList.remove('hidden');
    document.exitPointerLock?.();
  }
  function closeStory(){current=-1;$('#project-modal').classList.add('hidden');}
  function openCollection(){closeStory();$('#collection-layer').classList.remove('hidden');}
  function closeCollection(){$('#collection-layer').classList.add('hidden');}
  function content(){
    $('#destination-scroll').innerHTML=stories.map((s,i)=>`
      <button type="button" class="destination-card" data-goto="${i}" data-visit="${i}" role="listitem">
        <span class="destination-number">${String(i+1).padStart(2,'0')} <small>✳</small></span>
        <span class="destination-copy"><strong>${clean(s.company)}</strong><small>${clean(s.place)}</small></span><span class="destination-arrow">↗</span>
      </button>`).join('');
    $('#collection-list').innerHTML=stories.map((s,i)=>`
      <button type="button" class="collection-story" data-goto="${i}" data-visit="${i}">
        <span>${String(i+1).padStart(2,'0')}</span><strong>${clean(s.name)}</strong><small>${clean(s.company)}</small><b>↗</b>
      </button>`).join('');
  }
  async function setupMap(){
    try{
      maplibregl=await import('maplibre-gl');
      map=new maplibregl.Map({
        container:'map',style:'https://styles.maptoolkit.org/street-3d.json',
        ...home,minZoom:11,maxZoom:21,maxPitch:85,renderWorldCopies:false,
        attributionControl:{compact:false},canvasContextAttributes:{antialias:!mobile}
      });
      map.keyboard.disable();
      map.dragRotate.enable();
      map.touchZoomRotate.enableRotation();
      map.on('load',async()=>{
        ready=true;$('#loading').classList.add('hidden');
        addNightAtmosphere();
        stories.forEach((s,i)=>{
          const el=document.createElement('button');
          el.type='button';el.className='story-pin';el.title=s.company+' · '+s.place;
          el.setAttribute('aria-label','Open '+s.company+' exhibit in '+s.place);
          el.innerHTML='<span class="pin-signal">✳</span><span class="pin-label">'+clean(s.company)+'</span><span class="pin-index">'+String(i+1).padStart(2,'0')+'</span>';
          el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();fly(i);openStory(i);});
          new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat(s.coords).addTo(map);
        });
        map.resize();makeNightLights();near();
        try{
          const mod=await import('https://unpkg.com/@maptoolkit/maplibre-scene3d-control@0.3.0/dist/maplibre-scene3d-control.standalone.js');
          if(mod.Scene3dControl)map.addControl(new mod.Scene3dControl());
        }catch(e){console.info('Enhanced 3D roof shapes unavailable; using base map 3D buildings.',e);}
      });
      let errors=0;
      map.on('error',e=>{console.warn('Map warning',e.error);if(!ready&&++errors>=7)showError();});
      map.on('move',()=>{
        const n=['N','NE','E','SE','S','SW','W','NW'];
        $('#compass-north').textContent=n[Math.round(((map.getBearing()%360)+360)%360/45)%8];
        near();
      });
      setTimeout(()=>{if(!ready)showError();},18000);
    }catch(e){console.error(e);showError();}
  }
  function showError(){$('#loading').classList.add('hidden');$('#map-error').classList.remove('hidden');}
  function walk(dt){
  if(!entered||!walking||!ready||overlay()||document.hidden||!bike.active)return;
  const pedal=keys.has('KeyW')||keys.has('ArrowUp');
  const brake=keys.has('KeyS')||keys.has('ArrowDown')||keys.has('Space');
  const steer=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
  const turbo=keys.has('ShiftLeft')||keys.has('ShiftRight');
  const top=turbo?13.2:8.8;
  if(pedal)bike.speed=Math.min(top,bike.speed+5.2*dt);
  else if(brake)bike.speed=Math.max(-2.3,bike.speed-11.5*dt);
  else bike.speed*=Math.exp(-1.45*dt);
  if(Math.abs(bike.speed)<.035)bike.speed=0;
  const steerResponse=.35+Math.min(1,Math.abs(bike.speed)/4.5)*.65;
  bike.heading=(bike.heading+steer*66*dt*steerResponse)%360;
  const meters=bike.speed*dt;
  if(meters){
    const next=aimAtNightPoint(bike.coord,bike.heading,meters);
    bike.coord=[
      Math.max(2.217,Math.min(2.430,next[0])),
      Math.max(48.801,Math.min(48.908,next[1]))
    ];
    bike.distance+=Math.abs(meters);
  }
  const bob=pedal?Math.sin(bike.distance*1.9)*.052:Math.sin(performance.now()*.00075)*.012;
  bike.lookOffset*=Math.exp(-1.6*dt);
  applyBikeCamera(bob);
  $('#bike-speed').textContent=String(Math.round(Math.abs(bike.speed)*3.6)).padStart(2,'0');
  $('#ride-distance').textContent=(bike.distance/1000).toFixed(1)+' KM RIDDEN';
  $('#bicycle-cockpit').style.setProperty('--bike-lean',(-steer*3.6)+'deg');
  if(bike.speed!==0)near();
}
  let lastFrame=0;
  function frame(now){const dt=Math.min((now-lastFrame)/1000||0,.05);lastFrame=now;walk(dt);requestAnimationFrame(frame);}
  function controls(){
    $('#begin').onclick=start;$('#see-collection').onclick=openCollection;
    $('#nav-paris').onclick=()=>entered?overview():start();
    $('#nav-work').onclick=openCollection;$('#nav-about').onclick=()=>openStory(4);
    $('#city-overview').onclick=overview;
    $('#walk-toggle').onclick=()=>{setMode(!walking);if(walking){bike.active=true;applyBikeCamera();}else{bike.active=false;map.easeTo({zoom:16.7,pitch:67,duration:800});}};
    $('#nearest-prompt').onclick=()=>{if(nearby>=0)openStory(nearby);};
    $('#home-link').onclick=e=>{
      e.preventDefault();closeStory();closeCollection();entered=false;bike.active=false;bike.speed=0;display(true);
      if(map){setMode(false);map.flyTo({...home,duration:reduced?0:1500,essential:true});}
    };
    $('#modal-next').onclick=()=>openStory((current+1)%stories.length);
    document.querySelectorAll('[data-close]').forEach(e=>e.onclick=closeStory);
    document.querySelectorAll('[data-close-collection]').forEach(e=>e.onclick=closeCollection);
    $('#error-collection').onclick=openCollection;
    document.addEventListener('click',e=>{
      const target=e.target.closest('[data-goto]');if(!target)return;
      const i=Number(target.dataset.goto);closeCollection();if(!entered)start();fly(i);
    });
    document.addEventListener('keydown',e=>{
      if(e.code==='Escape'){closeStory();closeCollection();keys.clear();return;}
      if(overlay()||!entered)return;
      if(['KeyW','KeyA','KeyS','KeyD','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();
      if(e.code==='KeyE'&&nearby>=0){openStory(nearby);return;}
      if(e.code==='KeyM'){overview();return;}
      keys.add(e.code);
    });
    document.addEventListener('keyup',e=>keys.delete(e.code));
    window.addEventListener('blur',()=>keys.clear());
    document.querySelectorAll('.mobile-movement [data-key]').forEach(b=>{
      const k=b.dataset.key;
      b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(k);b.setPointerCapture(e.pointerId);});
      b.addEventListener('pointerup',()=>keys.delete(k));
      b.addEventListener('pointercancel',()=>keys.delete(k));
      b.addEventListener('lostpointercapture',()=>keys.delete(k));
    });
  }
  function aimAtNightPoint(origin,bearing,meters){
  const rad=bearing*Math.PI/180;
  return [
    origin[0] + Math.sin(rad)*meters/(111320*Math.cos(origin[1]*Math.PI/180)),
    origin[1] + Math.cos(rad)*meters/111320
  ];
}
  function applyBikeCamera(bob=0){
  if(!ready||!map||!maplibregl)return;
  try{
    const camera=map.getFreeCameraOptions();
    camera.position=maplibregl.MercatorCoordinate.fromLngLat(bike.coord,4.65+bob);
    camera.lookAtPoint(aimAtNightPoint(bike.coord,bike.heading+bike.lookOffset,29));
    map.setFreeCameraOptions(camera);
  }catch(error){
    if(!bike.warned){console.warn('Bike eye-height camera unavailable; falling back to pitched map.',error);bike.warned=true;}
    map.jumpTo({center:bike.coord,zoom:18.15,pitch:80,bearing:bike.heading});
  }
}
  function addNightAtmosphere(){
  if(!map||!ready)return;
  try{
    map.setSky({
      'sky-color':'#050c1b','horizon-color':'#14273d','fog-color':'#1a3048',
      'sky-horizon-blend':.58,'horizon-fog-blend':.56,'fog-ground-blend':.4,'atmosphere-blend':1
    });
    map.setLight({anchor:'map',position:[1.5,150,65],color:'#a9bdd4',intensity:.4});
  }catch(e){console.info('Sky styling omitted on this graphics driver.',e);}
  const layers=map.getStyle()?.layers||[];
  layers.forEach(layer=>{
    const id=String(layer.id).toLowerCase(),type=layer.type;
    const water=/water|river|lake|canal|stream/.test(id);
    const park=/park|grass|forest|wood|landcover|garden|natural/.test(id);
    const road=/road|street|transport|highway|motorway|path|bridge/.test(id);
    const building=/build|structure/.test(id);
    try{
      if(type==='background')map.setPaintProperty(layer.id,'background-color','#071220');
      if(type==='fill')map.setPaintProperty(layer.id,'fill-color',water?'#09243b':park?'#10292e':road?'#283341':building?'#172535':'#162431');
      if(type==='line')map.setPaintProperty(layer.id,'line-color',road?'#7a7591':water?'#224e6e':'#3d4c65');
      if(type==='fill-extrusion'){
        map.setPaintProperty(layer.id,'fill-extrusion-color','#2c3447');
        map.setPaintProperty(layer.id,'fill-extrusion-opacity',1);
      }
      if(type==='symbol'&&layer.paint?.['text-color']!==undefined)map.setPaintProperty(layer.id,'text-color','#bac4d2');
    }catch(e){/* Keep unsupported custom layer paint unchanged. */}
  });
}
  function makeNightLights(){
  if(!map||!maplibregl)return;
  const segments=[
    [[2.3279,48.8633],[2.3423,48.8589],18],
    [[2.3275,48.8595],[2.3468,48.8535],17],
    [[2.3462,48.8588],[2.3614,48.8548],16],
    [[2.3487,48.8542],[2.3596,48.8509],12],
    [[2.3218,48.8636],[2.3327,48.8608],9]
  ];
  let i=0;
  segments.forEach(([a,b,n])=>{
    for(let j=0;j<=n;j++){
      const t=j/n,el=document.createElement('div');
      el.className='night-streetlight'+((i++%17===0)?' is-blue':'');
      el.setAttribute('aria-hidden','true');
      new maplibregl.Marker({element:el,anchor:'center'}).setLngLat([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]).addTo(map);
    }
  });
}
  content();controls();setupMap();requestAnimationFrame(frame);
})();