import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { addInventoryItem } from "../api/inventoryApi";
import "./AddInventory.css";

export default function AddInventory() {
  const { reload, categories, userid, purity } = useContext(AppContext);

  const [form, setForm] = useState({
    itemCode: "",
    shortName: "",
    description: "",
    categoryId: "",
    metalType: "",
    purityId: "",
    grossWeight: "",
    netWeight: "",
    stoneWeight: "",
    purchasePrice: "",
    sellingPrice: "",
    makingCharges: "",
    wastageCharges: "",
    hasStones: false,
    stoneType: "",
    stoneQuantity: "",
    stoneQuality: "",
    certificateNumber: "",
    currentQuantity: 1,
    minimumStockLevel: 1,
    reorderLevel: 2,
    maximumStockLevel: "",
    location: "",
    barcode: "",
    imageUrls: "",
    hallmarks: "",
    notes: "",
    isActive: true,
  });

  async function submit(e) {
    if (!userid) {
      alert("User ID not found. Please log in again.");
      return;
    }
    const { grossWeight, netWeight, purchasePrice, sellingPrice } = form;

    if (grossWeight <= 0) {
      return alert("Gross weight must be greater than 0");
    }

    if (netWeight <= 0) {
      return alert("Net weight must be greater than 0");
    }

    if (grossWeight < netWeight) {
      return alert("Gross weight cannot be less than net weight");
    }

    if (sellingPrice < purchasePrice) {
      return alert("Selling price cannot be less than purchase price");
    }

    e.preventDefault();

    try {
      const payload = {
        ...form,
        grossWeight: Number(form.grossWeight),
        netWeight: Number(form.netWeight),
        stoneWeight: Number(form.stoneWeight || 0),
        purchasePrice: Number(form.purchasePrice),
        sellingPrice: Number(form.sellingPrice),
        makingCharges: Number(form.makingCharges),
        wastageCharges: Number(form.wastageCharges),
        stoneQuantity: Number(form.stoneQuantity),
        currentQuantity: Number(form.currentQuantity),
        minimumStockLevel: Number(form.minimumStockLevel),
        reorderLevel: Number(form.reorderLevel),
        maximumStockLevel: Number(form.maximumStockLevel),
        imageUrls: form.imageUrls
          ? form.imageUrls.split(",").map((x) => x.trim())
          : [],
        hallmarks: form.hallmarks
          ? form.hallmarks.split(",").map((x) => x.trim())
          : [],
      };

      console.log("Submitting Inventory Item:", payload);
      const response = await addInventoryItem(userid,
        payload
      );

      if (!response.success) {
        alert("Failed to add item: " + response.error);
        console.error("API Error:", response.error);
        return;
      }

      reload();
      alert("Inventory Item Added Successfully");

      // Reset Form
      setForm({
        itemCode: "",
        shortName: "",
        description: "",
        categoryId: "",
        metalType: "",
        purityId: "",
        grossWeight: "",
        netWeight: "",
        stoneWeight: "",
        purchasePrice: "",
        sellingPrice: "",
        makingCharges: "",
        wastageCharges: "",
        hasStones: false,
        stoneType: "",
        stoneQuantity: "",
        stoneQuality: "",
        certificateNumber: "",
        currentQuantity: 1,
        minimumStockLevel: 1,
        reorderLevel: 2,
        maximumStockLevel: "",
        location: "",
        barcode: "",
        imageUrls: "",
        hallmarks: "",
        notes: "",
        isActive: true,
      });
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Something went wrong. Check console for details.");
    }
  }


  return (
    <div className="addinventory-page">
      <h2>Add New Inventory Item</h2>

      <form className="addinventory-form" onSubmit={submit}>

        <div className="grid-2">
          <div>
            <label>Item Code</label>
            <input
              value={form.itemCode}
              onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Short Name</label>
            <input
              value={form.shortName}
              onChange={(e) => setForm({ ...form, shortName: e.target.value })}
              required
            />
          </div>
        </div>

        <label>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* ---------- CATEGORY & METAL ---------- */}
        <h3 className="section-title">Category & Metal Info</h3>

        <div className="grid-2">
          <div>
            <label>Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.description})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Metal Type</label>
            <select
              value={form.metalType}
              onChange={(e) => setForm({ ...form, metalType: e.target.value })}
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
        </div>

        <label>Purity</label>
        <select
          value={form.purityId}
          onChange={(e) => setForm({ ...form, purityId: e.target.value })}
        >
          <option value="">Select Purity</option>
          {purity?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.metalType} ({p.karat}) – {p.description}
            </option>
          ))}
        </select>

        {/* ---------- WEIGHT DETAILS ---------- */}
        <h3 className="section-title">Weights</h3>
        <div className="grid-3">
          <label>
            Gross Weight (g)
            <input
              type="number"
              value={form.grossWeight}
              onChange={(e) => setForm({ ...form, grossWeight: e.target.value })}
              required
            />
          </label>

          <label>
            Net Weight (g)
            <input
              type="number"
              value={form.netWeight}
              onChange={(e) => setForm({ ...form, netWeight: e.target.value })}
              required
            />
          </label>

          <label>
            Stone Weight (g)
            <input
              type="number"
              value={form.stoneWeight}
              onChange={(e) => setForm({ ...form, stoneWeight: e.target.value })}
            />
          </label>
        </div>

        {/* ---------- PRICING ---------- */}
        <h3 className="section-title">Pricing</h3>
        <div className="grid-3">
          <label>
            Purchase Price
            <input
              type="number"
              value={form.purchasePrice}
              onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
              required
            />
          </label>

          <label>
            Selling Price
            <input
              type="number"
              value={form.sellingPrice}
              onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
              required
            />
          </label>

          <label>
            Making Charges
            <input
              type="number"
              value={form.makingCharges}
              onChange={(e) => setForm({ ...form, makingCharges: e.target.value })}
            />
          </label>
        </div>

        <label>Wastage Charges</label>
        <input
          type="number"
          value={form.wastageCharges}
          onChange={(e) => setForm({ ...form, wastageCharges: e.target.value })}
        />

        {/* ---------- STONE INFO ---------- */}
        <h3 className="section-title">Stone Information</h3>

        <div className="checkbox-row">
          <input
            type="checkbox"
            checked={form.hasStones}
            onChange={(e) => setForm({ ...form, hasStones: e.target.checked })}
          />
          <label>Contains Stones</label>
        </div>

        {form.hasStones && (
          <div className="grid-3">
            <input
              placeholder="Stone Type"
              value={form.stoneType}
              onChange={(e) => setForm({ ...form, stoneType: e.target.value })}
            />
            <input
              placeholder="Stone Quantity"
              type="number"
              value={form.stoneQuantity}
              onChange={(e) => setForm({ ...form, stoneQuantity: e.target.value })}
            />
            <input
              placeholder="Stone Quality"
              value={form.stoneQuality}
              onChange={(e) => setForm({ ...form, stoneQuality: e.target.value })}
            />
          </div>
        )}

        <label>Certificate Number</label>
        <input
          value={form.certificateNumber}
          onChange={(e) => setForm({ ...form, certificateNumber: e.target.value })}
        />

        {/* ---------- STOCK LEVELS ---------- */}
        <h3 className="section-title">Stock Levels</h3>
        <div className="grid-3">
          <label>
            Current Quantity
            <input
              type="number"
              value={form.currentQuantity}
              onChange={(e) => setForm({ ...form, currentQuantity: e.target.value })}
            />
          </label>

          <label>
            Minimum Stock Level
            <input
              type="number"
              value={form.minimumStockLevel}
              onChange={(e) => setForm({ ...form, minimumStockLevel: e.target.value })}
            />
          </label>

          <label>
            Reorder Level
            <input
              type="number"
              value={form.reorderLevel}
              onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
            />
          </label>
        </div>

        <label>Maximum Stock Level</label>
        <input
          type="number"
          value={form.maximumStockLevel}
          onChange={(e) => setForm({ ...form, maximumStockLevel: e.target.value })}
        />

        {/* ---------- EXTRA INFO ---------- */}
        <h3 className="section-title">Additional Info</h3>

        <label>Location</label>
        <input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <label>Barcode</label>
        <input
          value={form.barcode}
          onChange={(e) => setForm({ ...form, barcode: e.target.value })}
        />

        <label>Image URLs (comma separated)</label>
        <input
          value={form.imageUrls}
          onChange={(e) => setForm({ ...form, imageUrls: e.target.value })}
        />

        <label>Hallmarks (comma separated)</label>
        <input
          value={form.hallmarks}
          onChange={(e) => setForm({ ...form, hallmarks: e.target.value })}
        />

        <label>Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        {/* ---------- SUBMIT BUTTON ---------- */}
        <button className="add-btn" type="submit">
          Add Inventory Item
        </button>

      </form>

    </div>
  );
}
