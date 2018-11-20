// TODO: Remove
// import Delta from 'quill-delta';
// const delta = new Delta();

declare module '*';

declare type StateT = {
  userInfo: UserInfoT,
  notesTree: NotesTreeT,
  activeNode: ActiveNodeT,
  editorContent: EditorContentT,
};

declare type DeltaT = object;
declare type TreeNodeT = {
  title: string,
  subtitle: string,
  uniqid: string,
  id: string,
  type: 'folder' | 'item',
  expanded?: boolean,
  children?: Array<object>,
};

declare type ActiveNodeT = {
  id: string,
  path: Array<string>,
};

declare type UserInfoT = {
  id: string,
};

declare type NotesTreeT = {
  id: string,
  tree: Array<TreeNodeT>,
  dateCreated: number,
  dateModified: number,
};

declare type EditorContentT = {
  id: string,
  title: string,
  content: string,
  delta: DeltaT,
  dateCreated: number,
  dateModified: number,
  readOnly: boolean,
};
