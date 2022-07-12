import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Login: undefined;
    NewPost:undefined;
    Register:undefined;
    Home:undefined
    };


export type propsStack = NativeStackNavigationProp<RootStackParamList>

