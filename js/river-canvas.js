/**
 * แคนวาสสายน้ำจำลองและเอฟเฟกต์ (River Canvas, Water Physics, Lanterns, Fireworks & Floating Krathongs)
 * ออกแบบสายน้ำป่าสัก คืนวันเพ็ญเดือนสิบสอง วิทยาลัยเทคนิคท่าหลวงซีเมนต์ไทยอนุสรณ์
 */

class RiverCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.currentTheme = 'riverside'; // 'riverside', 'temple', 'college'
    this.krathongs = [];
    this.lanterns = [];
    this.fireworks = [];
    this.particles = [];
    this.fireflies = [];
    this.stars = [];
    this.ripples = [];

    this.time = 0;
    this.activeHoverKrathong = null;
    this.onKrathongClickCallback = null;

    // Cache pre-rendered krathong image objects
    this.krathongImageCache = new Map();

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Generate Stars & Fireflies
    this.generateStars();
    this.generateFireflies();

    // Load krathongs from database into river
    this.refreshKrathongsFromStorage();

    // Event listeners for interaction
    this.setupInteractions();

    // Start render loop
    this.animate();

    // Periodically spawn peaceful sky lanterns
    setInterval(() => {
      if (this.lanterns.length < 25 && Math.random() > 0.3) {
        this.spawnLantern();
      }
    }, 1800);
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.scale(dpr, dpr);
    this.generateStars();
  }

  generateStars() {
    this.stars = [];
    const numStars = Math.floor((this.width * (this.height * 0.5)) / 2500);
    for (let i = 0; i < numStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.55),
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        color: Math.random() > 0.8 ? '#fef08a' : '#ffffff'
      });
    }
  }

  generateFireflies() {
    this.fireflies = [];
    const count = 25;
    for (let i = 0; i < count; i++) {
      this.fireflies.push({
        x: Math.random() * this.width,
        y: this.height * 0.5 + Math.random() * (this.height * 0.4),
        radius: Math.random() * 2 + 1.2,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random(),
        pulseSpeed: Math.random() * 0.04 + 0.02
      });
    }
  }

  setTheme(themeName) {
    this.currentTheme = themeName;
  }

  refreshKrathongsFromStorage() {
    const list = window.loyStorage ? window.loyStorage.getAllKrathongs() : [];
    this.krathongs = [];

    // Distribute krathongs along the river naturally
    list.slice(0, 45).forEach((item, index) => {
      // Perspective scaling: higher up = further away (smaller, slower)
      const depth = Math.random(); // 0 is far (horizon), 1 is near
      const y = this.height * 0.58 + depth * (this.height * 0.38);
      const scale = 0.25 + depth * 0.45;
      const speed = 0.25 + depth * 0.45;

      this.addKrathongToRiver(item, {
        x: Math.random() * (this.width + 200) - 100,
        y: y,
        scale: scale,
        speedX: speed,
        seed: Math.random() * 100
      });
    });
  }

  addKrathongToRiver(data, customPlacement = null) {
    const depth = customPlacement ? (customPlacement.scale - 0.25) / 0.45 : 0.85;
    const y = customPlacement ? customPlacement.y : this.height * 0.78;
    const scale = customPlacement ? customPlacement.scale : 0.65;
    const speedX = customPlacement ? customPlacement.speedX : 0.6;

    const krathongObj = {
      data: data,
      x: customPlacement ? customPlacement.x : this.width * 0.5,
      y: y,
      scale: scale,
      baseY: y,
      speedX: speedX,
      seed: customPlacement?.seed || Math.random() * 100,
      bobSpeed: 0.02 + Math.random() * 0.015,
      bobAmp: 4 + Math.random() * 5,
      rippleTimer: 0,
      img: null,
      isUserNew: !customPlacement
    };

    // Prepare SVG rasterized image for canvas performance
    this.prepareKrathongImage(krathongObj);
    this.krathongs.push(krathongObj);

    // If it's a new release, launch celebratory effects!
    if (!customPlacement) {
      this.triggerBlessingCelebration(krathongObj.x, krathongObj.y);
    }
  }

  prepareKrathongImage(krathongObj) {
    const cacheKey = JSON.stringify(krathongObj.data.krathongConfig || {});
    if (this.krathongImageCache.has(cacheKey)) {
      krathongObj.img = this.krathongImageCache.get(cacheKey);
      return;
    }

    if (window.krathongBuilder) {
      const svgStr = window.krathongBuilder.renderSVG(krathongObj.data.krathongConfig, 240);
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        krathongObj.img = img;
        this.krathongImageCache.set(cacheKey, img);
      };
      img.src = url;
    }
  }

  spawnLantern() {
    this.lanterns.push({
      x: Math.random() * this.width,
      y: this.height + 20,
      speedY: 0.6 + Math.random() * 0.8,
      speedX: (Math.random() - 0.4) * 0.5,
      scale: 0.35 + Math.random() * 0.55,
      alpha: 0.85 + Math.random() * 0.15,
      swaySeed: Math.random() * 10
    });
  }

  triggerBlessingCelebration(x, y) {
    // Water ripples
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.ripples.push({
          x: x,
          y: y + 25,
          radius: 5,
          maxRadius: 75 + i * 20,
          alpha: 0.8
        });
      }, i * 220);
    }

    // Launch 3 sky fireworks
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const fx = this.width * 0.25 + Math.random() * (this.width * 0.5);
        const fy = this.height * 0.15 + Math.random() * (this.height * 0.25);
        this.createFirework(fx, fy);
        if (window.loyAudio) window.loyAudio.playFirework();
      }, i * 350);
    }

    // Floating sky lanterns release
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.lanterns.push({
          x: x - 100 + Math.random() * 200,
          y: this.height * 0.65,
          speedY: 0.8 + Math.random() * 0.9,
          speedX: (Math.random() - 0.4) * 0.6,
          scale: 0.4 + Math.random() * 0.4,
          alpha: 0.9,
          swaySeed: Math.random() * 10
        });
      }, i * 200);
    }
  }

  createFirework(targetX, targetY) {
    const colors = ['#f59e0b', '#ec4899', '#38bdf8', '#a855f7', '#22c55e', '#fef08a', '#ff4d4d'];
    const col = colors[Math.floor(Math.random() * colors.length)];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i * Math.PI * 2) / particleCount + (Math.random() - 0.5) * 0.2;
      const speed = Math.random() * 5 + 2;
      this.fireworks.push({
        x: targetX,
        y: targetY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: col,
        alpha: 1,
        decay: Math.random() * 0.018 + 0.012,
        radius: Math.random() * 2.5 + 1.2,
        gravity: 0.06
      });
    }
  }

  setupInteractions() {
    let mouseX = 0;
    let mouseY = 0;

    const checkHover = (x, y) => {
      let found = null;
      // Search top-to-bottom for hit test
      for (let i = this.krathongs.length - 1; i >= 0; i--) {
        const k = this.krathongs[i];
        const kWidth = 140 * k.scale;
        const kHeight = 90 * k.scale;
        if (
          x >= k.x - kWidth * 0.5 &&
          x <= k.x + kWidth * 0.5 &&
          y >= k.y - kHeight * 0.6 &&
          y <= k.y + kHeight * 0.6
        ) {
          found = k;
          break;
        }
      }
      this.activeHoverKrathong = found;
      this.canvas.style.cursor = found ? 'pointer' : 'default';

      const tooltip = document.getElementById('river-tooltip');
      if (tooltip) {
        if (found) {
          const d = found.data;
          const displayName = d.isAnonymous ? 'ผู้ร่วมกิจกรรมนิรนาม' : d.userName;
          tooltip.innerHTML = `
            <div class="flex items-center gap-2 mb-1">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <strong class="text-amber-300 font-bold">${displayName}</strong>
            </div>
            <div class="text-xs text-purple-200 mb-1">🏛 ${d.department || 'วิทยาลัยเทคนิคท่าหลวงฯ'}</div>
            <div class="text-xs text-slate-100 line-clamp-2 italic">"${d.wish || ''}"</div>
            <div class="text-[10px] text-amber-400/80 mt-1">✨ แตะเพื่อเปิดอ่านคำขอพร</div>
          `;
          tooltip.style.left = `${Math.min(Math.max(x - 110, 15), this.width - 240)}px`;
          tooltip.style.top = `${Math.max(y - 100, 15)}px`;
          tooltip.style.opacity = '1';
        } else {
          tooltip.style.opacity = '0';
        }
      }
    };

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      checkHover(mouseX, mouseY);
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (this.activeHoverKrathong && this.onKrathongClickCallback) {
        this.onKrathongClickCallback(this.activeHoverKrathong.data);
      } else if (clickY < this.height * 0.55) {
        // Click on sky launches fireworks!
        this.createFirework(clickX, clickY);
        if (window.loyAudio) window.loyAudio.playFirework();
      }
    });

    // Touch support for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const tx = touch.clientX - rect.left;
        const ty = touch.clientY - rect.top;
        checkHover(tx, ty);

        if (this.activeHoverKrathong && this.onKrathongClickCallback) {
          this.onKrathongClickCallback(this.activeHoverKrathong.data);
        } else if (ty < this.height * 0.55) {
          this.createFirework(tx, ty);
          if (window.loyAudio) window.loyAudio.playFirework();
        }
      }
    });
  }

  animate() {
    this.time += 0.02;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Night Sky & Background Landscape
    this.drawSky();

    // 2. Draw Stars
    this.drawStars();

    // 3. Draw Moon & Moon Reflection
    this.drawMoon();

    // 4. Draw Theme-specific Scenery (Wat, Riverbank, Pier)
    this.drawThemeScenery();

    // 5. Draw Sky Lanterns (โคมลอย)
    this.updateAndDrawLanterns();

    // 6. Draw Fireworks
    this.updateAndDrawFireworks();

    // 7. Draw River Water Surface & Waves
    this.drawRiverWater();

    // 8. Draw Water Ripples
    this.updateAndDrawRipples();

    // 9. Draw Floating Krathongs (Sorted by Y for correct 3D perspective depth)
    this.updateAndDrawKrathongs();

    // 10. Draw Fireflies
    this.updateAndDrawFireflies();

    requestAnimationFrame(() => this.animate());
  }

  drawSky() {
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.height * 0.55);
    if (this.currentTheme === 'temple') {
      skyGrad.addColorStop(0, '#130424');
      skyGrad.addColorStop(0.5, '#2b0947');
      skyGrad.addColorStop(1, '#1b1b4b');
    } else if (this.currentTheme === 'college') {
      skyGrad.addColorStop(0, '#0a0d24');
      skyGrad.addColorStop(0.6, '#181b4e');
      skyGrad.addColorStop(1, '#231545');
    } else {
      // Classic riverside
      skyGrad.addColorStop(0, '#060818');
      skyGrad.addColorStop(0.5, '#15123a');
      skyGrad.addColorStop(1, '#1c1c50');
    }
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.width, this.height * 0.55);
  }

  drawStars() {
    this.stars.forEach(star => {
      star.alpha += Math.sin(this.time * 5 + star.twinkleSpeed * 100) * 0.015;
      const curAlpha = Math.max(0.1, Math.min(1, star.alpha));
      this.ctx.save();
      this.ctx.globalAlpha = curAlpha;
      this.ctx.fillStyle = star.color;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  drawMoon() {
    const moonX = this.width * 0.78;
    const moonY = this.height * 0.22;
    const moonRadius = Math.min(this.width * 0.08, 65);

    this.ctx.save();
    // Huge soft golden moon halo
    const halo = this.ctx.createRadialGradient(moonX, moonY, moonRadius * 0.8, moonX, moonY, moonRadius * 3.8);
    halo.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    halo.addColorStop(0.4, 'rgba(251, 191, 36, 0.18)');
    halo.addColorStop(1, 'rgba(245, 158, 11, 0)');
    this.ctx.fillStyle = halo;
    this.ctx.beginPath();
    this.ctx.arc(moonX, moonY, moonRadius * 3.8, 0, Math.PI * 2);
    this.ctx.fill();

    // Glowing Moon Disc
    const moonGrad = this.ctx.createRadialGradient(moonX - moonRadius * 0.3, moonY - moonRadius * 0.3, moonRadius * 0.2, moonX, moonY, moonRadius);
    moonGrad.addColorStop(0, '#fffdf0');
    moonGrad.addColorStop(0.7, '#fef08a');
    moonGrad.addColorStop(1, '#facc15');

    this.ctx.fillStyle = moonGrad;
    this.ctx.beginPath();
    this.ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Subtle craters
    this.ctx.fillStyle = 'rgba(217, 119, 6, 0.12)';
    this.ctx.beginPath();
    this.ctx.arc(moonX - moonRadius * 0.25, moonY + moonRadius * 0.1, moonRadius * 0.2, 0, Math.PI * 2);
    this.ctx.arc(moonX + moonRadius * 0.2, moonY - moonRadius * 0.2, moonRadius * 0.25, 0, Math.PI * 2);
    this.ctx.arc(moonX + moonRadius * 0.15, moonY + moonRadius * 0.28, moonRadius * 0.18, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawThemeScenery() {
    const horizon = this.height * 0.52;
    this.ctx.save();

    if (this.currentTheme === 'temple') {
      // Golden Thai Stupa / Chedi silhouette & Temple roof in background
      this.ctx.fillStyle = '#100824';
      // Distant tree line
      this.ctx.beginPath();
      this.ctx.moveTo(0, horizon);
      for (let x = 0; x <= this.width; x += 40) {
        this.ctx.lineTo(x, horizon - 15 - Math.sin(x * 0.05) * 8);
      }
      this.ctx.lineTo(this.width, horizon);
      this.ctx.closePath();
      this.ctx.fill();

      // Thai Golden Chedi (เจดีย์ทองอร่าม)
      const chediX = this.width * 0.28;
      this.ctx.fillStyle = '#241242';
      this.ctx.beginPath();
      this.ctx.moveTo(chediX - 45, horizon);
      this.ctx.lineTo(chediX - 30, horizon - 50);
      this.ctx.lineTo(chediX - 18, horizon - 90);
      this.ctx.lineTo(chediX, horizon - 150); // Spire top
      this.ctx.lineTo(chediX + 18, horizon - 90);
      this.ctx.lineTo(chediX + 30, horizon - 50);
      this.ctx.lineTo(chediX + 45, horizon);
      this.ctx.closePath();
      this.ctx.fill();

      // Chedi gold glow
      this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      // Temple fair festive string lights (ธงราวและไฟประดับงานวัด)
      for (let i = 0; i < 2; i++) {
        const startX = this.width * 0.1;
        const endX = this.width * 0.5;
        const sagY = horizon - 75 + i * 35;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, sagY - 20);
        this.ctx.quadraticCurveTo((startX + endX) / 2, sagY + 25, endX, sagY - 15);
        this.ctx.strokeStyle = 'rgba(254, 240, 138, 0.3)';
        this.ctx.stroke();

        // Light bulbs
        for (let t = 0; t <= 1; t += 0.08) {
          const bx = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ((startX + endX) / 2) + t * t * endX;
          const by = (1 - t) * (1 - t) * (sagY - 20) + 2 * (1 - t) * t * (sagY + 25) + t * t * (sagY - 15);
          const colors = ['#f43f5e', '#fbbf24', '#38bdf8', '#34d399', '#c084fc'];
          this.ctx.fillStyle = colors[Math.floor((t * 10 + i) % colors.length)];
          this.ctx.beginPath();
          this.ctx.arc(bx, by, 3, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    } else if (this.currentTheme === 'college') {
      // College Riverside Waterfront Pavilion & Pier Banner
      this.ctx.fillStyle = '#0a0d26';
      // Distant riverside trees
      this.ctx.beginPath();
      this.ctx.moveTo(0, horizon);
      for (let x = 0; x <= this.width; x += 30) {
        this.ctx.lineTo(x, horizon - 20 - Math.sin(x * 0.03) * 12);
      }
      this.ctx.lineTo(this.width, horizon);
      this.ctx.closePath();
      this.ctx.fill();

      // Waterfront Pier Pavilion silhouette (ศาลาท่าน้ำวิทยาลัย)
      const pierX = this.width * 0.2;
      this.ctx.fillStyle = '#1e1138';
      this.ctx.fillRect(pierX - 50, horizon - 55, 100, 55);
      // Pavilion Thai roof
      this.ctx.beginPath();
      this.ctx.moveTo(pierX - 70, horizon - 55);
      this.ctx.lineTo(pierX, horizon - 95);
      this.ctx.lineTo(pierX + 70, horizon - 55);
      this.ctx.closePath();
      this.ctx.fillStyle = '#311054';
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      this.ctx.stroke();

      // College golden emblem glow on pavilion
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.beginPath();
      this.ctx.arc(pierX, horizon - 40, 8, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Classic riverside: rolling banks and silhouettes of swaying palms
      this.ctx.fillStyle = '#0a081a';
      this.ctx.beginPath();
      this.ctx.moveTo(0, horizon);
      for (let x = 0; x <= this.width; x += 50) {
        this.ctx.lineTo(x, horizon - 12 - Math.sin(x * 0.02) * 10);
      }
      this.ctx.lineTo(this.width, horizon);
      this.ctx.closePath();
      this.ctx.fill();

      // Distant Thai temple spire on river curve
      const spireX = this.width * 0.22;
      this.ctx.beginPath();
      this.ctx.moveTo(spireX - 25, horizon);
      this.ctx.lineTo(spireX, horizon - 90);
      this.ctx.lineTo(spireX + 25, horizon);
      this.ctx.closePath();
      this.ctx.fillStyle = '#170f2b';
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawRiverWater() {
    const horizon = this.height * 0.52;
    const waterGrad = this.ctx.createLinearGradient(0, horizon, 0, this.height);

    if (this.currentTheme === 'temple') {
      waterGrad.addColorStop(0, '#100a28');
      waterGrad.addColorStop(0.3, '#1c1142');
      waterGrad.addColorStop(0.7, '#151d45');
      waterGrad.addColorStop(1, '#0b1333');
    } else {
      waterGrad.addColorStop(0, '#090d24');
      waterGrad.addColorStop(0.3, '#111a45');
      waterGrad.addColorStop(0.65, '#0b2854');
      waterGrad.addColorStop(1, '#051b3b');
    }

    this.ctx.fillStyle = waterGrad;
    this.ctx.fillRect(0, horizon, this.width, this.height - horizon);

    // Golden Moon light shimmer column on water
    const moonX = this.width * 0.78;
    this.ctx.save();
    for (let y = horizon + 5; y < this.height; y += 14) {
      const progress = (y - horizon) / (this.height - horizon);
      const waveWidth = 45 + progress * 240;
      const waveOffset = Math.sin(this.time * 2.5 + y * 0.08) * (8 + progress * 15);
      const alpha = (1 - progress * 0.7) * 0.28;

      this.ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.ellipse(moonX + waveOffset, y, waveWidth * 0.5, 2.5, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Dynamic horizontal wave ripples
    for (let i = 0; i < 9; i++) {
      const wy = horizon + 40 + i * ((this.height - horizon - 50) / 9);
      const wavePhase = this.time * 1.5 + i;
      this.ctx.beginPath();
      this.ctx.moveTo(0, wy);
      for (let x = 0; x <= this.width; x += 40) {
        const dy = Math.sin(x * 0.015 + wavePhase) * (1.5 + i * 0.4);
        this.ctx.lineTo(x, wy + dy);
      }
      this.ctx.strokeStyle = `rgba(56, 189, 248, ${0.05 + i * 0.015})`;
      this.ctx.lineWidth = 1 + i * 0.3;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  updateAndDrawLanterns() {
    for (let i = this.lanterns.length - 1; i >= 0; i--) {
      const l = this.lanterns[i];
      l.y -= l.speedY;
      l.x += l.speedX + Math.sin(this.time + l.swaySeed) * 0.35;

      if (l.y < -50) {
        this.lanterns.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = l.alpha;
      const lw = 22 * l.scale;
      const lh = 30 * l.scale;

      // Glow around lantern
      const glow = this.ctx.createRadialGradient(l.x, l.y, lw * 0.2, l.x, l.y, lw * 2.8);
      glow.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
      glow.addColorStop(0.5, 'rgba(249, 115, 22, 0.3)');
      glow.addColorStop(1, 'rgba(234, 88, 12, 0)');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(l.x, l.y, lw * 2.8, 0, Math.PI * 2);
      this.ctx.fill();

      // Lantern body (Rice paper cylinder)
      const bodyGrad = this.ctx.createLinearGradient(l.x - lw * 0.5, l.y, l.x + lw * 0.5, l.y);
      bodyGrad.addColorStop(0, '#f59e0b');
      bodyGrad.addColorStop(0.5, '#fef08a');
      bodyGrad.addColorStop(1, '#f59e0b');

      this.ctx.fillStyle = bodyGrad;
      this.ctx.beginPath();
      this.ctx.roundRect(l.x - lw * 0.5, l.y - lh * 0.5, lw, lh, 4);
      this.ctx.fill();

      // Candle flame core inside lantern
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.ellipse(l.x, l.y + lh * 0.3, lw * 0.22, lh * 0.15, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  updateAndDrawFireworks() {
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const p = this.fireworks[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.fireworks.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  updateAndDrawRipples() {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 0.8;
      r.alpha -= 0.012;

      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = r.alpha;
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.35, 0, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  updateAndDrawKrathongs() {
    // Sort by Y for correct natural depth (smaller / further krathongs behind near ones)
    this.krathongs.sort((a, b) => a.y - b.y);

    for (let i = 0; i < this.krathongs.length; i++) {
      const k = this.krathongs[i];

      // River drift: moving from left to right along current
      k.x += k.speedX;
      // Loop back if drifted off screen
      if (k.x > this.width + 120) {
        k.x = -100;
        k.baseY = this.height * 0.58 + Math.random() * (this.height * 0.38);
        k.y = k.baseY;
      }

      // Vertical sinusoidal bobbing (like resting gently on water)
      const bob = Math.sin(this.time * 2 + k.seed) * k.bobAmp;
      k.y = k.baseY + bob;

      // Candle flame reflection on water
      this.ctx.save();
      const candleGlowY = k.y + 12 * k.scale;
      const refGlow = this.ctx.createRadialGradient(k.x, candleGlowY, 5 * k.scale, k.x, candleGlowY, 40 * k.scale);
      refGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      refGlow.addColorStop(0.6, 'rgba(249, 115, 22, 0.2)');
      refGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
      this.ctx.fillStyle = refGlow;
      this.ctx.beginPath();
      this.ctx.ellipse(k.x, candleGlowY, 35 * k.scale, 10 * k.scale, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw Krathong image
      const drawW = 160 * k.scale;
      const drawH = 160 * k.scale;

      if (k.img && k.img.complete) {
        this.ctx.drawImage(k.img, k.x - drawW * 0.5, k.y - drawH * 0.65, drawW, drawH);
      } else {
        // Fallback procedural placeholder until SVG finishes loading
        this.ctx.fillStyle = '#15803d';
        this.ctx.beginPath();
        this.ctx.ellipse(k.x, k.y, 45 * k.scale, 18 * k.scale, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.arc(k.x, k.y - 15 * k.scale, 6 * k.scale, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // If active hover or newly created, highlight with golden pulse ring
      if (this.activeHoverKrathong === k || k.isUserNew) {
        this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([6, 4]);
        this.ctx.beginPath();
        this.ctx.ellipse(k.x, k.y, drawW * 0.45, drawH * 0.2, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }

      this.ctx.restore();
    }
  }

  updateAndDrawFireflies() {
    this.fireflies.forEach(f => {
      f.x += f.vx;
      f.y += f.vy;
      f.alpha += Math.sin(this.time * 6 + f.pulseSpeed * 100) * 0.03;

      if (f.x < 0) f.x = this.width;
      if (f.x > this.width) f.x = 0;
      if (f.y < this.height * 0.45) f.y = this.height * 0.95;
      if (f.y > this.height) f.y = this.height * 0.5;

      const alpha = Math.max(0.1, Math.min(1, f.alpha));
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      const glow = this.ctx.createRadialGradient(f.x, f.y, 1, f.x, f.y, f.radius * 3);
      glow.addColorStop(0, '#fef08a');
      glow.addColorStop(0.4, '#a3e635');
      glow.addColorStop(1, 'rgba(163, 230, 53, 0)');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, f.radius * 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }
}

// Global River Canvas instance holder
window.RiverCanvas = RiverCanvas;
