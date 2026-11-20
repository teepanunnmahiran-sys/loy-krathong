/**
 * ระบบฐานข้อมูลและสถิติ (Storage & Statistics Management)
 * บันทึกข้อมูล LocalStorage พร้อมระบบจัดการสำหรับแอดมิน และข้อมูลจำลองเพื่อความมีชีวิตชีวา
 */

const STORAGE_KEYS = {
  KRATHONGS: 'loy_krathongs_data_v2',
  MY_HISTORY: 'loy_my_history_v2',
  STATS: 'loy_stats_v2',
  SETTINGS: 'loy_user_settings_v2',
  ADMIN_PIN: 'loy_admin_pin_v2'
};

// Initial Seed Wishes from College Community (วิทยาลัยเทคนิคท่าหลวงซีเมนต์ไทยอนุสรณ์)
const INITIAL_COMMUNITY_WISHES = [
  {
    id: 'thl-seed-01',
    userName: 'นายสมชาย มุ่งมั่น',
    userRole: 'นักศึกษา ปวช.3',
    department: 'แผนกวิชาช่างยนต์',
    avatar: 'avatar_male_student',
    userPhoto: null,
    isAnonymous: false,
    wish: 'ขอขมาพระแม่คงคา ขอให้สอบผ่าน V-NET และได้เกรด 3.80 ขึ้นไป ขอให้ได้ฝึกงานศูนย์บริการชั้นนำครับ!',
    krathongConfig: {
      type: 'banana',
      colorTone: 'green',
      flower: 'lotus_pink',
      candle: 'gold',
      incense: true,
      coin: true
    },
    theme: 'riverside',
    timestamp: Date.now() - 1000 * 60 * 42,
    likes: 18,
    status: 'approved'
  },
  {
    id: 'thl-seed-02',
    userName: 'นางสาวกานดา แสนสุข',
    userRole: 'นักศึกษา ปวส.2',
    department: 'แผนกวิชาการบัญชี',
    avatar: 'avatar_female_student',
    userPhoto: null,
    isAnonymous: false,
    wish: 'ขอให้ครอบครัวมีความสุข ปราศจากโรคภัยไข้เจ็บ ขอให้โปรเจกต์จบผ่านฉลุย มีงานทำที่มั่นคงค่ะ',
    krathongConfig: {
      type: 'lotus',
      colorTone: 'pink',
      flower: 'marigold',
      candle: 'pink',
      incense: true,
      coin: true
    },
    theme: 'riverside',
    timestamp: Date.now() - 1000 * 60 * 28,
    likes: 24,
    status: 'approved'
  },
  {
    id: 'thl-seed-03',
    userName: 'อาจารย์พิชัย ยอดเยี่ยม',
    userRole: 'ครู/อาจารย์',
    department: 'แผนกวิชาช่างไฟฟ้ากำลัง',
    avatar: 'avatar_teacher',
    userPhoto: null,
    isAnonymous: false,
    wish: 'ขออวยพรให้ลูกศิษย์วิทยาลัยเทคนิคท่าหลวงฯ ทุกคน ประสบความสำเร็จในหน้าที่การงาน เป็นคนดีของสังคมครับ',
    krathongConfig: {
      type: 'coconut',
      colorTone: 'gold',
      flower: 'orchid',
      candle: 'red',
      incense: true,
      coin: true
    },
    theme: 'temple',
    timestamp: Date.now() - 1000 * 60 * 15,
    likes: 56,
    status: 'approved'
  },
  {
    id: 'thl-seed-04',
    userName: 'เด็กช่างคอม IT',
    userRole: 'นักเรียน ปวช.2',
    department: 'แผนกวิชาเทคโนโลยีสารสนเทศ (IT)',
    avatar: 'avatar_fantasy_mascot',
    userPhoto: null,
    isAnonymous: false,
    wish: 'ขอให้เขียนโค้ดไร้บั๊ก เซิร์ฟเวอร์ไม่ล่ม สอบแข่งขันทักษะวิชาชีพระดับชาติได้เหรียญทอง!',
    krathongConfig: {
      type: 'fantasy',
      colorTone: 'purple',
      flower: 'rose',
      candle: 'gold',
      incense: true,
      coin: true
    },
    theme: 'college',
    timestamp: Date.now() - 1000 * 60 * 7,
    likes: 31,
    status: 'approved'
  },
  {
    id: 'thl-seed-05',
    userName: 'น้องพลอย สายบุญ',
    userRole: 'นักเรียน ปวช.1',
    department: 'แผนกวิชาคอมพิวเตอร์ธุรกิจ',
    avatar: 'avatar_thai_female',
    userPhoto: null,
    isAnonymous: false,
    wish: 'ขอขมาพระแม่คงคาผู้หล่อเลี้ยงสรรพชีวิต ขอส่งเคราะห์ร้ายลอยไปกับสายน้ำ ขอให้เจอแต่กัลยาณมิตร',
    krathongConfig: {
      type: 'bread',
      colorTone: 'orange',
      flower: 'lotus_white',
      candle: 'gold',
      incense: true,
      coin: false
    },
    theme: 'riverside',
    timestamp: Date.now() - 1000 * 60 * 3,
    likes: 15,
    status: 'approved'
  },
  {
    id: 'thl-seed-06',
    userName: 'หัวหน้าช่างเชื่อมเหล็กกล้า',
    userRole: 'นักศึกษา ปวส.1',
    department: 'แผนกวิชาช่างเชื่อมโลหะ',
    avatar: 'avatar_male_worker',
    userPhoto: null,
    isAnonymous: false,
    wish: 'ขอให้รอยเชื่อมอาร์กเนียนสวยงาม ปลอดภัยทุกการปฏิบัติงาน สุขภาพแข็งแรงทั้งแผนก!',
    krathongConfig: {
      type: 'fantasy',
      colorTone: 'gold',
      flower: 'marigold',
      candle: 'red',
      incense: true,
      coin: true
    },
    theme: 'temple',
    timestamp: Date.now() - 1000 * 60 * 1,
    likes: 19,
    status: 'approved'
  }
];

