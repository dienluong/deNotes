import React from 'react';
import './Editor.scss';
import Quill from 'react-quill';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';


type PropsT = {
  id: string;
  title: string;
  delta: DeltaT;
  content?: string;
  dateCreated?: number;
  dateModified?: number;
  readOnly: boolean;
  contentChangeHandler: (...args: any) => any;
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
function Editor({ id, title, delta, content, dateCreated, dateModified, readOnly, contentChangeHandler, options }: PropsT) {
  const smallMedia = useMediaQuery('(max-width:600px)');
  let editorToolbar, theme, modules;
  if (smallMedia) {
    editorToolbar = <div id="dnt__editor-toolbar"> </div>;
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

// class Editor extends React.Component {
//   constructor(props) {
//     super(props);
//
//     this.state = {
//       deltas: props.initialContent,
//       content: '',
//     };
//     this.handleChange = this.handleChange.bind(this);
//   }
//
// TODO: Remove
// componentDidMount() {
//   this.quill = new Quill('#quill', {
//     ...this.state.options,
//     theme: 'snow',
//   });
// }

// render() {
//   return (
//     <div className='editor'>
//       <div id={'quill'}>
//         <p>Hello, this is <strong>Quill</strong>!</p>
//       </div>
//     </div>
//   );
// }

// handleChange(content, delta, source, editor) {
// console.log(`Deltas: ${JSON.stringify(this.state.deltas)}`);
// console.log(`Content: ${content}`);
// this.setState({
//   deltas: this.state.deltas.concat(delta),
//   content,
// });
// }
//
// render() {
//   return (
//     {/*<Quill*/}
// onChange={ this.handleChange }
// theme='snow'
// { ...this.props.options }
// />
// );
// }
// }

export default Editor;
