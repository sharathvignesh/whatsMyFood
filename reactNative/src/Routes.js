import React from 'react';
import {
  createStackNavigator,
  createBottomTabNavigator,
  createSwitchNavigator,
} from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Signin from './containers/Signin';
import Home from './containers/Home';
import Newentry from './containers/Newentry';
import Addfood from './containers/Addfood';
import Search from './containers/Search';
import Profile from './containers/Profile';
import Restaurant from './containers/Restaurant';

export const SignedOut = createStackNavigator({
  SignIn: {
    screen: Signin,
  },
});

export const SignedIn = createBottomTabNavigator(
  {
    Home: {
      screen: createStackNavigator({
        Home: { screen: Home },
        Restaurant: { screen: Restaurant },
      }),
      path: '',
    },
    Newentry: {
      screen: createStackNavigator({
        Newentry: { screen: Newentry },
        Addfood: { screen: Addfood },
      }),
      path: '',
    },
    Search: {
      screen: Search,
      path: '',
    },
    Profile: {
      screen: createStackNavigator({ Profile: { screen: Profile } }),
      path: '',
    },
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        if (routeName === 'Home') {
          iconName = `ios-home${focused ? '' : '-outline'}`;
        } else if (routeName === 'Newentry') {
          iconName = `md-add${focused ? '' : ''}`;
        } else if (routeName === 'Search') {
          iconName = `ios-search${focused ? '' : '-outline'}`;
        } else if (routeName === 'Profile') {
          iconName = `ios-contact${focused ? '' : '-outline'}`;
        }

        // You can return any component that you like here! We usually use an
        // icon component from react-native-vector-icons
        return <Ionicons name={iconName} size={25} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      showLabel: false,
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    },
    animationEnabled: false,
    swipeEnabled: false,
  },
);

export const createRootNavigator = (signedIn) => {
  console.log(signedIn);
  return createSwitchNavigator(
    {
      SignedIn: {
        screen: SignedIn,
        navigationOptions: {
          gesturesEnabled: false,
        },
      },
      SignedOut: {
        screen: SignedOut,
        navigationOptions: {
          gesturesEnabled: false,
        },
      },
    },
    {
      initialRouteName: signedIn ? 'SignedIn' : 'SignedOut',
    },
  );
};
