import {
  FACEBOOK_LOGIN_SUCCESS,
  FACEBOOK_LOGIN_FAIL,
  FACEBOOK_LOGOUT_SUCCESS,
  IS_AUTHENTICATED
} from '../actions/types';

export default function(state = {}, action) {
  switch (action.type) {
    case IS_AUTHENTICATED:
      return { success: action.payload.success, uid: action.payload.uid };
    case FACEBOOK_LOGOUT_SUCCESS:
      return { uid: null };
    case FACEBOOK_LOGIN_SUCCESS:
      return {
        user: { uid: action.payload.uid, newUser: action.payload.newUser }
      };
    case FACEBOOK_LOGIN_FAIL:
      return { uid: null };
    default:
      return state;
  }
}
