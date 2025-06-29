import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddRecipe() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    

    const handleSubmit = () => {
        if (!title || !description) {
            alert("put title and description!");
            return;
        }

        console.log(title, description);

        fetch("http://localhost:5000/recipes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title: title,
                description: description
            })
        })
            .then((res) =>
                res.json()
            )
            .then((data) => {
                console.log("answer", data);
                if (data.success) {
                    alert("success");
                    navigate('/recipes');
                } else {
                    alert("fail!");
                }
            })
            .catch((err) => {
                console.error("err", err);
            });
    };

    return (
        <div>
            <h1>add recipes</h1>

            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => {
                    setTitle(e.target.value)
                }}
            />
            <p>title: {title}</p>

            <textarea
                placeholder="description"
                value={description}
                onChange={(e) => {
                    setDescription(e.target.value)
                }}
            />
            <p>description: {description}</p>

            <button onClick={handleSubmit}>submit</button>

        </div >
    );
}
