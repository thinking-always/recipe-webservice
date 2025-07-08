import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddRecipe.css";

export default function AddRecipe() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [steps, setSteps] = useState([{ image: null, preview: null, text: "" }]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a title and description!");
      return;
    }

    let coverImageUrl = "";
    if (coverImage) {
      try {
        coverImageUrl = await uploadToCloudinary(coverImage);
      } catch (err) {
        console.error(err);
        alert("Cover image upload failed");
        return;
      }
    }

    const stepImagesUrls = [];
    for (let step of steps) {
      if (step.image) {
        const url = await uploadToCloudinary(step.image);
        stepImagesUrls.push(url);
      } else {
        stepImagesUrls.push("");
      }
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("coverImageUrl", coverImageUrl);

    steps.forEach((s, idx) => {
      formData.append("stepTexts", s.text.trim());
      formData.append("stepImageUrls", stepImagesUrls[idx]);
    });

    try {
      const res = await fetch(`${API_URL}/recipes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Recipe added!");
        navigate("/recipes");
      } else {
        alert("Save failed!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  async function uploadToCloudinary(file) {
    const sigRes = await fetch(`${API_URL}/uploader/signature`);
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

  const handleAddStep = () => {
    setSteps([...steps, { image: null, preview: null, text: "" }]);
  };

  const handleStepChange = (index, field, value) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  return (
    <div className="add-recipe-page">
      <h1>Add New Recipe</h1>

      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          placeholder="Recipe title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          placeholder="Recipe description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
          }}
        />
        {coverPreview && (
          <img src={coverPreview} alt="Cover Preview" width="200" style={{ marginTop: "1rem" }} />
        )}
      </div>

      <div className="steps-section">
        <h2>Steps</h2>
        {steps.map((step, index) => (
          <div key={index} className="step-card">
            <label>Step {index + 1} Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                const updated = [...steps];
                updated[index].image = file;
                updated[index].preview = URL.createObjectURL(file);
                setSteps(updated);
              }}
            />

            {step.preview && (
              <img src={step.preview} alt={`Step ${index + 1} Preview`} width="200" style={{ marginTop: "0.5rem" }} />
            )}

            <textarea
              placeholder={`Step ${index + 1} description`}
              value={step.text}
              onChange={(e) => handleStepChange(index, "text", e.target.value)}
            />
          </div>
        ))}

        <button type="button" className="add-step-btn" onClick={handleAddStep}>
          + Add Step
        </button>
      </div>

      <button className="submit-btn" onClick={handleSubmit}>
        Save Recipe
      </button>
    </div>
  );
}
