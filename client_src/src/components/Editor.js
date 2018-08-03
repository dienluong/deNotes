import React from 'react';
import 'react-quill/dist/quill.snow.css';
import './Editor.css';
// import Quill from 'quill';
import Quill from 'react-quill';

class Editor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      text: '',
      options: props.options,
    };
    this.handleChange = this.handleChange.bind(this);
  }
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

  handleChange(text) {
    this.setState({
      text,
    });
  }

  render() {
    return (
      <Quill
        value={ this.state.text }
        onChange={ this.handleChange }
        theme='snow'
        { ...this.state.options }
      />
    );
  }
}

export default Editor;
