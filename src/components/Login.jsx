import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Login Response:", data); // 이거는 data가 뭘 받아오는거지?
            if (data.access_token) {
                localStorage.setItem("token", data.access_token);
                alert("Login success!");
                navigate("/")
            } else {
                alert("Login failed");
            }
        })
        .catch(err => console.log(err));
    };



return (
    <div style={{ padding: "2rem" }}>
        <h1>Login</h1>

        <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        /><br /><br />

        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        /> <br /><br />

        <p>username: {username}</p>
        <p>passwrod: {password}</p>

        <button onClick={handleLogin}>Login</button>


    </div >
);
}