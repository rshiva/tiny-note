// components/SearchBar.jsx
import React, { useRef, useEffect } from 'react';

const SearchBar = ({
  searchQuery,
  onFocus,
  onChange,
  searchResults,
  showDropdown,
  onSelectNote,
  onDeleteNote,
  onClose
}) => {
  const containerRef = useRef(null);

  // Close dropdown if click occurs outside this component.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (onClose) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div ref={containerRef} style={{ position: 'relative', marginBottom: '10px' }}>
      <input
        type="text"
        placeholder="Search notes..."
        value={searchQuery}
        onFocus={onFocus}
        onChange={onChange}
        style={{ width: '100%', padding: '8px' }}
      />
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '40px',
          left: 0,
          right: 0,
          border: '1px solid #ccc',
          backgroundColor: 'white',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {searchResults.length === 0 ? (
            <div style={{ padding: '8px' }}>No notes are present</div>
          ) : (
            searchResults.map(note => (
              <div key={note.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer'
              }}>
                <span onClick={() => onSelectNote(note)}>
                  {note.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note.id);
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  &#x1F5D1;
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
