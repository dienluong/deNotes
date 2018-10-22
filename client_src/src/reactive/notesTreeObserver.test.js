import moduleToTest from './notesTreeObserver';
import initialState from '../redux/misc/initialState';

describe('observer', () => {
  const RealAlert = global.alert;
  const mockedStorage = {
    save: jest.fn(),
    load: jest.fn(),
    remove: jest.fn(),
  };

  const user = 'test-user-id';

  beforeEach(() => {
    // provide implementation for window.alert
    global.alert = (...param) => console.log(...param);
  });

  afterEach(() => {
    global.alert = RealAlert;
    mockedStorage.save.mockClear();
    mockedStorage.load.mockClear();
    mockedStorage.remove.mockClear();
  });

  it('should return rejected Promise if invoked without prior injecting dependency', async() => {
    const notesTree = {
      ...initialState,
      id: 'my-test-tree',
      dateCreated: Date.now() + 100000,
      dateModified: Date.now() + 200000,
    };

    await expect(moduleToTest({})(notesTree)).rejects.toEqual(expect.any(Error));
  });

  it('should not save if not modified', async() => {
    const notesTree = {
      ...initialState,
      id: 'my-test-tree',
      dateCreated: Date.now() - 200000,
      dateModified: Date.now() - 100000,
    };

    await expect(moduleToTest({ user, storage: mockedStorage })(notesTree)).resolves.toBe(false);
    expect(mockedStorage.save).not.toBeCalled();
  });

  it('should save if modified since last saved', async() => {
    const notesTree = {
      ...initialState,
      id: 'my-test-tree',
      dateCreated: Date.now() + 100000,
      dateModified: Date.now() + 200000,
    };

    mockedStorage.save.mockImplementation(() => Promise.resolve(notesTree));

    await expect(moduleToTest({ user, storage: mockedStorage })(notesTree)).resolves.toBe(notesTree);
    expect(mockedStorage.save).toBeCalledWith({ userId: user, notesTree });
    expect(mockedStorage.save).toBeCalledTimes(1);
  });
});
