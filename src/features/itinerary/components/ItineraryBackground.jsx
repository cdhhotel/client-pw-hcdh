import React, { useEffect, useRef } from 'react';

// const THEMES = {
//   COMIDA: {
//     bg: [14, 9, 4, 0.26], // #0e090486
//     accent: [232, 96, 38, 0.26], // terracotta orange
//     waveColors: [
//       { h: 20, s: 70, l: 20, o: 0.65 },
//       { h: 24, s: 72, l: 24, o: 0.55 },
//       { h: 21, s: 68, l: 28, o: 0.45 },
//       { h: 27, s: 65, l: 32, o: 0.35 },
//       { h: 19, s: 60, l: 36, o: 0.25 }
//     ]
//   },
//   ATRACCIONES: {
//     bg: [2, 9, 4, 0.26], // #02090486
//     accent: [110, 115, 86, 0.26], // sage green
//     waveColors: [
//       { h: 72, s: 30, l: 24, o: 0.60 },
//       { h: 75, s: 35, l: 28, o: 0.50 },
//       { h: 78, s: 32, l: 32, o: 0.40 },
//       { h: 70, s: 28, l: 36, o: 0.30 },
//       { h: 76, s: 25, l: 40, o: 0.20 }
//     ]
//   },
//   EVENTOS: {
//     bg: [10, 6, 2, 0.26], // #0a060286
//     accent: [238, 162, 24, 0.26], // amber gold
//     waveColors: [
//       { h: 38, s: 85, l: 20, o: 0.60 },
//       { h: 42, s: 90, l: 24, o: 0.50 },
//       { h: 35, s: 82, l: 28, o: 0.40 },
//       { h: 45, s: 78, l: 32, o: 0.30 },
//       { h: 40, s: 75, l: 36, o: 0.20 }
//     ]
//   },
//   SALUD: {
//     bg: [15, 5, 5, 0.26], // #0f050586
//     accent: [152, 22, 42, 0.26], // burgundy
//     waveColors: [
//       { h: 350, s: 65, l: 18, o: 0.60 },
//       { h: 355, s: 70, l: 22, o: 0.50 },
//       { h: 348, s: 62, l: 26, o: 0.40 },
//       { h: 358, s: 58, l: 30, o: 0.30 },
//       { h: 352, s: 54, l: 34, o: 0.20 }
//     ]
//   },
//   TOURS: {
//     bg: [4, 10, 20, 0.26], // deep blue
//     accent: [74, 111, 165, 0.26], // blue accent
//     waveColors: [
//       { h: 210, s: 50, l: 20, o: 0.60 },
//       { h: 215, s: 55, l: 24, o: 0.50 },
//       { h: 208, s: 48, l: 28, o: 0.40 },
//       { h: 218, s: 45, l: 32, o: 0.30 },
//       { h: 212, s: 40, l: 36, o: 0.20 }
//     ]
//   },
//   OTRAS: {
//     bg: [10, 10, 10, 0.26], // dark gray
//     accent: [99, 110, 114, 0.26], // gray accent
//     waveColors: [
//       { h: 200, s: 10, l: 20, o: 0.60 },
//       { h: 200, s: 8, l: 24, o: 0.50 },
//       { h: 200, s: 12, l: 28, o: 0.40 },
//       { h: 200, s: 6, l: 32, o: 0.30 },
//       { h: 200, s: 10, l: 36, o: 0.20 }
//     ]
//   }
// };

export const ItineraryBackground = ({ category }) => {
};
// export const ItineraryBackground = ({ category }) => {
//   const canvasRef = useRef(null);
//   const containerRef = useRef(null);
//   const categoryRef = useRef(category);

//   // Mantener actualizada la categoría actual sin re-ejecutar el useEffect de animación
//   useEffect(() => {
//     categoryRef.current = category;
//   }, [category]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');

//     let W = window.innerWidth;
//     let H = window.innerHeight;

//     const resize = () => {
//       if (!canvas) return;
//       W = canvas.width = window.innerWidth;
//       H = canvas.height = window.innerHeight;
//     };

//     window.addEventListener('resize', resize, { passive: true });
//     resize();

