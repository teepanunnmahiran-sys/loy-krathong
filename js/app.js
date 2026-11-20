/**
 * ลอยกระทงออนไลน์ - วิทยาลัยเทคนิคท่าหลวงซีเมนต์ไทยอนุสรณ์
 * สคริปต์หลักควบคุมการทำงานของแอปพลิเคชัน (Main Application Orchestrator)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Components
  const app = new LoyKrathongApp();
  window.loyApp = app;
});

class LoyKrathongApp {
  constructor() {
    this.currentView = 'home';
    this.currentTheme = 'riverside';

    // Krathong Configuration
    this.krathongConfig = {
      type: 'banana',
      colorTone: 'green',
      flower: 'lotus_pink',
      candle: 'gold',
      incense: true,
      coin: true,
      ribbon: true
    };

    // User Profile & Wish Form
    this.userForm = {
      userName: '',
      userRole: 'นักศึกษา ปวช.',
      department: 'แผนกวิชาช่างยนต์',
      avatar: 'avatar_male_student',
      userPhoto: null,
      wish: '',
      isAnonymous: false
    };

    this.river = null;
    this.lastFloatedKrathong = null;

    this.init();
  }

  init() {
    // Initialize River Canvas
    this.river = new RiverCanvas('river-canvas');
    this.river.onKrathongClickCallback = (data) => this.showCommunityKrathongDetail(data);

    // Initialize UI Handlers
    this.setupNavigation();
    this.setupKrathongCustomizer();
    this.setupWishForm();
    this.setupAudioControls();
    this.setupTempleFair();
    this.setupAdminPanel();
    this.startLiveClock();
    this.updateStatsDisplay();

    // Render Initial Krathong Preview
    this.updateKrathongPreview();

    // Periodic simulation of live new krathongs from community
    setInterval(() => {
      this.simulateCommunityActivity();
    }, 18000);
  }

  // Live Clock in Thai Buddhist Era Format
  startLiveClock() {
    const clockEl = document.getElementById('thai-live-clock');
    const updateTime = () => {
      const now = new Date();
      const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
      const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];

      const dayName = thaiDays[now.getDay()];
      const day = now.getDate();
      const month = thaiMonths[now.getMonth()];
      const year = now.getFullYear() + 543;
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      if (clockEl) {
        clockEl.innerText = `วัน${dayName}ที่ ${day} ${month} พ.ศ. ${year} • ${hours}:${minutes}:${seconds} น.`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  // Navigation between Views & Modals
  setupNavigation() {
    const navButtons = document.querySelectorAll('[data-view-target]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = btn.getAttribute('data-view-target');
        this.switchView(targetView);
        if (window.loyAudio) window.loyAudio.playClick();
      });
    });

    // Theme Switcher Buttons
    const themeButtons = document.querySelectorAll('[data-theme-btn]');
    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedTheme = btn.getAttribute('data-theme-btn');
        this.setTheme(selectedTheme);
        themeButtons.forEach(b => b.classList.remove('ring-2', 'ring-amber-400'));
        btn.classList.add('ring-2', 'ring-amber-400');
        if (window.loyAudio) window.loyAudio.playClick();
      });
    });
  }

  switchView(viewName) {
    this.currentView = viewName;
    const views = ['home-view', 'creator-view', 'river-view', 'temple-view', 'stats-view', 'admin-view', 'pr-view'];

    views.forEach(vId => {
      const el = document.getElementById(vId);
      if (el) {
        if (vId === `${viewName}-view`) {
          el.classList.remove('hidden');
          el.classList.add('modal-enter');
        } else {
          el.classList.add('hidden');
        }
      }
    });

    // If river view is opened, ensure stats and tooltips are active
    if (viewName === 'river') {
      const riverHUD = document.getElementById('river-hud');
      if (riverHUD) riverHUD.classList.remove('hidden');
    } else {
      const riverHUD = document.getElementById('river-hud');
      if (riverHUD && viewName !== 'home') riverHUD.classList.add('hidden');
    }

    if (viewName === 'stats') {
      this.renderFullStatistics();
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setTheme(themeName) {
    this.currentTheme = themeName;
    if (this.river) {
      this.river.setTheme(themeName);
    }
  }

  // Krathong Customizer Setup
  setupKrathongCustomizer() {
    // 1. Base Krathong Type Selection
    const typeButtons = document.querySelectorAll('[data-krathong-type]');
    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-krathong-type');
        this.krathongConfig.type = type;

        // Reset color palette according to base type
        this.updateColorPaletteOptions(type);

        typeButtons.forEach(b => b.classList.remove('border-amber-400', 'bg-amber-400/20'));
        btn.classList.add('border-amber-400', 'bg-amber-400/20');

        this.updateKrathongPreview();
        if (window.loyAudio) window.loyAudio.playClick();
      });
    });

    // 2. Color Tone Selector
    this.updateColorPaletteOptions('banana');

    // 3. Flower Selector
    const flowerButtons = document.querySelectorAll('[data-flower]');
    flowerButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.krathongConfig.flower = btn.getAttribute('data-flower');
        flowerButtons.forEach(b => b.classList.remove('border-amber-400', 'bg-amber-400/20'));
        btn.classList.add('border-amber-400', 'bg-amber-400/20');
        this.updateKrathongPreview();
        if (window.loyAudio) window.loyAudio.playClick();
      });
    });

    // 4. Candle Selector
    const candleButtons = document.querySelectorAll('[data-candle]');
    candleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.krathongConfig.candle = btn.getAttribute('data-candle');
        candleButtons.forEach(b => b.classList.remove('border-amber-400', 'bg-amber-400/20'));
        btn.classList.add('border-amber-400', 'bg-amber-400/20');
        this.updateKrathongPreview();
        if (window.loyAudio) window.loyAudio.playClick();
      });
    });

    // 5. Toggles (Incense, Coin, Ribbon)
    const toggleIncense = document.getElementById('toggle-incense');
    if (toggleIncense) {
      toggleIncense.addEventListener('change', (e) => {
        this.krathongConfig.incense = e.target.checked;
        this.updateKrathongPreview();
      });
    }

    const toggleCoin = document.getElementById('toggle-coin');
    if (toggleCoin) {
      toggleCoin.addEventListener('change', (e) => {
        this.krathongConfig.coin = e.target.checked;
        this.updateKrathongPreview();
      });
    }

    const toggleRibbon = document.getElementById('toggle-ribbon');
    if (toggleRibbon) {
      toggleRibbon.addEventListener('change', (e) => {
        this.krathongConfig.ribbon = e.target.checked;
        this.updateKrathongPreview();
      });
    }
  }

  updateColorPaletteOptions(krathongType) {
    const colorContainer = document.getElementById('color-palette-container');
    if (!colorContainer) return;

    const colorOptionsMap = {
      banana: [
        { id: 'green', name: 'เขียวตองสด', hex: '#22c55e' },
        { id: 'gold', name: 'ทองอร่าม', hex: '#f59e0b' },
        { id: 'purple', name: 'ม่วงอินทนิล', hex: '#9333ea' },
        { id: 'pink', name: 'ชมพูกลีบบัว', hex: '#ec4899' },
        { id: 'orange', name: 'ส้มประกายแสด', hex: '#f97316' },
        { id: 'blue', name: 'ฟ้าครามแม่น้ำ', hex: '#3b82f6' }
      ],
      lotus: [
        { id: 'pink', name: 'ชมพูบัวสวรรค์', hex: '#ec4899' },
        { id: 'white', name: 'ขาวบริสุทธิ์', hex: '#f8fafc' },
        { id: 'gold', name: 'ทองประกายมงคล', hex: '#f59e0b' },
        { id: 'purple', name: 'ม่วงกฤษณา', hex: '#a855f7' },
        { id: 'blue', name: 'ฟ้าธารา', hex: '#38bdf8' }
      ],
      bread: [
        { id: 'orange', name: 'ขนมปังอบสีทอง', hex: '#ea580c' },
        { id: 'gold', name: 'เนยน้ำตาลสดใส', hex: '#d97706' },
        { id: 'pink', name: 'สตอว์เบอร์รี่หวาน', hex: '#db2777' },
        { id: 'green', name: 'ใบเตยหอมละมุน', hex: '#16a34a' }
      ],
      coconut: [
        { id: 'gold', name: 'เทียนทองสายประทีป', hex: '#f59e0b' },
        { id: 'natural', name: 'กะลามะพร้าวธรรมชาติ', hex: '#78350f' }
      ],
      fantasy: [
        { id: 'purple', name: 'นีออนไซเบอร์ม่วง', hex: '#a855f7' },
        { id: 'gold', name: 'เฟืองจักรทองคำ วท.ท่าหลวงฯ', hex: '#fbbf24' },
        { id: 'blue', name: 'ไอทีดิจิทัลบลู', hex: '#0ea5e9' }
      ]
    };

    const options = colorOptionsMap[krathongType] || colorOptionsMap.banana;
    this.krathongConfig.colorTone = options[0].id;

    colorContainer.innerHTML = options.map((opt, idx) => `
      <button type="button" data-color-tone="${opt.id}" 
              class="color-btn flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${idx === 0 ? 'border-amber-400 bg-amber-400/20 text-amber-300' : 'border-slate-700 bg-slate-900/60 text-slate-300'}">
        <span class="w-3.5 h-3.5 rounded-full shadow-inner border border-white/20" style="background-color: ${opt.hex};"></span>
        <span>${opt.name}</span>
      </button>
    `).join('');

    const colorBtns = colorContainer.querySelectorAll('[data-color-tone]');
    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.krathongConfig.colorTone = btn.getAttribute('data-color-tone');
        colorBtns.forEach(b => {
          b.classList.remove('border-amber-400', 'bg-amber-400/20', 'text-amber-300');
          b.classList.add('border-slate-700', 'bg-slate-900/60', 'text-slate-300');
        });
        btn.classList.add('border-amber-400', 'bg-amber-400/20', 'text-amber-300');
        btn.classList.remove('border-slate-700', 'bg-slate-900/60', 'text-slate-300');
        this.updateKrathongPreview();
        if (window.loyAudio) window.loyAudio.playClick();
      });
    });
  }

  updateKrathongPreview() {
    const previewContainer = document.getElementById('krathong-preview-art');
    if (!previewContainer || !window.krathongBuilder) return;

    previewContainer.innerHTML = window.krathongBuilder.renderSVG(this.krathongConfig, 280);
  }

  // Wish Form & Photo Upload Setup
  setupWishForm() {
    // Avatar selection
    const avatarCards = document.querySelectorAll('[data-avatar-choice]');
    avatarCards.forEach(card => {
      card.addEventListener('click', () => {
        this.userForm.avatar = card.getAttribute('data-avatar-choice');
        avatarCards.forEach(c => c.classList.remove('ring-2', 'ring-amber-400', 'bg-purple-900/60'));
        card.classList.add('ring-2', 'ring-amber-400', 'bg-purple-900/60');
        if (window.loyAudio) window.loyAudio.playClick();
      });
    });

    // Custom Photo Upload
    const photoInput = document.getElementById('user-photo-input');
    const photoPreview = document.getElementById('photo-preview-thumb');
    const removePhotoBtn = document.getElementById('remove-photo-btn');

    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 3 * 1024 * 1024) {
            alert('รูปภาพมีขนาดใหญ่เกิน 3MB กรุณาเลือกรูปขนาดเล็กลง');
            return;
          }
          const reader = new FileReader();
          reader.onload = (evt) => {
            this.userForm.userPhoto = evt.target.result;
            if (photoPreview) {
              photoPreview.src = evt.target.result;
              photoPreview.classList.remove('hidden');
            }
            if (removePhotoBtn) removePhotoBtn.classList.remove('hidden');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (removePhotoBtn) {
      removePhotoBtn.addEventListener('click', () => {
        this.userForm.userPhoto = null;
        if (photoPreview) {
          photoPreview.src = '';
          photoPreview.classList.add('hidden');
        }
        if (photoInput) photoInput.value = '';
        removePhotoBtn.classList.add('hidden');
      });
    }

    // Quick Wish Buttons (คำอธิษฐานยอดนิยม)
    const quickWishChips = document.querySelectorAll('[data-quick-wish]');
    const wishTextarea = document.getElementById('wish-textarea');
    quickWishChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-quick-wish');
        if (wishTextarea) {
          wishTextarea.value = text;
          this.userForm.wish = text;
        }
        if (window.loyAudio) window.loyAudio.playClick();
      });
    });

    // Float Krathong Action Button (ปุ่มยืนยันและปล่อยกระทงลงน้ำ)
    const floatBtn = document.getElementById('btn-float-krathong');
    if (floatBtn) {
      floatBtn.addEventListener('click', () => this.handleFloatKrathong());
    }
  }

  handleFloatKrathong() {
    const nameInput = document.getElementById('user-name-input');
    const roleSelect = document.getElementById('user-role-select');
    const deptSelect = document.getElementById('user-dept-select');
    const wishTextarea = document.getElementById('wish-textarea');
    const anonCheckbox = document.getElementById('anon-checkbox');

    const name = nameInput?.value.trim() || 'เพื่อนชาวเทคนิคท่าหลวงฯ';
    const role = roleSelect?.value || 'นักศึกษา';
    const dept = deptSelect?.value || 'วิทยาลัยเทคนิคท่าหลวงซีเมนต์ไทยอนุสรณ์';
    const wish = wishTextarea?.value.trim() || 'ขอขมาพระแม่คงคา ขอให้ชีวิตราบรื่น มีแต่ความสุขความเจริญ';
    const isAnon = anonCheckbox ? anonCheckbox.checked : false;

    // Build data object
    const krathongData = {
      userName: name,
      userRole: role,
      department: dept,
      avatar: this.userForm.avatar,
      userPhoto: this.userForm.userPhoto,
      isAnonymous: isAnon,
      wish: wish,
      krathongConfig: { ...this.krathongConfig },
      theme: this.currentTheme
    };

    // Save to database
    const savedEntry = window.loyStorage.saveKrathong(krathongData);
    this.lastFloatedKrathong = savedEntry;

    // Play release audio
    if (window.loyAudio) {
      window.loyAudio.playKrathongRelease();
    }

    // Add to River Canvas with interactive release celebration
    if (this.river) {
      this.river.addKrathongToRiver(savedEntry);
    }

    // Switch to River view
    this.switchView('river');
    this.updateStatsDisplay();

    // Show Blessing Certificate Modal after a brief dramatic delay
    setTimeout(() => {
      this.showBlessingModal(savedEntry);
    }, 1200);
  }

  showBlessingModal(krathongData) {
    const modal = document.getElementById('blessing-modal');
    if (!modal) return;

    const modalTitle = document.getElementById('blessing-user-name');
    const modalDept = document.getElementById('blessing-dept');
    const modalWish = document.getElementById('blessing-wish-text');
    const cardPreviewImg = document.getElementById('blessing-card-preview');
    const downloadBtn = document.getElementById('btn-download-card');

    const displayName = krathongData.isAnonymous ? 'ผู้ร่วมกิจกรรมนิรนาม' : krathongData.userName;
    if (modalTitle) modalTitle.innerText = displayName;
    if (modalDept) modalDept.innerText = krathongData.department || 'วิทยาลัยเทคนิคท่าหลวงซีเมนต์ไทยอนุสรณ์';
    if (modalWish) modalWish.innerText = `“ ${krathongData.wish} ”`;

    // Generate high resolution shareable card via Canvas
    if (window.cardGenerator) {
      window.cardGenerator.generateCard(krathongData, (dataUrl) => {
        if (cardPreviewImg) {
          cardPreviewImg.src = dataUrl;
          cardPreviewImg.classList.remove('hidden');
        }
        if (downloadBtn) {
          downloadBtn.onclick = () => {
            window.cardGenerator.downloadCard(dataUrl, `loy_krathong_${krathongData.userName || 'card'}.png`);
            if (window.loyAudio) window.loyAudio.playClick();
          };
        }
      });
    }

    // Social Share buttons
    const lineShareBtn = document.getElementById('btn-share-line');
    if (lineShareBtn) {
      lineShareBtn.onclick = () => window.cardGenerator.shareToSocial('line', krathongData.wish);
    }

    const fbShareBtn = document.getElementById('btn-share-fb');
    if (fbShareBtn) {
      fbShareBtn.onclick = () => window.cardGenerator.shareToSocial('facebook', krathongData.wish);
    }

    const copyShareBtn = document.getElementById('btn-share-copy');
    if (copyShareBtn) {
      copyShareBtn.onclick = () => window.cardGenerator.shareToSocial('copy', krathongData.wish);
    }

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  // Audio Controls & Background Music Toggle
  setupAudioControls() {
    const musicBtn = document.getElementById('btn-toggle-music');
    const musicIcon = document.getElementById('music-icon');
    const soundBars = document.getElementById('sound-bars');

    const updateAudioUI = () => {
      const isPlaying = window.loyAudio && window.loyAudio.bgmPlaying && !window.loyAudio.isMuted;
      if (soundBars) {
        soundBars.style.display = isPlaying ? 'inline-flex' : 'none';
      }
      if (musicIcon) {
        musicIcon.className = isPlaying ? 'lucide lucide-volume-2' : 'lucide lucide-volume-x text-slate-400';
      }
    };

    if (musicBtn) {
      musicBtn.addEventListener('click', () => {
        if (window.loyAudio) {
          window.loyAudio.toggleMute();
          updateAudioUI();
        }
      });
    }

    // Autostart BGM on first user interaction anywhere
    const startAudioOnce = () => {
      if (window.loyAudio && !window.loyAudio.bgmPlaying && !window.loyAudio.isMuted) {
        window.loyAudio.startBGM();
        updateAudioUI();
      }
      document.removeEventListener('click', startAudioOnce);
      document.removeEventListener('touchstart', startAudioOnce);
    };
    document.addEventListener('click', startAudioOnce);
    document.addEventListener('touchstart', startAudioOnce);
  }

  // Temple Fair (งานวัดจำลอง) Setup
  setupTempleFair() {
    // 1. Siam Si (เซียมซี)
    const shakeBtn = document.getElementById('btn-shake-siamsi');
    const siamsiCylinder = document.getElementById('siamsi-cylinder');
    const siamsiResultCard = document.getElementById('siamsi-result-card');

    if (shakeBtn) {
      shakeBtn.addEventListener('click', () => {
        if (window.loyAudio) window.loyAudio.playSiamsiRattle();
        if (siamsiCylinder) siamsiCylinder.classList.add('shaking-siamsi');
        shakeBtn.disabled = true;
        shakeBtn.innerText = 'กำลังเขย่ากระบอกเซียมซี...';

        setTimeout(() => {
          if (siamsiCylinder) siamsiCylinder.classList.remove('shaking-siamsi');
          shakeBtn.disabled = false;
          shakeBtn.innerText = 'เขย่าเซียมซีอีกครั้ง';

          const result = window.templeFairManager.shakeSiamSi();
          this.displaySiamSiResult(result);
        }, 1200);
      });
    }

    // 2. Food Stalls (ซุ้มอาหารไทย)
    const foodStallsContainer = document.getElementById('temple-food-container');
    if (foodStallsContainer && TEMPLE_FOOD_STALLS) {
      foodStallsContainer.innerHTML = TEMPLE_FOOD_STALLS.map(food => `
        <div class="glass-panel p-4 rounded-2xl border border-amber-400/20 hover:border-amber-400 transition-all flex flex-col justify-between">
          <div>
            <div class="text-3xl mb-2">${food.icon}</div>
            <h4 class="font-bold text-amber-300 text-base mb-0.5">${food.name}</h4>
            <span class="inline-block px-2 py-0.5 rounded-full text-[11px] bg-purple-900/60 text-purple-200 border border-purple-400/30 mb-2">${food.tag}</span>
            <p class="text-xs text-slate-300 mb-3">${food.desc}</p>
          </div>
          <button type="button" data-taste-food="${food.id}" 
                  class="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-1 shadow">
            <span>ชิมของอร่อย (+แต้มบุญ)</span>
          </button>
        </div>
      `).join('');

      const tasteBtns = foodStallsContainer.querySelectorAll('[data-taste-food]');
      tasteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const foodId = btn.getAttribute('data-taste-food');
          const outcome = window.templeFairManager.tasteFood(foodId);
          if (outcome) {
            if (window.loyAudio) window.loyAudio.playClick();
            this.showToast(`✨ อร่อยฟิน! ได้รับ "${outcome.item.karmaBonus}"`);
          }
        });
      });
    }

    // 3. Lucky Star Charity (สอยดาวการกุศล)
    const starsContainer = document.getElementById('lucky-stars-field');
    if (starsContainer) {
      const colors = ['#f43f5e', '#fbbf24', '#38bdf8', '#a855f7', '#34d399', '#f97316'];
      starsContainer.innerHTML = Array.from({ length: 12 }).map((_, i) => {
        const col = colors[i % colors.length];
        return `
          <button type="button" data-lucky-star="${i}" 
                  class="group flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 hover:border-amber-400 hover:scale-105 transition-all">
            <span class="text-3xl group-hover:rotate-12 transition-transform filter drop-shadow(0 0 8px ${col})" style="color: ${col};">★</span>
            <span class="text-[11px] text-purple-200 mt-1 font-medium">ดาวดวงที่ ${i + 1}</span>
          </button>
        `;
      }).join('');

      const starBtns = starsContainer.querySelectorAll('[data-lucky-star]');
      starBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const res = window.templeFairManager.pluckStar();
          if (window.loyAudio) window.loyAudio.playBlessingBell();
          alert(`🎉 ยินดีด้วยครับ!\n${res.reward}\n\nแต้มบุญรวมของคุณ: ${res.totalKarma} แต้ม`);
        });
      });
    }
  }

  displaySiamSiResult(res) {
    const titleEl = document.getElementById('siamsi-title');
    const poemEl = document.getElementById('siamsi-poem');
    const generalEl = document.getElementById('siamsi-general');
    const studyEl = document.getElementById('siamsi-study');
    const loveEl = document.getElementById('siamsi-love');
    const numberEl = document.getElementById('siamsi-number');
    const cardEl = document.getElementById('siamsi-result-card');

    if (titleEl) titleEl.innerText = res.title;
    if (poemEl) poemEl.innerText = res.poem;
    if (generalEl) generalEl.innerText = res.general;
    if (studyEl) studyEl.innerText = res.study;
    if (loveEl) loveEl.innerText = res.love;
    if (numberEl) numberEl.innerText = res.luckyNumber;

    if (cardEl) {
      cardEl.classList.remove('hidden');
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Statistics Display
  updateStatsDisplay() {
    const stats = window.loyStorage.getStatistics();
    const totalEl = document.getElementById('stat-total-krathongs');
    const participantsEl = document.getElementById('stat-total-participants');
    const floatingEl = document.getElementById('stat-floating-now');

    if (totalEl) totalEl.innerText = stats.totalKrathongs.toLocaleString();
    if (participantsEl) participantsEl.innerText = stats.totalParticipants.toLocaleString();
    if (floatingEl) floatingEl.innerText = stats.floatingNow.toLocaleString();
  }

  renderFullStatistics() {
    this.updateStatsDisplay();
    const stats = window.loyStorage.getStatistics();
    const deptListEl = document.getElementById('dept-leaderboard-list');

    if (deptListEl && stats.byDepartment) {
      const sortedDepts = Object.entries(stats.byDepartment).sort((a, b) => b[1] - a[1]);
      const maxVal = Math.max(...sortedDepts.map(d => d[1]), 1);

      deptListEl.innerHTML = sortedDepts.map(([dept, count], idx) => {
        const pct = Math.round((count / maxVal) * 100);
        return `
          <div class="mb-3">
            <div class="flex justify-between items-center text-xs mb-1">
              <span class="font-medium text-purple-200">
                <strong class="text-amber-400 mr-1">#${idx + 1}</strong> ${dept}
              </span>
              <span class="font-bold text-amber-300">${count} กระทง</span>
            </div>
            <div class="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
              <div class="bg-gradient-to-r from-amber-500 to-amber-300 h-2.5 rounded-full transition-all duration-700" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Interactive Community Krathong Detail Modal
  showCommunityKrathongDetail(data) {
    const modal = document.getElementById('community-detail-modal');
    if (!modal) return;

    const nameEl = document.getElementById('comm-user-name');
    const deptEl = document.getElementById('comm-user-dept');
    const wishEl = document.getElementById('comm-wish-text');
    const artEl = document.getElementById('comm-krathong-art');
    const likeBtn = document.getElementById('comm-btn-like');
    const likeCountEl = document.getElementById('comm-like-count');

    const displayName = data.isAnonymous ? 'ผู้ร่วมกิจกรรมนิรนาม' : data.userName;
    if (nameEl) nameEl.innerText = displayName;
    if (deptEl) deptEl.innerText = data.department || 'วิทยาลัยเทคนิคท่าหลวงซีเมนต์ไทยอนุสรณ์';
    if (wishEl) wishEl.innerText = `“ ${data.wish} ”`;
    if (likeCountEl) likeCountEl.innerText = data.likes || 1;

    if (artEl && window.krathongBuilder) {
      artEl.innerHTML = window.krathongBuilder.renderSVG(data.krathongConfig, 220);
    }

    if (likeBtn) {
      likeBtn.onclick = () => {
        const newLikes = window.loyStorage.likeKrathong(data.id);
        if (likeCountEl) likeCountEl.innerText = newLikes;
        if (window.loyAudio) window.loyAudio.playBlessingBell();
        this.showToast('🌸 ร่วมส่งต่อคำอวยพรและแต้มบุญสำเร็จ!');
      };
    }

    modal.classList.remove('hidden');
    if (window.loyAudio) window.loyAudio.playClick();
  }

  // Admin Management Panel
  setupAdminPanel() {
    const adminLoginBtn = document.getElementById('btn-admin-login');
    const adminPinInput = document.getElementById('admin-pin-input');
    const adminLockSection = document.getElementById('admin-lock-screen');
    const adminDashboard = document.getElementById('admin-dashboard');

    if (adminLoginBtn && adminPinInput) {
      adminLoginBtn.addEventListener('click', () => {
        const pin = adminPinInput.value;
        if (window.loyStorage.verifyAdminPin(pin)) {
          if (adminLockSection) adminLockSection.classList.add('hidden');
          if (adminDashboard) adminDashboard.classList.remove('hidden');
          this.loadAdminTable();
          if (window.loyAudio) window.loyAudio.playBlessingBell();
        } else {
          alert('รหัส PIN ไม่ถูกต้อง (ค่าเริ่มต้นคือ 1234)');
        }
      });
    }

    // Export CSV / JSON
    const exportCsvBtn = document.getElementById('admin-export-csv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => window.loyStorage.exportToCSV());
    }

    const exportJsonBtn = document.getElementById('admin-export-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => window.loyStorage.exportToJSON());
    }

    // Search filter in admin
    const searchInput = document.getElementById('admin-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.loadAdminTable(e.target.value);
      });
    }
  }

  loadAdminTable(keyword = '') {
    const tableBody = document.getElementById('admin-table-body');
    if (!tableBody) return;

    const all = window.loyStorage.getAllKrathongs(true);
    const filtered = all.filter(k => {
      const q = keyword.toLowerCase();
      return (
        k.userName.toLowerCase().includes(q) ||
        k.department.toLowerCase().includes(q) ||
        k.wish.toLowerCase().includes(q)
      );
    });

    tableBody.innerHTML = filtered.map((item, idx) => `
      <tr class="border-b border-purple-900/40 hover:bg-purple-950/30">
        <td class="p-3 text-xs text-slate-400">${idx + 1}</td>
        <td class="p-3 text-xs font-semibold text-amber-300">
          ${item.isAnonymous ? '<span class="text-slate-400">นิรนาม</span>' : item.userName}
        </td>
        <td class="p-3 text-xs text-purple-200">${item.department}</td>
        <td class="p-3 text-xs text-slate-200 max-w-xs truncate" title="${item.wish}">"${item.wish}"</td>
        <td class="p-3 text-xs">
          <span class="px-2 py-0.5 rounded-full ${item.status === 'hidden' ? 'bg-red-950/60 text-red-300 border border-red-500/30' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'}">
            ${item.status === 'hidden' ? 'ซ่อน' : 'แสดง'}
          </span>
        </td>
        <td class="p-3 text-xs flex items-center gap-2">
          <button type="button" data-admin-toggle="${item.id}" class="text-amber-400 hover:text-amber-300 underline">
            ${item.status === 'hidden' ? 'แสดง' : 'ซ่อน'}
          </button>
          <button type="button" data-admin-delete="${item.id}" class="text-red-400 hover:text-red-300 underline">
            ลบ
          </button>
        </td>
      </tr>
    `).join('');

    // Attach actions
    tableBody.querySelectorAll('[data-admin-toggle]').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-admin-toggle');
        window.loyStorage.toggleHideKrathong(id);
        this.loadAdminTable(keyword);
      };
    });

    tableBody.querySelectorAll('[data-admin-delete]').forEach(b => {
      b.onclick = () => {
        if (confirm('ยืนยันที่จะลบคำอธิษฐานนี้หรือไม่?')) {
          const id = b.getAttribute('data-admin-delete');
          window.loyStorage.deleteKrathong(id);
          this.loadAdminTable(keyword);
          this.updateStatsDisplay();
        }
      };
    });
  }

  // Toast Notification
  showToast(message) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;

    toast.innerText = message;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.classList.add('opacity-100');

    setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0', 'pointer-events-none');
    }, 3000);
  }

  // Simulation of live incoming krathongs
  simulateCommunityActivity() {
    const names = ['น้องแพรว ช่างยนต์', 'นายวรวุฒิ ไฟฟ้า', 'เด็กช่างกลท่าหลวง', 'สาวบัญชีน่ารัก', 'อาจารย์สมศักดิ์', 'ช่างเชื่อมสู้ชีวิต'];
    const depts = [
      'แผนกวิชาช่างยนต์', 'แผนกวิชาช่างไฟฟ้ากำลัง', 'แผนกวิชาช่างกลโรงงาน',
      'แผนกวิชาการบัญชี', 'แผนกวิชาเทคโนโลยีสารสนเทศ (IT)', 'แผนกวิชาช่างเชื่อมโลหะ'
    ];
    const wishes = [
      'ขอให้ครอบครัวมีความสุข ปลอดภัยจากภยันตรายทั้งปวง',
      'ขอให้ได้เกรด A ทุกวิชา สอบติดมหาวิทยาลัยที่หวัง',
      'ขอขมาพระแม่คงคา รักษ์สิ่งแวดล้อมเพื่อโลกของเรา',
      'ขอให้เพื่อนๆ วท.ท่าหลวงฯ ประสบความสำเร็จในชีวิตทุกคนครับ'
    ];

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomDept = depts[Math.floor(Math.random() * depts.length)];
    const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
    const types = ['banana', 'lotus', 'bread', 'coconut', 'fantasy'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const simulated = {
      userName: randomName,
      userRole: 'นักศึกษา',
      department: randomDept,
      avatar: 'avatar_male_student',
      isAnonymous: false,
      wish: randomWish,
      krathongConfig: {
        type: randomType,
        colorTone: 'green',
        flower: 'lotus_pink',
        candle: 'gold',
        incense: true,
        coin: true,
        ribbon: true
      },
      theme: this.currentTheme
    };

    if (this.river) {
      this.river.addKrathongToRiver(simulated, {
        x: -50,
        y: this.river.height * 0.6 + Math.random() * (this.river.height * 0.35),
        scale: 0.35 + Math.random() * 0.35,
        speedX: 0.4 + Math.random() * 0.4,
        seed: Math.random() * 100
      });
      this.updateStatsDisplay();
    }
  }
}
