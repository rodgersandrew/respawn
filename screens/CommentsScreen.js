import React, { Component } from "react";
import {
  View,
  Text,
  Dimensions,
  Animated,
  StyleSheet,
  FlatList,
  Keyboard,
  AsyncStorage
} from "react-native";
import { Button, Icon, Input } from "react-native-elements";
import { connect } from "react-redux";
import { SafeAreaConsumer } from "react-native-safe-area-context";
import ReportModal from "../components/moderation/ReportModal";
import DynamicListRow from "../components/DynamicListRow";
import _ from "lodash";

import * as actions from "../actions";
import Colors from "../constants/Colors";
import Comment from "../components/Comment";

const SCREEN_WIDTH = Dimensions.get("window").width;

class CommentsScreen extends Component {
  constructor(props) {
    super(props);

    this.keyboardHeight = new Animated.Value(0);
    this.insetBottom = 0;
  }

  state = {
    comments: [],
    currentPostID: null,
    loadNewComments: true,
    modalVisible: false,
    addCommentText: null,
    uid: null
  };

  static navigationOptions = {
    header: null
  };

  componentWillMount() {
    this.keyboardWillShowSub = Keyboard.addListener(
      "keyboardWillShow",
      this.keyboardWillShow
    );
    this.keyboardWillHideSub = Keyboard.addListener(
      "keyboardWillHide",
      this.keyboardWillHide
    );
  }

  componentWillUnmount() {
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
  }

  keyboardWillShow = event => {
    Animated.timing(this.keyboardHeight, {
      duration: event.duration,
      toValue: event.endCoordinates.height + 10 - this.insetBottom
    }).start();
  };

  keyboardWillHide = event => {
    Animated.timing(this.keyboardHeight, {
      duration: event.duration,
      toValue: 0
    }).start();
  };

  async componentDidMount() {
    let token = await AsyncStorage.getItem("fb_token");
    if (token) {
      this.setState({ uid: token });
    }

    const postID = this.props.navigation.getParam("postID");
    this.setState({ currentPostID: postID });
    this.props.getAllPostComments(postID);
  }

  componentWillReceiveProps(nextProps) {
    const nextPostID = nextProps.navigation.getParam("postID");

    if (this.state.currentPostID !== nextPostID) {
      this.setState({ currentPostID: nextPostID, loadNewComments: true });
      this.props.getAllPostComments(nextPostID);
    }

    if (nextProps.commentAdded) {
      const { comments } = this.state;
      comments.unshift(nextProps.commentAdded);

      this.setState({ comments: comments });
    }

    if (this.state.loadNewComments) {
      this.setState({
        comments: nextProps.comments,
        loadNewComments: false
      });
    }
  }

  deleteComment = commentID => {
    this.props.deleteComment(commentID);

    const index = this.state.comments.findIndex(x => x.commentID === commentID);

    newCommentsArr = this.state.comments;
    newCommentsArr[index].hidden = true;
    this.setState({ comments: newCommentsArr, commentToDelete: commentID });
  };

  upVoteComment = (commentID, type) => {
    this.props.toggleLikeOnComment(commentID, type);
  };

  downVoteComment = (commentID, type) => {
    this.props.toggleLikeOnComment(commentID, type);
  };

  clearCommentStatus = (commentID, type) => {
    this.props.clearStatusOnComment(commentID, type);
  };

  handleCommentSubmit = async () => {
    const { addCommentText, currentPostID } = this.state;
    Keyboard.dismiss();

    this.props.createComment(currentPostID, addCommentText);
    this.setState({
      addCommentText: null
    });
  };

  onProfilePress = profileUID => {
    if (this.state.uid && this.state.uid === profileUID) {
      this.props.navigation.navigate("userProfile");
    } else {
      this.props.navigation.navigate("viewProfile", {
        profileUID: profileUID
      });
    }
  };

  closeModal = () => {
    this.setState({ modalVisible: false });
  };

  openModal = commentObj => {
    this.setState({ modalVisible: true, reportedComment: commentObj });
  };

  reportComment = (commentObj, reason) => {
    this.setState({ modalVisible: false });
    this.props.reportComment(commentObj, reason);
  };

