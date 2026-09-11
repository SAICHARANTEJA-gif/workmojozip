import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Languages, Globe2, Check } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { SupportedLanguage } from '../../types';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

export interface LanguageSelectorProps {
  /** Style variant for different UI contexts */
  variant?: 'header' | 'mojo' | 'auth' | 'subtle';
  /** External controlled open state (optional) */
  isOpen?: boolean;
  /** Callback when open state changes (optional) */
  onOpenChange?: (open: boolean) => void;
  /** Optional container class name */
  className?: string;
  /** Optional button class name override */
  buttonClassName?: string;
  /** Icon size in px (defaults to 18) */
  iconSize?: number;
  /** Use Globe2 icon instead of Languages icon */
  useGlobeIcon?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'header',
  isOpen: controlledIsOpen,
  onOpenChange,
  className = '',
  buttonClassName = '',
  iconSize = 18,
  useGlobeIcon = false,
}) => {
  const { language, setLanguage } = useApp();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalIsOpen;

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const setOpenState = useCallback(
    (newVal: boolean) => {
      if (!isControlled) {
        setInternalIsOpen(newVal);
      }
      onOpenChange?.(newVal);
    },
    [isControlled, onOpenChange]
  );

  const toggleOpen = () => {
    setOpenState(!open);
  };

  const handleClose = useCallback(() => {
    setOpenState(false);
  }, [setOpenState]);

  const handleSelectLanguage = (code: SupportedLanguage) => {
    setLanguage(code);
    handleClose();
    buttonRef.current?.focus();
  };

  // Adjust popup positioning so it never overflows screen boundaries
  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownWidth = 216; // 216px max dropdown width
      const margin = 10; // minimum margin from screen edge

      // When aligned to container right (right: 0), screen left position is rect.right - dropdownWidth
      const screenLeftWhenRightAligned = rect.right - dropdownWidth;

      if (screenLeftWhenRightAligned < margin) {
        // Overflowing on left: shift right so it stays within viewport
        const shiftRight = margin - screenLeftWhenRightAligned;
        setMenuStyle({ right: `${-shiftRight}px` });
      } else if (rect.left + dropdownWidth > window.innerWidth - margin) {
        // Overflowing on right: align strictly to right edge of button
        setMenuStyle({ right: '0px' });
      } else {
        // Standard right alignment
        setMenuStyle({ right: '0px' });
      }
    }
  }, [open]);

  // Click outside and escape key listeners
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleClose]);

  // Keyboard navigation within the button
  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpenState(true);
      setTimeout(() => {
        const activeIdx = LANGUAGE_OPTIONS.findIndex(l => l.code === language);
        const focusIdx = activeIdx >= 0 ? activeIdx : 0;
        itemRefs.current[focusIdx]?.focus();
      }, 50);
    }
  };

  // Keyboard navigation within menu items
  const handleItemKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (index + 1) % LANGUAGE_OPTIONS.length;
      itemRefs.current[nextIdx]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (index - 1 + LANGUAGE_OPTIONS.length) % LANGUAGE_OPTIONS.length;
      itemRefs.current[prevIdx]?.focus();
    } else if (e.key === 'Tab') {
      handleClose();
    }
  };

  // Header Title by language
  const getHeaderTitle = () => {
    switch (language) {
      case 'te':
        return 'భాషను ఎంచుకోండి';
      case 'hi':
        return 'भाषा चुनें';
      case 'ta':
        return 'மொழியைத் தேர்ந்தெடுக்கவும்';
      default:
        return 'Select Language';
    }
  };

  // Button styles based on variant
  const getButtonStyles = () => {
    if (buttonClassName) return buttonClassName;

    switch (variant) {
      case 'mojo':
        return 'p-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 active:bg-white/25 rounded-full transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white';
      case 'auth':
      case 'header':
      default:
        return 'p-2 text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] active:bg-[#BFDBFE] border border-[#DBEAFE] rounded-xl transition-all shadow-2xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-1';
    }
  };

  const IconComponent = useGlobeIcon ? Globe2 : Languages;

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Language Icon Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        onKeyDown={handleButtonKeyDown}
        aria-label="Change language"
        title="Change language"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center justify-center select-none ${getButtonStyles()}`}
      >
        <IconComponent
          size={iconSize}
          className={variant === 'mojo' ? 'text-white' : 'text-[#2563EB]'}
          aria-hidden="true"
        />
      </button>

      {/* Language Dropdown Popover */}
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Available Languages"
          style={menuStyle}
          className="absolute top-full mt-2 z-50 w-52 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-1.5 animate-in fade-in zoom-in-95 duration-150 max-w-[calc(100vw-1.5rem)]"
        >
          {/* Popover Header with Blue + Yellow/Gold Theme */}
          <div className="px-3 py-2 border-b border-[#F1F5F9] flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#111827]">
              <Languages size={13} className="text-[#2563EB]" />
              <span>{getHeaderTitle()}</span>
            </div>
            <span
              className="w-2 h-2 rounded-full bg-[#F5A900] shadow-xs"
              title="WorkMojo Multilingual"
            />
          </div>

          {/* Language Options List */}
          <div className="space-y-0.5">
            {LANGUAGE_OPTIONS.map((lang, index) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  ref={el => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => handleSelectLanguage(lang.code)}
                  onKeyDown={e => handleItemKeyDown(e, index)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                    isSelected
                      ? 'bg-[#EFF6FF] text-[#2563EB] font-bold border border-[#DBEAFE] shadow-2xs'
                      : 'text-[#1E293B] hover:bg-[#F8FAFC] border border-transparent font-medium'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-black leading-tight">
                      {lang.nativeName}
                    </span>
                    {lang.code !== 'en' && (
                      <span className="text-[10px] text-[#64748B] font-semibold leading-tight mt-0.5">
                        {lang.name}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
