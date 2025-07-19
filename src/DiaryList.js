import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { ref, onValue, remove } from "firebase/database";

const DiaryList = ({ onlyMine = false }) => {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  // 新增：每則日記的照片索引
  const [photoIndexes, setPhotoIndexes] = useState({});
  // 新增：大圖預覽狀態
  const [previewImg, setPreviewImg] = useState(null);

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
        // 初始化每則日記的照片索引為 0
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

  // 刪除日記
  const handleDelete = async (id) => {
    if (window.confirm("確定要刪除這則日記嗎？")) {
      await remove(ref(db, `diaries/${id}`));
    }
  };

  // 切換照片
  const handlePhotoChange = (diaryId, dir, total) => {
    setPhotoIndexes(prev => {
      const nextIdx = ((prev[diaryId] || 0) + dir + total) % total;
      return { ...prev, [diaryId]: nextIdx };
    });
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
            {filteredDiaries.map((diary) => {
              // 處理多張照片輪播
              const photos = diary.photoURLs || (diary.photoURL ? [diary.photoURL] : []);
              const currentIdx = photoIndexes[diary.id] || 0;
              return (
                <div className="diary-card" key={diary.id}>
                  <h3>今日之美</h3>
                  {Array.isArray(diary.gratitude)
                    ? diary.gratitude.filter(Boolean).map((g, i) => <div key={i}>• {g}</div>)
                    : diary.gratitude}
                  <div style={{ marginTop: 10 }}>
                    <strong>美好時光：</strong>
                    <span>{diary.photoDesc}</span>
                  </div>
                  {/* 照片輪播區塊 */}
                  {photos.length > 0 && (
                    <div style={{ position: 'relative', margin: '16px 0' }}>
                      <img
                        src={photos[currentIdx]}
                        alt={`日記照片 ${currentIdx + 1}`}
                        style={{
                          maxWidth: 200,
                          maxHeight: 200,
                          borderRadius: 6,
                          boxShadow: '0 1px 6px #0001',
                          objectFit: 'cover',
                          display: 'block',
                          margin: '0 auto',
                          cursor: 'pointer'
                        }}
                        onClick={() => setPreviewImg(photos[currentIdx])}
                      />
                      {/* 左右切換按鈕 */}
                      {photos.length > 1 && (
                        <>
                          <button
                            onClick={() => handlePhotoChange(diary.id, -1, photos.length)}
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'rgba(0,0,0,0.3)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: 28,
                              height: 28,
                              cursor: 'pointer',
                              fontSize: 18
                            }}
                            aria-label="上一張"
                          >
                            ‹
                          </button>
                          <button
                            onClick={() => handlePhotoChange(diary.id, 1, photos.length)}
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'rgba(0,0,0,0.3)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: 28,
                              height: 28,
                              cursor: 'pointer',
                              fontSize: 18
                            }}
                            aria-label="下一張"
                          >
                            ›
                          </button>
                          {/* 小圓點指示器 */}
                          <div style={{ textAlign: 'center', marginTop: 6 }}>
                            {photos.map((_, idx) => (
                              <span
                                key={idx}
                                style={{
                                  display: 'inline-block',
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  background: idx === currentIdx ? '#7b9acc' : '#ccc',
                                  margin: '0 3px'
                                }}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
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
              );
            })}
          </div>
        </>
      )}
      {/* Modal 大圖預覽 */}
      {previewImg && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={previewImg}
            alt="預覽大圖"
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              borderRadius: 12,
              boxShadow: '0 4px 32px #0008',
              background: '#fff',
              padding: 8
            }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setPreviewImg(null)}
            style={{
              position: 'fixed',
              top: 24,
              right: 32,
              fontSize: 32,
              color: '#fff',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10000
            }}
            aria-label="關閉預覽"
          >×</button>
        </div>
      )}
    </div>
  );
};

export default DiaryList; 