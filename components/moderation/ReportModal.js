import React from 'react';
import { SafeAreaView, View, Modal, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { SafeAreaConsumer } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import CommentReasonModal from '../moderation/CommentReasonModal';

export default class ReportModal extends React.Component {
  state = {
    modalVisible: false,
    reportReason: null
  };

  componentWillReceiveProps(nextProps) {
    if (!nextProps.visible) {
      this.setState({ modalVisible: false });
    }
  }
  handleReport = (commentObj, reason) => {
    this.setState({ reportReason: reason });
    this.props.reportComment(this.props.comment, reason);
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
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
                    buttonStyle={{
                      height: 50,
                      backgroundColor: '#f6f6f6',
                      borderBottomColor: '#ccc',
                      borderBottomWidth: 1,
                      borderRadius: 0
                    }}
                  />
                  <Button
                    onPress={this.props.closeModal}
                    title='Cancel'
                    titleStyle={{
                      color: '#2482bd',
                      fontWeight: 'bold'
                    }}
                    buttonStyle={{
                      height: 50,
                      backgroundColor: '#f6f6f6',
                      borderBottomColor: '#ccc',
                      borderBottomWidth: 1,
                      borderRadius: 0
                    }}
                  />
                </View>
              </View>
            )}
          </SafeAreaConsumer>
        </Modal>
        <CommentReasonModal
          closeModal={this.props.closeModal}
          visible={this.state.modalVisible}
          reportReason={this.handleReport}
          comment={this.props.comment}
        />
      </View>
    );
  }
}
