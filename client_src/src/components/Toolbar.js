import React from 'react';

class Toolbar extends React.Component {
  constructor(props) {
    super(props);

    this.handleClickNewFolderBtn = this.handleClickNewFolderBtn.bind(this);
    this.handleClickNewNoteBtn = this.handleClickNewNoteBtn.bind(this);
  }

  handleClickNewFolderBtn() {
    this.props.newFolderBtnClickHandler();
  }

  handleClickNewNoteBtn() {

  }

  render() {
    return (
      <div>
        <button onClick={ this.handleClickNewFolderBtn } >
          New Folder
        </button>
        <button onClick={ this.handleClickNewNoteBtn } >
          New Note
        </button>
      </div>
    );
  }
}

export default Toolbar;

// TODO: add proptypes
