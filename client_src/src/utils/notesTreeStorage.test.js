import * as moduleToTest from './notesTreeStorage';

describe('1. save', () => {
  it('should return an Error in rejected Promise if invoked with no dependency injected beforehand', async() => {
    const userId = 'some-user-id';
    const notesTree = {
      id: 'test-notesTree-id',
      tree: [],
      dateCreated: 30303,
      dateModified: 50505,
    };

    await expect(moduleToTest.save({ userId, notesTree }))
      .rejects.toMatchObject(expect.any(Error));
  });

  it('should return rejected Promise if invalid arguments provided', async() => {
    const notesTree = {
      id: 'test-notesTree-id',
      tree: [],
      dateCreated: 30303,
      dateModified: 50505,
    };
    const mockedSave = jest.fn();
    moduleToTest.inject({ save: mockedSave });

    await expect(moduleToTest.save({ notesTree })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.save({ userId: '', notesTree })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.save({ userId: 1, notesTree })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.save({ userId: 'a-user-id' })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.save({ userId: 'a-user-id', notesTree: [] })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.save({ userId: 'a-user-id', notesTree: { id: '', tree: [] } })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.save({ userId: 'a-user-id', notesTree: { id: 'some-id', tree: {} } })).rejects.toMatchObject(expect.any(Error));
    expect(mockedSave).not.toBeCalled();
  });

  it('should call injected save() and return', async() => {
    const userId = 'some-user-id';
    const notesTree = {
      id: 'test-notesTree-id',
      tree: [],
      dateCreated: 30303,
      dateModified: 50505,
    };
    const returned = 'Saved';
    const mockedSave = jest.fn().mockImplementation(() => Promise.resolve(returned));
    moduleToTest.inject({ save: mockedSave });

    await expect(moduleToTest.save({ userId, notesTree })).resolves.toEqual(returned);
    expect(mockedSave).lastCalledWith({
      collectionName: 'trees',
      id: notesTree.id,
      ownerId: userId,
      dataObj: {
        ...notesTree,
        ownerId: userId,
      },
    });
  });
});

describe('2. load', () => {
  it('should return an Error in rejected Promise if invoked with no dependency injected beforehand', async() => {
    const noteId = 'some-tree-id';
    const userId = 'some-user-id';

    await expect(moduleToTest.load({ userId, id: noteId }))
      .rejects.toMatchObject(expect.any(Error));
  });

  it('should return an Error in rejected Promise if invoked with invalid arguments', async() => {
    const mockedLoad = jest.fn();
    moduleToTest.inject({ load: mockedLoad });

    await expect(moduleToTest.load({ id: 1, userId: 'some-user' })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.load({ id: true, userId: 'some-user' })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.load({ id: '', userId: 'some-user' })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.load({ userId: 'some-user' })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.load({ id: 'test-tree' })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.load({ id: 'test-tree', userId: true })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.load({ id: 'test-tree', userId: {} })).rejects.toMatchObject(expect.any(Error));
    await expect(moduleToTest.load({ id: 'test-tree', userId: '' })).rejects.toMatchObject(expect.any(Error));
    expect(mockedLoad).not.toBeCalled();
  });

  it('should return an Error in rejected Promise if fetched data in unsupported format', async() => {
    let id = 'some-tree-id';
    const userId = 'some-user-id';
    let notesTree = [];

    const mockedLoad = jest.fn().mockImplementation(() => Promise.resolve(notesTree));
    moduleToTest.inject({ load: mockedLoad });

    await expect(moduleToTest.load({ id, userId })).rejects.toMatchObject({ message: expect.stringMatching(/unrecognized/i) });
    expect(mockedLoad).lastCalledWith({ collectionName: 'trees', id, ownerId: userId });

    notesTree = [{ id: 'wrongly-formatted-data' }, { tree: 'another-bad-format' }];
    id = 'id2';
    await expect(moduleToTest.load({ id, userId })).rejects.toMatchObject({ message: expect.stringMatching(/unrecognized/i) });
    expect(mockedLoad).lastCalledWith({ collectionName: 'trees', id, ownerId: userId });

    notesTree = { id: 'unknown-data' };
    id = 'id3';
    await expect(moduleToTest.load({ id, userId })).rejects.toMatchObject({ message: expect.stringMatching(/unrecognized/i) });
    expect(mockedLoad).lastCalledWith({ collectionName: 'trees', id, ownerId: userId });

    notesTree = 'badly-formatted-data';
    id = 'id4';
    await expect(moduleToTest.load({ id, userId })).rejects.toMatchObject({ message: expect.stringMatching(/unrecognized/i) });
    expect(mockedLoad).lastCalledWith({ collectionName: 'trees', id, ownerId: userId });
  });

  it('should call injected load() and return an object containing fetched data', async() => {
    const id = 'some-tree-id';
    const userId = 'some-user-id';
    const dateCreated = 'Wed, 24 Oct 2018 19:29:59 GMT';
    const dateModified = 'Wed, 25 Oct 2018 19:29:59 GMT';
    const notesTree = {
      id: 'test-notesTree-id',
      tree: '[{ "id": "a-node-id" }]',
      dateCreated,
      dateModified,
    };
    const expectedCreatedTimeStamp = 1540409399000;
    const expectedModifiedTimeStamp = 1540495799000;

    const mockedLoad = jest.fn().mockImplementation(() => Promise.resolve(notesTree));
    moduleToTest.inject({ load: mockedLoad });

    await expect(moduleToTest.load({ id, userId })).resolves.toMatchObject({
      ...notesTree,
      tree: [{ id: 'a-node-id' }],
      dateCreated: expectedCreatedTimeStamp,
      dateModified: expectedModifiedTimeStamp,
    });
    expect(mockedLoad).lastCalledWith({ collectionName: 'trees', id, ownerId: userId });
  });
});
