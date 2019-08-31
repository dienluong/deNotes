import React from 'react';
import './Editor.scss';
import Quill from 'react-quill';

type PropsT = {
  id: string;
  title: string;
  delta: DeltaT;
  content?: string;
  dateCreated?: number;
  dateModified?: number;
  readOnly: boolean;
  contentChangeHandler: (...args: any) => any;
  minimalist: boolean;
  options: object;
};

const LargeEditorToolbar = () => (
  <div id="dnt__editor-toolbar">
    <span className="ql-formats">
      <select className="ql-header" defaultValue="false">
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option value="false">Normal</option>
      </select>
    </span>
    <span className="ql-formats">
      <button className="ql-bold" />
      <button className="ql-italic" />
      <button className="ql-underline" />
      <button className="ql-link" />
    </span>
    <span className="ql-formats">
      <button className="ql-list" value="ordered" />
      <button className="ql-list" value="bullet" />
    </span>
    <span className="ql-formats">
      <button className="ql-clean" />
    </span>
  </div>
);

// NOTE: Using uncontrolled component mainly because, as such, loading a note will not trigger a CONTENT_CHANGED action;
// a CONTENT_CHANGED would have updated the 'modified date' of the note and ultimately resulted in a (unnecessary) content save.
// Note about use of 'key': defaultValue is only read at the initial creation of the form component. So by default,
// the component is not re-rendered when defaultValue subsequently changes. Changing the 'key' will allow us to trigger a re-render.
function Editor({ id, title, delta, content, dateCreated, dateModified, readOnly, minimalist, contentChangeHandler, options }: PropsT) {
  let editorToolbar, theme, modules;
  if (minimalist) {
    editorToolbar = <div id="dnt__editor-toolbar" />;
    theme = 'bubble';
    modules = {};
  } else {
    editorToolbar = <LargeEditorToolbar />;
    theme = 'snow';
    modules = Editor.modules;
  }

  return (
    <div className="dnt__editor">
      { editorToolbar }
      <Quill
        key={ id }
        defaultValue={ delta }
        onChange={ contentChangeHandler }
        theme={ theme }
        modules={ modules }
        readOnly={ readOnly }
        { ...options }
      />
    </div>
  );
}

Editor.modules = {
  toolbar: {
    container: '#dnt__editor-toolbar'
  },
};

export default Editor;
