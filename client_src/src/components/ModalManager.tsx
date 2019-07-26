import React from 'react';
import { connect } from 'react-redux';
import * as rootReducer from '../redux/reducers';
import RenameNodeModal from './widgets/RenameNodeModal';

// Types
interface MapStatePropsT {
  type: string;
  props: Object;
}

function mapStateToProps(state: AppStateT): MapStatePropsT {
  return {
    type: rootReducer.selectModalInfoType(state),
    props: rootReducer.selectModalInfoProps(state),
  };
}

const MODAL_COMPONENTS: { [index: string]: React.ReactNode } = {
  'RENAME_NODE': RenameNodeModal,
};

const modalTypes = Object.keys(MODAL_COMPONENTS);
export const MODAL_TYPES: { [index: string]: string } = {};
modalTypes.forEach(type => MODAL_TYPES[type] = type);

function ModalManager({ type, props }: MapStatePropsT) {
  if (!type || !MODAL_COMPONENTS[type]) {
    return null;
  }
  const ChosenModal = MODAL_COMPONENTS[type];

  //@ts-ignore
  return <ChosenModal {...props} />
}

export default connect(mapStateToProps)(ModalManager);
