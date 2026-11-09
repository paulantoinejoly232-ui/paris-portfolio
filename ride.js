import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import createParisWorld from './world.js';

(function rideApp() {
  const $ = (s) => document.querySelector(s);
  const mobile = matchMedia('(pointer:coarse)').matches;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  let scene, renderer, camera, composer, world, cockpit;
  let started = false, blocked = false, sound = false, audioCtx = null, wind = null, gain = null;
  let yaw = .18, pitch = -.02, dragging = false, lastX = 0, lastY = 0, nearby = -1, currentExhibit = -1;
  const keys = new Set(), seen = new Set();
  const state = { speed: 0, distance: 0, t: 0 };
  const exhibits = [
    { name: 'Making AI useful.', org: 'Microsoft · Product Strategy', category: 'PRODUCT STRATEGY', text: 'I led a five-person team researching how educators use and adopt Copilot. We combined interviews with quantitative evidence to understand product adoption barriers, identify opportunities and propose improvements. The work connected user feedback to product recommendations and a forward-looking roadmap.', facts: ['100+ educator interviews', '2,000+ data points', 'Product roadmap & proposals'], symbol: '✳', color: '#c7ad83' },
    { name: 'Making complexity simpler.', org: 'Société Générale · Market Risk', category: 'OPERATIONS & AUTOMATION', text: 'During my Paris internship in market risk, I mapped operational workflows and built automation using Python and Power Automate. The goal was to make complex processes easier to manage and reduce manual follow-ups across teams.', facts: ['28 processes mapped', '~90% less manual follow-up', 'Python & Power Automate'], symbol: '◇', color: '#8ba9a4' },
    { name: 'The future of work.', org: 'Rostra · AI Strategy', category: 'AI RESEARCH', text: 'At an AI strategy consulting firm, I helped analyze how AI could change work across occupations and industries. The project brought structured quantitative research and strategic thinking together to make emerging technology easier to understand.', facts: ['800+ occupations', '120 industries', 'AI strategy research'], symbol: '◈', color: '#cbb694' },
    { name: 'Strategy is a team sport.', org: 'Bruin Strategy Network · UCLA', category: 'LEADERSHIP', text: 'As Vice President of Consulting, I help organize consulting engagements, workshops and case competitions, while developing relationships and teams. I enjoy bringing curious, ambitious people together to solve difficult problems.', facts: ['VP of Consulting', 'Case competitions', 'Student project leadership'], symbol: '✦', color: '#aba9c6' },
    { name: 'Three cities. One curiosity.', org: 'About me · Hong Kong / LA / Paris', category: 'THE PERSON', text: 'I grew up in Hong Kong, study mathematics and philosophy at UCLA, and keep finding reasons to return to Paris. My interests sit where products, culture, people and bold ideas intersect.', facts: ['Hong Kong roots', 'UCLA · Class of 2028', 'Mathematics & Philosophy'], symbol: '◎', color: '#c6a99c' },
    { name: 'Always in motion.', org: 'Beyond the desk · Interests', category: 'PERSONAL NOTES', text: 'Outside work I follow Formula 1, play tennis, run, hike and plan new routes. Years in scouting helped shape my love of exploration, practical problem-solving, teamwork and leadership.', facts: ['Formula 1 & tennis', 'Running & hiking', 'Scouting'], symbol: '✺', color: '#99ae9b' },
    { name: 'Something worth building.', org: 'What comes next · Product', category: 'THE FUTURE', text: 'I want to help build products that solve meaningful problems, eventually creating something of my own. I am especially interested in zero-to-one work, AI and experiences where technology feels genuinely useful.', facts: ['Product & strategy', 'AI & human experience', 'Zero to one'], symbol: '↗', color: '#cdac82' },
    { name: 'Say bonjour.', org: 'Contact · From anywhere', category: 'GET IN TOUCH', text: 'Thanks for taking the scenic route. If you have an interesting idea or want to talk about product, AI, strategy or building ambitious things, I would love to hear from you. Email: paulantoinejoly@g.ucla.edu.', facts: ['Open to collaboration', 'Product & strategy', 'Let’s connect'], symbol: '♥', color: '#cb9a9c' }
  ];
  function init() {
    try {
      scene = new THREE.Scene();
      scene.background = new THREE.Color('#071321');
      scene.fog = new THREE.FogExp2('#182638', .0038);
      camera = new THREE.PerspectiveCamera(mobile ? 72 : 74, innerWidth / innerHeight, .065, 940);
      camera.rotation.order = 'YXZ';
      camera.position.set(8.5, 1.75, 39);
      camera.rotation.y = yaw;
      camera.rotation.x = pitch;
      scene.add(camera);

      renderer = new THREE.WebGLRenderer({ antialias: mobile, powerPreference: 'high-performance', alpha: false });
      renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.2 : 1.65));
      renderer.setSize(innerWidth, innerHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      renderer.shadowMap.enabled = !mobile;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      $('#world').appendChild(renderer.domElement);

      const hemi = new THREE.HemisphereLight(0x90accc, 0x35271f, 1.8);
      scene.add(hemi);
      const moon = new THREE.DirectionalLight(0x94b5e6, .95);
      moon.position.set(-60, 100, 10);
      moon.castShadow = !mobile;
      moon.shadow.mapSize.set(1024, 1024);
      moon.shadow.camera.left = -65;moon.shadow.camera.right = 65;
      moon.shadow.camera.top = 55;moon.shadow.camera.bottom = -55;
      moon.shadow.normalBias = .045;
      scene.add(moon);
      const streetBounce = new THREE.DirectionalLight(0xffa966, .48);
      streetBounce.position.set(50, 30, -200);scene.add(streetBounce);

      world = createParisWorld(THREE, scene, renderer, mobile);
      cockpit = world.buildCockpit(camera);
      cockpit.visible = false;

      if (!mobile && !reduced) {
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .92, .58, .79);
        composer.addPass(bloom);
        composer.addPass(new OutputPass());
      }

      const clock = new THREE.Clock();
      function loop() {
        requestAnimationFrame(loop);
        const dt = Math.min(clock.getDelta(), .045);
        state.t += dt;
        ride(dt);
        world.animate(state.t, camera);
        if (composer) composer.render();
        else renderer.render(scene, camera);
      }
      clock.start();
      loop();
      const loader = $('#loading');
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
      setTimeout(() => loader.remove(), 750);
    } catch(error) {
      console.error('Could not launch the Paris 3D environment', error);
      $('#loading').classList.add('hidden');
      $('#error').classList.remove('hidden');
    }
  }
  function begin() {
    if (!camera || !world) return;
    started = true;blocked = false;
    $('#intro').classList.add('hidden');
    $('#intro-aside').classList.add('hidden');
    $('#riding-ui').classList.remove('hidden');
    cockpit.visible = true;
    renderer.domElement.focus?.();
  }
  function updateCamera() {
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
  }
  function ride(dt) {
    if (!camera || !world) return;
    if (started && !blocked) {
      const drive = keys.has('KeyW') || keys.has('ArrowUp');
      const brake = keys.has('KeyS') || keys.has('ArrowDown') || keys.has('Space');
      const steer = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0)
        - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
      const sprint = keys.has('ShiftLeft') || keys.has('ShiftRight');
      if (drive) state.speed = Math.min(sprint ? 12.3 : 8.3, state.speed + 4.9 * dt);
      else if (brake) state.speed = Math.max(-2.3, state.speed - 11.5 * dt);
      else state.speed *= Math.exp(-1.2 * dt);
      if (Math.abs(state.speed) < .025) state.speed = 0;
      yaw -= steer * dt * (0.39 + Math.min(Math.abs(state.speed) / 6, 1) * .42) * (state.speed < 0 ? -1 : 1);
      const m = state.speed * dt;
      camera.position.x = THREE.MathUtils.clamp(camera.position.x - Math.sin(yaw) * m, -16, 43);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z - Math.cos(yaw) * m, -720, 52);
      state.distance += Math.abs(m);
      camera.position.y = 1.76 + (drive ? Math.sin(state.t * (4 + Math.abs(state.speed) * .85)) * .022 : Math.sin(state.t * .8) * .006);
      cockpit.rotation.z = THREE.MathUtils.lerp(cockpit.rotation.z, steer * .055, .1);
      cockpit.rotation.x = THREE.MathUtils.lerp(cockpit.rotation.x, brake ? .03 : -.005, .05);
      updateCamera();
      let d = Infinity, index = -1;
      world.stands.forEach((stand) => {
        const delta = Math.hypot(camera.position.x - stand.x, camera.position.z - stand.z);
        if (delta < d) { d = delta; index = stand.index; }
      });
      nearby = d < 14 ? index : -1;
      $('#interact').classList.toggle('hidden', nearby < 0);
      if (nearby >= 0) $('#interact-text').textContent = 'EXPLORE ' + exhibits[nearby].name.toUpperCase();
      if (Math.floor(state.t * 10) % 3 === 0) {
        $('#speed').textContent = String(Math.round(Math.abs(state.speed) * 3.6)).padStart(2, '0');
        $('#distance').textContent = (state.distance / 1000).toFixed(2);
      }
    } else if (cockpit && !started) {
      camera.position.y = 1.75 + Math.sin(state.t * .5) * .007;
    }
  }
  function openExhibit(index) {
    const e = exhibits[index];if(!e) return;
    currentExhibit = index;blocked = true;seen.add(index);
    $('#story-count').textContent = String(seen.size).padStart(2, '0') + ' / 08';
    $('#exhibit-index').textContent = String(index+1).padStart(2, '0') + ' / 08';
    $('#exhibit-category').textContent = e.category;
    $('#exhibit-title').textContent = e.name;
    $('#exhibit-company').textContent = e.org;
    $('#exhibit-description').textContent = e.text;
    $('#exhibit-symbol').textContent = e.symbol;
    $('#exhibit-facts').replaceChildren();
    e.facts.forEach(f=>{const span=document.createElement('span');span.textContent=f;$('#exhibit-facts').appendChild(span);});
    $('.exhibit-art').style.setProperty('--accent', e.color);
    $('#gallery').classList.add('hidden');
    $('#exhibit').classList.remove('hidden');
    $('#interact').classList.add('hidden');
  }
  function closeExhibit() {
    $('#exhibit').classList.add('hidden');
    blocked = !$('#gallery').classList.contains('hidden');
  }
  function openGallery() {
    $('#exhibit').classList.add('hidden');
    blocked = true;$('#gallery').classList.remove('hidden');
  }
  function closeGallery() {
    $('#gallery').classList.add('hidden');blocked = !$('#exhibit').classList.contains('hidden');
  }
  function setupGallery() {
    $('#gallery-list').replaceChildren();
    exhibits.forEach((e,i)=>{
      const b=document.createElement('button');
      b.type='button';b.className='gallery-row';
      const idx=document.createElement('span');idx.className='row-index';idx.textContent=String(i+1).padStart(2,'0');
      const content=document.createElement('span');content.className='row-body';
      const title=document.createElement('strong');title.textContent=e.name;
      const sub=document.createElement('small');sub.textContent=e.org;
      content.append(title,sub);
      const arrow=document.createElement('b');arrow.textContent='↗';
      b.append(idx,content,arrow);
      b.addEventListener('click',()=>openExhibit(i));
      $('#gallery-list').appendChild(b);
    });
  }
  function toggleAudio() {
    if (!audioCtx) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      audioCtx = new Context();
      const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * .13;
      const source=audioCtx.createBufferSource();source.buffer=buffer;source.loop=true;
      const filter=audioCtx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=450;
      gain=audioCtx.createGain();gain.gain.value=0;
      source.connect(filter).connect(gain).connect(audioCtx.destination);source.start();
      wind=source;
    }
    sound=!sound;
    audioCtx.resume();
    gain.gain.setTargetAtTime(sound ? .025 : 0,audioCtx.currentTime,.3);
    $('#mute').textContent=sound?'◉ SOUND ON':'◌ SOUND OFF';
    $('#mute').setAttribute('aria-pressed',String(sound));
  }
  function bind() {
    $('#start-ride').addEventListener('click',begin);
    $('#intro-gallery').addEventListener('click',openGallery);
    $('#nav-ride').addEventListener('click',()=>{closeGallery();closeExhibit();if(!started)begin();});
    $('#nav-work').addEventListener('click',openGallery);
    $('#nav-about').addEventListener('click',()=>openExhibit(4));
    $('#brand').addEventListener('click',e=>{
      e.preventDefault();closeExhibit();closeGallery();started=false;blocked=false;
      $('#intro').classList.remove('hidden');
      $('#intro-aside').classList.remove('hidden');
      $('#riding-ui').classList.add('hidden');
      if(cockpit)cockpit.visible=false;
      if(camera){camera.position.set(8.5,1.75,39);yaw=.18;pitch=-.02;updateCamera();}
      state.speed=0;
    });
    $('#gallery-button').addEventListener('click',openGallery);
    $('#interact').addEventListener('click',()=>{if(nearby>=0)openExhibit(nearby)});
    $('#mute').addEventListener('click',toggleAudio);
    $('#error-gallery').addEventListener('click',openGallery);
    $('#next-exhibit').addEventListener('click',()=>openExhibit((currentExhibit+1)%exhibits.length));
    document.querySelectorAll('[data-close-gallery]').forEach(node=>node.addEventListener('click',closeGallery));
    document.querySelectorAll('[data-close-exhibit]').forEach(node=>node.addEventListener('click',closeExhibit));
    window.addEventListener('keydown',(e)=>{
      if(e.code==='Escape'){closeGallery();closeExhibit();keys.clear();return;}
      if(!started||blocked)return;
      if(['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();
      if(e.code==='KeyE'&&nearby>=0){openExhibit(nearby);return;}
      if(e.code==='KeyG'){openGallery();return;}
      keys.add(e.code);
    });
    window.addEventListener('keyup',(e)=>keys.delete(e.code));
    window.addEventListener('blur',()=>keys.clear());
    const worldEl=$('#world');
    worldEl.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;});
    worldEl.addEventListener('pointermove',e=>{
      if(!dragging||!started||blocked)return;
      yaw-=(e.clientX-lastX)*.0027;
      pitch=THREE.MathUtils.clamp(pitch-(e.clientY-lastY)*.0022,-.75,.65);
      lastX=e.clientX;lastY=e.clientY;
      updateCamera();
    });
    window.addEventListener('pointerup',()=>dragging=false);
    window.addEventListener('pointercancel',()=>dragging=false);
    document.querySelectorAll('.mobile-ride [data-press]').forEach(button=>{
      const code=button.dataset.press;
      button.addEventListener('pointerdown',e=>{
        e.preventDefault();keys.add(code);button.setPointerCapture(e.pointerId);
      });
      button.addEventListener('pointerup',()=>keys.delete(code));
      button.addEventListener('pointercancel',()=>keys.delete(code));
      button.addEventListener('lostpointercapture',()=>keys.delete(code));
    });
    window.addEventListener('resize',()=>{
      if(!camera||!renderer)return;
      camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
      renderer.setSize(innerWidth,innerHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.2:1.65));
      composer?.setSize(innerWidth,innerHeight);
    });
  }
  setupGallery();
  bind();
  init();
})();
