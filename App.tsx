import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./Screens/login";
import { RootStackParamList } from "./Screens/RootStackParams";
import NewPost from "./Screens/new-post";
import { AppContextProvider } from "./Context";
import Home from "./Screens/home";
import Profile from "./Screens/profile";
import { NativeBaseProvider } from "native-base";
import tailwind, { useDeviceContext } from "twrnc";
import MyQuestions from "./Screens/my-questions";
import Gesture from "./Screens/gesture";

const { Navigator, Screen } = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useDeviceContext(tailwind);
  return (
    <AppContextProvider>
      <NativeBaseProvider>
        <NavigationContainer>
          <Navigator
            initialRouteName="Login"
            screenOptions={{ headerShown: false }}
          >
            <Screen name="Login" component={Login}></Screen>
            <Screen name="Home" component={Home}></Screen>
            <Screen name="NewPost" component={NewPost}></Screen>
            <Screen name="MyQuestions" component={MyQuestions}></Screen>
            <Screen name="Profile" component={Profile}></Screen>
            <Screen name="Gesture" component={Gesture}></Screen>
          </Navigator>
        </NavigationContainer>
      </NativeBaseProvider>
    </AppContextProvider>
  );
}
