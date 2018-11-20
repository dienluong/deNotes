import uuid from 'uuid/v4';
import Delta from 'quill-delta';
const _ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER || '|';
// import { TreeNodeT, ActiveNodeT, UserInfoT, NotesTreeT, EditorContentT } from '../../custom-types/global';

// TODO: Is it the best place to define this?
const _rootNode: Array<TreeNodeT> = [
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

const epoch = 0;
const now = Date.now();
const initialState: StateT = {
  userInfo: {
    id: 'default-user',
  },
  notesTree: {
    id: uuid(),
    tree: _rootNode,
    dateCreated: now,
    dateModified: now,
  },
  activeNode: {
    id: _rootNode[0].id,
    path: [_rootNode[0].id],
  },
  editorContent: {
    id: '',
    title: '',
    content: '<p><br></p>',
    delta: new Delta(),
    dateCreated: epoch,
    dateModified: epoch,
    readOnly: true,
  },
};

export default initialState;
