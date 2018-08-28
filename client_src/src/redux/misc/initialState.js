import Delta from 'quill-delta';

export default {
  notesTree: [],
  activeNode: {
    id: null,
    path: [],
  },
  editorContent: {
    content: '',
    delta: new Delta(),
  },
};
