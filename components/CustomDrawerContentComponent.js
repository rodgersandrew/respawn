import React, { Component } from 'react';
import {
  ScrollView,
  View,
  Animated,
  Dimensions,
  StyleSheet
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { DrawerItems } from 'react-navigation-drawer';
import { Button, Icon } from 'react-native-elements';
import { NavigationActions, StackActions } from 'react-navigation';
import Colors from '../constants/Colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

let subIconWidth = 100;
export default class CustomDrawerContentComponent extends Component {
  state = {
    postControlsVisibility: false,
    postControlsOpacity: new Animated.Value(0),
    galleryXY: new Animated.ValueXY({ x: -subIconWidth / 2, y: 120 }),
    fromUrlXY: new Animated.ValueXY({ x: -subIconWidth / 2, y: 120 }),
    postControlsXY: new Animated.ValueXY({ x: SCREEN_WIDTH / 2, y: 150 }),
    newPostButtonBottom: new Animated.Value(120)
  };

  _showPostControls = () => {
    this.setState({ postControlsVisibility: true });
    showPostControls = Animated.timing(this.state.postControlsOpacity, {
      toValue: 1,
      duration: 400
    });

    animateGallery = Animated.timing(this.state.galleryXY, {
      toValue: { x: -subIconWidth / 2 - 50, y: 170 },
      duration: 400
    });

    animateURL = Animated.timing(this.state.fromUrlXY, {
      toValue: { x: -subIconWidth / 2 + 50, y: 170 },
      duration: 400
    });

    slideDownNewPostBtn = Animated.timing(this.state.newPostButtonBottom, {
      toValue: 60,
      duration: 400
    });

    Animated.parallel([
      showPostControls,
      animateGallery,
      animateURL,
      slideDownNewPostBtn
    ]).start(() => {});
  };

  _hidePostControls = () => {
    this.setState({ postControlsVisibility: false });
    hidePostControls = Animated.timing(this.state.postControlsOpacity, {
      toValue: 0,
      duration: 300
    });

    hideGallery = Animated.timing(this.state.galleryXY, {
      toValue: { x: -subIconWidth / 2, y: 120 },
      duration: 400
    });

    hideURL = Animated.timing(this.state.fromUrlXY, {
      toValue: { x: -subIconWidth / 2, y: 120 },
      duration: 400
    });

    slideUpNewPostBtn = Animated.timing(this.state.newPostButtonBottom, {
      toValue: 120,
      duration: 400
    });

    Animated.parallel([
      hidePostControls,
      hideGallery,
      hideURL,
      slideUpNewPostBtn
    ]).start(() => {});
  };

  onNewPostPress = () => {
    const { postControlsVisibility } = this.state;
    if (postControlsVisibility) {
      this._hidePostControls();
    } else {
      this._showPostControls();
    }
  };

  handleGalleryPicker = () => {
    this._hidePostControls();
    this.props.navigation.navigate('newPost');
  };

  handleURLPicker = () => {
    this._hidePostControls();
    this.props.navigation.navigate('newPostFromURL');
  };

  render() {
    return (
      <ScrollView scrollEnabled={false}>
        <SafeAreaView
          style={styles.container}
          forceInset={{ top: 'always', horizontal: 'never' }}>
          <View style={styles.drawerItemContainer}>
            <DrawerItems
              {...this.props}
              onItemPress={props => {
                if (props.route.key === 'drawerCollective') {
                  this.props.navigation.dispatch(
                    StackActions.reset({
                      index: 0,
                      key: 'drawerCollective',
                      actions: [
                        NavigationActions.navigate({
                          routeName: 'collective'
                        })
                      ]
                    })
                  );
                } else if (props.route.key == 'drawerHighlights') {
                  this.props.navigation.dispatch(
                    StackActions.reset({
                      index: 0,
                      key: 'drawerHighlights',
                      actions: [
                        NavigationActions.navigate({
                          routeName: 'display'
                        })
                      ]
                    })
                  );
                } else {
                  this.props.navigation.navigate(props.route.key);
                }
              }}
            />
          </View>
          <View style={styles.otherContainer}>
            <Animated.View
              style={{
                width: subIconWidth,
                position: 'absolute',
                bottom: this.state.galleryXY.y,
                left: this.state.galleryXY.x,
                opacity: this.state.postControlsOpacity,
                justifyContent: 'flex-end'
              }}>
              <Button
                clear
                title='from gallery'
                titleStyle={{ fontFamily: 'raleway-medium', fontSize: 14 }}
                icon={{
                  name: 'folder-video',
                  type: 'entypo',
                  color: Colors.white,
                  size: 40,
                  backgroundColor: 'rgba(255, 255, 255, 0.4)'
                }}
                buttonStyle={{
                  backgroundColor: 'transparent',
                  flexDirection: 'column'
                }}
                onPress={this.handleGalleryPicker}
              />
            </Animated.View>

            <Animated.View
              style={{
                width: subIconWidth,
                position: 'absolute',
                bottom: this.state.fromUrlXY.y,
                left: this.state.fromUrlXY.x,
                opacity: this.state.postControlsOpacity,
                justifyContent: 'flex-end'
              }}>
              <Button
                clear
                title='from url'
                titleStyle={{
                  fontFamily: 'raleway-medium',
                  fontSize: 14,
                  paddingTop: 10
                }}
                icon={{
                  name: 'link',
                  type: 'feather',
                  color: Colors.white,
                  size: 35
                }}
                buttonStyle={{
                  backgroundColor: 'transparent',
                  flexDirection: 'column'
                }}
                onPress={this.handleURLPicker}
              />
            </Animated.View>
            <Animated.View
              style={{
                width: SCREEN_WIDTH / 2,
                position: 'absolute',
                bottom: this.state.newPostButtonBottom,
                alignItems: 'center'
              }}>
              <Button
                clear
                icon={
                  this.state.postControlsVisibility
                    ? {
                        name: 'squared-minus',
                        type: 'entypo',
                        color: Colors.accentLimeLight,
                        size: 60
                      }
                    : {
                        name: 'squared-plus',
                        type: 'entypo',
                        color: Colors.accentLimeLight,
                        size: 60
                      }
                }
                containerStyle={{
                  width: 200
                }}
                buttonStyle={{ backgroundColor: 'rgba(0,0,0,0)' }}
                onPress={this.onNewPostPress}
              />
            </Animated.View>
          </View>
        </SafeAreaView>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: SCREEN_HEIGHT,
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  drawerItemContainer: {
    flex: 1,
    marginTop: '10%'
  },
  otherContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: '20%',
    backgroundColor: 'red'
  }
});
