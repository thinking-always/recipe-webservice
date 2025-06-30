import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddRecipe() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const navigate = useNavigate();
    const [coverImage, setCoverImage] = useState();

    const [steps, setSteps] = useState([{image:null,text:""}]);

    const token = localStorage.getItem("token");


    const handleSubmit = () => {
        if (!title) {
            alert("put title and description!");
            return;
        }

        console.log(title, description);

        const formData = new FormData();
        formData.append("title",title);
        formData.append("description",description);

        if (coverImage) {
            formData.append("coverImage", coverImage);
        }

        steps.forEach((step) => {
            if (step.image) {
                formData.append("stepImages", step.image);
            }
            formData.append("stepTexts", step.text);
        });

        fetch("http://localhost:5000/recipes", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        })
            .then((res) =>
                res.json()
            )
            .then((data) => {
                console.log("Server response", data);
                if (data.success) {
                    alert("Recipe added");
                    navigate('/recipes');
                } else {
                    alert("Save fail!");
                }
            })
            .catch((err) => {
                console.error("err", err);
            });
    };

    const handleAddStep = () => {
        setSteps([...steps, { image: null, text: "" }]);
    };

    const handleStepChange = (index, field, value) => {
        const updatedSteps = [...steps];
        updatedSteps[index][field] = value;
        setSteps(updatedSteps);
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

            <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files[0])}
            />
            <p>{coverImage ? `Selected: ${coverImage.name}` : "No image selected"}</p>

            <h2>Steps</h2>

            {steps.map((step, index) => (
                <div key={index} className="step-card">
                    <h3>Step</h3>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            handleStepChange(index, "image", e.target.files[0])
                        }
                    />

                    <p>
                        {step.image ? `Selected: ${step.image.name}` : "No Image"}
                    </p>

                    <textarea 
                    placeholder={`Step ${index + 1}description`}
                    value={step.text}
                    onChange={(e) => 
                        handleStepChange(index, "text", e.target.value)
                    }
                    />
                </div>
            ))}
            <button type="button" onClick={handleAddStep}>
                + Add step
            </button>




            <button onClick={handleSubmit}>submit</button>

        </div >
    );
}
