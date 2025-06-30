import { use, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function RecipeDetail() {
  const {id} = useParams();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/recipes/${id}`)
    .then(res => res.json())
    .then(data => setRecipe(data));
  }, [id]);

  if (!recipe) {
    return <p>Loading ...</p>
  }

  return (
    <div>
      <h1>{recipe.title}</h1>
      <p>{recipe.description}</p>
      <p>{recipe.likes}</p>
    </div>
  );
}
