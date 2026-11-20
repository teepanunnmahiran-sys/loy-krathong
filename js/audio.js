/**
 * ระบบเสียงและดนตรี (Web Audio API Synthesizer & Sound Effects)
 * เทศกาลลอยกระทงออนไลน์ วิทยาลัยเทคนิคท่าหลวงซีเมนต์ไทยอนุสรณ์
 */

class LoyKrathongAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmVolume = 0.45;
    this.sfxVolume = 0.7;
    this.waterNoiseNode = null;
    this.waterGainNode = null;
    this.melodyTimer = null;
    this.currentNoteIndex = 0;

    // Melody notes for traditional "Loy Krathong" (วันเพ็ญเดือนสิบสอง) in C pentatonic
    // Frequencies: C4=261.63, D4=293.66, E4=329.63, G4=392.00, A4=440.00, C5=523.25, D5=587.33, E5=659.25
    this.melodyNotes = [
      // วัน-เพ็ญ-เดือน-สิบ-สอง (G4 G4 A4 C5 A4)
      { f: 392.00, d: 0.35, p: 0.05 },
      { f: 392.00, d: 0.35, p: 0.05 },
      { f: 440.00, d: 0.4, p: 0.05 },
      { f: 523.25, d: 0.7, p: 0.1 },
      { f: 440.00, d: 0.4, p: 0.05 },
      // น้ำ-นอง-เต็ม-ตลิ่ง (G4 A4 G4 E4 D4)
      { f: 392.00, d: 0.4, p: 0.05 },
      { f: 440.00, d: 0.4, p: 0.05 },
      { f: 392.00, d: 0.4, p: 0.05 },
      { f: 329.63, d: 0.4, p: 0.05 },
      { f: 293.66, d: 0.8, p: 0.2 },

      // เรา-ทั้ง-หลาย-ชาย-หญิง (D4 E4 G4 A4 C5)
      { f: 293.66, d: 0.4, p: 0.05 },
      { f: 329.63, d: 0.4, p: 0.05 },
      { f: 392.00, d: 0.4, p: 0.05 },
      { f: 440.00, d: 0.4, p: 0.05 },
      { f: 523.25, d: 0.8, p: 0.1 },
      // สนุก-กัน-จริง-วัน-ลอย-กระทง (C5 D5 C5 A4 G4 A4 C5)
      { f: 523.25, d: 0.35, p: 0.05 },
      { f: 587.33, d: 0.35, p: 0.05 },
      { f: 523.25, d: 0.4, p: 0.05 },
      { f: 440.00, d: 0.4, p: 0.05 },
      { f: 392.00, d: 0.4, p: 0.05 },
      { f: 440.00, d: 0.5, p: 0.05 },
      { f: 523.25, d: 1.0, p: 0.3 },

      // ลอย ลอย กระทง (C5 C5 A4 G4)
      { f: 523.25, d: 0.5, p: 0.1 },
      { f: 523.25, d: 0.5, p: 0.1 },
      { f: 440.00, d: 0.4, p: 0.05 },
      { f: 392.00, d: 0.8, p: 0.2 },
      // ลอย ลอย กระทง (A4 A4 G4 E4)
      { f: 440.00, d: 0.5, p: 0.1 },
      { f: 440.00, d: 0.5, p: 0.1 },
      { f: 392.00, d: 0.4, p: 0.05 },
      { f: 329.63, d: 0.8, p: 0.2 },

      // ลอยกระทงกันแล้ว (D4 E4 G4 A4 C5)
      { f: 293.66, d: 0.35, p: 0.05 },
      { f: 329.63, d: 0.35, p: 0.05 },
      { f: 392.00, d: 0.35, p: 0.05 },
      { f: 440.00, d: 0.4, p: 0.05 },
      { f: 523.25, d: 0.8, p: 0.1 },
      // ขอเชิญน้องแก้วออกมารำวง (D5 C5 A4 G4 E4 D4 C4)
      { f: 587.33, d: 0.35, p: 0.05 },
      { f: 523.25, d: 0.35, p: 0.05 },
      { f: 440.00, d: 0.35, p: 0.05 },
      { f: 392.00, d: 0.4, p: 0.05 },
      { f: 329.63, d: 0.4, p: 0.05 },
      { f: 293.66, d: 0.4, p: 0.05 },
      { f: 261.63, d: 1.2, p: 0.6 }
    ];

    // Load saved preferences
    const savedMute = localStorage.getItem('loy_audio_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  initAudio() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startBGM() {
    this.initAudio();
    if (this.isMuted || this.bgmPlaying) return;

    this.bgmPlaying = true;
    this.startWaterAmbient();
    this.playNextMelodyNote();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
    this.stopWaterAmbient();
  }

  toggleBGM() {
    if (this.bgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('loy_audio_muted', this.isMuted);
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return !this.isMuted;
  }

  setVolume(type, val) {
    if (type === 'bgm') {
      this.bgmVolume = parseFloat(val);
      if (this.waterGainNode && this.ctx) {
        this.waterGainNode.gain.setValueAtTime(this.bgmVolume * 0.06, this.ctx.currentTime);
      }
    } else if (type === 'sfx') {
      this.sfxVolume = parseFloat(val);
    }
  }

  // Play traditional Ranad/Khim chime note
  playKhimNote(frequency, duration) {
    if (!this.ctx || this.isMuted || !this.bgmPlaying) return;

    try {
      const now = this.ctx.currentTime;

      // Primary tone (triangle wave for chime sweetness)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Soft lowpass filter for gentle temple chime timbre
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + duration);

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(frequency, now);

      // Subtle harmonic overtone
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(frequency * 2.01, now);

      // Volume envelope (Khim/Ranad strike: fast attack, natural exponential decay)
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(this.bgmVolume * 0.16, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.05);
      osc2.stop(now + duration + 0.05);
    } catch (e) {
      // AudioContext catch
    }
  }

  playNextMelodyNote() {
    if (!this.bgmPlaying || this.isMuted) return;

    const note = this.melodyNotes[this.currentNoteIndex];
    this.playKhimNote(note.f, note.d);

    const stepTime = (note.d + note.p) * 1000;
    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melodyNotes.length;

    this.melodyTimer = setTimeout(() => {
      this.playNextMelodyNote();
    }, stepTime);
  }

  // Ambient sound: Flowing river stream
  startWaterAmbient() {
    if (!this.ctx || this.waterNoiseNode) return;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pinkish filtered noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.12;
      }

      this.waterNoiseNode = this.ctx.createBufferSource();
      this.waterNoiseNode.buffer = buffer;
      this.waterNoiseNode.loop = true;

      // Filter for gentle water flow
      const waterFilter = this.ctx.createBiquadFilter();
      waterFilter.type = 'lowpass';
      waterFilter.frequency.value = 450;

      this.waterGainNode = this.ctx.createGain();
      this.waterGainNode.gain.setValueAtTime(this.bgmVolume * 0.05, this.ctx.currentTime);

      this.waterNoiseNode.connect(waterFilter);
      waterFilter.connect(this.waterGainNode);
      this.waterGainNode.connect(this.ctx.destination);

      this.waterNoiseNode.start();
    } catch (e) {}
  }

  stopWaterAmbient() {
    if (this.waterNoiseNode) {
      try {
        this.waterNoiseNode.stop();
        this.waterNoiseNode.disconnect();
      } catch (e) {}
      this.waterNoiseNode = null;
      this.waterGainNode = null;
    }
  }

  // Sound Effect: Krathong lowered into water (Splash & Ripple Chime)
  playKrathongRelease() {
    this.initAudio();
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Water droplet pitch dive
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(this.sfxVolume * 0.4, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);

      // Harmonious blessing chime
      setTimeout(() => {
        this.playBlessingBell();
      }, 150);
    } catch (e) {}
  }

  // Sound Effect: Sacred Temple Bell Chime
  playBlessingBell() {
    this.initAudio();
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [523.25, 1046.5, 1567.98]; // C5 chord harmonics
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime((this.sfxVolume * 0.25) / (idx + 1), now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 2.0);
      });
    } catch (e) {}
  }

  // Sound Effect: Fireworks Explosion
  playFirework() {
    this.initAudio();
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Boom low frequency drop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);

      gain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);

      // Crackle sparkle
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1800;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(this.sfxVolume * 0.18, now + 0.05);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now + 0.05);
    } catch (e) {}
  }

  // Sound Effect: Siam Si bamboo cylinder rattle
  playSiamsiRattle() {
    this.initAudio();
    if (this.isMuted || !this.ctx) return;

    try {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(250 + Math.random() * 200, now);

          gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.09);
        }, i * 90);
      }
    } catch (e) {}
  }

  // Sound Effect: UI Click / Pop
  playClick() {
    this.initAudio();
    if (this.isMuted || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);

      gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }
}

// Global Audio Instance
window.loyAudio = new LoyKrathongAudio();
