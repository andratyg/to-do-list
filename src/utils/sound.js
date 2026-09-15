// Web Audio API Sound Effects
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export function playSuccessSound(type = "ding", preference = "bell") {
  if (preference === "silent") return;

  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g);
  g.connect(ctx.destination);

  const selectedType = preference || type;

  if (selectedType === "ding") {
    o.type = "sine";
    o.frequency.setValueAtTime(1200, now);
    o.frequency.exponentialRampToValueAtTime(600, now + 0.5);
    g.gain.setValueAtTime(0.1, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    o.start();
    o.stop(now + 0.5);
  } else if (selectedType === "coin") {
    o.type = "triangle";
    o.frequency.setValueAtTime(900, now);
    g.gain.setValueAtTime(0.1, now);
    g.gain.linearRampToValueAtTime(0.0001, now + 0.3);
    o.start();
    o.stop(now + 0.3);
  } else if (selectedType === "bell") {
    o.type = "sawtooth";
    o.frequency.setValueAtTime(440, now);
    g.gain.setValueAtTime(0.15, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    o.start();
    o.stop(now + 1.5);
  } else {
    // Default pleasant chime
    o.type = "sine";
    o.frequency.setValueAtTime(800, now);
    o.frequency.exponentialRampToValueAtTime(400, now + 0.4);
    g.gain.setValueAtTime(0.1, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    o.start();
    o.stop(now + 0.4);
  }
}