//     // Mouse and Drag state
//     let mx = 0.5, my = 0.5, rmx = 0.5, rmy = 0.5;
//     let pmx = 0.5, pmy = 0.5, mvx = 0, mvy = 0;
//     let clickImpulse = 0, dragEnergy = 0;
//     let clickRipples = [];

//     // Initialize animation values interpolated from THEMES
//     const initialCat = categoryRef.current || 'COMIDA';
//     const activeTheme = THEMES[initialCat] || THEMES.COMIDA;
//     const current = {
//       bg: [...activeTheme.bg],
//       accent: [...activeTheme.accent],
//       waveColors: activeTheme.waveColors.map(wc => ({ ...wc })),
//       starAlpha: (initialCat === 'EVENTOS' || initialCat === 'TOURS') ? 1 : 0,
//       fireflyAlpha: (initialCat === 'ATRACCIONES' || initialCat === 'OTRAS') ? 1 : 0,
//       emberAlpha: (initialCat === 'COMIDA' || initialCat === 'SALUD') ? 1 : 0
//     };

//     // Particles and Stars
//     const stars = Array.from({ length: 80 }, (_, i) => ({
//       x: Math.random() * 2000,
//       y: Math.random() * 1200,
//       scale: 0.3 + Math.random() * 0.7,
//       phase: Math.random() * Math.PI * 2,
//       freq: 0.01 + Math.random() * 0.02
//     }));

//     const fireflies = Array.from({ length: 25 }, () => ({
//       x: Math.random() * 2000,
//       y: Math.random() * 1200,
//       vx: (Math.random() - 0.5) * 1.5,
//       vy: (Math.random() - 0.5) * 1.5,
//       radius: 1.5 + Math.random() * 2.5,
//       pulsePhase: Math.random() * Math.PI * 2
//     }));

//     // Event Handlers
//     const onMouseMove = (e) => {
//       pmx = mx;
//       pmy = my;
//       mx = e.clientX / window.innerWidth;
//       my = e.clientY / window.innerHeight;
//       mvx = (mx - pmx) * 30;
//       mvy = (my - pmy) * 30;
//     };

//     const onMouseDown = (e) => {
//       clickImpulse = 1.0;
//       clickRipples.push({
//         x: e.clientX / window.innerWidth,
//         y: e.clientY / window.innerHeight,
//         t: 0,
//         strength: 1.0
//       });
//       if (clickRipples.length > 5) clickRipples.shift();
//     };

//     document.addEventListener('mousemove', onMouseMove, { passive: true });
//     document.addEventListener('mousedown', onMouseDown, { passive: true });

//     // Helper math utilities
//     const lerp = (a, b, t) => a + (b - a) * t;

//     // Wave drawing helper
//     const drawWave = (ctx, t, yc, amp, fm, sp, phaseOffset, chaos, mouseAmp) => {
//       const yB = H * yc + H * (rmy - 0.5) * mouseAmp * 0.05;
//       ctx.beginPath();

//       // Optimizamos el paso a x += 20 (antes era x += 4) lo cual reduce cálculos de 480 a 96 iteraciones.
//       for (let x = 0; x <= W + 20; x += 20) {
//         const currentX = Math.min(x, W);
//         const nx = currentX / W;
//         const ph = t * sp;
//         const mouseWarp = (rmx - 0.5) * mouseAmp * amp * 0.4 * Math.sin(nx * Math.PI * 2 + 0.5);
//         const dragWarp = dragEnergy * amp * 0.25 * Math.sin(nx * Math.PI * 3 + t * 0.002);

//         let rippleWarp = 0;
//         for (const r of clickRipples) {
//           const dx = nx - r.x;
//           const dist = Math.abs(dx);
//           const wavefront = r.t * 0.65;
//           const spread = 0.12 + r.t * 0.18;
//           rippleWarp += r.strength * amp * 0.2 * Math.exp(-Math.pow(dist - wavefront, 2) / (spread * spread)) * Math.exp(-r.t * 0.8) * Math.sin((dist - wavefront) * 16);
//         }

