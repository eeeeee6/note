import React, { useState } from "react";
import { db, storage, auth } from "./firebase";
import { ref, push, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const DiaryForm = ({ userProfile }) => {
  const [gratitude, setGratitude] = useState(["", "", ""]);
  const [stars, setStars] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [photoDesc, setPhotoDesc] = useState("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleGratitudeChange = (idx, value) => {
    const newGratitude = [...gratitude];
    newGratitude[idx] = value;
    setGratitude(newGratitude);
  };

  const handlePhotoChange = (e) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    setSuccess("");
    let photoURLs = [];
    
    try {
      // 上傳多張照片
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const fileRef = storageRef(storage, `diary_photos/${auth.currentUser.uid}_${Date.now()}_${i}_${photo.name}`);
          await uploadBytes(fileRef, photo);
          const photoURL = await getDownloadURL(fileRef);
          photoURLs.push(photoURL);
        }
      }
      
      const newPostRef = push(ref(db, "diaries"));
      await set(newPostRef, {
        userId: auth.currentUser.uid,
        gratitude,
        stars,
        photoURLs, // 改為 photoURLs 陣列
        photoDesc,
        createdAt: Date.now(),
      });
      setSuccess("日記已成功儲存！");
      setGratitude(["", "", ""]);
      setStars(0);
      setPhotos([]);
      setPhotoDesc("");
    } catch (err) {
      setError("日記內容儲存失敗: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="diary-form">
      {/* 只顯示暱稱，不顯示 email */}
      {userProfile && (
        <div style={{ marginBottom: 12, textAlign: 'center', color: '#888', fontSize: 16 }}>
          <div>暱稱：{userProfile.nickname}</div>
        </div>
      )}
      <h2>新增今日之美</h2>
      <form onSubmit={handleSubmit}>
        {[0, 1, 2].map((idx) => (
          <div key={idx} style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder={`讓我微笑 ${idx + 1}`}
              value={gratitude[idx]}
              onChange={e => handleGratitudeChange(idx, e.target.value)}
              required
              style={{ width: "100%", padding: 12, fontSize: 16 }}
            />
          </div>
        ))}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 16, fontWeight: 'bold' }}>今日能量幾顆星：</label>
          <div>
            {[1,2,3,4,5].map(num => (
              <span
                key={num}
                style={{
                  fontSize: 28,
                  cursor: "pointer",
                  color: num <= stars ? "#FFD700" : "#ccc"
                }}
                onClick={() => setStars(num)}
                role="button"
                aria-label={`星星${num}`}
              >★</span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 16, fontWeight: 'bold' }}>捕捉美好一刻（可多選）：</label>
          <input 
            type="file" 
            accept="image/*" 
            multiple
            onChange={handlePhotoChange} 
            style={{ 
              width: "100%", 
              padding: "16px", 
              fontSize: "18px",
              border: "2px dashed #ccc",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          />
          {photos.length > 0 && (
            <div style={{ marginTop: 8, fontSize: '16px', color: '#666' }}>
              已選擇 {photos.length} 張照片
            </div>
          )}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 16, fontWeight: 'bold' }}>美好時光內容：</label>
          <textarea
            placeholder="請描述這些照片的美好時光內容（可選填）"
            value={photoDesc}
            onChange={e => setPhotoDesc(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "12px", 
              fontSize: "16px",
              minHeight: "100px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              resize: "vertical"
            }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 12, fontSize: 16 }}>{error}</div>}
        {success && <div style={{ color: "green", marginBottom: 12, fontSize: 16 }}>{success}</div>}
        <button type="submit" style={{ width: "100%", padding: 16, fontSize: 18, fontWeight: 'bold' }} disabled={uploading}>
          {uploading ? "儲存中..." : "儲存日記"}
        </button>
      </form>
    </div>
  );
};

export default DiaryForm; 