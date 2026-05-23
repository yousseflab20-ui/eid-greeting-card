import React, { useRef, useState } from 'react';
import { CheckCircle2, Gift, MoonStar, Sparkles, X } from 'lucide-react';
import CardForm from './CardForm';
import CardPreview from './CardPreview';
import { getTemplateById } from './templates';

const COLOR_TONES = {
  white: {
    kicker: 'rgba(255,255,255,.76)',
    name: '#ffffff',
    from: 'rgba(255,255,255,.82)',
    message: 'rgba(255,255,255,.9)',
    line: 'rgba(255,255,255,.72)',
  },
  gold: {
    kicker: '#fde68a',
    name: '#ffffff',
    from: '#fde68a',
    message: '#fffbeb',
    line: 'rgba(253,230,138,.82)',
  },
};

const FONT_TONES = {
  classic: {
    name: 'Georgia, "Times New Roman", serif',
    body: 'Georgia, "Times New Roman", serif',
  },
  modern: {
    name: 'Arial, sans-serif',
    body: 'Arial, sans-serif',
  },
  arabic: {
    name: 'Tahoma, Arial, sans-serif',
    body: 'Tahoma, Arial, sans-serif',
  },
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const drawWash = (ctx, width, height, wash) => {
  let gradient;

  if (wash === 'leftGreen') {
    gradient = ctx.createLinearGradient(0, 0, width * 0.45, 0);
    gradient.addColorStop(0, 'rgba(2,44,34,.42)');
    gradient.addColorStop(0.55, 'rgba(2,44,34,.14)');
    gradient.addColorStop(1, 'rgba(2,44,34,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width * 0.48, height);
    return;
  }

  if (wash === 'leftBlack') {
    gradient = ctx.createLinearGradient(0, 0, width * 0.46, 0);
    gradient.addColorStop(0, 'rgba(0,0,0,.62)');
    gradient.addColorStop(0.58, 'rgba(0,0,0,.22)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width * 0.5, height);
    return;
  }

  const strength = wash === 'bottomBlackStrong' ? 0.62 : wash === 'bottomGreen' ? 0.55 : wash === 'bottomBlackSoft' ? 0.42 : 0.5;
  const color = wash === 'bottomGreen' ? '2,44,34' : '0,0,0';
  gradient = ctx.createLinearGradient(0, height, 0, height * 0.58);
  gradient.addColorStop(0, `rgba(${color},${strength})`);
  gradient.addColorStop(0.58, `rgba(${color},.18)`);
  gradient.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, height * 0.55, width, height * 0.45);
};

const wrapText = (ctx, text, maxWidth) => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });

  if (line) lines.push(line);
  return lines;
};

const drawDivider = (ctx, x, y, align, width, color) => {
  const startX = align === 'right' ? x - width : align === 'center' ? x - width / 2 : x;
  const gradient = ctx.createLinearGradient(startX, y, startX + width, y);
  gradient.addColorStop(0, 'rgba(255,255,255,0)');
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(startX, y, width, 2);
};

const drawDownloadText = (ctx, template, config, width, height) => {
  const name = config.hideName ? '' : config.name?.trim();
  const fromName = config.fromName?.trim();
  const message = config.hideDua ? '' : config.message?.trim();
  if (!name && !fromName && !message) return;

  const layout = template.downloadText;
  const tone = COLOR_TONES[config.textColor] || COLOR_TONES.white;
  const fonts = FONT_TONES[config.fontStyle] || FONT_TONES.classic;
  const x = width * layout.x;
  let y = height * layout.y;
  const maxWidth = width * layout.maxWidth;
  const align = layout.align;

  ctx.save();
  ctx.textAlign = align;
  ctx.direction = 'rtl';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0,0,0,.68)';
  ctx.shadowBlur = width * 0.018;
  ctx.shadowOffsetY = width * 0.004;

  if (name) {
    ctx.fillStyle = tone.kicker;
    ctx.font = `900 ${Math.max(12, width * 0.022)}px ${fonts.body}`;
    ctx.fillText('إلى', x, y);
    y += width * 0.04;

    ctx.fillStyle = tone.name;
    ctx.font = `700 ${Math.max(28, width * 0.058)}px ${fonts.name}`;
    ctx.fillText(name, x, y, maxWidth);
    y += width * 0.068;
  }

  if (fromName) {
    ctx.fillStyle = tone.from;
    ctx.font = `700 ${Math.max(12, width * 0.024)}px ${fonts.body}`;
    ctx.fillText(`من طرف ${fromName}`, x, y, maxWidth);
    y += width * 0.044;
  }

  if ((name || fromName) && message) {
    drawDivider(ctx, x, y, align, Math.min(maxWidth * 0.45, width * 0.18), tone.line);
    y += width * 0.028;
  }

  if (message) {
    ctx.fillStyle = tone.message;
    ctx.font = `700 ${Math.max(14, width * 0.027)}px ${fonts.body}`;
    const lines = wrapText(ctx, message, maxWidth).slice(0, 6);
    const lineHeight = Math.max(18, width * 0.038);
    lines.forEach((line) => {
      ctx.fillText(line, x, y, maxWidth);
      y += lineHeight;
    });
  }

  ctx.restore();
};

