import React from 'react';

const CreateNoteButton = ({ onCreateNewNote }) => {
  return (
    <button onClick={onCreateNewNote}>Create New Note</button>
  );
};

export default CreateNoteButton;