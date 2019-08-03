import modalActionTypes from './constants/modalActionConstants';

// Types
import { Action, AnyAction } from 'redux';
export interface ModalActionT extends Action {
  payload: ModalInfoT
}

export function showModalAction({ type, props }: { type: string, props: Object }): ModalActionT {
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
