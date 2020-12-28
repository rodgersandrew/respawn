import React, { Component } from 'react';
import { View, Text, AsyncStorage, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import * as actions from '../actions';
import NavigationService from '../navigation/NavigationService';

class AuthScreen extends Component {
  componentWillReceiveProps(nextProps) {
    this.onAuthComplete(nextProps, this.props);
  }

  onAuthComplete(props, prevProps) {
    if (props.user.newUser) {
      NavigationService.navigate('createProfile');
    } else if (props.user.uid || prevProps.user.uid) {
      this.props.onAuthComplete(props.user.uid);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          title='Login with Facebook'
          onPress={() => this.props.facebookLogin()}
          large
        />
        <Button
          title='Log out.'
          onPress={() => this.props.facebookLogout()}
          large
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black'
  }
});

function mapStateToProps({ auth }) {
  return { user: auth.user };
}

export default connect(mapStateToProps, actions)(AuthScreen);
