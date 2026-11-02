export const VOICE_KEYS = ['welcome', 'station-ahead', 'arrival', 'boarding-complete', 'overspeed', 'crossing', 'station-missed', 'journey-complete'];

// Playback shares the AudioContext unlocked by the player's Start click.
// MP3s ship with the game, so no installed voices or live TTS service are needed.
export function createRecordedVoice(ctx, base = import.meta.env?.BASE_URL || '/', fetchAudio = fetch) {
  const cache = new Map();
  let generation = 0, source = null, output = null, busy = false;
  const load = (key) => {
    if (!cache.has(key)) {
      const task = fetchAudio(`${base}audio/bn/${key}.mp3`)
        .then(response => {
          if (!response.ok) throw new Error('Voice download failed');
          return response.arrayBuffer();
        })
        .then(bytes => ctx.decodeAudioData(bytes));
      cache.set(key, task);
      task.catch(() => { if (cache.get(key) === task) cache.delete(key); });
    }
    return cache.get(key);
  };
  const cancel = () => {
    generation++;
    if (source) { source.onended = null; source.stop(); source.disconnect(); }
    output?.disconnect();
    source = output = null;
    busy = false;
  };
  return {
    get busy() { return busy; },
    preload() { return Promise.allSettled(VOICE_KEYS.map(load)); },
    cancel,
    async play(key, { interrupt = false, onError = () => {}, onStart = () => {} } = {}) {
      if (!VOICE_KEYS.includes(key) || (busy && !interrupt)) return false;
      cancel();
      const ticket = generation;
      busy = true;
      try {
        const buffer = await load(key);
        if (ticket !== generation) return false;
        source = ctx.createBufferSource();
        output = ctx.createGain();
        output.gain.value = 0.85;
        source.buffer = buffer;
        source.connect(output).connect(ctx.destination);
        source.onended = () => { if (ticket === generation) cancel(); };
        source.start();
        onStart();
        return true;
      } catch {
        if (ticket === generation) { cancel(); onError(); }
        return false;
      }
    },
  };
}
