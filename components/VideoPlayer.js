import React from 'react';
import {
  StyleSheet,
  Animated,
  Text,
  View,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import { Video } from 'expo-av';
import { Icon } from 'react-native-elements';

import Colors from '../constants/Colors';

const FADE_IN_DURATION = 400;
const FADE_OUT_DURATION = 400;
const QUICK_FADE_OUT_DURATION = 200;
const HIDE_CONTROLS_TIMER_DURATION = 2000;
const PLAY_BUFFER = 500;

//UI States
var ControlStates;
(function(ControlStates) {
  ControlStates['Shown'] = 'Show';
  ControlStates['Showing'] = 'Showing';
  ControlStates['Hidden'] = 'Hidden';
  ControlStates['Hiding'] = 'Hiding';
})(ControlStates || (ControlStates = {}));

let controlsTimer = null;
let playbackInstance = null;

export default class VideoPlayer extends React.Component {
  state = {
    mute: true,
    fullScreen: false,
    shouldPlay: this.props.activePost ? false : false,
    didStart: false,
    playbackFinished: false,
    controlsState: ControlStates.Hidden,
    controlsOpacity: new Animated.Value(0),
    resetControlOpacity: new Animated.Value(0),
    resetEnabled: false
  };

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.isScrolling &&
      this.props.activePost &&
      this.state.shouldPlay
    ) {
      this.setState({ shouldPlay: false });
    }

    // if (
    //   !nextProps.isScrolling &&
    //   this.props.activePost &&
    //   nextProps.activePost &&
    //   !this.state.shouldPlay
    // ) {
    //   this.setState({ shouldPlay: true });
    // }

    if (nextProps.activePost && !this.props.activePost) {
      setTimeout(() => {
        this.setState({ shouldPlay: true });
      }, PLAY_BUFFER);
    }

    if (!nextProps.activePost) {
      this.resetPlayerState();
    }
  }

  resetPlayerState = async () => {
    await playbackInstance.setStatusAsync({
      shouldPlay: false,
      positionMillis: 0
    });

    this.setState({
      fullScreen: false,
      shouldPlay: false,
      didStart: false,
      controlsState: ControlStates.Hidden,
      controlsOpacity: new Animated.Value(0),
      resetControlOpacity: new Animated.Value(0),
      resetEnabled: false
    });
  };

  _onPlaybackStatusUpdate = playbackStatus => {
    if (playbackStatus.didJustFinish) {
      this.state.controlsOpacity.setValue(0);
      this.setState({
        playbackFinished: true,
        controlsState: ControlStates.Hidden,
        resetEnabled: true
      });
      this.showReset();
    }
  };

  //   Controls Behavior
  replay = async () => {
    if (playbackInstance !== null) {
      await playbackInstance.setStatusAsync({
        shouldPlay: true,
        positionMillis: 0
      });

      this.hideReset();
    }
  };

  hideReset = () => {
    hideAnimation = Animated.timing(this.state.resetControlOpacity, {
      toValue: 0,
      duration: QUICK_FADE_OUT_DURATION,
      useNativeDriver: true
    });
    hideAnimation.start();

    this.setState({ resetEnabled: false });
  };

  showReset = () => {
    showingAnimation = Animated.timing(this.state.resetControlOpacity, {
      toValue: 1,
      duration: FADE_IN_DURATION,
      useNativeDriver: true
    });
    showingAnimation.start();
  };

  toggleControls = () => {
    switch (this.state.controlsState) {
      case ControlStates.Shown:
        // If the controls are currently Shown, a tap should hide controls quickly
        this.setState({ controlsState: ControlStates.Hiding });
        this.hideControls(true);
        break;
      case ControlStates.Hidden:
        // If the controls are currently, show controls with fade-in animation
        this.showControls();
        this.setState({ controlsState: ControlStates.Showing });
        break;
      case ControlStates.Hiding:
        // If controls are fading out, a tap should reverse, and show controls
        this.setState({ controlsState: ControlStates.Showing });
        this.showControls();
        break;
      case ControlStates.Showing:
        // A tap when the controls are fading in should do nothing
        break;
    }
  };

  showControls = () => {
    showingAnimation = Animated.timing(this.state.controlsOpacity, {
      toValue: 1,
      duration: FADE_IN_DURATION,
      useNativeDriver: true
    });
    showingAnimation.start(({ finished }) => {
      if (finished) {
        this.setState({ controlsState: ControlStates.Shown });
        this.resetControlsTimer();
      }
    });
  };

  hideControls = (immediately = false) => {
    if (controlsTimer) {
      clearTimeout(controlsTimer);
    }
    hideAnimation = Animated.timing(this.state.controlsOpacity, {
      toValue: 0,
      duration: immediately ? QUICK_FADE_OUT_DURATION : FADE_OUT_DURATION,
      useNativeDriver: true
    });
    hideAnimation.start(({ finished }) => {
      if (finished) {
        this.setState({ controlsState: ControlStates.Hidden });
      }
    });
  };

  onTimerDone = () => {
    // After the controls timer runs out, fade away the controls slowly
    this.setState({ controlsState: ControlStates.Hiding });
    this.hideControls();
  };

  resetControlsTimer = () => {
    if (controlsTimer) {
      clearTimeout(controlsTimer);
    }
    controlsTimer = setTimeout(
      () => this.onTimerDone(),
      HIDE_CONTROLS_TIMER_DURATION
    );
  };

  handlePlayAndPause = () => {
    this.resetControlsTimer();
    this.setState(prevState => ({
      shouldPlay: !prevState.shouldPlay
    }));
  };

  handleVolume = () => {
    this.setState(prevState => ({
      mute: !prevState.mute
    }));
  };

  render() {
    const { width } = Dimensions.get('window');
    const { highlight } = this.props;
    const videoAspect = highlight.aspect || highlight.aspectRatio;
    const height = width * videoAspect;

    return (
      <View style={{ width: width, height: height }}>
        <View>
          <Video
            source={{ uri: highlight.media }}
            shouldPlay={this.state.shouldPlay}
            resizeMode={Video.RESIZE_MODE_CONTAIN}
            style={{
              width: width,
              height: height
            }}
            isMuted={this.state.mute}
            onPlaybackStatusUpdate={playbackStatus =>
              this._onPlaybackStatusUpdate(playbackStatus)
            }
            ref={component => {
              playbackInstance = component;
            }}
          />
          <TouchableWithoutFeedback onPress={this.toggleControls} on>
            <View style={[styles.touchableArea, { height: height }]}></View>
          </TouchableWithoutFeedback>
          {!this.state.resetEnabled ? (
            <Animated.View
              style={[
                styles.playContainer,
                { opacity: this.state.controlsOpacity, bottom: height / 2 - 30 }
              ]}>
              <Icon
                name={this.state.shouldPlay ? 'pause' : 'play-arrow'}
                size={55}
                color={Colors.white}
                containerStyle={{
                  height: 60,
                  width: 60,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: 30
                }}
                underlayColor='transparent'
                onPress={
                  this.state.controlsState !== ControlStates.Hidden
                    ? this.handlePlayAndPause
                    : this.toggleControls
                }
              />
            </Animated.View>
          ) : (
            <Animated.View
              style={[
                styles.playContainer,
                {
                  opacity: this.state.resetControlOpacity,
                  bottom: height / 2 - 45 / 2
                }
              ]}>
              <Icon
                name='undo'
                type='font-awesome'
                size={45}
                disabled={!this.state.resetEnabled}
                color={Colors.white}
                containerStyle={{
                  height: 60,
                  width: 60,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: 30
                }}
                underlayColor='transparent'
                onPress={this.replay}
              />
            </Animated.View>
          )}

          <View style={styles.controlBar}>
            <Icon
              name={this.state.mute ? 'volume-mute' : 'volume-up'}
              size={30}
              iconStyle={{
                textShadowColor: 'rgba(0, 0, 0, 0.6)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 3
              }}
              underlayColor='transparent'
              color='#f6f6f6'
              onPress={this.handleVolume}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  controlBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingRight: 5,
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0)'
  },
  touchableArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row'
  },
  playContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
