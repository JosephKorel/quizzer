import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Login: undefined;
    Home:undefined;
    NewPost:undefined;
    MyQuestions:undefined;
    Profile:undefined;
    Search:undefined;
    UsersProfile:{
       name:string
       userUid:string
       avatar:string;
    }
};

export type propsStack = NativeStackNavigationProp<RootStackParamList>