//         let y = yB + mouseWarp + dragWarp + rippleWarp +
//           Math.sin(nx * Math.PI * 2 * fm + ph * 5) * amp +
//           Math.sin(nx * Math.PI * 3.5 * fm * 0.7 + ph * 3.5 + phaseOffset) * amp * 0.35;

//         if (chaos > 0.04) {
//           y += Math.sin(nx * Math.PI * 6 * fm + ph * 12) * amp * chaos * 0.4;
//         }

//         currentX === 0 ? ctx.moveTo(0, y) : ctx.lineTo(currentX, y);
//         if (x >= W) break;
//       }
//     };

//     // Foreground overlay wave
//     const drawForegroundWave = (t, [ar, ag, ab], alpha) => {
//       const yBase = H * (0.45 + rmy * 0.3);
//       const wAmp = H * 0.02 * (1 + rmx * 0.5) * (1 + dragEnergy * 0.5);

//       for (let layer = 0; layer < 3; layer++) {
//         const phOff = layer * 1.2;
//         ctx.beginPath();

//         // Optimizamos el paso a x += 20 (antes era x += 4)
//         for (let x = 0; x <= W + 20; x += 20) {
//           const currentX = Math.min(x, W);
//           const nx = currentX / W;
//           let y = yBase +
//             Math.sin(nx * Math.PI * 2 * (1 + rmx * 0.4) + t * 0.0002 + phOff) * wAmp +
//             Math.sin(nx * Math.PI * 3.2 + t * 0.00015 + phOff) * wAmp * 0.3;

//           for (const r of clickRipples) {
//             const dx = nx - r.x;
//             const wavefront = r.t * 0.6;
//             const spread = 0.1 + r.t * 0.15;
//             y += r.strength * H * 0.012 * Math.exp(-Math.pow(Math.abs(dx) - wavefront, 2) / (spread * spread)) * Math.exp(-r.t * 0.9) * Math.sin((Math.abs(dx) - wavefront) * 18);
//           }
//           currentX === 0 ? ctx.moveTo(0, y) : ctx.lineTo(currentX, y);
//           if (x >= W) break;
//         }
//         ctx.strokeStyle = `rgba(${ar},${ag},${ab},${(alpha - 0.01 * layer) * (0.4 + dragEnergy * 0.3 + clickImpulse * 0.2)})`;
//         ctx.lineWidth = 1.2 - layer * 0.2;
//         ctx.stroke();
//       }
//     };

//     let animFrameId = null;
//     let lastTime = 0;

//     const render = (time) => {
//       const dt = time - lastTime;
//       lastTime = time;
//       const t = time * 0.8;

//       // Interpolación suave hacia la categoría activa actual
//       const activeCat = categoryRef.current || 'COMIDA';
//       const targetTheme = THEMES[activeCat] || THEMES.COMIDA;

//       current.bg[0] = lerp(current.bg[0], targetTheme.bg[0], 0.03);
//       current.bg[1] = lerp(current.bg[1], targetTheme.bg[1], 0.03);
//       current.bg[2] = lerp(current.bg[2], targetTheme.bg[2], 0.03);
//       current.bg[3] = lerp(current.bg[3] !== undefined ? current.bg[3] : 1.0, targetTheme.bg[3] !== undefined ? targetTheme.bg[3] : 1.0, 0.03);

//       current.accent[0] = lerp(current.accent[0], targetTheme.accent[0], 0.03);
//       current.accent[1] = lerp(current.accent[1], targetTheme.accent[1], 0.03);
//       current.accent[2] = lerp(current.accent[2], targetTheme.accent[2], 0.03);
//       current.accent[3] = lerp(current.accent[3] !== undefined ? current.accent[3] : 1.0, targetTheme.accent[3] !== undefined ? targetTheme.accent[3] : 1.0, 0.03);

//       for (let i = 0; i < current.waveColors.length; i++) {
//         current.waveColors[i].h = lerp(current.waveColors[i].h, targetTheme.waveColors[i].h, 0.03);
//         current.waveColors[i].s = lerp(current.waveColors[i].s, targetTheme.waveColors[i].s, 0.03);
//         current.waveColors[i].l = lerp(current.waveColors[i].l, targetTheme.waveColors[i].l, 0.03);
//         current.waveColors[i].o = lerp(current.waveColors[i].o, targetTheme.waveColors[i].o, 0.03);
//       }

