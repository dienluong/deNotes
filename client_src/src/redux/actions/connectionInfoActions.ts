import connectionInfoActionTypes from './constants/connectionInfoConstants';

// Types
import { Action } from 'redux';
export interface ConnectionInfoActionT extends Action {
  payload: ConnectionInfoT;
}

export function setLoggedOutAction()
  : ConnectionInfoActionT {
  return {
    type: connectionInfoActionTypes.LOGGED_OUT,
    payload: {
      loggedIn: false,
    },
  };
}

export function setLoggedInAction()
  : ConnectionInfoActionT {
  return {
    type: connectionInfoActionTypes.LOGGED_IN,
    payload: {
      loggedIn: true,
    },
  };
}
