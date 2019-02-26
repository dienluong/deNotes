import uuid from 'uuid/v4';
import Delta from 'quill-delta';
const _ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER || '|';

const _rootNode: TreeNodeT = {
    title: '/',
    subtitle: '',
    uniqid: uuid(),
    get id() {
      return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
    },
    type: 'folder',
    expanded: true,
    children: [],
};

const epoch = 0;
const now = Date.now();
const initialState: AppStateT = {
  userInfo: {
    id: 'default-user',
  },
  notesTree: {
    id: uuid(),
    tree: [_rootNode],
    dateCreated: now,
    dateModified: now,
  },
  activeNode: {
    id: _rootNode.id,
    path: [_rootNode.id],
  },
  editorContent: {
    id: 'default',
    title: '',
    content: '<p><br></p>',
    delta: new Delta(),
    dateCreated: epoch,
    dateModified: epoch,
    readOnly: true,
  },
};

export default initialState;
