import React from "react";
import { Quill } from "react-quill";

// Custom Undo button icon component for Quill editor. You can import it directly
// from 'quill/assets/icons/undo.svg' but I found that a number of loaders do not
// handle them correctly
const CustomUndo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" />
    <path
      className="ql-stroke"
      d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"
    />
  </svg>
);

// Redo button icon component for Quill editor
const CustomRedo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10" />
    <path
      className="ql-stroke"
      d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"
    />
  </svg>
);
const Send = () =>(
    <svg width="18" height="18" viewBox="0 0 32 32" fill-rule="evenodd">
  <path fill="#333" d="M28.447 16.894a.998.998 0 0 0 0-1.788l-24-12A.998.998 0 0 0 3.06 4.342L7.3 16 3.06 27.658a1 1 0 0 0 1.387 1.236zM23.764 17h-14.7l-3.267 8.983zm-14.7-2h14.7L5.797 6.017z" data-original="#000000"/>
</svg>
)
const Book = () => (
    <svg  width="18" height="18" x="0" y="0" viewBox="0 0 512 512" >
  <g>
    <path d="M400.602 128.531h-1.067V30h1.067c8.28 0 15-6.715 15-15s-6.72-15-15-15H79.266C35.559 0 0 35.559 0 79.266v353.468C0 476.441 35.559 512 79.266 512h321.336c8.28 0 15-6.715 15-15V143.531c0-8.281-6.72-15-15-15zm-65.336 288.137c0 8.281-6.715 15-15 15H95.332c-8.281 0-15-6.719-15-15v-192.8c0-8.286 6.719-15 15-15h224.934c8.285 0 15 6.714 15 15zM369.53 64.266H79.266c-8.282 0-15 6.718-15 15 0 8.285 6.718 15 15 15h290.27v34.27H79.265C52.102 128.535 30 106.433 30 79.265 30 52.102 52.102 30 79.266 30h290.27v34.266zm0 0" fill="#333333" opacity="1" data-original="#000000"/>
  </g>
</svg>

)

// Add sizes to whitelist and register them
const Size = Quill.import("formats/size");
Size.whitelist = ["extra-small", "small", "medium", "large"];
Quill.register(Size, true);

// Add fonts to whitelist and register them
const Font = Quill.import("formats/font");
Font.whitelist = [
  "arial",
  "comic-sans",
  "courier-new",
  "georgia",
  "helvetica",
  "lucida"
];
Quill.register(Font, true);

// Modules object for setting up the Quill editor
export const modules = {
  toolbar: {
    container: "#toolbar",
    handlers: {
      undo: function () { (this as any).quill.history.undo()},
      redo: function () { (this as any).quill.history.redo()}
    }
  },
  history: {
    delay: 500,
    maxStack: 100,
    userOnly: true
  }
};

// Formats objects for setting up the Quill editor
export const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "align",
  "strike",
  "script",
  "blockquote",
  "background",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "color",
  "code-block"
];
interface Props {
  openInsertTemplateDialog: () =>  void,
  sendEmail: () => Promise<void>
}
// Quill Toolbar component
export const QuillToolbar = (props: Props) => (
  <div id="toolbar">
    <span className="ql-formats">
      <button title="bold"className="ql-bold" />
      <button title="italic"className="ql-italic" />
      <button title="underline"className="ql-underline" />
      <button title="strike"className="ql-strike" />
    </span>
    <span className="ql-formats">
      <button title="ordered list"className="ql-list" value="ordered" />
      <button title="unordered list"className="ql-list" value="bullet" />
      <button title="increase indent level"className="ql-indent" value="-1" />
      <button title="decrease indent level"className="ql-indent" value="+1" />
    </span>
    <span className="ql-formats">
      <select title="align" className="ql-align" />
    </span>
    <span className="ql-formats">
      <button title="insert link"className="ql-link" />
      <button title="insert image"className="ql-image" />
    </span>
    <span className="ql-formats">
      <button title="undo"className="ql-undo">
        <CustomUndo />
      </button>
      <button title="redo"className="ql-redo">
        <CustomRedo />
      </button>
    </span>
    <span className="ql-formats" style={{marginLeft: 'auto', marginRight: 0}}>
      <button title="insert template" onClick={props.openInsertTemplateDialog}>
        <Book/>
      </button>
      <button title="send" onClick={props.sendEmail}>
        <Send></Send>
      </button>
    </span>
  </div>
);

export default QuillToolbar;