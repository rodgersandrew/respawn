import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Image
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { connect } from 'react-redux';

import * as actions from '../actions';
import Highlights from '../components/Highlights';
import Colors from '../constants/Colors';

class DisplayScreen extends Component {
  static navigationOptions = ({ navigation, navigationOptions }) => ({
    headerTitle: (
      <Image
        source={require('../assets/logo.png')}
        style={{ height: '60%' }}
        resizeMode='contain'
      />
    ),
    headerLeft: (
      <Button
        onPress={navigation.toggleDrawer}
        clear
        icon={{ name: 'menu', type: 'feather', color: Colors.accentLimeLight }}
        buttonStyle={{ backgroundColor: 'rgba(0,0,0,0)' }}></Button>
    ),
    headerTitleStyle: {
      flex: 1,
      fontFamily: 'open-sans-bold',
      color: Colors.headerTextPrimary,
      textAlign: 'center',
      alignSelf: 'center',
      fontWeight: 'bold',
      fontSize: 22
    },
    headerStyle: {
      backgroundColor: Colors.bgPrimaryDark,
      borderBottomWidth: 0
    }
  });

  state = {
    loadingPosts: true,
    suspendPostLoad: false
  };

  componentWillMount() {
    const willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      payload => {
        this.setState({ suspendPostLoad: true });
      }
    );

    const willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {
        this.setState({ suspendPostLoad: false });
      }
    );
  }

  componentDidMount() {
    this.props.getAllPosts();
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.posts &&
      nextProps.posts.length > 0
      // ||
      // (this.props.posts && nextProps.posts !== this.props.posts)
    ) {
      this.setState({
        loadingPosts: false,
        posts: nextProps.posts
      });
    }
    if (this.props.posts && !nextProps.posts && !this.state.suspendPostLoad) {
      this.setState({
        loadingPosts: true
      });
    }
  }

  reportPost = (postObj, reason) => {
    this.setState({ modalVisible: false });
    this.props.reportPost(postObj, reason);
  };

  deletePost = async postObj => {
    this.setState({ modalVisible: false });
    await this.props.deletePost(postObj);
    this.props.getAllPosts();
  };

  toggleLike = (postID, userLikesPost) => {
    this.props.toggleLikeOnPost(postID, userLikesPost);
  };

  toggleSave = (postID, userSavedPost) => {
    this.props.toggleSaveOnPost(postID, userSavedPost);
  };

  _loadMorePosts = createdAt => {
    this.props.getAllPosts(createdAt);
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Highlights
          data={this.props.posts || []}
          navigation={this.props.navigation}
          toggleLike={this.toggleLike}
          reportPost={this.reportPost}
          deletePost={this.deletePost}
          toggleSave={this.toggleSave}
          loadMorePosts={this._loadMorePosts}
          isCollective={false}
        />
        <View
          style={{
            height: 50,
            width: '100%',
            backgroundColor: '#222'
          }}>
          <Image
            source={require('../assets/imgs/ad_banner_sample.png')}
            resizeMode='cover'
            style={{ height: '100%', width: '100%' }}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgPrimary
  }
});

function mapStateToProps({ posts }) {
  return {
    posts: posts.posts,
    postLikeToggled: posts.postLikeToggled,
    postSaved: posts.postSave
  };
}

export default connect(mapStateToProps, actions)(DisplayScreen);
