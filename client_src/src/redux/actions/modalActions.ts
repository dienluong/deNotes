import modalActionTypes from './constants/modalActionConstants';

// Types
import { AnyAction } from 'redux';

type showModalPropsT = {
  nodeType: NodeTypeT,
  currentName: string,
  onCloseHandler: ({ value }: { value: string }) => unknown;
}
export function showModalAction({ type, props }: { type: string, props: showModalPropsT }): AnyAction {
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
