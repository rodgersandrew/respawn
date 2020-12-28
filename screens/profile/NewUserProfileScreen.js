import React, { Component } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Input, Button, Icon, Avatar } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { connect } from 'react-redux';
import AnimatedLoader from 'react-native-animated-loader';

import * as actions from '../../actions';
import Colors from '../../constants/Colors';

const DEFAULT_AVATAR = require('../../assets/imgs/default_avatar.png');

class NewUserProfileScreen extends Component {
  state = {
    profile: {
      username: '',
      avatarSource: DEFAULT_AVATAR
    },
    loading: false
  };

  componentDidMount() {
    this.getPermissionAsync();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ loading: false });
    if (nextProps.profileUpdated) {
      console.log('nav to new users profile');
      this.props.navigation.navigate('userProfile', {
        isAuthenticated: true,
        profileLoaded: true,
        loading: false,
        profile: { ...nextProps.profile }
      });
    }
  }

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
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1
    });

    if (!result.cancelled) {
      this.setState({ profile: { avatarSource: { uri: result.uri } } });
    }
  };

  render() {
    const { loading } = this.state;
    const { avatarSource, username } = this.state.profile;

    return (
      <View style={styles.container}>
        <AnimatedLoader
          visible={loading}
          overlayColor='rgba(0,0,0,0.65)'
          animationStyle={styles.lottie}
          source={require('../../assets/lottie/mint_spinner.json')}
          speed={1}
        />
        <Text style={styles.profileHeader}>CREATE PROFILE</Text>
        <Avatar
          rounded
          source={
            avatarSource === 'default_avatar.png'
              ? DEFAULT_AVATAR
              : avatarSource
          }
          showEditButton
          avatarStyle={{
            borderWidth: 1,
            borderColor: Colors.white,
            borderRadius: 200
          }}
          onEditPress={this._pickImage}
          size='xlarge'
        />
        <View style={styles.profileDetails}>
          <Input
            onChangeText={text => {
              this.setState({
                profile: { ...this.state.profile, username: text }
              });
            }}
            placeholder='USERNAME'
            placeholderTextColor='#8a8a8a'
            labelStyle={styles.inputLabel}
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.inputInnerContainer}
            inputStyle={styles.inputTextStyle}
            rightIcon={
              <Icon
                name='user'
                type='antdesign'
                size={30}
                color={Colors.accentLimeLight}
              />
            }
          />
        </View>
        <View
          style={{
            flex: 1,
            width: '100%',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            padding: 30
          }}>
          <Button
            title='SAVE'
            icon={{
              name: 'arrow-circle-o-right',
              type: 'font-awesome',
              size: 30,
              color: '#333333'
            }}
            iconContainerStyle={{ paddingLeft: 5, paddingRight: 20 }}
            containerStyle={{ justifyContent: 'center', alignItems: 'center' }}
            buttonStyle={{
              paddingLeft: 30,
              backgroundColor: Colors.accentLimeLight
            }}
            titleStyle={{ color: '#333333', fontWeight: 'bold', fontSize: 22 }}
            iconRight
            onPress={() => {
              this.setState({ loading: true });
              this.props.createUserProfile(this.state.profile);
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
    paddingTop: 50
  },
  lottie: { width: 150, height: 150 },
  profileHeader: {
    fontSize: 26,
    fontWeight: 'normal',
    color: Colors.noticeText,
    marginBottom: 30
  },
  profileDetails: {
    width: '100%',
    marginTop: 30
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 16,
    color: Colors.noticeText
  },
  inputTextStyle: {
    fontSize: 20,
    color: Colors.noticeText
  },
  inputInnerContainer: {
    height: 60,
    borderColor: 'rgba(42, 162, 158, 0.3)',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    backgroundColor: Colors.bgPrimaryDark,
    paddingLeft: 10
  }
});

function mapStateToProps({ user }) {
  return { profileUpdated: user.success, profile: user.profile };
}
export default connect(mapStateToProps, actions)(NewUserProfileScreen);
