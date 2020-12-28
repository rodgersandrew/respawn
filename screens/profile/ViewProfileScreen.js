import React, { Component } from 'react';
import { View, Text, StyleSheet, AsyncStorage, Dimensions } from 'react-native';
import { Icon, Avatar, Button } from 'react-native-elements';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import { LinearGradient } from 'expo-linear-gradient';
import _ from 'lodash';

import ProfilePostsView from '../../components/profile/ProfilePostsView';
import AuthScreen from '../AuthScreen';
import Colors from '../../constants/Colors';

const DEFAULT_AVATAR = require('../../assets/imgs/default_avatar.png');
const SCREEN_WIDTH = Dimensions.get('window').width;
const COVER_GRADIENT = [Colors.bgPrimaryDark, Colors.bgPrimaryLight];

class ViewProfileScreen extends Component {
  static navigationOptions = {
    drawerLabel: 'Profile',
    drawerIcon: ({ tintColor }) => {
      return <Icon name='user' type='antdesign' color={tintColor} />;
    },
    header: null
  };

  componentWillMount() {
    this.setState({
      profileLoaded: false,
      loading: true,
      profile: {},
      uid: null
    });
  }

  componentDidMount() {
    const profileUID = this.props.navigation.getParam('profileUID');
    this.setState({ uid: profileUID });
    this.props.getUserProfile(profileUID);
  }

  componentDidUpdate(prevProps) {
    if (this.props.profile && !prevProps.profile) {
      this.setState({
        profile: { ...this.props.profile },
        profileLoaded: true,
        loading: false
      });
    }
  }

  onAuthComplete = uid => {
    this.setState({ isAuthenticated: true, uid: uid });
    // this.props.getUserProfile(uid);
  };

  goBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    const { loading, isAuthenticated } = this.state;
    const { username, avatarSource } = this.state.profile;

    if (loading) {
      return (
        <View style={styles.container}>
          <LinearGradient
            colors={COVER_GRADIENT}
            style={{ width: SCREEN_WIDTH, paddingTop: 40 }}>
            <View style={{ width: '100%', alignItems: 'flex-start' }}>
              <Button
                clear
                onPress={this.goBack}
                icon={{
                  name: 'arrow-left',
                  type: 'feather',
                  color: '#f6f6f6',
                  size: 40
                }}
                buttonStyle={{ backgroundColor: 'rgba(0,0,0,0)' }}
              />
            </View>
            <View style={styles.headerContainer}>
              <Avatar
                source={
                  avatarSource === 'default_avatar.png'
                    ? DEFAULT_AVATAR
                    : avatarSource
                }
                showEditButton
                containerStyle={{
                  marginTop: -20,
                  width: 100,
                  height: 100,
                  borderWidth: 1,
                  borderColor: Colors.white,
                  borderRadius: 50,
                  overflow: 'hidden'
                }}
                onEditPress={this._pickImage}
              />
              <View style={styles.usernameContainer}>
                <Text style={styles.usernameText}>{username}</Text>
              </View>
            </View>
          </LinearGradient>
          <View style={styles.profileDetails}></View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={COVER_GRADIENT}
          style={{ width: SCREEN_WIDTH, paddingTop: 40 }}>
          <View style={{ width: '100%', alignItems: 'flex-start' }}>
            <Button
              clear
              onPress={this.goBack}
              icon={{
                name: 'arrow-left',
                type: 'feather',
                color: '#f6f6f6',
                size: 40
              }}
              buttonStyle={{ backgroundColor: 'rgba(0,0,0,0)' }}
            />
          </View>
          <View style={styles.headerContainer}>
            <Avatar
              source={
                avatarSource === 'default_avatar.png'
                  ? DEFAULT_AVATAR
                  : avatarSource
              }
              showEditButton
              containerStyle={{
                marginTop: -20,
                width: 100,
                height: 100,
                borderWidth: 1,
                borderColor: Colors.white,
                borderRadius: 50,
                overflow: 'hidden'
              }}
              onEditPress={this._pickImage}
            />
            <View style={styles.usernameContainer}>
              <Text style={styles.usernameText}>{username}</Text>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.profileDetails}>
          {_.isUndefined(this.state.profile.username) ? null : (
            <ProfilePostsView
              user={this.state.uid}
              profile={this.state.profile}
              navigation={this.props.navigation}
            />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center'
  },
  lottie: { width: 150, height: 150 },
  headerContainer: {
    width: '100%',
    borderBottomColor: Colors.white,
    borderBottomWidth: 1,
    alignItems: 'center'
    // backgroundColor: '#383838'
  },
  profileHeader: {
    fontSize: 26,
    fontWeight: 'normal',
    color: Colors.noticeText,
    marginBottom: 30
  },
  usernameContainer: {
    width: '100%',
    height: 30,
    marginVertical: 15,
    alignItems: 'center'
  },
  profileDetails: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.bgPrimaryDark
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: 20
  },
  usernameText: {
    fontSize: 24,
    fontFamily: 'open-sans-bold',
    color: Colors.noticeText
  },
  inputLabel: {
    fontSize: 16,
    color: '#f6f6f6'
  },
  inputTextStyle: {
    fontSize: 20,
    color: '#f6f6f6'
  },
  inputInnerContainer: {
    height: 60,
    borderColor: 'rgba(42, 162, 158, 0.3)',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    backgroundColor: '#292929',
    paddingLeft: 10
  }
});

function mapStateToProps({ auth, user }) {
  return {
    auth: auth.success,
    user: auth.user,
    uid: auth.uid,
    profile: user.profile
  };
}

export default connect(mapStateToProps, actions)(ViewProfileScreen);
