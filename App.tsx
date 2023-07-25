import { StatusBar } from "expo-status-bar";
import { NativeBaseProvider } from "native-base";
import { HomeScreen } from "./src/screens/HomeScreen";

export default function App() {
  return (
    <NativeBaseProvider>
      <StatusBar style="dark" />
      <HomeScreen />
    </NativeBaseProvider>
  );
}
