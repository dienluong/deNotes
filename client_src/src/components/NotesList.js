import React from 'react';
import TreeView from 'react-treeview';

const sampleNotes = [
  ['Sample Note 1', 'Sample Note 2'],
  ['Test Note 2'],
  ['Temp Note 3'],
];

class NotesList extends React.Component {
  render() {
    <div>
      { sampleNotes.map(( note, idx) => {

      }) }
    </div>
  };
}

export default NotesList;
