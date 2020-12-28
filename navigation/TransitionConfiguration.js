import { Animated, Easing, Platform } from 'react-native';

const CollapseExpand = (index, position) => {
  const inputRange = [index - 1, index, index + 1];
  const opacity = position.interpolate({
    inputRange,
    outputRange: [0, 1, 1]
  });

  const scaleY = position.interpolate({
    inputRange,
    outputRange: [0, 1, 1]
  });

  return {
    opacity,
    transform: [{ scaleY }]
  };
};

const SlideFromRight = (index, position, width) => {
  const inputRange = [index - 1, index, index + 1];
  const translateX = position.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [width, 0, 0]
  });
  const slideFromRight = { transform: [{ translateX }] };
  return slideFromRight;
};

const SlideFromBottom = (index, position, height) => {
  const inputRange = [index - 1, index, index + 1];
  const translateY = position.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [height, 0, 0]
  });
  const slideFromBottom = { transform: [{ translateY }] };
  return slideFromBottom;
};

const TransitionConfiguration = () => {
  return {
    transitionSpec: {
      duration: 400,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing,
      useNativeDriver: true
    },
    screenInterpolator: sceneProps => {
      const { layout, position, scene } = sceneProps;
      const width = layout.initWidth;
      const height = layout.initHeight;
      const { index, route } = scene;
      const params = route.params || {}; // <- That's new
      const transition = params.transition || 'default'; // <- That's new
      return {
        collapseExpand: CollapseExpand(index, position),
        slideFromBottom: SlideFromBottom(index, position, height),
        default: SlideFromRight(index, position, width)
      }[transition];
    }
  };
};

export default TransitionConfiguration;
