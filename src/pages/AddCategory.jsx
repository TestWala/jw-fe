import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import categoriesApi from "../api/categoriesApi";
import "./AddCategory.css";

export default function AddArticle() {
  const { reload, purity } = useContext(AppContext);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    metalType: "",
    purityId: "",
    profitPercentage: "",
    currentQuantity: 0,
    minimumStockLevel: 1,
    reorderLevel: 2,
    maximumStockLevel: "",
    location: "",
    active: true,
    notes: "",
  });

  async function submit(e) {
    e.preventDefault();
    setError("");

    /* ---------- REQUIRED VALIDATIONS ---------- */
    if (!form.code.trim()) return setError("Category code is required");
    if (!form.name.trim()) return setError("Category name is required");
    if (!form.metalType) return setError("Metal type is required");
    if (!form.purityId) return setError("Purity is required");

    const profit = Number(form.profitPercentage);
    if (isNaN(profit) || profit < 0) {
      return setError("Profit percentage must be 0 or greater");
    }

    /* ---------- STOCK VALIDATION ---------- */
    const min = Number(form.minimumStockLevel);
    const reorder = Number(form.reorderLevel);
    const max = Number(form.maximumStockLevel || 0);

    if (reorder < min) {
      return setError("Reorder level cannot be less than minimum stock");
    }

    if (max && max < reorder) {
      return setError("Maximum stock cannot be less than reorder level");
    }

    const payload = {
      ...form,
      profitPercentage: profit,
      currentQuantity: Number(form.currentQuantity),
      minimumStockLevel: min,
      reorderLevel: reorder,
      maximumStockLevel: max || null,
    };

    try {
      const res = await categoriesApi.createCategory(payload);

      if (!res.success) {
        setError(res.error || "Failed to create category");
        return;
      }

      alert("Category added successfully");
      reload();

      /* RESET FORM */
      setForm({
        code: "",
        name: "",
        description: "",
        metalType: "",
        purityId: "",
        profitPercentage: "",
        currentQuantity: 0,
        minimumStockLevel: 1,
        reorderLevel: 2,
        maximumStockLevel: "",
        location: "",
        active: true,
        notes: "",
      });

    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  }

  return (
    <div className="addcategory-form">
      <form onSubmit={submit}>

        {error && <div className="form-error">{error}</div>}

        <div className="grid-2">
          <div>
            <label>
              Code <b className="filed-mendatory">*</b>
            </label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
          </div>

          <div>
            <label>
              Name <b className="filed-mendatory">*</b>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
        </div>

        <label>Description</label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        {/* METAL & PURITY */}
        <h3 className="section-title">Metal Details</h3>

        <div className="grid-2">
          <div>
            <label>
              Metal Type <b className="filed-mendatory">*</b>
            </label>
            <select
              value={form.metalType}
              onChange={(e) =>
                setForm({ ...form, metalType: e.target.value })
              }
              required
            >
              <option value="">Select Metal</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="platinum">Platinum</option>
              <option value="diamond">Diamond</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label>
              Purity <b className="filed-mendatory">*</b>
            </label>
            <select
              value={form.purityId}
              onChange={(e) =>
                setForm({ ...form, purityId: e.target.value })
              }
              required
            >
              <option value="">Select Purity</option>
              {purity?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.metalType} ({p.karat}) – {p.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PROFIT & STOCK */}
        <h3 className="section-title">Profit & Stock</h3>

        <div className="grid-3">
          <div>
            <label>Profit Percentage (%)</label>
            <input
              type="number"
              step="0.01"
              value={form.profitPercentage}
              onChange={(e) =>
                setForm({ ...form, profitPercentage: e.target.value })
              }
            />
          </div>

          <div>
            <label>Minimum Stock</label>
            <input
              type="number"
              value={form.minimumStockLevel}
              onChange={(e) =>
                setForm({ ...form, minimumStockLevel: e.target.value })
              }
            />
          </div>

          <div>
            <label>Reorder Level</label>
            <input
              type="number"
              value={form.reorderLevel}
              onChange={(e) =>
                setForm({ ...form, reorderLevel: e.target.value })
              }
            />
          </div>

          <div>
            <label>Maximum Stock</label>
            <input
              type="number"
              value={form.maximumStockLevel}
              onChange={(e) =>
                setForm({ ...form, maximumStockLevel: e.target.value })
              }
            />
          </div>
        </div>

        {/* EXTRA */}
        <h3 className="section-title">Additional Info</h3>

        <label>Location</label>
        <input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <label>Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <button className="add-btn" type="submit">
          Add Category
        </button>
      </form>
    </div>
  );
}
