import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";

/**
 * Interactive 3D Sculpted Crystal Heart & Gyroscopic Orbital Gold Rings for Auth Showcase.
 * Dynamically reacts to:
 * - mode: 'login' | 'register' | 'forgot'
 * - focusedField: 'none' | 'email' | 'password' | 'name' | 'phone'
 * - authSuccess: triggers joyful golden bloom & spin
 * Supports mouse parallax & 360-degree pointer drag-to-spin with inertia.
 */

const lathePts = (profile, seg) => {
  const pts = [];
  profile.forEach(([r, y], k) => {
    if (r < 1e-4) return pts.push(new THREE.Vector3(0, y, 0));
    for (let j = 0; j < seg; j++) {
      const a = ((j + (k % 2) * 0.5) / seg) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
  });
  return pts;
};

const cutGem = (profile, seg) => new ConvexGeometry(lathePts(profile, seg));
const BRILLIANT = [[0, 0.34], [0.58, 0.34], [0.85, 0.16], [1, 0], [0.45, -0.38], [0, -0.78]];

function buildAtelierEnv() {
  const s = new THREE.Scene();
  s.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(40, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        vertexShader:
          "varying vec3 vP; void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
        fragmentShader: `varying vec3 vP; void main(){float h=vP.y*.5+.5;
          vec3 bot=vec3(.94,.72,.68)*.75, mid=vec3(.98,.85,.86)*.9, top=vec3(1.,.95,.88)*1.25;
          vec3 c=mix(bot,mid,smoothstep(0.,.5,h)); c=mix(c,top,smoothstep(.5,1.,h)); gl_FragColor=vec4(c,1.);}`,
      })
    )
  );
  const panel = (w, h, hex, k, x, y, z) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(hex).multiplyScalar(k),
        side: THREE.DoubleSide,
        toneMapped: false,
      })
    );
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    s.add(m);
  };
  panel(12, 12, 0xfff3de, 6, 0, 12, 3);
  panel(6, 10, 0xffd59b, 7, -10, 4, 8);
  panel(6, 10, 0xff9ec5, 5, 10, 2, 6);
  panel(3, 12, 0xffcf70, 8, 0, 5, -12);
  for (let i = 0; i < 14; i++) {
    const a = i * 2.399;
    const y = Math.sin(i * 1.5) * 8;
    panel(0.75, 0.75, 0xffffff, 26, Math.cos(a) * 11, y, Math.sin(a) * 11);
  }
  return s;
}

