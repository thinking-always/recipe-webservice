import { useEffect, useState } from "react";

export default function Fridge() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [expiry, setExpiry] = useState("");
  const [editingId, setEditingId] = useState(null);

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
        console.log("백엔드에서 받은 데이터", data);
        if (!Array.isArray(data)) {
          console.error("Expected array but got:", data);
          return;
        }
        setItems(data);
      });
  }, []);

  // ✅ POST
  const addItem = () => {
    fetch(`${API_URL}/fridge`, {
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
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setItems([...items, data]);
          setName("");
          setQuantity("");
          setUnit("");
          setExpiry("");
        } else {
          console.error("Add failed:", data);
        }
      });
  };

  // ✅ DELETE
  const deleteItem = (id) => {
    fetch(`${API_URL}/fridge/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete");
        }
        setItems(items.filter((item) => item.id !== id));
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
  };

  // ✅ PUT (저장)
  const saveEdit = () => {
    if (!editingId) return;

    fetch(`${API_URL}/fridge/${editingId}`, {
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
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setItems(items.map((item) => (item.id === editingId ? data : item)));
          setEditingId(null);
          setName("");
          setQuantity("");
          setUnit("");
          setExpiry("");
        } else {
          console.error("Edit failed:", data);
        }
      });
  };

  return (
    <div>
      <h1>Fridge page</h1>

      <ul>
        {Array.isArray(items) &&
          items.map((item) => (
            <li key={item.id}>
              {item.name} — {item.quantity} {item.unit} — 유통기한: {item.expiry_date}
              <button onClick={() => deleteItem(item.id)}>❌ Delete</button>
              <button onClick={() => startEdit(item)}>✏️ Edit</button>
            </li>
          ))}
      </ul>

      <div>
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
      </div>
    </div>
  );
}
