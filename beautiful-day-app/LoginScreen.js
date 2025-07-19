import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

export default function LoginScreen({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isRegister) {
        if (!nickname.trim()) {
          Alert.alert('請輸入暱稱');
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        // 這裡可以加上暱稱存到資料庫的功能，之後再補
        Alert.alert('註冊成功，請登入');
        setIsRegister(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onLogin && onLogin();
      }
    } catch (err) {
      Alert.alert('錯誤', err.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>今好 Station</Text>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, !isRegister && styles.tabActive]}
          onPress={() => setIsRegister(false)}
        >
          <Text style={[styles.tabText, !isRegister && styles.tabTextActive]}>登入</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, isRegister && styles.tabActive]}
          onPress={() => setIsRegister(true)}
        >
          <Text style={[styles.tabText, isRegister && styles.tabTextActive]}>註冊</Text>
        </TouchableOpacity>
      </View>
      {isRegister && (
        <TextInput
          style={styles.input}
          placeholder="暱稱"
          placeholderTextColor="#444"
          value={nickname}
          onChangeText={setNickname}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#444"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="密碼"
        placeholderTextColor="#444"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={isRegister ? '註冊' : '登入'} onPress={handleAuth} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f6fa', // 淺色背景
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2979ff',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 2,
  },
  tabRow: { flexDirection: 'row', marginBottom: 24 },
  tab: { flex: 1, padding: 12, alignItems: 'center', borderBottomWidth: 2, borderColor: '#eee' },
  tabActive: { borderColor: '#7b9acc' },
  tabText: { fontSize: 18, color: '#444' }, // 深色文字
  tabTextActive: { color: '#4e6eaa', fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#222', // 深色文字
    backgroundColor: '#fff', // 白色輸入框
  },
});