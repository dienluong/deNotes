import baseState from '../misc/initialState';
import accountActionTypes from '../actions/constants/accountActionConstants';

const initialUser = baseState.userInfo;

function _equals(currentUser, newUser) {
  const currentKeys = Object.keys(currentUser);
  const newKeys = Object.keys(newUser);

  if (currentKeys.length !== newKeys.length) { return false; }

  return newKeys.every(key => currentUser[key] === newUser[key]);
}

export default function userReducer(state = initialUser, action) {
  console.log(`REDUCER: ${action.type}`);
  switch (action.type) {
    case accountActionTypes.SET_USER: {
      if (_equals(state, action.payload.user)) { return state; }
      else { return { ...state, ...action.payload.user }; }
    }
    case accountActionTypes.SET_USERID: {
      if (state.id === action.payload.id) { return state; }
      else { return { ...state, id: action.payload.id }; }
    }
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current activeNode: ${JSON.stringify(state)}`);
      }
      return state;
  }
}

// Selects User's ID
export const selectID = (state) => state.id;