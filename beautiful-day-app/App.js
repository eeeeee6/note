import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref as dbRef, get as dbGet } from 'firebase/database';
import { auth, db } from './firebase';
import LoginScreen from './LoginScreen';
import DiaryForm from './DiaryForm';
import DiaryList from './DiaryList';
import DiaryDetail from './DiaryDetail';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function MainScreen({ navigation }) {
  const [tab, setTab] = useState('form');
  const [nickname, setNickname] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      dbGet(dbRef(db, `users/${user.uid}`)).then(snap => {
        setNickname(snap.exists() ? snap.val().nickname : '');
      });
    }
  }, [user]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      <View style={styles.nicknameBox}>
        <Text style={styles.nicknameText}>👋 歡迎，{nickname || '使用者'}！</Text>
      </View>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'form' && styles.tabActive]}
          onPress={() => setTab('form')}
        >
          <Text style={[styles.tabText, tab === 'form' && styles.tabTextActive]}>新增今日之美</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'list' && styles.tabActive]}
          onPress={() => setTab('list')}
        >
          <Text style={[styles.tabText, tab === 'list' && styles.tabTextActive]}>瀏覽美好記錄</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => signOut(auth)}>
          <Text style={{ color: '#888', fontSize: 14 }}>登出</Text>
        </TouchableOpacity>
      </View>
      {tab === 'form' && <DiaryForm />}
      {tab === 'list' && <DiaryList onlyMine={true} navigation={navigation} />}
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  if (!user) {
    return <LoginScreen onLogin={() => {}} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={MainScreen} options={{ title: '今好 Station' }} />
        <Stack.Screen name="DiaryDetail" component={DiaryDetail} options={{ title: '返回' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  nicknameBox: {
    paddingTop: 48,
    paddingBottom: 4,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  nicknameText: {
    fontSize: 18,
    color: '#4e6eaa',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: {
    borderColor: '#7b9acc',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#4e6eaa',
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
