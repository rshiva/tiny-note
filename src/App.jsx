import React, { useRef, useState } from 'react';
import './App.css';
import Editor from './components/QuillEditor';
import CreateNoteButton from './components/CreateNoteButton';
import NoteList from './components/NoteList';
import Quill from "quill";
const Delta = Quill.import('delta');

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const quillRef = useRef(null);

  const createNewNote = () => {
    const newNoteId = Date.now().toString();
    const newNote = {
      id: newNoteId,
      title: 'New Note',
      content: new Delta(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotes([...notes, newNote]);
    setActiveNote(newNote);

    if (quillRef.current) {
      quillRef.current.setContents(new Delta()); // FIXED
    }
  };

  const handleNoteSelect = (note) => {
    console.log('quillRef.current in handleNoteSelect:', quillRef.current);
    setActiveNote(note);

    if (quillRef.current) {
      quillRef.current.setContents(note.content); // FIXED
    }
  };

  return (
    <div className="container">
      <h1>Note Taking App</h1>

      <CreateNoteButton onCreateNewNote={createNewNote} />

      <div style={{ marginTop: '20px' }}>
        <Editor
          ref={quillRef}
          readOnly={false}
          defaultValue={activeNote ? activeNote.content : new Delta()}
        />
      </div>

      <NoteList
        notes={notes}
        onNoteSelect={handleNoteSelect}
      />
    </div>
  );
}

export default App;
