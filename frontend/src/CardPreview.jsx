import React, { forwardRef } from 'react';
import { getTemplateById } from './templates';

const toneClasses = {
    dark: 'border-white/[0.18] bg-black/[0.24] text-white shadow-black/30',
    green: 'border-emerald-100/20 bg-emerald-950/[0.24] text-white shadow-emerald-950/30',
    light: 'border-black/10 bg-white/[0.50] text-slate-900 shadow-black/10',
};

const CardPreview = forwardRef(({ config }, ref) => {
    const { name, template, message } = config;
    const t = getTemplateById(template);
    const hasPersonalText = Boolean(name?.trim() || message?.trim());

    return (
        <div
            ref={ref}
            className="relative overflow-hidden rounded-[22px] bg-slate-900 shadow-2xl transition-all duration-300"
            style={{
                aspectRatio: t.aspectRatio,
                width: t.previewWidth,
            }}
        >
            <img
                src={t.image}
                alt={t.name}
                className="absolute inset-0 h-full w-full select-none object-cover"
                style={{ objectPosition: t.objectPosition }}
                draggable="false"
            />

            {hasPersonalText && (
                <div
                    className={`absolute z-10 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md ${t.tagWidth} ${t.tagPosition} ${toneClasses[t.tagTone]}`}
                >
                    {name?.trim() && (
                        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] opacity-70">
                            Ila / To
                        </p>
                    )}
                    {name?.trim() && (
                        <p className="font-serif text-[23px] font-bold leading-tight">
                            {name}
                        </p>
                    )}
                    {message?.trim() && (
                        <p className="mt-2 text-[13px] font-medium leading-snug opacity-90">
                            {message}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
});

export default CardPreview;
