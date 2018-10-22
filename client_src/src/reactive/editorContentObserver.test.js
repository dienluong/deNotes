import * as moduleToTest from './editorContentObserver';
import initialState from '../redux/misc/initialState';
import uuid from 'uuid/v4';

describe('save', () => {
  const RealAlert = global.alert;
  // const RealDate = global.Date;
  // const mockedTimestamp = 10000;
  const mockedStorage = {
    save: jest.fn(),
    load: jest.fn(),
    remove: jest.fn(),
  };
  const user = 'test-user';

  beforeEach(() => {
    // provide implementation for window.alert
    global.alert = (...param) => console.log(...param);

    // global.Date = class extends RealDate {
    //   constructor() {
    //     super(mockedTimestamp);
    //   }
    //   static now() {
    //     return mockedTimestamp;
    //   }
    // };
  });

  afterEach(() => {
    // global.Date = RealDate;
    global.alert = RealAlert;
    mockedStorage.save.mockClear();
    mockedStorage.load.mockClear();
    mockedStorage.remove.mockClear();
  });

  it('should return rejected Promise if invoked without prior injecting dependency', async() => {
    const editorContent = {
      ...initialState.editorContent,
      id: uuid(),
      title: 'test editor content',
      dateCreated: Date.now() + 100000,
      dateModified: Date.now() + 200000,
      readOnly: false,
    };

    await expect(moduleToTest.save(editorContent)).rejects.toMatchObject(new Error('Cannot Save: Storage not available'));
  });

  it('should skip saving if content was newly loaded, i.e. save() is called with given content for the first time', async() => {
    const editorContent = {
      ...initialState.editorContent,
      id: uuid(),
      title: 'test editor content',
      dateCreated: Date.now() - 200000,
      dateModified: Date.now() + 200000,
      readOnly: false,
    };

    // Calling save() with editorContent for the first time means it was newly loaded.
    await expect(moduleToTest.save(editorContent)).resolves.toBe(false);
  });

  it('should skip saving if previously loaded content was not modified recently, i.e. dateModified < module startup datetime', async() => {
    const editorContent = {
      ...initialState.editorContent,
      id: uuid(),
      title: 'test editor content',
      dateCreated: Date.now() - 200000,
      dateModified: Date.now() - 100000,
      readOnly: false,
    };

    // Simulate content being previously loaded by calling save() more than once with the same content
    await moduleToTest.save(editorContent);
    await expect(moduleToTest.save(editorContent)).resolves.toBe(false);
  });

  it('should save if previously loaded content was modified recently, i.e. dateModified > module startup datetime', async() => {
    const editorContent = {
      ...initialState.editorContent,
      id: uuid(),
      title: 'test editor content',
      dateCreated: Date.now() - 200000,
      dateModified: Date.now() + 200000,
      readOnly: false,
    };

    mockedStorage.save = jest.fn().mockImplementation(() => Promise.resolve(editorContent));
    moduleToTest.inject({ user, storage: mockedStorage });

    // Simulate content being previously loaded by calling save() more than once with the same content
    await moduleToTest.save(editorContent);
    await expect(moduleToTest.save(editorContent)).resolves.toMatchObject(editorContent);
    expect(mockedStorage.save).toBeCalledWith({ userId: user, editorContent });
  });

  it('should not save again if content previously saved and not modified', async() => {
    const editorContent = {
      ...initialState.editorContent,
      id: uuid(),
      title: 'test editor content',
      dateCreated: Date.now() - 200000,
      dateModified: Date.now() + 200000,
      readOnly: false,
    };

    mockedStorage.save = jest.fn().mockImplementation(() => Promise.resolve(editorContent));
    moduleToTest.inject({ user, storage: mockedStorage });

    // Simulate content being previously loaded by calling save() more than once with the same content
    await moduleToTest.save(editorContent);

    // This should save
    await moduleToTest.save(editorContent);
    expect(mockedStorage.save).toBeCalledWith({ userId: user, editorContent });

    // Subsequent call to save() with same content will not save
    await expect(moduleToTest.save(editorContent)).resolves.toBe(false);
    expect(mockedStorage.save).toHaveBeenCalledTimes(1);
  });
});
