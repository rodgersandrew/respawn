import { AsyncStorage } from 'react-native';
import firebase from 'firebase';
import uuid from 'uuid/v4';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import {
  CREATE_POST,
  GET_ALL_POSTS,
  GET_COLLECTIVE_POSTS,
  GET_ALL_POST_COMMENTS,
  REPORT_POST,
  DELETE_POST,
  TOGGLE_POST_SAVE
} from './types';
import AsyncForEach from '../components/helpers/async_for_each';

const CLOUD_FUNCTIONS_ENDPOINT =
  'https://us-central1-respawn-48469.cloudfunctions.net';

const HIGHLIGHTS_PER_DAY = 5;

export const checkUserLikesPost = async postID => {
  let uid = await AsyncStorage.getItem('fb_token');

  if (!uid) return false;

  const likedRef = firebase.database().ref(`users/${uid}/likes/${postID}`);
  let res = await likedRef.child('postID').once('value');

  if (res.val()) {
    return true;
  } else {
    return false;
  }
};

export const checkUserSavedPost = async postID => {
  let uid = await AsyncStorage.getItem('fb_token');

  if (!uid) return false;

  const savedRef = firebase.database().ref(`users/${uid}/saved`);
  let res = (
    await savedRef
      .orderByChild('postID')
      .equalTo(postID)
      .once('value')
  ).val();

  if (res) return true;
  else return false;
};

export const createPost = post => async dispatch => {
  let uid = await AsyncStorage.getItem('fb_token');

  if (!uid) return dispatch({ type: CREATE_POST, payload: false });
  Console.LOG(test)
  try {
    let response = await fetch(post.uri);
    let blob = await response.blob();

    let postUUID = uuid();
    const fileExt = post.type === 'video' ? '.mp4' : '';
    let storedMedia = await firebase
      .storage()
      .ref(`posts/${postUUID}${fileExt}`)
      .put(blob);

    let downloadURL = await firebase
      .storage()
      .ref(`posts/${postUUID}${fileExt}`)
      .getDownloadURL();

    let user = await firebase
      .database()
      .ref(`users/${uid}/profile`)
      .once('value');

    const parsedUser = JSON.parse(JSON.stringify(user));

    const request = {
      uid: uid,
      uuid: postUUID,
      post: {
        media: downloadURL,
        type: post.type,
        tags: post.tags,
        aspect: post.aspect
      }
    };

    const mergedRes = {
      owner: uid,
      postID: postUUID,
      media: downloadURL,
      mediaType: post.type,
      tags: post.tags,
      aspect: post.aspect,
      profile: parsedUser
    };

    let { data } = await axios.post(
      `${CLOUD_FUNCTIONS_ENDPOINT}/createPost`,
      request
    );
    dispatch({
      type: CREATE_POST,
      payload: { data, mergedRes }
    });
  } catch (error) {
    console.log(error);
  }
};

const checkHighlightQuery = async index => {
  const postsRef = firebase.database().ref('posts');

  const nextDayEnd = moment(index).endOf('day');

  items = [];
  let queryRes = await postsRef
    .orderByChild('createdAt')
    .endAt(nextDayEnd.valueOf())
    .limitToLast(1)
    .once('value');

  queryRes.forEach(item => {
    items.push(item.val());
  });

  if (items.length > 0) {
    return items[0].createdAt;
  } else {
    return 'empty';
  }
};

export const getAllPosts = index => async dispatch => {
  const postsRef = firebase.database().ref('posts');
  const userRef = firebase.database().ref('users');

  const epochDayStart = moment()
    .startOf('day')
    .subtract(1, 'day');

  var nextValidIndex;
  if (index) {
    const checkIndex = moment(index)
      .subtract(1, 'day')
      .valueOf();
    nextValidIndex = await checkHighlightQuery(checkIndex);

    if (nextValidIndex === 'empty') {
      return dispatch({ type: GET_ALL_POSTS, payload: [] });
    }
  } else {
    const checkIndex = moment(epochDayStart).valueOf();
    nextValidIndex = await checkHighlightQuery(checkIndex);
  }

  const nextDayStart = moment(nextValidIndex).startOf('day');

  const nextDayEnd = moment(nextValidIndex).endOf('day');

  const nextRef = postsRef
    .orderByChild('createdAt')
    .startAt(nextDayStart.valueOf())
    .endAt(nextDayEnd.valueOf());

  const currRef = nextRef;

  currRef.once('value', async snapshot => {
    const posts = [];
    const promises = [];
    snapshot.forEach(child => {
      posts.push(child);

      const userRef = firebase
        .database()
        .ref(`users/${child.val().owner}/profile`);

      let currPromise = userRef.once('value');
      promises.push(currPromise);
    });

    const profilePosts = [];
    await Promise.all(promises).then(results => {
      posts.forEach((post, i) => {
        profilePosts.push({ post: post, profile: results[i] });
      });
    });

    const fullPosts = [];
    await AsyncForEach(profilePosts, async (profilePost, i) => {
      const post = JSON.parse(JSON.stringify(profilePost.post));
      let userLikesPost = await checkUserLikesPost(post.postID);
      let userSavedPost = await checkUserSavedPost(post.postID);

      fullPosts.push({
        profile: profilePost.profile,
        post: {
          ...post,
          userLikesPost: userLikesPost,
          userSavedPost: userSavedPost
        }
      });
    });

    fullPosts.sort((a, b) => (a.post.likes > b.post.likes ? -1 : 1));
    const postsObj = JSON.parse(
      JSON.stringify(fullPosts.slice(0, HIGHLIGHTS_PER_DAY))
    );

    dispatch({ type: GET_ALL_POSTS, payload: postsObj });
  });
};

