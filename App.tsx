import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./Screens/login";
import { RootStackParamList } from "./Screens/RootStackParams";
import NewPost from "./Screens/new-post";
import { AppContextProvider } from "./Context";
import Home from "./Screens/home";
import Profile from "./Screens/profile";

const { Navigator, Screen } = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AppContextProvider>
      <NavigationContainer>
        <Navigator initialRouteName="Login">
          <Screen name="Login" component={Login}></Screen>
          <Screen name="Home" component={Home}></Screen>
          <Screen name="NewPost" component={NewPost}></Screen>
          <Screen name="Profile" component={Profile}></Screen>
        </Navigator>
      </NavigationContainer>
    </AppContextProvider>
  );
}
