// src/App.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import RichTextEditor from "./components/QuillEditor";
import "./App.css"; // Import CSS for styling
import SearchBar from "./components/SearchBar";

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const editorRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Handle search input focus to show all notes
  const handleSearchFocus = () => {
    setShowDropdown(true);
  };

  // Remove handleSearchBlur since we'll use SearchBar's click outside handler

  // Add this new function
  const handleSearchClose = () => {
    setShowDropdown(false);
  };

  // Load notes from localStorage on app start
  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem("notes");
      if (storedNotes) {
        const parsedNotes = JSON.parse(storedNotes);
        setNotes(parsedNotes);
        if (parsedNotes.length > 0) {
          setActiveNoteId(parsedNotes[0].id);
          setNoteContent(parsedNotes[0].content);
          console.log(
            "Loaded notes from localStorage. Setting first note as active:",
            parsedNotes[0].id,
            "Total notes loaded:",
            parsedNotes.length
          ); // Enhanced log
        } else {
          console.log(
            "Loaded notes from localStorage, but no notes were found."
          );
        }
      } else {
        console.log("No notes found in localStorage on initial load.");
      }
    } catch (error) {
      console.error("Error loading notes from localStorage:", error);
    }
  }, []);

  const createNewNote = useCallback(() => {
    // Check if current note exists and is empty
    if (activeNoteId) {
      const currentNote = notes.find(note => note.id === activeNoteId);
      if (currentNote && extractPlainText(currentNote.content).trim() === "") {
        editorRef.current?.getEditor()?.focus();
        return;
      }
    }

    const newNoteId = crypto.randomUUID();
    const newNote = {
      id: newNoteId,
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update state in correct order
    setNotes(prevNotes => [...prevNotes, newNote]);
    setActiveNoteId(newNoteId);
    setNoteContent("");

    // Focus the editor
    requestAnimationFrame(() => {
      editorRef.current?.getEditor()?.focus();
    });
  }, [activeNoteId, notes]);

  // Filter and sort notes
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const filteredNotes = sortedNotes.filter((note) =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateNoteContent = useCallback((content) => {
    if (!activeNoteId) return;
    
    console.log("Updating note content:", { activeNoteId, content });
    
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === activeNoteId 
          ? { 
              ...note, 
              content, 
              updatedAt: new Date().toISOString() 
            } 
          : note
      )
    );
    setNoteContent(content);
  }, [activeNoteId]);

  const switchNote = useCallback((noteId) => {
    const noteToSwitch = notes.find((note) => note.id === noteId);
    if (noteToSwitch) {
      setActiveNoteId(noteId);
      setNoteContent(noteToSwitch.content);
      // Focus editor after switching
      requestAnimationFrame(() => {
        if (editorRef.current?.getEditor) {
          editorRef.current.getEditor().focus();
        }
      });
    }
  }, [notes]);

  const deleteNote = useCallback((noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    setNotes((prevNotes) => {
      const updatedNotes = prevNotes.filter((note) => note.id !== noteId);
      
      if (activeNoteId === noteId) {
        if (updatedNotes.length > 0) {
          setActiveNoteId(updatedNotes[0].id);
          setNoteContent(updatedNotes[0].content);
        } else {
          setActiveNoteId(null);
          setNoteContent("");
        }
      }
      return updatedNotes;
    });
  }, [activeNoteId]);

  // Keep local storage in sync
  useEffect(() => {
    try {
      localStorage.setItem("notes", JSON.stringify(notes));
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  }, [notes]);

  // const filteredNotes = notes.filter(note =>
  //   note.content.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const extractPlainText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  // Add this effect to handle initial note
  useEffect(() => {
    if (notes.length === 0) {
      createNewNote();
    }
  }, []);

  return (
    <div className="app-container">
      <div className="note-dropdown-container">
        <SearchBar
          searchQuery={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleSearchFocus}
          onClose={handleSearchClose}
          showDropdown={showDropdown}
          searchResults={filteredNotes}
          onSelectNote={(note) => {
            switchNote(note.id);
            setShowDropdown(false);
          }}
          onDeleteNote={deleteNote}
        />
        <button className="create-note-icon" onClick={createNewNote}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="0.8em"
            height="0.8em"
            viewBox="0 0 36 36"
          >
            <path
              fill="currentColor"
              d="M28 30H6V8h13.22l2-2H6a2 2 0 0 0-2 2v22a2 2 0 0 0 2 2h22a2 2 0 0 0 2-2V15l-2 2Z"
              className="clr-i-outline clr-i-outline-path-1"
            ></path>
            <path
              fill="currentColor"
              d="m33.53 5.84l-3.37-3.37a1.61 1.61 0 0 0-2.28 0L14.17 16.26l-1.11 4.81A1.61 1.61 0 0 0 14.63 23a1.7 1.7 0 0 0 .37 0l4.85-1.07L33.53 8.12a1.61 1.61 0 0 0 0-2.28M18.81 20.08l-3.66.81l.85-3.63L26.32 6.87l2.82 2.82ZM30.27 8.56l-2.82-2.82L29 4.16L31.84 7Z"
              className="clr-i-outline clr-i-outline-path-2"
            ></path>
            <path fill="none" d="M0 0h36v36H0z"></path>
          </svg>
        </button>
      </div>

      <div className="editor-container">
        <RichTextEditor
          key={activeNoteId} // Force re-render on note switch
          value={noteContent}
          onChange={updateNoteContent}
          ref={editorRef}
        />
      </div>
    </div>
  );
}
export default App;
