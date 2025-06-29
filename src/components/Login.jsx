import { useState } from "react";


export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const handleLogin = () =>{
        if(!username || !password) {
            alert("id and password required!");
            return;
        }

        console.log("id", username);
        console.log("password", password);

        localStorage.setItem("tokten", "FAKE-TOKEN-123");

        window.location.href= "/";
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Login</h1>

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            /><br /><br/>

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