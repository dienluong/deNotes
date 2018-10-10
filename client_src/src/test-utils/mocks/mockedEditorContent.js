import uuid from 'uuid/v4';

export const mockedContent = {
  id: uuid(),
  title: 'Test title',
  content: '<p>Hellow World!<br></p>',
  delta: { ops: [{ insert: 'Hello' }, { insert: ' World!\n' }] },
  dateCreated: Date.now(),
  dateModified: Date.now() + 1,
};
