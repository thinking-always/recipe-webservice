import { Link } from "react-router-dom";
import { useState } from "react";
import "./Header.css";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="header">
      <div className="left">
        <button className="burger" onClick={toggleMenu}>☰</button>
        
        <h1 className="logo">My App</h1>
      </div>

      <nav className={`nav-links ${isOpen ? "open" : ""}`}>
        <Link to="/">Home</Link>
        <Link to="/recipes">Recipes</Link>
        <Link to="/fridge">Fridge</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/feedback">Feedback</Link>
        <Link to="/login">Login</Link>
      </nav>
    </header>
  );
}
