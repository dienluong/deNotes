import { connect } from 'react-redux';
import * as rootReducer from '../redux/reducers';
import { clickAction } from '../redux/actions/drawerButtonActions';
import DrawerButton from './widgets/DrawerButton';

// Types
import { AnyAction, Dispatch } from 'redux';
interface MapStatePropsT {
  visible: boolean,
}
interface MapDispatchPropsT {
  clickHandler: () => AnyAction;
}

function mapStateToProps(state: AppStateT): MapStatePropsT {
  return {
    visible: rootReducer.selectConnectionInfoLoggedIn(state) && !rootReducer.selectNotesTreeVisible(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyAction>): MapDispatchPropsT {
  return {
    clickHandler() {
      return dispatch(clickAction());
    },
  }
}

// function mergeProps(stateProps: MapStatePropsT, dispatchProps: MapDispatchPropsT, ownProps: object) {
//   return Object.assign({}, dispatchProps, ownProps, { visible: stateProps.loggedIn && stateProps.buttonVisible });
// }

// Note: ownProps is automatically forwarded to the wrapped component
const DrawerButtonContainer = connect(mapStateToProps, mapDispatchToProps)(DrawerButton);
export default DrawerButtonContainer;

