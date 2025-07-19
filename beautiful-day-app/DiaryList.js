import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Button, Alert, Modal, StyleSheet, Dimensions } from 'react-native';
import { db, auth } from './firebase';
import { ref, onValue, remove } from 'firebase/database';

const screenWidth = Dimensions.get('window').width;

export default function DiaryList({ onlyMine = false, navigation }) {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoIndexes, setPhotoIndexes] = useState({});
  const [previewImg, setPreviewImg] = useState(null);

  useEffect(() => {
    const diariesRef = ref(db, 'diaries');
    const unsubscribe = onValue(diariesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const diaryArray = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        diaryArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setDiaries(diaryArray);
        const idxObj = {};
        diaryArray.forEach(d => { idxObj[d.id] = 0; });
        setPhotoIndexes(idxObj);
      } else {
        setDiaries([]);
        setPhotoIndexes({});
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    Alert.alert('確定要刪除這則日記嗎？', '', [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: async () => {
        await remove(ref(db, `diaries/${id}`));
      }}
    ]);
  };

  const handlePhotoChange = (diaryId, dir, total) => {
    setPhotoIndexes(prev => {
      const nextIdx = ((prev[diaryId] || 0) + dir + total) % total;
      return { ...prev, [diaryId]: nextIdx };
    });
  };

  const filteredDiaries = onlyMine
    ? diaries.filter((d) => d.userId === auth.currentUser?.uid)
    : diaries;

  if (loading) return <View style={{padding: 24}}><Text>載入中...</Text></View>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {filteredDiaries.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>沒有日記</Text>
      ) : (
        <>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>共 {filteredDiaries.length} 則美好記錄</Text>
            {filteredDiaries.length > 0 && (
              <Text style={styles.summaryText}>
                記錄期間：{new Date(Math.min(...filteredDiaries.map(d => d.createdAt || 0))).toLocaleDateString()} 至 {new Date(Math.max(...filteredDiaries.map(d => d.createdAt || 0))).toLocaleDateString()}
              </Text>
            )}
          </View>
          {filteredDiaries.map((diary) => {
            const photos = diary.photoURLs || (diary.photoURL ? [diary.photoURL] : []);
            const currentIdx = photoIndexes[diary.id] || 0;
            return (
              <TouchableOpacity
                key={diary.id}
                activeOpacity={0.85}
                onPress={() => navigation && navigation.navigate('DiaryDetail', { diary })}
              >
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>今日之美</Text>
                  {Array.isArray(diary.gratitude)
                    ? diary.gratitude.filter(Boolean).map((g, i) => <Text key={i}>• {g}</Text>)
                    : <Text>{diary.gratitude}</Text>}
                  <Text style={{ marginTop: 10 }}><Text style={{ fontWeight: 'bold' }}>美好時光：</Text>{diary.photoDesc}</Text>
                  {photos.length > 0 && (
                    <View style={{ alignItems: 'center', marginVertical: 12 }}>
                      <TouchableOpacity onPress={() => setPreviewImg(photos[currentIdx])}>
                        <Image
                          source={{ uri: photos[currentIdx] }}
                          style={{ width: 200, height: 200, borderRadius: 8, marginBottom: 4 }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                      {photos.length > 1 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                          <TouchableOpacity onPress={() => handlePhotoChange(diary.id, -1, photos.length)}>
                            <Text style={styles.arrowBtn}>‹</Text>
                          </TouchableOpacity>
                          <Text style={{ marginHorizontal: 8 }}>{currentIdx + 1} / {photos.length}</Text>
                          <TouchableOpacity onPress={() => handlePhotoChange(diary.id, 1, photos.length)}>
                            <Text style={styles.arrowBtn}>›</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                  <Text>心情：{Array(diary.stars).fill('⭐️').join('')}</Text>
                  <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{diary.createdAt ? new Date(diary.createdAt).toLocaleString() : ''}</Text>
                  {auth.currentUser?.uid === diary.userId && (
                    <Button title="刪除" color="#d9534f" onPress={() => handleDelete(diary.id)} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      )}
      {/* 大圖預覽 Modal */}
      <Modal visible={!!previewImg} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setPreviewImg(null)}>
          <View style={styles.modalContent}>
            {previewImg && (
              <Image source={{ uri: previewImg }} style={styles.previewImg} resizeMode="contain" />
            )}
            <Button title="關閉" onPress={() => setPreviewImg(null)} />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  summaryBox: {
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3a4b',
    marginBottom: 8,
  },
  arrowBtn: {
    fontSize: 28,
    color: '#7b9acc',
    paddingHorizontal: 8,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    maxWidth: screenWidth - 32,
  },
  previewImg: {
    width: screenWidth - 64,
    height: screenWidth - 64,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
}); 