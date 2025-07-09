import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecipesList.css";

export default function RecipesList() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/recipes`)
      .then(res => res.json())
      .then(setRecipes)
      .catch(err => console.error(err));
  }, [API_URL]);

  // ✅ Cloudinary URL이면 그대로 반환
  // ✅ 혹시라도 로컬 URL이면 fallback으로 API_URL 붙임
  const getImageSrc = (path) => {
    if (!path) return '';
    if (path.startsWith("http")) return path; // Cloudinary면 그대로
    return `${API_URL}/${path}`; // 혹시라도 /uploads/ 같은 로컬 경로 대응
  };

  const handleLike = (id) => {
    if (localStorage.getItem(`liked_${id}`)) {
      return alert("이미 좋아요 했어요!");
    }

    fetch(`${API_URL}/recipes/${id}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        localStorage.setItem(`liked_${id}`, "1");
        setRecipes(r =>
          r.map(x => (x.id === id ? { ...x, likes: data.likes } : x))
        );
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="recipe-page">
      <h1>Recipes List</h1>
      <button onClick={() => navigate("/recipes/add")}>+ Add Recipe</button>

      <div className="cards">
        {recipes.map(r => (
          <div
            key={r.id}
            className="recipe-card"
            onClick={() => navigate(`/recipes/${r.id}`)}
          >
            {r.cover_image_path && (
              <img
                src={getImageSrc(r.cover_image_path)}
                alt="cover"
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "8px 8px 0 0",
                  cursor: "pointer",
                }}
              />
            )}

            <div className="recipe-card-info">
              <h2>{r.title}</h2>
              <p>{r.description}</p>
              <div className="recipe-card-footer">
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(r.id);
                    }}
                  >
                    ❤️ {r.likes || 0}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // 댓글 등 다른 기능
                      alert("댓글 기능은 아직!");
                    }}
                  >
                    💬
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/recipes/${r.id}`);
                  }}
                >
                  보기
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
