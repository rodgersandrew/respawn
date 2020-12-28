import React from 'react';
import { SafeAreaView, View, Modal, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { SafeAreaConsumer } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import PostReasonModal from '../moderation/PostReasonModal';

export default class PostActionsModal extends React.Component {
  state = {
    modalVisible: false,
    reportReason: null
  };

  componentWillReceiveProps(nextProps) {
    if (!nextProps.visible) {
      this.setState({ modalVisible: false });
    }
  }
  handleReport = (postObj, reason) => {
    this.setState({ reportReason: reason });
    this.props.reportPost(this.props.post.postID, reason);
  };

  render() {
    const { currUser } = this.props;
    const { owner } = this.props.post || '';
    const userOwnsPost = currUser === owner ? true : false;
    return (
      <View>
        <Modal
          animationType='fade'
          transparent={true}
          visible={this.props.visible && !this.state.modalVisible}>
          <SafeAreaConsumer>
            {insets => (
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  justifyContent: 'flex-end'
                }}>
                <View
                  style={{
                    borderRadius: 10,
                    overflow: 'hidden',
                    backgroundColor: Colors.accentLimeDark,
                    marginBottom: insets.bottom
                  }}>
                  <Button
                    onPress={() => {
                      this.setState({ modalVisible: true });
                    }}
                    title='Report'
                    titleStyle={{ color: 'red' }}
                    buttonStyle={styles.defaultBtnStyle}
                  />
                  {userOwnsPost ? (
                    <Button
                      onPress={() => {
                        this.props.deletePost(this.props.post);
                      }}
                      title='Delete Post'
                      titleStyle={{ color: 'red' }}
                      buttonStyle={styles.defaultBtnStyle}
                    />
                  ) : null}
                  <Button
                    onPress={this.props.closeModal}
                    title='Cancel'
                    titleStyle={{
                      color: '#2482bd',
                      fontWeight: 'bold'
                    }}
                    buttonStyle={styles.defaultBtnStyle}
                  />
                </View>
              </View>
            )}
          </SafeAreaConsumer>
        </Modal>
        <PostReasonModal
          closeModal={this.props.closeModal}
          visible={this.state.modalVisible}
          reportPost={this.props.reportPost}
          post={this.props.post}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  defaultBtnStyle: {
    height: 50,
    backgroundColor: '#f6f6f6',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    borderRadius: 0
  }
});
