import React from "react";
import { Animated } from "react-native";

export default class DynamicListRow extends React.Component {
  // these values will need to be fixed either within the component or sent through props
  _defaultHeightValue = 82;
  _defaultTransition = 700;
  state = {
    _rowHeight: new Animated.Value(this._defaultHeightValue),
    _rowOpacity: new Animated.Value(0)
  };
  componentDidMount() {
    Animated.timing(this.state._rowOpacity, {
      toValue: 1,
      duration: this._defaultTransition,
      delay: 200
    }).start();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.remove) {
      this.onRemoving(nextProps.onRemoving);
    } else {
      // we need this for iOS because iOS does not reset list row style properties
      this.resetHeight();
    }
  }
  onRemoving(callback) {
    Animated.timing(this.state._rowHeight, {
      toValue: 0,
      duration: 300
    }).start(callback);

    Animated.timing(this.state._rowOpacity, {
      toValue: 0,
      duration: 300
    }).start();
  }

  resetHeight() {
    Animated.timing(this.state._rowHeight, {
      toValue: this._defaultHeightValue,
      duration: 0
    }).start();
  }

  render() {
    return (
      <Animated.View
        style={{
          height: this.state._rowHeight,
          opacity: this.state._rowOpacity
        }}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}
