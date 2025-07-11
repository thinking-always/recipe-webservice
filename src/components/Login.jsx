import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setAccessToken } = useContext(AuthContext);
  
  const handleLogin = async () => {
    try {
      const res= await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username, password}),
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        localStorage.setItem("myapp_access_token", data.access_token);
        localStorage.setItem("myapp_refresh_token", data.refresh_token);
        setAccessToken(data.access_token);

        alert("successfully logged in!");
        navigate("/");
      } else {
        alert(data.msg || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("network error. Please try again later.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn" onClick={handleLogin}>Login</button>

        <p>
          Don't have an acccount?{" "}
          <span className="auth-link" onClick={() => navigate("/register")}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
