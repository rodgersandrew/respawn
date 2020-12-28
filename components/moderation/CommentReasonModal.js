import React from 'react';
import { SafeAreaView, View, Modal, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { SafeAreaConsumer } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

export default class CommentReasonModal extends React.Component {
  render() {
    return (
      <Modal
        animationType='fade'
        transparent={true}
        visible={this.props.visible}>
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
                  onPress={() =>
                    this.props.reportReason(
                      this.props.comment,
                      'Intentional Griefing'
                    )
                  }
                  title='Intentional Griefing'
                  titleStyle={styles.defaultTitleStyle}
                  buttonStyle={styles.buttonStyle}
                />
                <Button
                  onPress={() =>
                    this.props.reportReason(this.props.comment, 'Hate Speech')
                  }
                  title='Hate Speech'
                  titleStyle={styles.defaultTitleStyle}
                  buttonStyle={styles.buttonStyle}
                />
                <Button
                  onPress={() =>
                    this.props.reportReason(this.props.comment, 'Spam')
                  }
                  title='Spam'
                  titleStyle={styles.defaultTitleStyle}
                  buttonStyle={styles.buttonStyle}
                />
                <Button
                  onPress={() =>
                    this.props.reportReason(
                      this.props.comment,
                      'Harmful Threats'
                    )
                  }
                  title='Harmful Threats'
                  titleStyle={styles.defaultTitleStyle}
                  buttonStyle={styles.buttonStyle}
                />
                <Button
                  onPress={this.props.closeModal}
                  title='Cancel'
                  titleStyle={styles.cancelTitleStyle}
                  buttonStyle={styles.buttonStyle}
                />
              </View>
            </View>
          )}
        </SafeAreaConsumer>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  buttonStyle: {
    height: 50,
    backgroundColor: '#f6f6f6',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    borderRadius: 0
  },
  defaultTitleStyle: {
    color: Colors.accentLimeDark
  },
  cancelTitleStyle: {
    color: '#2482bd',
    fontWeight: 'bold'
  }
});
