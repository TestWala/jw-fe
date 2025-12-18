// src/components/users/UserModal.jsx
import { useState } from "react";
import userApi from "../../api/userApi";
import "./UserModal.css";

export default function UserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    fullName: user?.fullName || "",
    role: user?.role || "staff",
    phone: user?.phone || "",
    isActive: user?.isActive ?? true
  });

  const submit = async () => {
    const res = user
      ? await userApi.updateUser(user.id, form)
      : await userApi.registerUser(form);

    if (res.success) onSaved();
    else alert(res.error);
  };

  return (
    <div className="modal-bg">
      <div className="modal-box">
        <h3>{user ? "Update User" : "Add User"}</h3>

        <input placeholder="Full Name"
          value={form.fullName}
          onChange={e => setForm({ ...form, fullName: e.target.value })} />

        <input placeholder="Username"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })} />

        <input placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} />

        {!user && (
          <input type="password" placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} />
        )}

        <select
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
        >
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>

        <input placeholder="Phone"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })} />

        <div className="modal-actions">
          <button onClick={submit} className="save">Save</button>
          <button onClick={onClose} className="cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
}
