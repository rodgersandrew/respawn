import React, { Component } from "react";
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  AsyncStorage
} from "react-native";
import { Button, Image, Avatar } from "react-native-elements";
import { Video } from "expo-av";
import VideoPlayer from "../VideoPlayer";
import AnimatedLoader from "../../components/animations/AnimatedLoader";

import Colors from "../../constants/Colors";
import Highlight from "../highlights/Highlight";
import PostActionsModal from "../moderation/PostActionsModal";

const SCREEN_WIDTH = Dimensions.get("window").width;

class ProfileHighlights extends Component {
  state = { imageLoaded: false, modalVisible: false, uid: null };

  imageLoader = () => {
    return (
      <AnimatedLoader
        visible={!this.state.imageLoaded}
        overlayColor="rgba(0,0,0,0)"
        animationStyle={styles.lottieSmall}
        source={require("../../assets/lottie/mint_spinner.json")}
        speed={1}
      />
    );
  };

  async componentDidMount() {
    let fbToken = await AsyncStorage.getItem("fb_token");
    if (fbToken) {
      this.setState({ isAuthenticated: true, uid: fbToken });
    }
  }

  closeModal = () => {
    this.setState({ modalVisible: false });
  };

  openModal = postObj => {
    this.setState({ modalVisible: true, reportedPost: postObj });
  };

  handlePostDelete = postObj => {
    this.setState({ modalVisible: false });
    this.props.deletePost(postObj);
  };

  handlePostReport = (postID, reason) => {
    this.setState({ modalVisible: false });
    this.props.reportPost(postID, reason);
  };

  renderItems() {
    return this.props.data.map((highlight, i) => {
      const data = {
        post: {
          ...highlight
        },
        profile: {
          ...highlight.profile
        }
      };

      return (
        <View key={data.post.postID} style={{ justifyContent: "center" }}>
          <PostActionsModal
            visible={this.state.modalVisible}
            closeModal={this.closeModal}
            reportPost={this.handlePostReport}
            deletePost={this.handlePostDelete}
            currUser={this.state.uid}
            post={this.state.reportedPost}
          />
          <Highlight
            data={data}
            navigation={this.props.navigation}
            toggleLike={this.props.toggleLike}
            toggleSave={this.props.toggleSave}
            openModal={this.openModal}
          />
        </View>
      );
    });
  }

  render() {
    return (
      <ScrollView horizontal pagingEnabled style={styles.container}>
        {this.renderItems()}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary
  },
  lottieSmall: { width: 70, height: 70, marginTop: 10 }
});

export default ProfileHighlights;
