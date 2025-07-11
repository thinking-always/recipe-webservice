import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import { useApiFetch } from "../context/apiFetch";

export default function Home() {
  const [popular, setPopular] = useState([]);
  const [latest, setLatest] = useState([]);
  const apiFetch = useApiFetch();

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    apiFetch(`${API_URL}/recipes/popular`)
      .then((res) => res.json())
      .then((data) => setPopular(data));

    apiFetch(`${API_URL}/recipes/latest`)
      .then((res) => res.json())
      .then((data) => setLatest(data));
  }, [API_URL]);

  return (
    <div className="home-container">
      <h1>Welcome to My Recipe App!</h1>
      <p>오늘의 추천 레시피를 찾아보세요 🍳</p>

      <div className="banners">
        <h2>🔥 인기 메뉴</h2>
        <div className="popular-list">
          {popular.length === 0 ? (
            <p>인기 메뉴 불러오는 중...</p>
          ) : (
            popular.map((recipe) => (
              <Link
                key={recipe.id}
                to={`/recipes/${recipe.id}`}
                className="recipe-card"
              >
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>
                <p className="card-likes">❤️ Likes: {recipe.likes}</p>
              </Link>
            ))
          )}
        </div>

        <h2>✨ 최신 메뉴</h2>
        <div className="latest-list">
          {latest.length === 0 ? (
            <p>최신 메뉴가 없습니다.</p>
          ) : (
            latest.map((recipe) => (
              <Link
                key={recipe.id}
                to={`/recipes/${recipe.id}`}
                className="recipe-card"
              >
                {recipe.cover_image_path && (
                  <img
                    src={recipe.cover_image_path.startsWith("http")
                      ? recipe.cover_image_path
                      : `${API_URL}/${recipe.cover_image_path}`}
                    alt={recipe.title}
                  />
                )}
                <div className="recipe-card-content">
                  <h3>{recipe.title}</h3>
                  <p>{recipe.description}</p>
                  {recipe.likes !== undefined && (
                    <p className="card-likes">❤️ Likes: {recipe.likes}</p>
                  )}
                </div>
              </Link>

            ))
          )}
        </div>
      </div>
    </div>
  );
}
