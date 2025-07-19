import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { db, storage, auth } from './firebase';
import { ref as dbRef, push, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

export default function DiaryForm() {
  const [gratitude, setGratitude] = useState(['', '', '']);
  const [stars, setStars] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [photoDesc, setPhotoDesc] = useState('');
  const [uploading, setUploading] = useState(false);

  // 選擇照片
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      // Expo SDK 49+ result.assets, 舊版 result.selected
      setPhotos(result.assets || result.selected || []);
    }
  };

  // 送出表單
  const handleSubmit = async () => {
    if (!gratitude[0] && !gratitude[1] && !gratitude[2]) {
      Alert.alert('請至少填寫一件感恩的事情');
      return;
    }
    setUploading(true);
    let photoURLs = [];
    try {
      // 上傳照片
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const response = await fetch(photo.uri);
        const blob = await response.blob();
        const fileRef = storageRef(storage, `diary_photos/${auth.currentUser.uid}_${Date.now()}_${i}`);
        await uploadBytes(fileRef, blob);
        const url = await getDownloadURL(fileRef);
        photoURLs.push(url);
      }
      // 儲存日記
      const newPostRef = push(dbRef(db, 'diaries'));
      await set(newPostRef, {
        userId: auth.currentUser.uid,
        gratitude,
        stars,
        photoURLs,
        photoDesc,
        createdAt: Date.now(),
      });
      Alert.alert('日記已成功儲存！');
      setGratitude(['', '', '']);
      setStars(0);
      setPhotos([]);
      setPhotoDesc('');
    } catch (err) {
      Alert.alert('儲存失敗', err.message);
    }
    setUploading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>新增今日之美</Text>
      {[0, 1, 2].map(idx => (
        <TextInput
          key={idx}
          style={styles.input}
          placeholder={`讓我微笑 ${idx + 1}`}
          value={gratitude[idx]}
          onChangeText={text => {
            const newArr = [...gratitude];
            newArr[idx] = text;
            setGratitude(newArr);
          }}
        />
      ))}
      <View style={styles.starsRow}>
        <Text style={{ marginRight: 8 }}>今日能量幾顆星：</Text>
        {[1, 2, 3, 4, 5].map(num => (
          <TouchableOpacity key={num} onPress={() => setStars(num)}>
            <Text style={{ fontSize: 28, color: num <= stars ? '#FFD700' : '#ccc' }}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button title="捕捉美好一刻" onPress={pickImages} />
      <ScrollView horizontal style={{ marginVertical: 8 }}>
        {photos.map((photo, idx) => (
          <Image
            key={idx}
            source={{ uri: photo.uri }}
            style={{ width: 80, height: 80, borderRadius: 8, marginRight: 8 }}
          />
        ))}
      </ScrollView>
      <TextInput
        style={[styles.input, { minHeight: 80 }]}
        placeholder="美好時光內容（可選填）"
        value={photoDesc}
        onChangeText={setPhotoDesc}
        multiline
      />
      {uploading ? (
        <ActivityIndicator size="large" style={{ marginVertical: 16 }} />
      ) : (
        <Button title="儲存日記" onPress={handleSubmit} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2d3a4b', textAlign: 'center', marginBottom: 18 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  starsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
});