import {
  GET_USER_PROFILE,
  GET_USER_POSTS,
  CREATE_USER_PROFILE,
  TOGGLE_POST_LIKE,
  GET_USER_LIKES,
  GET_USER_COMMENTS,
  GET_USER_SAVED
} from '../actions/types';

export default function(state = {}, action) {
  switch (action.type) {
    case GET_USER_POSTS:
      return { posts: action.payload };
    case GET_USER_PROFILE:
      return { profile: action.payload };
    case CREATE_USER_PROFILE:
      return {
        success: action.payload.data.success,
        profile: action.payload.request.profile
      };
    case TOGGLE_POST_LIKE: {
      return { postLikeToggled: action.payload };
    }
    case GET_USER_LIKES: {
      return { likedPosts: action.payload };
    }
    case GET_USER_COMMENTS: {
      return { comments: action.payload };
    }
    case GET_USER_SAVED: {
      return { savedPosts: action.payload };
    }
    default:
      return state;
  }
}
