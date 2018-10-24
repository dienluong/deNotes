import * as moduleToTest from './editorContentStorage';

describe('1. load', () => {
  it('should return an Error in rejected Promise if invoked with no dependency injected beforehand', async() => {
    const noteId = 'some-note-id';
    const userId = 'some-user-id';

    await expect(moduleToTest.load({ userId, id: noteId }))
      .rejects.toMatchObject(expect.any(Error));
  });

  it('should return an Error in rejected Promise if invoked with invalid arguments', async() => {
    const mockedLoad = jest.fn();
    moduleToTest.inject({ load: mockedLoad });

    await expect(moduleToTest.load({ id: 1, userID: {} })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.load({ id: [], userID: true })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.load({ userID: 'test-user' })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.load({ id: 'test-node' })).rejects.toMatchObject(expect.any(Error));
    expect(mockedLoad).not.toBeCalled();
  });

  it('should return an Error in rejected Promise if fetched content has wrong format', async() => {
    const noteId = 'some-note-id';
    const userId = 'some-user-id';
    const expectedErrorMsg = /unrecognized/i;

    const mockedLoad = jest.fn();

    expect.assertions(10);

    // Case: content is falsy
    let badContent = null;
    mockedLoad.mockImplementation(() => Promise.resolve(badContent));
    moduleToTest.inject({ load: mockedLoad });
    await expect(moduleToTest.load({ userId, id: noteId }))
      .rejects.toMatchObject({ message: expect.stringMatching(expectedErrorMsg) });
    expect(mockedLoad).lastCalledWith({ collectionName: 'notes', id: noteId, ownerId: userId });

    // Case: content is not an object
    badContent = () => {};
    mockedLoad.mockImplementation(() => Promise.resolve(badContent));
    moduleToTest.inject({ load: mockedLoad });
    await expect(moduleToTest.load({ userId, id: noteId }))
      .rejects.toMatchObject({ message: expect.stringMatching(expectedErrorMsg) });
    expect(mockedLoad).lastCalledWith({ collectionName: 'notes', id: noteId, ownerId: userId });

    // Case: content is missing properties
    badContent = { id: noteId, title: 'Test Title', body: '<p><br></p>', dateCreated: 1, dateModified: 2 };
    mockedLoad.mockImplementation(() => Promise.resolve(badContent));
    moduleToTest.inject({ load: mockedLoad });
    await expect(moduleToTest.load({ userId, id: noteId }))
      .rejects.toMatchObject({ message: expect.stringMatching(expectedErrorMsg) });
    expect(mockedLoad).lastCalledWith({ collectionName: 'notes', id: noteId, ownerId: userId });

    // To make sure the previous tests were not false positives, we test a few "good" cases
    let goodContent = { id: noteId, title: 'Test Title', body: '<p><br></p>', delta: JSON.stringify({ ops: [] }), dateCreated: 1, dateModified: 2 };
    mockedLoad.mockImplementation(() => Promise.resolve(goodContent));
    moduleToTest.inject({ load: mockedLoad });
    await expect(moduleToTest.load({ userId, id: noteId }))
      .resolves.toMatchObject(expect.anything());
    expect(mockedLoad).lastCalledWith({ collectionName: 'notes', id: noteId, ownerId: userId });

    goodContent = { id: noteId, title: 'Test Title', body: '<p><br></p>', delta: { ops: [] }, dateCreated: 1, dateModified: 2 };
    mockedLoad.mockImplementation(() => Promise.resolve(goodContent));
    moduleToTest.inject({ load: mockedLoad });
    await expect(moduleToTest.load({ userId, id: noteId }))
      .resolves.toMatchObject(expect.anything());
    expect(mockedLoad).lastCalledWith({ collectionName: 'notes', id: noteId, ownerId: userId });
  });

  it('should return the fetched content', async() => {
    const noteId = 'some-note-id';
    const userId = 'some-user-id';
    const mockedLoad = jest.fn();
    const content = {
      id: noteId,
      title: 'some title',
      body: '<p>Hellow World!<br></p>',
      delta: JSON.stringify({ ops: [] }),
      dateCreated: 10001,
      dateModified: 20002,
    };

    mockedLoad.mockImplementation(() => Promise.resolve(content));
    moduleToTest.inject({ load: mockedLoad });

    await expect(moduleToTest.load({ userId, id: noteId }))
      .resolves.toMatchObject({
        id: noteId,
        title: 'some title',
        content: content.body,
        delta: { ops: [] },
        dateCreated: 10001,
        dateModified: 20002,
      });
    expect(mockedLoad).lastCalledWith({ collectionName: 'notes', id: noteId, ownerId: userId });
  });
});

