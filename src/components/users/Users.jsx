// src/pages/Users.jsx
import { useEffect, useState } from "react";
import userApi from "../../api/userApi";
import UserModal from "./UserModal";
import "./Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const loadUsers = async () => {
  const res = await userApi.getAllUsers();

  if (res.success) {
    const rolePriority = {
      owner: 1,
      admin: 2,
      manager: 3,
      staff: 4,
    };

    const sortedUsers = [...res.data].sort((a, b) => {
      return (
        (rolePriority[a.role] || 99) -
        (rolePriority[b.role] || 99)
      );
    });

    setUsers(sortedUsers);
  }
};

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="users-page">
      <div className="users-header">
        <h2>Manage Users</h2>
        <button onClick={() => { setEditUser(null); setShowModal(true); }}>
          + Add User
        </button>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Role</th>
            <th>Status</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.fullName}</td>
              <td>{u.username}</td>
              <td className="role">{u.role}</td>
              <td>{u.isActive ? "Active" : "Disabled"}</td>
              <td>{u.phone}</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => {
                    setEditUser(u);
                    setShowModal(true);
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <UserModal
          user={editUser}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            loadUsers();
          }}
        />
      )}
    </div>
  );
}
