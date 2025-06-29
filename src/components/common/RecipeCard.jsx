export default function RecipeCard({ recipe }) {
    return (
        <div
            style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                width: "200px"
            }}>
            <h3>{recipe.title}</h3>
            <p>{recipe.description}</p>
        </div>
    );
}
