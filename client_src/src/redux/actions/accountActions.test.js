import { setUserAction, setUserIdAction } from './accountActions';
import accountActionTypes from './constants/accountActionConstants';
import uuid from 'uuid/v4';

describe('setUserAction action creator', () => {
  it('should return an object with the provided user as payload and with the proper action type', () => {
    const id = uuid();
    const user = {
      id,
    };
    const type = accountActionTypes.SET_USER;
    expect(setUserAction({ user })).toEqual({ type, payload: { user } });
  });
});

describe('setUserIdAction action creator', () => {
  it('should return an object with the received ID as payload and with the proper action type', () => {
    const id = uuid();
    const type = accountActionTypes.SET_USERID;
    expect(setUserIdAction({ id })).toEqual({ type, payload: { id } });
  });
});
