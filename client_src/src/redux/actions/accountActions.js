import accountActionTypes from './constants/accountActionConstants';

export function setUser({ user }) {
  return {
    type: accountActionTypes.SET_USERID,
    payload: {
      user,
    },
  };
}

