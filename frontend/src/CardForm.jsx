import React from 'react';
import { Download } from 'lucide-react';
import { EID_TEMPLATES } from './templates';

const CardForm = ({ config, setConfig, onDownload }) => {
    return (
        <div className="rounded-[28px] border border-white/70 bg-white/[0.82] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-6">
            <div className="mb-6">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Eid studio</p>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">Customize Your Card</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">Choose a template, add the receiver name, then write the du'a you want to send.</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-800">Smia dyal li ghadi tsift lih</label>
                    <input
                        type="text"
                        className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-950 shadow-inner shadow-slate-100/70 transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                        value={config.name}
                        onChange={(e) => setConfig({ ...config, name: e.target.value })}
                        placeholder="e.g. Youssef"
                        maxLength={30}
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-800">Select Template</label>
                    <div className="grid max-h-[430px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
                        {EID_TEMPLATES.map((tpl) => (
                            <button
                                key={tpl.id}
                                onClick={() => setConfig({ ...config, template: tpl.id })}
                                className={`group overflow-hidden rounded-2xl border p-2 text-left transition-all ${config.template === tpl.id
                                    ? 'border-emerald-500 bg-emerald-50 shadow-[0_14px_30px_rgba(16,185,129,0.16)] ring-4 ring-emerald-500/10'
                                    : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]'
                                    }`}
                            >
                                <span className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-slate-900">
                                    <img
                                        src={tpl.image}
                                        alt=""
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        style={{ objectPosition: tpl.objectPosition }}
                                    />
                                </span>
                                <span className="mt-2 block text-sm font-black text-slate-900">{tpl.name}</span>
                                <small className="block text-xs font-semibold text-slate-500">{tpl.mood}</small>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-bold text-slate-800">Du'a / Message</label>
                    <textarea
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-950 shadow-inner shadow-slate-100/70 transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                        rows="3"
                        value={config.message}
                        onChange={(e) => setConfig({ ...config, message: e.target.value })}
                        placeholder="Taqabbal Allah minna wa minkum..."
                        maxLength={180}
                    />
                </div>

                <div className="mt-6 border-t border-slate-200/70 pt-4">
                    <button
                        onClick={onDownload}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-4 font-black text-white shadow-[0_18px_36px_rgba(15,23,42,0.25)] transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-emerald-500/25 active:scale-[0.98]"
                    >
                        <Download size={19} strokeWidth={2.4} />
                        Download High-Quality Card
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CardForm;
