import { useEffect, useState } from "react";
import './Home.css'
import { Link } from "react-router-dom"

export default function Home() {
  const [popular, setPopular] = useState([]);
  const [latest, setLatest] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL;
  
  useEffect(() => {
    fetch(`${API_URL}/recipes/popular`)
      .then(res => res.json())
      .then(data => setPopular(data));

    fetch(`${API_URL}/recipes/latest`)
      .then(res => res.json())
      .then(data => setLatest(data));
  }, []);
  return (
    <div >
      <h1>Welcome to My Recipe App!</h1>
      <p>여기서 오늘의 추천 레시피를 찾아보세요</p>
      <div className="banners">
        <h2> 인기 메뉴 </h2>
        <div className="popular-list">
          {popular.length === 0 ? (
            <p>인기 메뉴 불러오는 중...</p>
          ) : (
            popular.map(recipe => (
              <Link
                key={recipe.id}
                to={`/recipes/${recipe.id}`}
                className="recipe-card">
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>
                <p>Likes:{recipe.likes}</p>
              </Link>

            ))
          )}
        </div>

        <h2> latest menus </h2>
        <div className="latest-list">
          {latest.length === 0 ? (
            <p> not found latest menus </p>
          ) : (
            latest.map(recipe => (
              <Link
                key={recipe.id}
                to={`/recipes/${recipe.id}`}
                className="recipe-card">
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>
              </Link>
            ))
          )}
        </div>

      </div>




    </div>
  );
}
