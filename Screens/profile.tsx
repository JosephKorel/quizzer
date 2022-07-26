import React, { useContext, useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { AppContext, Questions } from "../Context";
import {
  collection,
  DocumentData,
  getDocs,
  query,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase_config";
import { Button } from "native-base";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { propsStack } from "./RootStackParams";
import { BottomNav } from "../Components/bottom_nav";

function Profile() {
  const { user } = useContext(AppContext);
  const [questions, setQuestions] = useState<Questions[] | null>(null);
  const [index, setIndex] = useState(0);

  const navigation = useNavigation<propsStack>();

  const retrieveCollection = async () => {
    //Array que recebe cada documento
    let questionDocs: Questions[] = [];

    //Query da coleção
    const questionCol = collection(db, "questionsdb");
    const colQuery = query(questionCol);
    const querySnapshot = await getDocs(colQuery);
    querySnapshot.forEach((doc: DocumentData) => questionDocs.push(doc.data()));

    //Filtra pelas perguntas feitas pelo usuário atual
    const myQuestions = questionDocs.filter(
      (item) => item.author.uid === user!.uid
    );

    setQuestions(myQuestions);
  };

  useEffect(() => {
    retrieveCollection();
  }, []);

  const logOut = () => {
    signOut(auth).then(() => {
      navigation.navigate("Login");
    });
  };

  const qstComponent = ({ item }: { item: Questions }) => {
    return questions ? (
      <View>
        <View>
          <Text>{item.question}</Text>
          {item.media && (
            <Image
              style={{ width: 100, height: 100 }}
              source={{ uri: item.media }}
            ></Image>
          )}
          <Text>Opções</Text>
          {item.votes && (
            <View>
              <TouchableOpacity>
                <Text>Sim:{item.votes?.yes.length}</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text>Não:{item.votes?.no.length}</Text>
              </TouchableOpacity>
            </View>
          )}
          {item.options && (
            <View>
              {Object.entries(item.options!).map(([key, value], i) => (
                <TouchableOpacity key={i}>
                  <Text>
                    {key}:{value.length}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {item.scale && <View></View>}
        </View>
        <View>
          {item.tags.map((tag, i) => (
            <Text key={i}>{tag}</Text>
          ))}
        </View>
      </View>
    ) : (
      <View></View>
    );
  };
  return (
    <View>
      <Image
        source={{ uri: user!.avatar! }}
        style={{ width: 100, height: 100 }}
      ></Image>
      <Text>{user!.name}</Text>
      <Button variant="subtle" onPress={logOut}>
        Sair
      </Button>
      <Text>Minhas perguntas</Text>
      {questions && (
        <FlatList data={questions} renderItem={qstComponent}></FlatList>
      )}
      <BottomNav />
    </View>
  );
}

export default Profile;