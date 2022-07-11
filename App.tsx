import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./Screens/login";
import { RootStackParamList } from "./Screens/RootStackPrams";
import NewPost from "./Screens/new-post";
import { AppContextProvider } from "./Context";
import Home from "./Screens/home";

const { Navigator, Screen } = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AppContextProvider>
      <NavigationContainer>
        <Navigator initialRouteName="NewPost">
          <Screen name="Login" component={Login}></Screen>
          <Screen name="Home" component={Home}></Screen>
          <Screen name="NewPost" component={NewPost}></Screen>
        </Navigator>
      </NavigationContainer>
    </AppContextProvider>
  );
}
