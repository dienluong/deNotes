import connectionInfoActionTypes from '../actions/constants/connectionInfoActionConstants';
import baseState from '../misc/initialState';

// Types
import { AnyAction } from "redux";

const initialState: AppStateT = { ...baseState };

export default function reducedReducer(state: AppStateT = initialState, action: AnyAction)
  : AppStateT {
  if (!action.payload) {
    action.type = '';
  }
  console.log(`REDUCER: '${action.type}'`);
  switch (action.type) {
    case connectionInfoActionTypes.LOGGED_OUT:
      return initialState;
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current state tree: ${JSON.stringify(state)}`);
      }
      return state;
  }
}
