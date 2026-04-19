
(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded');
    return;
  }

  function makeRenderer(canvas, alpha) {
    const r = new THREE.WebGLRenderer({ canvas, alpha: alpha !== false, antialias: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.setClearColor(0x000000, 0);
    return r;
  }

  function fitRenderer(renderer, canvas) {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(w, h, false);
    }
    return { w, h };
  }

  function initHero() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const renderer = makeRenderer(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 80;

    // --- PARTÍCULAS DE FUNDO ---
    const PCOUNT = 2200;
    const positions = new Float32Array(PCOUNT * 3);
    const colors    = new Float32Array(PCOUNT * 3);
    const sizes     = new Float32Array(PCOUNT);

    const palettes = [
      new THREE.Color('#b833ff'),
      new THREE.Color('#7b2fff'),
      new THREE.Color('#ff33cc'),
      new THREE.Color('#00e5ff'),
      new THREE.Color('#ffffff'),
    ];

    for (let i = 0; i < PCOUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos((Math.random() * 2) - 1);
      const r     = 30 + Math.random() * 70;
      positions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i*3+2] = r * Math.cos(phi);

      const c = palettes[Math.floor(Math.random() * palettes.length)];
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
      sizes[i] = Math.random() * 0.4 + 0.1;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    pGeo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    const pMat = new THREE.PointsMaterial({
      size: 0.2, vertexColors: true, transparent: true,
      opacity: 0.75, sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // --- ARCOS AO REDOR DO CENTRO (Vazio agora) ---
    const ringGroup = new THREE.Group();
    [28, 36, 44].forEach((radius, i) => {
      const rGeo = new THREE.TorusGeometry(radius, 0.08, 8, 80);
      const rMat = new THREE.MeshBasicMaterial({ 
        color: [0xb833ff, 0x00e5ff, 0x7b2fff][i], 
        transparent: true, 
        opacity: [0.3, 0.2, 0.15][i] 
      });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.rotation.x = [Math.PI/3, Math.PI/4, Math.PI/6][i];
      ring.rotation.y = [0, Math.PI/5, Math.PI/3][i];
      ringGroup.add(ring);
    });
    scene.add(ringGroup);

    // Interatividade com o mouse
    let mx = 0, my = 0;
    document.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      t += 0.008;

      const { w, h } = fitRenderer(renderer, canvas);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      // Rotação suave das partículas
      particles.rotation.y  += 0.0008;
      particles.rotation.x  += 0.0002;

      // Os anéis reagem ao mouse
      ringGroup.rotation.y = t * 0.1 + mx * 0.2;
      ringGroup.rotation.x = Math.sin(t * 0.2) * 0.1 + my * 0.1;

      // Movimento suave da câmera
      camera.position.x += (mx * 8 - camera.position.x) * 0.03;
      camera.position.y += (-my * 5 - camera.position.y) * 0.03;

      renderer.render(scene, camera);
    }
    animate();
  }


  function initTech3D() {
    const canvas = document.getElementById('tech3dCanvas');
    if (!canvas) return;

    const renderer = makeRenderer(canvas);
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
    camera.position.z = 60;

    const helixGroup = new THREE.Group();

    const STEPS = 60;
    const RADIUS = 10;
    const HEIGHT = 50;
    const PITCH  = Math.PI * 2 / 12;

    const nodeMatA = new THREE.MeshBasicMaterial({ color: 0xb833ff, transparent: true, opacity: .9 });
    const nodeMatB = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: .9 });
    const rodMat   = new THREE.MeshBasicMaterial({ color: 0xff33cc, transparent: true, opacity: .4 });

    const prevA = new THREE.Vector3(), prevB = new THREE.Vector3();

    for (let i = 0; i < STEPS; i++) {
      const t = i / STEPS;
      const angle = t * Math.PI * 8;
      const y = (t - 0.5) * HEIGHT;

      const ax = Math.cos(angle) * RADIUS;
      const az = Math.sin(angle) * RADIUS;
      const bx = Math.cos(angle + Math.PI) * RADIUS;
      const bz = Math.sin(angle + Math.PI) * RADIUS;


      const sgA = new THREE.SphereGeometry(0.4, 8, 8);
      const nodeA = new THREE.Mesh(sgA, nodeMatA.clone());
      nodeA.position.set(ax, y, az);
      helixGroup.add(nodeA);

      const sgB = new THREE.SphereGeometry(0.4, 8, 8);
      const nodeB = new THREE.Mesh(sgB, nodeMatB.clone());
      nodeB.position.set(bx, y, bz);
      helixGroup.add(nodeB);

      if (i % 4 === 0) {
        const dir = new THREE.Vector3(bx - ax, 0, bz - az);
        const len = dir.length();
        const rodGeo = new THREE.CylinderGeometry(0.1, 0.1, len, 6);
        const rod = new THREE.Mesh(rodGeo, rodMat);
        rod.position.set((ax + bx) / 2, y, (az + bz) / 2);
        rod.lookAt(new THREE.Vector3(bx, y, bz));
        rod.rotateX(Math.PI / 2);
        helixGroup.add(rod);
      }

      if (i > 0) {
        const spineGeoA = new THREE.CylinderGeometry(0.06, 0.06, prevA.distanceTo(new THREE.Vector3(ax, y, az)), 4);
        const spineA = new THREE.Mesh(spineGeoA, new THREE.MeshBasicMaterial({ color: 0xb833ff, transparent: true, opacity: .5 }));
        spineA.position.copy(prevA).lerp(new THREE.Vector3(ax, y, az), 0.5);
        spineA.lookAt(new THREE.Vector3(ax, y, az));
        spineA.rotateX(Math.PI / 2);
        helixGroup.add(spineA);

        const spineGeoB = new THREE.CylinderGeometry(0.06, 0.06, prevB.distanceTo(new THREE.Vector3(bx, y, bz)), 4);
        const spineB = new THREE.Mesh(spineGeoB, new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: .5 }));
        spineB.position.copy(prevB).lerp(new THREE.Vector3(bx, y, bz), 0.5);
        spineB.lookAt(new THREE.Vector3(bx, y, bz));
        spineB.rotateX(Math.PI / 2);
        helixGroup.add(spineB);
      }

      prevA.set(ax, y, az);
      prevB.set(bx, y, bz);
    }

    scene.add(helixGroup);

    const satellites = [];
    const geos = [
      new THREE.OctahedronGeometry(1.2, 0),
      new THREE.TetrahedronGeometry(1.2, 0),
      new THREE.DodecahedronGeometry(1.2, 0),
    ];
    geos.forEach((geo, i) => {
      const mat  = new THREE.MeshBasicMaterial({ color: [0xb833ff, 0xff33cc, 0x00e5ff][i], wireframe: true, transparent: true, opacity: .5 });
      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / 3) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * 28, (i - 1) * 8, Math.sin(angle) * 28);
      mesh.userData.angle = angle;
      mesh.userData.speed = 0.003 + i * 0.001;
      scene.add(mesh);
      satellites.push(mesh);
    });

    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      t += 0.01;

      const { w, h } = fitRenderer(renderer, canvas);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      helixGroup.rotation.y = t * 0.3;

      satellites.forEach(s => {
        s.userData.angle += s.userData.speed;
        s.position.x = Math.cos(s.userData.angle) * 28;
        s.position.z = Math.sin(s.userData.angle) * 28;
        s.rotation.x += 0.01;
        s.rotation.y += 0.007;
      });

      renderer.render(scene, camera);
    }
    animate();
  }


  function initAvatar() {
    const canvas = document.getElementById('avatarCanvas');
    if (!canvas) return;

    const renderer = makeRenderer(canvas);
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 5;


    const outerGeo = new THREE.IcosahedronGeometry(1.8, 2);
    const outerMat = new THREE.MeshBasicMaterial({ color: 0xb833ff, wireframe: true, transparent: true, opacity: .3 });
    const outer    = new THREE.Mesh(outerGeo, outerMat);
    scene.add(outer);


    const innerGeo = new THREE.IcosahedronGeometry(1.2, 3);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x2d0060, wireframe: false, transparent: true, opacity: .85 });
    const inner    = new THREE.Mesh(innerGeo, innerMat);
    scene.add(inner);

    const ringGeo = new THREE.TorusGeometry(2, 0.04, 6, 60);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: .4 });
    const ring    = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      t += 0.012;
      const { w, h } = fitRenderer(renderer, canvas);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      outer.rotation.y += 0.008;
      outer.rotation.x += 0.003;
      inner.rotation.y -= 0.005;
      ring.rotation.z  += 0.006;

      const s = 1 + Math.sin(t) * 0.04;
      outer.scale.setScalar(s);

      renderer.render(scene, camera);
    }
    animate();
  }

  function initProjectCards() {
    const canvases = document.querySelectorAll('.proj-canvas');

    canvases.forEach(canvas => {
      const type = canvas.dataset.type;
      const renderer = makeRenderer(canvas);
      const scene    = new THREE.Scene();
      const camera   = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 5;

      const colors   = [0xb833ff, 0x7b2fff, 0xff33cc, 0x00e5ff];
      const color1   = colors[Math.floor(Math.random() * colors.length)];
      const mat      = new THREE.MeshBasicMaterial({ color: color1, wireframe: true, transparent: true, opacity: .55 });
      const mat2     = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: false, transparent: true, opacity: .08 });

      let mesh, mesh2;

      if (type === 'sphere') {
        mesh  = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 2), mat);
        mesh2 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 2), mat2);
      } else if (type === 'torus') {
        mesh  = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.45, 12, 48), mat);
        mesh2 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.45, 12, 48), mat2);
      } else if (type === 'ico') {
        mesh  = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 1), mat);
        mesh2 = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 1), mat2);
      } else if (type === 'box') {
        mesh  = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), mat);
        mesh2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), mat2);
      } else if (type === 'knot') {
        mesh  = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.35, 80, 12), mat);
        mesh2 = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.35, 80, 12), mat2);
        camera.position.z = 7;
      } else {
        mesh  = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 0), mat);
        mesh2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 0), mat2);
      }

      scene.add(mesh);
      scene.add(mesh2);

      const pPos = new Float32Array(80 * 3);
      for (let i = 0; i < 80; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(Math.random() * 2 - 1);
        const r     = 2.2 + Math.random() * 0.8;
        pPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
        pPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        pPos[i*3+2] = r * Math.cos(phi);
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: color1, size: 0.06, transparent: true, opacity: .6 });
      scene.add(new THREE.Points(pGeo, pMat));

      const speedX = (Math.random() - 0.5) * 0.012 + 0.006;
      const speedY = (Math.random() - 0.5) * 0.012 + 0.004;

      let isHover = false;
      canvas.parentElement.addEventListener('mouseenter', () => { isHover = true; });
      canvas.parentElement.addEventListener('mouseleave', () => { isHover = false; });

      function animate() {
        requestAnimationFrame(animate);
        const { w, h } = fitRenderer(renderer, canvas);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        const boost = isHover ? 3 : 1;
        mesh.rotation.x  += speedX * boost;
        mesh.rotation.y  += speedY * boost;
        mesh2.rotation.x  = mesh.rotation.x;
        mesh2.rotation.y  = mesh.rotation.y;

        renderer.render(scene, camera);
      }
      animate();
    });
  }

  function initContact() {
    const canvas = document.getElementById('contactCanvas');
    if (!canvas) return;

    const renderer = makeRenderer(canvas);
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    camera.position.z = 14;


    const g1 = new THREE.IcosahedronGeometry(3, 1);
    const m1 = new THREE.MeshBasicMaterial({ color: 0xb833ff, wireframe: true, transparent: true, opacity: .5 });
    const crystal = new THREE.Mesh(g1, m1);
    scene.add(crystal);

    const g2 = new THREE.IcosahedronGeometry(2, 0);
    const m2 = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: .35 });
    const inner = new THREE.Mesh(g2, m2);
    scene.add(inner);


    [5, 6.5, 8].forEach((r, i) => {
      const rg = new THREE.TorusGeometry(r, 0.06, 8, 80);
      const rm = new THREE.MeshBasicMaterial({ color: [0xb833ff, 0x7b2fff, 0xff33cc][i], transparent: true, opacity: [.3, .2, .15][i] });
      const ring = new THREE.Mesh(rg, rm);
      ring.rotation.x = [Math.PI/4, Math.PI/3, Math.PI/6][i];
      ring.rotation.y = [0, Math.PI/4, Math.PI/3][i];
      ring.userData.rspeed = [0.003, -0.004, 0.002][i];
      scene.add(ring);
      ring.userData.isRing = true;
      crystal.userData[`ring${i}`] = ring;
      scene.userData[`cring${i}`] = ring;
    });

    const pCount = 300;
    const pPos   = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(Math.random() * 2 - 1);
      const r     = 6 + Math.random() * 8;
      pPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i*3+2] = r * Math.cos(phi);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xb833ff, size: 0.12, transparent: true, opacity: .5 });
    const pts  = new THREE.Points(pGeo, pMat);
    scene.add(pts);

    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      t += 0.008;

      const { w, h } = fitRenderer(renderer, canvas);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      crystal.rotation.y += 0.006;
      crystal.rotation.x  = Math.sin(t * 0.4) * 0.2;
      inner.rotation.y   -= 0.009;
      inner.rotation.x   += 0.004;
      pts.rotation.y     += 0.002;

      [0, 1, 2].forEach(i => {
        const ring = scene.userData[`cring${i}`];
        if (ring) ring.rotation.z += ring.userData.rspeed;
      });

      renderer.render(scene, camera);
    }
    animate();
  }

  function init() {
    initHero();
    initTech3D();
    initAvatar();
    initProjectCards();
    initContact();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
