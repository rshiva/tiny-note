// App.jsx
import React, { useRef, useState } from 'react';
import './App.css';
import Editor from './components/QuillEditor';
import CreateNoteButton from './components/CreateNoteButton';
import SearchBar from './components/SearchBar';
import Quill from 'quill';

const Delta = Quill.import('delta');

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const quillRef = useRef(null);

  // Create a new note with a default empty Delta
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

    // If the editor is ready, update its content.
    if (quillRef.current) {
      quillRef.current.setContents(new Delta());
    }
  };

  // When a note is selected from the search dropdown
  const handleNoteSelect = (note) => {
    setActiveNote(note);
    setShowDropdown(false);
    setSearchQuery('');
    if (quillRef.current) {
      quillRef.current.setContents(note.content);
    }
  };

  // Delete note (updates notes state and search results)
  const deleteNote = (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      if (activeNote?.id === noteId) {
        setActiveNote(null);
        if (quillRef.current) {
          quillRef.current.setContents(new Delta());
        }
      }
      setSearchResults(prevResults => prevResults.filter(note => note.id !== noteId));
    }
  };

  // Handle text changes in the editor. Derive a title from the first few words.
  const handleTextChange = (delta, oldDelta, source) => {
    if (!quillRef.current) return;
    if (source === 'user' && activeNote) {
      const updatedContent = quillRef.current.getContents();
      const plainText = quillRef.current.getText();
      // Use the first five words as the note title.
      const words = plainText.split(/\s+/).filter(Boolean);
      const derivedTitle = words.slice(0, 5).join(" ") || 'New Note';

      const updatedNote = {
        ...activeNote,
        content: updatedContent,
        title: derivedTitle,
        updatedAt: new Date(),
      };

      setActiveNote(updatedNote);
      setNotes(prevNotes => prevNotes.map(note => note.id === updatedNote.id ? updatedNote : note));
    }
  };

  // When search input is focused, show all notes sorted by latest update.
  const handleSearchFocus = () => {
    setShowDropdown(true);
    const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    setSearchResults(sortedNotes);
  };

  // Update search query and filter notes based on title.
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query === '') {
      const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setSearchResults(sortedNotes);
    } else {
      const filtered = notes.filter(note => note.title.toLowerCase().includes(query.toLowerCase()));
      setSearchResults(filtered);
    }
  };

  // Called from SearchBar when a click outside is detected.
  const handleCloseDropdown = () => {
    setShowDropdown(false);
  };

  return (
    <div className="container">
      <h1>Note Taking App</h1>

      <SearchBar
        searchQuery={searchQuery}
        onFocus={handleSearchFocus}
        onChange={handleSearchChange}
        searchResults={searchResults}
        showDropdown={showDropdown}
        onSelectNote={handleNoteSelect}
        onDeleteNote={deleteNote}
        onClose={handleCloseDropdown}
      />

      <CreateNoteButton onCreateNewNote={createNewNote} />

      <Editor
        ref={quillRef}
        readOnly={false}
        defaultValue={activeNote ? activeNote.content : new Delta()}
        onTextChange={handleTextChange}
      />
    </div>
  );
}

export default App;
