import React from 'react';
import 'react-quill/dist/quill.snow.css';
import './Editor.css';
import Quill from 'react-quill';

function Editor({ delta, content, contentChangeHandler, options }) {
  return (
    <Quill
      value={ delta }
      onChange={ contentChangeHandler }
      theme='snow'
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
