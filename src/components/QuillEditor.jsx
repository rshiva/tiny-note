// QuillEditor.jsx
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import Quill from "quill";
import 'quill/dist/quill.snow.css';

const Editor = forwardRef(({ readOnly, defaultValue, onTextChange, onSelectionChange }, ref) => {
  const containerRef = useRef(null);
  const defaultValueRef = useRef(defaultValue);
  const onTextChangeRef = useRef(onTextChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const quillInstanceRef = useRef(null);

  useLayoutEffect(() => {
    onTextChangeRef.current = onTextChange;
    onSelectionChangeRef.current = onSelectionChange;
  });

  useEffect(() => {
    const container = containerRef.current;
    const editorContainer = document.createElement('div');
    container.appendChild(editorContainer);

    const quillEditor = new Quill(editorContainer, {
      theme: 'snow',
    });

    quillInstanceRef.current = quillEditor;

    if (typeof ref === 'function') {
      ref(quillEditor);
    } else if (ref) {
      ref.current = quillEditor;
    }

    if (defaultValueRef.current) {
      quillEditor.setContents(defaultValueRef.current);
    }

    quillEditor.on(Quill.events.TEXT_CHANGE, (...args) => {
      onTextChangeRef.current?.(...args);
    });

    quillEditor.on(Quill.events.SELECTION_CHANGE, (...args) => {
      onSelectionChangeRef.current?.(...args);
    });

    return () => {
      if (typeof ref === 'function') {
        ref(null);
      } else if (ref) {
        ref.current = null;
      }
      quillInstanceRef.current = null;
      container.innerHTML = '';
    };
  }, [ref]);

  return <div ref={containerRef}></div>;
});

Editor.displayName = 'Editor';

export default Editor;
