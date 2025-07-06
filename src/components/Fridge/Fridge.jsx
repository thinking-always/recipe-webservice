import { useEffect, useState } from "react";
import "./Fridge.css";

export default function Fridge() {
  const [items, setItems] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [expiry, setExpiry] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeSection, setActiveSection] = useState("fridge");

  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL;

  // ✅ GET
  useEffect(() => {
    if (!token) {
      alert("No token found, please login!");
      window.location.href = "/login";
      return;
    }

    fetch(`${API_URL}/fridge`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          alert("Token expired! Please login again.");
          window.location.href = "/login";
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Expected array but got:", data);
          return;
        }
        setItems(data);
      });

    fetch(`${API_URL}/pantry`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          alert("Token expired! Please login again.");
          window.location.href = "/login";
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Expected array but got:", data);
          return;
        }
        setPantryItems(data);
      });
  }, []);

  // ✅ POST (fridge만 예시)
  const addItem = () => {
    fetch(`${API_URL}/ingredients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name,
        quantity: parseFloat(quantity),
        unit: unit,
        expiry_date: expiry ? expiry : null,
        type: activeSection
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          if (activeSection === "fridge") {
            setItems([...items, data]);
          } else {
            setPantryItems([...pantryItems, data]);
          }
          setName("");
          setQuantity("");
          setUnit("");
          setExpiry("");
        } else {
          console.error("Add failed:", data);
        }
      });
  };

  // ✅ DELETE (fridge만 예시)
  const deleteItem = (id) => {
    fetch(`${API_URL}/ingredients/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete");
        }
        if (activeSection === "fridge") {
          setItems(items.filter((item) => item.id !== id));
        } else {
          setPantryItems(pantryItems.filter((item) => item.id !== id));
        }
      })
      .catch((err) => console.error(err));
  };

  // ✅ EDIT 시작
  const startEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setExpiry(item.expiry_date);
    setActiveSection(item.type);
  };

  // ✅ PUT (저장)
  const saveEdit = () => {
    if (!editingId) return;

    fetch(`${API_URL}/ingredients/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name,
        quantity: parseFloat(quantity),
        unit: unit,
        expiry_date: expiry ? expiry : null,
        type: activeSection,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          if (activeSection === "fridge") {
            setItems(items.map((item) => (item.id === editingId ? data : item)));
          } else {
            setPantryItems(pantryItems.map((item) => (item.id === editingId ? data : item)));
          }
          setEditingId(null);
          setName("");
          setQuantity("");
          setUnit("");
          setExpiry("");
          setActiveSection("fridge");
        } else {
          console.error("Edit failed:", data);
        }
      });
  };

  return (
    <div className="ingredient-page">
      <div className="sections-wrapper">
        <div className="fridge-section">
          <h2>Fridge ingredients</h2>
          <button
            onClick={() => {
              setShowModal(true);
              setActiveSection("fridge");
            }}
          >
            manage Ingredient
          </button>
        </div>

        <div className="pantry-section">
          <h2>Pantry ingredients</h2>
          <button
            onClick={() => {
              setShowModal(true);
              setActiveSection("pantry");
            }}
          >
            manage Ingredient
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            {/* left: ingredient list */}
            <div className="ingredient-list">
              <h3 className="ingredients">
                {activeSection === "fridge" ? "Fridge" : "Pantry"} Ingredients
              </h3>
              <ul>
                {Array.isArray(activeSection === "fridge" ? items : pantryItems) &&
                  (activeSection === "fridge" ? items : pantryItems).map(
                    (item) => (
                      <li key={item.id}>
                        {item.name} - {item.quantity} {item.unit} - 유통기한:{" "}
                        {item.expiry_date}
                        <button onClick={() => deleteItem(item.id)}>delete</button>
                        <button onClick={() => startEdit(item)}>edit</button>
                      </li>
                    )
                  )}
              </ul>
            </div>

            {/* right: add ingredient form */}
            <div className="ingredient-form">
              <h3 className="add-ingredients">Add new ingredients</h3>
              <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <input
                placeholder="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
              <input
                type="date"
                placeholder="Expiry Date (YYYY-MM-DD)"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
              {editingId ? (
                <button onClick={saveEdit}>Save Edit</button>
              ) : (
                <button onClick={addItem}>Add</button>
              )}
              <button
                className="close-button"
                onClick={() => {
                  setShowModal(false);
                  setActiveSection("fridge");
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
}
