import React, { Component } from 'react';
import {
  View,
  Dimensions,
  FlatList,
  StyleSheet,
  AsyncStorage
} from 'react-native';
import AnimatedLoader from 'react-native-animated-loader';
import Highlight from './highlights/Highlight';
import Colors from '../constants/Colors';
import Carousel from 'react-native-snap-carousel';
import _ from 'lodash';

import PostActionsModal from './moderation/PostActionsModal';

const SCREEN_WIDTH = Dimensions.get('window').width;

let fbToken = null;

class Highlights extends Component {
  state = {
    imageLoaded: false,
    currPostIndex: 1,
    isScrolling: false,
    isAuthenticated: false,
    likesLoaded: false,
    data: [],
    modalVisible: false,
    uid: null,
    isBlurred: false
  };

  async componentDidMount() {
    let fbToken = await AsyncStorage.getItem('fb_token');
    if (fbToken) {
      this.setState({ isAuthenticated: true, uid: fbToken });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.data.length > 0 &&
      this.state.data.length > 0 &&
      this.state.loadMorePosts
    ) {
      const currArr = this.state.data;
      const newArr = nextProps.data;
      if (this.props.isCollective) {
        newArr.shift();
      }

      this.setState({
        data: currArr.concat(newArr),
        loadMorePosts: false
      });
    }

    if (
      nextProps.data !== this.props.data &&
      nextProps.data.length > 0 &&
      !this.state.loadMorePosts
    ) {
      this.setState({
        data: nextProps.data
      });
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

  _renderItem(highlight, i) {
    const isActive = this.state.currPostIndex === i ? true : false;
    return (
      <View style={{ justifyContent: 'center' }}>
        <PostActionsModal
          visible={this.state.modalVisible}
          closeModal={this.closeModal}
          reportPost={this.handlePostReport}
          deletePost={this.handlePostDelete}
          currUser={this.state.uid}
          post={this.state.reportedPost}
        />
        <Highlight
          data={highlight}
          active={isActive}
          navigation={this.props.navigation}
          toggleLike={this.props.toggleLike}
          toggleSave={this.props.toggleSave}
          openModal={this.openModal}
        />
      </View>
    );
  }

  renderUnloaded() {
    return (
      <View style={styles.container}>
        <AnimatedLoader
          visible={true}
          overlayColor='rgba(0,0,0,0)'
          animationStyle={styles.ballLoaderAnim}
          source={require('../assets/lottie/ball_loader.json')}
          speed={0.75}
        />
      </View>
    );
  }

  handleScrollEvent = index => {
    if (index === this.state.data.length - 1 && !this.state.loadMorePosts) {
      this.setState({ loadMorePosts: true });
      this.props.loadMorePosts(this.state.data[index].post.createdAt);
    }
  };

  render() {
    if (this.state.data.length === 0) {
      return this.renderUnloaded();
    }

    return (
      <Carousel
        data={this.state.data || []}
        windowSize={2}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        // onScrollBeginDrag={() => this.handleScrollBeginDrag()}
        // onScrollEndDrag={event => this.handleScrollEvent(event)}
        onSnapToItem={index => this.handleScrollEvent(index)}
        renderItem={({ item, index }) => this._renderItem(item, index)}
        keyExtractor={(item, i) => `${item.post.media}_${item.post.owner}_${i}`}
        sliderWidth={SCREEN_WIDTH}
        itemWidth={SCREEN_WIDTH}
        activeAnimationType='spring'
        enableMomentum={true}
        decelerationRate='fast'
        contentContainerCustomStyle={{ alignItems: 'center' }}
        ref={c => {
          this._carousel = c;
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary
  },
  highlightContainer: {
    flex: 1,
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
  ballLoaderAnim: { width: SCREEN_WIDTH / 4, height: SCREEN_WIDTH / 4 }
});

export default Highlights;
