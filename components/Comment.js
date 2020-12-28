import React from "react";
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { Image, Button } from "react-native-elements";
import { SwipeRow } from "react-native-swipe-list-view";
import DynamicListRow from "./DynamicListRow";

import Colors from "../constants/Colors";
const SCREEN_WIDTH = Dimensions.get("window").width;
const ACTION_ICON_SIZE = 30;

export default class Comment extends React.Component {
  state = {
    userLikesComment: false,
    userDislikesComment: false,
    likesCount: 0,
    deleted: false
  };

  componentDidMount() {
    const { likes, dislikes, likesCount } = this.props.data;
    const { currUser } = this.props;

    this.mapPropsToState(likes, dislikes, likesCount, currUser);
  }

  componentWillReceiveProps(nextProps) {
    const { likes, dislikes, likesCount } = nextProps.data;
    const { currUser } = nextProps;

    if (nextProps.data) {
      this.mapPropsToState(likes, dislikes, likesCount, currUser);
    }
  }

  mapPropsToState(likes, dislikes, likesCount, currUser) {
    if (likes) {
      this.setState({
        userLikesComment:
          Object.keys(likes).indexOf(currUser) > -1 ? true : false
      });
    }

    if (dislikes) {
      this.setState({
        userDislikesComment:
          Object.keys(dislikes).indexOf(currUser) > -1 ? true : false
      });
    }

    if (likesCount) {
      this.setState({ likesCount: likesCount });
    }
  }

  handleCommentUpVote = () => {
    const { userLikesComment, userDislikesComment, likesCount } = this.state;
    const { commentID } = this.props.data;
    if (!userLikesComment && userDislikesComment) {
      this.setState({
        userLikesComment: true,
        userDislikesComment: false,
        likesCount: likesCount + 2
      });
    } else if (!userLikesComment && !userDislikesComment) {
      this.setState({
        userLikesComment: true,
        likesCount: likesCount + 1
      });
    }

    if (!userLikesComment) {
      this.props.upVoteComment(commentID, "like");
    }

    if (userLikesComment) {
      this.setState({ userLikesComment: false, likesCount: likesCount - 1 });
      this.props.clearCommentStatus(commentID, "like");
    }
  };

  handleCommentDownVote = () => {
    const { userLikesComment, userDislikesComment, likesCount } = this.state;
    const { commentID } = this.props.data;
    if (userLikesComment && !userDislikesComment) {
      this.setState({
        userLikesComment: false,
        userDislikesComment: true,
        likesCount: likesCount - 2
      });
    } else if (!userLikesComment && !userDislikesComment) {
      this.setState({
        userDislikesComment: true,
        likesCount: likesCount - 1
      });
    }

    if (!userDislikesComment) {
      this.props.downVoteComment(commentID, "dislike");
    }

    if (userDislikesComment) {
      this.setState({ userDislikesComment: false, likesCount: likesCount + 1 });
      this.props.clearCommentStatus(commentID, "dislike");
    }
  };

  handleCommentDelete = () => {
    this.props.deleteComment(this.props.data.commentID);
  };

  renderHiddenItem() {
    return (
      <View
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          borderBottomColor: Colors.bgPrimaryLight,
          borderBottomWidth: 1,
          flexDirection: "row",
          justifyContent: "space-between"
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Button
            onPress={() => this.props.openModal(this.props.data)}
            clear
            icon={{
              name: "dots-vertical",
              type: "material-community",
              size: ACTION_ICON_SIZE,
              color: Colors.white
            }}
            buttonStyle={styles.bgTransparent}
            containerStyle={{ paddingLeft: 5 }}
          />
        </View>
        <Button
          onPress={this.handleCommentDelete}
          clear
          icon={{
            name: "trash-o",
            type: "font-awesome",
            size: ACTION_ICON_SIZE,
            color: Colors.white
          }}
          buttonStyle={styles.bgTransparent}
          containerStyle={{ paddingRight: 5 }}
        />
      </View>
    );
  }

