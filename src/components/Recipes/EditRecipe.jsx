import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import './EditRecipe.css';
import { useApiFetch } from "../context/apiFetch";

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiFetch = useApiFetch();
  const API_URL = process.env.REACT_APP_API_URL;

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCoverImageFile, setNewCoverImageFile] = useState(null);
  const [newCoverImagePreview, setNewCoverImagePreview] = useState(null);
  const [newCoverImageUrl, setNewCoverImageUrl] = useState("");
  const [newSteps, setNewSteps] = useState([]);

  const [newStepText, setNewStepText] = useState("");
  const [newStepImage, setNewStepImage] = useState(null);

  useEffect(() => {
    apiFetch(`${API_URL}/recipes/${id}`)
      .then(res => res.json())
      .then(data => {
        setNewTitle(data.title);
        setNewDescription(data.description);
        setNewCoverImageUrl(data.cover_image_path || "");
        setNewSteps(
          data.steps.map((s) => ({
            imagePath: s.image_path,
            newImageFile: null,
            text: s.text,
          }))
        );
      });
  }, [id, API_URL, apiFetch]);

  // ✅ Cloudinary Direct Upload 함수
  async function uploadToCloudinary(file) {
    const sigRes = await apiFetch(`${API_URL}/uploader/signature`);
    const sigData = await sigRes.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sigData.api_key);
    formData.append("timestamp", sigData.timestamp);
    formData.append("signature", sigData.signature);
    formData.append("folder", sigData.folder);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/auto/upload`;

    const uploadRes = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();
    if (uploadData.secure_url) {
      return uploadData.secure_url;
    } else {
      throw new Error("Cloudinary upload failed");
    }
  }

  // ✅ 커버 이미지 업로드
  const handleCoverImageUpload = async () => {
    if (!newCoverImageFile) return;
    try {
      const url = await uploadToCloudinary(newCoverImageFile);
      setNewCoverImageUrl(url);
      alert("Cover image uploaded!");
    } catch (err) {
      console.error(err);
      alert("Cover image upload failed");
    }
  };

  // ✅ 수정 저장
  const handleUpdate = async () => {
    let coverImageUrl = newCoverImageUrl;

    if (newCoverImageFile) {
      try {
        coverImageUrl = await uploadToCloudinary(newCoverImageFile);
      } catch (err) {
        console.error(err);
        alert("Cover image upload failed");
        return; // 업로드 실패면 저장 못 가게 중단
      }
    }


    const stepImageUrls = [];
    for (let step of newSteps) {
      if (step.newImageFile) {
        try {
          const url = await uploadToCloudinary(step.newImageFile);
          stepImageUrls.push(url);
        } catch (err) {
          console.error(err);
          alert(`Step image upload failed`);
          return; // 하나라도 실패하면 전체 Update 중단
        }
      } else {
        stepImageUrls.push(step.imagePath || "");
      }
    }


    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("description", newDescription);
    formData.append("coverImageUrl", coverImageUrl);

    newSteps.forEach((step, idx) => {
      formData.append("stepTexts", step.text);
      formData.append("stepImageUrls", stepImageUrls[idx]);
    });
    try {
      const res = await apiFetch(`${API_URL}/recipes/${id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      alert("Updated!");
      navigate(`/recipes/${id}`);
    } catch (err) {
      console.error(err);
      alert("Update failed")
    }
  };

  // ✅ 스텝 추가
  const handleAddStep = async () => {
    if (!newStepText) return;

    let stepImageUrl = "";
    if (newStepImage) {
      try {
        stepImageUrl = await uploadToCloudinary(newStepImage);
      } catch (err) {
        console.error(err);
        alert("Step image upload failed");
        return; // 실패하면 Step 추가 중단
      }
    }


    const formData = new FormData();
    formData.append("stepText", newStepText);
    formData.append("stepImageUrl", stepImageUrl);

    await apiFetch(`${API_URL}/recipes/${id}/steps`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setNewSteps([
          ...newSteps,
          {
            imagePath: stepImageUrl,
            newImageFile: null,
            text: newStepText,
          },
        ]);
        setNewStepText("");
        setNewStepImage(null);
      });
  };

  const getImageSrc = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path}`;
  };

  return (
    <div className="edit-recipe-page">
      <h1>Edit Recipe</h1>

      <input
        type="text"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
      />

      <textarea
        rows="4"
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
      />

      <div>
        <h4>Cover Image</h4>
        {newCoverImageUrl && (
          <img src={getImageSrc(newCoverImageUrl)} alt="cover" width="200" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setNewCoverImageFile(e.target.files[0]);
            setNewCoverImagePreview(URL.createObjectURL(e.target.files[0]));
          }}
        />
        {newCoverImagePreview && (
          <img
            src={newCoverImagePreview}
            alt="new cover preview"
            width="200"
          />
        )}
        <button onClick={handleCoverImageUpload}>Upload Cover</button>
      </div>

      <div className="step-section">
        <h4>Add new Step</h4>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewStepImage(e.target.files[0])}
        />
        <textarea
          placeholder="New step text"
          value={newStepText}
          onChange={(e) => setNewStepText(e.target.value)}
        />
        <button onClick={handleAddStep}>Add Step</button>
      </div>

      {newSteps.map((step, index) => (
        <div className="step-section" key={index}>
          <p>Step {index + 1}</p>
          {step.imagePath && (
            <img src={getImageSrc(step.imagePath)} alt="" width="150" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const updated = [...newSteps];
              updated[index].newImageFile = e.target.files[0];
              setNewSteps(updated);
            }}
          />
          <textarea
            value={step.text}
            onChange={(e) => {
              const updated = [...newSteps];
              updated[index].text = e.target.value;
              setNewSteps(updated);
            }}
          />
        </div>
      ))}

      <button onClick={handleUpdate}>Save</button>
      <button
        className="cancel-button"
        onClick={() => navigate(`/recipes/${id}`)}
      >
        Cancel
      </button>
    </div>
  );
}
