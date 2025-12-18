import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import "./Categories.css";
import AddCategory from "./AddCategory.jsx";

export default function Categories() {
  const { categories, purity } = useContext(AppContext);

  const [search, setSearch] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  const getPurityName = (purityId) => {
    if (!purity || !purityId) return "-";
    const p = purity.find((x) => x.id === purityId);
    return p ? `${p.metalType} (${p.karat})` : "-";
  };

  /* ================= SHOW ADD CATEGORY ================= */
  if (showAddCategory) {
    return (
      <div className="categories-page">
        <div className="page-header">
          <h2>Add Article</h2>

          <button
            className="secondary-btn"
            onClick={() => setShowAddCategory(false)}
          >
            ← Back to Articles
          </button>
        </div>

        <AddCategory />
      </div>
    );
  }

  /* ================= CATEGORY LIST ================= */
  const filteredCategories = categories.filter((cat) =>
    [
      cat.code,
      cat.name,
      cat.metalType,
      getPurityName(cat.purityId),
      cat.location,
      cat.notes,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="categories-page">
      {/* HEADER */}
      <div className="page-header">
        <h2>Articles</h2>

        <button
          className="primary-btn"
          onClick={() => setShowAddCategory(true)}
        >
          + Add Article
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="search-box"
        placeholder="Search by Code, Name, Metal, Location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <div className="category-table-wrapper">
        <table className="categories-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Metal</th>
              <th>Purity</th>
              <th>Profit %</th>
              <th>Unit</th> 
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredCategories.map((cat) => (
              <tr
                key={cat.id}
                className={
                  cat.currentQuantity <= cat.reorderLevel
                    ? "row-low-stock"
                    : ""
                }
              >
                <td>{cat.code}</td>
                <td>{cat.name}</td>
                <td>{cat.metalType}</td>
                <td>{getPurityName(cat.purityId)}</td>
                <td>{cat.profitPercentage}%</td>
                <td>{cat.currentQuantity}</td>
                <td>{cat.location || "-"}</td>
                <td>
                  <span
                    className={`status-badge ${
                      cat.active ? "active" : "inactive"
                    }`}
                  >
                    {cat.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}

            {filteredCategories.length === 0 && (
              <tr>
                <td colSpan="11" className="empty-text">
                  No articles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
