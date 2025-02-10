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

  const handleDelete = (noteId) => {
    
      onDeleteNote(noteId);
    
  };

  return (
    <div ref={containerRef} className="search-container">
      <input
        type="text"
        placeholder="Search notes..."
        value={searchQuery}
        onFocus={onFocus}
        onChange={onChange}
        className="dropdown-search"
      />
      {showDropdown && (
        <div className="search-dropdown">
          {searchResults.length === 0 ? (
            <div className="no-notes">No notes found</div>
          ) : (
            searchResults.map(note => (
              <div key={note.id} className="note-item">
                <span onClick={() => onSelectNote(note)}>
                  {note.content ? note.content.replace(/<[^>]+>/g, '').slice(0, 30) : 'Untitled Note'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note.id);
                  }}
                  className="delete-note-button"
                >
                  🗑️
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
