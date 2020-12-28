import firebase from "firebase";
import uuid from "uuid/v4";
import axios from "axios";
import _ from "lodash";
import {
  CREATE_COMMENT,
  DELETE_COMMENT,
  REPORT_COMMENT,
  TOGGLE_COMMENT_LIKE,
  CLEAR_COMMENT_STATUS
} from "./types";
import { AsyncStorage } from "react-native";

const CLOUD_FUNCTIONS_ENDPOINT =
  "https://us-central1-respawn-48469.cloudfunctions.net";

export const createComment = (postID, comment) => async dispatch => {
  let token = await AsyncStorage.getItem("fb_token");

  if (!token) {
    return dispatch({ type: CREATE_COMMENT, payload: { success: false } });
  }

  try {
    let { data } = await axios.post(
      `${CLOUD_FUNCTIONS_ENDPOINT}/createComment`,
      {
        postID: postID,
        userID: token,
        comment: comment
      }
    );

    const response = {
      commentID: data.commentRef.replace(
        "https://respawn-48469.firebaseio.com/comments/",
        ""
      ),
      ...data.payload
    };

    dispatch({
      type: CREATE_COMMENT,
      payload: { success: true, comment: response }
    });
  } catch (error) {
    return dispatch({ type: CREATE_COMMENT, payload: { success: false } });
  }
};

export const deleteComment = commentID => async dispatch => {
  if (!commentID) {
    return dispatch({ type: DELETE_COMMENT, payload: { success: false } });
  }

  try {
    let { data } = await axios.post(
      `${CLOUD_FUNCTIONS_ENDPOINT}/deleteComment`,
      {
        commentID: commentID
      }
    );

    dispatch({
      type: DELETE_COMMENT,
      payload: { success: data.success }
    });
  } catch (error) {
    return dispatch({ type: DELETE_COMMENT, payload: { success: false } });
  }
};

export const reportComment = (commentObj, reportReason) => async dispatch => {
  let token = await AsyncStorage.getItem("fb_token");

  if (!token) {
    return dispatch({ type: REPORT_COMMENT, payload: { success: false } });
  }

  const { commentID, owner, postID, comment } = commentObj;
  const request = {
    commentID: commentID,
    ownerID: owner,
    postID: postID,
    reportedByID: token,
    comment: comment,
    reportReason: reportReason
  };

  try {
    let { data } = await axios.post(
      `${CLOUD_FUNCTIONS_ENDPOINT}/reportComment`,
      request
    );

    dispatch({
      type: REPORT_COMMENT,
      payload: { success: data.success }
    });
  } catch (error) {
    return dispatch({ type: REPORT_COMMENT, payload: { success: false } });
  }
};

export const toggleLikeOnComment = (commentID, type) => async dispatch => {
  try {
    let token = await AsyncStorage.getItem("fb_token");
    if (!token) {
      return dispatch({ type: TOGGLE_COMMENT_LIKE, payload: false });
    }

    const request = {
      uid: token,
      commentID: commentID
    };

    const functionType = type === "like" ? "likeComment" : "unlikeComment";

    let { data } = await axios.post(
      `${CLOUD_FUNCTIONS_ENDPOINT}/${functionType}`,
      request
    );
    dispatch({ type: TOGGLE_COMMENT_LIKE, payload: data.success });
  } catch (error) {
    console.log(error);
  }
};

export const clearStatusOnComment = (commentID, type) => async dispatch => {
  try {
    let token = await AsyncStorage.getItem("fb_token");
    if (!token) {
      return dispatch({ type: TOGGLE_COMMENT_LIKE, payload: false });
    }

    const request = {
      uid: token,
      commentID: commentID
    };

    const functionType =
      type === "like" ? "clearCommentLike" : "clearCommentDislike";

    let { data } = await axios.post(
      `${CLOUD_FUNCTIONS_ENDPOINT}/${functionType}`,
      request
    );

    dispatch({ type: CLEAR_COMMENT_STATUS, payload: data.success });
  } catch (error) {
    console.log(error);
  }
};