function App() {
  const [config, setConfig] = useState({
    name: 'يوسف',
    fromName: 'محمد',
    template: 'template-photo-3',
    message: 'تقبل الله منا ومنكم، وجعل عيدكم فرحا وبركة وسعادة.',
    fontStyle: 'arabic',
    hideName: false,
    hideDua: false,
    textColor: 'gold',
  });
  const [downloadDone, setDownloadDone] = useState(false);

  const cardRef = useRef(null);
  const selectedTemplate = getTemplateById(config.template);

  const handleDownload = async () => {
    try {
      const template = getTemplateById(config.template);
      const img = await loadImage(template.image);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawWash(ctx, canvas.width, canvas.height, template.downloadText.wash);
      drawDownloadText(ctx, template, config, canvas.width, canvas.height);

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      const fileName = (config.name || 'eid-card').replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '');
      link.download = `eid-card-${fileName || 'eid-card'}.png`;
      link.click();
      setDownloadDone(true);
    } catch (err) {
      console.error('Failed to download image', err);
      alert('تعذر تحميل الصورة. حاول مرة أخرى.');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 font-sans text-slate-950">
      <div
        className="pointer-events-none absolute -inset-24 scale-110 bg-cover bg-center blur-[46px] transition-all duration-700"
        style={{ backgroundImage: `url(${selectedTemplate.image})` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(250,252,249,0.96)_0%,rgba(245,250,247,0.9)_35%,rgba(18,24,38,0.52)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(16,185,129,0.24),transparent_26%),radial-gradient(circle_at_72%_10%,rgba(245,158,11,0.2),transparent_22%),radial-gradient(circle_at_78%_72%,rgba(15,23,42,0.36),transparent_36%)]" />
      <div className="pointer-events-none absolute left-[-8%] top-[10%] h-[54rem] w-[54rem] rounded-full border border-emerald-900/10 bg-[conic-gradient(from_160deg,rgba(16,185,129,0.08),rgba(245,158,11,0.14),rgba(255,255,255,0),rgba(16,185,129,0.08))] blur-sm" />
      <div className="pointer-events-none absolute right-[-14%] top-[-10%] h-[42rem] w-[42rem] rounded-full border border-amber-200/30 bg-[radial-gradient(circle,rgba(253,230,138,0.28),rgba(253,230,138,0.05)_42%,transparent_68%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.11] [background-image:linear-gradient(30deg,rgba(15,23,42,.45)_12%,transparent_12.5%,transparent_87%,rgba(15,23,42,.45)_87.5%,rgba(15,23,42,.45)),linear-gradient(150deg,rgba(15,23,42,.45)_12%,transparent_12.5%,transparent_87%,rgba(15,23,42,.45)_87.5%,rgba(15,23,42,.45)),linear-gradient(30deg,rgba(15,23,42,.45)_12%,transparent_12.5%,transparent_87%,rgba(15,23,42,.45)_87.5%,rgba(15,23,42,.45)),linear-gradient(150deg,rgba(15,23,42,.45)_12%,transparent_12.5%,transparent_87%,rgba(15,23,42,.45)_87.5%,rgba(15,23,42,.45))] [background-position:0_0,0_0,22px_39px,22px_39px] [background-size:44px_78px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(90deg,black,transparent_82%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950/20 to-transparent" />

      <header className="relative z-10 mx-auto grid w-full max-w-7xl gap-5 px-4 pb-3 pt-8 text-right md:px-8 lg:grid-cols-[1fr_auto] lg:items-end" dir="rtl">
        <div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-2 text-xs font-black tracking-[0.08em] text-emerald-800 shadow-sm backdrop-blur">
            <MoonStar size={17} strokeWidth={2.4} />
            صانع بطاقات عيد الأضحى
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            صمّم بطاقة عيد كبيرة بدعاء واسم من تحب
          </h1>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-slate-600">
            اختار قالب بصورة جميلة، كتب اسم الشخص، زيد دعاء، وحمّل بطاقة عيد الأضحى بجودة عالية.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/15 bg-slate-950/90 p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.28)] backdrop-blur-xl">
          <p className="font-serif text-3xl font-bold leading-none text-amber-100">
            عيد الأضحى مبارك
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white/85">
              <Sparkles size={14} />
              أدعية جاهزة
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-200/15 px-3 py-2 text-xs font-bold text-amber-100">
              <Gift size={14} />
              تحميل PNG
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-start gap-8 p-4 md:p-8 lg:flex-row">
        <div className="w-full flex-1 lg:max-w-md">
          <CardForm config={config} setConfig={setConfig} onDownload={handleDownload} />
        </div>

        <div className="flex min-h-[760px] w-full flex-1 flex-col items-center justify-center gap-5 rounded-[32px] border border-white/70 bg-white/55 p-4 shadow-[0_34px_100px_rgba(15,23,42,0.16)] backdrop-blur-2xl sm:p-8 lg:justify-center">
          <div className="flex w-full max-w-[560px] items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/65 px-4 py-3 text-right shadow-sm backdrop-blur" dir="rtl">
            <div>
              <p className="text-xs font-black tracking-[0.12em] text-emerald-800">معاينة مباشرة</p>
              <p className="text-sm font-bold text-slate-700">{selectedTemplate.name}</p>
            </div>
            <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
              عيد الأضحى
            </div>
          </div>

          <div className="relative group">
            <CardPreview config={config} ref={cardRef} />
            <div className="pointer-events-none absolute -inset-4 rounded-[30px] border border-emerald-500/0 transition-all duration-300 group-hover:border-emerald-500/20" />
          </div>
        </div>
      </main>

      {downloadDone && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-6 text-center shadow-[0_30px_90px_rgba(15,23,42,0.35)]">
            <button
              type="button"
              onClick={() => setDownloadDone(false)}
              className="mr-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={34} strokeWidth={2.4} />
            </div>
            <h2 className="text-2xl font-black text-slate-950">تم إنشاء البطاقة بنجاح</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
              تم تحميل بطاقة عيد الأضحى على جهازك. يمكنك الآن إرسالها لمن تحب.
            </p>
            <button
              type="button"
              onClick={() => setDownloadDone(false)}
              className="mt-6 w-full rounded-2xl bg-slate-950 py-3 font-black text-white transition-all hover:bg-emerald-600"
            >
              تم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
