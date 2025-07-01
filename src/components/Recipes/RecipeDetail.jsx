import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/recipes/${id}`)
      .then(res => res.json())
      .then(data => setRecipe(data));
  }, [id]);

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
    </div>
  );
}
