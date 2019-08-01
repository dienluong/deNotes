import modalActionTypes from './constants/modalActionConstants';

// Types
import { AnyAction } from 'redux';

export function showModalAction({ type, props }: { type: string, props: Object }): AnyAction {
  return {
    type: modalActionTypes.SHOW_MODAL,
    payload: {
      type,
      props,
    },
  };
}

export function hideModalAction(): AnyAction {
  return {
    type: modalActionTypes.HIDE_MODAL,
    payload: {},
  }
}
