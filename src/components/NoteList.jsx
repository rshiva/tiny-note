import React from 'react';

const NoteList = ({ notes, onNoteSelect }) => { // Add onNoteSelect prop
  return (
    <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
      <h3>Note List</h3>
      {notes.length === 0 ? <p>No notes found</p> : (
        <ul>
          {notes.map(note => (
            <li
              key={note.id}
              onClick={() => onNoteSelect(note)} // Call onNoteSelect on click, passing the note
              style={{ cursor: 'pointer', padding: '5px', borderBottom: '1px solid #eee' }} // Basic styling for clickable items
            >
              {note.title} (ID: {note.id})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NoteList;