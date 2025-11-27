import { useState, useLayoutEffect, useEffect } from "react";
import {
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Text,
  View,
  RefreshControl,
} from "react-native";
import { Snackbar, IconButton } from "react-native-paper";

const API_KEY = "6f102c62f41998d151e5a1b48713cf13";
const IMAGES_PER_PAGE = 10;

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackText, setSnackText] = useState("");

  // Hamburger menu 
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <IconButton
          icon="menu"
          size={28}
          onPress={() => navigation.openDrawer()}
        />
      ),
      title: "Search",
    });
  }, [navigation]);

  // Fetch search results
  const fetchSearch = async (searchText, pageNum = 1) => {
    if (!searchText) return;

    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${API_KEY}&format=json&nojsoncallback=1&extras=url_s&per_page=${IMAGES_PER_PAGE}&text=${searchText}&page=${pageNum}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Network issue");

      const json = await res.json();
      const newImages = json.photos.photo.map((p) => p.url_s);

      if (pageNum === 1) {
        setImages(newImages);
      } else {
        setImages((prev) => [...prev, ...newImages]);
      }

      setPage(pageNum);
    } catch (error) {
      setSnackText("Search failed. Retry?");
      setSnackVisible(true);
      console.log("Search error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Start new search
  const startSearch = () => {
    setPage(1);
    fetchSearch(query, 1);
  };

  // Pagination
  const handleLoadMore = () => {
    if (!loadingMore && images.length > 0) {
      fetchSearch(query, page + 1);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Search Bar */}
      <TextInput
        placeholder="Search images..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={startSearch}
        style={{
          margin: 10,
          padding: 10,
          borderWidth: 1,
          borderRadius: 10,
        }}
      />

      {/* Loader like HomeScreen */}
      {loading && page === 1 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
          <Text>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
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
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ padding: 20 }}>
                <ActivityIndicator size="large" />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={loading && page === 1}
              onRefresh={() => fetchSearch(query, 1)}
            />
          }
        />
      )}

      {/* Snackbar Retry */}
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        action={{
          label: "Retry",
          onPress: () => fetchSearch(query, page),
        }}
      >
        {snackText}
      </Snackbar>
    </SafeAreaView>
  );
}
