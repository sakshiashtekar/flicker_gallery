import { View, FlatList, Image, ActivityIndicator, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { useEffect, useState, useLayoutEffect } from "react";
import { getData, saveData } from "../utils/storage";
import { Snackbar, IconButton } from "react-native-paper";

const API_KEY = "6f102c62f41998d151e5a1b48713cf13";
const CACHE_KEY = "flickr_recent";
const IMAGES_PER_PAGE = 10;

export default function HomeScreen({ navigation }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackText, setSnackText] = useState("");

  // Add Search button in header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="magnify"
          size={28}
          onPress={() => navigation.navigate("Search")}
        />
      ),
      title: "Home",
    });
  }, [navigation]);

  useEffect(() => {
    loadCachedImages();
    fetchImages(1);
  }, []);

  const loadCachedImages = async () => {
    try {
      const cached = await getData(CACHE_KEY);
      if (cached) setImages(cached);
    } catch (err) {
      console.log("Failed to load cached images:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const url = `https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=${API_KEY}&format=json&nojsoncallback=1&extras=url_s&per_page=${IMAGES_PER_PAGE}&page=${pageNum}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response not ok");
      const json = await res.json();
      const newImages = json.photos.photo.map((p) => p.url_s);

      if (pageNum === 1) {
        setImages(newImages);
        saveData(CACHE_KEY, newImages);
      } else {
        setImages((prev) => [...prev, ...newImages]);
      }

      setPage(pageNum);
    } catch (error) {
      setSnackText("Failed to load images. Retry?");
      setSnackVisible(true);
      console.log("Error fetching images:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchImages(page + 1);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {loading && page === 1 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
          <Text>Loading Images...</Text>
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
          ListFooterComponent={
            loadingMore ? (
              <View style={{ padding: 20 }}>
                <ActivityIndicator size="large" />
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleLoadMore}
                style={{
                  margin: 20,
                  padding: 15,
                  backgroundColor: "blue",
                  alignItems: "center",
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Load More</Text>
              </TouchableOpacity>
            )
          }
          refreshing={loading}
          onRefresh={() => fetchImages(1)}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        action={{
          label: "Retry",
          onPress: () => fetchImages(page),
        }}
      >
        {snackText}
      </Snackbar>
    </SafeAreaView>
  );
}