export const getCollectivePosts = index => async dispatch => {
  const postsRef = firebase.database().ref('posts');

  const initRef = postsRef.orderByChild('createdAt').limitToLast(5);
  const nextRef = postsRef
    .orderByChild('createdAt')
    .endAt(index)
    .limitToLast(6);

  const currRef = !index ? initRef : nextRef;

  currRef.once('value', async snapshot => {
    const posts = [];
    const promises = [];
    snapshot.forEach(child => {
      posts.push(child);

      const userRef = firebase
        .database()
        .ref(`users/${child.val().owner}/profile`);

      let currPromise = userRef.once('value');
      promises.push(currPromise);
    });

    const profilePosts = [];
    await Promise.all(promises).then(results => {
      posts.forEach((post, i) => {
        profilePosts.push({ post: post, profile: results[i] });
      });
    });

    const fullPosts = [];
    await AsyncForEach(profilePosts, async (profilePost, i) => {
      const post = JSON.parse(JSON.stringify(profilePost.post));
      let userLikesPost = await checkUserLikesPost(post.postID);
      let userSavedPost = await checkUserSavedPost(post.postID);

      fullPosts.push({
        profile: profilePost.profile,
        post: {
          ...post,
          userLikesPost: userLikesPost,
          userSavedPost: userSavedPost
        }
      });
    });

    const nextObj = fullPosts.slice(0, 4).reverse();

    var postsObj = !index
      ? JSON.parse(JSON.stringify(fullPosts.reverse()))
      : JSON.parse(JSON.stringify(nextObj));

    if (index && fullPosts.length === 1) {
      postsObj = [];
    }

    dispatch({ type: GET_COLLECTIVE_POSTS, payload: postsObj });
  });
};

export const getAllPostComments = postID => async dispatch => {
  const db = firebase.database();
  const commentsRef = db.ref('comments');

  const comments = [];
  let commentsObj = await commentsRef
    .orderByChild('postID')
    .equalTo(postID)
    .once('value', snapshot => {
      snapshot.forEach(snap => {
        comments.push({ ...snap.val(), commentID: snap.key });
      });
    });

  const descComments = comments.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  function orderByProperty(prop) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function(a, b) {
      var equality = a[prop] - b[prop];
      if (equality === 0 && arguments.length > 1) {
        return orderByProperty.apply(null, args)(a, b);
      }
      return equality;
    };
  }
  const sortedByLikes = comments.sort(
    orderByProperty('likesCount', 'createdAt')
  );

  dispatch({ type: GET_ALL_POST_COMMENTS, payload: sortedByLikes.reverse() });
};

export const reportPost = (postID, reportReason) => async dispatch => {
  let token = await AsyncStorage.getItem('fb_token');

  if (!token) {
    return dispatch({ type: REPORT_POST, payload: { success: false } });
  }

  const request = {
    postID: postID,
    reportedByID: token,
    reportReason: reportReason
  };

  try {
    let { data } = await axios.post(
      `${CLOUD_FUNCTIONS_ENDPOINT}/reportPost`,
      request
    );

    dispatch({
      type: REPORT_POST,
      payload: { success: data.success }
    });
  } catch (error) {
    return dispatch({ type: REPORT_POST, payload: { success: false } });
  }
};

export const deletePost = postObj => async dispatch => {
  let token = await AsyncStorage.getItem('fb_token');

  if (!token) {
    return dispatch({ type: DELETE_POST, payload: { success: false } });
  }

  const { postID, owner } = postObj;

  if (token === owner) {
    try {
      let { data } = await axios.post(
        `${CLOUD_FUNCTIONS_ENDPOINT}/deletePost`,
        {
          postID: postID
        }
      );

      dispatch({
        type: DELETE_POST,
        payload: { success: data.success }
      });
    } catch (error) {
      return dispatch({ type: DELETE_POST, payload: { success: false } });
    }
  }
};

export const toggleSaveOnPost = (postID, userSavedPost) => async dispatch => {
  try {
    let token = await AsyncStorage.getItem('fb_token');
    if (!token) {
      return dispatch({ type: TOGGLE_POST_SAVE, payload: false });
    }

    const request = {
      uid: token,
      postID: postID
    };

    const functionType = userSavedPost ? 'unsavePost' : 'savePost';

    let { data } = await axios.post(
      `${CLOUD_FUNCTIONS_ENDPOINT}/${functionType}`,
      request
    );
    dispatch({ type: TOGGLE_POST_SAVE, payload: data.success });
  } catch (error) {
    console.log(error);
  }
};
