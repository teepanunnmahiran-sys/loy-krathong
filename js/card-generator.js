/**
 * ระบบสร้างการ์ดอวยพรและแชร์ความสุข (Wish Blessing Card Generator & Social Sharing)
 * สร้างภาพการ์ดความละเอียดสูง (1080x1080) เพื่อดาวน์โหลดและแชร์ลง Social Media
 */

class CardGenerator {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1080;
    this.canvas.height = 1080;
    this.ctx = this.canvas.getContext('2d');
  }

  generateCard(krathongData, onComplete) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Background Gradient (Royal Purple to Deep Night Navy)
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.4, 100, w * 0.5, h * 0.5, 750);
    bg.addColorStop(0, '#2e1065');
    bg.addColorStop(0.5, '#1e1147');
    bg.addColorStop(1, '#0b0f29');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // 2. Ornate Thai Golden Borders
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(55, 55, w - 110, h - 110);

    // Corner Ornaments
    this.drawCornerOrnament(ctx, 45, 45);
    this.drawCornerOrnament(ctx, w - 45, 45);
    this.drawCornerOrnament(ctx, 45, h - 45);
    this.drawCornerOrnament(ctx, w - 45, h - 45);

    // 3. Header Texts
    ctx.textAlign = 'center';

    // College Name
    ctx.font = 'bold 34px "Prompt", "Kanit", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('วิทยาลัยเทคนิคท่าหลวงซีเมนต์ไทยอนุสรณ์', w * 0.5, 125);

    // Event Subtitle
    ctx.font = '26px "Prompt", "Kanit", sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('สืบสานประเพณีลอยกระทงออนไลน์ ประจำปี ๒๕๖๙', w * 0.5, 170);

    // Decorative line
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.beginPath();
    ctx.moveTo(w * 0.5 - 200, 195);
    ctx.lineTo(w * 0.5 + 200, 195);
    ctx.stroke();

    // 4. Render Krathong Art in Center
    const svgStr = window.krathongBuilder ? window.krathongBuilder.renderSVG(krathongData.krathongConfig, 380) : '';
    const img = new Image();
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      // Draw Krathong
      ctx.drawImage(img, w * 0.5 - 190, 210, 380, 380);
      URL.revokeObjectURL(url);

      // 5. User Details
      const displayName = krathongData.isAnonymous ? 'ผู้ร่วมกิจกรรมนิรนาม' : krathongData.userName;
      const deptText = krathongData.department ? `(${krathongData.department})` : '';

      ctx.font = 'bold 36px "Prompt", "Kanit", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(displayName, w * 0.5, 625);

      if (deptText) {
        ctx.font = '22px "Sarabun", "Prompt", sans-serif';
        ctx.fillStyle = '#c084fc';
        ctx.fillText(deptText, w * 0.5, 665);
      }

      // 6. Wish / Prayer Box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.lineWidth = 1.5;
      const boxW = 860;
      const boxH = 160;
      const boxX = w * 0.5 - boxW * 0.5;
      const boxY = 705;

      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 16);
      ctx.fill();
      ctx.stroke();

      // Wish quotes
      ctx.font = 'italic 28px "Sarabun", "Prompt", sans-serif';
      ctx.fillStyle = '#fef08a';
      this.wrapText(ctx, `“ ${krathongData.wish} ”`, w * 0.5, boxY + 60, boxW - 80, 40);

      // 7. Blessing Message
      ctx.font = 'bold 28px "Prompt", "Kanit", sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('ขอให้คำอธิษฐานของคุณเป็นจริง ดั่งสายน้ำที่นำพาสิ่งดีงามมาสู่ชีวิต', w * 0.5, 925);

      // 8. Footer Date & Stamp
      const dateStr = new Date(krathongData.timestamp || Date.now()).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      ctx.font = '20px "Sarabun", "Prompt", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`บันทึก ณ ลำน้ำป่าสัก • วันที่ ${dateStr}`, w * 0.5, 975);

      // Deliver image URL
      const dataUrl = this.canvas.toDataURL('image/png');
      if (onComplete) onComplete(dataUrl);
    };

    img.src = url;
  }

  drawCornerOrnament(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#fbbf24';
    ctx.font = '24px "Sarabun", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', x, y);
    ctx.restore();
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  downloadCard(dataUrl, fileName = 'loy_krathong_thaluang.png') {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  shareToSocial(platform, wishText) {
    const currentUrl = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`ร่วมลอยกระทงออนไลน์กับวิทยาลัยเทคนิคท่าหลวงซีเมนต์ไทยอนุสรณ์ 🌸 คำอธิษฐาน: "${wishText || 'ขอขมาพระแม่คงคา'}"`);

    if (platform === 'line') {
      window.open(`https://line.me/R/msg/text/?${text}%20${currentUrl}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${text}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${currentUrl}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(`${decodeURIComponent(text)} ${window.location.href}`).then(() => {
        alert('คัดลอกข้อความและลิงก์กิจกรรมเรียบร้อยแล้ว!');
      });
    }
  }
}

// Global Card Generator Instance
window.cardGenerator = new CardGenerator();
