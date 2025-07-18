import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { ref, onValue, remove } from "firebase/database";

const DiaryList = ({ onlyMine = false }) => {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const diariesRef = ref(db, "diaries");
    const unsubscribe = onValue(diariesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const diaryArray = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        // 依 createdAt 由新到舊排序
        diaryArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setDiaries(diaryArray);
      } else {
        setDiaries([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 刪除日記
  const handleDelete = async (id) => {
    if (window.confirm("確定要刪除這則日記嗎？")) {
      await remove(ref(db, `diaries/${id}`));
    }
  };

  // 過濾只顯示自己的日記
  const filteredDiaries = onlyMine
    ? diaries.filter((d) => d.userId === auth.currentUser?.uid)
    : diaries;

  if (loading) return <div>載入中...</div>;

  return (
    <div className="diary-list-horizontal">
      {filteredDiaries.length === 0 ? (
        <div>沒有日記</div>
      ) : (
        filteredDiaries.map((diary) => (
          <div className="diary-card" key={diary.id}>
            <h3>
              {Array.isArray(diary.gratitude)
                ? diary.gratitude.filter(Boolean).map((g, i) => <div key={i}>• {g}</div>)
                : diary.gratitude}
            </h3>
            <p>{diary.photoDesc}</p>
            {diary.photoURL && (
              <img src={diary.photoURL} alt="日記照片" style={{ maxWidth: 200 }} />
            )}
            <div>星星數：{diary.stars}</div>
            <div style={{ fontSize: 12, color: "#888" }}>
              {diary.createdAt ? new Date(diary.createdAt).toLocaleString() : ""}
            </div>
            {/* 只有自己的日記才顯示刪除按鈕，並放在最下方 */}
            {auth.currentUser?.uid === diary.userId && (
              <button className="delete-btn" onClick={() => handleDelete(diary.id)}>
                刪除
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default DiaryList; 