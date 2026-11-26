import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";

/**
 * Sakura Blossom Charm Bracelet v2 (Pure Three.js + WebGL)
 * Features:
 * - Real Convex Hull faceted Swarovski crystal cuts (flat facet reflections)
 * - Custom Studio HDR Environment (warm softbox & glints so metal never reflects dark)
 * - 18K Yellow Gold with warm emissive luster
 * - Real Sakura Enamel Petals with radial pink gradient map
 * - Draped catenary chain with dangling faceted crystal teardrops
 * - Golden stardust particles & crystal twinkle sparkles
 * - 360° Drag-to-spin with inertia & gentle floating levitation
 * - DYNAMIC CRAFT PROCESS TRANSITIONS:
 *   * Step 0: Mineral Sourcing -> Raw crystals disperse into floating inspection constellation
 *   * Step 1: Hand Assembly -> Crystals gather into ring; 18K gold rondelles snap into place
 *   * Step 2: Preserved Art -> Draped gold chains & Sakura charm attach and tilt forward in close-up
 *   * Step 3: Ready to Gift -> Fully completed heirloom with golden stardust swirl
 */

// Helper: real cut-gem geometry (convex hull = true flat facets)
const lathePts = (profile, seg) => {
  const pts = [];
  profile.forEach(([r, y], k) => {
    if (r < 1e-4) return pts.push(new THREE.Vector3(0, y, 0));
    for (let j = 0; j < seg; j++) {
      // Alternate rings are staggered, like a Swarovski cut
      const a = ((j + (k % 2) * 0.5) / seg) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
  });
  return pts;
};

const cutGem = (profile, seg) => new ConvexGeometry(lathePts(profile, seg));

const sphereProfile = (rings) =>
  Array.from({ length: rings + 1 }, (_, k) => {
    const p = -Math.PI / 2 + (k * Math.PI) / rings;
    return [Math.cos(p), Math.sin(p)];
  });

const BRILLIANT = [[0, 0.32], [0.55, 0.32], [0.8, 0.18], [1, 0], [0.45, -0.35], [0, -0.75]];
const TEAR = [[0, 0], [0.3, -0.15], [0.55, -0.3], [0.9, -0.5], [1, -0.7], [0.65, -0.85], [0, -1]];

// Bright studio HDR environment: warm softboxes + hard glint panels so metals & gems reflect golden warmth
function buildStudioEnv() {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: "varying vec3 vP; void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: `varying vec3 vP; void main(){float h=vP.y*.5+.5;
        vec3 bot=vec3(.95,.66,.58)*.7, mid=vec3(.96,.78,.8)*.85, top=vec3(1.,.94,.86)*1.2;
        vec3 c=mix(bot,mid,smoothstep(0.,.5,h)); c=mix(c,top,smoothstep(.5,1.,h)); gl_FragColor=vec4(c,1.);}`,
    })
  ));
  const panel = (w, h, hex, k, x, y, z) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), side: THREE.DoubleSide, toneMapped: false })
    );
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    s.add(m);
  };
  panel(14, 14, 0xfff1dc, 6, 0, 14, 2);      // top warm softbox
  panel(6, 10, 0xffd9a0, 7, -12, 5, 8);      // warm key
  panel(6, 10, 0xff9fc2, 4, 12, 2, 6);       // rose fill
  panel(3, 14, 0xffd27a, 8, 0, 6, -14);      // gold rim strip
  panel(16, 5, 0xffeede, 3.5, 0, -8, 10);    // bottom bounce
  for (let i = 0; i < 12; i++) {             // hard glints for crystal sparkle
    const a = i * 2.399, y = Math.sin(i * 1.7) * 9;
    panel(0.8, 0.8, 0xffffff, 28, Math.cos(a) * 12, y, Math.sin(a) * 12);
  }
  return s;
}

export default function Hero3DCanvas({
  height = "520px",
  className = "",
  style = {},
  currentView = "showcase",
  activeStep = 0,
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({ currentView, activeStep });

  // Update dynamic state ref without remounting WebGL context
  useEffect(() => {
    stateRef.current = { currentView, activeStep };
  }, [currentView, activeStep]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- WebGL Renderer with Alpha (Transparent) ----------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02; // Balanced exposure to prevent washing out on light backgrounds
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab;outline:none;";

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(buildStudioEnv(), 0.02).texture;
    
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    camera.position.set(0, 0, 7.2);

    // Warm key, rose fill, gold rim, moving sparkling glint + soft ambient fill for contrast
    const key = new THREE.DirectionalLight(0xffdfb8, 2.0);
    key.position.set(3, 4, 5);
    const fill = new THREE.PointLight(0xff5c9e, 14, 12);
    fill.position.set(-4, -1, 3);
    const rim = new THREE.DirectionalLight(0xffc850, 2.4);
    rim.position.set(-2, 3, -5);
    const glint = new THREE.PointLight(0xffffff, 26, 10);
    const ambient = new THREE.AmbientLight(0xffe6ee, 0.45);
    scene.add(key, fill, rim, glint, ambient);

    // ---------- Photorealistic Materials with Enhanced Depth & Contrast ----------
    const phys = (p) => new THREE.MeshPhysicalMaterial(p);

    // Natural Rose Quartz: Semi-translucent with rosy mineral depth (not washed-out glass)
    const quartz = phys({
      color: 0xf28cb0,
      roughness: 0.12,
      transmission: 0.22, // Low transmission gives rich semi-precious stone body
      ior: 1.54,
      thickness: 1.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      specularIntensity: 1.2,
      envMapIntensity: 1.4,
      attenuationColor: new THREE.Color(0xeb407a),
      attenuationDistance: 0.4,
    });

    // Fuchsia Faceted Crystal: Vibrant deep magenta-rose with faceted flat shading
    const fuchsia = phys({
      color: 0xdf166e,
      emissive: 0xb5004c,
      emissiveIntensity: 0.32,
      roughness: 0.03,
      transmission: 0.28,
      ior: 1.7,
      thickness: 1.0,
      dispersion: 0.4,
      clearcoat: 1.0,
      envMapIntensity: 2.0,
      flatShading: true,
      attenuationColor: new THREE.Color(0xc2185b),
      attenuationDistance: 0.3,
    });

    // Clear Faceted Rondelles: Brilliant diamond facets with high contrast edges
    const clear = phys({
      color: 0xffffff,
      roughness: 0.04,
      transmission: 0.32, // Controlled transmission so it stays distinct against ivory backgrounds
      ior: 2.1,
      thickness: 0.6,
      dispersion: 0.6,
      envMapIntensity: 2.8,
      specularIntensity: 1.4,
      flatShading: true,
    });

    // Dangling Teardrop Crystals: Rich rose tint with high facet sparkle
    const dropPink = phys({
      color: 0xf06292,
      emissive: 0x880e4f,
      emissiveIntensity: 0.18,
      roughness: 0.03,
      transmission: 0.3,
      ior: 1.9,
      thickness: 0.6,
      dispersion: 0.5,
      envMapIntensity: 2.4,
      flatShading: true,
      attenuationColor: new THREE.Color(0xe91e63),
      attenuationDistance: 0.35,
    });

    const diamond = phys({
      color: 0xffffff,
      roughness: 0,
      transmission: 0.8,
      ior: 2.42,
      thickness: 0.6,
      dispersion: 0.7,
      envMapIntensity: 3.0,
      flatShading: true,
    });

    // Radiant 18K yellow gold: Warm luster with rich gold hue and self-lit warmth
    const gold = phys({
      color: 0xf5ca42,
      metalness: 0.94,
      roughness: 0.16,
      envMapIntensity: 2.2,
      emissive: 0x855400,
      emissiveIntensity: 0.34,
      clearcoat: 0.4,
      clearcoatRoughness: 0.08,
    });
    const charmGold = gold.clone();
    charmGold.color.set(0xecbe3a);
    charmGold.roughness = 0.12;

    // Sakura Enamel: Rich 256x256 radial gradient (soft sakura heart -> vivid deep magenta edge)
    const gc = document.createElement("canvas");
    gc.width = gc.height = 256;
    const g2 = gc.getContext("2d");
    const grd = g2.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, "#ffb8d0");
    grd.addColorStop(0.35, "#ff7aa8");
    grd.addColorStop(0.8, "#f02882");
    grd.addColorStop(1, "#c2185b");
    g2.fillStyle = grd;
    g2.fillRect(0, 0, 256, 256);
    const enamelTex = new THREE.CanvasTexture(gc);
    enamelTex.colorSpace = THREE.SRGBColorSpace;
    enamelTex.repeat.set(1 / 1.4, 1 / 1.4);
    enamelTex.offset.set(0.5, 0.5);

    const enamel = phys({
      map: enamelTex,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.2,
      sheen: 0.5,
      sheenColor: new THREE.Color(0xff80ab),
    });

    // Twinkle Stars Sprite Texture
    const sc = document.createElement("canvas");
    sc.width = sc.height = 64;
    const sx = sc.getContext("2d");
    const sg = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
    sg.addColorStop(0, "rgba(255,255,255,1)");
    sg.addColorStop(0.15, "rgba(255,240,210,.7)");
    sg.addColorStop(1, "rgba(255,230,180,0)");
    sx.fillStyle = sg;
    sx.fillRect(0, 0, 64, 64);
    sx.fillStyle = "rgba(255,255,255,.9)";
    sx.fillRect(31, 2, 2, 60);
    sx.fillRect(2, 31, 60, 2);
    const starTex = new THREE.CanvasTexture(sc);

    const twinklers = [];
    const twinkle = (parent, x, y, z, size, phase) => {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: starTex,
          color: 0xfff3d6,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      s.position.set(x, y, z);
      parent.add(s);
      twinklers.push({ s, size, phase });
    };

    // ---------- Hierarchy: root (levitation) > spin (user rotate) > jewel ----------
    const root = new THREE.Group();
    const spin = new THREE.Group();
    const jewel = new THREE.Group();
    jewel.position.y = 0.38;
    root.add(spin);
    spin.add(jewel);
    scene.add(root);
    const swayers = [];

    // ---------- Beaded Ring with Real Cut Facets ----------
    const quartzGeo = new THREE.SphereGeometry(1, 56, 40);
    const fuchsiaGeo = cutGem(sphereProfile(7).map(([r, y]) => [r, y]), 16);
    const clearGeo = cutGem(sphereProfile(6), 14);
    const goldGeo = new THREE.LatheGeometry(
      [[0.06, -0.068], [0.13, -0.068], [0.145, -0.037], [0.13, 0], [0.145, 0.037], [0.13, 0.068], [0.06, 0.068]]
        .map(([x, y]) => new THREE.Vector2(x, y)),
      48
    );
    const stoneGeo = cutGem(BRILLIANT, 8);

    const items = [];
    for (let c = 0; c < 8; c++) {
      const big = c % 2 === 0;
      items.push(
        { k: "Q", r: big ? 0.17 : 0.15 },
        { k: "C", r: 0.13 },
        { k: "F", r: big ? 0.14 : 0.16 },
        { k: "G", r: 0 }
      );
    }
    const wOf = (it) => (it.k === "Q" ? 2 * it.r : it.k === "F" ? 2 * it.r : it.k === "C" ? 0.12 : 0.136);
    const R = items.reduce((a, it) => a + wOf(it), 0) / (2 * Math.PI);
    let cum = 0;

    items.forEach((it, i) => {
      const w = wOf(it), th = (cum + w / 2) / R;
      cum += w;
      const g = new THREE.Group();
      g.position.set(Math.cos(th) * R, Math.sin(th) * R, 0);
      g.rotation.z = th;

      it.g = g;
      it.ringPos = g.position.clone();
      it.ringRotZ = th;

      // Dispersed constellation positions for Step 01 (loose raw crystals)
      const angle = (i / items.length) * Math.PI * 2;
      const rad = R * 1.55 + Math.sin(i * 3.7) * 0.45;
      it.dispersedPos = new THREE.Vector3(
        Math.cos(angle) * rad,
        Math.sin(angle) * rad + Math.sin(i * 1.6) * 0.3,
        Math.sin(i * 2.2) * 0.8
      );

      if (it.k === "G") {
        g.add(new THREE.Mesh(goldGeo, gold));
        for (let j = 0; j < 12; j++) {
          // Rhinestones set into the gold rondelle
          const a = (j / 12) * Math.PI * 2, d = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
          const st = new THREE.Mesh(stoneGeo, diamond);
          st.scale.setScalar(0.03);
          st.position.copy(d).multiplyScalar(0.148);
          st.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
          g.add(st);
        }
      } else {
        const geo = it.k === "Q" ? quartzGeo : it.k === "F" ? fuchsiaGeo : clearGeo;
        const mat = it.k === "Q" ? quartz : it.k === "F" ? fuchsia : clear;
        const m = new THREE.Mesh(geo, mat);
        const sy = it.k === "C" ? 0.46 : 1;
        m.scale.set(it.r, it.r * sy, it.r);
        m.rotation.y = i * 0.7;
        g.add(m);
        if (it.k !== "C" && i % 4 === 1) twinkle(g, 0.05, 0.04, it.r + 0.05, 0.22, i);
      }
      jewel.add(g);
    });

    // ---------- Fine Gold Catenary Chain Drape (Grouped for Step 3 animation) ----------
    const A = 0.8, rr = R + 0.1, xe = rr * Math.sin(A), ye = -rr * Math.cos(A), D = 0.62, K = 1.7;
    const cp = [];
    for (let i = 0; i <= 40; i++) {
      const s = -1 + (2 * i) / 40;
      cp.push(new THREE.Vector3(s * xe, ye - D * (Math.cosh(K) - Math.cosh(K * s)) / (Math.cosh(K) - 1), 0));
    }
    const curve = new THREE.CatmullRomCurve3(cp);
    const NL = Math.ceil(curve.getLength() / 0.04);
    const links = new THREE.InstancedMesh(new THREE.TorusGeometry(0.026, 0.0065, 8, 18), gold, NL);
    const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), mt = new THREE.Matrix4();
    const AXx = new THREE.Vector3(1, 0, 0), AXy = new THREE.Vector3(0, 1, 0), sc3 = new THREE.Vector3(1.5, 1, 1);
    for (let i = 0; i < NL; i++) {
      const u = i / (NL - 1);
      qa.setFromUnitVectors(AXx, curve.getTangentAt(u));
      qb.setFromAxisAngle(AXx, (i % 2) * Math.PI / 2);
      mt.compose(curve.getPointAt(u), qa.multiply(qb), sc3);
      links.setMatrixAt(i, mt);
    }

    const chainGroup = new THREE.Group();
    chainGroup.add(links);

    // Jump rings where chain connects
    [-1, 1].forEach((sgn) => {
      const j = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 8, 18), gold);
      j.position.set(sgn * xe, ye, 0);
      chainGroup.add(j);
    });
    jewel.add(chainGroup);

    // ---------- Hanging Faceted Teardrop Crystals on Gold Pins ----------
    const teardropsGroup = new THREE.Group();
    const tearGeo = cutGem(TEAR, 10);
    const pinGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 1, 6);
    const capGeo = new THREE.SphereGeometry(0.02, 12, 10);
    const eyeGeo = new THREE.TorusGeometry(0.016, 0.004, 6, 12);

    [[0.14, 0.7], [0.28, 1], [0.72, 1], [0.86, 0.7]].forEach(([u, len], i) => {
      const p = curve.getPointAt(u), piv = new THREE.Group();
      piv.position.copy(p);
      const pinL = 0.07 * len + 0.03;
      const pin = new THREE.Mesh(pinGeo, gold);
      pin.scale.y = pinL;
      pin.position.y = -pinL / 2 - 0.01;
      const eye = new THREE.Mesh(eyeGeo, gold);
      eye.position.y = -0.012;
      const cap = new THREE.Mesh(capGeo, gold);
      cap.position.y = -pinL - 0.015;
      const L = 0.2 * len + 0.04;
      const drop = new THREE.Mesh(tearGeo, dropPink);
      drop.scale.set(0.065, L, 0.065);
      drop.position.y = -pinL - 0.03;
      drop.rotation.y = i;
      piv.add(pin, eye, cap, drop);
      twinkle(piv, 0, -pinL - 0.03 - L * 0.55, 0.06, 0.2, i * 1.9);
      teardropsGroup.add(piv);
      swayers.push({ g: piv, ph: i * 1.3, amp: 0.05 });
    });
    jewel.add(teardropsGroup);

    // ---------- 5-Petal Sakura Blossom Charm with Diamond Center ----------
    const petal = new THREE.Shape();
    petal.moveTo(0, 0);
    petal.bezierCurveTo(-0.28, 0.1, -0.3, 0.55, -0.08, 0.62);
    petal.lineTo(0, 0.54);
    petal.lineTo(0.08, 0.62);
    petal.bezierCurveTo(0.3, 0.55, 0.28, 0.1, 0, 0);

    const plateGeo = new THREE.ExtrudeGeometry(petal, {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2,
      curveSegments: 20,
    });
    const enGeo = new THREE.ExtrudeGeometry(petal, {
      depth: 0.035,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.01,
      bevelSegments: 4,
      curveSegments: 24,
    });
    const cy = 0.33;
    const ap = enGeo.attributes.position;
    for (let i = 0; i < ap.count; i++) {
      ap.setX(i, ap.getX(i) * 0.93);
      ap.setY(i, (ap.getY(i) - cy) * 0.93 + cy);
    }
    enGeo.computeVertexNormals();

    const outline = new THREE.CatmullRomCurve3(
      petal.getPoints(60).map((v) => new THREE.Vector3(v.x, v.y, 0.052)),
      true,
      "centripetal"
    );
    const borderGeo = new THREE.TubeGeometry(outline, 160, 0.017, 10, true);

    const charm = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const pg = new THREE.Group();
      pg.rotation.z = (i * Math.PI * 2) / 5;
      const plate = new THREE.Mesh(plateGeo, charmGold);
      const en = new THREE.Mesh(enGeo, enamel);
      const br = new THREE.Mesh(borderGeo, charmGold);
      pg.add(plate, en, br);
      charm.add(pg);
    }

    const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.024, 12, 36), charmGold);
    bezel.position.z = 0.065;
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 32), charmGold);
    seat.rotation.x = Math.PI / 2;
    seat.position.z = 0.055;
    const gem = new THREE.Mesh(stoneGeo, diamond);
    gem.scale.setScalar(0.13);
    gem.rotation.x = Math.PI / 2;
    gem.position.z = 0.1;
    charm.add(bezel, seat, gem);

    const prongGeo = new THREE.SphereGeometry(0.021, 10, 8);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const pr = new THREE.Mesh(prongGeo, charmGold);
      pr.position.set(Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0.1);
      charm.add(pr);
    }
    twinkle(charm, 0, 0, 0.2, 0.9, 0);

    charm.scale.setScalar(0.42);
    charm.position.y = -0.37;
    const charmPivot = new THREE.Group();
    charmPivot.position.copy(curve.getPointAt(0.5));
    const jump = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.0075, 8, 20), charmGold);
    jump.position.y = -0.04;
    jump.rotation.y = Math.PI / 2.4;
    charmPivot.add(jump, charm);
    jewel.add(charmPivot);
    swayers.push({ g: charmPivot, ph: 0.6, amp: 0.035 });

    // ---------- Golden Stardust Particles ----------
    const sp = [];
    for (let i = 0; i < 180; i++) {
      const r = 1.4 + Math.random() * 2.4, a = Math.random() * 6.283;
      sp.push(Math.cos(a) * r, (Math.random() - 0.5) * 3.6, Math.sin(a) * r);
    }
    const dustMat = new THREE.PointsMaterial({
      map: starTex,
      size: 0.09,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xffd98a,
    });
    const dust = new THREE.Points(
      new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(sp, 3)),
      dustMat
    );
    scene.add(dust);

    // ---------- Drag-to-spin with Inertia Interaction ----------
    let dragging = false, lx = 0, ly = 0, vx = 0, vy = 0, swayS = 0;
    const dom = renderer.domElement;
    const qx = new THREE.Quaternion(), qy = new THREE.Quaternion();

    const rot = () => {
      spin.quaternion
        .premultiply(qx.setFromAxisAngle(AXx, vy))
        .premultiply(qy.setFromAxisAngle(AXy, vx));
    };

    const down = (e) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      dom.setPointerCapture(e.pointerId);
      dom.style.cursor = "grabbing";
    };

    const move = (e) => {
      if (!dragging) return;
      vx = (e.clientX - lx) * 0.009;
      vy = (e.clientY - ly) * 0.009;
      lx = e.clientX;
      ly = e.clientY;
      rot();
    };

    const up = () => {
      dragging = false;
      dom.style.cursor = "grab";
    };

    dom.addEventListener("pointerdown", down);
    dom.addEventListener("pointermove", move);
    dom.addEventListener("pointerup", up);
    dom.addEventListener("pointercancel", up);

    // Dynamic Responsive Resize
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w / h < 0.85 ? 9.0 : w < 640 ? 7.0 : 7.2;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    // ---------- Main Animation Loop with Craft Process Lerp ----------
    const clock = new THREE.Clock();
    const qt = new THREE.Quaternion();
    const eu = new THREE.Euler();
    spin.rotation.set(-0.35, 0.35, 0);

    // Interpolation state variables for seamless 60fps transitions
    let curDisperse = 0;
    let curGoldScale = 1;
    let curChainScale = 1;
    let curCharmScale = 1;
    let curTiltX = -0.35;
    let curTiltY = 0.35;

    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      // Read current dynamic view & step
      const { currentView: cv, activeStep: as } = stateRef.current;
      const isProcess = cv === "process";

      let targetDisperse = 0.0;
      let targetGoldScale = 1.0;
      let targetChainScale = 1.0;
      let targetCharmScale = 1.0;
      let targetTiltX = -0.35;
      let targetTiltY = 0.35;
      let targetStardust = 1.0;

      if (isProcess) {
        if (as === 0) {
          // STEP 01: MINERAL SOURCING (Raw hand-graded crystals floating in inspection array)
          targetDisperse = 1.0;     // Crystals separate and float freely
          targetGoldScale = 0.0;     // Gold rondelles not yet introduced
          targetChainScale = 0.0;    // Chains not attached
          targetCharmScale = 0.0;    // Charm not cast
          targetTiltX = -0.06;
          targetTiltY = 0.15;
          targetStardust = 0.4;
        } else if (as === 1) {
          // STEP 02: HAND ASSEMBLY (Silk knotting + 18K gold rondelle spacers)
          targetDisperse = 0.0;     // Crystals drawn together into circular ring
          targetGoldScale = 1.0;     // Gold spacers locked into place
          targetChainScale = 0.0;    // Charms & chains not yet attached
          targetCharmScale = 0.0;
          targetTiltX = -0.42;       // Tilted angle to inspect stringing craftsmanship
          targetTiltY = 0.48;
          targetStardust = 0.7;
        } else if (as === 2) {
          // STEP 03: PRESERVED ART (Botanical Sakura Charm & draped chains attachment)
          targetDisperse = 0.0;
          targetGoldScale = 1.0;
          targetChainScale = 1.0;    // Chains & teardrops drop into place
          targetCharmScale = 1.25;   // Sakura blossom charm prominently showcased
          targetTiltX = 0.12;        // Tilts forward so the sakura flower faces the viewer directly
          targetTiltY = 0.02;
          targetStardust = 0.9;
        } else {
          // STEP 04: READY TO GIFT (The completed luxury heirloom)
          targetDisperse = 0.0;
          targetGoldScale = 1.0;
          targetChainScale = 1.0;
          targetCharmScale = 1.0;
          targetTiltX = -0.35;
          targetTiltY = 0.35;
          targetStardust = 1.2;
        }
      }

      // Smooth frame-by-frame lerp (buttery smooth 60fps interpolation)
      const lerpSpeed = 0.07;
      curDisperse += (targetDisperse - curDisperse) * lerpSpeed;
      curGoldScale += (targetGoldScale - curGoldScale) * lerpSpeed;
      curChainScale += (targetChainScale - curChainScale) * lerpSpeed;
      curCharmScale += (targetCharmScale - curCharmScale) * lerpSpeed;
      curTiltX += (targetTiltX - curTiltX) * lerpSpeed;
      curTiltY += (targetTiltY - curTiltY) * lerpSpeed;

      // Update crystal beads and gold rondelles
      items.forEach((it) => {
        if (it.k === "G") {
          it.g.scale.setScalar(Math.max(0.0001, curGoldScale));
          it.g.visible = curGoldScale > 0.02;
        } else {
          it.g.position.lerpVectors(it.ringPos, it.dispersedPos, curDisperse);
          if (curDisperse > 0.08) {
            it.g.rotation.y += 0.012;
            it.g.rotation.x += 0.008;
          } else {
            it.g.rotation.z = it.ringRotZ;
          }
        }
      });

      // Update accessory groups (chain, teardrops, sakura charm)
      chainGroup.scale.setScalar(Math.max(0.0001, curChainScale));
      chainGroup.visible = curChainScale > 0.02;

      teardropsGroup.scale.setScalar(Math.max(0.0001, curChainScale));
      teardropsGroup.visible = curChainScale > 0.02;

      charmPivot.scale.setScalar(Math.max(0.0001, curCharmScale));
      charmPivot.visible = curCharmScale > 0.02;

      // Drag inertia
      if (dragging) {
        vx *= 0.9;
        vy *= 0.9;
      } else if (Math.abs(vx) + Math.abs(vy) > 0.0008) {
        rot();
        vx *= 0.95;
        vy *= 0.95;
      } else if (!reduce) {
        if (isProcess && (as === 0 || as === 2)) {
          // Focused inspection angle with gentle breathing motion
          eu.set(curTiltX + Math.sin(t * 0.6) * 0.04, curTiltY + Math.sin(t * 0.4) * 0.12, 0);
          spin.quaternion.slerp(qt.setFromEuler(eu), 0.04);
        } else {
          // Idle sway & gentle rotation
          eu.set(curTiltX + Math.sin(t * 0.5) * 0.08, curTiltY + Math.sin(t * 0.35) * 0.35, 0);
          spin.quaternion.slerp(qt.setFromEuler(eu), 0.03);
        }
      }

      // Physics sway for teardrops & sakura flower charm
      swayS += (THREE.MathUtils.clamp(vx * 4, -0.6, 0.6) - swayS) * 0.1;
      swayers.forEach((s) => {
        s.g.rotation.z = (reduce ? 0 : Math.sin(t * 1.4 + s.ph) * s.amp) - swayS * 0.5;
      });

      // Crystal & Charm Twinkle Sparkles
      twinklers.forEach((w) => {
        const k = Math.pow(Math.max(0, Math.sin(t * 2.2 + w.phase * 2)), 3);
        w.s.scale.setScalar(w.size * 0.12 * (0.3 + k * 1.6));
        w.s.material.opacity = 0.15 + 0.85 * k;
      });

      // Levitating Float & Golden Dust Motion
      if (!reduce) {
        root.position.y = Math.sin(t * 1.1) * 0.09;
        root.rotation.z = Math.sin(t * 0.8) * 0.02;
        dust.rotation.y = t * 0.05;
        dust.position.y = Math.sin(t * 0.6) * 0.12;
        dustMat.opacity = (0.7 + Math.sin(t * 2.4) * 0.25) * targetStardust;
      }

      // Moving light specular highlight
      glint.position.set(Math.cos(t * 0.6) * 3.2, Math.sin(t * 0.45) * 2.2, 3.5);

      renderer.render(scene, camera);
    };
    tick();

    // ---------- Cleanup On Unmount ----------
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      dom.removeEventListener("pointerdown", down);
      dom.removeEventListener("pointermove", move);
      dom.removeEventListener("pointerup", up);
      dom.removeEventListener("pointercancel", up);
      scene.traverse((o) => {
        o.geometry?.dispose();
        [].concat(o.material || []).forEach((m) => m.dispose());
      });
      enamelTex.dispose();
      starTex.dispose();
      scene.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (dom.parentNode === el) el.removeChild(dom);
    };
  }, []);

  const getHintText = () => {
    if (currentView === "process") {
      switch (activeStep) {
        case 0:
          return "Step 01 • Hand-Graded Healing Crystals • Drag to Inspect Raw Gems";
        case 1:
          return "Step 02 • Artisanal Silk Knotting • Assembling Crystals & 18K Gold Rondelles";
        case 2:
          return "Step 03 • Botanical Sakura Charm • Hand-Cast Flower & Draped Chains";
        case 3:
          return "Step 04 • Ready to Gift • Complete Handcrafted Heirloom";
        default:
          return "The Craft Process • Drag to Inspect";
      }
    }
    return "360° Sakura Blossom Bracelet • Drag to Spin";
  };

  return (
    <div className="relative w-full max-w-[720px] h-[310px] sm:h-[430px] lg:h-[520px] mx-auto flex items-center justify-center select-none">
      {/* 1. Luxury Atelier Radial Aura (Warm Rose & Champagne halo for 100% contrast against light website background) */}
      <div 
        className="absolute inset-0 pointer-events-none transform scale-95"
        style={{
          background: "radial-gradient(circle at 50% 48%, rgba(245, 206, 215, 0.72) 0%, rgba(240, 195, 205, 0.48) 35%, rgba(235, 212, 195, 0.25) 58%, transparent 74%)",
        }}
      />

      {/* 2. Soft Ground Contact Shadow (Under the floating bracelet for real 3D depth) */}
      <div className="absolute bottom-8 w-52 sm:w-80 h-6 sm:h-7 rounded-[100%] bg-[#735149]/16 blur-xl pointer-events-none transform scale-y-75" />
      <div className="absolute bottom-10 w-36 sm:w-56 h-3.5 sm:h-4 rounded-[100%] bg-[#5c3e38]/18 blur-md pointer-events-none" />

      {/* 3. The 3D WebGL Canvas Container (100% transparent background) */}
      <div
        ref={mountRef}
        className={`w-full h-full relative ${className}`}
        style={{
          background: "transparent",
          ...style,
        }}
        role="img"
        aria-label="Interactive 3D pink crystal bracelet with a sakura flower charm. Drag to rotate."
      />

      {/* 4. 360° Drag Hint Pill (Dynamically updates per step!) */}
      <div className="absolute bottom-2 z-20 max-w-[94%] text-center inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/95 border border-gold-400/50 text-[9px] sm:text-[10px] uppercase tracking-[0.09em] sm:tracking-[0.2em] font-bold text-espresso shadow-md pointer-events-none transition-all duration-300 leading-tight">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
        <span>{getHintText()}</span>
      </div>
    </div>
  );
}
