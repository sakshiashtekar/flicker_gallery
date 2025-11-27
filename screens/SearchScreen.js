import { useState, useLayoutEffect } from "react";
import { TextInput, FlatList, Image, ActivityIndicator, SafeAreaView, RefreshControl, TouchableOpacity, Text } from "react-native";
import { Snackbar, IconButton } from "react-native-paper";

const API_KEY = "6f102c62f41998d151e5a1b48713cf13";

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackText, setSnackText] = useState("");

  // Add Hamburger menu button in header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <IconButton
          icon="menu"
          size={28}
          onPress={() => navigation.openDrawer()}
        />
      ),
      title: "Search Images",
    });
  }, [navigation]);

  const fetchSearch = async (searchText) => {
    if (!searchText) return;
    setLoading(true);
    setRefreshing(true);

    try {
      const res = await fetch(
        `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${API_KEY}&format=json&nojsoncallback=1&extras=url_s&text=${searchText}`
      );

      if (!res.ok) throw new Error("Network response not ok");

      const json = await res.json();
      const newImages = json.photos.photo.map((p) => p.url_s);
      setImages(newImages);
    } catch (error) {
      setSnackText("Search failed. Retry?");
      setSnackVisible(true);
      console.log("Search failed:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => fetchSearch(query);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TextInput
        placeholder="Search images..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => fetchSearch(query)}
        style={{
          margin: 10,
          padding: 10,
          borderWidth: 1,
          borderRadius: 10,
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={images}
          numColumns={2}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{
                width: "48%",
                height: 180,
                margin: "1%",
                borderRadius: 10,
              }}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        action={{
          label: "Retry",
          onPress: () => fetchSearch(query),
        }}
      >
        {snackText}
      </Snackbar>
    </SafeAreaView>
  );
}
