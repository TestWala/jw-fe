import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import salesApi from "../api/salesApi";
import AddCustomerModal from "./AddCustomerModal";
import "./Sales.css";

export default function Sales() {
  const { categories, inventoryItems, customers, metalPrices, purity, reload } = useContext(AppContext);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showPrintOption, setShowPrintOption] = useState(false);
  const [savedInvoiceData, setSavedInvoiceData] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchByCategory, setSearchByCategory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Settings for GST (you'll need to fetch these from your settings API)
  const [sellGSTPercentage, setSellGSTPercentage] = useState(3); // Default 3%, fetch from settings

  const [invoice, setInvoice] = useState({
    invoiceNumber: "INV-" + Date.now(),
    customerId: "",
    subtotal: 0,
    discountPercentage: 0,
    discountAmount: 0,
    taxPercentage: 0,
    taxAmount: 0,
    finalAmount: 0,
    paymentMethod: "cash",
    paymentStatus: "paid",
    amountPaid: 0,
    notes: "",
    items: []
  });

  const [selectedItemId, setSelectedItemId] = useState("");
  const [itemForm, setItemForm] = useState({
    quantity: 1,
    grossWeight: "",
    netWeight: "",
    purityLabel: "",
    rate: "", // Auto-populated from purchaseRate but editable
    makingCharges: "",
    wastageCharges: "",
    otherCharges: "",
    calculatedSellingPrice: "",
    sellingPrice: "",
    taxPercentage: sellGSTPercentage,
    taxAmount: ""
  });

  // Filter inventory based on mode
  const filteredInventory = searchByCategory
    ? (selectedCategoryId ? inventoryItems.filter(item => item.categoryId === selectedCategoryId) : [])
    : (searchQuery ? inventoryItems.filter(item =>
      item.itemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : []);

  // Helper function to get purity label
  function getPurityLabel(purityId) {
    const purityData = purity.find(p => p.id === purityId);
    return purityData ? `${purityData.karat} (${purityData.purityPercentage}%)` : "-";
  }

  // Helper function to get metal price by purity
  function getMetalPrice(purityId) {
    const priceData = metalPrices.find(mp => mp.purityId === purityId && mp.active);
    return priceData ? priceData.price : 0;
  }

  // Calculate selling price based on making charges and validate
  function calculateSellingPrice(item, formData) {
    if (!item) return { sellingPrice: 0, isValid: false };

    const netWeight = Number(item.netWeight) || 0;
    const rate = Number(formData.rate) || 0; // Use rate from form (editable)
    const makingCharges = Number(formData.makingCharges) || 0;
    const wastageCharges = Number(formData.wastageCharges) || 0;
    const otherCharges = Number(formData.otherCharges) || 0;

    // Calculate base selling price
    const basePrice = (netWeight * rate) + makingCharges + wastageCharges + otherCharges;

    // Get threshold profit percentage from item
    const thresholdProfitPercentage = Number(item.thresholdProfitPercentage) || 0;
    const purchasePrice = Number(item.purchasePrice) || 0;

    // Calculate minimum required selling price
    const minSellingPrice = purchasePrice + (purchasePrice * thresholdProfitPercentage / 100);

    // Check if selling price meets threshold
    const isValid = basePrice >= minSellingPrice;

    return { sellingPrice: basePrice, isValid, minSellingPrice };
  }

  // Handle item tax percentage change
  function handleItemTaxChange(value) {
    const taxPct = Number(value) || 0;
    const price = Number(itemForm.sellingPrice) || 0;
    const qty = Number(itemForm.quantity) || 1;
    const taxAmt = (price * qty * taxPct) / 100;

    setItemForm({
      ...itemForm,
      taxPercentage: value === "" ? "" : taxPct,
      taxAmount: taxAmt.toFixed(2)
    });
  }

  function addItem() {
    if (!selectedItemId) return alert("Select item first");

    const item = inventoryItems.find(i => i.id === selectedItemId);
    if (!item) return alert("Item not found");

    const qty = Number(itemForm.quantity);
    const price = Number(itemForm.sellingPrice);

    if (!qty || qty < 1) return alert("Invalid quantity");

    // Validate threshold profit
    const { isValid, minSellingPrice } = calculateSellingPrice(item, itemForm);
    if (!isValid) {
      return alert(`Selling price must be at least ₹${minSellingPrice.toFixed(2)} to meet threshold profit requirement`);
    }

    const taxAmt = Number(itemForm.taxAmount) || 0;
    const totalAmt = (price * qty) + taxAmt;

    const updatedItems = [
      ...invoice.items,
      {
        inventoryItemId: selectedItemId,
        quantity: qty,
        unitPrice: price,
        rateUsed: Number(itemForm.rate) || 0, // Store the rate used for this sale
        makingCharges: Number(itemForm.makingCharges) || 0,
        wastageCharges: Number(itemForm.wastageCharges) || 0,
        otherCharges: Number(itemForm.otherCharges) || 0,
        taxPercentage: Number(itemForm.taxPercentage) || 0,
        taxAmount: taxAmt,
        totalAmount: totalAmt
      }
    ];

    updateTotals(updatedItems, invoice.discountPercentage, 0); // No invoice-level tax

    setSelectedCategoryId("");
    setSelectedItemId("");
    setSearchQuery("");
    setItemForm({
      quantity: 1,
      grossWeight: "",
      netWeight: "",
      purityLabel: "",
      rate: "",
      makingCharges: "",
      wastageCharges: "",
      otherCharges: "",
      calculatedSellingPrice: "",
      sellingPrice: "",
      taxPercentage: sellGSTPercentage,
      taxAmount: ""
    });
  }

  function deleteItem(index) {
    const updated = [...invoice.items];
    updated.splice(index, 1);
    updateTotals(updated, invoice.discountPercentage, 0);
  }

  function updateTotals(items, discountPct = 0, taxPct = 0) {
    const subtotal = items.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0);
    const totalTax = items.reduce((sum, it) => sum + it.taxAmount, 0);
    const discountAmount = (subtotal * discountPct) / 100;
    const finalAmount = subtotal + totalTax - discountAmount;

    setInvoice((prev) => ({
      ...prev,
      items,
      subtotal,
      discountPercentage: discountPct,
      discountAmount,
      taxPercentage: 0, // Not used anymore
      taxAmount: totalTax,
      finalAmount
    }));
  }

  function handleDiscountChange(value) {
    const discountPct = Number(value) || 0;
    updateTotals(invoice.items, discountPct, 0);
  }

  // Handle final amount change - adjust discount accordingly
  function handleFinalAmountChange(value) {
    const newFinalAmount = Number(value) || 0;
    const subtotal = invoice.subtotal;
    const totalTax = invoice.taxAmount;

    // Calculate required discount amount
    const requiredDiscount = subtotal + totalTax - newFinalAmount;
    const discountPct = subtotal > 0 ? (requiredDiscount / subtotal) * 100 : 0;

    setInvoice((prev) => ({
      ...prev,
      discountPercentage: discountPct.toFixed(2),
      discountAmount: requiredDiscount,
      finalAmount: newFinalAmount
    }));
  }

  function resetForm() {
    setInvoice({
      invoiceNumber: "INV-" + Date.now(),
      customerId: "",
      subtotal: 0,
      discountPercentage: 0,
      discountAmount: 0,
      taxPercentage: 0,
      taxAmount: 0,
      finalAmount: 0,
      paymentMethod: "cash",
      paymentStatus: "paid",
      amountPaid: 0,
      notes: "",
      items: []
    });

    setSelectedCategoryId("");
    setSelectedItemId("");
    setSearchQuery("");
    setItemForm({
      quantity: 1,
      grossWeight: "",
      netWeight: "",
      purityLabel: "",
      rate: "",
      makingCharges: "",
      wastageCharges: "",
      otherCharges: "",
      calculatedSellingPrice: "",
      sellingPrice: "",
      taxPercentage: sellGSTPercentage,
      taxAmount: ""
    });
  }

  async function submitInvoice() {
    const payload = {
      ...invoice,
      customerId: invoice.customerId || null
    };

    const res = await salesApi.createInvoice(payload);

    if (res.success) {
      // Save invoice data for printing
      setSavedInvoiceData({
        ...invoice,
        customer: invoice.customerId
          ? customers.find((c) => c.id === invoice.customerId)
          : null,
        createdAt: new Date().toLocaleString()
      });
      
      setShowSummary(false);
      setShowPrintOption(true);
      reload();
    } else {
      alert("Failed: " + res.error);
    }
  }

  function handleCustomerSaved(customer) {
    setInvoice((prev) => ({ ...prev, customerId: customer.id }));
    reload();
  }

  function handlePrintInvoice() {
    window.print();
  }

  function handleSkipPrint() {
    setShowPrintOption(false);
    setSavedInvoiceData(null);
    resetForm();
  }

  function handleItemSelect(id) {
    setSelectedItemId(id);
    const item = inventoryItems.find(i => i.id === id);

    if (item) {
      // Get current metal price based on item's purity
      const currentRate = getMetalPrice(item.purityId);

      const initialForm = {
        quantity: 1,
        grossWeight: item.grossWeight || "",
        netWeight: item.netWeight || "",
        purityLabel: getPurityLabel(item.purityId),
        rate: currentRate || "", // Use current metal price
        makingCharges: item.makingCharges || "",
        wastageCharges: item.wastageCharges || "",
        otherCharges: item.otherCharges || "",
        calculatedSellingPrice: "",
        sellingPrice: "",
        taxPercentage: sellGSTPercentage,
        taxAmount: ""
      };

      // Calculate initial selling price
      const { sellingPrice } = calculateSellingPrice(item, initialForm);
      initialForm.calculatedSellingPrice = sellingPrice.toFixed(2);
      initialForm.sellingPrice = sellingPrice.toFixed(2);

      // Calculate initial tax
      const taxAmt = (sellingPrice * sellGSTPercentage) / 100;
      initialForm.taxAmount = taxAmt.toFixed(2);

      setItemForm(initialForm);
    }
  }

  // Update selling price when rate or charges change
  function handleChargeChange(field, value) {
    const updatedForm = { ...itemForm, [field]: value };
    const item = inventoryItems.find(i => i.id === selectedItemId);

    if (item) {
      const { sellingPrice } = calculateSellingPrice(item, updatedForm);
      updatedForm.calculatedSellingPrice = sellingPrice.toFixed(2);
      updatedForm.sellingPrice = sellingPrice.toFixed(2);

      // Recalculate tax
      const taxAmt = (sellingPrice * Number(updatedForm.taxPercentage)) / 100;
      updatedForm.taxAmount = taxAmt.toFixed(2);
    }

    setItemForm(updatedForm);
  }

  // Check if add button should be disabled
  const selectedItem = inventoryItems.find(i => i.id === selectedItemId);
  const { isValid: isPriceValid } = selectedItem ? calculateSellingPrice(selectedItem, itemForm) : { isValid: false };
  const isAddDisabled = !selectedItemId || !isPriceValid;

  const isSubmitDisabled = invoice.items.length === 0;

  return (
    <div className="sales-page">
      <h2>Create Sales Invoice</h2>

      {/* CUSTOMER */}
      <div className="customer-select">
        <label>Customer</label>
        <select
          value={invoice.customerId}
          onChange={(e) => setInvoice({ ...invoice, customerId: e.target.value })}
        >
          <option value="">Guest</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName} ({c.phone})
            </option>
          ))}
        </select>

        <button className="add-customer-btn" onClick={() => setShowCustomerModal(true)}>
          + Add Customer
        </button>
      </div>

      {showCustomerModal && (
        <AddCustomerModal
          onClose={() => setShowCustomerModal(false)}
          onSaved={handleCustomerSaved}
        />
      )}

      {/* ADD ITEM */}
      <div className="add-item-column">

        {/* ================= ROW 1: TOGGLE + SEARCH OR CATEGORY ================= */}
        <div className="add-item-row row-1">
          {/* TOGGLE + LABEL */}
          <div className="toggle-block">
            <span className="toggle-label">
              {searchByCategory
                ? "Select item by Category"
                : "Search item by code"}
            </span>

            <label className="ios-switch">
              <input
                type="checkbox"
                checked={searchByCategory}
                onChange={(e) => {
                  setSearchByCategory(e.target.checked);
                  setSearchQuery("");
                  setSelectedCategoryId("");
                  setSelectedItemId("");
                }}
              />
              <span className="ios-slider"></span>
            </label>

          </div>

          {/* INPUT AREA */}
          {!searchByCategory ? (
            <>
              <input
                type="text"
                list="inventory-list"
                placeholder="Enter item code"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);

                  // auto-select item if exact match
                  const matchedItem = inventoryItems.find(
                    item =>
                      `${item.itemCode}`.toLowerCase() === value.toLowerCase()
                  );

                  if (matchedItem) {
                    handleItemSelect(matchedItem.id);
                  } else {
                    setSelectedItemId("");
                  }
                }}
                className="search-input"
              />

              <datalist id="inventory-list">
                {inventoryItems.map(item => (
                  <option
                    key={item.id}
                    value={`${item.itemCode}`}
                  />
                ))}
              </datalist>

            </>
          ) : (
            <>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  setSelectedItemId("");
                }}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedItemId}
                onChange={(e) => handleItemSelect(e.target.value)}
                disabled={!selectedCategoryId}
              >
                <option value="">Select Item</option>
                {filteredInventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.itemCode}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* ================= ROW 2: ITEM DETAILS ================= */}
        <div className="sales-row">
          <div className="sales-field">
            <label>Gross Weight (g)</label>
            <input value={itemForm.grossWeight} readOnly placeholder="Gross Wt" />
          </div>

          <div className="sales-field">
            <label>Net Weight (g)</label>
            <input value={itemForm.netWeight} readOnly placeholder="Net Wt" />
          </div>

          <div className="sales-field">
            <label>Purity</label>
            <input 
              readOnly
              value={itemForm.purityLabel}
              placeholder="Purity"
            />
          </div>
        </div>

        {/* ================= ROW 3: RATE & MAKING CHARGES ================= */}
        <div className="sales-row">
          <div className="sales-field">
            <label>Rate (₹/g) - Current Price</label>
            <input 
              type="number"
              value={itemForm.rate}
              onChange={(e) => handleChargeChange('rate', e.target.value)}
              placeholder="Rate" 
              title="Current market rate - editable"
            />
          </div>

          <div className="sales-field">
            <label>Making Charges (₹)</label>
            <input
              type="number"
              value={itemForm.makingCharges}
              placeholder="Making Charges"
              onChange={(e) => handleChargeChange('makingCharges', e.target.value)}
            />
          </div>

          <div className="sales-field">
            <label>Wastage Charges (₹)</label>
            <input
              type="number"
              value={itemForm.wastageCharges}
              placeholder="Wastage Charges"
              onChange={(e) => handleChargeChange('wastageCharges', e.target.value)}
            />
          </div>

          <div className="sales-field">
            <label>Other Charges (₹)</label>
            <input
              type="number"
              value={itemForm.otherCharges}
              placeholder="Other Charges"
              onChange={(e) => handleChargeChange('otherCharges', e.target.value)}
            />
          </div>
        </div>

        {/* ================= ROW 4: SELLING PRICE, TAX & ADD BUTTON ================= */}
        <div className="sales-row">
          <div className="sales-field">
            <label>Selling Price (₹)</label>
            <input
              type="number"
              value={itemForm.sellingPrice}
              placeholder="Selling Price"
              onChange={(e) => {
                const price = e.target.value;
                const qty = Number(itemForm.quantity) || 1;
                const taxPct = Number(itemForm.taxPercentage) || 0;
                const taxAmt = (price * taxPct) / 100;

                setItemForm({
                  ...itemForm,
                  sellingPrice: price,
                  taxAmount: taxAmt.toFixed(2)
                });
              }}
            />
          </div>

          <div className="sales-field">
            <label>Tax (GST %)</label>
            <input
              type="number"
              value={itemForm.taxPercentage}
              placeholder="Tax %"
              onChange={(e) => handleItemTaxChange(e.target.value)}
            />
          </div>

          <div className="sales-field">
            <label>Tax Amount (₹)</label>
            <input
              type="number"
              value={itemForm.taxAmount}
              readOnly
              placeholder="Tax Amount"
            />
          </div>

          <div className="sales-field btn-field">
            <button
              className="add-item-btn"
              disabled={isAddDisabled}
              onClick={addItem}
              title={!isPriceValid ? "Selling price doesn't meet threshold profit requirement" : ""}
            >
              Add
            </button>
          </div>
        </div>

        {/* Validation message */}
        {selectedItemId && !isPriceValid && (() => {
          const calculatedPrice = calculateSellingPrice(selectedItem, itemForm);
          const minSellingPrice = calculatedPrice?.minSellingPrice;

          if (minSellingPrice == null) {
            return null;
          }

          return (
            <div className="validation-warning">
              ⚠️ Selling price must be at least ₹{minSellingPrice.toFixed(2)} to meet threshold profit requirement
            </div>
          );
        })()}
      </div>

      {/* ITEMS TABLE */}
      <div className="items-table-wrapper">
        <table className="items-table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Gross Wt (g)</th>
              <th>Qty</th>
              <th>Rate (₹/g)</th>
              <th>Price</th>
              <th>Making</th>
              <th>Wastage</th>
              <th>Other</th>
              <th>Tax (%)</th>
              <th>Tax Amt</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {invoice.items.map((it, i) => {
              const prod = inventoryItems.find((p) => p.id === it.inventoryItemId);
              return (
                <tr key={i}>
                  <td><strong>{prod?.itemCode}</strong></td>
                  <td>{prod?.grossWeight?.toFixed(3) || "-"}</td>
                  <td>{it.quantity}</td>
                  <td>₹{it.rateUsed?.toFixed(2)}</td>
                  <td>₹{it.unitPrice?.toFixed(2)}</td>
                  <td>₹{it.makingCharges?.toFixed(2)}</td>
                  <td>₹{it.wastageCharges?.toFixed(2)}</td>
                  <td>₹{it.otherCharges?.toFixed(2)}</td>
                  <td>{it.taxPercentage?.toFixed(2)}%</td>
                  <td>₹{it.taxAmount?.toFixed(2)}</td>
                  <td><strong>₹{it.totalAmount?.toFixed(2)}</strong></td>
                  <td>
                    <button className="delete-btn" onClick={() => deleteItem(i)}>
                      🗑
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* INVOICE TOTALS */}
      {invoice.items.length > 0 && (
        <div className="invoice-totals-box">
          <div className="totals-row">
            <span className="totals-label">Subtotal:</span>
            <span className="totals-value">₹{invoice.subtotal.toFixed(2)}</span>
          </div>

          <div className="totals-row">
            <span className="totals-label">Total Tax:</span>
            <span className="totals-value tax">+ ₹{invoice.taxAmount.toFixed(2)}</span>
          </div>

          <div className="totals-row">
            <label className="totals-label">
              Invoice Discount (%):
              <input
                type="number"
                placeholder="0"
                value={invoice.discountPercentage}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="totals-input"
              />
            </label>
            <span className="totals-value discount">
              - ₹{invoice.discountAmount.toFixed(2)}
            </span>
          </div>

          <div className="totals-row final">
            <label className="totals-label">
              Final Amount:
              <input
                type="number"
                value={invoice.finalAmount.toFixed(2)}
                onChange={(e) => handleFinalAmountChange(e.target.value)}
                className="totals-input final-amount-input"
              />
            </label>
            <span className="totals-value">₹{invoice.finalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* SAVE BUTTON */}
      <button
        className={`add-sale-submit-btn ${isSubmitDisabled ? "btn-disabled" : ""}`}
        disabled={isSubmitDisabled}
        onClick={() => {
          if (!isSubmitDisabled) {
            setShowSummary(true);
          }
        }}
      >
        Save Invoice
      </button>

      {/* SUMMARY POPUP */}
      {showSummary && (
        <div className="summary-popup-backdrop">
          <div className="summary-popup">
            <h3>Invoice Summary</h3>

            <div className="summary-row">
              <span>Invoice Number:</span>
              <strong>{invoice.invoiceNumber}</strong>
            </div>

            <div className="summary-row">
              <span>Customer:</span>
              <strong>
                {invoice.customerId
                  ? customers.find((c) => c.id === invoice.customerId)?.fullName || "Guest"
                  : "Guest"}
              </strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Total Items:</span>
              <strong>{invoice.items.length}</strong>
            </div>

            <div className="summary-row">
              <span>Subtotal:</span>
              <strong>₹{invoice.subtotal.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Total Tax:</span>
              <strong className="tax">+ ₹{invoice.taxAmount.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Discount ({invoice.discountPercentage}%):</span>
              <strong className="discount">- ₹{invoice.discountAmount.toFixed(2)}</strong>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Final Amount:</span>
              <strong>₹{invoice.finalAmount.toFixed(2)}</strong>
            </div>

            <div className="summary-btn-row">
              <button className="confirm-btn" onClick={submitInvoice}>
                ✔ Confirm Invoice
              </button>

              <button className="cancel-btn" onClick={() => setShowSummary(false)}>
                ✖ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT OPTION POPUP */}
      {showPrintOption && (
        <div className="print-option-backdrop">
          <div className="print-option-popup">
            <div className="success-icon">✓</div>
            <h3>Invoice Created Successfully!</h3>
            <p>Would you like to print the invoice?</p>

            <div className="print-option-btn-row">
              <button className="print-btn" onClick={handlePrintInvoice}>
                🖨️ Print Invoice
              </button>

              <button className="skip-print-btn" onClick={handleSkipPrint}>
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE */}
      {savedInvoiceData && (
        <div className="printable-invoice">
          <div className="invoice-header">
            <div className="company-info">
              <h1>Your Company Name</h1>
              <p>Address Line 1</p>
              <p>Address Line 2</p>
              <p>Phone: +91 XXXXX XXXXX</p>
              <p>Email: info@company.com</p>
              <p>GSTIN: XXXXXXXXXXXX</p>
            </div>

            <div className="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Invoice No:</strong> {savedInvoiceData.invoiceNumber}</p>
              <p><strong>Date:</strong> {savedInvoiceData.createdAt}</p>
            </div>
          </div>

          <div className="invoice-divider"></div>

          <div className="customer-info">
            <h3>Bill To:</h3>
            {savedInvoiceData.customer ? (
              <>
                <p><strong>{savedInvoiceData.customer.fullName}</strong></p>
                <p>Phone: {savedInvoiceData.customer.phone}</p>
                {savedInvoiceData.customer.email && <p>Email: {savedInvoiceData.customer.email}</p>}
                {savedInvoiceData.customer.address && <p>Address: {savedInvoiceData.customer.address}</p>}
              </>
            ) : (
              <p><strong>Guest Customer</strong></p>
            )}
          </div>

          <div className="invoice-divider"></div>

          <table className="printable-items-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Code</th>
                <th>Gross Wt</th>
                <th>Net Wt</th>
                <th>Purity</th>
                <th>Rate</th>
                <th>Making</th>
                <th>Wastage</th>
                <th>Other</th>
                <th>Price</th>
                <th>Tax</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {savedInvoiceData.items.map((it, i) => {
                const prod = inventoryItems.find((p) => p.id === it.inventoryItemId);
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{prod?.itemCode}</td>
                    <td>{prod?.grossWeight?.toFixed(3)}g</td>
                    <td>{prod?.netWeight?.toFixed(3)}g</td>
                    <td>{getPurityLabel(prod?.purityId)}</td>
                    <td>₹{it.rateUsed?.toFixed(2)}</td>
                    <td>₹{it.makingCharges?.toFixed(2)}</td>
                    <td>₹{it.wastageCharges?.toFixed(2)}</td>
                    <td>₹{it.otherCharges?.toFixed(2)}</td>
                    <td>₹{it.unitPrice?.toFixed(2)}</td>
                    <td>₹{it.taxAmount?.toFixed(2)}</td>
                    <td>₹{it.totalAmount?.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="invoice-summary">
            <div className="summary-item">
              <span>Subtotal:</span>
              <span>₹{savedInvoiceData.subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-item">
              <span>Total Tax:</span>
              <span>₹{savedInvoiceData.taxAmount.toFixed(2)}</span>
            </div>

            {savedInvoiceData.discountAmount > 0 && (
              <div className="summary-item discount-item">
                <span>Discount ({savedInvoiceData.discountPercentage}%):</span>
                <span>- ₹{savedInvoiceData.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-item total-item">
              <span><strong>Grand Total:</strong></span>
              <span><strong>₹{savedInvoiceData.finalAmount.toFixed(2)}</strong></span>
            </div>
          </div>

          <div className="invoice-footer">
            <div className="terms-conditions">
              <h4>Terms & Conditions:</h4>
              <ul>
                <li>Goods once sold cannot be returned or exchanged</li>
                <li>Subject to jurisdiction only</li>
                <li>Payment terms: As agreed</li>
              </ul>
            </div>

            <div className="signature-section">
              <div className="signature-box">
                <p>Authorized Signature</p>
              </div>
            </div>
          </div>

          <div className="invoice-footer-note">
            <p>Thank you for your business!</p>
          </div>
        </div>
      )}
    </div>
  );
}