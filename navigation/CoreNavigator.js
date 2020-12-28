import React from 'react';
import { Icon } from 'react-native-elements';
import { Dimensions } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createDrawerNavigator } from 'react-navigation-drawer';

import WelcomeScreen from '../screens/WelcomeScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import DisplayScreen from '../screens/DisplayScreen';
import BrowseAllScreen from '../screens/BrowseAllScreen';
import ViewProfileScreen from '../screens/profile/ViewProfileScreen';
import CommentsScreen from '../screens/CommentsScreen';
import NewUserProfileScreen from '../screens/profile/NewUserProfileScreen';
import NewPostScreen from '../screens/NewPostScreen';
import NewPostFromURLScreen from '../screens/NewPostFromURLScreen';
import ProfilePostsScreen from '../screens/profile/ProfilePostsScreen';

import CustomDrawerContentComponent from '../components/CustomDrawerContentComponent';
import TransitionConfiguration from './TransitionConfiguration';
import Colors from '../constants/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CollectiveNavigator = createStackNavigator(
  {
    collective: BrowseAllScreen,
    viewProfile: ViewProfileScreen,
    comments: CommentsScreen,
    newPost: NewPostScreen,
    newPostFromURL: NewPostFromURLScreen,
    userProfile: EditProfileScreen,
    profilePosts: ProfilePostsScreen
  },
  {
    navigationOptions: {
      title: 'Sandbox',
      drawerLabel: 'Sandbox',
      drawerIcon: ({ tintColor }) => {
        return (
          <Icon
            name='play-box-outline'
            type='material-community'
            color={tintColor}
          />
        );
      },
      cardStack: {
        gesturesEnabled: false
      },
      gesturesEnabled: false
    },
    cardStyle: {
      opacity: 1
    },
    transparentCard: true,
    mode: 'modal',
    gesturesEnabled: false,
    headerMode: 'screen',
    transitionConfig: TransitionConfiguration
  }
);

const HighlightNavigator = createStackNavigator(
  {
    display: DisplayScreen,
    viewProfile: ViewProfileScreen,
    comments: CommentsScreen,
    newPost: NewPostScreen,
    newPostFromURL: NewPostFromURLScreen,
    userProfile: EditProfileScreen,
    profilePosts: ProfilePostsScreen
  },
  {
    navigationOptions: {
      title: 'Highlights',
      drawerLabel: 'Highlights',
      drawerIcon: ({ tintColor }) => {
        return <Icon name='star' type='antdesign' color={tintColor} />;
      },
      cardStack: {
        gesturesEnabled: false
      },
      gesturesEnabled: false
    },
    cardStyle: {
      opacity: 1
    },
    transparentCard: true,
    mode: 'modal',
    gesturesEnabled: false,
    headerMode: 'screen',
    transitionConfig: TransitionConfiguration
  }
);

const DrawerNavigator = createDrawerNavigator(
  {
    drawerHighlights: HighlightNavigator,
    drawerCollective: CollectiveNavigator,
    userProfile: EditProfileScreen
  },
  {
    // initialRouteName: 'userProfile',
    drawerBackgroundColor: Colors.bgPrimaryDark,
    contentOptions: {
      inactiveTintColor: Colors.inactiveTint,
      activeTintColor: Colors.activeTint,
      labelStyle: { fontSize: 30 },
      activeBackgroundColor: 'transparent',
      itemsContainerStyle: {
        alignItems: 'center'
      }
    },
    contentComponent: props => {
      return <CustomDrawerContentComponent {...props} />;
    },
    drawerWidth: SCREEN_WIDTH,
    edgeWidth: 0
  }
);

const CoreNavigator = createBottomTabNavigator(
  {
    welcome: WelcomeScreen,
    drawer: DrawerNavigator,
    createProfile: NewUserProfileScreen
  },
  {
    initialRouteName: 'drawer',
    defaultNavigationOptions: {
      tabBarVisible: false
    }
  }
);

export default createAppContainer(CoreNavigator);
