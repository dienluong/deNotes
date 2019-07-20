import * as moduleToTest from './treeUtils';
import { NONE_SELECTED, nodeTypes } from '../utils/appCONSTANTS';
const ID_DELIMITER = process.env.REACT_APP_ID_DELIMITER || '|^|';
import { mockedTree } from '../test-utils/mocks/mockedNotesTree';

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

describe('2. findDeepestFolder ', () => {
  it('should return the index of FOLDER node deepest in given path', () => {
    // case where ITEM node is last entry
    let testPath = [`${nodeTypes.FOLDER}${ID_DELIMITER}1111`, `${nodeTypes.ITEM}${ID_DELIMITER}2222`];
    expect(moduleToTest.findDeepestFolder(testPath)).toBe(0);

    // case where FOLDER node is last entry
    testPath = [`${nodeTypes.FOLDER}${ID_DELIMITER}0000`, `${nodeTypes.FOLDER}${ID_DELIMITER}1111`, `${nodeTypes.FOLDER}${ID_DELIMITER}2222`];
    expect(moduleToTest.findDeepestFolder(testPath)).toBe(2);

    // case where FOLDER node is last and lone entry
    testPath = [`${nodeTypes.FOLDER}${ID_DELIMITER}1111`];
    expect(moduleToTest.findDeepestFolder(testPath)).toBe(0);
  });

  it('should return -1, i.e. the "deepest" FOLDER is root, if path only has one non-FOLDER entry', () => {
    // case where ITEM node is last and lone entry
    let testPath = [`${nodeTypes.ITEM}${ID_DELIMITER}1111`];
    expect(moduleToTest.findDeepestFolder(testPath)).toEqual(-1);
    // case where no selected node in root folder
    testPath = [NONE_SELECTED];
    expect(moduleToTest.findDeepestFolder(testPath)).toEqual(-1);
  });

  it('should return null if invalid path received', () => {
    let testPath = [];
    expect(moduleToTest.findDeepestFolder(testPath)).toBeNull();
    // 2 is not a valid folder ID (must be a string)
    testPath = ['1', 2, `${nodeTypes.ITEM}${ID_DELIMITER}3333`];
    expect(moduleToTest.findDeepestFolder(testPath)).toBeNull();
    // the first item in path is not a valid folder ID (must start with a valid node type)
    testPath = [`my${nodeTypes.FOLDER}${ID_DELIMITER}3333`, `${nodeTypes.ITEM}${ID_DELIMITER}3333`];
    expect(moduleToTest.findDeepestFolder(testPath)).toBeNull();
    testPath = {};
    expect(moduleToTest.findDeepestFolder(testPath)).toBeNull();
  });
});

describe('3. translateNodeIdToInfo', () => {
  it('should return an object with type and uniqid', () => {
    let type = nodeTypes.ITEM;
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
    let invalidNodeId = `${nodeTypes.FOLDER}|~|7890`;
    expect(moduleToTest.translateNodeIdToInfo({ nodeId: invalidNodeId })).toBeNull();
    // Not a string
    invalidNodeId = 1234;
    expect(moduleToTest.translateNodeIdToInfo({ nodeId: invalidNodeId })).toBeNull();
    // Wrong node type embedded -- must be one of nodeTypes members from appCONSTANTS.ts
    invalidNodeId = `items${ID_DELIMITER}5678`;
    expect(moduleToTest.translateNodeIdToInfo({ nodeId: invalidNodeId })).toBeNull();
    invalidNodeId = `afolder${ID_DELIMITER}2345`;
    expect(moduleToTest.translateNodeIdToInfo({ nodeId: invalidNodeId })).toBeNull();
    invalidNodeId = NONE_SELECTED;
    expect(moduleToTest.translateNodeIdToInfo({ nodeId: invalidNodeId })).toBeNull();
  });
});

describe('4. collapseFolders', () => {
  it('sets "expanded" property to false for all nodes which have "children"', () => {
    const newTree = moduleToTest.collapseFolders({ tree: mockedTree[0].children });

    const test = node => {
      if (node && node.children) {
        expect(node.expanded).toBe(false);
      } else {
        expect("expanded" in node).toBe(false);
      }
    };

    newTree.forEach(test);
    expect.assertions(newTree.length);
  });
});

describe('5. getDescendants', () => {
  it('returns an array of all descendants of given node, including itself', () => {
    // expects the folder and its children to be returned
    let expectedArray = [mockedTree[0].children[2], ...mockedTree[0].children[2].children];
    expect(moduleToTest.getDescendants({ tree: mockedTree, nodeId: mockedTree[0].children[2].id })).toEqual(expectedArray);
    // case where node is an ITEM, i.e. not a folder
    expectedArray = [mockedTree[0].children[1]];
    expect(moduleToTest.getDescendants({ tree: mockedTree, nodeId: mockedTree[0].children[1].id })).toEqual(expectedArray);
    // case where folder is empty
    expectedArray = [mockedTree[2]];
    expect(moduleToTest.getDescendants({ tree: mockedTree, nodeId: mockedTree[2].id })).toEqual(expectedArray);
  });

  it('returns an empty array if invalid parameter was given', () => {
    expect(moduleToTest.getDescendants({ tree: mockedTree, nodeId: '' })).toEqual([]);
    expect(moduleToTest.getDescendants({ tree: mockedTree, nodeId: 'does not exist' })).toEqual([]);
    expect(moduleToTest.getDescendants({ tree: mockedTree, nodeId: 2 })).toEqual([]);
    expect(moduleToTest.getDescendants({ tree: [], nodeId: mockedTree[0].id })).toEqual([]);
    expect(moduleToTest.getDescendants({ tree: 'not a tree', nodeId: mockedTree[0].id })).toEqual([]);
  });
});
