// components/SearchBar.jsx
import React from 'react';

const SearchBar = ({
  searchQuery,
  onFocus,
  onChange,
  searchResults,
  showDropdown,
  onSelectNote,
  onDeleteNote
}) => {
  return (
    <div style={{ position: 'relative', marginBottom: '10px' }}>
      <input
        type="text"
        placeholder="Search notes..."
        value={searchQuery}
        onFocus={onFocus}
        onChange={onChange}
        style={{ width: '100%', padding: '8px' }}
      />
      {showDropdown && searchResults.length > 0 && (
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
          {searchResults.map(note => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
