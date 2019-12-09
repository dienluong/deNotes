import connectionInfoActionTypes from '../actions/constants/connectionInfoActionConstants';
import baseState from '../misc/initialState';

// Types
import { ConnectionInfoActionT } from '../actions/connectionInfoActions';

const initialState: ConnectionInfoT = { ...baseState.connectionInfo };

export default function connectionInfoReducer(state: ConnectionInfoT = initialState, action: ConnectionInfoActionT)
  : ConnectionInfoT {
  if (!action.payload) {
    action.type = '';
  }
  console.log(`REDUCER: '${action.type}'`);
  switch (action.type) {
    case connectionInfoActionTypes.LOGGED_IN:
      return {
        ...state,
        ...action.payload,
      };
    case connectionInfoActionTypes.LOGGED_OUT:
      return {
        ...state,
        ...action.payload,
      };
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current connectionInfo : ${JSON.stringify(state)}`);
      }
      return state;
  }
}

export const selectLoggedIn = (state: ConnectionInfoT) => state.loggedIn;
