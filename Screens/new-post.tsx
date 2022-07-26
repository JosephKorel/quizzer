import React, { useContext, useState } from "react";
import {
  Button,
  Image,
  StyleSheet,
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
import tailwind from "twrnc";
import { BottomNav } from "../Components/bottom_nav";
import { MaterialIcons } from "@expo/vector-icons";
import { IconButton } from "native-base";

function NewPost() {
  const { user, light, setLight } = useContext(AppContext);
  const [question, setQuestion] = useState("");
  const [choice, setChoice] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [success, setSuccess] = useState(false);
  const [image, setImage] = useState<null | any>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [tags, setTags] = useState("");
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [scaleLabel, setScaleLabel] = useState(["Meh", "Cool", "Awesome"]);

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
    await uploadBytes(imgRef, blob);

    blob.close();

    const url = await getDownloadURL(imgRef);
    try {
      setImgUrl(url);
    } catch (error) {
      console.log(error);
    }
  };

  const addDoc = async (
    tags: string[],
    votes: {} | null,
    options: {} | null,
    scale: [] | null,
    labels: string[] | null
  ) => {
    const id = Date.now().toString();
    const date = moment(new Date()).format("DD/MM/YYYY");

    if (image !== null) {
      try {
        await uploadImageAsync(image.uri);

        await setDoc(doc(db, "questionsdb", id), {
          id,
          author: { name: user!.name, uid: user!.uid, avatar: user?.avatar },
          question,
          media: imgUrl,
          votes,
          options,
          scale,
          labels,
          tags,
          hasSpoiler,
          hasVoted: [],
          views: 0,
          date,
        });

        setSuccess(true);
        setTimeout(clearMsg, 2000);
        setChoice("");
      } catch (error) {
        console.log(error);
        return null;
      }
    } else
      try {
        await setDoc(doc(db, "questionsdb", id), {
          id,
          author: { name: user!.name, uid: user!.uid, avatar: user?.avatar },
          question,
          votes,
          options,
          scale,
          labels,
          tags,
          hasSpoiler,
          hasVoted: [],
          views: 0,
          date,
        });
        setSuccess(true);
        setTimeout(clearMsg, 2000);
        setChoice("");
      } catch (error) {
        console.log(error);
        return null;
      }
  };

  const addQuestion = async () => {
    if (user && question && tags) {
      //Põe as tags num array
      const inputTags = tags.toLowerCase().split(",");
      const newTags: string[] = [];
      inputTags.forEach((tag) => {
        newTags.push(tag.trim());
      });

      if (choice === "Sim ou Não") {
        const votes = { yes: [], no: [] };
        addDoc(newTags, votes, null, null, null);
        return;
      }
      if (choice === "Enquete") {
        let allOptions = {};

        //Adiciona as opções do input
        options.forEach(
          (option) => (allOptions = { ...allOptions, [option]: [] })
        );
        addDoc(newTags, null, allOptions, null, null);
      }
      if (choice === "Escala de 0 a 10") {
        addDoc(newTags, null, null, [], scaleLabel);
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

  const ScaleLabel = (): JSX.Element => {
    return (
      <View
        style={tailwind`flex flex-row bg-blue-300 justify-between text-xl italic`}
      >
        {scaleLabel.map((label, i) => (
          <TextInput
            style={tailwind`border-2 border-blue-500 pr-5`}
            maxLength={8}
            key={i}
            value={label}
            onChangeText={(text) =>
              setScaleLabel(
                scaleLabel.map((item, index) => (index === i ? text : item))
              )
            }
          />
        ))}
      </View>
    );
  };

  const PostStyles = StyleSheet.create({
    main: {
      transform: [{ translateY: -5 }],
    },
    translate: {
      transform: [{ translateX: 4 }, { translateY: -4 }],
    },
  });

  return (
    <View
      style={tailwind.style(
        light ? "bg-red-200" : "bg-[#0d0f47]",
        "w-full",
        "h-full"
      )}
    >
      <View style={tailwind`w-11/12 mx-auto`}>
        <View style={tailwind`absolute top-10`}>
          {!light ? (
            <MaterialIcons
              name="wb-sunny"
              size={24}
              color="#F72585"
              onPress={() => setLight(true)}
            />
          ) : (
            <MaterialIcons
              name="nightlight-round"
              size={24}
              color="#0d0f47"
              onPress={() => setLight(false)}
            />
          )}
        </View>
        <View style={{ transform: [{ translateY: 100 }] }}>
          <View
            style={tailwind.style(
              "border-l-8 border-b-8 rounded-md",
              "bg-[#fdc500]"
            )}
          >
            <Text
              style={tailwind.style(
                "text-2xl",
                "italic",
                "p-4",
                "bg-[#f72585]",
                "text-slate-50",
                "text-center ",
                "font-bold",
                PostStyles.translate
              )}
            >
              Qual é a dúvida de hoje?
            </Text>
          </View>

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
          {choice === "Escala de 0 a 10" && ScaleLabel()}
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
          <Button
            onPress={() => navigation.navigate("Home")}
            title="Home"
          ></Button>
        </View>
      </View>
      <BottomNav />
    </View>
  );
}

export default NewPost;
