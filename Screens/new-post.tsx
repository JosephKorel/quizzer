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
  Box,
  Button,
  Icon,
  IconButton,
  Input,
  PresenceTransition,
  TextArea,
  Toast,
  useToast,
} from "native-base";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";

function NewPost() {
  const { user, light, setLight, question, setQuestion } =
    useContext(AppContext);
  const [choice, setChoice] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [image, setImage] = useState<null | any>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [tags, setTags] = useState("");
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [scaleLabel, setScaleLabel] = useState(["Meh", "Cool", "Awesome"]);
  const [hasChoosen, setHasChoosen] = useState(false);
  const [enq, setEnq] = useState(false);
  const [alert, setAlert] = useState("");
  const [success, setSuccess] = useState("");

  const questionType = ["Sim ou Não", "Enquete", "Escala de 0 a 10"];

  const navigation = useNavigation<propsStack>();
  const toast = useToast();

  useEffect(() => {
    if (success !== "") {
      toast.show({
        render: () => {
          return (
            <Box bg="emerald.500" px="2" py="1" rounded="sm" mb={5}>
              <Text>{success}</Text>
            </Box>
          );
        },
      });
    } else if (alert !== "") {
      toast.show({
        render: () => {
          return (
            <Box bg="red.500" px="2" py="1" rounded="sm" mb={5}>
              <Text style={tailwind`text-slate-100`}>{alert}</Text>
            </Box>
          );
        },
      });
    }

    setTimeout(() => {
      setAlert("");
      setSuccess("");
    }, 2000);
  }, [alert, success]);

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
      return url;
    } catch (error) {
      setAlert("Erro ao carregar imagem, tente novamente");
      return null;
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
        const url = await uploadImageAsync(image.uri);

        await setDoc(doc(db, "questionsdb", id), {
          id,
          author: { name: user!.name, uid: user!.uid, avatar: user?.avatar },
          question,
          media: url,
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

        setSuccess("Sucesso");

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
        setSuccess("Sucesso");

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
        <View style={tailwind`flex-col`}>
          {options.map((item, index) => (
            <View key={index}>
              <View style={tailwind`flex-row items-center mt-2`}>
                <Input
                  placeholder={"Opção" + (index + 1).toString()}
                  value={item}
                  w="5/6"
                  style={tailwind`bg-slate-100 text-stone-900`}
                  maxLength={18}
                  onChangeText={(text) => {
                    setOptions(
                      options.map((value, i) => (index === i ? text : value))
                    );
                  }}
                ></Input>
                {options.length > 2 && index === options.length - 1 && (
                  <IconButton
                    onPress={removeOption}
                    ml={4}
                    bg="#fad643"
                    _pressed={{ background: "#fdc500" }}
                    icon={
                      <MaterialIcons name="delete" size={24} color="black" />
                    }
                  />
                )}
              </View>
              {index >= options.length - 1 && index < 3 && (
                <TouchableOpacity
                  onPress={addOption}
                  style={tailwind`bg-[#F72585] self-start mt-2`}
                >
                  <Text
                    style={tailwind.style(
                      "text-base",
                      "italic",
                      "p-1",
                      "px-2",
                      "bg-[#fad643]",
                      "text-stone-900",
                      "font-bold",
                      PostStyles.smallTranslate
                    )}
                  >
                    Adicionar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
        <View style={tailwind`flex-row-reverse`}>
          <Button
            style={tailwind`w-1/4 mt-2`}
            _text={{ color: "black" }}
            bg="#fad643"
            _pressed={{ background: "#fdc500" }}
            leftIcon={
              <MaterialIcons name="arrow-back-ios" size={20} color="black" />
            }
            onPress={() => {
              setChoice("");
              setEnq(false);
            }}
          >
            Voltar
          </Button>
        </View>
      </View>
    );
  };

  const ScaleLabel = (): JSX.Element => {
    const icons: JSX.Element[] = [
      <MaterialIcons name="thumb-down" size={24} color="#F72585" />,
      <MaterialIcons name="thumb-up" size={24} color="#F72585" />,
      <MaterialIcons name="auto-awesome" size={24} color="#F72585" />,
    ];
    return (
      <View>
        <PresenceTransition
          visible={hasChoosen}
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
          <View style={tailwind`bg-[#F72585] mb-2`}>
            <Text
              style={tailwind.style(
                "text-2xl",
                "italic",
                "text-center",
                "bg-[#fad643]",
                "text-stone-800",
                "font-bold",
                PostStyles.smallTranslate
              )}
            >
              Personalize as tags
            </Text>
          </View>
          <View style={tailwind`flex flex-row justify-between`}>
            {scaleLabel.map((label, i) => (
              <View style={tailwind`flex-col items-center w-1/4`} key={i}>
                <Input
                  style={tailwind`bg-slate-50`}
                  maxLength={8}
                  w="full"
                  mb={2}
                  key={i}
                  value={label}
                  onChangeText={(text) =>
                    setScaleLabel(
                      scaleLabel.map((item, index) =>
                        index === i ? text : item
                      )
                    )
                  }
                />
                {icons[i]}
              </View>
            ))}
          </View>
          <View style={tailwind`flex-row-reverse`}>
            <Button
              style={tailwind`w-1/4 mt-4`}
              _text={{ color: "black" }}
              bg="#fad643"
              _pressed={{ background: "#fdc500" }}
              leftIcon={
                <MaterialIcons name="arrow-back-ios" size={20} color="black" />
              }
              onPress={() => {
                setChoice("");
              }}
            >
              Voltar
            </Button>
          </View>
        </PresenceTransition>
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

  const QuestionTypeComponent = ({ qst }: { qst: string }): JSX.Element => {
    const onChoose = (qst: string): void | null => {
      if (question === "") {
        setAlert("Primeiro escreva sua pergunta");
        return null;
      }
      setChoice(qst);
    };
    return (
      <View style={tailwind`mt-4`}>
        <View style={tailwind`bg-[#F72585]`}>
          <TouchableOpacity
            onPress={() => onChoose(qst)}
            style={PostStyles.translate}
          >
            <Text
              style={tailwind.style(
                "text-2xl",
                "italic",
                "text-center",
                choice === qst ? "bg-[#4fea74]" : "bg-[#fad643]",
                choice === qst ? "text-slate-100" : "text-stone-800",
                "font-bold"
              )}
            >
              {qst}
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
              "border-l-8 border-b-8 rounded-lg",
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
              {hasChoosen ? question : "Qual é a dúvida de hoje?"}
            </Text>
          </View>
          {hasChoosen == true && choice !== "Sim ou Não" ? (
            <>
              {choice === "Enquete" && OptionMap()}
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
                  borderColor="#f72585"
                  color="black"
                  h="12"
                  value={question}
                  style={tailwind`bg-slate-100`}
                  onChangeText={(text) => setQuestion(text)}
                ></TextArea>

                {image ? (
                  <View style={tailwind.style("flex-row justify-center mt-1")}>
                    <Image
                      style={tailwind.style(
                        { width: 100, height: 100 },
                        "rounded-md border-2 border-[#F72585]"
                      )}
                      source={{ uri: image.uri }}
                    ></Image>
                    <IconButton
                      style={tailwind`absolute left-[53%]`}
                      onPress={() => setImage(null)}
                      _pressed={{ bg: "#edc531" }}
                      py={1}
                      size="sm"
                      icon={
                        <MaterialCommunityIcons
                          name="close-box-multiple"
                          size={24}
                          color="#fad643"
                        />
                      }
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={tailwind`bg-[#F72585] self-start mt-2`}
                    onPress={addImage}
                  >
                    <Text
                      style={tailwind.style(
                        "text-sm",
                        "italic",
                        "px-2",
                        "bg-[#fad643]",
                        "text-stone-900",
                        "font-bold",
                        PostStyles.smallTranslate
                      )}
                    >
                      IMAGEM{" "}
                      {
                        <MaterialCommunityIcons
                          name="upload"
                          size={18}
                          color="black"
                        />
                      }
                    </Text>
                  </TouchableOpacity>
                )}
                <View style={tailwind`bg-slate-100 w-2/3 mt-6`}>
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
                    <QuestionTypeComponent qst={question} key={index} />
                  ))}
                </View>
              </PresenceTransition>
            </>
          )}
          <View style={tailwind`bg-slate-50 self-start mt-2`}>
            <TouchableOpacity
              onPress={() => setHasSpoiler(!hasSpoiler)}
              style={tailwind.style(PostStyles.smallTranslate, "flex-row")}
            >
              <Text
                style={tailwind.style(
                  "text-base",
                  "px-2",
                  "italic",
                  "text-center",
                  hasSpoiler ? "bg-[#4fea74]" : "bg-[#e71d36]",
                  hasSpoiler ? "text-slate-100" : "text-slate-100",
                  "font-bold"
                )}
              >
                {hasSpoiler ? "Não contém spoiler  " : "Marcar como spoiler  "}
                {hasSpoiler ? (
                  <MaterialCommunityIcons
                    name="shield-off"
                    size={20}
                    color="white"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="shield"
                    size={20}
                    color="white"
                  />
                )}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={tailwind`self-start mt-6 bg-slate-100`}>
            <Text
              style={tailwind.style(
                "text-sm",
                "px-2",
                "italic",
                "text-center",
                "bg-[#c86bfa]",
                "text-slate-100",
                "font-bold",
                PostStyles.smallTranslate
              )}
            >
              TAGS{" "}
              {
                <MaterialCommunityIcons
                  name="tag-multiple"
                  size={18}
                  color="white"
                />
              }
            </Text>
          </View>
          <Input
            mt={1}
            borderColor="#f72585"
            placeholder="Ex: pessoal, curiosidade, super heróis, netflix"
            value={tags}
            color="black"
            style={tailwind`bg-slate-100`}
            onChangeText={(text) => setTags(text)}
          ></Input>
          <TouchableOpacity
            style={tailwind.style(
              "text-slate-100 bg-[#fad643] self-start mx-auto mt-10"
            )}
            onPress={addQuestion}
          >
            <Text
              style={tailwind.style(
                "text-slate-100 bg-[#f72585] font-bold text-3xl italic px-2",
                PostStyles.translate
              )}
            >
              ENVIAR {<FontAwesome name="send-o" size={24} color="white" />}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <BottomNav />
    </View>
  );
}

export default NewPost;
