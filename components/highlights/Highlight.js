import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { Image, Button } from 'react-native-elements';
import AnimatedLoader from '../animations/AnimatedLoader';
import VideoPlayer from '../VideoPlayer';

import HighlightDetails from './HighlightDetails';
import HighlightActions from './HighlightActions';
import DoubleTap from '../helpers/DoubleTap';
import Colors from '../../constants/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default class Highlight extends React.Component {
  state = {
    imageLoaded: false,
    postLiked: false,
    postSaved: false,
    playLikeAnimation: false,
    playSaveAnimation: false
  };

  componentDidMount() {
    const { userLikesPost, userSavedPost } =
      this.props.data.post || this.props.data;

    this.setState({
      postLiked: userLikesPost,
      postSaved: userSavedPost
    });
  }

  imageLoader() {
    return (
      <AnimatedLoader
        visible={!this.state.imageLoaded}
        overlayColor='rgba(0,0,0,0)'
        animationStyle={styles.lottieSmall}
        source={require('../../assets/lottie/mint_spinner.json')}
        speed={1}
      />
    );
  }

  likeAnimation = () => {
    return (
      <AnimatedLoader
        visible={this.state.playLikeAnimation}
        overlayColor='rgba(0,0,0,0)'
        animationStyle={styles.likeAnimationStyle}
        source={require('../../assets/lottie/checkmark-like.json')}
        speed={1}
        loop={false}
        onFinish={() => this.setState({ playLikeAnimation: false })}
      />
    );
  };

  saveAnimation = () => {
    return (
      <AnimatedLoader
        visible={this.state.playSaveAnimation}
        overlayColor='rgba(0,0,0,0)'
        animationStyle={styles.saveAnimationStyle}
        source={require('../../assets/lottie/bookmark.json')}
        speed={1}
        loop={false}
        onFinish={() => this.setState({ playSaveAnimation: false })}
      />
    );
  };

  viewComments = () => {
    const { postID } = this.props.data.post;
    this.props.navigation.navigate('comments', {
      transition: 'slideFromBottom',
      postID: postID
    });
  };

  renderItem = () => {
    const highlight = this.props.data;
    const { username, avatarSource } = highlight.profile;
    const { owner, postID, likes, userLikesPost } = highlight.post;
    const profile = {
      owner: owner,
      username: username,
      avatarSource: avatarSource
    };
    const { navigation } = this.props;

    return (
      <View style={styles.highlightContainer}>
        <HighlightDetails
          profile={profile}
          post={highlight.post}
          navigation={navigation}
          openModal={this.props.openModal}
        />
        <View lazyInScreen={true} style={styles.highlight}>
          {this.renderMedia()}
        </View>
        <HighlightActions
          data={{
            likesCount: highlight.post.likes,
            userInitLike: highlight.post.userLikesPost,
            userLikesPost: this.state.postLiked,
            userSavedPost: this.state.postSaved
          }}
          navigation={navigation}
          viewComments={this.viewComments}
          toggleLike={() => this.handleDoubleTap(postID)}
          toggleSave={() => this.handlePostSave(postID)}
        />
      </View>
    );
  };

  renderMedia() {
    const { aspect, media, mediaType, postID } = this.props.data.post;
    const videoHighlight = {
      media: media,
      mediaType: mediaType,
      aspect: aspect,
      postID: postID
    };

    if (mediaType === 'image') {
      return (
        <DoubleTap onDoubleTap={() => this.handleDoubleTap(postID)}>
          <View>
            <Image
              style={{
                width: SCREEN_WIDTH,
                height: SCREEN_WIDTH * aspect
              }}
              source={{ uri: media }}
              resizeMode='contain'
              PlaceholderContent={this.imageLoader()}
              placeholderStyle={styles.bgTransparent}
              onLoadEnd={() => this.setState({ imageLoaded: true })}
            />
            {this.likeAnimation()}
            {this.saveAnimation()}
          </View>
        </DoubleTap>
      );
    } else {
      return (
        <DoubleTap onDoubleTap={() => this.handleDoubleTap(postID)}>
          <View>
            <VideoPlayer
              activePost={this.props.active}
              isScrolling={this.state.isScrolling}
              highlight={videoHighlight}
            />
            {this.likeAnimation()}
            {this.saveAnimation()}
          </View>
        </DoubleTap>
      );
    }
  }

  handleDoubleTap = postID => {
    const postCurrentlyLiked = this.state.postLiked;
    if (!postCurrentlyLiked) {
      this.setState({ playLikeAnimation: true });
    }

    this.setState({
      postLiked: !this.state.postLiked
    });

    this.props.toggleLike(postID, postCurrentlyLiked);
  };

  handlePostSave = postID => {
    const postCurrentlySaved = this.state.postSaved;
    if (!postCurrentlySaved) {
      this.setState({ playSaveAnimation: true });
    }
    this.setState({
      postSaved: !this.state.postSaved
    });

    this.props.toggleSave(postID, postCurrentlySaved);
  };

  render() {
    return this.renderItem();
  }
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: Colors.bgPrimary
  },
  highlightContainer: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  highlight: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionsContainer: {
    flexDirection: 'row',
    width: SCREEN_WIDTH,
    height: 40,
    alignItems: 'center'
  },
  highlightText: {
    fontSize: 30,
    textAlign: 'center',
    color: '#F6F6F6'
  },
  lottieSmall: { width: 70, height: 70, marginTop: 10 },
  likeAnimationStyle: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH
  },
  saveAnimationStyle: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6
  },
  bgTransparent: {
    backgroundColor: 'transparent'
  },
  bgTransparentFlexEnd: {
    backgroundColor: 'transparent',
    alignSelf: 'flex-end'
  }
});
