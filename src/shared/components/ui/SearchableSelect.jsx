import React, { useState, useRef, useEffect } from 'react';

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
  const containerRef = useRef(null);
  const inputRef = useRef(null);

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

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    (o.sub && o.sub.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  const handleOpen = () => {
    setIsOpen(true);
    setSearch('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
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
                placeholder="Type to search..."
                style={{
                  width: '100%', padding: '8px 8px 8px 32px', borderRadius: '6px',
                  border: '1px solid var(--border-subtle)', outline: 'none',
                  fontSize: '0.85rem', fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Options List */}
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: '0.85rem' }}>
                {noResultsText}
              </div>
            )}
            {filtered.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                style={{
                  width: '100%', padding: '10px 12px', border: 'none',
                  backgroundColor: opt.value === value ? 'var(--color-primary-subtle)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  display: 'flex', flexDirection: 'column', gap: '2px',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { if (opt.value !== value) e.currentTarget.style.backgroundColor = 'var(--bg-body)'; }}
                onMouseLeave={(e) => { if (opt.value !== value) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: opt.value === value ? '600' : '400', color: 'var(--color-text-main)' }}>
                  {opt.label}
                </span>
                {opt.sub && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>{opt.sub}</span>
                )}
              </button>
            ))}
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
