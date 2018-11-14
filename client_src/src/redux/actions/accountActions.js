import accountActionTypes from './constants/accountActionConstants';

export function setUserAction({ user }) {
  return {
    type: accountActionTypes.SET_USER,
    payload: {
      user,
    },
  };
}

export function setUserIdAction({ id }) {
  return {
    type: accountActionTypes.SET_USERID,
    payload: {
      id,
    },
  };
}