  render() {
    const { avatarSource, username } = this.props.data.ownerProfile;
    const { comment, owner, commentID } = this.props.data;
    const { currUser } = this.props;
    const isCurrentUserComment = currUser === owner ? true : false;

    const { likesCount, userLikesComment, userDislikesComment } = this.state;

    return (
      <SwipeRow
        key={commentID}
        rightOpenValue={-50}
        leftOpenValue={50}
        tension={120}
        disableLeftSwipe={!isCurrentUserComment}
      >
        {this.renderHiddenItem()}
        <View style={styles.commentContainer}>
          <View style={styles.profileContainer}>
            <TouchableOpacity onPress={() => this.props.onProfilePress(owner)}>
              <Image
                source={avatarSource}
                containerStyle={styles.avatarContainer}
                placeholderStyle={styles.bgTransparent}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.detailsContainer}>
            <View style={styles.commentTextContainer}>
              <Text style={styles.commentText}>{comment}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between"
              }}
            >
              <View style={styles.usernameContainer}>
                <Text
                  style={[
                    styles.username,
                    {
                      color: isCurrentUserComment
                        ? Colors.accentLimeDark
                        : "#737B89"
                    }
                  ]}
                >
                  {username}
                </Text>
              </View>
              <View style={styles.commentVoteContainer}>
                <Button
                  clear
                  onPress={this.handleCommentUpVote}
                  icon={{
                    name: "chevron-up",
                    type: "entypo",
                    size: 15,
                    color: Colors.darkGrey
                  }}
                  iconContainerStyle={{
                    backgroundColor: userLikesComment
                      ? "#1B628E"
                      : "transparent",
                    borderWidth: userLikesComment ? 0 : 1,
                    borderRadius: 10,
                    borderColor: Colors.darkGrey,
                    height: 20,
                    width: 20,
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                  buttonStyle={{
                    backgroundColor: "transparent",
                    padding: 0
                  }}
                  containerStyle={{ justifyContent: "center" }}
                />
                <View style={styles.commentVoteCountContainer}>
                  {likesCount > 0 ? (
                    <Text style={styles.commentVoteCount}>{likesCount}</Text>
                  ) : null}
                </View>
                <Button
                  clear
                  onPress={this.handleCommentDownVote}
                  icon={{
                    name: "chevron-down",
                    type: "entypo",
                    size: 15,
                    color: Colors.darkGrey
                  }}
                  iconContainerStyle={{
                    backgroundColor: userDislikesComment
                      ? "#A41330"
                      : "transparent",
                    borderWidth: userDislikesComment ? 0 : 1,
                    borderRadius: 10,
                    borderColor: Colors.darkGrey,
                    padding: 0,
                    height: 20,
                    width: 20,
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                  containerStyle={{ justifyContent: "center" }}
                  buttonStyle={{
                    backgroundColor: "transparent",
                    padding: 0
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </SwipeRow>
    );
  }
}

const styles = StyleSheet.create({
  commentContainer: {
    width: SCREEN_WIDTH,
    borderBottomColor: Colors.bgPrimaryLight,
    borderBottomWidth: 1,
    flexDirection: "row",
    padding: 15,
    // marginBottom: 15,
    alignItems: "center",
    backgroundColor: Colors.bgPrimary
  },
  profileContainer: {
    height: "100%",
    width: 50,
    paddingTop: 3,
    justifyContent: "flex-start",
    alignItems: "center"
    // backgroundColor: 'red'
  },
  detailsContainer: {
    height: "100%",
    flex: 1
    // backgroundColor: 'yellow'
  },
  commentTextContainer: {
    // backgroundColor: 'white',
    flexDirection: "row",
    paddingLeft: 10
  },
  commentText: {
    flex: 1,
    flexWrap: "wrap",
    fontFamily: "nunito",
    fontSize: 16,
    color: "#dddddd"
  },
  usernameContainer: {
    // backgroundColor: 'blue',
    paddingTop: 10,
    paddingLeft: 10
    // backgroundColor: 'white'
  },
  username: {
    fontSize: 16,
    fontFamily: "nunito-semi-italic",
    color: "#737B89"
  },
  commentVoteContainer: {
    flexDirection: "row",
    alignSelf: "flex-end", // paddingTop: 12,
    paddingRight: 5
  },
  commentVoteCountContainer: {
    // paddingRight: 0
  },
  commentVoteCount: {
    fontSize: 16,
    fontFamily: "lato",
    color: Colors.darkGrey,
    paddingRight: 7
  },
  avatarContainer: {
    height: 40,
    width: 40,
    borderRadius: 40 / 2,
    borderWidth: 0,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(0,0,0,0)",
    overflow: "hidden"
  },
  bgTransparent: {
    backgroundColor: "transparent"
  },
  bgTransparentFlexEnd: {
    backgroundColor: "transparent",
    alignSelf: "flex-end"
  }
});
