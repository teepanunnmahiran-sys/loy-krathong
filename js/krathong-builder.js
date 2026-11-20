/**
 * ระบบสร้างและเรนเดอร์กระทง (Krathong Builder & SVG Vector Renderer)
 * ออกแบบกราฟิกกระทงแบบเวกเตอร์ SVG ละเอียด คมชัด ปรับแต่งได้ตามต้องการ
 */

class KrathongBuilder {
  constructor() {
    this.currentConfig = {
      type: 'banana',
      colorTone: 'green',
      flower: 'lotus_pink',
      candle: 'gold',
      incense: true,
      coin: true,
      ribbon: true
    };

    // Color definitions
    this.colors = {
      banana: {
        green: { outer: '#15803d', mid: '#22c55e', inner: '#4ade80', stroke: '#14532d' },
        gold: { outer: '#b45309', mid: '#f59e0b', inner: '#fef08a', stroke: '#78350f' },
        purple: { outer: '#581c87', mid: '#9333ea', inner: '#d8b4fe', stroke: '#3b0764' },
        pink: { outer: '#be185d', mid: '#ec4899', inner: '#fbcfe8', stroke: '#831843' },
        orange: { outer: '#c2410c', mid: '#f97316', inner: '#fed7aa', stroke: '#7c2d12' },
        blue: { outer: '#1d4ed8', mid: '#3b82f6', inner: '#bfdbfe', stroke: '#1e3a8a' }
      },
      lotus: {
        pink: { outer: '#be185d', mid: '#ec4899', inner: '#fce7f3', stroke: '#831843' },
        white: { outer: '#94a3b8', mid: '#f1f5f9', inner: '#ffffff', stroke: '#64748b' },
        gold: { outer: '#b45309', mid: '#f59e0b', inner: '#fef08a', stroke: '#78350f' },
        purple: { outer: '#6b21a8', mid: '#a855f7', inner: '#f3e8ff', stroke: '#581c87' },
        blue: { outer: '#0369a1', mid: '#38bdf8', inner: '#e0f2fe', stroke: '#075985' }
      },
      bread: {
        orange: { outer: '#c2410c', mid: '#ea580c', inner: '#ffedd5', stroke: '#7c2d12' },
        gold: { outer: '#b45309', mid: '#d97706', inner: '#fef3c7', stroke: '#78350f' },
        pink: { outer: '#9d174d', mid: '#db2777', inner: '#fce7f3', stroke: '#831843' },
        green: { outer: '#166534', mid: '#16a34a', inner: '#dcfce7', stroke: '#14532d' }
      },
      coconut: {
        gold: { shell: '#451a03', rim: '#78350f', wax: '#fef08a', glow: '#f59e0b' },
        natural: { shell: '#291807', rim: '#593211', wax: '#fed7aa', glow: '#ea580c' }
      },
      fantasy: {
        purple: { base: '#3b0764', neon: '#a855f7', gear: '#fbbf24', rim: '#6366f1' },
        gold: { base: '#451a03', neon: '#fbbf24', gear: '#f59e0b', rim: '#fef08a' },
        blue: { base: '#082f49', neon: '#0ea5e9', gear: '#38bdf8', rim: '#06b6d4' }
      }
    };
  }

  setConfig(newConfig) {
    this.currentConfig = { ...this.currentConfig, ...newConfig };
    return this.renderSVG();
  }

