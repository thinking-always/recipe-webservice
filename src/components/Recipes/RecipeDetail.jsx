import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import './RecipeDetail.css';

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/recipes/${id}`)
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
  }, [id, API_URL, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 레시피를 삭제할까요?")) return;

    const res = await fetch(`${API_URL}/recipes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      alert("레시피가 삭제되었습니다.");
      navigate("/recipes");
    } else {
      console.error("삭제 실패");
      alert("삭제 실패");
    }
  };

  if (!recipe) return <div>Loading...</div>;

  // ✅ Cloudinary URL이면 그대로, 아니면 로컬 경로 붙이기
  const getImageSrc = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path}`;
  };

  return (
    <div className="recipe-detail-page">
      <h1>{recipe.title}</h1>
      <p>{recipe.description}</p>

      {recipe.cover_image_path && (
        <img
          src={getImageSrc(recipe.cover_image_path)}
          alt="Cover"
          width="300"
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
                width="200"
              />
            )}
            <p>{step.text}</p>
          </div>
        ))
      ) : (
        <p>No steps available.</p>
      )}

      <button onClick={handleDelete}>Delete</button>
      <button onClick={() => navigate(`/recipes/${id}/edit`)}>Edit</button>
      <button onClick={() => navigate("/recipes")}>Back to List</button>
    </div>
  );
}
