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
        className="search-input"
      />
      {showDropdown && (
        <div className="search-dropdown">
          {searchResults.length === 0 ? (
            <div className="no-notes">No notes found</div>
          ) : (
            searchResults.map((note) => (
              <div key={note.id} className="note-item">
                <span onClick={() => onSelectNote(note)}>
                  {note.content
                    ? note.content.replace(/<[^>]+>/g, "").slice(0, 30)
                    : "Untitled Note"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note.id);
                  }}
                  className="delete-note-button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1.2em"
                    height="1.2em"
                    viewBox="0 0 16 16"
                  >
                    <g fill="#df1515">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"></path>
                      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"></path>
                    </g>
                  </svg>
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
