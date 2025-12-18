// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import userApi from "../../api/userApi";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setForm(parsed);
    }
  }, []);

  if (!user) return <div className="profile-loading">Loading profile...</div>;

  const handleSave = async () => {
    localStorage.setItem("user", JSON.stringify(form));
    setUser(form);
    setEditMode(false);

    const res = await userApi.updateUser(user.id, {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email
    });

    if (!res.success) {
      alert(res.error || "Failed to update profile");
    }
  };

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      <div className="profile-card">
        {/* Full Name */}
        <div className="profile-field">
          <label>Full Name</label>
          {editMode ? (
            <input
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
            />
          ) : (
            <span>{user.fullName}</span>
          )}
        </div>

        {/* Username (readonly) */}
        <div className="profile-field">
          <label>Username</label>
          <span>{user.username}</span>
        </div>

        {/* Email */}
        <div className="profile-field">
          <label>Email</label>
          {editMode ? (
            <input
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          ) : (
            <span>{user.email}</span>
          )}
        </div>

        {/* Phone */}
        <div className="profile-field">
          <label>Phone</label>
          {editMode ? (
            <input
              value={form.phone || ""}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          ) : (
            <span>{user.phone || "-"}</span>
          )}
        </div>

        {/* Role */}
        <div className="profile-field">
          <label>Role</label>
          <span className={`role-badge ${user.role}`}>
            {user.role}
          </span>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          {editMode ? (
            <>
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setForm(user);
                  setEditMode(false);
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button className="edit-btn" onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
