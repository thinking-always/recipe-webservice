import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './RecipesList.css';

export default function RecipesList() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setnewTitle] = useState("");
  const [newDescription, setnewDescription] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/recipes")
      .then(res => res.json())
      .then(data => setRecipes(data));
  }, []);

  const startEditing = (recipe) => {
    setEditingId(recipe.id);
    setnewTitle(recipe.title);
    setnewDescription(recipe.description);
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
    fetch(`http://localhost:5000/recipes/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: newTitle,
        description: newDescription
      })
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
            onChange={e => setnewTitle(e.target.value)}
          />
          <textarea
            value={newDescription}
            onChange={e => setnewDescription(e.target.value)}
          />
          <button onClick={handleUpdate}>Save</button>
          <button onClick={() => setEditingId(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
