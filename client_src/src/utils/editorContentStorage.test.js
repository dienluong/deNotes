import uuid from 'uuid/v4';
import { load, inject } from './editorContentStorage';

describe('load', () => {
  it('should return a rejected Promise if fetched content has wrong format', async() => {
    const noteId = uuid();
    const userId = uuid();
    const expectedErrorMsg = /unrecognized/i;

    expect.assertions(5);

    // Case: content is falsy
    let badContent = null;
    inject({ load: () => Promise.resolve(badContent) });
    await expect(load({ userId, id: noteId }))
      .rejects.toMatchObject({ message: expect.stringMatching(expectedErrorMsg) });

    // Case: content is not an object
    badContent = () => {};
    inject({ load: () => Promise.resolve(badContent) });
    await expect(load({ userId, id: noteId }))
      .rejects.toMatchObject({ message: expect.stringMatching(expectedErrorMsg) });

    // Case: content is missing properties
    badContent = { id: noteId, title: 'Test Title', body: '<p><br></p>', dateCreated: 1, dateModified: 2 };
    inject({ load: () => Promise.resolve(badContent) });
    await expect(load({ userId, id: noteId }))
      .rejects.toMatchObject({ message: expect.stringMatching(expectedErrorMsg) });

    // To make sure the previous tests were not false positives, we test a few "good" cases
    let goodContent = { id: noteId, title: 'Test Title', body: '<p><br></p>', delta: JSON.stringify({ ops: [] }), dateCreated: 1, dateModified: 2 };
    inject({ load: () => Promise.resolve(goodContent) });
    await expect(load({ userId, id: noteId }))
      .resolves.toMatchObject(expect.anything());

    goodContent = { id: noteId, title: 'Test Title', body: '<p><br></p>', delta: { ops: [] }, dateCreated: 1, dateModified: 2 };
    inject({ load: () => Promise.resolve(goodContent) });
    await expect(load({ userId, id: noteId }))
      .resolves.toMatchObject(expect.anything());
  });
});
