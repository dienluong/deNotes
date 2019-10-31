import uuid from 'uuid/v4';
import Delta from 'quill-delta';
import { nodeTypes, DEFAULT_ID_DELIMITER} from '../../utils/appCONSTANTS';

const _ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER || DEFAULT_ID_DELIMITER;

const _rootNode: TreeNodeT = {
    title: '/',
    subtitle: '',
    uniqid: uuid(),
    get id() {
      return `${this.type}${_ID_DELIMITER}${this.uniqid}`;
    },
    type: nodeTypes.FOLDER,
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
    editMode: false,
    editModeSelectedNodes: [],
    dateCreated: now,
    dateModified: now,
  },
  // activeNode contains the ID of the current active node, and its path, in the tree;
  // the active node can be an item (note) or a folder;
  // if the active node is the root (with no child selected), then ID is constant NONE_SELECTED and path is [NONE_SELECTED]
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
  modalInfo: {
    type: '',
    props: {},
  }
};

export default initialState;
