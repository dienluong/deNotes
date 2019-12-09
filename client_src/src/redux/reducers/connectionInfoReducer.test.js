import reducer, { selectLoggedIn } from './connectionInfoReducer';
import connectionInfoActionTypes from '../actions/constants/connectionInfoActionConstants';
import initialState from '../misc/initialState';

describe('connectionInfoReducer', () => {
  it('should return the initial state by default', () => {
    expect(reducer(undefined, {})).toEqual(initialState.connectionInfo);
  });

  it('should return current state if no payload', () => {
    const currentState = { loggedIn: true };
    expect(reducer(currentState, { type: connectionInfoActionTypes.LOGGED_IN })).toBe(currentState);
  });

  it('should set the state according to received payload', () => {
    const currentState = { loggedIn: false };
    expect(reducer(currentState, { type: connectionInfoActionTypes.LOGGED_IN, payload: { loggedIn: true } })).toEqual({ loggedIn: true });
    currentState.loggedIn = true;
    expect(reducer(currentState, { type: connectionInfoActionTypes.LOGGED_OUT, payload: { loggedIn: false } })).toEqual({ loggedIn: false });
  });
});

describe('selectLoggedIn', () => {
  it('should return the corresponding property of the connectionInfo state', () => {
    expect(selectLoggedIn({ loggedIn: true })).toBe(true);
  });
});
