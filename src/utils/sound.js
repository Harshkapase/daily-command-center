// Shared Web Audio engine — plays a sequence of [frequency, delay] notes.
function playTones(notes, { type = 'sine', gain = 0.22, ramp = 0.45, stop = 0.5 } = {}) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    notes.forEach(([freq, delay]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = type;
      o.frequency.setValueAtTime(freq, t + delay);
      g.gain.setValueAtTime(gain, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + ramp);
      o.start(t + delay); o.stop(t + delay + stop);
    });
  } catch (e) {}
}

// Universal notification chime
export function playSound() {
  playTones([[523, 0], [659, 0.13], [784, 0.26]], { type: 'sine', gain: 0.22, ramp: 0.45, stop: 0.5 });
}

// War Mode cues: 'start' | 'end' | 'tick'
export function playWarSound(type) {
  if (type === 'start') {
    playTones([[220, 0], [330, 0.1], [440, 0.2], [660, 0.35]], { type: 'sawtooth', gain: 0.18, ramp: 0.3, stop: 0.35 });
  } else if (type === 'end') {
    playTones([[784, 0], [659, 0.15], [523, 0.3], [440, 0.45], [392, 0.6]], { type: 'sine', gain: 0.22, ramp: 0.4, stop: 0.45 });
  } else if (type === 'tick') {
    playTones([[800, 0]], { type: 'sine', gain: 0.06, ramp: 0.05, stop: 0.06 });
  }
}
