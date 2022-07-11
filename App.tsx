import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./Screens/login";

const { Navigator, Screen } = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Navigator initialRouteName="Login">
        <Screen name="Login" component={Login}></Screen>
      </Navigator>
    </NavigationContainer>
  );
}
