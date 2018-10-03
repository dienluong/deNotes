import accountActionTypes from './constants/accountActionConstants';

export function setUser({ id }) {
  return {
    type: accountActionTypes.SET_USERID,
    payload: {
      id,
    },
  };
}

