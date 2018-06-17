import React from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

class Editor extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.quill = new Quill('#editor', {
      theme: 'snow',
    });
  }

  render() {
    return (
      <div id={'editor'}>
        <p>Hello, this is <strong>Quill</strong>!</p>
      </div>
    );
  }
}

export default Editor;
