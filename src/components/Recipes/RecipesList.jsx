import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './RecipesList.css';

export default function RecipesList() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCoverImage, setNewCoverImage] = useState(null);
  const [newDescription, setNewDescription] = useState("");
  const [newSteps, setNewSteps] = useState([]);
  const [newStepText, setNewStepText] = useState("");
  const [newStepImage, setNewStepImage] = useState(null);




  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/recipes")
      .then(res => res.json())
      .then(data => setRecipes(data));
  }, []);

  useEffect(() => {
    if (editingId) {
      fetch(`http://localhost:5000/recipes/${editingId}`)
        .then(res => res.json())
        .then(data => {
          setNewTitle(data.title);
          setNewDescription(data.description)

          setNewSteps(data.steps.map(s => ({
            imagePath: s.image_path,
            newImage: null,
            text: s.text
          })));
        });
    }
  }, [editingId]);

  const startEditing = (recipe) => {
    setEditingId(recipe.id);
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:5000/recipes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log("Deleted:", data);
        setRecipes(recipes.filter(r => r.id !== id));
      });
  };

  const handleUpdate = () => {
    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("description", newDescription);

    if (newCoverImage) {
      formData.append("coverImage", newCoverImage);
    }

    newSteps.forEach(step => {
      if (step.newImage) {
        formData.append("stepImages", step.newImage);
      } else {
        formData.append("stepImages", "");
      }
      formData.append("stepTexts", step.text);
    });


    fetch(`http://localhost:5000/recipes/${editingId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        console.log("Updated:", data);
        setRecipes(
          recipes.map(r =>
            r.id === editingId ? { ...r, title: newTitle, description: newDescription } : r
          )
        );
        setEditingId(null);
      });
  };

  const handleLike = (id) => {
    const liked = localStorage.getItem(`liked_${id}`);
    if (liked) {
      alert("이미 좋아요를 눌렀습니다.");
      return;
    }

    fetch(`http://localhost:5000/recipes/${id}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log("Liked:", data);
        localStorage.setItem(`liked_${id}`, "true");
        setRecipes(
          recipes.map(r =>
            r.id === id ? { ...r, likes: data.likes } : r
          )
        );
      });
  };

  const handleAddStep = () => {
    if (!newStepText) {
      alert("Step text is empty");
      return;
    }

    const formData = new FormData();
    formData.append("stepText", newStepText);
    if (newStepImage) {
      formData.append("stepImage", newStepImage);
    }

    fetch(`http://localhost:5000/recipes/${editingId}/steps`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        console.log("Step added:", data);
        // 새로 추가된 스텝은 다시 불러오거나 그냥 local push
        setNewSteps([
          ...newSteps,
          {
            imagePath: data.image_path || "",
            newImage: null,
            text: newStepText
          }
        ]);
        setNewStepText("");
        setNewStepImage(null);
      });
  };

  return (
    <div className="recipe-page">
      <h1>Recipes List</h1>
      <button onClick={() => navigate("/recipes/add")}>+ Add Recipe</button>
      <div className="cards">
        {recipes.map(r => (
          <div className="recipe-card" key={r.id}>
            <h2>{r.title}</h2>
            <p>{r.description}</p>
            <div className="recipe-card-buttons">
              <button onClick={() => handleLike(r.id)}>❤️ {r.likes ?? 0}</button>
              <button onClick={() => startEditing(r)}>Edit</button>
              <button onClick={() => handleDelete(r.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editingId && (
        <div>
          <h3>Edit Recipe</h3>
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <textarea
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
          />

          <div>
            <h4>Add new Step</h4>
            <input
              type="file"
              accept="image/*"
              onChange={e => setNewStepImage(e.target.files[0])}
            />
            <textarea
              placeholder="New step text"
              value={newStepText}
              onChange={e => setNewStepText(e.target.value)}
            />
            <button onClick={handleAddStep}>Add Step</button>
          </div>


          {newSteps.map((step, index) => (
            <div key={index}>
              <p>Step {index + 1}</p>
              <img src={`http://localhost:5000/${step.imagePath}`} alt="" width="100" />
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
          <button onClick={() => setEditingId(null)}>Cancel</button>
        </div>


      )}


    </div>
  );
}
