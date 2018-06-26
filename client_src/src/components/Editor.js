import React from 'react';
import 'quill/dist/quill.snow.css';
import './Editor.css';
import Quill from 'quill';

class Editor extends React.Component {
  componentDidMount() {
    this.quill = new Quill('#quill', {
      theme: 'snow',
    });
  }

  render() {
    return (
      <div className='editor'>
        <div id={'quill'}>
          <p>Hello, this is <strong>Quill</strong>!</p>
        </div>
      </div>
    );
  }
}

export default Editor;
