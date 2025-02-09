import React, { useRef, useState } from 'react';
import './App.css';
import Editor from './components/QuillEditor';
import CreateNoteButton from './components/CreateNoteButton';
import NoteList from './components/NoteList';
import SearchBar from './components/SearchBar';
import Quill from "quill";

const Delta = Quill.import('delta');

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const quillRef = useRef(null);

  const getPlainTextFromDelta = (delta) => {
    if (!delta || !delta.ops) return '';
    return delta.ops.map(op => typeof op.insert === 'string' ? op.insert : '').join('');
  };

  const createNewNote = () => {
    const newNoteId = Date.now().toString();
    const newNote = {
      id: newNoteId,
      title: 'New Note',
      content: new Delta(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotes(prevNotes => [...prevNotes, newNote]);
    setActiveNote(newNote);

    if (quillRef.current) {
      quillRef.current.setContents(new Delta());
    }
  };

  const handleNoteSelect = (note) => {
    setActiveNote(note);
    setShowDropdown(false);
    if (quillRef.current) {
      quillRef.current.setContents(note.content);
    }
  };

  const deleteNote = (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      if (activeNote?.id === noteId) {
        setActiveNote(null);
        if (quillRef.current) {
          quillRef.current.setContents(new Delta());
        }
      }
    }
  };

  const handleTextChange = (delta, oldDelta, source) => {
    if (!quillRef.current) return;

    if (source === 'user' && activeNote) {
      const updatedContent = quillRef.current.getContents();
      const plainText = quillRef.current.getText();
      const firstLine = plainText.split('\n')[0].trim();
      const derivedTitle = firstLine || 'New Note';

      const updatedNote = { ...activeNote, content: updatedContent, title: derivedTitle };
      setActiveNote(updatedNote);
      setNotes(prevNotes => prevNotes.map(note => note.id === updatedNote.id ? updatedNote : note));
    }
  };

  const handleSearchFocus = () => {
    setShowDropdown(true);
    setSearchResults([...notes].sort((a, b) => b.updatedAt - a.updatedAt));
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === '') {
      setSearchResults([...notes].sort((a, b) => b.updatedAt - a.updatedAt));
    } else {
      setSearchResults(notes.filter(note => note.title.toLowerCase().includes(query)));
    }
  };

  return (
    <div className="container">
      <h1>Note Taking App</h1>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onFocus={handleSearchFocus}
        onChange={handleSearchChange}
        searchResults={searchResults}
        showDropdown={showDropdown}
        onSelectNote={handleNoteSelect}
        onDeleteNote={deleteNote}
      />
      <CreateNoteButton onCreateNewNote={createNewNote} />
      <Editor ref={quillRef} readOnly={false} defaultValue={activeNote?.content || new Delta()} onTextChange={handleTextChange} />
      <NoteList notes={notes} onNoteSelect={handleNoteSelect} onDeleteNote={deleteNote} />
    </div>
  );
}

export default App;
