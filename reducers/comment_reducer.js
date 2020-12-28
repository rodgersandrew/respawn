import {
  CREATE_COMMENT,
  DELETE_COMMENT,
  REPORT_COMMENT,
  TOGGLE_COMMENT_LIKE,
  CLEAR_COMMENT_STATUS
} from "../actions/types";

export default function(state = {}, action) {
  switch (action.type) {
    case CREATE_COMMENT:
      return {
        success: action.payload.success,
        commentAdded: action.payload.comment
      };
    case DELETE_COMMENT:
      return { success: action.payload.success };
    case REPORT_COMMENT:
      return { success: action.payload.success };
    case TOGGLE_COMMENT_LIKE:
      return { commentToggle: action.payload };
    case CLEAR_COMMENT_STATUS:
      return { success: action.payload.success };
    default:
      return state;
  }
}
