import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements';
import {
  AntDesign,
  MaterialCommunityIcons,
  Octicons
} from '@expo/vector-icons';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';

import ProfilePostsView from './ProfilePostsView';
import ProfileLikesView from './ProfileLikesView';
import ProfileCommentsView from './ProfileCommentsView';
import ProfileSavedView from './ProfileSavedView';

export default class ProfileTabView extends React.Component {
  PostsRoute = () => <ProfilePostsView {...this.props} />;

  LikesRoute = () => <ProfileLikesView {...this.props} />;

  SavedRoute = () => <ProfileSavedView {...this.props} />;

  CommentsRoute = () => <ProfileCommentsView {...this.props} />;

  state = {
    index: 0,
    routes: [
      {
        key: 'posts',
        title: 'Posts',
        icon: 'appstore-o',
        iconType: 'antdesign',
        size: 22
      },
      {
        key: 'likes',
        title: 'Liked',
        icon: 'hearto',
        iconType: 'antdesign',
        size: 22
      },
      {
        key: 'saved',
        title: 'Saved',
        icon: 'staro',
        iconType: 'antdesign',
        size: 24
      },
      {
        key: 'comments',
        title: 'Comments',
        icon: 'comment',
        iconType: 'octicons',
        size: 24
      }
    ]
  };

  _renderIcon = props => {
    const { route, color } = props;
    if (route.iconType === 'antdesign') {
      return <AntDesign name={route.icon} size={route.size} color={color} />;
    }
    if (route.iconType === 'material-community') {
      return (
        <MaterialCommunityIcons
          name={route.icon}
          size={route.size}
          // style={{ marginTop: 5 }}
          color={color}
        />
      );
    }
    if (route.iconType === 'octicons') {
      return <Octicons name={route.icon} size={route.size} color={color} />;
    }
    return <Icon name={route.icon} size={route.size} color={color} />;
  };

  render() {
    return (
      <TabView
        navigationState={this.state}
        renderTabBar={props => (
          <TabBar
            {...props}
            labelStyle={{ fontFamily: 'lato', fontSize: 12 }}
            renderIcon={this._renderIcon}
            inactiveColor='#f6f6f6'
            activeColor='#a3f7bf'
            // renderIndicator={() => {
            //   return null;
            // }}
            indicatorStyle={{ backgroundColor: '#a3f7bf' }}
            renderIndicator={() => {
              return null;
            }}
            style={styles.tabBar}
          />
        )}
        lazy={true}
        renderScene={SceneMap({
          posts: this.PostsRoute,
          likes: this.LikesRoute,
          saved: this.SavedRoute,
          comments: this.CommentsRoute
        })}
        onIndexChange={index => this.setState({ index })}
        initialLayout={{ width: Dimensions.get('window').width }}
      />
    );
  }
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    height: '100%'
  },
  tabBar: {
    backgroundColor: 'rgba(0, 0, 0, 0)'
  }
});
