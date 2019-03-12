import React, { Component } from 'react';
// eslint-disable-next-line object-curly-newline
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  StatusBar,
  NetInfo,
  Alert,
  TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import { NavigationActions } from 'react-navigation';
import { heightPercentageToDP, widthPercentageToDP } from '../lib/Responsive';
import RF from '../../node_modules/react-native-responsive-fontsize';
import OfflineNotice from '../components/Nointernet';

const styles = StyleSheet.create({
  container: {
    height: heightPercentageToDP('100%'),
    backgroundColor: 'white',
  },
  messageInputContainer: {
    borderColor: '#ff4444',
    borderBottomWidth: 1,
    paddingBottom: heightPercentageToDP('1%'),
    marginLeft: widthPercentageToDP('4%'),
    width: widthPercentageToDP('92%'),
    marginTop: heightPercentageToDP('4%'),
  },
  reportInput: {
    color: '#222',
    fontFamily: 'SFProText-Light',
    fontSize: RF(2.5),
    letterSpacing: 0.41,
    paddingLeft: widthPercentageToDP('1%'),
  },
  disclaimerContainer: {
    marginLeft: widthPercentageToDP('4%'),
    width: widthPercentageToDP('92%'),
    marginTop: heightPercentageToDP('1.5%'),
  },
  disclaimer: {
    fontSize: RF(1.8),
    fontFamily: 'SFProText-Light',
    color: '#666',
    letterSpacing: 0.41,
  },
});

export default class Feedback extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: 'Your feedback',
    headerStyle: {
      backgroundColor: 'rgb(248, 248, 248)',
    },
    headerRight: (
      <TouchableOpacity
        onPress={() => {
          const { firebaseID, emailID, displayName } = navigation.state.params.user;
          const { reportMessage } = navigation.state.params;
          // When nothing is typed in the feedback input, reportMessage is undefined
          if (reportMessage === undefined || (reportMessage.length === 0)) {
            Alert.alert('Feedback message cannot be empty');
          } else {
            const feedbackReqJson = {
              firebaseID,
              emailID,
              userName: displayName,
              feedback: reportMessage,
            };
            fetch('https://us-central1-whatsmyfood.cloudfunctions.net/addFeedbackAndSendNotificationToTelegram', {
              method: 'POST',
              body: JSON.stringify(feedbackReqJson),
            })
              .then((sendFeedbackResponse) => {
                if (sendFeedbackResponse.status === 200) {
                  Alert.alert('Thank you for your feedback', null, [{ text: 'OK', onPress: () => navigation.pop() }]);
                  return null;
                }
                throw new Error({ message: 'Error encountered while sending feedback.' });
              })
              .catch(err => console.log(`Error encountered while sending feedback.${JSON.stringify(err)}`));
          }
        }}
      >
        <Ionicons
          style={{ paddingRight: widthPercentageToDP('5%') }}
          name="ios-checkmark"
          size={60}
          color="#ff4444"
        />
      </TouchableOpacity>
    ),
    headerLeft: (
      <TouchableOpacity
        onPress={() => {
          navigation.dispatch(NavigationActions.back());
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons
            style={{ paddingLeft: widthPercentageToDP('5%') }}
            name="ios-close"
            size={50}
            color="#222"
          />
        </View>

      </TouchableOpacity>
    ),
  });

  state = {
    isConnected: true,
    reportMessage: '',
  };

  componentDidMount = () => {
    const { navigation } = this.props;
    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this.handleConnectivityChange,
    );
    /* eslint no-underscore-dangle: */
    this._navListener = navigation.addListener('didFocus', () => {
      StatusBar.setBarStyle('dark-content');
    });
  };

  handleConnectivityChange = isConnected => {
    if (isConnected) {
      this.setState({ isConnected });
    } else {
      this.setState({ isConnected });
    }
  };

  handleInput = (KeyWord) => {
    const { navigation } = this.props;
    this.setState({ reportMessage: KeyWord });
    navigation.setParams({
      reportMessage: KeyWord,
    });
  };

  render() {
    const { isConnected, reportMessage } = this.state;
    return (
      <View style={styles.container}>
        {!isConnected ? <OfflineNotice /> : null}
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.reportInput}
            placeholder="Briefly explain what happened"
            placeholderTextColor="rgba(0,0,0, 0.7)"
            onChangeText={this.handleInput}
            value={reportMessage}
            selectionColor="#777"
            numberOfLines={4}
            multiline
          />
        </View>
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimer}>
          Please only leave feedback about WhatsMyFood and our features.
          All reports are subject to our Terms of Use.
          </Text>
        </View>

      </View>
    );
  }
}

Feedback.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};
