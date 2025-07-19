import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function DiaryDetail({ route }) {
  const { diary } = route.params;
  const photos = diary.photoURLs || (diary.photoURL ? [diary.photoURL] : []);
  const [currentIdx, setCurrentIdx] = useState(0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>今日之美</Text>
      {Array.isArray(diary.gratitude)
        ? diary.gratitude.filter(Boolean).map((g, i) => <Text key={i} style={styles.text}>• {g}</Text>)
        : <Text style={styles.text}>{diary.gratitude}</Text>}
      <Text style={[styles.text, { marginTop: 10 }]}><Text style={{ fontWeight: 'bold' }}>美好時光：</Text>{diary.photoDesc}</Text>
      {photos.length > 0 && (
        <View style={{ alignItems: 'center', marginVertical: 18 }}>
          <Image
            source={{ uri: photos[currentIdx] }}
            style={styles.image}
            resizeMode="cover"
          />
          {photos.length > 1 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <TouchableOpacity onPress={() => setCurrentIdx((currentIdx - 1 + photos.length) % photos.length)}>
                <Text style={styles.arrowBtn}>‹</Text>
              </TouchableOpacity>
              <Text style={{ marginHorizontal: 8 }}>{currentIdx + 1} / {photos.length}</Text>
              <TouchableOpacity onPress={() => setCurrentIdx((currentIdx + 1) % photos.length)}>
                <Text style={styles.arrowBtn}>›</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      <Text style={styles.text}>心情：{Array(diary.stars).fill('⭐️').join('')}</Text>
      <Text style={[styles.text, { fontSize: 12, color: '#888', marginTop: 4 }]}>{diary.createdAt ? new Date(diary.createdAt).toLocaleString() : ''}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3a4b',
    marginBottom: 18,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  image: {
    width: screenWidth - 48,
    height: screenWidth - 48,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  arrowBtn: {
    fontSize: 32,
    color: '#7b9acc',
    paddingHorizontal: 12,
  },
}); 