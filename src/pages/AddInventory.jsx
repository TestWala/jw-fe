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

    if(sellingPrice < purchasePrice) {
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

        {/* ITEM CODE */}
        <label>Item Code</label>
        <input
          value={form.itemCode}
          onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
          required
        />

        {/* SHORT NAME */}
        <label>Short Name</label>
        <input
          value={form.shortName}
          onChange={(e) => setForm({ ...form, shortName: e.target.value })}
          required
        />

        {/* DESCRIPTION */}
        <label>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* CATEGORY DROPDOWN */}
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

        {/* METAL TYPE (GOLD/SILVER/DIAMOND/ETC) */}
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

        {/* PURITY DROPDOWN */}
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

        {/* WEIGHTS */}
        <div className="grid-2">
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
        </div>

        {/* PRICING */}
        <label>Purchase Price</label>
        <input
          type="number"
          value={form.purchasePrice}
          onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
          required
        />

        <label>Selling Price</label>
        <input
          type="number"
          value={form.sellingPrice}
          onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
          required
        />

        <button className="add-btn" type="submit">
          Add Inventory Item
        </button>
      </form>
    </div>
  );
}
