import React, { useCallback, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ color: [] }, { background: [] }], // Added color and background
      [ { list: "bullet" }, { list: "check" }],
      ["link"], //"image"
      // ["clean"],
    ],
    handlers: {
      link: function (value) {
        const tooltip = this.quill.theme.tooltip;
        const input = tooltip.root.querySelector("input[data-link]");
        input.dataset.link = "tinynote link";
        input.placeholder = "your placeholder text";

        if (value) {
          const range = this.quill.getSelection();
          let preview = this.quill.getText(range);
          if (
            /^\S+@\S+\.\S+$/.test(preview) &&
            preview.indexOf("mailto:") !== 0
          ) {
            preview = `mailto:${preview}`;
          }
          tooltip.edit("link", preview);
        } else {
          this.quill.format("link", false);
        }
      },
    },
  },
};
const formats = [
  "header",
  "bold",
  "link",
  "color",
  "italic",
  "underline",
  "strike",
  "list",
  // "ordered",
  "blockquote",
  
  "background",
  // "image",
];

const RichTextEditor = React.forwardRef(({ value, onChange }, ref) => {
  const quillRef = useRef(null);

  const handleTextChange = useCallback(
    (content) => {
      if (onChange) {
        onChange(content);
      }
    },
    [onChange]
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
