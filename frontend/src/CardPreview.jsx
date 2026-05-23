import React, { forwardRef } from 'react';
import { getTemplateById } from './templates';

const COLOR_STYLES = {
    white: {
        kicker: 'rgba(255,255,255,.76)',
        name: '#ffffff',
        from: 'rgba(255,255,255,.82)',
        message: 'rgba(255,255,255,.9)',
        line: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.72), rgba(255,255,255,0))',
    },
    gold: {
        kicker: '#fde68a',
        name: '#ffffff',
        from: '#fde68a',
        message: '#fffbeb',
        line: 'linear-gradient(90deg, rgba(0,0,0,0), rgba(253,230,138,.8), rgba(0,0,0,0))',
    },
};

const FONT_STYLES = {
    classic: {
        name: 'Georgia, "Times New Roman", serif',
        body: 'Georgia, "Times New Roman", serif',
    },
    modern: {
        name: 'Inter, Arial, sans-serif',
        body: 'Inter, Arial, sans-serif',
    },
    arabic: {
        name: 'Tahoma, Arial, sans-serif',
        body: 'Tahoma, Arial, sans-serif',
    },
};

const getDynamicHeight = (aspectRatio) => {
    if (aspectRatio === '9 / 16') return 'min(153vw, 711px)';
    if (aspectRatio === '2 / 3') return 'min(129vw, 600px)';
    if (aspectRatio === '1 / 1') return 'min(86vw, 400px)';
    return 'min(114vw, 530px)';
};

const CardPreview = forwardRef(({ config }, ref) => {
    const { name, fromName, template, message, hideName, hideDua, fontStyle, textColor } = config;
    const t = getTemplateById(template);
    console.log('Template:', t.id, 'aspectRatio:', t.aspectRatio, 'Computed height:', getDynamicHeight(t.aspectRatio));
    const showName = Boolean(name?.trim()) && !hideName;
    const showFrom = Boolean(fromName?.trim());
    const showMessage = Boolean(message?.trim()) && !hideDua;
    const hasPersonalText = showName || showFrom || showMessage;
    const tone = COLOR_STYLES[textColor] || COLOR_STYLES.white;
    const fonts = FONT_STYLES[fontStyle] || FONT_STYLES.classic;

    return (
        <div
            ref={ref}
            className="relative overflow-hidden rounded-[22px] transition-all duration-300"
            style={{
                width: 'min(86vw, 400px)',
                height: getDynamicHeight(t.aspectRatio),
                backgroundColor: '#0f172a',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,.25)',
            }}
        >
            <img
                src={t.image}
                alt={t.name}
                className="absolute inset-0 h-full w-full select-none object-cover"
                style={{ objectPosition: t.objectPosition || 'center' }}
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
                        dir="rtl"
                        style={{ textShadow: '0 2px 14px rgba(0,0,0,.62)' }}
                    >
                        {showName && (
                            <p
                                className="mb-1 text-[10px] font-black tracking-[0.18em]"
                                style={{ color: tone.kicker, fontFamily: fonts.body }}
                            >
                                إلى
                            </p>
                        )}
                        {showName && (
                            <p
                                className="text-[23px] font-bold leading-none"
                                style={{ color: tone.name, fontFamily: fonts.name }}
                            >
                                {name}
                            </p>
                        )}
                        {showFrom && (
                            <p
                                className="mt-1 text-[11px] font-bold leading-snug"
                                style={{ color: tone.from, fontFamily: fonts.body }}
                            >
                                من طرف {fromName}
                            </p>
                        )}
                        {(showName || showFrom) && showMessage && (
                            <span className="my-2 h-px w-16" style={{ background: tone.line }} />
                        )}
                        {showMessage && (
                            <p
                                className="max-w-full text-[11px] font-semibold leading-[1.42]"
                                style={{ color: tone.message, fontFamily: fonts.body }}
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
