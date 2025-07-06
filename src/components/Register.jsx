import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Auth.css';

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = () => {
    fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Register Response:", data);
        if (data.success) {
          alert("회원가입 성공! 로그인해주세요.");
          navigate("/login");
        } else {
          alert("회원가입 실패!");
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h1>Sign Up</h1>
        <input
          type="text"
          placeholder="New Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn" onClick={handleRegister}>Register</button>

        <p>
          이미 계정이 있나요?{" "}
          <span className="auth-link" onClick={() => navigate("/login")}>
            로그인 하기
          </span>
        </p>
      </div>
    </div>
  );
}
