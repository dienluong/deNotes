import accountActionTypes from './constants/accountActionConstants';

// Types
import { AnyAction } from 'redux';

export function setUserAction({ user }: { user: UserInfoT })
  : AnyAction {
  return {
    type: accountActionTypes.SET_USER,
    payload: {
      user,
    },
  };
}

export function setUserIdAction({ id }: { id: string })
  : AnyAction {
  return {
    type: accountActionTypes.SET_USERID,
    payload: {
      id,
    },
  };
}
