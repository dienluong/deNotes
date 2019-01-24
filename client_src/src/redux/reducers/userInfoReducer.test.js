import reducer from './userInfoReducer';
import accountActionTypes from '../actions/constants/accountActionConstants';
import initialState from '../misc/initialState';

describe('userInfoReducer', () => {
  it('should return the initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState.userInfo);
  });

  it('should return current state if no payload', () => {
    const currentState = { id: 'current-user-id' };
    expect(reducer(currentState, { type: accountActionTypes.SET_USER })).toBe(currentState);
  });

  it('should, on SET_USER, return an entire new state', () => {
    const currentState = {
      id: 'current-user-id',
    };

    const newUserInfo = {
      id: 'a-new-user-id',
    };

    expect(reducer(currentState, {
      type: accountActionTypes.SET_USER,
      payload: {
        user: newUserInfo,
      },
    })).toEqual(newUserInfo);

    // should return the current state if the new user is an equivalent
    expect(reducer(currentState, {
      type: accountActionTypes.SET_USER,
      payload: {
        user: {
          ...currentState,
        },
      },
    })).toBe(currentState);
  });

  it('should, on SET_USERID, return the state with the ID changed accordingly', () => {
    const currentState = {
      id: 'current-user-id',
    };

    const newUserId = 'a-new-user-id';

    const expectedNewState = {
      id: newUserId,
    };

    expect(reducer(currentState, {
      type: accountActionTypes.SET_USERID,
      payload: {
        id: newUserId,
      },
    })).toEqual(expectedNewState);

    // should return the current state if the new user is an equivalent
    expect(reducer(currentState, {
      type: accountActionTypes.SET_USERID,
      payload: {
        id: currentState.id,
      },
    })).toBe(currentState);
  });
});
