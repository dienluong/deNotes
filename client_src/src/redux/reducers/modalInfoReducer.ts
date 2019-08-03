import modalActionTypes from '../actions/constants/modalActionConstants';
import baseState from '../misc/initialState';

// Types
import { ModalActionT } from '../actions/modalActions';

const initialState: ModalInfoT = baseState.modalInfo;

export default function modalInfoReducer(state: ModalInfoT = initialState, action: ModalActionT)
  : ModalInfoT {
  if (!action.payload) {
    action.type = '';
  }
  console.log(`REDUCER: '${action.type}'`);
  switch (action.type) {
    case modalActionTypes.SHOW_MODAL:
      return {
        ...state,
        ...action.payload
      };
    case modalActionTypes.HIDE_MODAL:
      return {
        ...state,
        type: '',
        props: {},
      };
    default:
      if (process.env.REACT_APP_DEBUG) {
        console.log(`Current modalInfo: ${JSON.stringify(state)}`);
      }
      return state;
  }
}

export const selectType = (state: ModalInfoT) => state.type;
export const selectProps = (state: ModalInfoT) => state.props;
