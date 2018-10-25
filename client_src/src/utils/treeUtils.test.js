import * as moduleToTest from './treeUtils';

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

    obj1 = ['a', 2, false, 1.234567, null, undefined];
    obj2 = ['a', 2, false, 1.234567, null, undefined];
    expect(moduleToTest.equals(obj1, obj2)).toBe(true);

    obj2 = [...obj2, undefined];
    expect(moduleToTest.equals(obj1, obj2)).toBe(false);
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
