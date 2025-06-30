import { Link, useNavigate } from "react-router-dom";
import "./Header.css";


export default function Home() {
    const navigate = useNavigate();
  return (
    <header className="header">
        <h1>Header</h1>
        <Link to="/">Home</Link>
        <Link to="/recipes">Recipes</Link>
        <Link to="/fridge">Fridge</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/feedback">Feedback</Link>
        <Link to="/login">Login</Link>

    </header>
  );
}
