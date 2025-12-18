import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import purchaseApi from "../api/purchaseApi";
import AddSupplierModal from "./AddSupplierModal";
import "./Purchase.css";

export default function PurchaseOrder() {
  const { categories, purity, suppliers, reload } = useContext(AppContext);

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [errors, setErrors] = useState({});

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [purchaseOrder, setPurchaseOrder] = useState({
    poNumber: "PO-" + Date.now(),
    supplierId: "",
    expectedDeliveryDate: getTodayDate(),
    subtotal: 0,
    discountAmount: 0,
    taxPercentage: 0,
    taxAmount: 0,
    shippingCharges: 0,
    finalAmount: 0,
    paymentTerms: "",
    deliveryTerms: "",
    notes: "",
    items: []
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [itemForm, setItemForm] = useState({
    categoryId: "",
    itemCode: "",
    categoryName: "",
    metalType: "",
    purityId: "",
    grossWeight: 1,
    netWeight: "",
    stoneWeight: 0,
    wastageWeight: 0,
    quantity: 1,
    purchaseRate: "",
    purchasePrice: "",
    makingCharges: 0,
    profitPercentage: 20,
    sellingPrice: "",
    status: "IN_STOCK",
    stoneType: "",
    stoneQuality: "",
    certificateNumber: "",
    barcode: "",
    itemNotes: ""
  });

  function getPurityLabel(purityId) {
    const p = purity.find(pr => pr.id === purityId);
    return p ? `${p.karat} (${p.purityPercentage}%)` : "";
  }

  function getFilteredPurities(metalType) {
    if (!metalType) return [];
    return purity.filter(p => p.metalType === metalType);
  }

  function validateItemForm() {
    const newErrors = {};

    if (!selectedCategoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (!itemForm.quantity || Number(itemForm.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (!itemForm.netWeight || Number(itemForm.netWeight) <= 0) {
      newErrors.netWeight = "Net weight must be greater than 0";
    }

    if (itemForm.grossWeight && Number(itemForm.grossWeight) < Number(itemForm.netWeight)) {
      newErrors.grossWeight = "Gross weight cannot be less than net weight";
    }

    if (!itemForm.purchaseRate || Number(itemForm.purchaseRate) <= 0) {
      newErrors.purchaseRate = "Purchase rate must be greater than 0";
    }

    if (!itemForm.purityId) {
      newErrors.purityId = "Purity is required";
    }

    if (itemForm.makingCharges && Number(itemForm.makingCharges) < 0) {
      newErrors.makingCharges = "Making charges cannot be negative";
    }

    if (itemForm.profitPercentage && Number(itemForm.profitPercentage) < 0) {
      newErrors.profitPercentage = "Profit percentage cannot be negative";
    }

    if (itemForm.stoneWeight && Number(itemForm.stoneWeight) < 0) {
      newErrors.stoneWeight = "Stone weight cannot be negative";
    }

    if (itemForm.wastageWeight && Number(itemForm.wastageWeight) < 0) {
      newErrors.wastageWeight = "Wastage weight cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function clearError(fieldName) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }

  function handleCategorySelect(id) {
    setSelectedCategoryId(id);
    clearError('categoryId');

    const category = categories.find(c => c.id === id);

    if (category) {
      setItemForm({
        ...itemForm,
        categoryId: category.id,
        itemCode: category.code,
        categoryName: category.name,
        metalType: category.metalType,
        purityId: category.purityId,
        profitPercentage: category.profitPercentage || 20,
        grossWeight: 1,
        netWeight: "",
        stoneWeight: 0,
        wastageWeight: 0,
        quantity: 1,
        purchaseRate: "",
        purchasePrice: "",
        makingCharges: 0,
        sellingPrice: "",
        status: "IN_STOCK",
        stoneType: "",
        stoneQuality: "",
        certificateNumber: "",
        barcode: "",
        itemNotes: ""
      });
    }
  }

  function calculatePurchasePrice(netWeight, purchaseRate) {
    const weight = Number(netWeight) || 0;
    const rate = Number(purchaseRate) || 0;
    return weight * rate;
  }

  function calculateSellingPrice(purchasePrice, makingCharges, profitPercentage) {
    const price = Number(purchasePrice) || 0;
    const making = Number(makingCharges) || 0;
    const profit = Number(profitPercentage) || 0;

    const totalCost = price + making;
    return totalCost * (1 + profit / 100);
  }

  function handleNetWeightChange(value) {
    const netWeight = value;
    clearError('netWeight');
    
    if (itemForm.grossWeight && Number(value) > Number(itemForm.grossWeight)) {
      setErrors(prev => ({
        ...prev,
        netWeight: "Net weight cannot exceed gross weight"
      }));
    } else {
      clearError('grossWeight');
    }

    const purchasePrice = calculatePurchasePrice(netWeight, itemForm.purchaseRate);
    const sellingPrice = calculateSellingPrice(
      purchasePrice,
      itemForm.makingCharges,
      itemForm.profitPercentage
    );

    setItemForm({
      ...itemForm,
      netWeight,
      purchasePrice: purchasePrice.toFixed(2),
      sellingPrice: sellingPrice.toFixed(2)
    });
  }

  function handleGrossWeightChange(value) {
    clearError('grossWeight');
    
    if (itemForm.netWeight && Number(value) < Number(itemForm.netWeight)) {
      setErrors(prev => ({
        ...prev,
        grossWeight: "Gross weight cannot be less than net weight"
      }));
    } else {
      clearError('netWeight');
    }
    
    setItemForm({ ...itemForm, grossWeight: value });
  }

  function handlePurchaseRateChange(value) {
    clearError('purchaseRate');
    const purchaseRate = value;
    const purchasePrice = calculatePurchasePrice(itemForm.netWeight, purchaseRate);
    const sellingPrice = calculateSellingPrice(
      purchasePrice,
      itemForm.makingCharges,
      itemForm.profitPercentage
    );

    setItemForm({
      ...itemForm,
      purchaseRate,
      purchasePrice: purchasePrice.toFixed(2),
      sellingPrice: sellingPrice.toFixed(2)
    });
  }

  function handleMakingChargesChange(value) {
    clearError('makingCharges');
    const makingCharges = value;
    const sellingPrice = calculateSellingPrice(
      itemForm.purchasePrice,
      makingCharges,
      itemForm.profitPercentage
    );

    setItemForm({
      ...itemForm,
      makingCharges,
      sellingPrice: sellingPrice.toFixed(2)
    });
  }

  function handleProfitPercentageChange(value) {
    clearError('profitPercentage');
    const profitPercentage = value;
    const sellingPrice = calculateSellingPrice(
      itemForm.purchasePrice,
      itemForm.makingCharges,
      profitPercentage
    );

    setItemForm({
      ...itemForm,
      profitPercentage,
      sellingPrice: sellingPrice.toFixed(2)
    });
  }

  function handlePurityChange(value) {
    clearError('purityId');
    setItemForm({ ...itemForm, purityId: value });
  }

  function handleStoneWeightChange(value) {
    clearError('stoneWeight');
    setItemForm({ ...itemForm, stoneWeight: value });
  }

  function handleWastageWeightChange(value) {
    clearError('wastageWeight');
    setItemForm({ ...itemForm, wastageWeight: value });
  }

  function handleTaxPercentageChange(value) {
    const taxPercentage = Number(value) || 0;
    const subtotalAfterDiscount = purchaseOrder.subtotal - purchaseOrder.discountAmount;
    const taxAmount = (subtotalAfterDiscount * taxPercentage) / 100;
    const finalAmount = subtotalAfterDiscount + taxAmount + purchaseOrder.shippingCharges;

    setPurchaseOrder(prev => ({
      ...prev,
      taxPercentage,
      taxAmount: Number(taxAmount.toFixed(2)),
      finalAmount: Number(finalAmount.toFixed(2))
    }));
  }

  function addItem() {
    if (!validateItemForm()) {
      alert("Please fix the errors before adding the item");
      return;
    }

    const qty = Number(itemForm.quantity);
    const purchasePrice = Number(itemForm.purchasePrice);
    const making = Number(itemForm.makingCharges);
    const totalAmt = qty * (purchasePrice + making);

    const poItem = {
      categoryId: itemForm.categoryId,
      itemCode: itemForm.itemCode,
      categoryName: itemForm.categoryName,
      metalType: itemForm.metalType,
      purityId: itemForm.purityId,
      grossWeight: Number(itemForm.grossWeight) || 0,
      netWeight: Number(itemForm.netWeight),
      stoneWeight: Number(itemForm.stoneWeight) || 0,
      wastageWeight: Number(itemForm.wastageWeight) || 0,
      quantity: qty,
      purchaseRate: Number(itemForm.purchaseRate),
      purchasePrice: purchasePrice,
      makingCharges: making,
      profitPercentage: Number(itemForm.profitPercentage),
      sellingPrice: Number(itemForm.sellingPrice),
      status: itemForm.status,
      stoneType: itemForm.stoneType || null,
      stoneQuality: itemForm.stoneQuality || null,
      certificateNumber: itemForm.certificateNumber || null,
      barcode: itemForm.barcode || null,
      notes: itemForm.itemNotes || null,
      totalAmount: totalAmt
    };

    const updatedItems = [...purchaseOrder.items, poItem];

    updateTotals(
      updatedItems,
      purchaseOrder.discountAmount,
      purchaseOrder.taxPercentage,
      purchaseOrder.shippingCharges
    );

    setSelectedCategoryId("");
    setErrors({});
    setItemForm({
      categoryId: "",
      itemCode: "",
      categoryName: "",
      metalType: "",
      purityId: "",
      grossWeight: 1,
      netWeight: "",
      stoneWeight: 0,
      wastageWeight: 0,
      quantity: 1,
      purchaseRate: "",
      purchasePrice: "",
      makingCharges: 0,
      profitPercentage: 20,
      sellingPrice: "",
      status: "IN_STOCK",
      stoneType: "",
      stoneQuality: "",
      certificateNumber: "",
      barcode: "",
      itemNotes: ""
    });
  }

  function deleteItem(index) {
    const updatedItems = [...purchaseOrder.items];
    updatedItems.splice(index, 1);
    updateTotals(
      updatedItems,
      purchaseOrder.discountAmount,
      purchaseOrder.taxPercentage,
      purchaseOrder.shippingCharges
    );
  }

  function updateTotals(items, discount = 0, taxPercentage = 0, shipping = 0) {
    const subtotal = items.reduce((sum, it) => sum + it.totalAmount, 0);
    const subtotalAfterDiscount = subtotal - Number(discount);
    const taxAmount = (subtotalAfterDiscount * Number(taxPercentage)) / 100;
    const finalAmount = subtotalAfterDiscount + taxAmount + Number(shipping);

    setPurchaseOrder(prev => ({
      ...prev,
      items,
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(discount),
      taxPercentage: Number(taxPercentage),
      taxAmount: Number(taxAmount.toFixed(2)),
      shippingCharges: Number(shipping),
      finalAmount: Number(finalAmount.toFixed(2)),
    }));
  }

  function handleDiscountChange(value) {
    const discount = Number(value) || 0;
    updateTotals(
      purchaseOrder.items,
      discount,
      purchaseOrder.taxPercentage,
      purchaseOrder.shippingCharges
    );
  }

  function handleShippingChange(value) {
    const shipping = Number(value) || 0;
    updateTotals(
      purchaseOrder.items,
      purchaseOrder.discountAmount,
      purchaseOrder.taxPercentage,
      shipping
    );
  }

  function resetForm() {
    setPurchaseOrder({
      poNumber: "PO-" + Date.now(),
      supplierId: "",
      expectedDeliveryDate: getTodayDate(),
      subtotal: 0,
      discountAmount: 0,
      taxPercentage: 0,
      taxAmount: 0,
      shippingCharges: 0,
      finalAmount: 0,
      paymentTerms: "",
      deliveryTerms: "",
      notes: "",
      items: []
    });

    setSelectedCategoryId("");
    setErrors({});

    setItemForm({
      categoryId: "",
      itemCode: "",
      categoryName: "",
      metalType: "",
      purityId: "",
      grossWeight: 1,
      netWeight: "",
      stoneWeight: 0,
      wastageWeight: 0,
      quantity: 1,
      purchaseRate: "",
      purchasePrice: "",
      makingCharges: 0,
      profitPercentage: 20,
      sellingPrice: "",
      status: "IN_STOCK",
      stoneType: "",
      stoneQuality: "",
      certificateNumber: "",
      barcode: "",
      itemNotes: ""
    });
  }

  async function submitOrder() {
    const apiPayload = {
      poNumber: purchaseOrder.poNumber,
      supplierId: purchaseOrder.supplierId || null,
      expectedDeliveryDate: purchaseOrder.expectedDeliveryDate,
      subtotal: purchaseOrder.subtotal,
      discountAmount: purchaseOrder.discountAmount,
      taxPercentage: purchaseOrder.taxPercentage,
      taxAmount: purchaseOrder.taxAmount,
      shippingCharges: purchaseOrder.shippingCharges,
      finalAmount: purchaseOrder.finalAmount,
      paymentTerms: purchaseOrder.paymentTerms || null,
      deliveryTerms: purchaseOrder.deliveryTerms || null,
      notes: purchaseOrder.notes || null,
      items: purchaseOrder.items.map(item => ({
        categoryId: item.categoryId,
        itemCode: item.itemCode,
        grossWeight: item.grossWeight,
        netWeight: item.netWeight,
        stoneWeight: item.stoneWeight,
        wastageWeight: item.wastageWeight,
        purchaseRate: item.purchaseRate,
        purchasePrice: item.purchasePrice,
        makingCharges: item.makingCharges,
        profitPercentage: item.profitPercentage,
        sellingPrice: item.sellingPrice,
        purityId: item.purityId,
        status: item.status,
        stoneType: item.stoneType,
        stoneQuality: item.stoneQuality,
        certificateNumber: item.certificateNumber,
        barcode: item.barcode,
        notes: item.notes
      }))
    };

    console.log("Submitting PO:", apiPayload);
    const res = await purchaseApi.createPurchaseOrder(apiPayload);

    if (res.success) {
      alert("Purchase Order Created Successfully!");
      resetForm();
      reload();
      setShowSummary(false);
    } else {
      alert("Failed: " + (res.error || "Unknown error"));
    }
  }

  function handleSupplierSaved(supplier) {
    setPurchaseOrder(prev => ({ ...prev, supplierId: supplier.id }));
    reload();
  }

  const isSubmitDisabled = purchaseOrder.items.length === 0;

  return (
    <div className="purchase-page">
      <h2>Create Purchase Order</h2>

      <div className="supplier-select">
        <label>Supplier</label>
        <select
          value={purchaseOrder.supplierId}
          onChange={(e) =>
            setPurchaseOrder({ ...purchaseOrder, supplierId: e.target.value })
          }
        >
          <option value="">Select Supplier (Optional)</option>
          {suppliers.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.phone})
            </option>
          ))}
        </select>

        <button
          className="add-supplier-btn"
          onClick={() => setShowSupplierModal(true)}
        >
          + Add Supplier
        </button>
      </div>

      {showSupplierModal && (
        <AddSupplierModal
          onClose={() => setShowSupplierModal(false)}
          onSaved={handleSupplierSaved}
        />
      )}

      <div className="order-details-row">
        <div className="field">
          <label>Expected Delivery Date</label>
          <input
            type="date"
            value={purchaseOrder.expectedDeliveryDate}
            onChange={(e) =>
              setPurchaseOrder({ ...purchaseOrder, expectedDeliveryDate: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>Payment Terms</label>
          <input
            type="text"
            placeholder="e.g., Net 30"
            value={purchaseOrder.paymentTerms}
            onChange={(e) =>
              setPurchaseOrder({ ...purchaseOrder, paymentTerms: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>Delivery Terms</label>
          <input
            type="text"
            placeholder="e.g., FOB"
            value={purchaseOrder.deliveryTerms}
            onChange={(e) =>
              setPurchaseOrder({ ...purchaseOrder, deliveryTerms: e.target.value })
            }
          />
        </div>
      </div>

      <div className="add-item-section">
        <h3>Add Items to Purchase Order</h3>

        <div className="add-item-box">
          <div className={`field ${errors.categoryId ? 'field-error' : ''}`}>
            <label>Select Category *</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className={errors.categoryId ? 'input-error' : ''}
            >
              <option value="">-- Select Category --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name} ({c.metalType})
                </option>
              ))}
            </select>
            {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
          </div>

          {selectedCategoryId && (
            <>
              <div className="field">
                <label>Metal Type</label>
                <input
                  type="text"
                  value={itemForm.metalType}
                  readOnly
                  style={{ background: "#f5f5f5" }}
                />
              </div>

              <div className={`field ${errors.purityId ? 'field-error' : ''}`}>
                <label>Purity *</label>
                <select
                  value={itemForm.purityId}
                  onChange={(e) => handlePurityChange(e.target.value)}
                  className={errors.purityId ? 'input-error' : ''}
                  disabled={!itemForm.metalType}
                >
                  <option value="">-- Select Purity --</option>
                  {getFilteredPurities(itemForm.metalType).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.karat} ({p.purityPercentage}%) - {p.description}
                    </option>
                  ))}
                </select>
                {errors.purityId && <span className="error-message">{errors.purityId}</span>}
              </div>

              <div className={`field ${errors.grossWeight ? 'field-error' : ''}`}>
                <label>Gross Weight (g) *</label>
                <input
                  type="number"
                  step="0.001"
                  value={itemForm.grossWeight}
                  onChange={(e) => handleGrossWeightChange(e.target.value)}
                  className={errors.grossWeight ? 'input-error' : ''}
                />
                {errors.grossWeight && <span className="error-message">{errors.grossWeight}</span>}
              </div>

              <div className={`field ${errors.netWeight ? 'field-error' : ''}`}>
                <label>Net Weight (g) *</label>
                <input
                  type="number"
                  step="0.001"
                  value={itemForm.netWeight}
                  onChange={(e) => handleNetWeightChange(e.target.value)}
                  className={errors.netWeight ? 'input-error' : ''}
                />
                {errors.netWeight && <span className="error-message">{errors.netWeight}</span>}
              </div>

              <div className={`field ${errors.stoneWeight ? 'field-error' : ''}`}>
                <label>Stone Weight (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={itemForm.stoneWeight}
                  onChange={(e) => handleStoneWeightChange(e.target.value)}
                  className={errors.stoneWeight ? 'input-error' : ''}
                />
                {errors.stoneWeight && <span className="error-message">{errors.stoneWeight}</span>}
              </div>

              <div className={`field ${errors.wastageWeight ? 'field-error' : ''}`}>
                <label>Wastage Weight (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={itemForm.wastageWeight}
                  onChange={(e) => handleWastageWeightChange(e.target.value)}
                  className={errors.wastageWeight ? 'input-error' : ''}
                />
                {errors.wastageWeight && <span className="error-message">{errors.wastageWeight}</span>}
              </div>

              <div className={`field ${errors.purchaseRate ? 'field-error' : ''}`}>
                <label>Purchase Rate (₹/g) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={itemForm.purchaseRate}
                  onChange={(e) => handlePurchaseRateChange(e.target.value)}
                  className={errors.purchaseRate ? 'input-error' : ''}
                />
                {errors.purchaseRate && <span className="error-message">{errors.purchaseRate}</span>}
              </div>

              <div className="field">
                <label>Purchase Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={itemForm.purchasePrice}
                  readOnly
                  style={{ background: "#f5f5f5" }}
                />
              </div>

              <div className={`field ${errors.makingCharges ? 'field-error' : ''}`}>
                <label>Making Charges (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={itemForm.makingCharges}
                  onChange={(e) => handleMakingChargesChange(e.target.value)}
                  className={errors.makingCharges ? 'input-error' : ''}
                />
                {errors.makingCharges && <span className="error-message">{errors.makingCharges}</span>}
              </div>

              <div className={`field ${errors.profitPercentage ? 'field-error' : ''}`}>
                <label>Profit %</label>
                <input
                  type="number"
                  step="0.01"
                  value={itemForm.profitPercentage}
                  onChange={(e) => handleProfitPercentageChange(e.target.value)}
                  className={errors.profitPercentage ? 'input-error' : ''}
                />
                {errors.profitPercentage && <span className="error-message">{errors.profitPercentage}</span>}
              </div>

              <div className="field">
                <label>Selling Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={itemForm.sellingPrice}
                  readOnly
                  style={{ background: "#f5f5f5" }}
                />
              </div>

              <div className="field">
                <label>Status</label>
                <select
                  value={itemForm.status}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, status: e.target.value })
                  }
                >
                  <option value="IN_STOCK">In Stock</option>
                  <option value="SOLD">Sold</option>
                  <option value="RESERVED">Reserved</option>
                </select>
              </div>

              <div className="field">
                <label>Stone Type</label>
                <input
                  type="text"
                  placeholder="e.g., Diamond, Ruby"
                  value={itemForm.stoneType}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, stoneType: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Stone Quality</label>
                <input
                  type="text"
                  placeholder="e.g., VS1, VVS"
                  value={itemForm.stoneQuality}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, stoneQuality: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Certificate Number</label>
                <input
                  type="text"
                  placeholder="Certificate/Hallmark No."
                  value={itemForm.certificateNumber}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, certificateNumber: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Barcode</label>
                <input
                  type="text"
                  placeholder="Barcode"
                  value={itemForm.barcode}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, barcode: e.target.value })
                  }
                />
              </div>

              <div className="field field-full">
                <label>Item Notes</label>
                <input
                  type="text"
                  placeholder="Additional notes for this item"
                  value={itemForm.itemNotes}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, itemNotes: e.target.value })
                  }
                />
              </div>

              <div className="field add-btn-wrapper">
                <button
                  disabled={!selectedCategoryId}
                  className={!selectedCategoryId ? "btn-disabled" : ""}
                  onClick={selectedCategoryId ? addItem : undefined}
                >
                  Add Item to PO
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {purchaseOrder.items.length > 0 && (
        <div className="items-table-wrapper">
          <h3>Items in Purchase Order ({purchaseOrder.items.length})</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Purity</th>
                <th>Net Wt (g)</th>
                <th>Rate (₹/g)</th>
                <th>Purchase Price</th>
                <th>Making</th>
                <th>Selling Price</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {purchaseOrder.items.map((it, i) => (
                <tr key={i}>
                  <td>
                    <div className="item-category-cell">
                      <strong>{it.categoryName}</strong>
                      <small>{it.itemCode}</small>
                    </div>
                  </td>
                  <td>{getPurityLabel(it.purityId)}</td>
                  <td>{it.netWeight.toFixed(3)}</td>
                  <td>₹{it.purchaseRate.toFixed(2)}</td>
                  <td>₹{it.purchasePrice.toFixed(2)}</td>
                  <td>₹{it.makingCharges.toFixed(2)}</td>
                  <td>₹{it.sellingPrice.toFixed(2)}</td>
                  <td><strong>₹{it.totalAmount.toFixed(2)}</strong></td>
                  <td>
                    <button className="delete-btn" onClick={() => deleteItem(i)}>
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {purchaseOrder.items.length > 0 && (
        <div className="po-totals-box">
          <div className="totals-row">
            <span className="totals-label">Subtotal:</span>
            <span className="totals-value">₹{purchaseOrder.subtotal.toFixed(2)}</span>
          </div>

          <div className="totals-row">
            <label className="totals-label">
              Discount (₹):
              <input
                type="number"
                min="0"
                step="0.01"
                value={purchaseOrder.discountAmount}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="totals-input"
              />
            </label>
            <span className="totals-value discount">
              - ₹{purchaseOrder.discountAmount.toFixed(2)}
            </span>
          </div>

          <div className="totals-row">
            <label className="totals-label">
              Tax (%):
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={purchaseOrder.taxPercentage}
                onChange={(e) => handleTaxPercentageChange(e.target.value)}
                className="totals-input"
              />
            </label>
            <span className="totals-value tax">
              + ₹{purchaseOrder.taxAmount.toFixed(2)}
            </span>
          </div>

          <div className="totals-row">
            <label className="totals-label">
              Shipping (₹):
              <input
                type="number"
                min="0"
                step="0.01"
                value={purchaseOrder.shippingCharges}
                onChange={(e) => handleShippingChange(e.target.value)}
                className="totals-input"
              />
            </label>
            <span className="totals-value shipping">
              + ₹{purchaseOrder.shippingCharges.toFixed(2)}
            </span>
          </div>

          <div className="totals-row final">
            <span className="totals-label">Final Amount:</span>
            <span className="totals-value">₹{purchaseOrder.finalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}

      {purchaseOrder.items.length > 0 && (
        <div className="notes-section">
          <label>Purchase Order Notes</label>
          <textarea
            rows="3"
            placeholder="Additional notes or instructions for this purchase order..."
            value={purchaseOrder.notes}
            onChange={(e) =>
              setPurchaseOrder({ ...purchaseOrder, notes: e.target.value })
            }
          />
        </div>
      )}

      <button
        className={`save-purchase-submit-btn ${isSubmitDisabled ? "btn-disabled" : ""}`}
        onClick={() => {
          if (!isSubmitDisabled) {
            setShowSummary(true);
          }
        }}
        disabled={isSubmitDisabled}
      >
        Create Purchase Order
      </button>

      {showSummary && (
        <div className="summary-popup-backdrop">
          <div className="summary-popup">
            <h3>Purchase Order Summary</h3>

            <div className="summary-row">
              <span>PO Number:</span>
              <strong>{purchaseOrder.poNumber}</strong>
            </div>

            <div className="summary-row">
              <span>Supplier:</span>
              <strong>
                {purchaseOrder.supplierId
                  ? suppliers.find((s) => s.id === purchaseOrder.supplierId)?.name || "Unknown"
                  : "Not Selected"}
              </strong>
            </div>

            {purchaseOrder.expectedDeliveryDate && (
              <div className="summary-row">
                <span>Expected Delivery:</span>
                <strong>{purchaseOrder.expectedDeliveryDate}</strong>
              </div>
            )}

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Total Items:</span>
              <strong>{purchaseOrder.items.length}</strong>
            </div>

            <div className="summary-row">
              <span>Subtotal:</span>
              <strong>₹{purchaseOrder.subtotal.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Discount:</span>
              <strong className="discount">- ₹{purchaseOrder.discountAmount.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Tax ({purchaseOrder.taxPercentage}%):</span>
              <strong className="tax">+ ₹{purchaseOrder.taxAmount.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Shipping:</span>
              <strong className="shipping">+ ₹{purchaseOrder.shippingCharges.toFixed(2)}</strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Final Amount:</span>
              <strong>₹{purchaseOrder.finalAmount.toFixed(2)}</strong>
            </div>

            {purchaseOrder.paymentTerms && (
              <div className="summary-row">
                <span>Payment Terms:</span>
                <strong>{purchaseOrder.paymentTerms}</strong>
              </div>
            )}

            <div className="summary-btn-row">
              <button className="confirm-btn" onClick={submitOrder}>
                ✔ Confirm Order
              </button>

              <button
                className="cancel-btn"
                onClick={() => setShowSummary(false)}
              >
                ✖ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}