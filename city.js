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
  let map=null, entered=false, ready=false, walking=true, nearby=-1, current=-1, lastWheel=0;
  const visited=new Set(), keys=new Set();
  const home={center:[2.3374,48.8581],zoom:13.6,pitch:68,bearing:-28};
  const bound={west:2.217,east:2.430,south:48.801,north:48.908};
  const clean=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const dist=(a,b)=>Math.hypot((a[0]-b[0])*111320*Math.cos((a[1]+b[1])*Math.PI/360),(a[1]-b[1])*111320);
  const overlay=()=>!$('#project-modal').classList.contains('hidden')||!$('#collection-layer').classList.contains('hidden');
  function setPlace(s){$('#district').textContent=s;}
  function setMode(val){
    walking=val;$('#walk-toggle').classList.toggle('active',val);
    $('#walk-toggle').innerHTML=val?'WALK MODE <span>✳</span>':'FREE CAMERA <span>↗</span>';
    $('#walk-help').classList.toggle('dim',!val);
  }
  function count(){
    $('#visited-count').textContent=String(visited.size).padStart(2,'0')+' / 08';
    document.querySelectorAll('[data-visit]').forEach(el=>el.classList.toggle('seen',visited.has(Number(el.dataset.visit))));
  }
  function near(){
    if(!entered||!ready||overlay()){$('#nearest-prompt').classList.add('hidden');return;}
    const c=map.getCenter();let m=Infinity,i=-1;
    stories.forEach((s,j)=>{const d=dist([c.lng,c.lat],s.coords);if(d<m){m=d;i=j;}});
    nearby=m<240&&map.getZoom()>15.3?i:-1;
    $('#nearest-prompt').classList.toggle('hidden',nearby<0);
    if(nearby>=0)$('#nearest-text').textContent=stories[nearby].company+' · VIEW STORY';
  }
  function display(showWelcome){
    $('#welcome').classList.toggle('hidden',!showWelcome);
    $('#exploration').classList.toggle('hidden',showWelcome);
    document.body.classList.toggle('exploring',!showWelcome);
  }
  function start(){
    if(!ready)return;
    entered=true;display(false);setMode(true);map.resize();
    map.flyTo({center:stories[0].coords,zoom:17.45,pitch:78,bearing:-32,duration:reduced?0:3200,essential:true});
    setPlace('PONT DES ARTS · SEINE');
    near();
  }
  function overview(){
    if(!ready)return;
    entered=true;display(false);setMode(false);
    map.flyTo({center:[2.339,48.864],zoom:12.7,pitch:65,bearing:-25,duration:reduced?0:2600,essential:true});
    setPlace('PARIS · CITY OVERVIEW');
    $('#wayfinder-title').textContent='The whole city is yours.';
    $('#wayfinder-description').textContent='Drag to explore, zoom into a neighborhood, or choose a chapter along the Seine.';
  }
  function fly(i){
    if(!ready)return;
    if(!entered)start();
    const s=stories[i];if(!s)return;
    map.flyTo({center:s.coords,zoom:17.5,pitch:77,bearing:[-30,22,-18,38,-28,32,-45,35][i],duration:reduced?0:2700,essential:true,curve:1.5});
    setPlace(s.place.toUpperCase()+' · PARIS');
    $('#wayfinder-title').textContent=s.name;
    $('#wayfinder-description').textContent=s.lead;
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
      const maplibregl=await import('maplibre-gl');
      map=new maplibregl.Map({
        container:'map',style:'https://styles.maptoolkit.org/street-3d.json',
        ...home,minZoom:11,maxZoom:19.5,maxPitch:85,renderWorldCopies:false,
        attributionControl:{compact:false},canvasContextAttributes:{antialias:!mobile}
      });
      map.keyboard.disable();
      map.dragRotate.enable();
      map.touchZoomRotate.enableRotation();
      map.on('load',async()=>{
        ready=true;$('#loading').classList.add('hidden');
        stories.forEach((s,i)=>{
          const el=document.createElement('button');
          el.type='button';el.className='story-pin';el.title=s.company+' · '+s.place;
          el.setAttribute('aria-label','Open '+s.company+' exhibit in '+s.place);
          el.innerHTML='<span class="pin-signal">✳</span><span class="pin-label">'+clean(s.company)+'</span><span class="pin-index">'+String(i+1).padStart(2,'0')+'</span>';
          el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();fly(i);openStory(i);});
          new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat(s.coords).addTo(map);
        });
        map.resize();near();
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
    if(!entered||!walking||!ready||overlay()||document.hidden)return;
    let f=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0);
    let r=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);
    const t=(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0);
    const bearing=map.getBearing()+t*58*dt;
    if(t)map.setBearing(bearing);
    if(f||r){
      const len=Math.hypot(f,r);f/=len;r/=len;
      const rad=bearing*Math.PI/180;
      const north=f*Math.cos(rad)-r*Math.sin(rad);
      const east=f*Math.sin(rad)+r*Math.cos(rad);
      const meters=dt*(keys.has('ShiftLeft')?20:7.5),c=map.getCenter();
      const lng=Math.max(bound.west,Math.min(bound.east,c.lng+east*meters/(111320*Math.cos(c.lat*Math.PI/180))));
      const lat=Math.max(bound.south,Math.min(bound.north,c.lat+north*meters/111320));
      map.jumpTo({center:[lng,lat],zoom:Math.max(map.getZoom(),17.2),pitch:Math.max(map.getPitch(),72)});
    }
  }
  let lastFrame=0;
  function frame(now){const dt=Math.min((now-lastFrame)/1000||0,.05);lastFrame=now;walk(dt);requestAnimationFrame(frame);}
  function controls(){
    $('#begin').onclick=start;$('#see-collection').onclick=openCollection;
    $('#nav-paris').onclick=()=>entered?overview():start();
    $('#nav-work').onclick=openCollection;$('#nav-about').onclick=()=>openStory(4);
    $('#city-overview').onclick=overview;
    $('#walk-toggle').onclick=()=>{setMode(!walking);if(walking&&ready)map.easeTo({zoom:17.4,pitch:78,duration:1000});};
    $('#nearest-prompt').onclick=()=>{if(nearby>=0)openStory(nearby);};
    $('#home-link').onclick=e=>{
      e.preventDefault();closeStory();closeCollection();entered=false;display(true);
      if(map)map.flyTo({...home,duration:reduced?0:1500,essential:true});
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
      if(['KeyW','KeyA','KeyS','KeyD','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code))e.preventDefault();
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
  content();controls();setupMap();requestAnimationFrame(frame);
})();