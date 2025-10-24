import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    actions?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    closeButton?: boolean;
    disableClose?: boolean;
    className?: string;
    footerClassName?: string;
    bodyClassName?: string;
    headerClassName?: string;
    hideDivider?: boolean;
    centered?: boolean;
    fullscreenOnMobile?: boolean;
}

const sizeMap: Record<NonNullable<ModalProps['size']>, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'w-full h-full max-w-none rounded-none'
};

const Modal: React.FC<ModalProps> = ({
    open,
    onClose,
    title,
    description,
    children,
    actions,
    size = 'lg',
    closeButton = true,
    disableClose = false,
    className = '',
    footerClassName = '',
    bodyClassName = '',
    headerClassName = '',
    hideDivider = false,
    centered = true,
    fullscreenOnMobile = false
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const [show, setShow] = useState(open);

    useEffect(() => {
        if (open) setShow(true);
    }, [open]);

    const handleClose = useCallback(() => {
        if (disableClose) return;
        setShow(false);
        setTimeout(() => onClose(), 200);
    }, [disableClose, onClose]);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !disableClose) handleClose();
            if (e.key === 'Tab') {
                if (!dialogRef.current) return;
                const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (!focusables.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [open, disableClose, handleClose]);

    useEffect(() => {
        if (open && dialogRef.current) {
            const focusable = dialogRef.current.querySelector<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            (focusable || dialogRef.current).focus();
        }
    }, [open]);

    if (!open) return null;

    const headerId = title ? 'modal-title-' + Math.random().toString(36).slice(2) : undefined;

    const content = (
        <div className={`fixed inset-0 z-50 flex ${centered ? 'items-center justify-center' : 'items-start justify-center'} px-4 sm:px-6 py-6 sm:py-12`}>
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => { if (!disableClose) handleClose(); }}
                aria-hidden="true"
            />
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={headerId}
                className={`relative w-full ${fullscreenOnMobile ? '' : sizeMap[size]} ${className} max-h-[90vh] overflow-hidden border border-gray-200 shadow-xl rounded-xl bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 flex flex-col outline-none transition-all duration-300 ease-in-out transform ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                tabIndex={-1}
            >
                {(title || closeButton) && (
                    <div className={`flex items-start justify-between gap-4 px-5 pt-4 ${hideDivider ? '' : 'pb-3 border-b'} bg-white/70 backdrop-blur-sm rounded-t-xl ${headerClassName}`}>
                        <div className="flex flex-col">
                            {title && <h3 id={headerId} className="text-base font-semibold leading-6 text-gray-800 dark:text-gray-100">{title}</h3>}
                            {description && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
                        </div>
                        {closeButton && (
                            <button
                                type="button"
                                onClick={() => !disableClose && handleClose()}
                                className="inline-flex items-center justify-center rounded-md p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
                                disabled={disableClose}
                                aria-label="Close modal"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path d="M18 6 6 18" />
                                    <path d="M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
                <div className={`px-5 py-4 overflow-y-auto custom-scrollbar flex-1 text-sm ${bodyClassName}`}>{children}</div>
                {actions && (
                    <div className={`px-5 py-3 ${hideDivider ? '' : 'border-t'} flex justify-end gap-2 bg-white/70 backdrop-blur-sm rounded-b-xl ${footerClassName}`}>
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(content, document.body);
};

export default Modal;