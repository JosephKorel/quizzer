import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Login: undefined;
    Home:undefined;
    NewPost:undefined;
    Enquete:undefined;
    Profile:undefined;
    };


export type propsStack = NativeStackNavigationProp<RootStackParamList>

