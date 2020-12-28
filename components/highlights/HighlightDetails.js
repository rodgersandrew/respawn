import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  AsyncStorage,
  StyleSheet
} from 'react-native';
import { Avatar, Image, Button } from 'react-native-elements';

import Colors from '../../constants/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ACTION_ICON_SIZE = 22;

export default class HighlightDetails extends React.Component {
  async onProfilePress(profileUID) {
    let fbToken = await AsyncStorage.getItem('fb_token');

    if (fbToken && fbToken === profileUID) {
      this.props.navigation.navigate('userProfile');
    } else {
      this.props.navigation.navigate('viewProfile', {
        profileUID: profileUID
      });
    }
  }

  render() {
    const { username, avatarSource, owner } = this.props.profile;

    return (
      <View style={styles.userDetailsContainer}>
        <TouchableOpacity
          style={styles.profileTouchable}
          onPress={() => this.onProfilePress(owner)}>
          <Image
            source={avatarSource}
            containerStyle={styles.avatarContainer}
            placeholderStyle={styles.bgTransparent}
          />
          <Text style={styles.username}>{username}</Text>
        </TouchableOpacity>
        <View style={{ flex: 2 }}>
          <Button
            onPress={() => this.props.openModal(this.props.post)}
            clear
            icon={{
              name: 'dots-three-horizontal',
              type: 'entypo',
              size: ACTION_ICON_SIZE,
              color: Colors.lightGrey
            }}
            buttonStyle={styles.bgTransparentFlexEnd}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  userDetailsContainer: {
    flexDirection: 'row',
    paddingLeft: 10,
    width: SCREEN_WIDTH,
    height: 40,
    alignItems: 'center'
  },
  profileTouchable: {
    flexDirection: 'row'
  },
  username: {
    alignSelf: 'center',
    marginLeft: 5,
    fontSize: 16,
    fontFamily: 'lato',
    color: '#cccccc'
  },
  avatarContainer: {
    height: 25,
    width: 25,
    borderRadius: 25 / 2,
    // borderWidth: 1,
    borderColor: 'rgba(170, 170, 170, 0.5)',
    backgroundColor: 'rgba(0,0,0,0)',
    overflow: 'hidden'
  },
  bgTransparent: {
    backgroundColor: 'transparent'
  },
  bgTransparentFlexEnd: {
    backgroundColor: 'transparent',
    alignSelf: 'flex-end'
  }
});
