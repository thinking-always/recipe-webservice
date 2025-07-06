import { useParams, useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";


export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/recipes/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => setRecipe(data))
      .catch(err => {
        console.error(err);
        // 필요하면 상태 업데이트: "레시피가 존재하지 않습니다"
      });

  }, [id]);

  const handleDelete = async () => {
    const res = await fetch (`${API_URL}/recipes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
  },
    });

    if (res.ok) {
      alert("Deleted.");
      console.log("Delete successful.");
      navigate('/recipes');
    } else {
      console.log("Delete failed.");
    }
};

  if (!recipe) return <div>Loading...</div>;

  return (
    <div>
      <h1>{recipe.title}</h1>
      <p>{recipe.description}</p>
      <img src={`http://localhost:5000/${recipe.cover_image_path}`} alt="" width="200" />
      <h2>Steps</h2>
      {recipe.steps && recipe.steps.map((s) => (
        <div key={s.step_number}>
          <h3>Step {s.step_number}</h3>
          {s.image_path && (
            <img src={`http://localhost:5000/${s.image_path}`} alt="" width="100" />
          )}
          <p>{s.text}</p>
        </div>
      ))}
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
