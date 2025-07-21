import { useEffect, useRef, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { updateDisplayPicture } from "../../../services/operations/profileApi";

const GREEN = '#009e5c';
const GREEN_DARK = '#007a44';
const BORDER = '#e0e0e0';
const CARD_BG = '#fff';
const TEXT_DARK = '#222';

export default function ChangeProfilePicture() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewSource, setPreviewSource] = useState(null);

  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      previewFile(file);
    }
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewSource(reader.result);
    };
  };

  const handleFileUpload = () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("displayPicture", imageFile);
      dispatch(updateDisplayPicture(token, formData)).then(() => {
        setLoading(false);
      });
    } catch (error) {
      setLoading(false);
      console.log("ERROR MESSAGE - ", error.message);
    }
  };

  useEffect(() => {
    if (imageFile) {
      previewFile(imageFile);
    }
  }, [imageFile]);

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid ${BORDER}`, padding: 32, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 24 }}>
      <img
        src={previewSource || user?.image}
        alt={`profile-${user?.firstName}`}
        style={{ width: 78, height: 78, borderRadius: '50%', objectFit: 'cover', background: '#e6fcf5' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: TEXT_DARK, fontSize: 18, marginBottom: 8 }}>Change Profile Picture</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/png, image/gif, image/jpeg"
          />
          <button
            onClick={handleClick}
            disabled={loading}
            style={{ background: '#e6fcf5', color: GREEN, border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}
          >
            Select
          </button>
          <button
            onClick={handleFileUpload}
            disabled={loading || !imageFile}
            style={{ background: GREEN, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}
            onMouseOver={e => e.target.style.background = GREEN_DARK}
            onMouseOut={e => e.target.style.background = GREEN}
          >
            {loading ? 'Uploading...' : 'Upload'} <FiUpload style={{ fontSize: 18, color: loading ? '#fff' : '#fff' }} />
          </button>
        </div>
      </div>
    </div>
  );
} 