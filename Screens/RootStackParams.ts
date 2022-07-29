import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Login: undefined;
    Home:undefined;
    NewPost:undefined;
    MyQuestions:undefined;
    Profile:undefined;
    Gesture:undefined
    };


export type propsStack = NativeStackNavigationProp<RootStackParamList>

