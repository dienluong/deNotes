import reducer from './modalInfoReducer';
import modalActionTypes from '../actions/constants/modalActionConstants';
import initialState from '../misc/initialState';

describe('modalInfoReducer', () => {
  it('should return the initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState.modalInfo);
  });

  it('should return current state if no payload', () => {
    const currentState = { type: 'modal-typeX', props: { prop1: [1, 'b'], prop2: 'abc' } };
    expect(reducer(currentState, { type: modalActionTypes.SHOW_MODAL })).toBe(currentState);
  });

  it('should, on SHOW_MODAL, return an entire new state', () => {
    const currentState = { type: 'modal-typeX', props: { prop1: [1, 'b'], prop2: 'abc' } };

    const newModalInfo = { type: 'modal-typeZ', props: { prop1: 123, prop2: 'xyz' } };

    const newState = reducer(currentState, {
      type: modalActionTypes.SHOW_MODAL,
      payload: newModalInfo,
    });

    expect(newState).toEqual(newModalInfo);
    expect(newState).not.toBe(newModalInfo);
  });

  it('should, on HIDE_MODAL, clear modal state', () => {
    const currentState = {
      type: 'current-user-id',
      props: {
        prop1: 123,
        prop2: 'abc',
      },
    };
    const expectedNewState = {
      type: '',
      props: {},
    };

    expect(reducer(currentState, {
      type: modalActionTypes.HIDE_MODAL,
      payload: {
        type: 'whatever',
        props: {},
      },
    })).toEqual(expectedNewState);
  });
});
