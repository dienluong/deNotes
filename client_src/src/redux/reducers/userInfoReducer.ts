import baseState from '../misc/initialState';
import accountActionTypes from '../actions/constants/accountActionConstants';
import { equals } from '../../utils/treeUtils';

// Types
import { AnyAction } from 'redux';

const initialUser = baseState.userInfo;

// function _equals(currentUser, newUser) {
//   const currentKeys = Object.keys(currentUser);
//   const newKeys = Object.keys(newUser);
//
//   if (currentKeys.length !== newKeys.length) { return false; }
//
//   return newKeys.every(key => currentUser[key] === newUser[key]);
// }

export default function userReducer(state: UserInfoT = initialUser, action: AnyAction)
  : UserInfoT {
  if (!action.payload) {
    action.type = '';
  }
  console.log(`REDUCER: '${action.type}'`);
  switch (action.type) {
    case accountActionTypes.SET_USER: {
      if (equals(state, action.payload.user)) { return state; }
      else { return { ...state, ...action.payload.user }; }
    }
    case accountActionTypes.SET_USERID: {
      if (state.id === action.payload.id) { return state; }
      else { return { ...state, id: action.payload.id }; }
    }
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current userInfo: ${JSON.stringify(state)}`);
      }
      return state;
  }
}

// Selects User's ID
export const selectId = (state: UserInfoT) => state.id;
