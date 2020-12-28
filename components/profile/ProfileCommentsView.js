import React from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableHighlight,
  FlatList,
  StyleSheet
} from 'react-native';
import { connect } from 'react-redux';
import AnimatedLoader from 'react-native-animated-loader';

import * as actions from '../../actions';
import Colors from '../../constants/Colors';

class ProfileCommentsView extends React.Component {
  state = {
    loading: true,
    comments: []
  };

  componentDidMount() {
    this.props.getUserComments(this.props.user);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.comments) {
      if (nextProps.comments.data) {
        this.setState({ comments: nextProps.comments.data, loading: false });
      }
    }
  }

  renderItem = ({ item, index }) => {
    return (
      <TouchableHighlight
        style={styles.commentContainer}
        underlayColor={'rgba(41, 161, 156, 0.3)'}
        onPress={() => console.log('comment pressed')}>
        <View style={styles.commentTextContainer}>
          <Text
            style={styles.commentText}
            ellipsizeMode='tail'
            numberOfLines={2}>
            {item.comment}
          </Text>
        </View>
      </TouchableHighlight>
    );
  };

  render() {
    if (this.state.loading) {
      return (
        <AnimatedLoader
          visible
          overlayColor='rgba(0,0,0,0)'
          animationStyle={styles.lottieSmall}
          source={require('../../assets/lottie/mint_spinner.json')}
          speed={1}
        />
      );
    }

    return (
      <FlatList
        keyExtractor={(item, i) => `${item.comment}_${item.createdAt}_${i}`}
        data={this.state.comments}
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 60 }}
        renderItem={this.renderItem}
        showsVerticalScrollIndicator={false}
        maxToRenderPerBatch={10}
        windowSize={2}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 10
  },
  commentContainer: {
    height: 60,
    backgroundColor: Colors.bgPrimaryLight,
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: '5%',
    marginBottom: 10,
    borderRadius: 2,
    borderColor: 'rgba(41, 161, 156, 0.3)',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    justifyContent: 'center'
  },
  commentTextContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  commentText: {
    fontFamily: 'nunito-semi',
    fontSize: 16,
    flex: 1,
    flexWrap: 'wrap',
    color: Colors.noticeText
  },
  lottieSmall: { width: 70, height: 70, marginTop: 30 }
});

function mapStateToProps({ user }) {
  return { comments: user.comments };
}
export default connect(mapStateToProps, actions)(ProfileCommentsView);
