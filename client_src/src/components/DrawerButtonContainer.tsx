import { connect } from 'react-redux';
import * as rootReducer from '../redux/reducers';
import DrawerButton from './widgets/DrawerButton';

interface MapStatePropsT {
  loggedIn: ConnectionInfoT["loggedIn"],
}

function mapStateToProps(state: AppStateT): MapStatePropsT {
  return {
    loggedIn: rootReducer.selectConnectionInfoLoggedIn(state),
  };
}

function mergeProps(stateProps: MapStatePropsT, dispatchProps: object, ownProps: { visible: boolean }) {
  return Object.assign({}, ownProps, { visible: stateProps.loggedIn && ownProps.visible });
}

// @ts-ignore
const DrawerButtonContainer = connect(mapStateToProps, null, mergeProps)(DrawerButton);
export default DrawerButtonContainer;

