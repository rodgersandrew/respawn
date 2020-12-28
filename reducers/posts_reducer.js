import {
  CREATE_POST,
  GET_ALL_POSTS,
  CHECK_USER_LIKES_POST,
  GET_ALL_POST_COMMENTS,
  DELETE_POST,
  TOGGLE_POST_SAVE,
  GET_COLLECTIVE_POSTS
} from '../actions/types';

export default function(state = {}, action) {
  switch (action.type) {
    case CREATE_POST:
      return {
        success: action.payload.data.success,
        post: action.payload.mergedRes
      };
    case GET_ALL_POSTS:
      return { posts: action.payload };
    case GET_COLLECTIVE_POSTS:
      return { posts: action.payload };
    case CHECK_USER_LIKES_POST:
      return { userLikesPost: action.payload };
    case GET_ALL_POST_COMMENTS:
      return { comments: action.payload };
    case DELETE_POST:
      return { postDelete: action.payload };
    case TOGGLE_POST_SAVE:
      return { postSave: action.payload };
    default:
      return state;
  }
}
