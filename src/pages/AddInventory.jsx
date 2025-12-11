import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { addInventoryItem } from "../api/inventoryApi";
import "./AddInventory.css";

export default function AddInventory() {
  const { reload, categories, userid, purity } = useContext(AppContext);
  const [weightError, setWeightError] = useState("");
  const [priceError, setPriceError] = useState("");

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
    e.preventDefault();

    if (!userid) {
      alert("User ID not found. Please log in again.");
      return;
    }
    if (weightError) {
      alert(weightError);
      return;
    }
    if (priceError) {
      alert(priceError);
      return;
    }

    // Required field validations
    if (!form.categoryId) return alert("Please select a category");
    if (!form.metalType) return alert("Please select a metal type");
    if (!form.purityId) return alert("Please select purity");

    // Number validations
    const grossWeight = Number(form.grossWeight);
    const netWeight = Number(form.netWeight);
    const purchasePrice = Number(form.purchasePrice);
    const sellingPrice = Number(form.sellingPrice);

    if (!grossWeight || grossWeight <= 0) {
      return alert("Gross weight must be greater than 0");
    }

    if (!netWeight || netWeight <= 0) {
      return alert("Net weight must be greater than 0");
    }

    if (grossWeight < netWeight) {
      return alert("Gross weight cannot be less than net weight");
    }

    if (!purchasePrice || purchasePrice <= 0) {
      return alert("Purchase price must be greater than 0");
    }

    if (!sellingPrice || sellingPrice <= 0) {
      return alert("Selling price must be greater than 0");
    }

    if (sellingPrice < purchasePrice) {
      return alert("Selling price cannot be less than purchase price");
    }

    // Stone validation
    if (form.hasStones) {
      const stoneWeight = Number(form.stoneWeight);
      if (!stoneWeight || stoneWeight <= 0) {
        return alert("Stone weight must be greater than 0 when item has stones");
      }
    }

    try {
      const payload = {
        ...form,
        grossWeight: Number(form.grossWeight),
        netWeight: Number(form.netWeight),
        stoneWeight: Number(form.stoneWeight || 0),
        purchasePrice: Number(form.purchasePrice),
        sellingPrice: Number(form.sellingPrice),
        makingCharges: Number(form.makingCharges || 0),
        wastageCharges: Number(form.wastageCharges || 0),
        stoneQuantity: Number(form.stoneQuantity || 0),
        currentQuantity: Number(form.currentQuantity),
        minimumStockLevel: Number(form.minimumStockLevel),
        reorderLevel: Number(form.reorderLevel),
        maximumStockLevel: Number(form.maximumStockLevel || 0),
        imageUrls: form.imageUrls
          ? form.imageUrls.split(",").map((x) => x.trim())
          : [],
        hallmarks: form.hallmarks
          ? form.hallmarks.split(",").map((x) => x.trim())
          : [],
      };

      console.log("Submitting Inventory Item:", payload);
      const response = await addInventoryItem(userid, payload);

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
      setWeightError("");
      setPriceError("");
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Something went wrong. Check console for details.");
    }
  }
  function handleGrossWeightChange(value) {
    const formatted = value ? Number(value).toFixed(2) : "";
    setForm({ ...form, grossWeight: value });

    // Check if net weight exceeds gross weight
    if (form.netWeight && Number(value) < Number(form.netWeight)) {
      setWeightError("Gross weight cannot be less than net weight");
    } else {
      setWeightError("");
    }
  }

  function handleNetWeightChange(value) {
    const formatted = value ? Number(value).toFixed(2) : "";
    setForm({ ...form, netWeight: value });

    // Check if net weight exceeds gross weight
    if (form.grossWeight && Number(value) > Number(form.grossWeight)) {
      setWeightError("Net weight cannot be more than gross weight");
    } else {
      setWeightError("");
    }
  }

  function formatWeightOnBlur(field, value) {
    if (value && !isNaN(value)) {
      setForm({ ...form, [field]: Number(value).toFixed(2) });
    }
  }
  function handlePurchasePriceChange(value) {
    setForm({ ...form, purchasePrice: value });

    // Check if selling price is less than purchase price
    if (form.sellingPrice && Number(form.sellingPrice) < Number(value)) {
      setPriceError("Selling price cannot be less than purchase price");
    } else {
      setPriceError("");
    }
  }

  function handleSellingPriceChange(value) {
    setForm({ ...form, sellingPrice: value });

    // Check if selling price is less than purchase price
    if (form.purchasePrice && Number(value) < Number(form.purchasePrice)) {
      setPriceError("Selling price cannot be less than purchase price");
    } else {
      setPriceError("");
    }
  }

  function formatPriceOnBlur(field, value) {
    if (value && !isNaN(value)) {
      setForm({ ...form, [field]: Number(value).toFixed(2) });
    }
  }

  return (
    <div className="addinventory-page">
      <h2>Add New Inventory Item</h2>

      <form className="addinventory-form" onSubmit={submit}>

        <div className="grid-2">
          <div>
            <label>Item Code<b className="filed-mendatory">*</b></label>
            <input
              value={form.itemCode}
              onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Short Name<b className="filed-mendatory">*</b></label>
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
            <label>Category<b className="filed-mendatory">*</b></label>
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
            <label>Metal Type<b className="filed-mendatory">*</b></label>
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

        <label>Purity<b className="filed-mendatory">*</b></label>
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
          <div>
            <label>
              Gross Weight (g)<b className="filed-mendatory">*</b>
            </label>
            <input
              type="number"
              step="0.01"
              value={form.grossWeight}
              onChange={(e) => handleGrossWeightChange(e.target.value)}
              onBlur={(e) => formatWeightOnBlur('grossWeight', e.target.value)}
              style={{
                borderColor: weightError && form.netWeight ? "#dc3545" : undefined
              }}
              required
            />
          </div>
          <div>
            <label>
              Net Weight (g)<b className="filed-mendatory">*</b>
            </label>
            <input
              type="number"
              step="0.01"
              value={form.netWeight}
              onChange={(e) => handleNetWeightChange(e.target.value)}
              onBlur={(e) => formatWeightOnBlur('netWeight', e.target.value)}
              style={{
                borderColor: weightError ? "#dc3545" : undefined
              }}
              required
            />
            {weightError && (
              <div style={{
                color: "#dc3545",
                fontSize: "0.875rem",
                marginTop: "0.25rem"
              }}>
                {weightError}
              </div>
            )}
          </div>
          <div>
            <label>Stone Weight (g)<b className="filed-mendatory"></b></label>
            <input
              type="number"
              step="0.01"
              value={form.stoneWeight}
              onChange={(e) => setForm({ ...form, stoneWeight: e.target.value })}
              onBlur={(e) => formatWeightOnBlur('stoneWeight', e.target.value)}
            />
          </div>
        </div>

        {/* ---------- PRICING ---------- */}
        {/* ---------- PRICING ---------- */}
        <h3 className="section-title">Pricing</h3>
        <div className="grid-3">
          <div>
            <label>Purchase Price<b className="filed-mendatory">*</b></label>
            <input
              type="number"
              step="0.01"
              value={form.purchasePrice}
              onChange={(e) => handlePurchasePriceChange(e.target.value)}
              onBlur={(e) => formatPriceOnBlur('purchasePrice', e.target.value)}
              style={{
                borderColor: priceError && form.sellingPrice ? "#dc3545" : undefined
              }}
              required
            />
          </div>

          <div>
            <label>
              Selling Price<b className="filed-mendatory">*</b>
            </label>
            <input
              type="number"
              step="0.01"
              value={form.sellingPrice}
              onChange={(e) => handleSellingPriceChange(e.target.value)}
              onBlur={(e) => formatPriceOnBlur('sellingPrice', e.target.value)}
              style={{
                borderColor: priceError ? "#dc3545" : undefined
              }}
              required
            />
            {priceError && (
              <div style={{
                color: "#dc3545",
                fontSize: "0.875rem",
                marginTop: "0.25rem"
              }}>
                {priceError}
              </div>
            )}
          </div>

          <div>
            <label>
              Making Charges<b className="filed-mendatory"></b>
            </label>
            <input
              type="number"
              step="0.01"
              value={form.makingCharges}
              onChange={(e) => setForm({ ...form, makingCharges: e.target.value })}
              onBlur={(e) => formatPriceOnBlur('makingCharges', e.target.value)}
            />
          </div>

          <div>
            <label>Wastage Charges<b className="filed-mendatory"></b></label>
            <input
              type="number"
              step="0.01"
              value={form.wastageCharges}
              onChange={(e) => setForm({ ...form, wastageCharges: e.target.value })}
              onBlur={(e) => formatPriceOnBlur('wastageCharges', e.target.value)}
            />
          </div>
        </div>


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

        {
          form.hasStones && (
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
          )
        }

        <label>Certificate Number</label>
        <input
          value={form.certificateNumber}
          onChange={(e) => setForm({ ...form, certificateNumber: e.target.value })}
        />

        {/* ---------- STOCK LEVELS ---------- */}
        <h3 className="section-title">Stock Levels</h3>
        <div className="grid-3">
          <div>
            <label>
              Current Quantity<b className="filed-mendatory">*</b></label>
            <input
              type="number"
              value={form.currentQuantity}
              onChange={(e) => setForm({ ...form, currentQuantity: e.target.value })}
            />
          </div>

          <div>
            <label>
              Minimum Stock Level</label>
            <input
              type="number"
              value={form.minimumStockLevel}
              onChange={(e) => setForm({ ...form, minimumStockLevel: e.target.value })}
            />
          </div>

          <div>
            <label>
              Reorder Level</label>
            <input
              type="number"
              value={form.reorderLevel}
              onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
            />
          </div>

          <div>
            <label>Maximum Stock Level</label>
            <input
              type="number"
              value={form.maximumStockLevel}
              onChange={(e) => setForm({ ...form, maximumStockLevel: e.target.value })}
            />
          </div>
        </div>



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

      </form >

    </div >
  );
}