//       // Interpolación suave del canal alfa de las partículas
//       const targetStarAlpha = (activeCat === 'EVENTOS' || activeCat === 'TOURS') ? 1 : 0;
//       const targetFireflyAlpha = (activeCat === 'ATRACCIONES' || activeCat === 'OTRAS') ? 1 : 0;
//       const targetEmberAlpha = (activeCat === 'COMIDA' || activeCat === 'SALUD') ? 1 : 0;

//       current.starAlpha = lerp(current.starAlpha || 0, targetStarAlpha, 0.03);
//       current.fireflyAlpha = lerp(current.fireflyAlpha || 0, targetFireflyAlpha, 0.03);
//       current.emberAlpha = lerp(current.emberAlpha || 0, targetEmberAlpha, 0.03);

//       // Easing mouse smooth values
//       rmx += (mx - rmx) * 0.05;
//       rmy += (my - rmy) * 0.05;

//       clickImpulse *= 0.94;
//       dragEnergy = Math.max(0, dragEnergy * 0.95);
//       if (Math.abs(mvx) > 0.01 || Math.abs(mvy) > 0.01) {
//         dragEnergy = Math.min(dragEnergy + Math.sqrt(mvx * mvx + mvy * mvy) * 0.01, 1.0);
//       }
//       mvx *= 0.85;
//       mvy *= 0.85;

//       for (let i = clickRipples.length - 1; i >= 0; i--) {
//         clickRipples[i].t += 0.015;
//         if (clickRipples[i].t > 2.0) clickRipples.splice(i, 1);
//       }

//       // Limpiar y dibujar fondo
//       ctx.clearRect(0, 0, W, H);
//       const [br, bgVal, bb, ba = 1.0] = current.bg;
//       ctx.fillStyle = `rgba(${Math.round(br)},${Math.round(bgVal)},${Math.round(bb)},${ba})`;
//       ctx.fillRect(0, 0, W, H);

//       // Ambient radial gradient
//       const gradient = ctx.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.55, W * 0.7);
//       const [ar, ag, ab, aa = 1.0] = current.accent;
//       gradient.addColorStop(0, `rgba(${ar},${ag},${ab},${0.08 * aa})`);
//       gradient.addColorStop(0.5, `rgba(${ar},${ag},${ab},0.02)`);
//       gradient.addColorStop(1, 'transparent');
//       ctx.fillStyle = gradient;
//       ctx.fillRect(0, 0, W, H);

//       // Mouse interactive ambient glow
//       const mGlowX = W * rmx;
//       const mGlowY = H * rmy;
//       const mouseGlow = ctx.createRadialGradient(mGlowX, mGlowY, 0, mGlowX, mGlowY, W * (0.35 + dragEnergy * 0.15));
//       mouseGlow.addColorStop(0, `rgba(${ar},${ag},${ab},${0.05 + dragEnergy * 0.05})`);
//       mouseGlow.addColorStop(1, 'transparent');
//       ctx.fillStyle = mouseGlow;
//       ctx.fillRect(0, 0, W, H);

//       // Click ripple glows
//       for (const r of clickRipples) {
//         const cg = ctx.createRadialGradient(r.x * W, r.y * H, 0, r.x * W, r.y * H, W * 0.18 * r.strength);
//         cg.addColorStop(0, `rgba(${ar},${ag},${ab},${r.strength * 0.06 * Math.exp(-r.t * 1.5)})`);
//         cg.addColorStop(1, 'transparent');
//         ctx.fillStyle = cg;
//         ctx.fillRect(0, 0, W, H);
//       }

