import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebase_config";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Slider } from "@miblanchard/react-native-slider";
import { AppContext, Questions } from "../Context";
import tailwind from "twrnc";
import {
  AlertDialog,
  Box,
  Button,
  Center,
  FormControl,
  Icon,
  IconButton,
  Input,
  Modal,
  PresenceTransition,
  TextArea,
  Toast,
  useToast,
} from "native-base";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { propsStack } from "../Screens/RootStackParams";

interface QuestionModal {
  props: {
    showModal: boolean;
    setShowModal: (e: boolean) => void;
  };
  question: Questions;
}

export const QuestionModal = ({ props, question }: QuestionModal) => {
  const { showModal, setShowModal } = props;

  const ModalStyle = StyleSheet.create({
    main: {
      transform: [{ translateY: -5 }],
    },
    translate: {
      transform: [{ translateX: 4 }, { translateY: -4 }],
    },
    smallTranslate: {
      transform: [{ translateX: 2 }, { translateY: -2 }],
    },
    xsTranslate: {
      transform: [{ translateX: 1 }, { translateY: -1 }],
    },
  });

  const YesNoButtons = (): JSX.Element => {
    return (
      <View style={tailwind`flex-row justify-around items-center`}>
        <View style={tailwind``}>
          <TouchableOpacity style={tailwind.style("bg-stone-900")}>
            <Text
              style={tailwind.style(
                "text-slate-50 bg-[#F72585] font-bold p-1 px-2 text-2xl",
                ModalStyle.translate
              )}
            >
              SIM {question.votes?.yes.length}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={tailwind``}>
          <TouchableOpacity style={tailwind.style("bg-stone-900")}>
            <Text
              style={tailwind.style(
                "text-slate-50 bg-[#F72585] p-1 px-2 font-bold text-2xl",
                ModalStyle.translate
              )}
            >
              NÃO {question.votes?.no.length}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ScaleComponent = () => {
    const custom = (value: number | Array<number>) => {
      const labels = question.labels!;

      if (value < 2)
        return (
          <Text style={tailwind`italic text-lg text-slate-50`}>
            {labels[0]}
          </Text>
        );
      if (value < 6)
        return (
          <Text style={tailwind`italic text-lg text-slate-50`}>
            {labels[1]}
          </Text>
        );
      if (value > 6)
        return (
          <View style={tailwind`flex-col justify-center items-center`}>
            <Text
              style={tailwind`absolute text-lg italic text-stone-800 font-bold`}
            >
              {labels[2]}
            </Text>
            <Text
              style={tailwind.style(
                "text-lg italic text-[#F72585] font-bold",
                ModalStyle.xsTranslate
              )}
            >
              {labels[2]}
            </Text>
          </View>
        );
    };
    let totalValues: number[] = [];

    question.scale?.forEach((item) => totalValues.push(item.value));

    const valueSum = totalValues.reduce((acc, curr) => {
      acc += curr;
      return acc;
    }, 0);

    const averageAnswer: number = valueSum / totalValues.length;

    return (
      <View style={tailwind`mt-4 flex-col justify-between`}>
        <Slider
          minimumTrackTintColor="#F72585"
          thumbTintColor="#F72585"
          minimumValue={0}
          disabled={true}
          maximumValue={10}
          value={averageAnswer}
          renderAboveThumbComponent={() => custom(averageAnswer)}
        ></Slider>
        <View style={tailwind`mt-4`}>
          <View style={tailwind`bg-stone-900`}>
            <TouchableOpacity style={tailwind.style("bg-stone-800")}>
              <Text
                style={tailwind.style(
                  "text-2xl italic bg-[#F72585] text-slate-100 font-bold",
                  ModalStyle.translate
                )}
              >
                RESPOSTA MÉDIA: {averageAnswer}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
      <Modal.Content
        size="lg"
        _light={{
          bg: "amber.300",
        }}
      >
        <Modal.CloseButton />
        <Modal.Body h="md">
          <View style={tailwind`h-full p-2 flex-col justify-center`}>
            <View style={tailwind`flex-col justify-center items-center`}>
              <Text
                style={tailwind`absolute text-4xl italic text-stone-800 font-bold`}
              >
                {question.question}
              </Text>
              <Text
                style={tailwind.style(
                  "text-4xl italic text-[#F72585] font-bold",
                  ModalStyle.smallTranslate
                )}
              >
                {question.question}
              </Text>
            </View>
            {question.media && (
              <View style={tailwind`flex-row justify-center`}>
                <Image
                  style={{ width: 300, height: 300, borderRadius: 2 }}
                  source={{ uri: question.media }}
                ></Image>
              </View>
            )}
            {question.votes && (
              <View style={tailwind`mt-2`}>
                <YesNoButtons />
              </View>
            )}
            {question.options && (
              <View style={tailwind`flex-col justify-center`}></View>
            )}
            {question.scale && <>{ScaleComponent()}</>}
          </View>
        </Modal.Body>
        <Modal.Footer bg="amber.300">
          <DeleteDialog />
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

const DeleteDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const onClose = () => setIsOpen(false);

  const cancelRef = React.useRef(null);
  return (
    <Center>
      <Button
        colorScheme="danger"
        onPress={() => setIsOpen(!isOpen)}
        rightIcon={<MaterialIcons name="delete" size={20} color="white" />}
      >
        Excluir
      </Button>
      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Excluir pergunta</AlertDialog.Header>
          <AlertDialog.Body>
            Tem certeza de que deseja excluir esta pergunta?
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={onClose}
                ref={cancelRef}
              >
                Cancelar
              </Button>
              <Button colorScheme="danger" onPress={onClose}>
                Confirmar
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Center>
  );
};

interface BottomNav {
  setTagSearch: (data: boolean) => void;
}

export const BottomNav = ({
  tagSearch,
  setTagSearch,
}: {
  tagSearch?: boolean;
  setTagSearch?: (data: boolean) => void;
}): JSX.Element => {
  const navigation = useNavigation<propsStack>();
  const route = useRoute();

  return (
    <View
      style={tailwind`absolute bottom-4 w-full flex-row justify-around items-center`}
    >
      <IconButton
        style={tailwind`rounded-full`}
        _pressed={{ bg: "#F845967" }}
        icon={
          route.name === "Home" ? (
            <MaterialIcons
              name="search"
              size={24}
              color="#F72585"
              onPress={() => setTagSearch && setTagSearch(!tagSearch)}
            />
          ) : (
            <MaterialCommunityIcons
              name="comment-question"
              size={24}
              color="#F72585"
              onPress={() => navigation.navigate("Home")}
            />
          )
        }
      />
      <IconButton
        style={tailwind`rounded-full`}
        _pressed={{ bg: "#F964A7" }}
        icon={
          <MaterialIcons
            name="add-box"
            size={24}
            color="#F72585"
            onPress={() => navigation.navigate("NewPost")}
          />
        }
      />
      <IconButton
        style={tailwind`rounded-full`}
        _pressed={{ bg: "#F964A7" }}
        icon={
          <MaterialIcons name="my-library-books" size={24} color="#F72585" />
        }
        onPress={() => navigation.navigate("MyQuestions")}
      />

      <IconButton
        style={tailwind`rounded-full`}
        _pressed={{ bg: "#F964A7" }}
        icon={
          <MaterialCommunityIcons
            name="guy-fawkes-mask"
            size={24}
            color="#F72585"
            onPress={() => navigation.navigate("Profile")}
          />
        }
      />
    </View>
  );
};
