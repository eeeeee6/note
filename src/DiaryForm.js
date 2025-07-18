import React, { useState } from "react";
import { db, storage, auth } from "./firebase";
import { ref, push, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const DiaryForm = () => {
  const [gratitude, setGratitude] = useState(["", "", ""]);
  const [stars, setStars] = useState(0);
  const [photo, setPhoto] = useState(null);
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
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    setSuccess("");
    let photoURL = "";
    try {
      if (photo) {
        const fileRef = storageRef(storage, `diary_photos/${auth.currentUser.uid}_${Date.now()}_${photo.name}`);
        await uploadBytes(fileRef, photo);
        photoURL = await getDownloadURL(fileRef);
      }
      const newPostRef = push(ref(db, "diaries"));
      await set(newPostRef, {
        userId: auth.currentUser.uid,
        gratitude,
        stars,
        photoURL,
        photoDesc,
        createdAt: Date.now(),
      });
      setSuccess("日記已成功儲存！");
      setGratitude(["", "", ""]);
      setStars(0);
      setPhoto(null);
      setPhotoDesc("");
    } catch (err) {
      setError("日記內容儲存失敗: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="diary-form">
      <h2>新增感恩日記</h2>
      <form onSubmit={handleSubmit}>
        {[0, 1, 2].map((idx) => (
          <div key={idx} style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder={`感恩的事情 ${idx + 1}`}
              value={gratitude[idx]}
              onChange={e => handleGratitudeChange(idx, e.target.value)}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </div>
        ))}
        <div style={{ marginBottom: 12 }}>
          <label>今天的心情：</label>
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
          <label>上傳照片：</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="照片的美好時光內容（可選填）"
            value={photoDesc}
            onChange={e => setPhotoDesc(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: "green", marginBottom: 12 }}>{success}</div>}
        <button type="submit" style={{ width: "100%", padding: 8 }} disabled={uploading}>
          {uploading ? "儲存中..." : "儲存日記"}
        </button>
      </form>
    </div>
  );
};

export default DiaryForm; 