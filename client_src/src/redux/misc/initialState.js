import uuid from 'uuid/v1';
import Delta from 'quill-delta';
const _ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER;

// TODO: Is it the best place to define this?
const _rootNode = [
  {
    title: '/',
    subtitle: '',
    uniqid: uuid(),
    get id() {
      return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
    },
    type: 'folder',
    expanded: true,
    children: [],
  },
];

export default {
  notesTree: _rootNode,
  activeNode: {
    id: _rootNode[0].id,
    path: [_rootNode[0].id],
  },
  editorContent: {
    content: '',
    delta: new Delta(),
  },
};
