import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
  FlatList
} from 'react-native';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import AnimatedLoader from 'react-native-animated-loader';
import * as VideoThumbnails from 'expo-video-thumbnails';

import Colors from '../../constants/Colors';

import AsyncForEach from '../helpers/async_for_each';

class ImageLoader extends Component {
  state = {
    opacity: new Animated.Value(0)
  };

  onLoad = () => {
    Animated.timing(this.state.opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  };

  render() {
    return (
      <Animated.Image
        onLoad={this.onLoad}
        {...this.props}
        style={[
          {
            opacity: this.state.opacity,
            transform: [
              {
                scale: this.state.opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.85, 1]
                })
              }
            ]
          },
          this.props.style
        ]}
      />
    );
  }
}

const numColumns = 2;

const formatData = (data, numColumns) => {
  const numberOfFullRows = Math.floor(data.length / numColumns);

  let numberOfElementsLastRow = data.length - numberOfFullRows * numColumns;
  while (
    numberOfElementsLastRow !== numColumns &&
    numberOfElementsLastRow !== 0
  ) {
    data.push({ media: `blank-${numberOfElementsLastRow}`, empty: true });
    numberOfElementsLastRow++;
  }

  return data;
};

class ProfilePostsView extends Component {
  state = {
    loading: true,
    posts: []
  };

  componentDidMount() {
    this.props.getUserPosts(this.props.user);
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.posts && this.state.posts.length === 0) {
      await this.generateThumbnailsFromPosts(nextProps.posts);
      this.setState({ loading: false });
    }
  }

  handlePostPress = post => {
    const media = post.thumbnail || post.media;
    Image.getSize(media, (w, h) => {
      const aspectRatio = h / w;
      this.props.navigation.navigate('profilePosts', {
        post: [
          {
            ...post,
            aspectRatio: aspectRatio,
            profile: this.props.profile
          }
        ]
      });
    });
  };

  renderItem = ({ item, index }) => {
    if (item.empty) {
      return <View style={styles.imageContainer}></View>;
    }

    const videoThumbnailStyle = { flex: 1, opacity: 0.75, borderRadius: 10 };
    var thumbnailStyle = { flex: 1, opacity: 1, borderRadius: 10 };

    if (item.mediaType === 'video') {
      thumbnailStyle = videoThumbnailStyle;
    }

    return (
      <View style={styles.imageContainer}>
        <TouchableOpacity
          style={styles.touchable}
          onPress={() => this.handlePostPress(item)}>
          <ImageLoader
            placeholderStyle={{ backgroundColor: 'rgba(0,0,0,0)' }}
            source={
              item.thumbnail ? { uri: item.thumbnail } : { uri: item.media }
            }
            style={thumbnailStyle}
            resizeMode='cover'
          />
        </TouchableOpacity>
        {item.mediaType === 'video' ? (
          <Icon
            name='play-circle-outline'
            type='material'
            size={60}
            color={Colors.white}
            containerStyle={{
              position: 'absolute',
              marginLeft: -30,
              marginTop: -30,
              left: '50%',
              top: '50%'
            }}
          />
        ) : null}
      </View>
    );
  };

  render() {
    if (this.state.loading) {
      return (
        <AnimatedLoader
          visible
          overlayColor='rgba(0,0,0,0)'
          animationStyle={styles.lottieSmall}
          source={require('../../assets/lottie/mint_spinner.json')}
          speed={1}
        />
      );
    }

    return (
      <FlatList
        keyExtractor={(item, i) => `${item.media}_${i}`}
        data={formatData(this.state.posts, numColumns)}
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 60 }}
        renderItem={this.renderItem}
        numColumns={numColumns}
        windowSize={1}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  generateThumbnail = async srcURI => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(srcURI, {
        time: 1000
      });
      return uri;
    } catch (e) {
      console.warn(e);
    }
  };

  generateThumbnailsFromPosts = async posts => {
    const postarray = [];
    await AsyncForEach(posts, async (post, i) => {
      if (post.mediaType === 'video') {
        let source = await this.generateThumbnail(post.media);
        postarray.push({ ...post, thumbnail: source });
      } else {
        postarray.push({ ...post });
      }
    });

    this.setState({ posts: postarray });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 10
  },
  touchable: {
    flex: 1,
    height: 150
  },
  imageContainer: {
    flex: 1,
    height: 150,
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0)'
  },
  lottieSmall: { width: 70, height: 70, marginTop: 30 },
  itemInvisible: {
    opacity: 0
  }
});

function mapStateToProps({ user }) {
  return { posts: user.posts };
}

export default connect(mapStateToProps, actions)(ProfilePostsView);
