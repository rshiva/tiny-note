import React, { useCallback, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "ordered",
  "link",
  "image",
];

const RichTextEditor = React.forwardRef(({ value, onChange }, ref) => {
  const quillRef = useRef(null);

  const handleTextChange = useCallback(
    (content, delta, source, editor) => {
      if (value !== undefined && value !== null) {
        // Check if 'value' is valid
        if (onChange) {
          onChange(content);
        }
      } else {
        console.log(
          "RichTextEditor: handleTextChange - Value prop is undefined or null, preventing onChange call."
        ); // Debug log in RichTextEditor
      }
    },
    [onChange, value]
  );

  const getEditor = useCallback(() => {
    return quillRef.current && quillRef.current.getEditor();
  }, []);

  React.useImperativeHandle(ref, () => ({
    getEditor: getEditor,
  }));

  return (
    <div className="rich-text-editor-container">
      <ReactQuill
        ref={quillRef}
        value={value || ""}
        onChange={handleTextChange}
        placeholder="Start typing..."
        className="quill-editor"
        modules={modules}
        formats={formats}
      />
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
