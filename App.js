import 'react-native-gesture-handler';
import 'react-native-reanimated'; // Required for drawer
import { NavigationContainer } from "@react-navigation/native";
import DrawerNavigation from "./navigation/DrawerNavigation";
import { Provider as PaperProvider } from "react-native-paper";

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <DrawerNavigation />
      </NavigationContainer>
    </PaperProvider>
  );
}
