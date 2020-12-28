import React, { Component } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  ImageEditor,
  Dimensions,
  StyleSheet
} from 'react-native';
import { Button, Image } from 'react-native-elements';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { connect } from 'react-redux';
import * as actions from '../actions';
import Colors from '../constants/Colors';
import AnimatedLoader from 'react-native-animated-loader';
import { StackActions, NavigationActions } from 'react-navigation';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

let maxVideoDuration = 35 * 1000;

class NewPostFromURLScreen extends Component {
  static navigationOptions = {
    header: null
  };

  state = {
    post: {
      uri: null,
      type: '',
      tags: []
    },
    image: {
      type: '',
      aspect: null
    },
    postUploadInProgress: false,
    postUploaded: false
  };

  componentWillMount() {
    this._pickImage();
  }

  componentWillReceiveProps(nextProps) {
    const { postSuccess } = nextProps;
    if (postSuccess && postSuccess === true) {
      setTimeout(() => {
        this.setState({
          postUploadInProgress: false,
          postUploaded: true
        });

        const resetAction = StackActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({ routeName: 'display' }),
            NavigationActions.navigate({
              routeName: 'profilePosts',
              params: {
                post: [
                  {
                    ...nextProps.postUpload,
                    aspectRatio: this.state.post.aspect
                  }
                ]
              }
            })
          ]
        });

        this.props.navigation.dispatch(resetAction);
      }, 3000);
    } else if (postSuccess && postSuccess === false) {
      this.setState({
        postUploadInProgress: false
      });
      // Error handle a failed post upload
    }
  }

  resetState = () => {
    this.setState({
      post: {
        uri: null,
        type: '',
        tags: []
      },
      image: {
        type: '',
        aspect: null
      },
      postUploadInProgress: false,
      postUploaded: false
    });
  };

  getPermissionAsync = async () => {
    if (Platform.OS === 'ios') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  };

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
      aspect: [4, 3],
      quality: 1
    });
    if (!result.cancelled) {
      if (result.type !== 'video') {
        let resizedUri = await new Promise((resolve, reject) => {
          ImageEditor.cropImage(
            result.uri,
            {
              offset: { x: 0, y: 0 },
              size: { width: result.width, height: result.height },
              resizeMode: 'contain'
            },
            uri => resolve(uri),
            () => reject()
          );
        });

        this.setState({
          image: {
            ...this.state.image,
            type: 'image',
            aspect: result.height / result.width
          },
          post: {
            ...this.state.post,
            type: 'image',
            uri: resizedUri,
            aspect: result.height / result.width
          }
        });
      } else {
        this.setState({
          image: {
            ...this.state.image,
            type: 'video',
            aspect: result.height / result.width
          },
          post: {
            ...this.state.post,
            type: 'video',
            uri: result.uri,
            aspect: result.height / result.width
          }
        });
      }
    } else {
      this.handleCancel();
    }
  };

  handleCancel = () => {
    this.props.navigation.pop();
  };

  handleSubmit = () => {
    this.setState({
      postUploadInProgress: true
    });
    this.props.createPost(this.state.post);
  };

  onLoad = data => {
    if (data.durationMillis && data.durationMillis > maxVideoDuration) {
      Alert.alert(
        'Duration limit exceeded',
        `Videos must be under ${maxVideoDuration / 1000} seconds to upload.`,
        [
          {
            text: 'OK',
            onPress: () => {
              this.resetState();
              this._pickImage();
            }
          }
        ],
        { cancelable: false }
      );
    }
  };

  render() {
    const { uri } = this.state.post;
    const { aspect } = this.state.image;

    return (
      <View style={styles.container}>
        <AnimatedLoader
          visible={this.state.postUploadInProgress}
          overlayColor='rgba(0,0,0,0.7)'
          animationStyle={styles.uploadAnimation}
          source={require('../assets/lottie/upload.json')}
          animationType='fade'
          speed={1}
        />
        <View
          style={{
            height: 100,
            paddingHorizontal: 20,
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
          <Button
            onPress={this.handleCancel}
            buttonStyle={{ backgroundColor: 'rgba(0,0,0,0)' }}
            clear
            title='cancel'
            titleStyle={{
              color: '#BBBBBB',
              fontFamily: 'raleway-semi',
              fontSize: 22
            }}
          />
          <Button
            onPress={this.handleSubmit}
            buttonStyle={{ backgroundColor: 'rgba(0,0,0,0)' }}
            clear
            title='post'
            titleStyle={{
              color: Colors.submit,
              fontFamily: 'raleway-semi',
              fontSize: 22
            }}
          />
        </View>
        <ScrollView
          style={{
            height: SCREEN_WIDTH * aspect,
            maxHeight: SCREEN_HEIGHT * 0.5,
            width: SCREEN_WIDTH,
            backgroundColor: Colors.bgPrimary
          }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center'
          }}>
          {this.state.image.type === 'image' ? (
            <Image
              source={{ uri: uri }}
              style={{
                height: SCREEN_WIDTH * aspect,
                width: SCREEN_WIDTH,
                resizeMode: 'contain'
              }}
            />
          ) : (
            <Video
              source={{ uri: uri }}
              rate={1.0}
              volume={1.0}
              isMuted={true}
              resizeMode='contain'
              shouldPlay={false}
              isLooping={false}
              useNativeControls
              onLoad={this.onLoad}
              style={{ height: SCREEN_WIDTH * aspect, width: SCREEN_WIDTH }}
            />
          )}
        </ScrollView>
        <View style={{ flex: 1, paddingTop: 30 }}>
          <View style={{ height: 50 }}>
            <Button
              title='add post tags'
              large
              clear
              containerStyle={{
                paddingHorizontal: 20,
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: '#494E57',
                backgroundColor: Colors.bgPrimaryDark
              }}
              buttonStyle={{
                backgroundColor: 'transparent',
                justifyContent: 'space-between'
              }}
              icon={{ name: 'hash', type: 'feather', color: Colors.white }}
              iconRight={true}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: Colors.bgPrimary
  },
  uploadAnimation: {
    height: 200,
    width: 200
  }
});

function mapStateToProps({ posts }) {
  return { postSuccess: posts.success, postUpload: posts.post };
}

export default connect(mapStateToProps, actions)(NewPostFromURLScreen);
