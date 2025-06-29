import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
  return (
    <header style={{ padding: "1rem", background: "#eee"}}>
        <h1>Header</h1>
        <button
        onClick={() => navigate("/recipes")}>전체 레시피 보기</button>
    </header>
  );
}
