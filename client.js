window.__ModuleLoader__.load({
  id: '@local/spacebar-goldenflow',
  factory: function (require) {
    const React = require('react');
    const h = React.createElement;

    /** Gap between two Space presses that still counts as one combo. */
    const TAP_WINDOW_MS = 320;
    /** How long the effect keeps running after the last Space press. */
    const HOLD_MS = { 1: 1600, 2: 2100 };
    /** Fade-out length after the hold expires. */
    const FADE_MS = 500;
    /** Ingots in the opening wave, and added by each further tap. */
    const BASE_INGOTS = 20;
    const WAVE_INGOTS = 10;
    /** Safety cap on rendered ingots for a very long combo. */
    const MAX_INGOTS = 888;

    const CSS = `
@property --sgg-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

.sgg-stage {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.sgg-stage--ending {
  animation: sgg-out 0.5s ease-in both;
}

/* one very short white-gold pop, then everything settles into shimmer */
.sgg-flash {
  position: absolute;
  inset: 0;
  background: radial-gradient(125% 115% at 50% 50%,
    rgba(255, 251, 232, 0.34) 0%,
    rgba(255, 224, 130, 0.26) 34%,
    rgba(255, 152, 20, 0.14) 66%,
    rgba(255, 120, 0, 0) 100%);
  animation: sgg-flash-soft 0.5s ease-out both;
}

.sgg-l2 .sgg-flash {
  background: radial-gradient(125% 115% at 50% 50%,
    rgba(255, 253, 240, 0.62) 0%,
    rgba(255, 232, 150, 0.46) 30%,
    rgba(255, 160, 24, 0.22) 64%,
    rgba(255, 120, 0, 0) 100%);
  animation-name: sgg-flash-hard;
  animation-duration: 0.62s;
}

.sgg-wash {
  position: absolute;
  inset: 0;
  background: radial-gradient(135% 120% at 50% 50%,
    rgba(255, 186, 52, 0) 54%,
    rgba(255, 164, 26, 0.16) 80%,
    rgba(255, 132, 0, 0.30) 100%);
  animation: sgg-glow-breathe 3s ease-in-out both infinite;
}

.sgg-l2 .sgg-wash {
  background: radial-gradient(135% 120% at 50% 50%,
    rgba(255, 196, 64, 0) 50%,
    rgba(255, 172, 32, 0.22) 78%,
    rgba(255, 122, 0, 0.40) 100%);
}

/* the halo: white-hot hairline over deep amber, the way polished gold reflects */
.sgg-bloom {
  position: absolute;
  inset: 0;
  box-shadow:
    inset 0 0 0 1px rgba(255, 253, 240, 0.98),
    inset 0 0 3px 1px rgba(255, 242, 186, 0.96),
    inset 0 0 12px 3px rgba(255, 208, 84, 0.92),
    inset 0 0 36px 8px rgba(255, 172, 30, 0.70),
    inset 0 0 92px 22px rgba(255, 134, 0, 0.44),
    inset 0 0 196px 50px rgba(255, 104, 0, 0.24);
  animation: sgg-bloom-flicker 2.4s linear both infinite;
}

.sgg-bloom-echo {
  animation-delay: 0.22s;
}

.sgg-l2 .sgg-bloom {
  box-shadow:
    inset 0 0 0 1.5px rgba(255, 255, 248, 1),
    inset 0 0 4px 2px rgba(255, 246, 206, 1),
    inset 0 0 18px 4px rgba(255, 214, 104, 0.98),
    inset 0 0 52px 12px rgba(255, 178, 40, 0.82),
    inset 0 0 130px 32px rgba(255, 138, 0, 0.56),
    inset 0 0 240px 62px rgba(255, 104, 0, 0.30);
}

.sgg-l2 .sgg-bloom-echo {
  animation-delay: 0.26s;
}

/* four corner flares, white core fading through champagne into amber */
.sgg-corners {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(340px 260px at 0% 0%, rgba(255, 255, 250, 0.88), rgba(255, 232, 150, 0.52) 20%, rgba(255, 176, 44, 0.24) 46%, rgba(255, 150, 0, 0) 72%),
    radial-gradient(340px 260px at 100% 0%, rgba(255, 255, 250, 0.88), rgba(255, 232, 150, 0.52) 20%, rgba(255, 176, 44, 0.24) 46%, rgba(255, 150, 0, 0) 72%),
    radial-gradient(340px 260px at 0% 100%, rgba(255, 255, 250, 0.88), rgba(255, 232, 150, 0.52) 20%, rgba(255, 176, 44, 0.24) 46%, rgba(255, 150, 0, 0) 72%),
    radial-gradient(340px 260px at 100% 100%, rgba(255, 255, 250, 0.88), rgba(255, 232, 150, 0.52) 20%, rgba(255, 176, 44, 0.24) 46%, rgba(255, 150, 0, 0) 72%);
  animation: sgg-glow-breathe 3.4s ease-in-out both infinite;
}

.sgg-l2 .sgg-corners {
  background:
    radial-gradient(440px 330px at 0% 0%, rgba(255, 255, 252, 0.98), rgba(255, 238, 168, 0.62) 18%, rgba(255, 182, 48, 0.30) 44%, rgba(255, 150, 0, 0) 72%),
    radial-gradient(440px 330px at 100% 0%, rgba(255, 255, 252, 0.98), rgba(255, 238, 168, 0.62) 18%, rgba(255, 182, 48, 0.30) 44%, rgba(255, 150, 0, 0) 72%),
    radial-gradient(440px 330px at 0% 100%, rgba(255, 255, 252, 0.98), rgba(255, 238, 168, 0.62) 18%, rgba(255, 182, 48, 0.30) 44%, rgba(255, 150, 0, 0) 72%),
    radial-gradient(440px 330px at 100% 100%, rgba(255, 255, 252, 0.98), rgba(255, 238, 168, 0.62) 18%, rgba(255, 182, 48, 0.30) 44%, rgba(255, 150, 0, 0) 72%);
}

/* the frame itself: brushed-gold base + rotating white-hot specular arcs */
.sgg-ring {
  position: absolute;
  inset: 0;
  padding: 3px;
  overflow: hidden;
  background: linear-gradient(135deg,
    #ffe9a8 0%,
    #ffb52e 16%,
    #a85c00 30%,
    #ffd76a 44%,
    #fff4c8 52%,
    #e39a10 62%,
    #b36700 74%,
    #ffd257 86%,
    #ffe9a8 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  animation: sgg-fade-in 0.45s ease-out both;
}

.sgg-l2 .sgg-ring {
  padding: 3.5px;
}

.sgg-ring-turn {
  position: absolute;
  inset: 0;
  background: conic-gradient(from var(--sgg-angle),
    rgba(255, 255, 255, 0) 0deg,
    rgba(255, 255, 255, 0.2) 18deg,
    rgba(255, 255, 255, 0.98) 28deg,
    rgba(255, 246, 200, 0.62) 35deg,
    rgba(255, 255, 255, 0) 46deg,
    rgba(255, 255, 255, 0) 104deg,
    rgba(255, 246, 200, 0) 116deg,
    rgba(255, 250, 220, 0.86) 128deg,
    rgba(255, 232, 150, 0.42) 136deg,
    rgba(255, 255, 255, 0) 146deg,
    rgba(255, 255, 255, 0) 200deg,
    rgba(255, 255, 255, 0.16) 212deg,
    rgba(255, 255, 255, 0.96) 224deg,
    rgba(255, 244, 190, 0.55) 231deg,
    rgba(255, 255, 255, 0) 242deg,
    rgba(255, 255, 255, 0) 298deg,
    rgba(255, 250, 220, 0) 308deg,
    rgba(255, 252, 232, 0.9) 320deg,
    rgba(255, 230, 150, 0.45) 328deg,
    rgba(255, 255, 255, 0) 338deg);
  animation: sgg-orbit 2.6s linear infinite;
}

.sgg-l2 .sgg-ring-turn {
  animation-duration: 2.1s;
}

/* one broad diagonal sheen travelling around the frame */
.sgg-sheen {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.sgg-sheen::before {
  content: '';
  position: absolute;
  top: -30%;
  bottom: -30%;
  left: -95%;
  width: 70%;
  background: linear-gradient(100deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.06) 34%,
    rgba(255, 255, 255, 0.92) 50%,
    rgba(255, 248, 214, 0.66) 58%,
    rgba(255, 255, 255, 0) 74%);
  transform: skewX(-18deg);
  animation: sgg-sweep 1.25s 0.06s cubic-bezier(0.3, 0.62, 0.2, 1) both infinite;
}

.sgg-l2 .sgg-sheen::before {
  animation-duration: 1.5s;
  animation-delay: 0.08s;
}

/* four-point star glints scattered along the frame.
   the drop-shadow lives on the wrapper because clip-path would clip its own filter */
.sgg-glint {
  position: absolute;
  filter: drop-shadow(0 0 5px rgba(255, 226, 150, 0.95)) drop-shadow(0 0 13px rgba(255, 168, 28, 0.6));
  opacity: 0;
  animation: sgg-twinkle 1.2s ease-in-out both infinite;
}

.sgg-glint::before {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 0%, 58% 41%, 100% 50%, 58% 59%, 50% 100%, 42% 59%, 0% 50%, 42% 41%);
  background: radial-gradient(circle at 50% 50%,
    #ffffff 0%,
    #fffdf0 26%,
    #ffe9a0 52%,
    #ffc63e 78%,
    #ffb324 100%);
}

.sgg-spark {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff 0%, #fff4c4 40%, #ffc247 75%, rgba(255, 170, 20, 0.2) 100%);
  box-shadow:
    0 0 4px 1px rgba(255, 236, 170, 0.95),
    0 0 12px 4px rgba(255, 190, 60, 0.55),
    0 0 26px 8px rgba(255, 150, 0, 0.25);
  opacity: 0;
  animation: sgg-spark 1.15s ease-out both infinite;
}

@keyframes sgg-flash-soft {
  0% { opacity: 0; }
  10% { opacity: 0.85; }
  100% { opacity: 0; }
}

@keyframes sgg-flash-hard {
  0% { opacity: 0; }
  7% { opacity: 1; }
  38% { opacity: 0.55; }
  100% { opacity: 0; }
}

@keyframes sgg-bloom-flicker {
  0% { opacity: 0.92; }
  9% { opacity: 1; }
  18% { opacity: 0.8; }
  27% { opacity: 0.98; }
  38% { opacity: 0.86; }
  52% { opacity: 0.95; }
  66% { opacity: 0.82; }
  80% { opacity: 0.97; }
  92% { opacity: 0.88; }
  100% { opacity: 0.92; }
}

@keyframes sgg-glow-breathe {
  0%, 100% { opacity: 0.82; }
  50% { opacity: 1; }
}

@keyframes sgg-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes sgg-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes sgg-orbit {
  from { --sgg-angle: 0deg; }
  to { --sgg-angle: 360deg; }
}

@keyframes sgg-sweep {
  0% { transform: translateX(0) skewX(-18deg); }
  100% { transform: translateX(300%) skewX(-18deg); }
}

@keyframes sgg-twinkle {
  0% { opacity: 0; transform: scale(0.15) rotate(0deg); }
  10% { opacity: 1; transform: scale(1) rotate(20deg); }
  26% { opacity: 0.12; transform: scale(0.5) rotate(38deg); }
  43% { opacity: 0.98; transform: scale(0.92) rotate(56deg); }
  66% { opacity: 0.08; transform: scale(0.42) rotate(76deg); }
  83% { opacity: 0.82; transform: scale(0.72) rotate(92deg); }
  100% { opacity: 0; transform: scale(0.1) rotate(112deg); }
}

@keyframes sgg-spark {
  0% { opacity: 0; transform: translateY(4px) scale(0.3); }
  14% { opacity: 1; transform: translateY(0) scale(1); }
  55% { opacity: 0.9; transform: translateY(-3px) scale(0.9); }
  100% { opacity: 0; transform: translateY(-10px) scale(0.35); }
}

/* gold ingot rain: yuanbao pouring down over the frame */
.sgg-ingot-defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

.sgg-ingot {
  position: absolute;
  top: -16vh;
  width: var(--sgg-w, 36px);
  height: calc(var(--sgg-w, 36px) * 0.667);
  margin-left: calc(var(--sgg-w, 36px) * -0.5);
  opacity: 0;
  filter:
    drop-shadow(0 0 8px rgba(255, 214, 110, 0.55))
    drop-shadow(0 0 22px rgba(255, 158, 12, 0.28));
  animation-name: sgg-fall;
  animation-timing-function: linear;
  animation-fill-mode: both;
  will-change: transform, opacity;
}

.sgg-ingot svg {
  display: block;
  width: 100%;
  height: 100%;
}

.sgg-ingot--far {
  filter: blur(0.7px) drop-shadow(0 0 6px rgba(255, 206, 96, 0.38));
}

@keyframes sgg-fall {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(var(--sgg-r0, 0deg));
  }
  5% {
    opacity: var(--sgg-o, 1);
  }
  82% {
    opacity: var(--sgg-o, 1);
  }
  100% {
    opacity: 0;
    transform: translate3d(var(--sgg-dx, 0px), 132vh, 0) rotate(var(--sgg-r1, 0deg));
  }
}

@media (prefers-reduced-motion: reduce) {
  .sgg-flash,
  .sgg-ingot,
  .sgg-ring-turn,
  .sgg-sheen,
  .sgg-glint,
  .sgg-spark,
  .sgg-bloom-echo {
    display: none !important;
  }
  .sgg-wash,
  .sgg-bloom,
  .sgg-corners,
  .sgg-ring {
    animation: none !important;
  }
}
`;

    /** Four-point glints: [x%, y%, size px, start offset s, twinkle length s] */
    const GLINTS = [
      [2.2, 1.0, 40, 0.0, 1.3],
      [12, 0.7, 13, 0.34, 1.05],
      [24, 1.6, 17, 0.18, 1.15],
      [39, 0.6, 11, 0.52, 0.95],
      [55, 1.5, 19, 0.08, 1.2],
      [70, 0.8, 13, 0.42, 1.0],
      [84, 1.8, 16, 0.26, 1.1],
      [97.8, 1.0, 38, 0.12, 1.3],
      [98.4, 22, 14, 0.5, 1.0],
      [97.8, 48, 18, 0.2, 1.15],
      [98.6, 70, 12, 0.6, 0.95],
      [98.2, 88, 20, 0.06, 1.2],
      [98.3, 98.1, 38, 0.3, 1.3],
      [86, 98.2, 16, 0.58, 0.95],
      [72, 97.6, 12, 0.16, 1.1],
      [56, 98.6, 15, 0.46, 1.0],
      [40, 97.8, 11, 0.04, 1.2],
      [24, 98.4, 17, 0.36, 1.05],
      [9, 97.6, 13, 0.14, 1.3],
      [1.7, 98.4, 34, 0.5, 1.25],
      [1.8, 86, 15, 0.24, 1.1],
      [2.4, 70, 12, 0.62, 1.0],
      [1.8, 48, 16, 0.3, 1.1],
      [2.2, 26, 13, 0.44, 1.0],
    ];

    /** Fine gold dust drifting off the frame. */
    const SPARKS = [
      [4.2, 0.9, 3, 0.05],
      [13, 2.2, 2, 0.22],
      [21, 0.6, 3, 0.38],
      [30, 1.9, 2, 0.12],
      [37, 0.8, 2, 0.46],
      [47, 1.7, 3, 0.28],
      [58, 0.5, 2, 0.08],
      [66, 2.1, 3, 0.34],
      [76, 0.9, 2, 0.18],
      [86, 1.8, 3, 0.44],
      [94, 0.7, 2, 0.02],
      [99.1, 12, 3, 0.3],
      [98.2, 30, 2, 0.14],
      [99.0, 44, 3, 0.5],
      [98.5, 58, 2, 0.24],
      [99.2, 70, 2, 0.06],
      [98.1, 86, 3, 0.4],
      [92, 98.9, 2, 0.2],
      [80, 97.7, 3, 0.48],
      [68, 98.8, 2, 0.1],
      [52, 97.6, 3, 0.32],
      [38, 98.9, 2, 0.16],
      [26, 97.8, 2, 0.42],
      [14, 98.6, 3, 0.26],
      [0.9, 92, 2, 0.04],
      [1.8, 74, 3, 0.36],
      [0.7, 56, 2, 0.2],
      [1.4, 38, 2, 0.52],
      [0.8, 20, 3, 0.08],
    ];

    /**
     * Gold ingots: [left %, start delay s, fall length s, width px,
     * start tilt deg, end tilt deg, horizontal drift px]
     */
    const INGOTS = [
      [3, 0.04, 1.42, 40, -16, 18, 24],
      [9, 0.26, 1.28, 26, 22, -14, -16],
      [15, 0.12, 1.55, 48, -8, 24, 18],
      [20, 0.34, 1.22, 22, 28, -20, -22],
      [26, 0.02, 1.38, 34, 10, -22, 12],
      [31, 0.2, 1.5, 54, -22, 8, -18],
      [37, 0.08, 1.3, 28, 18, -8, 26],
      [42, 0.3, 1.46, 44, -12, 16, -12],
      [47, 0.0, 1.58, 32, 6, 28, 14],
      [52, 0.16, 1.34, 24, -26, 6, -26],
      [57, 0.36, 1.44, 50, 12, -16, 8],
      [62, 0.06, 1.26, 30, -6, 22, -20],
      [67, 0.24, 1.52, 42, 20, -10, 28],
      [72, 0.1, 1.36, 26, -14, 12, -10],
      [77, 0.32, 1.48, 46, 8, -26, 16],
      [82, 0.04, 1.32, 30, -22, 8, -24],
      [87, 0.22, 1.56, 44, 14, -6, 20],
      [92, 0.14, 1.28, 24, -10, 24, -14],
      [96, 0.3, 1.4, 36, 24, -20, 6],
      [6, 0.38, 1.24, 22, -18, 12, -18],
      [18, 0.36, 1.5, 36, 10, -18, 22],
      [33, 0.4, 1.26, 26, 26, -24, -18],
      [44, 0.38, 1.54, 40, -12, 18, 10],
      [56, 0.34, 1.2, 22, 16, -12, -20],
      [69, 0.4, 1.46, 38, -24, 14, 18],
      [80, 0.36, 1.3, 24, 8, -18, -12],
      [90, 0.38, 1.42, 34, -16, 20, 24],
      [2, 0.42, 1.36, 28, 22, -14, 12],
      [50, 0.42, 1.5, 46, -8, 16, -24],
      [74, 0.4, 1.28, 22, 18, -24, 16],
    ];

    function GoldGlow() {
      const [fx, setFx] = React.useState(null);
      const fxRef = React.useRef(null);
      const burst = React.useRef({ count: 0, last: 0 });
      const seq = React.useRef(0);
      const waveSeq = React.useRef(0);
      const endTimer = React.useRef(null);
      const unmountTimer = React.useRef(null);

      React.useEffect(function () {
        function clearEnd() {
          if (endTimer.current !== null) {
            clearTimeout(endTimer.current);
            endTimer.current = null;
          }
        }

        function clearUnmount() {
          if (unmountTimer.current !== null) {
            clearTimeout(unmountTimer.current);
            unmountTimer.current = null;
          }
        }

        function publish(next) {
          fxRef.current = next;
          setFx(next);
        }

        function armEnd(delay) {
          clearEnd();
          clearUnmount();
          endTimer.current = setTimeout(function () {
            endTimer.current = null;
            const cur = fxRef.current;
            if (!cur) return;
            const ending = Object.assign({}, cur, { ending: true });
            publish(ending);
            unmountTimer.current = setTimeout(function () {
              unmountTimer.current = null;
              if (fxRef.current && fxRef.current.id === ending.id) {
                fxRef.current = null;
                setFx(null);
              }
            }, FADE_MS);
          }, delay);
        }

        function startSession(now) {
          seq.current += 1;
          waveSeq.current += 1;
          const wave = {
            id: waveSeq.current,
            count: BASE_INGOTS,
            strong: false,
            seed: 0,
          };
          publish({
            id: seq.current,
            taps: 2,
            level: 1,
            pulse: 1,
            waves: [wave],
            expiresAt: now + HOLD_MS[1],
            ending: false,
          });
          armEnd(HOLD_MS[1]);
        }

        function extendSession(cur, now) {
          const taps = cur.taps + 1;
          const level = taps >= 3 ? 2 : 1;
          const total = cur.waves.reduce(function (sum, wave) {
            return sum + wave.count;
          }, 0);
          let waves = cur.waves;
          const room = MAX_INGOTS - total;
          if (room > 0) {
            waveSeq.current += 1;
            waves = cur.waves.concat([
              {
                id: waveSeq.current,
                count: Math.min(WAVE_INGOTS, room),
                strong: true,
                seed: (taps * 7) % INGOTS.length,
              },
            ]);
          }
          const hold = HOLD_MS[level];
          publish({
            id: cur.id,
            taps: taps,
            level: level,
            pulse: cur.pulse + 1,
            waves: waves,
            expiresAt: now + hold,
            ending: false,
          });
          armEnd(hold);
        }

        function onKeyDown(event) {
          if (event.repeat || event.defaultPrevented) return;
          if (event.code !== 'Space' && event.key !== ' ') return;
          if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
          if (event.isComposing || event.keyCode === 229) return;

          const now = performance.now();
          const combo = burst.current;
          const within = now - combo.last <= TAP_WINDOW_MS;
          combo.last = now;
          combo.count = within ? combo.count + 1 : 1;

          // A lone Space is ordinary typing; the effect only owns the 2nd+ press
          // of a rapid pair, so slow typing never has its spaces swallowed.
          if (combo.count < 2) return;

          event.preventDefault();
          const cur = fxRef.current;
          if (cur && (cur.ending || now < cur.expiresAt + FADE_MS)) {
            extendSession(cur, now);
          } else {
            startSession(now);
          }
        }

        function resetCombo() {
          burst.current.count = 0;
          burst.current.last = 0;
        }

        window.addEventListener('keydown', onKeyDown, true);
        window.addEventListener('blur', resetCombo);
        return function () {
          window.removeEventListener('keydown', onKeyDown, true);
          window.removeEventListener('blur', resetCombo);
          clearEnd();
          clearUnmount();
        };
      }, []);

      let glints = null;
      let sparks = null;
      let ingots = null;
      let ingotDefs = null;
      if (fx) {
        const strong = fx.level === 2;
        const scale = strong ? 1 : 0.9;
        const usedGlints = strong ? GLINTS : GLINTS.slice(0, 16);
        glints = usedGlints.map(function (glint, index) {
          const size = Math.round(glint[2] * scale);
          return h('i', {
            key: 'glint-' + index,
            className: 'sgg-glint',
            style: {
              left: glint[0] + '%',
              top: glint[1] + '%',
              width: size + 'px',
              height: size + 'px',
              marginLeft: -size / 2 + 'px',
              marginTop: -size / 2 + 'px',
              animationDelay: strong ? glint[3] + 's' : glint[3] * 0.55 + 's',
              animationDuration: strong ? glint[4] + 's' : glint[4] * 0.92 + 's',
            },
          });
        });
        const usedSparks = strong ? SPARKS : SPARKS.slice(0, 14);
        sparks = usedSparks.map(function (spark, index) {
          return h('i', {
            key: 'spark-' + index,
            className: 'sgg-spark',
            style: {
              left: spark[0] + '%',
              top: spark[1] + '%',
              width: spark[2] + 'px',
              height: spark[2] + 'px',
              marginLeft: -spark[2] / 2 + 'px',
              marginTop: -spark[2] / 2 + 'px',
              animationDelay: spark[3] + 's',
              animationDuration: strong ? '1.15s' : '1s',
            },
          });
        });
        ingotDefs = h(
          'svg',
          {
            key: 'ingot-defs',
            className: 'sgg-ingot-defs',
            width: '0',
            height: '0',
            'aria-hidden': 'true',
            focusable: 'false',
          },
          h(
            'defs',
            null,
            h(
              'linearGradient',
              { id: 'sgg-ingot-body', x1: '0', y1: '0', x2: '0', y2: '1' },
              h('stop', { offset: '0%', stopColor: '#fff6cf' }),
              h('stop', { offset: '34%', stopColor: '#ffd75f' }),
              h('stop', { offset: '68%', stopColor: '#e39a12' }),
              h('stop', { offset: '100%', stopColor: '#8a4e00' }),
            ),
            h(
              'linearGradient',
              { id: 'sgg-ingot-cap', x1: '0', y1: '0', x2: '0', y2: '1' },
              h('stop', { offset: '0%', stopColor: '#fffdf2' }),
              h('stop', { offset: '45%', stopColor: '#ffe9a0' }),
              h('stop', { offset: '100%', stopColor: '#c98800' }),
            ),
            h(
              'g',
              { id: 'sgg-ingot-shape' },
              h('path', {
                d: 'M4 27 C4 39 15 45 36 45 C57 45 68 39 68 27 C62 32 51 34 36 34 C21 34 10 32 4 27 Z',
                fill: 'url(#sgg-ingot-body)',
                stroke: '#7f4700',
                strokeWidth: '1.4',
                strokeLinejoin: 'round',
              }),
              h('path', {
                d: 'M4 27 C0 24 1 18 7 15 C10 20 9 24 4 27 Z',
                fill: 'url(#sgg-ingot-body)',
                stroke: '#7f4700',
                strokeWidth: '1.2',
                strokeLinejoin: 'round',
              }),
              h('path', {
                d: 'M68 27 C72 24 71 18 65 15 C62 20 63 24 68 27 Z',
                fill: 'url(#sgg-ingot-body)',
                stroke: '#7f4700',
                strokeWidth: '1.2',
                strokeLinejoin: 'round',
              }),
              h('ellipse', {
                cx: '36',
                cy: '23',
                rx: '14',
                ry: '8.5',
                fill: 'url(#sgg-ingot-cap)',
                stroke: '#8a4e00',
                strokeWidth: '1.3',
              }),
              h('ellipse', {
                cx: '32.5',
                cy: '20.2',
                rx: '5',
                ry: '2.4',
                fill: '#fffdf2',
                opacity: '0.9',
              }),
              h('path', {
                d: 'M12 33.5 C20 37.5 28 39 36 39 C44 39 52 37.5 60 33.5',
                fill: 'none',
                stroke: '#fff6cf',
                strokeWidth: '1.6',
                opacity: '0.55',
                strokeLinecap: 'round',
              }),
            ),
          ),
        );
        ingots = [];
        fx.waves.forEach(function (wave) {
          for (let i = 0; i < wave.count; i += 1) {
            const ingot = INGOTS[(wave.seed + i) % INGOTS.length];
            const width = Math.round(ingot[3] * (wave.strong ? 1 : 0.9));
            const far = width < 28;
            const style = {
              left: ingot[0] + '%',
              '--sgg-w': width + 'px',
              '--sgg-dx': ingot[6] + 'px',
              '--sgg-r0': ingot[4] + 'deg',
              '--sgg-r1': ingot[5] + 'deg',
              animationDelay: (wave.strong ? ingot[1] : ingot[1] * 0.5) + 's',
              animationDuration: (wave.strong ? ingot[2] : ingot[2] * 0.82) + 's',
            };
            if (far) style['--sgg-o'] = 0.82;
            ingots.push(
              h(
                'i',
                {
                  key: 'ingot-' + wave.id + '-' + i,
                  className: 'sgg-ingot' + (far ? ' sgg-ingot--far' : ''),
                  style: style,
                },
                h(
                  'svg',
                  {
                    viewBox: '0 0 72 48',
                    width: '100%',
                    height: '100%',
                    'aria-hidden': 'true',
                    focusable: 'false',
                  },
                  h('use', { href: '#sgg-ingot-shape' }),
                ),
              ),
            );
          }
        });
      }

      return h(
        React.Fragment,
        null,
        h('style', { key: 'sgg-style' }, CSS),
        fx
          ? h(
              'div',
              {
                key: fx.id,
                className:
                  'sgg-stage sgg-l' + fx.level + (fx.ending ? ' sgg-stage--ending' : ''),
                'aria-hidden': 'true',
              },
              h('div', { key: 'flash-' + fx.pulse, className: 'sgg-flash' }),
              h('div', { key: 'wash', className: 'sgg-wash' }),
              h('div', { key: 'bloom', className: 'sgg-bloom' }),
              fx.level === 2
                ? h('div', { key: 'bloom-echo', className: 'sgg-bloom sgg-bloom-echo' })
                : null,
              h('div', { key: 'corners', className: 'sgg-corners' }),
              h(
                'div',
                { key: 'ring', className: 'sgg-ring' },
                h('i', { key: 'ring-turn', className: 'sgg-ring-turn' }),
                h('i', { key: 'sheen', className: 'sgg-sheen' }),
              ),
              ingotDefs,
              ingots,
              glints,
              sparks,
            )
          : null,
      );
    }

    const name = 'spacebar-goldenflow';
    const inject = ['slots'];

    function apply(ctx) {
      ctx.slots.inject('shell.overlay', function () {
        return ctx.slots.register(
          { name: 'shell.overlay', id: 'spacebar-goldenflow', order: 1500 },
          GoldGlow,
        );
      });
    }

    return { name: name, inject: inject, apply: apply };
  },
});
