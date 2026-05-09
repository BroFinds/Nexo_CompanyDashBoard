import React, { useState, useRef, useEffect, useMemo } from 'react';

/**
 * SearchableSelect — a filterable dropdown for large option lists.
 * Props:
 *   options: [{ value, label, sub? }]
 *   value: selected value
 *   onChange: (value) => void
 *   placeholder: string
 *   noResultsText: string
 */
const SearchableSelect = ({ options = [], value, onChange, placeholder = 'Search...', noResultsText = 'No results found' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const optionRefs = useRef([]);

  const selectedOption = options.find(o => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(() => options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    (o.sub && o.sub.toLowerCase().includes(search.toLowerCase()))
  ), [options, search]);

  // Reset highlight when filter changes or dropdown opens
  useEffect(() => {
    if (!isOpen) return;
    const selectedIdx = filtered.findIndex(o => o.value === value);
    setHighlightIndex(selectedIdx >= 0 ? selectedIdx : 0);
  }, [isOpen, filtered, value]);

  // Keep highlighted option in view
  useEffect(() => {
    if (!isOpen) return;
    const el = optionRefs.current[highlightIndex];
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex, isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
    // Return focus to the trigger so keyboard users can keep tabbing.
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setSearch('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearch('');
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleTriggerKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  const handleListKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filtered.length === 0) return;
      setHighlightIndex(i => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filtered.length === 0) return;
      setHighlightIndex(i => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setHighlightIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setHighlightIndex(Math.max(0, filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[highlightIndex];
      if (opt) handleSelect(opt.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    } else if (e.key === 'Tab') {
      // Let focus leave naturally and close the menu.
      setIsOpen(false);
      setSearch('');
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: '8px',
          border: '1px solid var(--border-subtle)', outline: 'none',
          fontSize: '0.9rem', fontFamily: 'inherit', textAlign: 'left',
          backgroundColor: 'white', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          color: selectedOption ? 'var(--color-text-main)' : 'var(--color-text-subtle)',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginLeft: '8px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          backgroundColor: 'white', borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 100, overflow: 'hidden',
          animation: 'fadeSlideIn 0.15s ease',
        }}>
          {/* Search Input */}
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleListKeyDown}
                placeholder="Type to search..."
                aria-autocomplete="list"
                aria-controls="searchable-select-list"
                aria-activedescendant={filtered[highlightIndex] ? `ss-opt-${filtered[highlightIndex].value}` : undefined}
                style={{
                  width: '100%', padding: '8px 8px 8px 32px', borderRadius: '6px',
                  border: '1px solid var(--border-subtle)', outline: 'none',
                  fontSize: '0.85rem', fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            id="searchable-select-list"
            role="listbox"
            style={{ maxHeight: '200px', overflowY: 'auto' }}
          >
            {filtered.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: '0.85rem' }}>
                {noResultsText}
              </div>
            )}
            {filtered.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isHighlighted = idx === highlightIndex;
              const bg = isHighlighted
                ? 'var(--bg-body)'
                : isSelected
                  ? 'var(--color-primary-subtle)'
                  : 'transparent';
              return (
                <button
                  key={opt.value}
                  id={`ss-opt-${opt.value}`}
                  ref={el => { optionRefs.current[idx] = el; }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  style={{
                    width: '100%', padding: '10px 12px', border: 'none',
                    backgroundColor: bg,
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    display: 'flex', flexDirection: 'column', gap: '2px',
                    transition: 'background 0.1s',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: isSelected ? '600' : '400', color: 'var(--color-text-main)' }}>
                    {opt.label}
                  </span>
                  {opt.sub && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>{opt.sub}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SearchableSelect;