describe('2. save', () => {
  it('should return a rejected Promise if invalid arguments provided', async() => {
    const editorContent = {
      id: 'some-note-id',
      title: 'some title',
      body: '<p>Hellow World!<br></p>',
      delta: { ops: [] },
      dateCreated: 10001,
      dateModified: 20002,
    };
    const mockedSave = jest.fn();
    moduleToTest.inject({ save: mockedSave });

    await expect(moduleToTest.save({ editorContent })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.save({ userId: 'a-user-id' })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.save({ userId: '', editorContent })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.save({ userId: 1, editorContent })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.save({ userId: 'a-user-id', editorContent: {} })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.save({ userId: 'a-user-id', editorContent: [] })).rejects.toMatchObject(expect.any(Error));
    expect(mockedSave).not.toBeCalled();
  });

  it('should call injected save() and return', async() => {
    const userId = 'some-user-id';
    const editorContent = {
      id: 'some-note-id',
      title: 'some title',
      content: '<p>Hellow World!<br></p>',
      delta: { ops: [] },
      dateCreated: 10001,
      dateModified: 20002,
    };

    const mockedSave = jest.fn();
    mockedSave.mockImplementation(() => Promise.resolve('Saved'));
    moduleToTest.inject({ save: mockedSave });

    await expect(moduleToTest.save({ userId, editorContent })).toMatchObject(expect.any(Promise));
    expect(mockedSave).lastCalledWith({
      collectionName: 'notes',
      id: editorContent.id,
      ownerId: userId,
      dataObj: {
        id: 'some-note-id',
        title: 'some title',
        body: '<p>Hellow World!<br></p>',
        delta: { ops: [] },
        dateCreated: 10001,
        dateModified: 20002,
        ownerId: userId,
      },
    });
  });
});

describe('3. remove', async() => {
  it('should return a rejected Promise if invalid arguments provided', async() => {
    const mockedRemove = jest.fn();
    moduleToTest.inject({ remove: mockedRemove });

    await expect(moduleToTest.remove({ ids: 12, userId: 'some-user-id' })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.remove({ ids: '', userId: 'some-user-id' })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.remove({ ids: [], userId: 'some-user-id' })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.remove({ ids: {}, userId: 'some-user-id' })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.remove({ ids: true, userId: 'some-user-id' })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.remove({ ids: [12, 34], userId: 54 })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.remove({ ids: [12, 34], userId: '' })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.remove({ ids: [12, 34], userId: [] })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.remove({ ids: [12, 34], userId: {} })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.remove({ ids: [12, 34], userId: true })).rejects.toMatchObject(expect.any(Error));
    expect(mockedRemove).not.toBeCalled();
  });

  it('should call injected remove() and return', async() => {
    let ids = 'id-to-remove';
    let userId = 'some-user-id';
    const returned = 'Removed';
    const mockedRemove = jest.fn().mockImplementation(() => Promise.resolve(returned));
    moduleToTest.inject({ remove: mockedRemove });

    // remove() should support ids as string
    await expect(moduleToTest.remove({ ids, userId })).resolves.toEqual(returned);
    expect(mockedRemove).lastCalledWith({ collectionName: 'notes', ids, ownerId: userId });
    // remove() should also support ids as an array
    ids = ['id1', 'id2', 'id3'];
    await expect(moduleToTest.remove({ ids, userId })).resolves.toEqual(returned);
    expect(mockedRemove).lastCalledWith({ collectionName: 'notes', ids, ownerId: userId });
  });
});
