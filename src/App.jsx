// src/App.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import RichTextEditor from "./components/QuillEditor";
import "./App.css"; // Import CSS for styling
import SearchBar from "./components/SearchBar";
import Settings from './components/Settings';
import SettingsButton from './components/SettingsButton';

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const editorRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    iCloudBackup: {
      enabled: false,
      frequency: 'daily',
      lastBackup: null
    }
  });

  // Handle search input focus to show all notes
  const handleSearchFocus = () => {
    setShowDropdown(true);
  };

  // Remove handleSearchBlur since we'll use SearchBar's click outside handler

  // Add this new function
  const handleSearchClose = () => {
    setShowDropdown(false);
  };

  // Load notes from database on app start
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const [dbNotes, lastActiveId] = await Promise.all([
          window.electronAPI.getAllNotes(),
          window.electronAPI.getLastActiveNote()
        ]);
        
        setNotes(dbNotes);
        
        if (dbNotes.length > 0) {
          // Try to load the last active note first
          if (lastActiveId && dbNotes.find(note => note.id === lastActiveId)) {
            const activeNote = dbNotes.find(note => note.id === lastActiveId);
            setActiveNoteId(lastActiveId);
            setNoteContent(activeNote.content);
          } else {
            // Fallback to first note if no last active note
            setActiveNoteId(dbNotes[0].id);
            setNoteContent(dbNotes[0].content);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading notes:', error);
        setIsLoading(false);
      }
    };
    loadNotes();
  }, []);

  const createNewNote = useCallback(async () => {
    if (activeNoteId) {
      const currentNote = notes.find(note => note.id === activeNoteId);
      if (currentNote && extractPlainText(currentNote.content).trim() === "") {
        editorRef.current?.getEditor()?.focus();
        return;
      }
    }

    const newNote = {
      id: crypto.randomUUID(),
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const createdNote = await window.electronAPI.createNote(newNote);
      setNotes(prevNotes => [createdNote, ...prevNotes]);
      setActiveNoteId(createdNote.id);
      setNoteContent("");
      
      requestAnimationFrame(() => {
        editorRef.current?.getEditor()?.focus();
      });
    } catch (error) {
      console.error('Error creating note:', error);
    }
  }, [activeNoteId, notes, isLoading]);

  // Filter and sort notes
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const filteredNotes = sortedNotes.filter((note) =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateNoteContent = useCallback(async (content) => {
    if (!activeNoteId) return;
    
    const updatedAt = new Date().toISOString();
    try {
      await window.electronAPI.updateNote({
        id: activeNoteId,
        content,
        updatedAt
      });
      
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === activeNoteId 
            ? { ...note, content, updatedAt } 
            : note
        )
      );
      setNoteContent(content);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  }, [activeNoteId]);

  const switchNote = useCallback(async (noteId) => {
    const noteToSwitch = notes.find((note) => note.id === noteId);
    if (noteToSwitch) {
      setActiveNoteId(noteId);
      setNoteContent(noteToSwitch.content);
      // Save active note to database
      try {
        await window.electronAPI.setLastActiveNote(noteId);
      } catch (error) {
        console.error('Error saving active note:', error);
      }
      // Focus editor after switching
      requestAnimationFrame(() => {
        if (editorRef.current?.getEditor) {
          editorRef.current.getEditor().focus();
        }
      });
    }
  }, [notes]);

  const deleteNote = useCallback(async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await window.electronAPI.deleteNote(noteId);
      setNotes(prevNotes => {
        const updatedNotes = prevNotes.filter(note => note.id !== noteId);
        
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
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }, [activeNoteId]);

  const extractPlainText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  // Modify the initial note creation effect
  useEffect(() => {
    if (!isLoading && notes.length === 0) {
      createNewNote();
    }
  }, [isLoading, notes.length]);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await window.electronAPI.getSettings();
        setSettings(savedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const handleShowSettings = () => setShowSettings(true);
    window.electronAPI.onShowSettings(handleShowSettings);
    return () => window.electronAPI.offShowSettings(handleShowSettings);
  }, []);

  useEffect(() => {
    const initializeBackups = async () => {
      const iCloudStatus = await window.electronAPI.getICloudStatus();
      if (iCloudStatus.available && settings.iCloudBackup?.enabled) {
        // Schedule backup based on frequency
        const frequency = settings.iCloudBackup.frequency || 'daily';
        try {
          await window.electronAPI.backupToICloud();
        } catch (error) {
          console.error('Backup failed:', error);
        }
      }
    };
    
    initializeBackups();
  }, [settings.iCloudBackup]);

  const handleSaveSettings = async (newSettings) => {
    try {
      const updatedSettings = await window.electronAPI.saveSettings(newSettings);
      setSettings(updatedSettings);
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

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
        <div className="toolbar-actions">
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
          <SettingsButton onClick={() => setShowSettings(true)} />
        </div>
      </div>

      <div className="editor-container">
        <RichTextEditor
          key={activeNoteId}
          value={noteContent}
          onChange={updateNoteContent}
          ref={editorRef}
        />
      </div>

      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          currentSettings={settings}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}
export default App;
