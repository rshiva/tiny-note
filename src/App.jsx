// src/App.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import RichTextEditor from "./components/QuillEditor";
import "./App.css"; // Import CSS for styling

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

  // Hide dropdown when clicking outside
  const handleSearchBlur = () => {
    setTimeout(() => setShowDropdown(false), 100); // Small delay to allow click events
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
    if (activeNoteId !== null) {
      const currentNote = notes.find((note) => note.id === activeNoteId);
      console.log("Current Note Content (Raw HTML):", currentNote.content);
      console.log(
        "Extract content: ",
        extractPlainText(currentNote.content).trim()
      );
      if (currentNote) {
        if (extractPlainText(currentNote.content).trim() === "") {
          console.log(
            "createNewNote - Current active note is empty (text-based check), not saving."
          );
          console.log(
            "createNewNote - Current note is empty, not creating new note."
          );
          setNoteContent(""); // Optionally clear the editor
          return; // Exit without creating a new note
        }
      }
    }

    const newNoteId = crypto.randomUUID();
    const newNote = {
      id: newNoteId,
      content: "",
      createdAt: new Date().toISOString(),
    };

    setNotes((prevNotes) => [...prevNotes, newNote]);
    setActiveNoteId(newNoteId);
    setNoteContent("");

    requestAnimationFrame(() => {
      if (editorRef.current?.getEditor) {
        editorRef.current.getEditor().focus();
      }
    });

    // console.log('createNewNote - New note created (UUID):', newNote, 'Active ID set to:', newNoteId);
  }, [notes, activeNoteId, setNoteContent]);

  // Filter and sort notes
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const filteredNotes = sortedNotes.filter((note) =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateNoteContent = useCallback((content) => {
    if (activeNoteId === null) return;
    
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === activeNoteId
          ? { ...note, content, updatedAt: new Date().toISOString() }
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

  const deleteNote = useCallback(
    (noteId) => {
      setNotes((prevNotes) => {
        const updatedNotes = prevNotes.filter((note) => note.id !== noteId);

        // If deleting active note, switch to first available note
        if (activeNoteId === noteId && updatedNotes.length > 0) {
          setActiveNoteId(updatedNotes[0].id);
          setNoteContent(updatedNotes[0].content);
        } else if (updatedNotes.length === 0) {
          setActiveNoteId(null);
          setNoteContent("");
        }

        return updatedNotes;
      });
    },
    [activeNoteId]
  );

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

  return (
    <div className="app-container">
      <div className="note-dropdown-container">
        <input
          type="text"
          placeholder="Search Notes..."
          className="dropdown-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur} // Hide dropdown when focus is lost
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

        {showDropdown && (
          <div className="note-dropdown">
            <ul className="note-list">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <li
                    key={note.id}
                    onClick={() => switchNote(note.id)}
                    className={activeNoteId === note.id ? "active" : ""}
                  >
                    <span>
                      {note.content
                        ? extractPlainText(note.content)
                            .split(" ")
                            .slice(0, 5)
                            .join(" ") + "..."
                        : "Untitled Note"}
                    </span>
                    <button
                      className="delete-note-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                    >
                      {/* https://icon-sets.iconify.design/?query=trash&search-page=3 */}
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
                  </li>
                ))
              ) : (
                <li className="no-notes">No matching notes</li>
              )}
            </ul>
          </div>
        )}
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
