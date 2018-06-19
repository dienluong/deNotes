import React from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './Editor.css';

class Editor extends React.Component {
  constructor(props) {
    super(props);
  }

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
