import React, { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ref as dbRef, set as dbSet, get as dbGet } from "firebase/database";
import DiaryForm from "./DiaryForm";
import DiaryList from "./DiaryList";

const Auth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState('form'); // 預設顯示新增今日之美

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        if (!nickname.trim()) {
          setError("請輸入暱稱");
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
        // 註冊時存暱稱到 Database
        await dbSet(dbRef(db, `users/${userCredential.user.uid}`), {
          nickname,
          email
        });
        setUserProfile({ nickname, email });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
        // 取得暱稱
        const snap = await dbGet(dbRef(db, `users/${userCredential.user.uid}`));
        setUserProfile(snap.exists() ? snap.val() : { email: userCredential.user.email });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setEmail("");
    setPassword("");
    setNickname("");
  };

  // 監聽登入狀態
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const snap = await dbGet(dbRef(db, `users/${user.uid}`));
        setUserProfile(snap.exists() ? snap.val() : { email: user.email });
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (user) {
    // 分頁切換狀態
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <h2>歡迎，{userProfile?.nickname || "使用者"}！</h2>
        <div style={{ color: '#888', marginBottom: 8 }}>{userProfile?.email}</div>
        <button onClick={handleSignOut}>登出</button>
        {/* 分頁 Tab */}
        <div style={{ display: 'flex', margin: '32px 0 24px 0', justifyContent: 'center' }}>
          <button
            onClick={() => setTab('form')}
            style={{
              flex: 1,
              maxWidth: 180,
              padding: '12px',
              border: 'none',
              background: tab === 'form' ? '#7b9acc' : '#f0f0f0',
              color: tab === 'form' ? 'white' : '#333',
              cursor: 'pointer',
              borderTopLeftRadius: '8px',
              borderBottomLeftRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              transition: 'background 0.2s, color 0.2s'
            }}
          >
            新增今日之美
          </button>
          <button
            onClick={() => setTab('list')}
            style={{
              flex: 1,
              maxWidth: 180,
              padding: '12px',
              border: 'none',
              background: tab === 'list' ? '#7b9acc' : '#f0f0f0',
              color: tab === 'list' ? 'white' : '#333',
              cursor: 'pointer',
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              transition: 'background 0.2s, color 0.2s'
            }}
          >
            瀏覽美好記錄
          </button>
        </div>
        {/* 分頁內容 */}
        {tab === 'form' && <DiaryForm userProfile={userProfile} />}
        {tab === 'list' && (
          <>
            <hr />
            <div className="diary-list-title">美好記錄</div>
            <DiaryList onlyMine={true} />
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span style={{ fontSize: 28, fontWeight: 'bold', color: '#2979ff', letterSpacing: 2 }}>今好 Station</span>
      </div>
      {/* Tab 切換 */}
      <div style={{ display: 'flex', marginBottom: 24 }}>
        <button
          onClick={() => setIsRegister(false)}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            background: !isRegister ? '#7b9acc' : '#f0f0f0',
            color: !isRegister ? 'white' : '#333',
            cursor: 'pointer',
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          登入
        </button>
        <button
          onClick={() => setIsRegister(true)}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            background: isRegister ? '#7b9acc' : '#f0f0f0',
            color: isRegister ? 'white' : '#333',
            cursor: 'pointer',
            borderTopRightRadius: '8px',
            borderBottomRightRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          註冊
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="暱稱"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              required
              style={{ width: "100%", padding: 8, fontSize: 16 }}
            />
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8, fontSize: 16 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8, fontSize: 16 }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: "100%", padding: 8, fontSize: 16 }}>
          {isRegister ? "註冊" : "登入"}
        </button>
      </form>
    </div>
  );
};

export default Auth; 