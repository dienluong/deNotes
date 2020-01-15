import Delta from 'quill-delta';
import { NONE_SELECTED } from "../../utils/appCONSTANTS";

const epoch = 0;
const now = Date.now();
const initialState: AppStateT = {
  userInfo: {
    id: 'default-user',
  },
  notesTree: {
    id: 'default',
    tree: [],
    visible: false,
    editMode: false,
    editModeSelectedNodes: [],
    dateCreated: now,
    dateModified: now,
  },
  // activeNode contains the ID of the current active node, and its path, in the tree;
  // the active node can be an item (note) or a folder;
  // if the active node is the root (with no child selected), then ID is constant NONE_SELECTED and path is [NONE_SELECTED]
  activeNode: {
    id: NONE_SELECTED,
    path: [NONE_SELECTED],
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
  },
  connectionInfo: {
    loggedIn: false,
  },
};

export default initialState;
