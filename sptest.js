import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PanResponder,
  Animated,
  TextInput
} from 'react-native';
export class SpaceTestComponent extends React.Component {

  render() {
    return (
      <View style={SpaceStyles.testView}>
        <Text>This is a test</Text>
      </View>
    )
  }
};
