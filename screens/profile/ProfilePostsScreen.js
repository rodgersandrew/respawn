import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button, Icon } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";

import ProfileHighlights from "../../components/profile/ProfileHighlights";
import Colors from "../../constants/Colors";
import * as actions from "../../actions";

class ProfilePostsScreen extends Component {
  static navigationOptions = ({ navigation, navigationOptions }) => ({
    headerTitle: navigation.getParam("post")[0].profile.username,
    headerLeft: (
      <Button
        onPress={() => navigation.goBack()}
        clear
        icon={{
          name: "keyboard-backspace",
          type: "material",
          color: Colors.white
        }}
        buttonStyle={{ backgroundColor: "rgba(0,0,0,0)" }}
      ></Button>
    ),
    headerTitleStyle: {
      flex: 1,
      fontFamily: "open-sans",
      color: "#777777",
      textAlign: "center",
      alignSelf: "center",
      fontSize: 18
    },
    headerStyle: {
      backgroundColor: Colors.bgPrimaryDark,
      borderBottomWidth: 0
    }
  });

  toggleLike = (postID, userLikesPost) => {
    this.props.toggleLikeOnPost(postID, userLikesPost);
  };

  toggleSave = (postID, userSavedPost) => {
    this.props.toggleSaveOnPost(postID, userSavedPost);
  };

  reportPost = (postObj, reason) => {
    this.setState({ modalVisible: false });
    this.props.reportPost(postObj, reason);
  };

  deletePost = postObj => {
    this.setState({ modalVisible: false });
    this.props.deletePost(postObj);

    this.props.navigation.goBack();
  };

  render() {
    const post = this.props.navigation.getParam("post");
    return (
      <View style={styles.container}>
        <ProfileHighlights
          data={post}
          navigation={this.props.navigation}
          toggleLike={this.toggleLike}
          toggleSave={this.toggleSave}
          reportPost={this.reportPost}
          deletePost={this.deletePost}
        />
        <View
          style={{
            height: "10%",
            width: "100%",
            backgroundColor: "#222"
          }}
        ></View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.bgPrimary
  }
});

function mapStateToProps({ posts }) {
  return { postLikeToggled: posts.postLikeToggled };
}

export default connect(mapStateToProps, actions)(ProfilePostsScreen);
