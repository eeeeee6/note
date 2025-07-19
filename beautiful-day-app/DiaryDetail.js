import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Button } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function DiaryDetail({ route, navigation }) {
  const { diary } = route.params;
  const photos = diary.photoURLs || (diary.photoURL ? [diary.photoURL] : []);
  const [currentIdx, setCurrentIdx] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      {/* 移除 headerRow 與回上一頁按鈕 */}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>今日之美</Text>
          {Array.isArray(diary.gratitude)
            ? diary.gratitude.filter(Boolean).map((g, i) => (
                <Text key={i} style={styles.smileText}>• {g}</Text>
              ))
            : <Text style={styles.smileText}>{diary.gratitude}</Text>}
          <View style={styles.beautyMomentRow}>
            <Text style={styles.beautyMomentLabel}>美好時光：</Text>
            <Text style={styles.beautyMomentContent}>{diary.photoDesc}</Text>
          </View>
          {photos.length > 0 && (
            <View style={{ alignItems: 'center', marginVertical: 12 }}>
              <Image
                source={{ uri: photos[currentIdx] }}
                style={styles.diaryImage}
                resizeMode="cover"
              />
              {photos.length > 1 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
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
          <Text style={styles.moodText}>心情：{Array(diary.stars).fill('⭐️').join('')}</Text>
          <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{diary.createdAt ? new Date(diary.createdAt).toLocaleString() : ''}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 36,
    paddingLeft: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
    minHeight: 48,
  },
  backBtn: {
    padding: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f4fa',
  },
  backBtnText: {
    color: '#4e6eaa',
    fontWeight: 'bold',
    fontSize: 16,
  },
  container: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'stretch',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
    minHeight: 260,
    position: 'relative',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4e6eaa',
    marginBottom: 8,
    letterSpacing: 1,
  },
  smileText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  beautyMomentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  beautyMomentLabel: {
    fontWeight: 'bold',
    color: '#2979ff',
    fontSize: 18,
    marginRight: 4,
  },
  beautyMomentContent: {
    fontSize: 16,
    color: '#222',
    flexShrink: 1,
  },
  diaryImage: {
    width: 240,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  arrowBtn: {
    fontSize: 28,
    color: '#7b9acc',
    paddingHorizontal: 8,
  },
  moodText: {
    color: '#f7b731',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 6,
    marginBottom: 2,
  },
}); 