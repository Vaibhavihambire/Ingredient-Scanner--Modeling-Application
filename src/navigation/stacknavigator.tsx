import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Home from "../screens/home";
import Login from "../screens/login";
import Signup from "../screens/signup";
import Scan from "../screens/scan";
import Result from "../screens/result";
import UserProfile from '../screens/userProfile';
// Updated navigation param types
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  Scan: undefined;
  Result: {
    result: {
      risk_level: string;
      explanations: string[];
    };
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Scan" component={Scan} />
        <Stack.Screen name="Result" component={Result} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
