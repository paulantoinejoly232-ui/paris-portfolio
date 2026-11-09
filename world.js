export default function createParisWorld(THREE, scene, renderer, mobile) {
  const objects = new THREE.Group();
  scene.add(objects);
  const rng = (seed) => {
    let s = seed >>> 0;
    return () => ((s = Math.imul(s, 1664525) + 1013904223 >>> 0) / 4294967296);
  };
  const rnd = rng(28848);
  const PI = Math.PI;
  const material = (color, roughness = .8, metalness = .02, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  const stone = material('#bcb6ae', .91);
  const ivory = material('#d0c3ad', .96);
  const darkStone = material('#655c59', .91);
  const stone2 = material('#a19d98', .93);
  const roofM = material('#303a46', .91);
  const brass = material('#b08a63', .34, .65);
  const iron = material('#1d292c', .45, .52);
  const glass = material('#1c3142', .18, .32);
  const warmGlow = new THREE.MeshBasicMaterial({ color: '#ffca7c' });
  const green = material('#1b5245', .59, .16);
  const green2 = material('#285e4a', .63, .1);
  const amber = material('#f9d3a2', .2, .1, { emissive: '#ffae54', emissiveIntensity: 1.8 });
  const leaves = [material('#1c3536'), material('#24403e'), material('#2c4140')];

  function mesh(geometry, mat, x, y, z, parent = objects, casts = true) {
    const result = new THREE.Mesh(geometry, mat);
    result.position.set(x, y, z);
    result.castShadow = casts && !mobile;
    result.receiveShadow = true;
    parent.add(result);
    return result;
  }
  function box(w, h, d, mat, x, y, z, parent = objects, casts = true) {
    return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent, casts);
  }
  function tube(points, radius, mat, parent = objects, segments = 12) {
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), Math.max(20, points.length * 8), radius, 6, false), mat, 0, 0, 0, parent);
  }
  function beam(a, b, radius, mat, parent = objects) {
    const delta = b.clone().sub(a);
    const piece = mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 7), mat, 0, 0, 0, parent);
    piece.position.copy(a).addScaledVector(delta, .5);
    piece.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    return piece;
  }
  function texture(draw, size = 512, rx = 1, rz = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    draw(ctx, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(rx, rz);
    tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    return tex;
  }
  const cobbles = texture((ctx, n) => {
    ctx.fillStyle = '#88878a'; ctx.fillRect(0, 0, n, n);
    const cellW = 47, cellH = 25;
    for (let y = 0; y < n; y += cellH) {
      for (let x = -30; x < n; x += cellW) {
        const off = (Math.floor(y / cellH) % 2) * cellW / 2;
        const v = 112 + Math.floor(rnd() * 52);
        ctx.fillStyle = 'rgb(' + v + ',' + (v - 1) + ',' + (v - 2) + ')';
        ctx.fillRect(x + off + 2, y + 2, cellW - 3, cellH - 3);
        ctx.fillStyle = 'rgba(224,231,230,.09)';
        ctx.fillRect(x + off + 4, y + 3, cellW - 10, 2);
      }
    }
    for (let i = 0; i < 5000; i++) {
      const x = rnd() * n, y = rnd() * n, a = rnd() * .2;
      ctx.fillStyle = 'rgba(10,21,24,' + a + ')';
      ctx.fillRect(x, y, 1 + rnd() * 3, 1 + rnd() * 3);
    }
  }, 512, 3, 58);
  const asphalt = texture((ctx, n) => {
    ctx.fillStyle = '#373e48'; ctx.fillRect(0, 0, n, n);
    for (let i = 0; i < 11000; i++) {
      const v = Math.floor(49 + rnd() * 75);
      ctx.fillStyle = 'rgba(' + v + ',' + (v + 2) + ',' + (v + 5) + ',' + (.12 + rnd() * .24) + ')';
      ctx.fillRect(rnd() * n, rnd() * n, 1 + rnd() * 2.5, 1 + rnd() * 3);
    }
  }, 512, 5, 76);
  const roofTex = texture((ctx, n) => {
    ctx.fillStyle = '#364453'; ctx.fillRect(0, 0, n, n);
    for (let y = 0; y < n; y += 15) {
      ctx.fillStyle = '#0b20294d'; ctx.fillRect(0, y, n, 2);
      for (let x = -20; x < n; x += 36) {
        const off = (Math.floor(y / 15) % 2) * 18;
        ctx.fillStyle = 'rgba(154,174,189,' + (.07 + rnd() * .13) + ')';
        ctx.fillRect(x + off + 1, y + 2, 34, 10);
      }
    }
  });
  const paving = material('#ffffff', .88, .01, { map: cobbles });
  const asphaltMat = material('#ffffff', .81, .03, { map: asphalt });

  // A broad riverside promenade and roadway, rendered in world units (metres).
  box(42, .48, 860, paving, -1, -.30, -355, objects, false);
  box(18, .38, 860, asphaltMat, 29, -.30, -355, objects, false);
  box(2, .28, 860, ivory, 18.5, -.20, -355, objects, false);
  box(2, .33, 860, darkStone, 38.5, -.23, -355, objects, false);
  box(1.8, 3.0, 860, darkStone, -21, .65, -355, objects, false);
  box(1.9, .31, 860, stone, -21, 2.25, -355, objects, false);
  box(1.0, 4.1, 860, stone2, -24, -1.90, -355, objects, false);
  // Repeating streetcar rails, drainage channels, and painted bicycle-lane strips.
  const strip = material('#d0b99b', .75);
  for (let z = 48; z > -735; z -= 16) {
    box(.11, .021, 5.5, strip, 18.6, -.03, z - 6, objects, false);
    box(.11, .021, 5.5, strip, 39, -.04, z - 6, objects, false);
  }
  const railMat = material('#5d6265', .48, .4);
  for (let x of [33.1, 36.7]) box(.08, .04, 855, railMat, x, -.05, -355, objects, false);
  for (let z = 60; z > -740; z -= 4) {
    box(.26, .04, .25, stone, -20.2, 2.44, z, objects, false);
    if (Math.floor((z - 60) / 4) % 3 === 0) {
      box(.12, .13, 3.9, iron, -20.2, 2.98, z - 2, objects, false);
      box(.12, .13, 3.9, iron, -20.2, 2.63, z - 2, objects, false);
    }
  }

  // A physically rendered animated river with layers of nighttime light ripples.
  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `
      uniform float time;varying vec2 vUv;
      float wave(vec2 p){return sin(p.y*210.+sin(p.x*14.+time*.6)*1.9+time*1.6)*.5+sin(p.y*445.-time*2.+p.x*46.)*.26+sin(p.x*45.+p.y*65.+time*.8)*.16;}
      void main(){
        vec2 p=vUv;float w=wave(p);
        vec3 deep=vec3(.013,.045,.077);vec3 reflected=vec3(.12,.18,.235);
        float g=pow(max(0.,.56+.44*w),14.);
        float amber=sin(p.y*150.+p.x*40.)*.5+.5;
        float ribbons=smoothstep(.88,1.,amber)*smoothstep(.15,.45,p.x);
        vec3 c=mix(deep,reflected,.30+.25*w);
        c+=vec3(.90,.43,.14)*g*.3;
        c+=vec3(.57,.27,.15)*ribbons*g*.43;
        c+=vec3(.15,.29,.46)*pow(max(0.,w),6.)*.12;
        gl_FragColor=vec4(c,1.);
      }`
  });
  const water = mesh(new THREE.PlaneGeometry(170, 860, 1, 1), waterMaterial, -110, -.88, -355, objects, false);
  water.rotation.x = -PI / 2;

  // Opposite bank, horizon and distant architectural silhouettes.
  box(72, 1.7, 860, stone2, -188, .15, -355, objects, false);
  box(4, 5.0, 860, darkStone, -153, 2, -355, objects, false);

  // A detailed window texture unique to each building.
  function facadeTexture(index, floors, columns, litBias) {
    const n = mobile ? 512 : 1024;
    return texture((ctx, S) => {
      const tones = ['#bcb1a4', '#c7b8a4', '#c1bcb3', '#d2c7b3', '#b3aca3', '#cdc1b2'];
      ctx.fillStyle = tones[index % tones.length];
      ctx.fillRect(0, 0, S, S);
      for (let j = 0; j < 6000; j++) {
        const y = rnd() * S, x = rnd() * S;
        ctx.fillStyle = rnd() > .5 ? 'rgba(255,250,228,.04)' : 'rgba(35,41,43,.055)';
        ctx.fillRect(x, y, rnd() * 7 + 1, rnd() * 3 + 1);
      }
      for (let j = 1; j < floors; j++) {
        const y = S - j * S / floors;
        ctx.fillStyle = '#ddd0bd'; ctx.fillRect(0, y - 2, S, 8);
        ctx.fillStyle = 'rgba(34,35,33,.16)'; ctx.fillRect(0, y + 6, S, 5);
      }
      const margin = S * .09;
      for (let floor = 0; floor < floors; floor++) for (let col = 0; col < columns; col++) {
        const cellW = (S - margin * 2) / columns;
        const cellH = S / floors;
        const x = margin + col * cellW + cellW * .18;
        const y = floor * cellH + cellH * .12;
        const w = cellW * .64, h = cellH * .7;
        ctx.fillStyle = '#e2d6c6'; ctx.fillRect(x - 8, y - 9, w + 16, h + 17);
        ctx.fillStyle = '#857d79'; ctx.fillRect(x - 2, y - 3, w + 4, h + 7);
        const lit = rnd() < litBias + floor * .025;
        let grad = ctx.createLinearGradient(x, y, x + w, y + h);
        if (lit) { grad.addColorStop(0, '#a47c53'); grad.addColorStop(.5, '#f1bd6b'); grad.addColorStop(1, '#6d5142'); }
        else { grad.addColorStop(0, '#192938'); grad.addColorStop(.6, '#30475b'); grad.addColorStop(1, '#111f30'); }
        ctx.fillStyle = grad; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        ctx.fillStyle = 'rgba(245,229,195,.25)'; ctx.fillRect(x + w * .45, y + 2, 3, h - 4);
        ctx.fillRect(x + 2, y + h * .51, w - 4, 3);
        ctx.fillStyle = '#e0d0bd'; ctx.fillRect(x - 10, y + h + 4, w + 20, 7);
        if (floor > 0) {
          ctx.fillStyle = 'rgba(26,40,43,.73)'; ctx.fillRect(x - 11, y + h * .62, w + 22, 5);
          for (let bar = 0; bar < 6; bar++) ctx.fillRect(x - 10 + bar * (w + 18) / 5, y + h * .61, 4, h * .3);
        }
      }
    }, n);
  }
  function mansardRoof(dx, dz, height, x, y, z, parent = objects) {
    const bx = dx / 2 + .7, bz = dz / 2 + .8, tx = bx - 2.1, tz = bz - 2.1;
    const positions = [
      -bx,0,-bz, bx,0,-bz, bx,0,bz, -bx,0,bz,
      -tx,height,-tz, tx,height,-tz, tx,height,tz, -tx,height,tz
    ];
    const indices = [
      0,1,5, 0,5,4, 1,2,6, 1,6,5, 2,3,7, 2,7,6, 3,0,4, 3,4,7,
      4,5,6, 4,6,7
    ];
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions,3));
    geom.setIndex(indices); geom.computeVertexNormals();
    return mesh(geom, material('#394653', .91, .04, { map: roofTex, side: THREE.DoubleSide }), x, y, z, parent);
  }
  function building(x, z, idx, far = false) {
    const depth = far ? 17 + rnd() * 7 : 15.5 + rnd() * 5;
    const width = far ? 17 + rnd() * 7 : 17 + rnd() * 6;
    const floors = far ? 4 : 5;
    const h = far ? 19 + rnd() * 15 : 21 + rnd() * 7;
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    objects.add(group);
    const base = material(['#c2b4a4', '#b6aca4', '#d1c2ad', '#bdb9b0'][idx % 4], .94);
    box(depth, h, width, base, 0, h / 2, 0, group);
    const frontX = -depth / 2 - .06;
    const map = facadeTexture(idx, floors, far ? 4 : 5, far ? .38 : .47);
    const frontage = mesh(new THREE.PlaneGeometry(width, h - .7), new THREE.MeshStandardMaterial({ map, roughness: .85, metalness: .02, side: THREE.DoubleSide }), frontX, h / 2, 0, group, false);
    frontage.rotation.y = -PI / 2;
    box(depth + .7, .65, width + .6, ivory, 0, 4.1, 0, group);
    box(depth + 1.0, .6, width + .9, ivory, 0, h - .16, 0, group);
    for (let fl = 1; fl <= 3; fl++) box(.23, .28, width + .25, stone, frontX - .1, 4.1 + fl * 4.1, 0, group, false);
    mansardRoof(depth + .4, width + .8, 4.3, 0, h, 0, group);
    box(depth - 4.3, .3, width - 4.3, roofM, 0, h + 4.36, 0, group);
    const door = box(.13, 3.1, 2.8, iron, frontX - .14, 1.58, 0, group);
    box(.16, .13, 3.15, brass, frontX - .23, 3.18, 0, group);
    for (let i = 0; i < 3; i++) {
      const chim = (rnd() - .5) * (width - 5);
      box(1.1, 2.5 + rnd() * 1.4, 1.35, stone, 0, h + 5.4, chim, group);
      box(1.42, .22, 1.62, darkStone, 0, h + 6.72, chim, group);
    }
    if (!far) {
      for (let j = 0; j < 5; j++) {
        const wpos = -width / 2 + 2.8 + j * (width - 5.6) / 4;
        // Three-dimensional balconies and wrought-iron railings.
        box(1.12, .15, 2.45, stone2, frontX - .68, 8.2, wpos, group);
        box(.09, 1.0, 2.45, iron, frontX - 1.22, 8.75, wpos, group);
        for (let b = 0; b < 7; b++) box(.08, .78, .09, iron, frontX - 1.26, 8.6, wpos - 1.13 + b * .376, group, false);
        box(.35, 1.6, 1.6, roofM, frontX + 2.2, h + 3.7, wpos, group, false);
        box(.18, 1.1, 1.0, glass, frontX + 1.98, h + 3.75, wpos, group, false);
        if (j % 2 === 0) {
          const lit = new THREE.MeshBasicMaterial({ color: rnd() > .5 ? '#efb977' : '#b9916b', transparent: true, opacity: .65 });
          box(.06, 1.45, .78, lit, frontX - .13, 12.5, wpos, group, false);
        }
      }
    }
    // Tall street-level storefronts under the façade.
    if (!far && idx % 3 !== 0) {
      const awning = material(idx % 2 ? '#4e332f' : '#2a4d4a', .92);
      box(2.7, .14, 6.0, awning, frontX - 1.4, 3.9, width * .21, group);
      box(.15, 2.7, 5.5, glass, frontX - .21, 1.56, width * .21, group);
      box(.16, .15, 6.0, brass, frontX - .36, 3.12, width * .21, group);
    }
  }
  for (let i = 0; i < 24; i++) building(48, 26 - i * 30, i);
  for (let i = 0; i < 25; i++) building(-187, 33 - i * 29, i + 4, true);
  // Distant side-street façades mark the cross-streets.
  for (let z of [-100, -235, -410]) for (let i = 0; i < 5; i++) building(67 + i * 20, z, i + 31, true);

  // Nighttime street lamps with luminous sprites and a limited number of real lights.
  function glowTexture() {
    const c = document.createElement('canvas');c.width=c.height=128;
    const x=c.getContext('2d');const g=x.createRadialGradient(64,64,0,64,64,64);
    g.addColorStop(0,'rgba(255,240,198,1)');
    g.addColorStop(.08,'rgba(255,212,138,.96)');
    g.addColorStop(.26,'rgba(245,165,80,.40)');
    g.addColorStop(1,'rgba(245,165,80,0)');
    x.fillStyle=g;x.fillRect(0,0,128,128);
    return new THREE.CanvasTexture(c);
  }
  const glowMat = new THREE.SpriteMaterial({ map: glowTexture(), color: '#ffc68f', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const lampGroups = [];
  function streetLamp(x, z, number, flip = false) {
    const g = new THREE.Group();g.position.set(x,0,z);objects.add(g);
    const stem = mesh(new THREE.CylinderGeometry(.12,.17,6.2,9),iron,0,3.1,0,g);
    box(.46,.24,.55,iron,0,6.24,0,g);
    mesh(new THREE.CylinderGeometry(.23,.2,.7,8),amber,0,6.72,0,g,false);
    box(.45,.16,.56,iron,0,7.15,0,g);
    const halo = new THREE.Sprite(glowMat);halo.position.set(0,6.72,0);halo.scale.set(5.0,5.0,1);g.add(halo);
    if(number%4===0 && !mobile) {
      const pl = new THREE.PointLight('#ffc58e',12,20,2);
      pl.position.set(0,6.4,0);g.add(pl);
    }
    if (number%7===0) {
      const pool = mesh(new THREE.CircleGeometry(5,24),new THREE.MeshBasicMaterial({color:'#ffbc73',transparent:true,opacity:.025,depthWrite:false}),x,-.014,z,objects,false);
      pool.rotation.x=-PI/2;
    }
    lampGroups.push(g);
  }
  let index=0;
  for (let z=48;z>-740;z-=25) {
    streetLamp(-16,z,index++);
    streetLamp(38.1,z,index++,true);
  }
  // Plane trees with clustered foliage rather than simple cone crowns.
  function tree(x,z) {
    const group=new THREE.Group();group.position.set(x,0,z);objects.add(group);
    mesh(new THREE.CylinderGeometry(.19,.3,5.0,8),darkStone,0,2.5,0,group);
    for(let j=0;j<9;j++) {
      const a=j*2.399,rad=1.3+rnd()*1.0;
      const px=Math.cos(a)*rad,py=5.5+rnd()*3,pz=Math.sin(a)*rad;
      beam(new THREE.Vector3(0,3.5,0),new THREE.Vector3(px,py,pz),.06,iron,group);
      const crown=mesh(new THREE.IcosahedronGeometry(.9+rnd()*.8,1),leaves[j%leaves.length],px,py,pz,group);
      crown.rotation.set(rnd()*2,rnd()*2,rnd()*2);
    }
    const grille = box(2.4,.08,2.4,iron,0,.035,0,group,false);
  }
  for(let z=9;z>-710;z-=27)tree(11,z);

  // Eiffel Tower silhouette on the horizon, with glowing architectural accent points.
  const tower = new THREE.Group();tower.position.set(-142,1,-600);objects.add(tower);
  const towerMetal = material('#443a36',.5,.65);
  const local=(x,y,z)=>new THREE.Vector3(x,y,z);
  for(let dx of [-1,1])for(let dz of [-1,1]) {
    beam(local(dx*18,1,dz*16),local(dx*8,36,dz*7),.74,towerMetal,tower);
    beam(local(dx*8,36,dz*7),local(dx*3.5,75,dz*3),.47,towerMetal,tower);
    beam(local(dx*3.5,75,dz*3),local(dx*.7,108,dz*.7),.23,towerMetal,tower);
    for(let y=5;y<100;y+=8){
      const s=18-y*.154;
      if(s<1)continue;
      beam(local(dx*s,y,dz*s*.88),local(dx*(s-.8),y+7,dz*(s-.8)*.88),.095,towerMetal,tower);
      if(y<83)beam(local(dx*s,y,dz*s*.88),local(-dx*s,y+5,dz*s*.88),.065,towerMetal,tower);
    }
  }
  box(38,1.9,32,towerMetal,0,33,0,tower);
  box(17,1.9,15,towerMetal,0,73,0,tower);
  box(6,1.5,6,towerMetal,0,107,0,tower);
  beam(local(0,107,0),local(0,130,0),.22,towerMetal,tower);
  for(let j=0;j<18;j++){
    const a=j*2*PI/18;
    const s=new THREE.Mesh(new THREE.SphereGeometry(.22,7,5),warmGlow);
    s.position.set(Math.cos(a)*8.1,74.4,Math.sin(a)*7.0);tower.add(s);
  }
  // An illuminated arched bridge across the Seine at a late stop.
  const bridgeZ=-252;
  box(185,1.45,16,stone2,-92,2.7,bridgeZ,objects);
  for(let x=-170;x<-22;x+=29) {
    box(3.5,8.5,13.5,ivory,x,-2,bridgeZ,objects);
    const arc=mesh(new THREE.TorusGeometry(12.4,.8,7,32,PI),stone,x,-2.2,bridgeZ+6.8);
    arc.rotation.z=PI;
    arc.rotation.y=PI/2;
  }
  for(let side of [-1,1]) {
    box(185,1.3,.55,ivory,-92,4.1,bridgeZ+side*7.8);
    for(let x=-176;x<-16;x+=6) box(.65,1.3,.65,stone,-92+x+92,5.15,bridgeZ+side*7.8);
  }
  // Architectural lamps and small green boulevard stands.
  const stands=[];
  const exhibits=[
    ['Making AI Useful','MICROSOFT','✳','#c9ad8c'],
    ['Making the Complex Simpler','SOCIÉTÉ GÉNÉRALE','◇','#a2bcb1'],
    ['The Future of Work','ROSTRA','◈','#c1b3a0'],
    ['Strategy Is a Team Sport','BRUIN STRATEGY NETWORK','✦','#a8accb'],
    ['Three Cities. One Curiosity','ABOUT ME','◎','#d0b29b'],
    ['Always in Motion','PERSONAL NOTES','✺','#a2b8ab'],
    ['A Founder in the Making','THE FUTURE','↗','#cead89'],
    ['Say Bonjour','CONTACT','♥','#d2a5a8']
  ];
  function artCanvas(item,number) {
    return texture((ctx,S)=>{
      const grad=ctx.createLinearGradient(0,0,S,S);
      grad.addColorStop(0,item[3]);grad.addColorStop(1,'#233b44');
      ctx.fillStyle=grad;ctx.fillRect(0,0,S,S);
      ctx.textAlign='center';
      ctx.strokeStyle='#f4e5cd6c';ctx.lineWidth=3;
      for(let r of [105,155,210]){ctx.beginPath();ctx.arc(S/2,S*.42,r,0,2*PI);ctx.stroke();}
      ctx.fillStyle='#fff0d8';ctx.font='bold 25px Georgia';ctx.fillText('THE SEINE COLLECTION',S/2,45);
      ctx.font='220px Georgia';ctx.fillText(item[2],S/2,S*.56);
      ctx.font='bold 28px sans-serif';ctx.fillText(item[1].slice(0,23),S/2,S*.77);
      ctx.font='bold 21px sans-serif';ctx.fillText('EXHIBIT '+String(number+1).padStart(2,'0'),S/2,S*.89);
    },512);
  }
  function stall(z,i) {
    const g=new THREE.Group();g.position.set(0,0,z);objects.add(g);
    box(2.4,1.2,4.4,green,-7,1.92,0,g);
    const lid=box(.18,2.35,4.65,green2,-6.26,3.68,0,g);
    lid.rotation.z=-.46;
    box(.45,.25,4.7,green2,-6.8,2.61,0,g);
    box(.18,2.7,2.2,brass,-5.6,2.5,0,g);
    const art=mesh(new THREE.PlaneGeometry(1.93,2.33),new THREE.MeshStandardMaterial({map:artCanvas(exhibits[i],i),roughness:.58,emissive:'#3c2420',emissiveIntensity:.16}),-5.46,2.52,0,g,false);
    art.rotation.y=-PI/2;
    box(.13,.15,2.28,brass,-5.47,3.76,0,g);
    box(.13,.15,2.28,brass,-5.47,1.28,0,g);
    for(let j=0;j<4;j++){
      const book=box(.65,.065,.72,material(['#a78964','#8b6652','#53675b','#9a8e80'][j]),-5.8,1.15+j*.09,1.55-j*.19,g);
      book.rotation.y=(rnd()-.5)*.35;
    }
    const spot=new THREE.PointLight('#ffce95',6,12,2);
    if(!mobile){spot.position.set(-5.1,3.7,0);g.add(spot);}
    stands.push({x:-6.2,z,index:i,group:g});
  }
  for(let i=0;i<8;i++) stall(-19-i*64,i);

  // Night buses / compact Parisian cars pass along the adjacent street.
  const vehicles=[];
  function car(z,i) {
    const g=new THREE.Group();g.position.set(27 + (i%2)*5.0,0,z);objects.add(g);
    const color=material(['#2c414b','#39383d','#343a3b','#5d393c'][i%4],.44,.28);
    box(2.25,.55,4.6,color,0,.56,0,g);
    const roof=box(2.08,.76,2.2,color,0,1.05,-.15,g);
    box(2.04,.34,1.63,glass,0,1.1,-.19,g);
    for(let x of [-.89,.89])for(let zz of [-1.45,1.45]){
      const wheel=mesh(new THREE.CylinderGeometry(.35,.35,.17,12),iron,x,.32,zz,g);
      wheel.rotation.z=PI/2;
    }
    const headlight=new THREE.MeshBasicMaterial({color:'#fff0c4'});
    for(let x of [-.77,.77]) {
      box(.35,.22,.065,headlight,x,.62,-2.32,g,false);
      box(.35,.19,.07,new THREE.MeshBasicMaterial({color:'#df654a'}),x,.58,2.34,g,false);
    }
    vehicles.push({group:g,speed:8+rnd()*7,phase:rnd()*600});
  }
  for(let i=0;i<7;i++)car(25-i*106,i);

  // Sparse café lights and street reflections.
  const puddleMat=new THREE.MeshBasicMaterial({color:'#7d9eab',transparent:true,opacity:.07,depthWrite:false});
  for(let i=0;i<90;i++){
    const p=mesh(new THREE.CircleGeometry(.3+rnd()*1.9,10),puddleMat,22+rnd()*15,-.077,55-rnd()*760,objects,false);
    p.rotation.x=-PI/2;
    p.scale.y=.25+rnd()*.55;
  }
  const dust = [];
  const particleMat = new THREE.PointsMaterial({color:'#d7b890',size:.1,transparent:true,opacity:.34,sizeAttenuation:true,depthWrite:false});
  const verts=[];
  for(let i=0;i<450;i++)verts.push(-20+rnd()*60,1+rnd()*20,-rnd()*650);
  const dustGeometry=new THREE.BufferGeometry();
  dustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  const dustPoints=new THREE.Points(dustGeometry,particleMat);objects.add(dustPoints);

  // Camera-attached cockpit: tubing, bell, brake handles and headlamp.
  function buildCockpit(camera) {
    const g=new THREE.Group();
    camera.add(g);
    g.position.set(0,-.92,-1.13);
    const black=material('#0d141c',.5,.32);
    const chrome=material('#707b88',.23,.86);
    const rubber=material('#1f2429',.97,.03);
    tube([new THREE.Vector3(-.95,.02,-.18),new THREE.Vector3(-.63,.02,-.24),new THREE.Vector3(-.33,-.05,-.3),new THREE.Vector3(.33,-.05,-.3),new THREE.Vector3(.63,.02,-.24),new THREE.Vector3(.95,.02,-.18)],.033,chrome,g);
    beam(new THREE.Vector3(0,-.03,-.28),new THREE.Vector3(0,-.48,-.53),.095,black,g);
    tube([new THREE.Vector3(-.99,.02,-.18),new THREE.Vector3(-.97,-.08,-.22),new THREE.Vector3(-.93,-.2,-.21)],.066,rubber,g);
    tube([new THREE.Vector3(.99,.02,-.18),new THREE.Vector3(.97,-.08,-.22),new THREE.Vector3(.93,-.2,-.21)],.066,rubber,g);
    for(let sign of [-1,1]){
      beam(new THREE.Vector3(sign*.76,.02,-.22),new THREE.Vector3(sign*.87,-.13,-.47),.018,chrome,g);
      const brake=box(.16,.024,.12,black,sign*.79,.07,-.28,g);
      brake.rotation.z=sign*.14;
    }
    mesh(new THREE.CylinderGeometry(.09,.09,.07,18),brass,.36,.095,-.27,g);
    mesh(new THREE.SphereGeometry(.11,12,8),amber,0,.01,-.44,g);
    const light=new THREE.SpotLight('#ffe7ba',1.7,55,PI/7,.6,2);
    if(!mobile){
      light.position.set(0,-.09,-.48);
      const target=new THREE.Object3D();target.position.set(0,-2,-18);g.add(target);light.target=target;g.add(light);
    }
    return g;
  }
  const skyShader = new THREE.ShaderMaterial({
    side: THREE.BackSide,depthWrite:false,
    vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec3 p;void main(){vec3 n=normalize(p);float h=max(0.,n.y);vec3 c=mix(vec3(.075,.11,.19),vec3(.006,.018,.045),smoothstep(.03,.58,h));c+=vec3(.14,.06,.07)*(1.-smoothstep(.0,.33,h))*.33;gl_FragColor=vec4(c,1.);}'
  });
  const sky=mesh(new THREE.SphereGeometry(860,40,24),skyShader,0,0,0,objects,false);
  sky.castShadow=false;sky.receiveShadow=false;
  const starsGeom=new THREE.BufferGeometry(),starCoords=[];
  for(let i=0;i<1400;i++){
    const a=rnd()*PI*2,h=.06+rnd()*.90,rad=840*Math.sqrt(1-h*h);
    starCoords.push(Math.cos(a)*rad,840*h,Math.sin(a)*rad);
  }
  starsGeom.setAttribute('position',new THREE.Float32BufferAttribute(starCoords,3));
  const starMat=new THREE.PointsMaterial({color:'#bfd0e6',size:1.3,transparent:true,opacity:.45,sizeAttenuation:false,depthWrite:false});
  const stars=new THREE.Points(starsGeom,starMat);objects.add(stars);

  function animate(time,camera) {
    waterMaterial.uniforms.time.value=time;
    sky.position.copy(camera.position);
    stars.position.copy(camera.position);
    dustPoints.rotation.y=Math.sin(time*.08)*.006;
    vehicles.forEach((vehicle,i)=>{
      vehicle.group.position.z=60-((vehicle.phase+time*vehicle.speed)%780);
      vehicle.group.rotation.y=i%2?PI:0;
    });
  }
  return { stands, animate, buildCockpit };
};
