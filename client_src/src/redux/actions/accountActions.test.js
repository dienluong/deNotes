import { setUser } from './accountActions';
import accountActionTypes from './constants/accountActionConstants';
import uuid from 'uuid/v4';

describe('setUser action creator', () => {
  it('should return an object with the received ID as payload and with the proper action type', () => {
    const id = uuid();
    const type = accountActionTypes.SET_USERID;
    expect(setUser({ id })).toEqual({ type, payload: { id } });
    expect(MutationObserver).toBeDefined();
  });
});
