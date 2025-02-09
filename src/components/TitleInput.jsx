import React from 'react';

const TitleInput = ({ activeNote, handleTitleChange }) => {
  if (!activeNote) return null;

  return (
    <input
      type="text"
      value={activeNote.title}
      onChange={handleTitleChange}
      placeholder="Enter note title..."
      style={{ width: '100%', padding: '8px', fontSize: '16px', marginBottom: '10px' }}
    />
  );
};

export default TitleInput;
