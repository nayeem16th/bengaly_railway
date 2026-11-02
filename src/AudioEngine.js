// Locally synthesized effects; station speech uses an available device voice.
export function createAudio() {
  let ctx,
    engine,
    engineGain,
    noiseGain,
    brake,
    brakeGain,
    filter,
    nextClack = 0,
    lastBoard = -1,
    announcedSession = -1,
    speaking = false,
    lastApproach = "",
    lastCrossing = 0,
    lastSession = -1;
  const api = {
    enabled: true,
    start() {
      if (ctx) {
        ctx.resume();
        return;
      }
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        engine = ctx.createOscillator();
        engine.type = "sawtooth";
        engineGain = ctx.createGain();
        engineGain.gain.value = 0;
        filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 160;
        engine.connect(filter).connect(engineGain).connect(ctx.destination);
        engine.start();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate),
          data = buffer.getChannelData(0);
        let v = 0;
        for (let i = 0; i < data.length; i++) {
          v = (v + (Math.random() * 2 - 1) * 0.025) / 1.02;
          data[i] = v * 3;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        noiseGain = ctx.createGain();
        noiseGain.gain.value = 0;
        noise.connect(noiseGain).connect(ctx.destination);
        noise.start();
        brake = ctx.createOscillator();
        brake.type = "triangle";
        brake.frequency.value = 820;
        brakeGain = ctx.createGain();
        brakeGain.gain.value = 0;
        brake.connect(brakeGain).connect(ctx.destination);
        brake.start();
      } catch {
        ctx = null;
      }
    },
    tone(f, volume, duration, type = "sine") {
      if (!ctx || !this.enabled) return;
      const o = ctx.createOscillator(),
        a = ctx.createGain();
      o.frequency.value = f;
      o.type = type;
      a.gain.setValueAtTime(volume, ctx.currentTime);
      a.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      o.connect(a).connect(ctx.destination);
      o.onended = () => {
        o.disconnect();
        a.disconnect();
      };
      o.start();
      o.stop(ctx.currentTime + duration);
    },
    announce(g, approaching = false) {
      if (!this.enabled) return;
      const s = g.stops[g.next];
      const text = approaching
        ? `সামনে ${s.bn} স্টেশন। গতি কমিয়ে থামুন।`
        : `যাত্রীদের দৃষ্টি আকর্ষণ করছি। ${s.bn} স্টেশন। সাবধানে ওঠানামা করুন।`;
      g.announcement = text;
      if (!window.speechSynthesis) { g.voiceStatus = "এই ব্রাউজারে কণ্ঠ ঘোষণা নেই।"; return; }
      window.speechSynthesis.cancel();
      speaking = false;
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => /^bn[-_]BD$/i.test(v.lang))
        || voices.find(v => /^bn(?:[-_]|$)/i.test(v.lang));
      // Never let an English default voice read a Bengali announcement.
      if (!voice) { g.voiceStatus = "ডিভাইসে বাংলা কণ্ঠ নেই—বাংলা ঘোষণা পড়ুন।"; return; }
      g.voiceStatus = "বাংলা কণ্ঠ চালু";
      const u = new SpeechSynthesisUtterance(text);
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = 0.86;
      u.volume = 0.65;
      speaking = true;
      u.onend = () => (speaking = false);
      u.onerror = () => { speaking = false; g.voiceStatus = "বাংলা কণ্ঠ চালানো যায়নি—ঘোষণা পড়ুন।"; };
      window.speechSynthesis.speak(u);
    },
    update(g) {
      if (lastSession !== g.session) {
        window.speechSynthesis?.cancel();
        speaking = false;
        lastSession = g.session;
      }
      if (!ctx) return;
      const active = this.enabled && g.started && !g.paused && !g.complete,
        b = Math.max(g.brake ? 1 : 0, g.brakeLevel || 0);
      engineGain.gain.setTargetAtTime(
        active ? 0.015 + g.power * 0.0002 : 0,
        ctx.currentTime,
        0.15,
      );
      engine.frequency.setTargetAtTime(
        30 + g.power * 0.32 + g.speed * 0.15,
        ctx.currentTime,
        0.15,
      );
      filter.frequency.setTargetAtTime(110 + g.power * 2, ctx.currentTime, 0.2);
      noiseGain.gain.setTargetAtTime(
        active
          ? g.speed * 0.0008 + (g.weather === "rain" ? 0.06 : 0) + b * 0.025
          : 0,
        ctx.currentTime,
        0.1,
      );
      brakeGain.gain.setTargetAtTime(
        active && g.speed > 4 ? b * 0.012 : 0,
        ctx.currentTime,
        0.1,
      );
      brake.frequency.setTargetAtTime(650 + g.speed * 8, ctx.currentTime, 0.1);
      if (active && g.speed > 5 && ctx.currentTime > nextClack) {
        this.tone(90, 0.025, 0.07, "triangle");
        nextClack = ctx.currentTime + Math.max(0.16, 12 / (g.speed / 3.6));
      }
      const approachKey = `${g.session}:${g.next}`;
      const distance = g.stops[g.next].z - g.z;
      if (active && g.next > 0 && distance > 24 && distance < 180 && lastApproach !== approachKey) {
        lastApproach = approachKey;
        this.announce(g, true);
      }
      const crossingZ = 220 + Math.max(0, Math.round((g.z - 220) / 840)) * 840;
      if (active && Math.abs(crossingZ-g.z)<100 && ctx.currentTime-lastCrossing>.8) {
        this.tone(880,.012,.18); lastCrossing=ctx.currentTime;
      }
      if (!active && speaking) {
        window.speechSynthesis?.cancel();
        speaking = false;
      }
      if (
        active &&
        g.boarding > 0 &&
        (lastBoard !== g.boardSerial || announcedSession !== g.session)
      ) {
        lastBoard = g.boardSerial;
        announcedSession = g.session;
        this.tone(660, 0.025, 0.7);
        this.announce(g);
      }
    },
    horn() {
      this.start();
      [185, 247, 311].forEach((f) => this.tone(f, 0.02, 1.3, "sawtooth"));
    },
    stop() {
      ctx?.close();
      if (speaking) window.speechSynthesis?.cancel();
    },
  };
  return api;
}
