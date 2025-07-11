import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import './RecipeDetail.css';
import { useApiFetch } from "../context/apiFetch";

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const apiFetch = useApiFetch();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    apiFetch(`${API_URL}/recipes/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => setRecipe(data))
      .catch((err) => {
        console.error(err);
        alert("레시피 정보를 불러오지 못했습니다.");
        navigate("/recipes");
      });

    apiFetch(`${API_URL}/comments/${id}`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error("fail to bring comment", err));  
  }, [id, API_URL, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 레시피를 삭제할까요?")) return;

    try {
      const res = await apiFetch(`${API_URL}/recipes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("레시피가 삭제되었습니다.");
        navigate("/recipes");
      } else {
        console.error("삭제 실패");
        alert("삭제 실패");
      }
    } catch (error) {
      console.error(error);
      alert("server error. failed to delete")
    }
  }

  if (!recipe) return <div>Loading...</div>;

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const res = await apiFetch(`${API_URL}/comments`, {
      method: "POST",
      body: JSON.stringify({ recipe_id: id, content: newComment}),
    });

    if (res.ok) {
      const added = await res.json();
      setComments([added, ...comments]);
      setNewComment("");
    } else {
      alert("fail to add comment");
    }
  };

  // ✅ Cloudinary URL 대응: http로 시작하면 그대로 사용
  const getImageSrc = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path; // Cloudinary CDN 경로
    return `${API_URL}/${path}`; // 혹시라도 로컬 경로 대응
  };

  return (
    <div className="recipe-detail-page">
      <h1>{recipe.title}</h1>
      <p>{recipe.description}</p>

      {recipe.cover_image_path && (
        <img
          src={getImageSrc(recipe.cover_image_path)}
          alt="Cover"
          width="400"
          style={{ borderRadius: "8px", margin: "1rem 0" }}
        />
      )}

      <h2>Steps</h2>
      {recipe.steps && recipe.steps.length > 0 ? (
        recipe.steps.map((step) => (
          <div key={step.step_number} className="recipe-step">
            <h3>Step {step.step_number}</h3>
            {step.image_path && (
              <img
                src={getImageSrc(step.image_path)}
                alt={`Step ${step.step_number}`}
                width="300"
                style={{ borderRadius: "4px", margin: "0.5rem 0" }}
              />
            )}
            <p>{step.text}</p>
          </div>
        ))
      ) : (
        <p>No steps available.</p>
      )}

      <div className="recipe-detail-buttons" style={{ marginTop: "2rem" }}>
        <button onClick={handleDelete}>🗑️ Delete</button>
        <button onClick={() => navigate(`/recipes/${id}/edit`)}>✏️ Edit</button>
        <button onClick={() => navigate("/recipes")}>🔙 Back to List</button>
      </div>

      <div className="recipe-comments">
        <h2>Comments</h2>

        <form onSubmit={handleCommentSubmit}>
          <textarea
          rows="3"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Comment"
          />
          <button type="submit">
            Add Comment
          </button>
        </form>

        {comments.length === 0 ? (
          <p>No comments</p>
        ) : (
          <ul>
            {comments.map((c) => (
              <li
              key={c.id}
              >
                <p>{c.content}</p>
                <small>{new Date(c.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )
        }
      </div>

    </div>
  );
}
