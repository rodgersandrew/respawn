import React from 'react';
import { View, Modal, Text, Dimensions, SafeAreaView } from 'react-native';
import Colors from '../constants/Colors';
import { Button } from 'react-native-elements';
import AutoTags from './posts/TagsAutoComplete';
import Games from '../constants/Games';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default class PostTagsModal extends React.Component {
  state = {
    modalVisible: false,
    suggestions: [{ name: 'LeagueOfLegends' }, { name: 'POE' }],
    tagsSelected: []
  };

  handleDelete = index => {
    let tagsSelected = this.state.tagsSelected;
    tagsSelected.splice(index, 1);
    this.setState({ tagsSelected });
  };

  handleAddition = suggestion => {
    this.setState({
      tagsSelected: this.state.tagsSelected.concat([suggestion])
    });
  };

  handleCustomTag = tag => {
    const strippedTag = tag.replace(/#/g, '');
    this.setState({
      tagsSelected: this.state.tagsSelected.concat([
        { name: `#${strippedTag.replace(/\s/g, '')}` }
      ])
    });
  };

  render() {
    return (
      <View>
        <Modal
          animationType='fade'
          transparent={true}
          visible={this.props.visible}>
          <SafeAreaView
            style={{ flex: 1, backgroundColor: Colors.bgPrimaryDark }}>
            <View
              style={{
                width: SCREEN_WIDTH,
                height: 50
              }}>
              <Button
                onPress={() => this.props.dismiss(this.state.tagsSelected)}
                buttonStyle={{ backgroundColor: 'rgba(0,0,0,0)' }}
                clear
                title='done'
                titleStyle={{
                  color: Colors.submit,
                  fontFamily: 'raleway-semi',
                  fontSize: 22
                }}
                containerStyle={{ alignSelf: 'flex-end', marginRight: 10 }}
              />
            </View>
            <AutoTags
              suggestions={Games}
              tagsSelected={this.state.tagsSelected}
              handleAddition={this.handleAddition}
              handleDelete={this.handleDelete}
              onCustomTagCreated={this.handleCustomTag}
              placeholder='Add post tags...'
            />
          </SafeAreaView>
        </Modal>
      </View>
    );
  }
}
