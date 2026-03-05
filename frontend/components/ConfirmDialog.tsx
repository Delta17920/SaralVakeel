'use client';
import React, { useState, useCallback, createContext, useContext, useRef, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, X, Trash2 } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type DialogType = 'confirm-delete' | 'alert-error' | 'alert-success' | 'alert-info';

interface DialogOptions {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: DialogType;
}

interface DialogContextValue {
    confirm: (opts: DialogOptions) => Promise<boolean>;
    alert: (opts: Omit<DialogOptions, 'confirmLabel' | 'cancelLabel'>) => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────
const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog() {
    const ctx = useContext(DialogContext);
    if (!ctx) throw new Error('useDialog must be used inside <DialogProvider>');
    return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────
interface InternalState {
    open: boolean;
    opts: DialogOptions;
    isAlert: boolean;
    resolve: ((v: boolean) => void) | null;
}

const DEFAULT: InternalState = {
    open: false,
    opts: { message: '' },
    isAlert: false,
    resolve: null,
};

export function DialogProvider({ children, isDarkMode = false }: { children: React.ReactNode; isDarkMode?: boolean }) {
    const [state, setState] = useState<InternalState>(DEFAULT);
    const overlayRef = useRef<HTMLDivElement>(null);

    const confirm = useCallback((opts: DialogOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({ open: true, opts, isAlert: false, resolve });
        });
    }, []);

    const alert = useCallback((opts: Omit<DialogOptions, 'confirmLabel' | 'cancelLabel'>): Promise<void> => {
        return new Promise((resolve) => {
            setState({
                open: true,
                opts: { ...opts, confirmLabel: 'OK' },
                isAlert: true,
                resolve: () => resolve(),
            });
        });
    }, []);

    const handleConfirm = () => {
        state.resolve?.(true);
        setState(DEFAULT);
    };

    const handleCancel = () => {
        state.resolve?.(false);
        setState(DEFAULT);
    };

    // Close on overlay click
    const handleOverlay = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) handleCancel();
    };

    // Close on Escape
    useEffect(() => {
        if (!state.open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCancel(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [state.open]);

    const { opts, isAlert } = state;
    const type = opts.type ?? (isAlert ? 'alert-info' : 'confirm-delete');

    const iconMap = {
        'confirm-delete': <Trash2 className="w-5 h-5 text-red-500" />,
        'alert-error': <AlertTriangle className="w-5 h-5 text-red-500" />,
        'alert-success': <CheckCircle className="w-5 h-5 text-emerald-500" />,
        'alert-info': <Info className="w-5 h-5 text-[#8C6A4A]" />,
    };

    const iconBgMap = {
        'confirm-delete': isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
        'alert-error': isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
        'alert-success': isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
        'alert-info': isDarkMode ? 'bg-[#8C6A4A]/10' : 'bg-[#8C6A4A]/10',
    };

    const confirmBtnMap = {
        'confirm-delete': 'bg-red-500 hover:bg-red-600 text-white',
        'alert-error': 'bg-red-500 hover:bg-red-600 text-white',
        'alert-success': 'bg-emerald-500 hover:bg-emerald-600 text-white',
        'alert-info': 'bg-[#4A3F35] hover:bg-[#2E2A26] text-white',
    };

    return (
        <DialogContext.Provider value={{ confirm, alert }}>
            {children}

            {/* ── Modal ───────────────────────────────────────────── */}
            {state.open && (
                <div
                    ref={overlayRef}
                    onClick={handleOverlay}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                >
                    <div
                        className={`relative w-full max-w-sm rounded-2xl shadow-2xl p-6 transition-all duration-200
              ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-[#C8BEB4]'}`}
                        style={{ animation: 'dialogPop 0.18s cubic-bezier(0.22,1,0.36,1) both' }}
                    >
                        <style>{`
              @keyframes dialogPop {
                from { opacity: 0; transform: scale(0.92) translateY(8px); }
                to   { opacity: 1; transform: scale(1)   translateY(0); }
              }
            `}</style>

                        {/* Close X */}
                        <button
                            onClick={handleCancel}
                            className={`absolute top-4 right-4 p-1 rounded-lg transition-colors
                ${isDarkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800' : 'text-[#8C7B6B] hover:text-[#2E2A26] hover:bg-[#F6F1E8]'}`}
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Icon + Title */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconBgMap[type]}`}>
                                {iconMap[type]}
                            </div>
                            <div className="min-w-0 pt-0.5">
                                <h3 className={`font-semibold text-base ${isDarkMode ? 'text-gray-100' : 'text-[#2E2A26]'}`}>
                                    {opts.title ?? (type === 'confirm-delete' ? 'Delete Document' : type === 'alert-error' ? 'Error' : type === 'alert-success' ? 'Success' : 'Notice')}
                                </h3>
                                <p className={`text-sm mt-1 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-[#4B463F]'}`}>
                                    {opts.message}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={`flex gap-3 mt-5 ${isAlert ? 'justify-end' : 'justify-end'}`}>
                            {!isAlert && (
                                <button
                                    onClick={handleCancel}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border
                    ${isDarkMode
                                            ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                                            : 'border-[#C8BEB4] text-[#4B463F] hover:bg-[#F6F1E8]'
                                        }`}
                                >
                                    {opts.cancelLabel ?? 'Cancel'}
                                </button>
                            )}
                            <button
                                onClick={handleConfirm}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${confirmBtnMap[type]}`}
                            >
                                {opts.confirmLabel ?? 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DialogContext.Provider>
    );
}
