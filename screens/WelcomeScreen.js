import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

class WelcomeScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>WelcomeScreen</Text>
        <Text>WelcomeScreen</Text>
        <Text>WelcomeScreen</Text>
        <Text>WelcomeScreen</Text>
        <Text>WelcomeScreen</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default WelcomeScreen;
