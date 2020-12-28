import { AsyncStorage } from 'react-native';
import * as Facebook from 'expo-facebook';
import firebase from 'firebase';

import {
  FACEBOOK_LOGIN_SUCCESS,
  FACEBOOK_LOGIN_FAIL,
  FACEBOOK_LOGOUT_SUCCESS,
  IS_AUTHENTICATED,
  CREATE_NEW_USER
} from './types';

export const isAuthenticated = () => async dispatch => {
  let token = await AsyncStorage.getItem('fb_token');

  if (token) {
    dispatch({
      type: IS_AUTHENTICATED,
      payload: { success: true, uid: token }
    });
  } else {
    dispatch({ type: IS_AUTHENTICATED, payload: { success: false } });
  }
};

export const facebookLogin = () => async dispatch => {
  let token = await AsyncStorage.getItem('fb_token');

  if (token) {
    dispatch({ type: FACEBOOK_LOGIN_SUCCESS, payload: token });
  } else {
    doFacebookLogin(dispatch);
  }
};

const doFacebookLogin = async dispatch => {
  const { type, token } = await Facebook.logInWithReadPermissionsAsync(
    '610860783051616',
    {
      permissions: ['public_profile']
    }
  );

  if (type === 'success') {
    const credential = firebase.auth.FacebookAuthProvider.credential(token);

    let response = await firebase.auth().signInWithCredential(credential);

    await AsyncStorage.setItem('fb_token', response.user.uid);

    dispatch({
      type: FACEBOOK_LOGIN_SUCCESS,
      payload: {
        uid: response.user.uid,
        newUser: response.additionalUserInfo.isNewUser
      }
    });
  } else if (type === 'cancel') {
    return dispatch({ type: FACEBOOK_LOGIN_FAIL });
  }
};

export const facebookLogout = () => async dispatch => {
  let result = await AsyncStorage.removeItem('fb_token');

  dispatch({ type: FACEBOOK_LOGOUT_SUCCESS });
};
