import React, { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import DiaryForm from "./DiaryForm";
import DiaryList from "./DiaryList";

const Auth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setEmail("");
    setPassword("");
  };

  // 監聽登入狀態
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (user) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <h2>歡迎，{user.email}！</h2>
        <button onClick={handleSignOut}>登出</button>
        <DiaryForm />
        <hr />
        <div className="diary-list-title">美好記錄</div>
        <DiaryList onlyMine={true} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 320, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>{isRegister ? "註冊帳號" : "登入"}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: "100%", padding: 8 }}>
          {isRegister ? "註冊" : "登入"}
        </button>
      </form>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => setIsRegister(!isRegister)} style={{ width: "100%", padding: 8, background: "#eee" }}>
          {isRegister ? "已有帳號？登入" : "沒有帳號？註冊"}
        </button>
      </div>
    </div>
  );
};

export default Auth; 