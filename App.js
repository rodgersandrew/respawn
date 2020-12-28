import React from 'react';
import { StyleSheet, Text, AsyncStorage, View } from 'react-native';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import firebase from 'firebase';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import NavigationService from './navigation/NavigationService';

import CoreNavigator from './navigation/CoreNavigator';
import * as firebaseEnv from './config/firebase';
import configureStore from './store';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Sentry from 'sentry-expo';

export default class App extends React.Component {
  state = {
    fontsLoaded: false
  };

  async componentDidMount() {
    const firebaseConfig = firebaseEnv.firebaseConfig;
    firebase.initializeApp(firebaseConfig);

    //debugging purposes ONLY
    // AsyncStorage.removeItem('fb_token');
    let fbToken = await AsyncStorage.getItem('fb_token');
    console.log(fbToken);
  }

  renderFonts = async () => {
    return Font.loadAsync({
      'open-sans': require('./assets/fonts/OpenSans-Regular.ttf'),
      'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
      'raleway-medium': require('./assets/fonts/Raleway-Medium.ttf'),
      'raleway-semi': require('./assets/fonts/Raleway-SemiBold.ttf'),
      'raleway-bold': require('./assets/fonts/Raleway-Bold.ttf'),
      nunito: require('./assets/fonts/NunitoSans-Regular.ttf'),
      'nunito-semi': require('./assets/fonts/NunitoSans-SemiBold.ttf'),
      'nunito-semi-italic': require('./assets/fonts/NunitoSans-SemiBoldItalic.ttf'),
      lato: require('./assets/fonts/Lato-Regular.ttf'),
      'lato-italic': require('./assets/fonts/Lato-Italic.ttf'),
      'lato-light': require('./assets/fonts/Lato-Light.ttf'),
      'lato-light-italic': require('./assets/fonts/Lato-LightItalic.ttf')
    });
  };
  render() {
    const { persistor, store } = configureStore();

    if (!this.state.fontsLoaded) {
      return (
        <AppLoading
          startAsync={this.renderFonts}
          onFinish={() => {
            this.setState({ fontsLoaded: true });
          }}
        />
      );
    }
    return (
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <CoreNavigator
              ref={navigatorRef => {
                NavigationService.setTopLevelNavigator(navigatorRef);
              }}
            />
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
