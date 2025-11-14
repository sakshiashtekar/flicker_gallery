import { useEffect, useState } from "react";
import { 
  View, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  Text, 
  RefreshControl,
  SafeAreaView
} from "react-native";
import { getData, saveData } from "../utils/storage";

export default function HomeScreen() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 
  const CACHE_KEY = "flickr_recent";

  useEffect(() => {
    loadCachedImages();
    fetchImages();
  }, []);

  const loadCachedImages = async () => {
    const cached = await getData(CACHE_KEY);
    if (cached) setImages(cached);
    setLoading(false);
  };

  const fetchImages = async () => {
    try {
      const res = await fetch(
        "https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&per_page=20&page=1&api_key=6f102c62f41998d151e5a1b48713cf13&format=json&nojsoncallback=1&extras=url_s"
      );

      const json = await res.json();
      const newImages = json.photos.photo.map((p) => p.url_s);

      const oldImages = await getData(CACHE_KEY);

      if (JSON.stringify(oldImages) !== JSON.stringify(newImages)) {
        saveData(CACHE_KEY, newImages);
        setImages(newImages);
      }
    } catch (error) {
      console.log("Offline or API error:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchImages();
    setRefreshing(false);
  };

  if (loading && images.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading Images...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
    </SafeAreaView>
  );
}