function Auth3DCanvas({
  mode = "login",
  focusedField = "none",
  authSuccess = false,
}) {
  const mountRef = useRef(null);
  const propRef = useRef({ mode, focusedField, authSuccess });

  useEffect(() => {
    propRef.current = { mode, focusedField, authSuccess };
  }, [mode, focusedField, authSuccess]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    // Cap DPR at 1.5 for crisp visuals at locked 60fps across retina laptops
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText =
      "display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab;outline:none;";

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(buildAtelierEnv(), 0.02).texture;

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    camera.position.set(0, 0, 6.8);

    const key = new THREE.DirectionalLight(0xffe0b2, 2.1);
    key.position.set(3, 4, 5);
    const fill = new THREE.PointLight(0xff6b9d, 14, 12);
    fill.position.set(-4, -1, 3);
    const rim = new THREE.DirectionalLight(0xffd066, 2.4);
    rim.position.set(-2, 3, -5);
    const glint = new THREE.PointLight(0xffffff, 24, 10);
    const ambient = new THREE.AmbientLight(0xffe8ef, 0.55);
    scene.add(key, fill, rim, glint, ambient);

    const phys = (p) => new THREE.MeshPhysicalMaterial(p);

    // High-IOR translucent crystal with iridescent sparkle (fast single-pass, zero heavy transmission FBO stalls)
    const roseCrystalMat = phys({
      color: 0xf46297,
      emissive: 0xa0164b,
      emissiveIntensity: 0.26,
      roughness: 0.04,
      metalness: 0.08,
      ior: 1.78,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      iridescence: 0.72,
      iridescenceIOR: 1.48,
      transparent: true,
      opacity: 0.9,
      envMapIntensity: 2.3,
    });

    const goldMat = phys({
      color: 0xf4c945,
      metalness: 0.94,
      roughness: 0.14,
      envMapIntensity: 2.3,
      emissive: 0x825100,
      emissiveIntensity: 0.32,
      clearcoat: 0.45,
    });

    const pearlMat = phys({
      color: 0xfefaf4,
      roughness: 0.14,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      iridescence: 0.85,
      iridescenceIOR: 1.38,
      sheen: 0.5,
      sheenColor: new THREE.Color(0xffd9e5),
    });

    const diamondMat = phys({
      color: 0xffffff,
      roughness: 0.02,
      metalness: 0.18,
      ior: 2.42,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      iridescence: 0.95,
      iridescenceIOR: 1.8,
      envMapIntensity: 3.1,
      flatShading: true,
    });

    // Starlight Sprite Texture
    const sc = document.createElement("canvas");
    sc.width = sc.height = 64;
    const sx = sc.getContext("2d");
    const sg = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
    sg.addColorStop(0, "rgba(255,255,255,1)");
    sg.addColorStop(0.18, "rgba(255,236,195,.75)");
    sg.addColorStop(1, "rgba(255,220,160,0)");
    sx.fillStyle = sg;
    sx.fillRect(0, 0, 64, 64);
    sx.fillStyle = "rgba(255,255,255,.92)";
    sx.fillRect(31, 2, 2, 60);
    sx.fillRect(2, 31, 60, 2);
    const starTex = new THREE.CanvasTexture(sc);

    const twinklers = [];
    const twinkle = (parent, x, y, z, size, phase) => {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: starTex,
          color: 0xfff5db,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      s.position.set(x, y, z);
      parent.add(s);
      twinklers.push({ s, size, phase });
    };

    // Scene hierarchy
    const root = new THREE.Group();
    const spin = new THREE.Group();
    root.add(spin);
    scene.add(root);

    // ---------- 1. Central Sculpted Crystal Heart Medallion ----------
    const heartGroup = new THREE.Group();
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, -0.58);
    heartShape.bezierCurveTo(0.05, -0.58, 0.78, -0.14, 0.78, 0.32);
    heartShape.bezierCurveTo(0.78, 0.66, 0.36, 0.74, 0, 0.42);
    heartShape.bezierCurveTo(-0.36, 0.74, -0.78, 0.66, -0.78, 0.32);
    heartShape.bezierCurveTo(-0.78, -0.14, -0.05, -0.58, 0, -0.58);

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.24,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.12,
      bevelThickness: 0.14,
      curveSegments: 22,
    });
    heartGeo.computeBoundingBox();
    const rawCenter = new THREE.Vector3();
    heartGeo.boundingBox.getCenter(rawCenter);
    heartGeo.center();

    const heartMesh = new THREE.Mesh(heartGeo, roseCrystalMat);
    heartMesh.scale.setScalar(0.88);
    heartGroup.add(heartMesh);

    // Outer 18K Gold Rim Wire & Pavé Diamonds hugging the beveled heart bezel
    const frameCurvePts = heartShape
      .getSpacedPoints(64)
      .map((v) => new THREE.Vector3(v.x * 1.02, (v.y - rawCenter.y) * 1.02, 0));
    const frameCurve = new THREE.CatmullRomCurve3(frameCurvePts, true);
    const frameGeo = new THREE.TubeGeometry(frameCurve, 96, 0.04, 10, true);
    const frameMesh = new THREE.Mesh(frameGeo, goldMat);
    heartGroup.add(frameMesh);

    const diamondGeo = cutGem(BRILLIANT, 8);
    // Crown Diamonds seated visibly along upper heart curves on front & back bevels
    [0.24, 0.3, 0.36, 0.64, 0.7, 0.76].forEach((u, idx) => {
      const pt = frameCurve.getPointAt(u);
      const dm = new THREE.Mesh(diamondGeo, diamondMat);
      dm.scale.setScalar(0.055);
      dm.position.set(pt.x * 0.92, pt.y * 0.92, 0.22);
      dm.rotation.x = Math.PI / 2;
      heartGroup.add(dm);

      const dmBack = dm.clone();
      dmBack.position.z = -0.22;
      dmBack.rotation.x = -Math.PI / 2;
      heartGroup.add(dmBack);

      if (idx % 2 === 0) {
        twinkle(heartGroup, pt.x * 0.92, pt.y * 0.92, 0.3, 0.45, idx * 1.4);
      }
    });

    // Gold Bale Loop at Heart Top Cleft
    const bale = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.028, 10, 28), goldMat);
    bale.position.set(0, (0.42 - rawCenter.y) * 0.95 + 0.1, 0);
    bale.rotation.y = Math.PI / 2;
    heartGroup.add(bale);

    twinkle(heartGroup, 0.18, 0.12, 0.34, 0.85, 0.2);
    spin.add(heartGroup);

    // ---------- 2. Dual Gyroscopic 18K Gold Orbital Rings ----------
    const innerRingGroup = new THREE.Group();
    const innerTorus = new THREE.Mesh(
      new THREE.TorusGeometry(1.22, 0.028, 16, 96),
      goldMat
    );
    innerRingGroup.add(innerTorus);

    // Alternating Baroque Pearls & Rose Facet Gems around inner orbital ring
    const pearlGeo = new THREE.SphereGeometry(0.068, 24, 20);
    const ringGemGeo = cutGem(BRILLIANT, 10);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const isPearl = i % 2 === 0;
      const orb = new THREE.Mesh(
        isPearl ? pearlGeo : ringGemGeo,
        isPearl ? pearlMat : diamondMat
      );
      if (!isPearl) orb.scale.setScalar(0.065);
      orb.position.set(Math.cos(a) * 1.22, Math.sin(a) * 1.22, 0);
      innerRingGroup.add(orb);
    }
    innerRingGroup.rotation.set(0.55, 0.3, 0);
    spin.add(innerRingGroup);

    const outerRingGroup = new THREE.Group();
    const outerTorus = new THREE.Mesh(
      new THREE.TorusGeometry(1.62, 0.018, 12, 110),
      goldMat
    );
    outerRingGroup.add(outerTorus);

    // 4 Compass Diamond Prisms on Outer Orbit
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const prism = new THREE.Mesh(ringGemGeo, roseCrystalMat);
      prism.scale.set(0.075, 0.11, 0.075);
      prism.position.set(Math.cos(a) * 1.62, Math.sin(a) * 1.62, 0);
      prism.rotation.z = a;
      outerRingGroup.add(prism);
      twinkle(outerRingGroup, Math.cos(a) * 1.62, Math.sin(a) * 1.62, 0.08, 0.35, i * 1.7);
    }
    outerRingGroup.rotation.set(-0.48, -0.35, 0);
    spin.add(outerRingGroup);

    // ---------- 3. Floating Golden Stardust Cloud ----------
    const sp = [];
    for (let i = 0; i < 190; i++) {
      const r = 1.25 + Math.random() * 2.2;
      const a = Math.random() * Math.PI * 2;
      sp.push(Math.cos(a) * r, (Math.random() - 0.5) * 3.5, Math.sin(a) * r);
    }
    const dustMat = new THREE.PointsMaterial({
      map: starTex,
      size: 0.085,
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

    // ---------- 4. Pointer Drag-to-Spin + Hover Parallax ----------
    let dragging = false;
    let lx = 0;
    let ly = 0;
    let vx = 0;
    let vy = 0;
    let hoverX = 0;
    let hoverY = 0;
    const dom = renderer.domElement;
    const AXx = new THREE.Vector3(1, 0, 0);
    const AXy = new THREE.Vector3(0, 1, 0);
    const qx = new THREE.Quaternion();
    const qy = new THREE.Quaternion();

    const applySpinDelta = (dx, dy) => {
      spin.quaternion
        .premultiply(qx.setFromAxisAngle(AXx, dy))
        .premultiply(qy.setFromAxisAngle(AXy, dx));
    };

    const down = (e) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      dom.setPointerCapture(e.pointerId);
      dom.style.cursor = "grabbing";
    };

    const move = (e) => {
      const rect = dom.getBoundingClientRect();
      hoverX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.45;
      hoverY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.35;
      if (!dragging) return;
      vx = (e.clientX - lx) * 0.009;
      vy = (e.clientY - ly) * 0.009;
      lx = e.clientX;
      ly = e.clientY;
      applySpinDelta(vx, vy);
    };

    const up = () => {
      dragging = false;
      dom.style.cursor = "grab";
    };

    dom.addEventListener("pointerdown", down);
    dom.addEventListener("pointermove", move);
    dom.addEventListener("pointerup", up);
    dom.addEventListener("pointercancel", up);

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w / h < 0.85 ? 8.2 : w < 640 ? 6.4 : 6.6;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    // ---------- 5. Animation Loop (Reacts to Mode, Password Vault Focus, & Success) ----------
    const clock = new THREE.Clock();
    const qt = new THREE.Quaternion();
    const eu = new THREE.Euler();

    let curRingSpread = 1.0;
    let curInnerTilt = 0.55;
    let curOuterTilt = -0.48;
    let curSuccessBoost = 0;

    let raf;
    let paused = false;
    const onVisibility = () => {
      paused = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (paused) return;
      const t = clock.getElapsedTime();
      const { mode: m, focusedField: ff, authSuccess: succ } = propRef.current;

      // Password Privacy Shield: orbital rings align protectively in front when typing password
      const isPasswordFocus = ff === "password";
      const isRegister = m === "register";
      const isForgot = m === "forgot";

      const targetSpread = succ ? 1.24 : isRegister ? 1.12 : isPasswordFocus ? 0.92 : 1.0;
      const targetInnerTilt = isPasswordFocus ? 0.08 : isRegister ? 0.82 : isForgot ? 0.35 : 0.55;
      const targetOuterTilt = isPasswordFocus ? -0.08 : isRegister ? -0.78 : isForgot ? -0.25 : -0.48;
      const targetSuccessBoost = succ ? 1 : 0;

      curRingSpread += (targetSpread - curRingSpread) * 0.06;
      curInnerTilt += (targetInnerTilt - curInnerTilt) * 0.06;
      curOuterTilt += (targetOuterTilt - curOuterTilt) * 0.06;
      curSuccessBoost += (targetSuccessBoost - curSuccessBoost) * 0.08;

      innerRingGroup.scale.setScalar(curRingSpread);
      outerRingGroup.scale.setScalar(curRingSpread);

      // Smooth orbital rotations
      const orbitSpeed = isRegister ? 0.52 : isPasswordFocus ? 0.95 : 0.32;
      if (!reduce) {
        innerRingGroup.rotation.x = curInnerTilt + Math.sin(t * 0.7) * 0.08;
        innerRingGroup.rotation.z = t * orbitSpeed;
        innerRingGroup.rotation.y = Math.cos(t * 0.5) * 0.25;

        outerRingGroup.rotation.x = curOuterTilt + Math.cos(t * 0.6) * 0.08;
        outerRingGroup.rotation.z = -t * (orbitSpeed * 0.72);
        outerRingGroup.rotation.y = Math.sin(t * 0.45) * 0.25;

        // Subtle celebratory spin on heart
        heartGroup.rotation.y = Math.sin(t * 0.75) * 0.28 + curSuccessBoost * Math.PI * 2;
        heartGroup.scale.setScalar(1 + Math.sin(t * 2.2) * 0.02 + curSuccessBoost * 0.14);
      }

      // Emissive warm reaction on password shield
      roseCrystalMat.emissiveIntensity = isPasswordFocus ? 0.42 : 0.22 + curSuccessBoost * 0.3;

      // Drag inertia vs parallax float
      if (dragging) {
        vx *= 0.9;
        vy *= 0.9;
      } else if (Math.abs(vx) + Math.abs(vy) > 0.0008) {
        applySpinDelta(vx, vy);
        vx *= 0.95;
        vy *= 0.95;
      } else if (!reduce) {
        eu.set(
          -0.1 + hoverY + Math.sin(t * 0.5) * 0.05,
          hoverX + Math.sin(t * 0.35) * 0.25,
          0
        );
        spin.quaternion.slerp(qt.setFromEuler(eu), 0.03);
      }

      // Levitation & Dust
      if (!reduce) {
        root.position.y = Math.sin(t * 1.15) * 0.09;
        dust.rotation.y = t * (isRegister ? 0.14 : 0.06);
        dust.position.y = Math.sin(t * 0.65) * 0.12;
        dustMat.opacity = (0.65 + Math.sin(t * 2.3) * 0.25) * (1 + curSuccessBoost * 0.4);
      }

      twinklers.forEach((w) => {
        const k = Math.pow(Math.max(0, Math.sin(t * 2.4 + w.phase * 2)), 3);
        w.s.scale.setScalar(w.size * 0.14 * (0.35 + k * 1.6));
        w.s.material.opacity = 0.18 + 0.82 * k;
      });

      glint.position.set(Math.cos(t * 0.7) * 3.4, Math.sin(t * 0.5) * 2.2, 3.6);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      dom.removeEventListener("pointerdown", down);
      dom.removeEventListener("pointermove", move);
      dom.removeEventListener("pointerup", up);
      dom.removeEventListener("pointercancel", up);
      scene.traverse((o) => {
        o.geometry?.dispose();
        [].concat(o.material || []).forEach((m) => m.dispose());
      });
      starTex.dispose();
      scene.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (dom.parentNode === el) el.removeChild(dom);
    };
  }, []);

  const getBadgeText = () => {
    if (authSuccess) return "Welcome to AURA Atelier • Access Granted ✨";
    if (focusedField === "password") return "Vault Shield Active • 256-Bit Encrypted Entry";
    if (mode === "register") return "360° Crystal Heart Emblem • Drag to Spin";
    if (mode === "forgot") return "Atelier Account Recovery • Drag to Spin";
    return "360° Royal Rose Crystal Emblem • Drag to Spin";
  };

  return (
    <div className="relative w-full h-[230px] sm:h-[320px] lg:h-[520px] flex items-center justify-center select-none">
      {/* Warm Rose & Champagne Glow Halo (Pure gradient, no heavy GPU blur recomposition) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 48%, rgba(245, 206, 215, 0.72) 0%, rgba(243, 215, 175, 0.42) 38%, rgba(235, 212, 195, 0.14) 62%, transparent 76%)",
        }}
      />

      {/* Contact Shadow */}
      <div className="absolute bottom-8 sm:bottom-14 w-44 sm:w-56 h-4 sm:h-5 rounded-[100%] bg-[#735149]/16 blur-lg pointer-events-none" />

      {/* Transparent WebGL Mount */}
      <div
        ref={mountRef}
        className="w-full h-full relative"
        style={{ background: "transparent" }}
        role="img"
        aria-label="Interactive 3D Crystal Heart and Golden Orbital Rings Jewellery Emblem"
      />

      {/* Interactive Status Pill */}
      <div className="absolute bottom-2 sm:bottom-4 z-20 max-w-[92%] text-center inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/95 border border-gold-400/50 text-[9px] sm:text-[10px] uppercase tracking-[0.09em] sm:tracking-[0.2em] font-bold text-espresso shadow-md pointer-events-none transition-all duration-300 leading-tight">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            focusedField === "password"
              ? "bg-amber-500 animate-pulse"
              : "bg-emerald-500 animate-ping"
          }`}
        />
        <span>{getBadgeText()}</span>
      </div>
    </div>
  );
}

export default React.memo(Auth3DCanvas);