  renderItem(item) {
    return (
      <View>
        <ReportModal
          visible={this.state.modalVisible}
          closeModal={this.closeModal}
          reportComment={this.reportComment}
          comment={this.state.reportedComment}
        />
        <DynamicListRow remove={item.hidden}>
          <Comment
            currUser={this.state.uid}
            data={item}
            deleteComment={this.deleteComment}
            openModal={this.openModal}
            onProfilePress={this.onProfilePress}
            clearCommentStatus={this.clearCommentStatus}
            upVoteComment={this.upVoteComment}
            downVoteComment={this.downVoteComment}
          />
        </DynamicListRow>
      </View>
    );
  }

  renderNoComments = () => {
    const loading = this.state.loadNewComments || false;
    if (loading) {
      return <View style={styles.noCommentsContainer}></View>;
    } else {
      return (
        <View style={styles.noCommentsContainer}>
          <Text style={styles.noCommentsText}>be the first to comment...</Text>
        </View>
      );
    }
  };

  render() {
    const { shift } = this.state;

    const chevron = {
      name: "chevron-down",
      type: "entypo",
      color: Colors.accentLimeLight,
      size: 40
    };

    const addCommentIcon = {
      name: "plus-circle",
      type: "feather",
      color: "#aaa",
      size: 30
    };

    return (
      <SafeAreaConsumer>
        {insets => {
          if (this.insetBottom === 0) {
            this.insetBottom = insets.bottom;
          }
          return (
            <View
              style={[
                styles.container,
                { marginBottom: 50 + insets.bottom, marginTop: insets.top }
              ]}
            >
              <View style={styles.header}>
                <Button
                  onPress={() => this.props.navigation.goBack()}
                  clear
                  icon={chevron}
                  buttonStyle={styles.bgTranparent}
                />
              </View>
              <FlatList
                data={this.state.comments}
                renderItem={({ item }) => this.renderItem(item)}
                ListEmptyComponent={this.renderNoComments}
                keyExtractor={(item, i) =>
                  `${item.commentID}_${item.owner}_${i}`
                }
                style={{ backgroundColor: Colors.bgPrimary }}
              />
              <Animated.View
                style={[
                  styles.animatedContainer,
                  {
                    paddingBottom: this.keyboardHeight
                  }
                ]}
              >
                <Input
                  containerStyle={styles.inputContainer}
                  placeholder="Add a comment..."
                  placeholderTextColor="#555"
                  inputContainerStyle={{
                    borderBottomWidth: 0,
                    height: "100%"
                  }}
                  onChangeText={text => {
                    this.setState({ addCommentText: text });
                  }}
                  inputStyle={styles.inputText}
                  value={this.state.addCommentText}
                />
                <Button
                  onPress={this.handleCommentSubmit}
                  clear
                  icon={addCommentIcon}
                  buttonStyle={styles.bgTranparentMax}
                  containerStyle={styles.buttonContainer}
                />
              </Animated.View>
            </View>
          );
        }}
      </SafeAreaConsumer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary
  },
  noCommentsContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 300
  },
  noCommentsText: {
    fontFamily: "raleway-semi",
    fontSize: 18,
    color: "#CCC"
  },
  header: {
    height: 70,
    width: SCREEN_WIDTH,
    alignSelf: "flex-start",
    paddingBottom: 20,
    backgroundColor: Colors.bgPrimary
  },
  animatedContainer: {
    backgroundColor: Colors.bgPrimaryDark,
    width: SCREEN_WIDTH,
    flexDirection: "row",
    height: 60,
    alignSelf: "flex-end"
  },
  inputContainer: {
    height: 60,
    width: SCREEN_WIDTH - 60,
    backgroundColor: Colors.bgPrimaryDark
  },
  inputText: {
    fontFamily: "nunito",
    fontSize: 18,
    color: "#aaa"
  },
  buttonContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center"
  },
  bgTranparent: { backgroundColor: "rgba(0,0,0,0)" },
  bgTranparentMax: {
    backgroundColor: "rgba(0,0,0,0)",
    height: "100%",
    width: "100%"
  },
  ballLoaderAnim: { width: SCREEN_WIDTH / 4, height: SCREEN_WIDTH / 4 }
});

function mapStateToProps({ posts, comment }) {
  return {
    comments: posts.comments,
    commentUpdate: comment.success,
    commentAdded: comment.commentAdded
  };
}

export default connect(mapStateToProps, actions)(CommentsScreen);
