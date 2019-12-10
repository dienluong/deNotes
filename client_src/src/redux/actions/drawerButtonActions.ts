import drawerButtonActionTypes from './constants/drawerButtonActionConstants';

// Types
import { AnyAction } from 'redux';

export function clickAction()
  : AnyAction {
  return {
    type: drawerButtonActionTypes.CLICK,
    payload: {},
  };
}

