import React, { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
import {
  Button,
  IconButton,
  Input,
  PresenceTransition,
  TextArea,
} from "native-base";

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
  const [hasChoosen, setHasChoosen] = useState(false);
  const [enq, setEnq] = useState(false);

  const questionType = ["Sim ou Não", "Enquete", "Escala de 0 a 10"];

  const clearMsg = () => {
    setSuccess(false);
  };

  useEffect(() => {
    choice === "" || choice === "Sim ou Não"
      ? setHasChoosen(false)
      : setHasChoosen(true);
  }, [choice]);

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
        <View style={tailwind`bg-slate-100 mb-1 bg-[#F72585]`}>
          <Text
            style={tailwind.style(
              "text-lg",
              "italic",
              "py-1",
              "bg-[#4fea74]",
              "text-slate-50",
              "text-center",
              "font-bold",
              PostStyles.smallTranslate
            )}
          >
            ENQUETE
          </Text>
        </View>
        <View style={tailwind`flex-row justify-around`}>
          {options.map((item, index) => (
            <View key={index}>
              <View style={tailwind`flex-row justify-around items-center mt-2`}>
                <Input
                  placeholder={"Opção" + (index + 1).toString()}
                  value={item}
                  w="1/2"
                  style={tailwind`bg-slate-100 text-stone-900`}
                  maxLength={18}
                  onChangeText={(text) => {
                    setOptions(
                      options.map((value, i) => (index === i ? text : value))
                    );
                  }}
                ></Input>
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
        <View style={tailwind`flex-row-reverse`}>
          <Button
            style={tailwind`w-1/4 relative`}
            bg="#c86bfa"
            _pressed={{ background: "#5c0099" }}
            leftIcon={
              <MaterialIcons name="arrow-back-ios" size={20} color="white" />
            }
            onPress={() => setChoice("")}
          >
            Voltar
          </Button>
        </View>
      </View>
    );
  };

  const ScaleLabel = (): JSX.Element => {
    return (
      <View
        style={tailwind`flex flex-row bg-blue-300 justify-between text-xl italic`}
      >
        {scaleLabel.map((label, i) => (
          <Input
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
    smallTranslate: {
      transform: [{ translateX: 2 }, { translateY: -2 }],
    },
  });

  const QuestionTypeComponent = ({
    question,
    index,
  }: {
    question: string;
    index: number;
  }): JSX.Element => {
    return (
      <View style={tailwind`mt-4`}>
        <View style={tailwind`bg-[#F72585]`}>
          <TouchableOpacity
            onPress={() => {
              setChoice(question);
              question === "Enquete" && setEnq(true);
            }}
            style={PostStyles.translate}
          >
            <Text
              style={tailwind.style(
                "text-2xl",
                "italic",
                "text-center",
                choice === question ? "bg-[#4fea74]" : "bg-[#fad643]",
                choice === question ? "text-slate-100" : "text-stone-800",
                "font-bold"
              )}
            >
              {question}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
              "bg-[#fdc500]",
              "mb-5"
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
          {hasChoosen == true && choice !== "Sim ou Não" ? (
            <>
              {choice === "Enquete" && (
                <PresenceTransition
                  visible={enq}
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                    transition: {
                      duration: 350,
                    },
                  }}
                >
                  {OptionMap()}
                </PresenceTransition>
              )}
              {choice === "Escala de 0 a 10" && ScaleLabel()}
            </>
          ) : (
            <>
              <PresenceTransition
                visible={!hasChoosen}
                initial={{
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 150,
                  },
                }}
              >
                <TextArea
                  autoCompleteType={true}
                  placeholder="Escreva aqui"
                  color="black"
                  h="12"
                  value={question}
                  style={tailwind`bg-slate-100`}
                  onChangeText={(text) => setQuestion(text)}
                ></TextArea>

                {image && (
                  <Image
                    style={{ width: 100, height: 100 }}
                    source={{ uri: image.uri }}
                  ></Image>
                )}
                <View style={tailwind`bg-slate-100 w-2/3 my-4 mt-6`}>
                  <Text
                    style={tailwind.style(
                      "text-xl",
                      "italic",
                      "p-2",
                      "bg-[#c86bfa]",
                      "text-slate-50",
                      "font-bold",
                      PostStyles.translate
                    )}
                  >
                    Sua pergunta é do tipo
                  </Text>
                </View>
                <View style={tailwind``}>
                  {questionType.map((question, index) => (
                    <QuestionTypeComponent
                      question={question}
                      index={index}
                      key={index}
                    />
                  ))}
                </View>
              </PresenceTransition>
            </>
          )}
          <Text onPress={() => setHasSpoiler(!hasSpoiler)}>
            Sua pergunta é um possível spoiler?
          </Text>
          {hasSpoiler ? <Text>Sim</Text> : <Text>Não</Text>}
          <Text>Tags</Text>
          <Input
            placeholder="Ex:'pessoal, curiosidade, super heróis, netflix'"
            value={tags}
            onChangeText={(text) => setTags(text)}
          ></Input>
          <Button onPress={addQuestion}>Perguntar</Button>
          <Button onPress={addImage}>Imagem</Button>
          {success && <Text>Postado!</Text>}
        </View>
      </View>
      <BottomNav />
    </View>
  );
}

export default NewPost;
