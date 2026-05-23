import React, { forwardRef } from 'react';
import { getTemplateById } from './templates';

const toneStyles = {
    gold: {
        kicker: '#fde68a',
        name: '#ffffff',
        message: '#fffbeb',
        line: 'linear-gradient(90deg, rgba(0,0,0,0), rgba(253,230,138,.8), rgba(0,0,0,0))',
    },
    ivory: {
        kicker: 'rgba(255,255,255,.7)',
        name: '#ffffff',
        message: 'rgba(255,255,255,.9)',
        line: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.7), rgba(255,255,255,0))',
    },
    mono: {
        kicker: 'rgba(255,255,255,.76)',
        name: '#ffffff',
        message: 'rgba(255,255,255,.9)',
        line: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.7), rgba(255,255,255,0))',
    },
};

const CardPreview = forwardRef(({ config }, ref) => {
    const { name, template, message } = config;
    const t = getTemplateById(template);
    const hasPersonalText = Boolean(name?.trim() || message?.trim());
    const tone = toneStyles[t.messageTone];

    return (
        <div
            ref={ref}
            className="relative overflow-hidden rounded-[22px] transition-all duration-300"
            style={{
                aspectRatio: t.aspectRatio,
                width: t.previewWidth,
                backgroundColor: '#0f172a',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,.25)',
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
                <>
                    <div
                        className={`pointer-events-none absolute z-10 ${t.messageWashClass}`}
                        style={t.messageWashStyle}
                    />
                    <div
                        className={`absolute z-20 flex flex-col ${t.messageWidth} ${t.messagePosition} ${t.messageAlign}`}
                        style={{ textShadow: '0 2px 14px rgba(0,0,0,.62)' }}
                    >
                    {name?.trim() && (
                        <p
                            className="mb-1 text-[10px] font-black uppercase tracking-[0.26em]"
                            style={{ color: tone.kicker }}
                        >
                            Ila / To
                        </p>
                    )}
                    {name?.trim() && (
                        <p
                            className="font-serif text-[23px] font-bold leading-none"
                            style={{ color: tone.name }}
                        >
                            {name}
                        </p>
                    )}
                    {name?.trim() && message?.trim() && (
                        <span className="my-2 h-px w-16" style={{ background: tone.line }} />
                    )}
                    {message?.trim() && (
                        <p
                            className="max-w-full text-[11px] font-semibold leading-[1.42]"
                            style={{ color: tone.message }}
                        >
                            {message}
                        </p>
                    )}
                    </div>
                </>
            )}
        </div>
    );
});

export default CardPreview;
