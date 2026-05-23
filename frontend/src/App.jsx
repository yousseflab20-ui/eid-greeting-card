import React, { useRef, useState } from 'react';
import { MoonStar } from 'lucide-react';
import CardForm from './CardForm';
import CardPreview from './CardPreview';
import { getTemplateById } from './templates';

const TEXT_TONES = {
  gold: {
    kicker: '#fde68a',
    name: '#ffffff',
    message: '#fffbeb',
    line: 'rgba(253,230,138,.82)',
  },
  ivory: {
    kicker: 'rgba(255,255,255,.72)',
    name: '#ffffff',
    message: 'rgba(255,255,255,.9)',
    line: 'rgba(255,255,255,.72)',
  },
  mono: {
    kicker: 'rgba(255,255,255,.78)',
    name: '#ffffff',
    message: 'rgba(255,255,255,.9)',
    line: 'rgba(255,255,255,.72)',
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
  const name = config.name?.trim();
  const message = config.message?.trim();
  if (!name && !message) return;

  const layout = template.downloadText;
  const tone = TEXT_TONES[template.messageTone] || TEXT_TONES.ivory;
  const x = width * layout.x;
  let y = height * layout.y;
  const maxWidth = width * layout.maxWidth;
  const align = layout.align;

  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0,0,0,.68)';
  ctx.shadowBlur = width * 0.018;
  ctx.shadowOffsetY = width * 0.004;

  if (name) {
    ctx.fillStyle = tone.kicker;
    ctx.font = `900 ${Math.max(12, width * 0.022)}px Arial, sans-serif`;
    ctx.fillText('ILA / TO', x, y);
    y += width * 0.04;

    ctx.fillStyle = tone.name;
    ctx.font = `700 ${Math.max(28, width * 0.058)}px Georgia, serif`;
    ctx.fillText(name, x, y, maxWidth);
    y += width * 0.068;
  }

  if (name && message) {
    drawDivider(ctx, x, y, align, Math.min(maxWidth * 0.45, width * 0.18), tone.line);
    y += width * 0.028;
  }

  if (message) {
    ctx.fillStyle = tone.message;
    ctx.font = `700 ${Math.max(14, width * 0.027)}px Arial, sans-serif`;
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
    name: 'Youssef',
    template: 'template-photo-1',
    message: 'Taqabbal Allah minna wa minkum. May Allah bless you and your family with joy, peace, and baraka.',
  });

  const cardRef = useRef(null);

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
      const fileName = (config.name || 'greeting').replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '');
      link.download = `eid-card-${fileName || 'greeting'}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
      alert('Could not download image. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#eef4f1] font-sans text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(16,185,129,0.22),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(245,158,11,0.18),transparent_24%),linear-gradient(135deg,#f8fafc_0%,#edf7f2_48%,#eef2ff_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(90deg,black,transparent_82%)]" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 pb-3 pt-8 md:px-8">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 shadow-sm backdrop-blur">
          <MoonStar size={17} strokeWidth={2.4} />
          Eid Al Adha
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            Card Studio
          </h1>
          <p className="mt-2 max-w-2xl text-base font-medium leading-relaxed text-slate-600">
            Select a template, add the receiver name, and place a clean du'a directly on the card.
          </p>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-start gap-8 p-4 md:p-8 lg:flex-row">
        <div className="w-full flex-1 lg:max-w-md">
          <CardForm config={config} setConfig={setConfig} onDownload={handleDownload} />
        </div>

        <div className="flex w-full flex-1 items-center justify-center rounded-[32px] border border-white/70 bg-white/45 p-4 shadow-[0_28px_90px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-8 lg:justify-center">
          <div className="relative group">
            <CardPreview config={config} ref={cardRef} />
            <div className="pointer-events-none absolute -inset-4 rounded-[30px] border border-emerald-500/0 transition-all duration-300 group-hover:border-emerald-500/20" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
