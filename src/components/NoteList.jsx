import React from 'react';

const NoteList = ({ notes, onNoteSelect, onDeleteNote }) => {
  return (
    <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
      <h3>Note List</h3>
      {notes.length === 0 ? <p>No notes found</p> : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {notes.map(note => (
            <li
              key={note.id}
              onClick={() => onNoteSelect(note)}
              style={{
                cursor: 'pointer',
                padding: '5px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{note.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note.id);
                }}
                style={{ marginLeft: '10px' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NoteList;
