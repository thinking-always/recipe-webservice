import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import './EditRecipe.css'; 

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCoverImage, setNewCoverImage] = useState(null);
  const [newSteps, setNewSteps] = useState([]);
  const [newStepText, setNewStepText] = useState("");
  const [newStepImage, setNewStepImage] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/recipes/${id}`)
      .then(res => res.json())
      .then(data => {
        setNewTitle(data.title);
        setNewDescription(data.description);
        setNewSteps(
          data.steps.map((s) => ({
            imagePath: s.image_path,
            newImage: null,
            text: s.text,
          }))
        );
      });
  }, [id]);

  const handleUpdate = () => {
    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("description", newDescription);

    if (newCoverImage) {
      formData.append("coverImage", newCoverImage);
    }

    newSteps.forEach((step) => {
      if (step.newImage) {
        formData.append("stepImages", step.newImage);
      } else {
        formData.append("stepImages", "");
      }
      formData.append("stepTexts", step.text);
    });

    fetch(`${API_URL}/recipes/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        alert("Updated!");
        navigate(`/recipes/${id}`);
      });
  };

  const handleAddStep = () => {
    if (!newStepText) return;

    const formData = new FormData();
    formData.append("stepText", newStepText);
    if (newStepImage) {
      formData.append("stepImage", newStepImage);
    }

    fetch(`${API_URL}/recipes/${id}/steps`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setNewSteps([
          ...newSteps,
          {
            imagePath: data.image_path || "",
            newImage: null,
            text: newStepText,
          },
        ]);
        setNewStepText("");
        setNewStepImage(null);
      });
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
          <img
            src={`http://localhost:5000/${step.imagePath}`}
            alt=""
            width="100"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const updated = [...newSteps];
              updated[index].newImage = e.target.files[0];
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
      <button className="cancel-button" onClick={() => navigate(`/recipes/${id}`)}>Cancel</button>
    </div>
  );
}