  // Generates high quality SVG string for preview & drawing
  renderSVG(config = this.currentConfig, size = 320) {
    const c = { ...this.currentConfig, ...config };
    const w = size;
    const h = size;

    let baseElements = '';
    let flowerElements = '';
    let candleIncenseElements = '';
    let toppingsElements = '';

    // 1. Render Base Krathong
    if (c.type === 'banana') {
      baseElements = this.getBananaLeafBaseSVG(c.colorTone);
    } else if (c.type === 'lotus') {
      baseElements = this.getLotusBloomBaseSVG(c.colorTone);
    } else if (c.type === 'bread') {
      baseElements = this.getBreadBaseSVG(c.colorTone);
    } else if (c.type === 'coconut') {
      baseElements = this.getCoconutBaseSVG(c.colorTone);
    } else if (c.type === 'fantasy') {
      baseElements = this.getFantasyBaseSVG(c.colorTone);
    }

    // 2. Render Flowers in Center
    flowerElements = this.getFlowerSVG(c.flower);

    // 3. Render Candle & Joss Sticks
    candleIncenseElements = this.getCandleAndIncenseSVG(c.candle, c.incense);

    // 4. Render Toppings
    toppingsElements = this.getToppingsSVG(c.coin, c.ribbon);

    // Assembly
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="${w}" height="${h}" class="krathong-svg-art">
        <defs>
          <!-- Water shadow -->
          <radialGradient id="waterShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#020617" stop-opacity="0.75" />
            <stop offset="60%" stop-color="#020617" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#020617" stop-opacity="0" />
          </radialGradient>
          <!-- Candle flame glow -->
          <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fffbeb" stop-opacity="1" />
            <stop offset="35%" stop-color="#fbbf24" stop-opacity="0.9" />
            <stop offset="70%" stop-color="#f97316" stop-opacity="0.6" />
            <stop offset="100%" stop-color="#ea580c" stop-opacity="0" />
          </radialGradient>
          <!-- Gold metallic sheen -->
          <linearGradient id="goldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="50%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#b45309" />
          </linearGradient>
        </defs>

        <!-- Shadow on water -->
        <ellipse cx="160" cy="245" rx="125" ry="32" fill="url(#waterShadow)" />

        <!-- Base Krathong (Leaves, Petals, or Shell) -->
        ${baseElements}

        <!-- Center Toppings (Flowers, coins, ribbon) -->
        ${toppingsElements}
        ${flowerElements}

        <!-- Candle and Incense Sticks -->
        ${candleIncenseElements}
      </svg>
    `;
  }

  // 1.1 Banana Leaf Krathong SVG
  getBananaLeafBaseSVG(colorTone = 'green') {
    const colGroup = this.colors.banana[colorTone] || this.colors.banana.green;
    const { outer, mid, inner, stroke } = colGroup;

    // Petals arranged in circular traditional folds
    let petals = '';
    const numOuter = 16;
    for (let i = 0; i < numOuter; i++) {
      const angle = (i * 360) / numOuter;
      const rad = (angle * Math.PI) / 180;
      const x = 160 + Math.cos(rad) * 98;
      const y = 205 + Math.sin(rad) * 38;
      petals += `
        <path d="M 160 205 Q ${x} ${y - 25} ${x} ${y} Q ${x + 10} ${y + 10} 160 205" 
              fill="${outer}" stroke="${stroke}" stroke-width="1.5" opacity="0.95" />
        <path d="M 160 205 Q ${x - 5} ${y - 12} ${x} ${y}" 
              stroke="${mid}" stroke-width="1.2" fill="none" opacity="0.8" />
      `;
    }

    // Inner petal layer
    let innerPetals = '';
    const numInner = 12;
    for (let i = 0; i < numInner; i++) {
      const angle = (i * 360) / numInner + 15;
      const rad = (angle * Math.PI) / 180;
      const x = 160 + Math.cos(rad) * 72;
      const y = 205 + Math.sin(rad) * 28;
      innerPetals += `
        <path d="M 160 205 Q ${x} ${y - 18} ${x} ${y} Q ${x + 8} ${y + 8} 160 205" 
              fill="${mid}" stroke="${stroke}" stroke-width="1.2" />
        <path d="M 160 205 Q ${x - 3} ${y - 8} ${x} ${y}" 
              stroke="${inner}" stroke-width="1.5" fill="none" />
      `;
    }

    return `
      <!-- Banana Stem Base -->
      <ellipse cx="160" cy="215" rx="88" ry="34" fill="#14532d" stroke="#052e16" stroke-width="2" />
      <g id="banana-outer-petals">${petals}</g>
      <ellipse cx="160" cy="208" rx="74" ry="28" fill="#15803d" opacity="0.8" />
      <g id="banana-inner-petals">${innerPetals}</g>
      <ellipse cx="160" cy="202" rx="55" ry="22" fill="#166534" />
    `;
  }

  // 1.2 Lotus Bloom Krathong SVG
  getLotusBloomBaseSVG(colorTone = 'pink') {
    const colGroup = this.colors.lotus[colorTone] || this.colors.lotus.pink;
    const { outer, mid, inner, stroke } = colGroup;

    let outerPetals = '';
    for (let i = 0; i < 14; i++) {
      const angle = (i * 360) / 14;
      const rad = (angle * Math.PI) / 180;
      const x = 160 + Math.cos(rad) * 92;
      const y = 210 + Math.sin(rad) * 35;
      outerPetals += `
        <path d="M 160 210 C ${160 + Math.cos(rad - 0.2) * 50} ${210 + Math.sin(rad - 0.2) * 20}, ${x - 12} ${y - 15}, ${x} ${y} C ${x + 12} ${y - 15}, ${160 + Math.cos(rad + 0.2) * 50} ${210 + Math.sin(rad + 0.2) * 20}, 160 210 Z"
              fill="${outer}" stroke="${stroke}" stroke-width="1.2" />
      `;
    }

    let midPetals = '';
    for (let i = 0; i < 10; i++) {
      const angle = (i * 360) / 10 + 18;
      const rad = (angle * Math.PI) / 180;
      const x = 160 + Math.cos(rad) * 68;
      const y = 205 + Math.sin(rad) * 26;
      midPetals += `
        <path d="M 160 205 C ${160 + Math.cos(rad - 0.2) * 35} ${205 + Math.sin(rad - 0.2) * 15}, ${x - 8} ${y - 12}, ${x} ${y} C ${x + 8} ${y - 12}, ${160 + Math.cos(rad + 0.2) * 35} ${205 + Math.sin(rad + 0.2) * 15}, 160 205 Z"
              fill="${mid}" stroke="${inner}" stroke-width="1" />
      `;
    }

    return `
      <ellipse cx="160" cy="220" rx="95" ry="36" fill="#047857" opacity="0.85" />
      <g id="lotus-outer">${outerPetals}</g>
      <g id="lotus-mid">${midPetals}</g>
      <!-- Lotus Pod Core -->
      <ellipse cx="160" cy="202" rx="42" ry="18" fill="#eab308" stroke="#ca8a04" stroke-width="1.5" />
      <circle cx="150" cy="200" r="2.5" fill="#713f12" />
      <circle cx="160" cy="198" r="2.5" fill="#713f12" />
      <circle cx="170" cy="200" r="2.5" fill="#713f12" />
      <circle cx="155" cy="205" r="2.5" fill="#713f12" />
      <circle cx="165" cy="205" r="2.5" fill="#713f12" />
    `;
  }

  // 1.3 Eco Bread Krathong SVG (รูปเต่า/ปลาขนมปังรักษ์โลก)
  getBreadBaseSVG(colorTone = 'orange') {
    const colGroup = this.colors.bread[colorTone] || this.colors.bread.orange;
    const { outer, mid, inner, stroke } = colGroup;

    return `
      <!-- Bread Turtle Body -->
      <!-- Feet -->
      <ellipse cx="90" cy="225" rx="22" ry="14" fill="${mid}" stroke="${stroke}" stroke-width="1.5" />
      <ellipse cx="230" cy="225" rx="22" ry="14" fill="${mid}" stroke="${stroke}" stroke-width="1.5" />
      <ellipse cx="105" cy="185" rx="18" ry="12" fill="${mid}" stroke="${stroke}" stroke-width="1.5" />
      <ellipse cx="215" cy="185" rx="18" ry="12" fill="${mid}" stroke="${stroke}" stroke-width="1.5" />
      <!-- Turtle Head -->
      <ellipse cx="160" cy="236" rx="24" ry="16" fill="${mid}" stroke="${stroke}" stroke-width="1.5" />
      <circle cx="150" cy="235" r="2.5" fill="#451a03" />
      <circle cx="170" cy="235" r="2.5" fill="#451a03" />
      <!-- Turtle Shell / Bread Bun -->
      <ellipse cx="160" cy="202" rx="78" ry="36" fill="${outer}" stroke="${stroke}" stroke-width="2" />
      <ellipse cx="160" cy="198" rx="68" ry="30" fill="${mid}" />
      <ellipse cx="160" cy="195" rx="55" ry="24" fill="${inner}" opacity="0.65" />
      <!-- Bread scored shell pattern -->
      <path d="M 120 195 Q 160 215 200 195" stroke="${stroke}" stroke-width="2" fill="none" stroke-dasharray="4,4" />
      <path d="M 135 185 Q 160 220 185 185" stroke="${stroke}" stroke-width="2" fill="none" stroke-dasharray="4,4" />
      <!-- Sesame seeds on bread -->
      <ellipse cx="140" cy="190" rx="2" ry="3" fill="#fef08a" transform="rotate(20 140 190)" />
      <ellipse cx="175" cy="192" rx="2" ry="3" fill="#fef08a" transform="rotate(-30 175 192)" />
      <ellipse cx="160" cy="185" rx="2" ry="3" fill="#fef08a" />
      <ellipse cx="152" cy="198" rx="2" ry="3" fill="#fef08a" transform="rotate(45 152 198)" />
      <ellipse cx="168" cy="198" rx="2" ry="3" fill="#fef08a" transform="rotate(-25 168 198)" />
    `;
  }

  // 1.4 Coconut Shell Krathong SVG (กะลามะพร้าวสายประทีป)
  getCoconutBaseSVG(colorTone = 'gold') {
    const col = this.colors.coconut[colorTone] || this.colors.coconut.gold;
    return `
      <!-- Coconut Husk & Shell -->
      <path d="M 75 200 C 75 245, 245 245, 245 200 C 245 185, 75 185, 75 200 Z" 
            fill="${col.shell}" stroke="#1c0d02" stroke-width="3" />
      <!-- Inner Coconut White Flesh Rim -->
      <ellipse cx="160" cy="198" rx="80" ry="26" fill="#f8fafc" stroke="${col.rim}" stroke-width="2" />
      <!-- Candle Wax Pool -->
      <ellipse cx="160" cy="198" rx="72" ry="22" fill="${col.wax}" />
      <ellipse cx="160" cy="198" rx="58" ry="16" fill="${col.glow}" opacity="0.75" />
    `;
  }

  // 1.5 Modern Technical / Cyber Gear Krathong (กระทงแฟนตาซีช่างเทคนิค)
  getFantasyBaseSVG(colorTone = 'purple') {
    const col = this.colors.fantasy[colorTone] || this.colors.fantasy.purple;
    return `
      <!-- Hexagonal / Cyber Gear Base -->
      <ellipse cx="160" cy="216" rx="90" ry="32" fill="${col.base}" stroke="${col.neon}" stroke-width="2.5" />
      <!-- Golden Industrial Gear teeth -->
      <g stroke="${col.gear}" stroke-width="3" fill="none">
        <line x1="75" y1="216" x2="85" y2="216" />
        <line x1="235" y1="216" x2="245" y2="216" />
        <line x1="90" y1="230" x2="100" y2="225" />
        <line x1="220" y1="225" x2="230" y2="230" />
        <line x1="110" y1="240" x2="118" y2="233" />
        <line x1="202" y1="233" x2="210" y2="240" />
        <line x1="140" y1="246" x2="142" y2="238" />
        <line x1="178" y1="238" x2="180" y2="246" />
      </g>
      <!-- Circuit glowing lines -->
      <ellipse cx="160" cy="208" rx="72" ry="24" fill="#0f172a" stroke="${col.rim}" stroke-width="1.8" />
      <circle cx="160" cy="205" r="42" fill="none" stroke="${col.neon}" stroke-width="1.5" stroke-dasharray="8,6" />
      <text x="160" y="222" font-family="'Prompt', sans-serif" font-size="9" fill="${col.gear}" text-anchor="middle" font-weight="bold">
        ⚙ วท.ท่าหลวงฯ THALUANG TECH ⚙
      </text>
    `;
  }

  // 2. Flowers
  getFlowerSVG(flowerType) {
    switch (flowerType) {
      case 'marigold':
        // ดอกดาวเรืองสีเหลืองทอง
        return `
          <g id="flower-marigold">
            <circle cx="160" cy="195" r="22" fill="#eab308" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
            <circle cx="160" cy="195" r="16" fill="#facc15" />
            <circle cx="160" cy="195" r="10" fill="#fef08a" />
            <circle cx="160" cy="195" r="5" fill="#ca8a04" />
            <!-- petals fluff -->
            <path d="M 142 195 Q 160 180 178 195 Q 160 210 142 195 Z" fill="#eab308" opacity="0.6" />
            <path d="M 160 178 Q 175 195 160 212 Q 145 195 160 178 Z" fill="#f59e0b" opacity="0.6" />
          </g>
        `;
      case 'orchid':
        // ดอกกล้วยไม้สีม่วง
        return `
          <g id="flower-orchid">
            <ellipse cx="160" cy="182" rx="8" ry="14" fill="#a855f7" stroke="#7e22ce" stroke-width="0.8" />
            <ellipse cx="146" cy="195" rx="13" ry="8" fill="#c084fc" stroke="#7e22ce" stroke-width="0.8" />
            <ellipse cx="174" cy="195" rx="13" ry="8" fill="#c084fc" stroke="#7e22ce" stroke-width="0.8" />
            <ellipse cx="152" cy="204" rx="9" ry="12" fill="#9333ea" stroke="#6b21a8" stroke-width="0.8" />
            <ellipse cx="168" cy="204" rx="9" ry="12" fill="#9333ea" stroke="#6b21a8" stroke-width="0.8" />
            <!-- Center yellow lip -->
            <circle cx="160" cy="196" r="4.5" fill="#facc15" stroke="#ca8a04" stroke-width="0.8" />
          </g>
        `;
      case 'rose':
        // ดอกกุหลาบสีแดง
        return `
          <g id="flower-rose">
            <circle cx="160" cy="195" r="18" fill="#be123c" />
            <path d="M 150 190 Q 160 180 170 190 Q 165 205 150 190 Z" fill="#e11d48" />
            <path d="M 152 196 Q 160 205 168 196 Q 160 192 152 196 Z" fill="#fda4af" />
            <circle cx="160" cy="195" r="4" fill="#881337" />
          </g>
        `;
      case 'lotus_white':
        // ดอกบัวขาว
        return `
          <g id="flower-lotus-white">
            <ellipse cx="160" cy="194" rx="16" ry="12" fill="#f8fafc" stroke="#94a3b8" stroke-width="1" />
            <ellipse cx="152" cy="192" rx="10" ry="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8" />
            <ellipse cx="168" cy="192" rx="10" ry="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8" />
            <circle cx="160" cy="194" r="5" fill="#facc15" />
          </g>
        `;
      case 'lotus_pink':
      default:
        // ดอกบัวหลวงสีชมพู
        return `
          <g id="flower-lotus-pink">
            <ellipse cx="160" cy="194" rx="18" ry="13" fill="#f472b6" stroke="#db2777" stroke-width="1" />
            <ellipse cx="150" cy="192" rx="10" ry="14" fill="#fbcfe8" stroke="#f472b6" stroke-width="0.8" />
            <ellipse cx="170" cy="192" rx="10" ry="14" fill="#fbcfe8" stroke="#f472b6" stroke-width="0.8" />
            <ellipse cx="160" cy="190" rx="8" ry="12" fill="#ffffff" stroke="#f472b6" stroke-width="0.8" />
            <circle cx="160" cy="194" r="5" fill="#facc15" />
          </g>
        `;
    }
  }

  // 3. Candle & Incense Sticks
  getCandleAndIncenseSVG(candleColor = 'gold', withIncense = true) {
    const candleColors = {
      gold: { wax: '#f59e0b', stroke: '#b45309', flame: '#fbbf24' },
      pink: { wax: '#ec4899', stroke: '#9d174d', flame: '#f43f5e' },
      red: { wax: '#dc2626', stroke: '#991b1b', flame: '#ef4444' },
      white: { wax: '#f8fafc', stroke: '#94a3b8', flame: '#fbbf24' }
    };
    const cCol = candleColors[candleColor] || candleColors.gold;

    let incenseSVG = '';
    if (withIncense) {
      incenseSVG = `
        <!-- 3 Joss Sticks (ธูป 3 ดอก) -->
        <g id="incense-sticks" stroke-linecap="round">
          <!-- Stick 1 -->
          <line x1="148" y1="180" x2="142" y2="108" stroke="#78350f" stroke-width="2.5" />
          <line x1="142" y1="108" x2="140" y2="82" stroke="#ea580c" stroke-width="2.2" />
          <circle cx="140" cy="81" r="1.5" fill="#fef08a" />
          <!-- Stick 2 (Center) -->
          <line x1="151" y1="180" x2="149" y2="102" stroke="#78350f" stroke-width="2.5" />
          <line x1="149" y1="102" x2="148" y2="76" stroke="#ea580c" stroke-width="2.2" />
          <circle cx="148" cy="75" r="1.5" fill="#fef08a" />
          <!-- Stick 3 -->
          <line x1="154" y1="180" x2="157" y2="106" stroke="#78350f" stroke-width="2.5" />
          <line x1="157" y1="106" x2="159" y2="80" stroke="#ea580c" stroke-width="2.2" />
          <circle cx="159" cy="79" r="1.5" fill="#fef08a" />

          <!-- Delicate Smoke Trails -->
          <path d="M 140 80 Q 135 60 142 45 T 138 25" stroke="rgba(226, 232, 240, 0.45)" stroke-width="1.2" fill="none" />
          <path d="M 148 74 Q 152 55 146 38 T 150 18" stroke="rgba(226, 232, 240, 0.5)" stroke-width="1.2" fill="none" />
          <path d="M 159 78 Q 164 58 158 40 T 162 22" stroke="rgba(226, 232, 240, 0.4)" stroke-width="1.2" fill="none" />
        </g>
      `;
    }

    return `
      ${incenseSVG}
      <!-- Candle Cylinder -->
      <g id="krathong-candle">
        <!-- Candle Body -->
        <path d="M 163 182 L 163 118 Q 168 116 173 118 L 173 182 Z" 
              fill="${cCol.wax}" stroke="${cCol.stroke}" stroke-width="1.2" />
        <ellipse cx="168" cy="118" rx="5" ry="2" fill="#fffbeb" stroke="${cCol.stroke}" stroke-width="0.8" />
        
        <!-- Candle Wick -->
        <line x1="168" y1="118" x2="168" y2="108" stroke="#1f2937" stroke-width="1.8" />

        <!-- Flickering Flame Outer Glow -->
        <circle cx="168" cy="95" r="26" fill="url(#flameGlow)" opacity="0.85" />

        <!-- Candle Flame with CSS animation class -->
        <g class="candle-flame">
          <!-- Outer orange flame -->
          <path d="M 168 80 C 160 92, 161 106, 168 108 C 175 106, 176 92, 168 80 Z" 
                fill="#f97316" filter="drop-shadow(0 0 8px #f59e0b)" />
          <!-- Inner yellow core -->
          <path d="M 168 86 C 163 94, 164 105, 168 106 C 172 105, 173 94, 168 86 Z" 
                fill="#fef08a" />
          <!-- White hottest center -->
          <ellipse cx="168" cy="100" rx="2" ry="4" fill="#ffffff" />
        </g>
      </g>
    `;
  }

  // 4. Toppings: Coins & Ribbon
  getToppingsSVG(withCoin = true, withRibbon = true) {
    let coinSVG = '';
    let ribbonSVG = '';

    if (withCoin) {
      coinSVG = `
        <!-- Lucky Thai 9-Baht Gold Coin -->
        <g id="lucky-coins" transform="translate(195, 192)">
          <circle cx="0" cy="0" r="10" fill="url(#goldSheen)" stroke="#b45309" stroke-width="1.5" />
          <circle cx="0" cy="0" r="7" fill="none" stroke="#78350f" stroke-width="0.8" stroke-dasharray="2,2" />
          <text x="0" y="3.5" font-family="'Sarabun', sans-serif" font-size="8" fill="#78350f" font-weight="bold" text-anchor="middle">๙</text>
        </g>
        <g id="lucky-coins-2" transform="translate(125, 196)">
          <circle cx="0" cy="0" r="8" fill="url(#goldSheen)" stroke="#b45309" stroke-width="1.2" />
          <text x="0" y="3" font-family="'Sarabun', sans-serif" font-size="7" fill="#78350f" font-weight="bold" text-anchor="middle">๙</text>
        </g>
      `;
    }

    if (withRibbon) {
      ribbonSVG = `
        <!-- Royal Thai Gold Ribbon Bow -->
        <g id="krathong-ribbon" transform="translate(160, 224)">
          <path d="M 0 0 C -25 -10, -25 -2, 0 3 C 25 -2, 25 -10, 0 0 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1" />
          <circle cx="0" cy="1" r="3.5" fill="#fef08a" stroke="#b45309" stroke-width="1" />
          <path d="M -3 3 L -12 16 L -5 14 L 0 5" fill="#f59e0b" stroke="#b45309" stroke-width="0.8" />
          <path d="M 3 3 L 12 16 L 5 14 L 0 5" fill="#f59e0b" stroke="#b45309" stroke-width="0.8" />
        </g>
      `;
    }

    return `${coinSVG} ${ribbonSVG}`;
  }
}

// Global Builder Instance
window.krathongBuilder = new KrathongBuilder();
