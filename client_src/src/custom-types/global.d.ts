declare module '*';

interface StateT {
  userInfo: UserInfoT,
  notesTree: NotesTreeT,
  activeNode: ActiveNodeT,
  editorContent: EditorContentT,
}

interface UserInfoT {
  id: string,
}

interface NotesTreeT {
  id: string,
  tree: Array<TreeNodeT>,
  dateCreated: number,
  dateModified: number,
}

interface TreeNodeT {
  title: string,
  subtitle: string,
  uniqid: string,
  id: string,
  type: 'folder' | 'item',
  expanded?: boolean,
  children?: Array<object>,
}

interface ActiveNodeT {
  id: string,
  path: Array<string>,
}

interface EditorContentT {
  id: string,
  title: string,
  content: string,
  delta: import('quill').Delta,
  dateCreated: number,
  dateModified: number,
  readOnly: boolean,
}
