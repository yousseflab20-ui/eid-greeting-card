import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { MoonStar } from 'lucide-react';
import CardForm from './CardForm';
import CardPreview from './CardPreview';

function App() {
  const [config, setConfig] = useState({
    name: 'Youssef',
    template: 'template-photo-1',
    message: 'Taqabbal Allah minna wa minkum. May Allah bless you and your family with joy, peace, and baraka.',
  });

  const cardRef = useRef(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `eid-card-${config.name || 'greeting'}.png`;
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
