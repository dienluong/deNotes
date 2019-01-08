import * as moduleToTest from './treeUtils';
const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER || '|^|';

describe('1. equals()', () => {
  it('should handle simple non-nested objects and arrays', () => {
    let obj1 = {
      a: 'a',
      b: 2,
      c: false,
      d: 1.234567,
      e: null,
      f: undefined,
      'another property': 0,
    };

    let obj2 = {
      a: "a",
      b: 2,
      c: false,
      d: 1.234567,
      e: null,
      f: undefined,
      'another property': 0,
    };

    expect(moduleToTest.equals(obj1, obj2)).toBe(true);

    obj1 = {
      ...obj1,
      e: undefined,
      f: null,
    };
    expect(moduleToTest.equals(obj1, obj2)).toBe(false);

    obj2 = obj1;
    expect(moduleToTest.equals(obj1, obj2)).toBe(true);

    obj1 = ['a', 2, false, 1.234567, null, undefined];
    obj2 = ['a', 2, false, 1.234567, null, undefined];
    expect(moduleToTest.equals(obj1, obj2)).toBe(true);

    obj2 = [...obj2, undefined];
    expect(moduleToTest.equals(obj1, obj2)).toBe(false);

    obj1 = obj2;
    expect(moduleToTest.equals(obj1, obj2)).toBe(true);
  });

  it('should handle nested objects and arrays', () => {
    let obj1 = {
      a: {
        b: 'b',
        c: 3,
        e: { ff: false, gg: [], hh: {} },
        f: [],
      },
      aa: [
        'aa',
        ['bb', [44.55], { bb: true }, [], {}],
        { cc: [], dd: {} },
        {},
      ],
    };

    let obj2 = {
      a: {
        b: 'b',
        c: 3,
        e: { ff: false, gg: [], hh: {} },
        f: [],
      },
      aa: [
        'aa',
        ['bb', [44.55], { bb: true }, [], {}],
        { cc: [], dd: {} },
        {},
      ],
    };

    expect(moduleToTest.equals(obj1, obj2)).toBe(true);

    obj1 = {
      ...obj1,
      a: {
        ...obj1.a,
        e: { ...obj1.a.e, gg: [undefined] },
      },
    };

    expect(moduleToTest.equals(obj1, obj2)).toBe(false);

    obj1 = obj2;
    expect(moduleToTest.equals(obj1, obj2)).toBe(true);

    obj2 = {
      ...obj2,
      aa: [...obj2.aa, false],
    };
    expect(moduleToTest.equals(obj1, obj2)).toBe(false);

    obj1 = [{ a: [1, 2, 3] }, [{ 4: '4', 5: '5', 6: '6' }]];
    obj2 = [{ a: [1, 2, 3] }, [{ 4: '4', 5: '5', 6: '6' }]];
    expect(moduleToTest.equals(obj1, obj2)).toBe(true);

    obj2 = [{ a: [1, 2, 3] }, [{ 4: '4', 5: '5', 6: '6', 7: true }]];
    expect(moduleToTest.equals(obj1, obj2)).toBe(false);

    obj1 = [...obj2, []];
    expect(moduleToTest.equals(obj1, obj2)).toBe(false);
  });
});

describe('2. findClosestParent ', () => {
  it('should return the index of parent node for given path', () => {
    let testPath = [`folder${ID_DELIMITER}1111`, `item${ID_DELIMITER}2222`];
    expect(moduleToTest.findClosestParent(testPath)).toBe(0);

    testPath = [`folder${ID_DELIMITER}0000`, `folder${ID_DELIMITER}1111`, `folder${ID_DELIMITER}2222`];
    expect(moduleToTest.findClosestParent(testPath)).toBe(1);
  });

  it('should return null if path only has one entry', () => {
    let testPath = [`folder${ID_DELIMITER}1111`];
    expect(moduleToTest.findClosestParent(testPath)).toBeNull();
  });

  it('should return null if invalid path received', () => {
    let testPath = [];
    expect(moduleToTest.findClosestParent(testPath)).toBeNull();
    testPath = [1, 2, `folder${ID_DELIMITER}3333`];
    expect(moduleToTest.findClosestParent(testPath)).toBeNull();
    testPath = {};
    expect(moduleToTest.findClosestParent(testPath)).toBeNull();
  });
});

describe('3. translateNodeIdToInfo', () => {
  it('should return an object with type and uniqid', () => {
    let type = 'item';
    let uniqid = '1234';
    let testNodeId = `${type}${ID_DELIMITER}${uniqid}`;
    let expectedResult = {
      type,
      uniqid,
    };
    expect(moduleToTest.translateNodeIdToInfo({ nodeId: testNodeId })).toMatchObject(expectedResult);
  });

  it('should return null for invalid node ID', () => {
    // ID with wrong delimiter
    let invalidNodeId = 'folder|~|7890';
    expect(moduleToTest.translateNodeIdToInfo({ nodeId: invalidNodeId })).toBeNull();
    // Not a string
    invalidNodeId = 1234;
    expect(moduleToTest.translateNodeIdToInfo({ nodeId: invalidNodeId })).toBeNull();
    // Wrong node type embedded -- must be 'item' or 'folder'
    invalidNodeId = `items${ID_DELIMITER}5678`;
    expect(moduleToTest.translateNodeIdToInfo({ nodeId: invalidNodeId })).toBeNull();
    invalidNodeId = `afolder${ID_DELIMITER}2345`;
    expect(moduleToTest.translateNodeIdToInfo({ nodeId: invalidNodeId })).toBeNull();
  });
});
