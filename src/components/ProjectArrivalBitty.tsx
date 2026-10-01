import { useEffect, useState } from "react";
import { motion, useAnimate, useMotionValue, useReducedMotion, useSpring, type AnimationSequence } from "motion/react";

const assets = ["bitty-rope.png", "bitty-rope-hang.png", "bitty-fall.png", "bitty-land.png", "bitty-stand-look-base.png", "bitty-pupil.png"];
const sparks = Array.from({ length: 8 }, (_, i) => ({ x: Math.cos(i / 8 * Math.PI * 2) * (38 + i * 4), y: -18 - Math.sin(i / 8 * Math.PI) * 48 }));

export function ProjectArrivalBitty() {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [landed, setLanded] = useState(false);
  const [replay, setReplay] = useState(0);
  const lookX = useMotionValue(0);
  const lookY = useMotionValue(0);
  const pupilX = useSpring(lookX, { stiffness: 320, damping: 26, mass: 0.25 });
  const pupilY = useSpring(lookY, { stiffness: 320, damping: 26, mass: 0.25 });
  const staticPose = Boolean(reduced) || !("IntersectionObserver" in window);

  // Preload poses so image swaps cannot flash a missing frame.
  useEffect(() => {
    let active = true;
    Promise.all(assets.map((asset) => new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = image.onerror = () => resolve();
      image.src = `/assets/${asset}`;
    }))).then(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (staticPose) { setVisible(true); setLanded(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    }, { threshold: 0.35 });
    if (scope.current) observer.observe(scope.current);
    return () => observer.disconnect();
  }, [scope, staticPose]);

  useEffect(() => {
    if (!ready || !visible || staticPose) return;
    setLanded(false);
    lookX.jump(0);
    lookY.jump(0);
    // A single timeline owns the scene; pose swaps are instantaneous.
    const sequence: AnimationSequence = [
      [".arrival-pose", { opacity: 0, x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1 }, { duration: 0, at: 0 }],
      [".arrival-caption", { opacity: 0, y: 6 }, { duration: 0, at: 0 }],
      [".arrival-spark", { opacity: 0, x: 0, y: 0, scale: 1 }, { duration: 0, at: 0 }],
      [".arrival-impact", { opacity: 0, scale: 0.2 }, { duration: 0, at: 0 }],
      [".arrival-shadow", { opacity: 0, scaleX: 0.3 }, { duration: 0, at: 0 }],
      [".project-arrival-rope", { y: 0, rotate: 0 }, { duration: 0, at: 0 }],
      [".arrival-rig", { y: [-220, 0], rotate: [-8, 5, -3, 0], x: 0 }, { duration: 1.3, at: 0.12, ease: [0.16, 1, 0.3, 1] }],
      [".project-arrival-rope", { opacity: [0, 1], scaleY: [0.8, 1] }, { duration: 0.5, at: 0.05 }],
      [".project-arrival-hang", { opacity: 1 }, { duration: 0.01, at: 0.18 }],
      [".arrival-shadow", { opacity: 0.3, scaleX: 0.65 }, { duration: 1, at: 0.3 }],
      [".arrival-rig", { rotate: [0, -7, 6, -3, 0], x: [0, -3, 4, -2, 0] }, { duration: 0.75, at: 1.42, ease: "easeInOut" }],
      [".arrival-warning", { opacity: [0, 1, 1, 0], scale: [0.6, 1.1, 1, 0.8] }, { duration: 0.65, at: 1.62 }],
      [".project-arrival-hang", { y: -6, rotate: -5 }, { duration: 0.16, at: 2.17, ease: "easeOut" }],
      [".project-arrival-hang", { opacity: 0 }, { duration: 0.01, at: 2.33 }],
      [".project-arrival-rope", { y: -110, rotate: -12, opacity: 0 }, { duration: 0.35, at: 2.33, ease: "easeIn" }],
      [".project-arrival-fall", { opacity: 1 }, { duration: 0.01, at: 2.33 }],
      // A suspended comic beat followed by accelerated gravity.
      [".project-arrival-fall", { y: [0, -5, 80], x: [0, 3, 12], rotate: [-6, -8, 14] }, { duration: 0.58, at: 2.33, times: [0, 0.2, 1], ease: [0.55, 0.02, 0.9, 0.45] }],
      [".arrival-shadow", { opacity: 0.6, scaleX: 1.1 }, { duration: 0.44, at: 2.47, ease: "easeIn" }],
      [".project-arrival-fall", { opacity: 0 }, { duration: 0.01, at: 2.91 }],
      [".project-arrival-land", { opacity: 1 }, { duration: 0.01, at: 2.91 }],
      [".project-arrival-land", { scaleX: [1.14, 0.96, 1], scaleY: [0.8, 1.04, 1], y: [9, -7, 0], rotate: [3, -2, 0] }, { duration: 0.55, at: 2.91, ease: "easeOut" }],
      [".arrival-impact", { opacity: [0.8, 0], scale: [0.2, 1.7] }, { duration: 0.55, at: 2.91, ease: "easeOut" }],
      ...sparks.map((spark, i): AnimationSequence[number] => [`.arrival-spark-${i}`, { opacity: [0, 1, 0], x: [0, spark.x], y: [0, spark.y, -spark.y * 0.2], rotate: [0, i % 2 ? 120 : -100], scale: [1, 0.3] }, { duration: 0.6, at: 2.91, ease: "easeOut" }]),
      [".arrival-shadow", { opacity: 0.3, scaleX: 0.85 }, { duration: 0.5, at: 3.05 }],
      [".project-arrival-land", { rotate: [0, -3, 0] }, { duration: 0.5, at: 3.55, ease: "easeInOut" }],
      [".project-arrival-land", { opacity: 0 }, { duration: 0.01, at: 4.13 }],
      [".project-arrival-final", { opacity: 1 }, { duration: 0.01, at: 4.13 }],
      [".project-arrival-final", { y: [12, -6, 0], scaleY: [0.9, 1.03, 1], rotate: [-3, 2, 0] }, { duration: 0.45, at: 4.13, ease: "easeOut" }],
      [".arrival-caption", { opacity: 1, y: 0 }, { duration: 0.3, at: 4.4 }],
    ];
    const controls = animate(sequence);
    let active = true;
    controls.then(() => { if (active) setLanded(true); });
    return () => { active = false; controls.stop(); };
  }, [animate, ready, visible, staticPose, replay, lookX, lookY]);

  useEffect(() => {
    if (!landed || staticPose) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const bounds = scope.current?.querySelector(".project-arrival-final")?.getBoundingClientRect();
      if (!bounds) return;
      const dx = event.clientX - (bounds.left + bounds.width * 0.5);
      const dy = event.clientY - (bounds.top + bounds.height * 0.45);
      const distance = Math.max(90, Math.hypot(dx, dy));
      lookX.set((dx / distance) * 4);
      lookY.set((dy / distance) * 3);
    };
    const reset = () => { lookX.set(0); lookY.set(0); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", reset);
    document.documentElement.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", reset);
      document.documentElement.removeEventListener("pointerleave", reset);
    };
  }, [landed, staticPose, scope, lookX, lookY]);

  return (
    <div ref={scope} className={`project-arrival${staticPose ? " is-static" : ""}${landed ? " is-landed" : ""}`}>
      <div className="arrival-art" aria-hidden="true">
        <span className="arrival-backlight" />
        <span className="arrival-ground" />
        <motion.span className="arrival-shadow" />
        <motion.div className="arrival-rig">
          <motion.span className="project-arrival-rope" />
          <motion.img className="arrival-pose project-arrival-hang" src="/assets/bitty-rope-hang.png" alt="" />
        </motion.div>
        <motion.span className="arrival-warning">!</motion.span>
        <motion.img className="arrival-pose project-arrival-fall" src="/assets/bitty-fall.png" alt="" />
        <motion.img className="arrival-pose project-arrival-land" src="/assets/bitty-land.png" alt="" />
        <motion.span className="project-arrival-final arrival-pose">
          <motion.span className="project-arrival-final-sprite"
            animate={landed && !staticPose ? { y: [0, -2, 0] } : { y: 0 }}
            transition={{ duration: 3.2, repeat: landed && !staticPose ? Infinity : 0, ease: "easeInOut" }}>
            {(["left", "right"] as const).map((eye) => (
              <span key={eye} className={`project-arrival-eye project-arrival-eye--${eye}`}>
                <motion.img className="project-arrival-pupil" src="/assets/bitty-pupil.png" alt="" style={{ x: pupilX, y: pupilY }} />
              </span>
            ))}
          </motion.span>
        </motion.span>
        <motion.span className="arrival-impact" />
        {sparks.map((_, i) => <motion.span key={i} className={`arrival-spark arrival-spark-${i}`} />)}
        <motion.span className="arrival-caption">Entrada perfectamente calculada.</motion.span>
      </div>
      <button className="arrival-replay" type="button" disabled={!landed || staticPose} onClick={() => setReplay((value) => value + 1)} aria-label="Repetir la llegada de Bitty">
        <span aria-hidden="true">↻</span> Repetir escena
      </button>
    </div>
  );
}
