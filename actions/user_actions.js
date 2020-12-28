import { AsyncStorage } from 'react-native';
import firebase from 'firebase';
import axios from 'axios';
import _ from 'lodash';

import {
  GET_USER_PROFILE,
  GET_USER_POSTS,
  CREATE_USER_PROFILE,
  TOGGLE_POST_LIKE,
  GET_USER_LIKES,
  GET_USER_COMMENTS,
  GET_USER_SAVED
} from './types';
import { checkUserLikesPost, checkUserSavedPost } from './post_actions';
import AsyncForEach from '../components/helpers/async_for_each';

const CLOUD_FUNCTIONS_ENDPOINT =
  'https://us-central1-respawn-48469.cloudfunctions.net';

export const getUserProfile = uid => async dispatch => {
  firebase
    .database()
    .ref(`users/${uid}/profile`)
    .once('value')
    .then(snapshot => {
      const profileObject = JSON.parse(JSON.stringify(snapshot));
      dispatch({ type: GET_USER_PROFILE, payload: profileObject });
    })
    .catch(err => {
      console.log(err);
    });
};

export const toggleLikeOnPost = (postID, userLikesPost) => async dispatch => {
  try {
    let token = await AsyncStorage.getItem('fb_token');
    if (!token) {
      return dispatch({ type: TOGGLE_POST_LIKE, payload: false });
    }

    const request = {
      uid: token,
      postID: postID
    };

    const functionType = userLikesPost ? 'unlikePost' : 'likePost';

    let { data } = await axios.post(
      `${CLOUD_FUNCTIONS_ENDPOINT}/${functionType}`,
      request
    );
    dispatch({ type: TOGGLE_POST_LIKE, payload: data.success });
  } catch (error) {
    console.log(error);
  }
};

export const getUserPosts = uid => async dispatch => {
  const ref = firebase.database().ref('posts');
  try {
    const posts = [];
    ref
      .orderByChild('owner')
      .equalTo(uid)
      .once('value', async snapshot => {
        snapshot.forEach(snap => {
          posts.push(snap);
        });

        const fullPosts = [];
        await AsyncForEach(posts, async (post, i) => {
          const postVal = JSON.parse(JSON.stringify(post));
          let userLikesPost = await checkUserLikesPost(postVal.postID);
          let userSavedPost = await checkUserSavedPost(postVal.postID);

          fullPosts.push({
            ...postVal,
            userLikesPost: userLikesPost,
            userSavedPost: userSavedPost
          });
        });

        const fullPostObj = JSON.parse(JSON.stringify(fullPosts));

        dispatch({
          type: GET_USER_POSTS,
          payload: fullPostObj
        });
      });
  } catch (error) {
    if (error) {
      console.log(error);
      dispatch({
        type: GET_USER_POSTS,
        payload: []
      });
    }
  }
};

export const getUserLikes = uid => async dispatch => {
  const db = firebase.database();
  const userLikesRef = db.ref(`users/${uid}/likes`);

  try {
    let likedPostsRes = await userLikesRef.orderByChild('postID').once('value');
    const likedPostIDS = [];
    likedPostsRes.forEach(post => {
      likedPostIDS.push(post.val().postID);
    });

    const likedPosts = [];
    await AsyncForEach(likedPostIDS, async postID => {
      let postData = await db.ref(`posts/${postID}`).once('value');
      let userLikesPost = await checkUserLikesPost(postID);
      let userSavedPost = await checkUserSavedPost(postID);

      likedPosts.push({
        ...postData.val(),
        userLikesPost: userLikesPost,
        userSavedPost: userSavedPost
      });
    });

    const likedPostsWithProfile = [];
    await AsyncForEach(likedPosts, async post => {
      let profile = await db.ref(`users/${post.owner}/profile`).once('value');
      const fullPostData = {
        post: { ...post },
        profile: { ...profile.val() }
      };
      likedPostsWithProfile.push(fullPostData);
    });

    dispatch({
      type: GET_USER_LIKES,
      payload: likedPostsWithProfile
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: GET_USER_LIKES,
      payload: []
    });
  }
};

export const getUserSaved = uid => async dispatch => {
  const db = firebase.database();
  const userSavedRef = db.ref(`users/${uid}/saved`);

  try {
    let savedPostsRes = await userSavedRef.orderByChild('postID').once('value');
    const savedPostIDS = [];
    savedPostsRes.forEach(post => {
      savedPostIDS.push(post.val().postID);
    });

    const savedPosts = [];
    await AsyncForEach(savedPostIDS, async postID => {
      let postData = await db.ref(`posts/${postID}`).once('value');
      let userLikesPost = await checkUserLikesPost(postID);
      let userSavedPost = await checkUserSavedPost(postID);

      savedPosts.push({
        ...postData.val(),
        userLikesPost: userLikesPost,
        userSavedPost: userSavedPost
      });
    });

    const savedPostsWithProfile = [];
    await AsyncForEach(savedPosts, async post => {
      let profile = await db.ref(`users/${post.owner}/profile`).once('value');
      const fullPostData = {
        post: { ...post },
        profile: { ...profile.val() }
      };
      savedPostsWithProfile.push(fullPostData);
    });

    dispatch({
      type: GET_USER_SAVED,
      payload: savedPostsWithProfile
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: GET_USER_SAVED,
      payload: []
    });
  }
};

export const getUserComments = uid => async dispatch => {
  if (!uid) {
    return dispatch({ type: GET_USER_COMMENTS, payload: { success: false } });
  }

  const db = firebase.database();
  const userCommentsRef = db.ref(`comments`);

  try {
    const userCommentsArr = [];

    let userComments = await userCommentsRef
      .orderByChild('owner')
      .equalTo(uid)
      .once('value');

    userComments.forEach(comment => {
      userCommentsArr.push(comment.val());
    });

    dispatch({
      type: GET_USER_COMMENTS,
      payload: { success: true, data: userCommentsArr }
    });
  } catch (error) {
    dispatch({ type: GET_USER_COMMENTS, payload: { success: false } });
  }
};

export const createUserProfile = profile => async dispatch => {
  let uid = await AsyncStorage.getItem('fb_token');

  const request = {
    uid: uid,
    profile
  };

  if (!_.isUndefined(profile.avatarSource.uri)) {
    let response = await fetch(profile.avatarSource.uri);
    let blob = await response.blob();

    let img = await firebase
      .storage()
      .ref(`profile_imgs/${uid}`)
      .put(blob);

    let downloadURL = await firebase
      .storage()
      .ref(`profile_imgs/${uid}`)
      .getDownloadURL();

    request.profile = {
      ...request.profile,
      avatarSource: { uri: downloadURL }
    };
  } else {
    request.profile = {
      ...request.profile,
      avatarSource: 'default_avatar.png'
    };
  }

  try {
    let { data } = await axios.post(
      `${CLOUD_FUNCTIONS_ENDPOINT}/updateUserProfile`,
      request
    );
    dispatch({ type: CREATE_USER_PROFILE, payload: { data, request } });
  } catch (error) {
    console.log(error);
  }
};
