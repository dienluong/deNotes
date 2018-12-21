import React from 'react';
import 'react-quill/dist/quill.snow.css';
import './Editor.css';
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
  options: object;
};

// NOTE: Using uncontrolled component mainly because, as such, loading a note will not trigger a CONTENT_CHANGED action;
// a CONTENT_CHANGED would have updated the 'modified date' of the note and ultimately resulted in a (unnecessary) content save.
// Note about use of 'key': defaultValue is only read at the initial creation of the form component. So by default,
// the component is not re-rendered when defaultValue subsequently changes. Changing the 'key' will allow us to trigger a re-render.
function Editor({ id, title, delta, content, dateCreated, dateModified, readOnly, contentChangeHandler, options }: PropsT) {
  return (
    <Quill
      key={ id }
      defaultValue={ delta }
      onChange={ contentChangeHandler }
      theme='snow'
      readOnly={ readOnly }
      { ...options }
    />
  );
}

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
