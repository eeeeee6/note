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
    <div>
      {filteredDiaries.length === 0 ? (
        <div>沒有日記</div>
      ) : (
        <>
          {/* 統計說明 - 放在標題下方，不參與橫向滾動 */}
          <div style={{ 
            padding: '16px', 
            marginBottom: '16px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              共有 {filteredDiaries.length} 則美好記錄
            </div>
            {filteredDiaries.length > 0 && (
              <div style={{ fontSize: '14px', color: '#666' }}>
                記錄期間：{new Date(Math.min(...filteredDiaries.map(d => d.createdAt || 0))).toLocaleDateString()} 至 {new Date(Math.max(...filteredDiaries.map(d => d.createdAt || 0))).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="diary-list-horizontal">
            {filteredDiaries.map((diary) => (
              <div className="diary-card" key={diary.id}>
                <h3>今日之美</h3>
                {Array.isArray(diary.gratitude)
                  ? diary.gratitude.filter(Boolean).map((g, i) => <div key={i}>• {g}</div>)
                  : diary.gratitude}
                <div style={{ marginTop: 10 }}>
                  <strong>美好時光：</strong>
                  <span>{diary.photoDesc}</span>
                </div>
                {diary.photoURLs && diary.photoURLs.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    {diary.photoURLs.map((photoURL, index) => (
                      <img 
                        key={index}
                        src={photoURL} 
                        alt={`日記照片 ${index + 1}`} 
                        style={{ 
                          maxWidth: 200, 
                          marginRight: 8, 
                          marginBottom: 8,
                          borderRadius: 6,
                          boxShadow: '0 1px 6px #0001'
                        }} 
                      />
                    ))}
                  </div>
                )}
                {/* 支援舊版單張照片格式 */}
                {diary.photoURL && !diary.photoURLs && (
                  <img src={diary.photoURL} alt="日記照片" style={{ maxWidth: 200 }} />
                )}
                <div>心情：{Array(diary.stars).fill('⭐️').join('')}</div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {diary.createdAt ? new Date(diary.createdAt).toLocaleString() : ""}
                </div>
                {auth.currentUser?.uid === diary.userId && (
                  <button className="delete-btn" onClick={() => handleDelete(diary.id)}>
                    刪除
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DiaryList; 