import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Image,
  SliderComponent,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { propsStack } from "./RootStackParams";
import { AppContext } from "../Context";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase_config";
import * as ImagePicker from "expo-image-picker";
import moment from "moment";

function NewPost() {
  const { user } = useContext(AppContext);
  const [question, setQuestion] = useState("");
  const [choice, setChoice] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [success, setSuccess] = useState(false);
  const [image, setImage] = useState<null | any>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [tags, setTags] = useState("");
  const [hasSpoiler, setHasSpoiler] = useState(false);

  const navigation = useNavigation<propsStack>();

  const questionType = ["Sim ou Não", "Enquete", "Escala de 0 a 10"];

  const clearMsg = () => {
    setSuccess(false);
  };

  const addImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === "granted") {
      let img = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      !img.cancelled && setImage(img);
    }
  };

  const addDoc = async (
    tags: string[],
    votes: {} | null,
    options: {} | null,
    scale: [] | null
  ) => {
    const id = Date.now().toString();
    const date = moment(new Date()).format("DD/MM/YYYY");

    if (image !== null) {
      await uploadImageAsync(image.uri);

      setDoc(doc(db, "questionsdb", id), {
        id,
        author: { name: user!.name, uid: user!.uid },
        question,
        media: imgUrl,
        votes,
        options,
        scale,
        tags,
        hasSpoiler,
        date,
      })
        .then(() => {
          setSuccess(true);
          setTimeout(clearMsg, 2000);
          setChoice("");
        })
        .catch((error) => console.log(error));

      return;
    } else
      setDoc(doc(db, "questionsdb", id), {
        id,
        author: { name: user!.name, uid: user!.uid },
        question,
        votes,
        options,
        scale,
        tags,
        hasSpoiler,
        date,
      })
        .then(() => {
          setSuccess(true);
          setTimeout(clearMsg, 2000);
          setChoice("");
        })
        .catch((error) => console.log(error));
  };

  const uploadImageAsync = async (uri: string) => {
    const id = Date.now().toString();
    const blob: Blob | any = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const imgRef = ref(storage, user?.uid + id);
    const result = await uploadBytes(imgRef, blob);

    blob.close();

    const url = await getDownloadURL(imgRef);
    try {
      setImgUrl(url);
    } catch (error) {
      console.log(error);
    }
  };

  const addQuestion = async () => {
    if (user && question && tags) {
      //Põe as tags num array
      const tagArr = tags.split(",");

      if (choice === "Sim ou Não") {
        const votes = { yes: [], no: [] };
        addDoc(tagArr, votes, null, null);
        return;
      }
      if (choice === "Enquete") {
        let allOptions = {};

        //Adiciona as opções do input
        options.forEach(
          (option) => (allOptions = { ...allOptions, [option]: [] })
        );
        addDoc(tagArr, null, allOptions, null);
      }
      if (choice === "Escala de 0 a 10") {
        addDoc(tagArr, null, null, []);
      }
    }
  };

  //Inputs para a enquete
  const OptionMap = () => {
    const addOption = () => {
      setOptions([...options, ""]);
    };

    const removeOption = () => {
      const newOption = options.slice();
      newOption.pop();
      setOptions(newOption);
    };
    return (
      <View>
        {options.map((item, index) => (
          <View key={index}>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <TextInput
                placeholder={"Opção" + (index + 1).toString()}
                value={item}
                maxLength={18}
                onChangeText={(text) => {
                  setOptions(
                    options.map((value, i) => (index === i ? text : value))
                  );
                }}
              ></TextInput>
              {options.length > 2 && index === options.length - 1 && (
                <TouchableOpacity onPress={removeOption}>
                  <Text>Remover</Text>
                </TouchableOpacity>
              )}
            </View>
            {index >= options.length - 1 && index < 3 && (
              <TouchableOpacity onPress={addOption}>
                <Text>Adicionar</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View>
      <Text>O que você quer perguntar?</Text>
      <TextInput
        placeholder="Escreva aqui"
        value={question}
        onChangeText={(text) => setQuestion(text)}
      ></TextInput>
      {image && (
        <Image
          style={{ width: 100, height: 100 }}
          source={{ uri: image.uri }}
        ></Image>
      )}
      <Text>Sua pergunta é do tipo</Text>
      {questionType.map((question, index) => (
        <TouchableOpacity
          onPress={() => setChoice(questionType[index])}
          style={{ padding: 10 }}
          key={index}
        >
          <Text>{question}</Text>
        </TouchableOpacity>
      ))}
      {choice === "Enquete" && OptionMap()}
      <Text onPress={() => setHasSpoiler(!hasSpoiler)}>
        Sua pergunta é um possível spoiler?
      </Text>
      {hasSpoiler ? <Text>Sim</Text> : <Text>Não</Text>}
      <Text>Tags</Text>
      <TextInput
        placeholder="Ex:'pessoal, curiosidade, super heróis, netflix'"
        value={tags}
        onChangeText={(text) => setTags(text)}
      ></TextInput>
      <Button onPress={addQuestion} title="Perguntar"></Button>
      <Button title="Imagem" onPress={addImage}></Button>
      {success && <Text>Postado!</Text>}
      <Button
        onPress={() => navigation.navigate("Login")}
        title="Login"
      ></Button>
      <Button onPress={() => navigation.navigate("Home")} title="Home"></Button>
    </View>
  );
}

export default NewPost;
