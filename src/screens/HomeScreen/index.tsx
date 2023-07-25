import React, { useEffect } from "react";
import { Dimensions, ImageBackground } from "react-native";
import {
  VStack,
  Image,
  Text,
  Button,
  PresenceTransition,
  useTheme,
} from "native-base";
import { BarCodeScanner } from "expo-barcode-scanner";
import { ModalSenha } from "./components/Modal";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface IUser {
  cnpj: string;
  idapae: string;
  idusuario: string;
  login: string;
  senha: string;
}

export const HomeScreen = () => {
  const [visibleCamera, setVisibleCamera] = React.useState(false);
  const [visibleModal, setVisibleModal] = React.useState(false);
  const [visibleToken, setVisibleToken] = React.useState(false);
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(
    null
  );
  const [tokenText, setTokenText] = React.useState("");
  const [timerToken, setTimerToken] = React.useState(0);
  const [scanned, setScanned] = React.useState(true);

  const [user, setUser] = React.useState<IUser>();

  const { colors } = useTheme();

  const HandleOpenCamera = async () => {
    setVisibleCamera(true);
    setScanned(false);
  };

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: any;
    data: any;
  }) => {
    setScanned(true);
    setVisibleCamera(false);

    const auxData = JSON.parse(String(data).replaceAll("'", '"'));

    if (auxData.cnpj) {
      setVisibleModal(true);
      setUser(auxData);
    } else {
      alert("QRCode inválido");
    }
  };

  function sumIndividualDigits(str: string) {
    const digitsArray = str.split("");

    const sum = digitsArray.reduce((acc, digit) => acc + parseInt(digit), 0);

    return sum;
  }

  function calculateFormula(A1: number, B2: number) {
    const currentDate = new Date();

    const C2 = currentDate.getDate();
    const D2 = currentDate.getMonth() + 1; // Meses em JavaScript são baseados em 0, adicionamos 1 para obter o valor correto
    const E2 = currentDate.getFullYear();
    const F2 = currentDate.getHours();
    const G2 = currentDate.getMinutes();

    // Calcular o resultado da fórmula
    const result = A1 + B2 + C2 + D2 + E2 + F2 + G2 * C2;

    return result;
  }

  const onSubmitedModal = React.useCallback(
    async (user: IUser) => {
      setVisibleModal(false);
      setVisibleToken(true);

      const idUsuario = sumIndividualDigits(user?.idusuario ?? "");
      const finalToken = calculateFormula(
        Number(user?.idusuario),
        Number(user?.idapae)
      );
      setTokenText(`${idUsuario}${finalToken}`);
      function adjustValue(currentSecond: any) {
        return (100 * currentSecond) / 60;
      }

      // Função para atualizar e exibir o valor ajustado a cada segundo
      function updateAdjustedValue() {
        const currentPosition = new Date().getSeconds();
        const adjustedValue = adjustValue(currentPosition);
        setTimerToken(adjustedValue);
        if (currentPosition == 0) {
          const idUsuario = sumIndividualDigits(user?.idusuario ?? "");
          const finalToken = calculateFormula(
            Number(user?.idusuario),
            Number(user?.idapae)
          );
          setTokenText(`${idUsuario}${finalToken}`);
        }
      }

      setInterval(updateAdjustedValue, 1000);
    },
    [user]
  );

  React.useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await AsyncStorage.getItem("@user");
      if (res) {
        setUser(JSON.parse(res) as IUser);
        onSubmitedModal(JSON.parse(res) as IUser);
      }
    })();
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      resizeMode="cover"
      style={{ flex: 1}}
    >
      <VStack
        flex={1}
        h={"full"}
        width={"full"}
        p={10}
        background={"transparent"}
        alignItems={"center"}
      >
        {visibleModal && (
          <ModalSenha
            visible={visibleModal}
            user={user ?? ({} as IUser)}
            onClose={() => {
              setVisibleModal(false);
            }}
            onSubmit={async () => {
              await AsyncStorage.setItem("@user", JSON.stringify(user));
              onSubmitedModal(user as IUser);
            }}
          />
        )}

        <PresenceTransition
          visible={visibleCamera || visibleToken}
          initial={{
            scale: 1,
            translateY: 0,
          }}
          animate={{
            scale: 0.5,
            translateY: -50,
            transition: {
              duration: 250,
            },
          }}
        >
          <Image
            mb={10}
            alt="Logo"
            source={require("../../assets/logo.png")}
            w={200}
            height={200}
            borderRadius={10}
            resizeMode="contain"
          />
        </PresenceTransition>
        {visibleToken && (
          <AnimatedCircularProgress
            size={200}
            width={5}
            rotation={0}
            fill={timerToken}
            tintColor={colors.blue[500]}
            backgroundColor="#8c96a0"
          >
            {(fill) => (
              <Text fontSize={"4xl"} color={"blue.500"}>
                {tokenText}
              </Text>
            )}
          </AnimatedCircularProgress>
        )}
        {!visibleCamera && !visibleToken && (
          <Button
            backgroundColor={"transparent"}
            borderWidth={1}
            borderColor={"blue.400"}
            w={"full"}
            onPress={() => HandleOpenCamera()}
          >
            <Text fontSize={"md"} color={"blue.500"}>
              Ler QrCode
            </Text>
          </Button>
        )}
        <PresenceTransition
          visible={visibleCamera && !visibleToken}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            transition: {
              duration: 250,
            },
          }}
        >
          <VStack alignItems={"center"} marginTop={-115}>
            <Text fontSize={"md"} color={"blue.500"}>
              Escaneie o QRCode
            </Text>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={{
                width: Dimensions.get("window").width,
                height: Dimensions.get("window").height / 1.85,
              }}
            />
            <Button
              backgroundColor={"red.400"}
              mt={1}
              borderWidth={1}
              borderColor={"red.400"}
              w={"1/2"}
              onPress={() => {
                setVisibleCamera(false);
                setScanned(false);
              }}
            >
              <Text fontSize={"md"} color={"white"}>
                Voltar
              </Text>
            </Button>
          </VStack>
        </PresenceTransition>

        <Image
          position={"absolute"}
          bottom={0}
          alt="Logo"
          source={require("../../assets/icon.png")}
          w={180}
          height={24}
          opacity={0.5}
          resizeMode="contain"
        />
        {/* <Logo /> */}
      </VStack>
    </ImageBackground>
  );
};