//       // Dibujar ondas de fondo
//       [
//         [0.80, 85, 0.78, 0.000045, 0.50],
//         [0.74, 70, 1.02, 0.000062, 0.42],
//         [0.68, 56, 1.28, 0.000085, 0.35],
//         [0.62, 44, 1.58, 0.000135, 0.28],
//         [0.56, 34, 1.98, 0.000135, 0.20]
//       ].forEach(([yc, a, fm, sp, opMultiplier], i) => {
//         const wc = current.waveColors[Math.min(i, current.waveColors.length - 1)];
//         drawWave(ctx, t, yc, a * (0.6 + dragEnergy * 0.3), fm, sp, i, dragEnergy * 0.1, 0.6);
//         ctx.lineTo(W, H);
//         ctx.lineTo(0, H);
//         ctx.closePath();

//         ctx.fillStyle = `hsla(${wc.h},${wc.s}%,${wc.l}%,${wc.o * opMultiplier})`;
//         ctx.fill();
//       });

//       // Dibujar Partículas
//       // 1. Estrellas
//       if (current.starAlpha > 0.01) {
//         stars.forEach(s => {
//           const twinkling = 0.3 + 0.7 * Math.abs(Math.sin(t * s.freq + s.phase));
//           const starX = (s.x + rmx * 30 * s.scale) % W;
//           const starY = (s.y + rmy * 20 * s.scale) % H;

//           ctx.beginPath();
//           ctx.arc(starX, starY, s.scale * 1.2, 0, Math.PI * 2);
//           ctx.fillStyle = `rgba(255, 235, 185, ${0.12 * twinkling * current.starAlpha})`;
//           ctx.fill();
//         });
//       }

//       // 2. Luciérnagas
//       if (current.fireflyAlpha > 0.01) {
//         fireflies.forEach(f => {
//           f.x += f.vx + mvx * 0.05;
//           f.y += f.vy + mvy * 0.05;

//           if (f.x < 0) f.x = W;
//           if (f.x > W) f.x = 0;
//           if (f.y < 0) f.y = H;
//           if (f.y > H) f.y = 0;

//           f.pulsePhase += 0.03;
//           const alpha = 0.15 + 0.35 * Math.abs(Math.sin(f.pulsePhase));

//           const radGrad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius * 3);
//           radGrad.addColorStop(0, `rgba(180, 195, 150, ${alpha * current.fireflyAlpha})`);
//           radGrad.addColorStop(0.4, `rgba(110, 115, 86, ${alpha * 0.3 * current.fireflyAlpha})`);
//           radGrad.addColorStop(1, 'transparent');

//           ctx.fillStyle = radGrad;
//           ctx.beginPath();
//           ctx.arc(f.x, f.y, f.radius * 3, 0, Math.PI * 2);
//           ctx.fill();
//         });
//       }

//       // 3. Brasas de calor
//       if (current.emberAlpha > 0.01) {
//         stars.slice(0, 30).forEach(s => {
//           const starX = (s.x + rmx * 20) % W;
//           const starY = (s.y - t * 0.02 * s.scale) % H;
//           const yPos = starY < 0 ? H + starY : starY;
//           const twinkling = 0.2 + 0.8 * Math.abs(Math.sin(t * s.freq * 0.5));

//           ctx.beginPath();
//           ctx.arc(starX, yPos, s.scale * 1.5, 0, Math.PI * 2);
//           ctx.fillStyle = `rgba(232, 96, 38, ${0.15 * twinkling * current.emberAlpha})`;
//           ctx.fill();
//         });
//       }

//       // Dibujar ondas frontales
//       drawForegroundWave(t, current.accent, 0.08);

//       animFrameId = requestAnimationFrame(render);
//     };

//     animFrameId = requestAnimationFrame(render);

//     return () => {
//       cancelAnimationFrame(animFrameId);
//       window.removeEventListener('resize', resize);
//       document.removeEventListener('mousemove', onMouseMove);
//       document.removeEventListener('mousedown', onMouseDown);
//     };
//   }, []);

//   return (
//     <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
//       <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />
//       <div id="grain" className="absolute inset-[-200%] w-[400%] h-[400%] pointer-events-none" style={{ zIndex: 4, opacity: 0.025 }} />
//       <div id="vig" className="absolute inset-0 pointer-events-none" style={{ zIndex: 5, background: 'radial-gradient(circle, transparent 25%, rgba(10,5,2,0.45) 100%)' }} />
//     </div>
//   );
// };

export default ItineraryBackground;