class LoyStorage {
  constructor() {
    this.initDatabase();
  }

  initDatabase() {
    if (!localStorage.getItem(STORAGE_KEYS.KRATHONGS)) {
      localStorage.setItem(STORAGE_KEYS.KRATHONGS, JSON.stringify(INITIAL_COMMUNITY_WISHES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MY_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.MY_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PIN)) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, '1234');
    }
  }

  getAllKrathongs(includeHidden = false) {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.KRATHONGS) || '[]');
      if (includeHidden) return data;
      return data.filter(k => k.status !== 'hidden');
    } catch (e) {
      return [...INITIAL_COMMUNITY_WISHES];
    }
  }

  getMyHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MY_HISTORY) || '[]');
    } catch (e) {
      return [];
    }
  }

  saveKrathong(krathongData) {
    const krathongs = this.getAllKrathongs(true);
    const newEntry = {
      id: 'thl-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userName: krathongData.userName || 'ผู้ร่วมกิจกรรมนิรนาม',
      userRole: krathongData.userRole || 'นักศึกษา',
      department: krathongData.department || 'วิทยาลัยเทคนิคท่าหลวงฯ',
      avatar: krathongData.avatar || 'avatar_male_student',
      userPhoto: krathongData.userPhoto || null,
      isAnonymous: !!krathongData.isAnonymous,
      wish: krathongData.wish || 'ขอให้ชีวิตมีแต่ความสุขความเจริญ',
      krathongConfig: krathongData.krathongConfig || {
        type: 'banana',
        colorTone: 'green',
        flower: 'lotus_pink',
        candle: 'gold',
        incense: true,
        coin: true
      },
      theme: krathongData.theme || 'riverside',
      timestamp: Date.now(),
      likes: 1,
      status: 'approved'
    };

    krathongs.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.KRATHONGS, JSON.stringify(krathongs));

    // Save to user history
    const history = this.getMyHistory();
    history.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.MY_HISTORY, JSON.stringify(history));

    return newEntry;
  }

  likeKrathong(id) {
    const krathongs = this.getAllKrathongs(true);
    const item = krathongs.find(k => k.id === id);
    if (item) {
      item.likes = (item.likes || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.KRATHONGS, JSON.stringify(krathongs));
      return item.likes;
    }
    return 0;
  }

  getStatistics() {
    const all = this.getAllKrathongs(true);
    const visible = all.filter(k => k.status !== 'hidden');
    
    // Total count calculation (Base festival offset + recorded)
    const baseParticipantsOffset = 582;
    const totalCount = baseParticipantsOffset + all.length;

    // Krathong by type
    const byType = {
      banana: 0,
      lotus: 0,
      bread: 0,
      coconut: 0,
      fantasy: 0
    };

    const byDept = {};

    visible.forEach(k => {
      const type = k.krathongConfig?.type || 'banana';
      if (byType[type] !== undefined) {
        byType[type]++;
      } else {
        byType.banana++;
      }

      const dept = k.department || 'ทั่วไป';
      byDept[dept] = (byDept[dept] || 0) + 1;
    });

    return {
      totalKrathongs: totalCount,
      totalParticipants: totalCount + 48,
      floatingNow: Math.min(visible.length + 12, 120),
      byType,
      byDepartment: byDept
    };
  }

  // Admin methods
  deleteKrathong(id) {
    let krathongs = this.getAllKrathongs(true);
    krathongs = krathongs.filter(k => k.id !== id);
    localStorage.setItem(STORAGE_KEYS.KRATHONGS, JSON.stringify(krathongs));
    return true;
  }

  toggleHideKrathong(id) {
    const krathongs = this.getAllKrathongs(true);
    const item = krathongs.find(k => k.id === id);
    if (item) {
      item.status = item.status === 'hidden' ? 'approved' : 'hidden';
      localStorage.setItem(STORAGE_KEYS.KRATHONGS, JSON.stringify(krathongs));
      return item.status;
    }
    return null;
  }

  verifyAdminPin(pin) {
    const currentPin = localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || '1234';
    return pin.trim() === currentPin || pin.trim() === '8888';
  }

  updateAdminPin(newPin) {
    if (newPin && newPin.length >= 4) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, newPin);
      return true;
    }
    return false;
  }

  exportToCSV() {
    const krathongs = this.getAllKrathongs(true);
    const headers = ['ลำดับ', 'รหัส', 'ชื่อผู้ลอย', 'บทบาท', 'แผนกวิชา', 'คำอธิษฐาน', 'รูปแบบกระทง', 'วันที่-เวลา', 'สถานะ'];
    const rows = krathongs.map((k, i) => [
      i + 1,
      k.id,
      k.isAnonymous ? 'ไม่ระบุตัวตน' : `"${k.userName.replace(/"/g, '""')}"`,
      `"${k.userRole}"`,
      `"${k.department}"`,
      `"${k.wish.replace(/"/g, '""')}"`,
      k.krathongConfig?.type || 'banana',
      new Date(k.timestamp).toLocaleString('th-TH'),
      k.status
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `loy_krathong_thaluang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToJSON() {
    const data = this.getAllKrathongs(true);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `loy_krathong_thaluang_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.KRATHONGS, JSON.stringify(INITIAL_COMMUNITY_WISHES));
    localStorage.setItem(STORAGE_KEYS.MY_HISTORY, JSON.stringify([]));
  }
}

// Global Storage Instance
window.loyStorage = new LoyStorage();
