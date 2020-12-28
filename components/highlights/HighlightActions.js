import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';

import Colors from '../../constants/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ACTION_ICON_SIZE = 23;

export default class HighlightActions extends React.Component {
  componentDidMount() {}

  render() {
    const {
      likesCount,
      userInitLike,
      userLikesPost,
      userSavedPost
    } = this.props.data;
    const likesCounter =
      userLikesPost && !userInitLike
        ? likesCount + 1
        : !userLikesPost && userInitLike
        ? likesCount - 1
        : likesCount;

    return (
      <View style={styles.actionsContainer}>
        <Button
          onPress={this.props.toggleLike}
          clear
          title={likesCounter > 0 ? likesCounter.toLocaleString('en') : null}
          // iconRight
          icon={{
            name: 'hand-o-up',
            type: 'font-awesome',
            size: ACTION_ICON_SIZE - 3,
            color: userLikesPost ? Colors.accentLimeLight : Colors.lightGrey
          }}
          buttonStyle={styles.bgTransparent}
          titleStyle={{
            color: userLikesPost ? Colors.accentLimeLight : Colors.lightGrey,
            fontFamily: 'lato-light',
            fontSize: 16
          }}
        />
        <Button
          onPress={this.props.viewComments}
          clear
          icon={{
            name: 'comment-text-outline',
            type: 'material-community',
            size: ACTION_ICON_SIZE,
            color: Colors.lightGrey,
            iconStyle: { marginTop: 3 }
          }}
          buttonStyle={styles.bgTransparent}
        />
        <View style={{ flex: 1 }}>
          <Button
            onPress={this.props.toggleSave}
            clear
            icon={{
              name: 'bookmark-o',
              type: 'font-awesome',
              size: ACTION_ICON_SIZE,
              color: userSavedPost ? Colors.accentLimeLight : Colors.lightGrey
            }}
            buttonStyle={styles.bgTransparentFlexEnd}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    width: SCREEN_WIDTH,
    height: 40,
    alignItems: 'center',
  },
  bgTransparent: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  bgTransparentFlexEnd: {
    backgroundColor: 'transparent',
    alignSelf: 'flex-end'
  }
});
