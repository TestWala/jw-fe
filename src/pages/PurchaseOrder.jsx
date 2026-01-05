import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import purchaseApi from "../api/purchaseApi";
import inventoryApi from "../api/inventoryApi";
import AddSupplierModal from "./AddSupplierModal";
import { toast } from "react-toastify";
import "./PurchaseOrder.css";

export default function PurchaseOrder() {
  const { categories, purity, suppliers, metalPrices, reload, settings } = useContext(AppContext);

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [errors, setErrors] = useState({});
  const [isAddingItem, setIsAddingItem] = useState(false);

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

  // Helper to get default BUY_GST value
  const getDefaultBuyGST = () => {
    if (!settings || settings.length === 0) return 0;
    const buyGSTSetting = settings.find(s => s.key === "BUY_GST" && s.active);
    return buyGSTSetting ? Number(buyGSTSetting.value) : 0;
  };

  const [itemForm, setItemForm] = useState({
    categoryId: "",
    itemCode: "",
    categoryName: "",
    metalType: "",
    purityId: "",
    grossWeight: "",
    netWeight: "",
    stoneWeight: "",
    wastageType: "PERCENTAGE",
    wastageValue: "",
    wastageCharges: "",
    quantity: 1,
    purchaseRate: "",
    purchasePrice: "",
    purchaseGST: "",
    otherCharges: "",
    otherChargesPrice: "",
    otherChargesPercentage: "",
    makingType: "PERCENTAGE",
    makingValue: "",
    makingCharges: "",
    profitPercentage: 20,
    thresholdProfitPercentage: 5,
    sellingPrice: "",
    stoneType: "",
    stoneQuality: "",
    certificateNumber: "",
    barcode: "",
    itemNotes: ""
  });

  // Set default GST when settings are available
  React.useEffect(() => {
    if (settings && settings.length > 0 && !itemForm.purchaseGST) {
      const defaultGST = getDefaultBuyGST();
      if (defaultGST > 0) {
        setItemForm(prev => ({ ...prev, purchaseGST: defaultGST }));
      }
    }
  }, [settings]);

  function getPurityLabel(purityId) {
    const p = purity.find(pr => pr.id === purityId);
    return p ? `${p.karat} (${p.purityPercentage}%)` : "";
  }

  function getFilteredPurities(metalType) {
    if (!metalType) return [];
    return purity.filter(p => p.metalType === metalType);
  }

  function getPurchaseRateFromPurity(purityId) {
    if (!purityId) return 0;
    const metalPrice = metalPrices.find(mp => mp.purityId === purityId && mp.active);
    return metalPrice ? Number(metalPrice.price) : 0;
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
      const defaultPurchaseRate = getPurchaseRateFromPurity(category.purityId);
      const defaultBuyGST = getDefaultBuyGST();

      setItemForm({
        ...itemForm,
        categoryId: category.id,
        itemCode: category.code,
        categoryName: category.name,
        metalType: category.metalType,
        purityId: category.purityId,
        profitPercentage: category.profitPercentage || 20,
        thresholdProfitPercentage: category.thresholdProfitPercentage || 5,
        purchaseRate: defaultPurchaseRate,
        grossWeight: "",
        netWeight: "",
        stoneWeight: "",
        wastageType: "PERCENTAGE",
        wastageValue: "",
        wastageCharges: "",
        quantity: 1,
        purchasePrice: "",
        purchaseGST: defaultBuyGST,
        otherCharges: "",
        otherChargesPrice: "",
        otherChargesPercentage: "",
        makingType: "PERCENTAGE",
        makingValue: "",
        makingCharges: "",
        sellingPrice: "",
        stoneType: "",
        stoneQuality: "",
        certificateNumber: "",
        barcode: "",
        itemNotes: ""
      });
    }
  }

  // Calculate base price (netWeight * purchaseRate)
  function getBasePrice(netWeight, purchaseRate) {
    return Number(netWeight || 0) * Number(purchaseRate || 0);
  }

  function calculatePurchasePrice(netWeight, rate, wastage, gst, other) {
    const base = Number(netWeight) * Number(rate);
    const taxable = base + Number(wastage) + Number(other);
    const gstAmount = taxable * Number(gst) / 100;
    return taxable + gstAmount;
  }

  function calculateSellingPrice(purchasePrice, makingCharges, profitPercentage) {
    const price = Number(purchasePrice) || 0;
    const making = Number(makingCharges) || 0;
    const profit = Number(profitPercentage) || 0;

    const totalCost = price + making;
    return totalCost * (1 + profit / 100);
  }

  function calculateWastageCharges(netWeight, purchaseRate, wastageType, wastageValue) {
    const weight = Number(netWeight) || 0;
    const rate = Number(purchaseRate) || 0;
    const value = Number(wastageValue) || 0;
    const basePrice = weight * rate;

    switch (wastageType) {
      case "PERCENTAGE":
        return (basePrice * value) / 100;
      case "PER_WEIGHT":
        return value * rate;
      case "FLAT":
      default:
        return value;
    }
  }

  function calculateMakingCharges(netWeight, purchaseRate, makingType, makingValue) {
    const weight = Number(netWeight) || 0;
    const rate = Number(purchaseRate) || 0;
    const value = Number(makingValue) || 0;
    const basePrice = weight * rate;

    switch (makingType) {
      case "PERCENTAGE":
        return (basePrice * value) / 100;
      case "PER_WEIGHT":
        return value * weight;
      case "FLAT":
      default:
        return value;
    }
  }

  // Enhanced to accept override parameters
  function recalculatePrices(overrides = {}) {
    const netWeight = overrides.netWeight !== undefined ? overrides.netWeight : itemForm.netWeight;
    const purchaseRate = overrides.purchaseRate !== undefined ? overrides.purchaseRate : itemForm.purchaseRate;
    const wastageType = overrides.wastageType !== undefined ? overrides.wastageType : itemForm.wastageType;
    const wastageValue = overrides.wastageValue !== undefined ? overrides.wastageValue : itemForm.wastageValue;
    const purchaseGST = overrides.purchaseGST !== undefined ? overrides.purchaseGST : itemForm.purchaseGST;
    const otherChargesPrice = overrides.otherChargesPrice !== undefined ? overrides.otherChargesPrice : itemForm.otherChargesPrice;
    const makingType = overrides.makingType !== undefined ? overrides.makingType : itemForm.makingType;
    const makingValue = overrides.makingValue !== undefined ? overrides.makingValue : itemForm.makingValue;
    const profitPercentage = overrides.profitPercentage !== undefined ? overrides.profitPercentage : itemForm.profitPercentage;

    const wastageCharges = calculateWastageCharges(
      netWeight,
      purchaseRate,
      wastageType,
      wastageValue
    );

    const purchasePrice = calculatePurchasePrice(
      netWeight,
      purchaseRate,
      wastageCharges,
      purchaseGST,
      otherChargesPrice
    );

    const makingCharges = calculateMakingCharges(
      netWeight,
      purchaseRate,
      makingType,
      makingValue
    );

    const sellingPrice = calculateSellingPrice(
      purchasePrice,
      makingCharges,
      profitPercentage
    );

    return { wastageCharges, purchasePrice, makingCharges, sellingPrice };
  }

  // Auto-calculate stone weight
  function handleNetWeightChange(value) {
    clearError('netWeight');

    const netVal = Number(value) || 0;
    const grossVal = Number(itemForm.grossWeight) || 0;
    const stoneWeight = Math.max(0, grossVal - netVal);

    if (itemForm.grossWeight && Number(value) > Number(itemForm.grossWeight)) {
      setErrors(prev => ({
        ...prev,
        netWeight: "Net weight cannot exceed gross weight"
      }));
    } else {
      clearError('grossWeight');
    }

    const calculated = recalculatePrices({ netWeight: value });

    setItemForm(prev => ({
      ...prev,
      netWeight: value,
      stoneWeight: stoneWeight.toFixed(3),
      wastageCharges: calculated.wastageCharges.toFixed(2),
      purchasePrice: calculated.purchasePrice.toFixed(2),
      makingCharges: calculated.makingCharges.toFixed(2),
      sellingPrice: calculated.sellingPrice.toFixed(2)
    }));
  }

  // Auto-calculate stone weight
  function handleGrossWeightChange(value) {
    clearError('grossWeight');

    const grossVal = Number(value) || 0;
    const netVal = Number(itemForm.netWeight) || 0;
    const stoneWeight = Math.max(0, grossVal - netVal);

    if (itemForm.netWeight && Number(value) < Number(itemForm.netWeight)) {
      setErrors(prev => ({
        ...prev,
        grossWeight: "Gross weight cannot be less than net weight"
      }));
    } else {
      clearError('netWeight');
    }

    setItemForm({
      ...itemForm,
      grossWeight: value,
      stoneWeight: stoneWeight.toFixed(3)
    });
  }

  function handlePurchaseRateChange(value) {
    clearError('purchaseRate');

    const calculated = recalculatePrices({ purchaseRate: value });

    // Recalculate otherChargesPercentage based on the new base price
    const basePrice = getBasePrice(itemForm.netWeight, value);
    const otherChargesPercentage = basePrice > 0
      ? ((Number(itemForm.otherChargesPrice) || 0) / basePrice * 100)
      : 0;

    setItemForm({
      ...itemForm,
      purchaseRate: value,
      otherChargesPercentage: otherChargesPercentage.toFixed(2),
      wastageCharges: calculated.wastageCharges.toFixed(2),
      purchasePrice: calculated.purchasePrice.toFixed(2),
      makingCharges: calculated.makingCharges.toFixed(2),
      sellingPrice: calculated.sellingPrice.toFixed(2)
    });
  }

  function handleWastageTypeChange(value) {
    clearError("wastageValue");

    const calculated = recalculatePrices({
      wastageType: value,
      wastageValue: 0
    });
    setItemForm({
      ...itemForm,
      wastageType: value,
      wastageValue: "",
      wastageCharges: calculated.wastageCharges.toFixed(2),
      purchasePrice: calculated.purchasePrice.toFixed(2),
      makingCharges: calculated.makingCharges.toFixed(2),
      sellingPrice: calculated.sellingPrice.toFixed(2)
    });
  }

  function handleWastageValueChange(value) {
    clearError('wastageValue');

    const calculated = recalculatePrices({ wastageValue: value });

    setItemForm({
      ...itemForm,
      wastageValue: value,
      wastageCharges: calculated.wastageCharges.toFixed(2),
      purchasePrice: calculated.purchasePrice.toFixed(2),
      sellingPrice: calculated.sellingPrice.toFixed(2)
    });
  }

  function handlePurchaseGSTChange(value) {
    const calculated = recalculatePrices({ purchaseGST: value });

    setItemForm({
      ...itemForm,
      purchaseGST: value,
      purchasePrice: calculated.purchasePrice.toFixed(2),
      sellingPrice: calculated.sellingPrice.toFixed(2)
    });
  }

  // Handle other charges price change (₹)
  function handleOtherChargesPriceChange(value) {
    const priceValue = Number(value) || 0;
    const basePrice = getBasePrice(itemForm.netWeight, itemForm.purchaseRate);

    // Calculate percentage from price
    const percentageValue = basePrice > 0 ? (priceValue / basePrice * 100) : 0;

    const calculated = recalculatePrices({ otherChargesPrice: priceValue });

    setItemForm({
      ...itemForm,
      otherChargesPrice: value,
      otherChargesPercentage: percentageValue.toFixed(2),
      purchasePrice: calculated.purchasePrice.toFixed(2),
      sellingPrice: calculated.sellingPrice.toFixed(2)
    });
  }

  // Handle other charges percentage change (%)
  function handleOtherChargesPercentageChange(value) {
    const percentageValue = Number(value) || 0;
    const basePrice = getBasePrice(itemForm.netWeight, itemForm.purchaseRate);

    // Calculate price from percentage
    const priceValue = (basePrice * percentageValue) / 100;

    const calculated = recalculatePrices({ otherChargesPrice: priceValue });

    setItemForm({
      ...itemForm,
      otherChargesPercentage: value,
      otherChargesPrice: priceValue.toFixed(2),
      purchasePrice: calculated.purchasePrice.toFixed(2),
      sellingPrice: calculated.sellingPrice.toFixed(2)
    });
  }

  function handleMakingTypeChange(value) {
    const calculated = recalculatePrices({ makingType: value, makingValue: 0 });

    setItemForm({
      ...itemForm,
      makingType: value,
      makingValue: "",
      makingCharges: calculated.makingCharges.toFixed(2),
      sellingPrice: calculated.sellingPrice.toFixed(2)
    });
  }

  function handleMakingValueChange(value) {
    clearError('makingValue');

    const calculated = recalculatePrices({ makingValue: value });

    setItemForm({
      ...itemForm,
      makingValue: value,
      makingCharges: calculated.makingCharges.toFixed(2),
      sellingPrice: calculated.sellingPrice.toFixed(2)
    });
  }

  function handleThresholdProfitPercentageChange(value) {
    clearError('thresholdProfitPercentage');
    clearError('profitPercentage');
    setItemForm({ ...itemForm, thresholdProfitPercentage: value });
  }

  function handleProfitPercentageChange(value) {
    clearError('profitPercentage');
    clearError('thresholdProfitPercentage');

    const calculated = recalculatePrices({ profitPercentage: value });

    setItemForm({
      ...itemForm,
      profitPercentage: value,
      sellingPrice: calculated.sellingPrice.toFixed(2)
    });
  }

  function handlePurityChange(value) {
    clearError('purityId');
    const newPurchaseRate = getPurchaseRateFromPurity(value);

    const calculated = recalculatePrices({ purchaseRate: newPurchaseRate });

    // Recalculate otherChargesPercentage based on new base price
    const basePrice = getBasePrice(itemForm.netWeight, newPurchaseRate);
    const otherChargesPercentage = basePrice > 0
      ? ((Number(itemForm.otherChargesPrice) || 0) / basePrice * 100)
      : 0;

    setItemForm({
      ...itemForm,
      purityId: value,
      purchaseRate: newPurchaseRate,
      otherChargesPercentage: otherChargesPercentage.toFixed(2),
      wastageCharges: calculated.wastageCharges.toFixed(2),
      purchasePrice: calculated.purchasePrice.toFixed(2),
      makingCharges: calculated.makingCharges.toFixed(2),
      sellingPrice: calculated.sellingPrice.toFixed(2)
    });
  }

  async function addItem() {
    if (!validateItemForm()) {
      toast.error("Please fix the errors before adding the item");
      return;
    }

    setIsAddingItem(true);

    try {
      const inventoryPayload = {
        categoryId: itemForm.categoryId,
        grossWeight: Number(itemForm.grossWeight) || 0,
        netWeight: Number(itemForm.netWeight),
        stoneWeight: Number(itemForm.stoneWeight) || 0,
        wastageType: itemForm.wastageType,
        wastageValue: Number(itemForm.wastageValue) || 0,
        wastageCharges: Number(itemForm.wastageCharges) || 0,
        purchaseRate: Number(itemForm.purchaseRate),
        purchasePrice: Number(itemForm.purchasePrice),
        makingType: itemForm.makingType,
        makingValue: Number(itemForm.makingValue) || 0,
        makingCharges: Number(itemForm.makingCharges),
        profitPercentage: Number(itemForm.profitPercentage),
        thresholdProfitPercentage: Number(itemForm.thresholdProfitPercentage),
        sellingPrice: Number(itemForm.sellingPrice),
        purityId: itemForm.purityId,
        otherChargesPrice: Number(itemForm.otherChargesPrice) || 0,
        otherChargesPercentage: Number(itemForm.otherChargesPercentage) || 0,
        stoneType: itemForm.stoneType || null,
        stoneQuality: itemForm.stoneQuality || null,
        certificateNumber: itemForm.certificateNumber || null,
        barcode: itemForm.barcode || null,
        notes: itemForm.itemNotes || null
      };

      const response = await inventoryApi.addInventoryItem(inventoryPayload);

      if (response.success && response.data) {
        const addedItem = response.data;

        const qty = Number(itemForm.quantity);
        const purchasePrice = Number(itemForm.purchasePrice);
        const makingCharges = Number(itemForm.makingCharges);

        // Total amount = (purchase price + making charges) × quantity
        const unitTotal = purchasePrice + makingCharges;
        const totalAmt = qty * unitTotal;

        const poItem = {
          inventoryItemId: addedItem.id,
          categoryId: itemForm.categoryId,
          itemCode: addedItem.itemCode,
          categoryName: itemForm.categoryName,
          metalType: itemForm.metalType,
          purityId: itemForm.purityId,
          grossWeight: Number(itemForm.grossWeight) || 0,
          netWeight: Number(itemForm.netWeight),
          stoneWeight: Number(itemForm.stoneWeight) || 0,
          wastageType: itemForm.wastageType,
          wastageValue: Number(itemForm.wastageValue) || 0,
          wastageCharges: Number(itemForm.wastageCharges) || 0,
          makingType: itemForm.makingType,
          makingValue: Number(itemForm.makingValue) || 0,
          quantity: qty,
          purchaseRate: Number(itemForm.purchaseRate),
          purchasePrice: purchasePrice,
          makingCharges: makingCharges,
          profitPercentage: Number(itemForm.profitPercentage),
          thresholdProfitPercentage: Number(itemForm.thresholdProfitPercentage),
          sellingPrice: Number(itemForm.sellingPrice),
          otherChargesPrice: Number(itemForm.otherChargesPrice) || 0,
          otherChargesPercentage: Number(itemForm.otherChargesPercentage) || 0,
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
          grossWeight: "",
          netWeight: "",
          stoneWeight: "",
          wastageType: "PERCENTAGE",
          wastageValue: "",
          wastageCharges: "",
          quantity: 1,
          purchaseRate: "",
          purchasePrice: "",
          purchaseGST: "",
          otherCharges: "",
          otherChargesPrice: "",
          otherChargesPercentage: "",
          makingType: "PERCENTAGE",
          makingValue: "",
          makingCharges: "",
          profitPercentage: 20,
          thresholdProfitPercentage: 5,
          sellingPrice: "",
          stoneType: "",
          stoneQuality: "",
          certificateNumber: "",
          barcode: "",
          itemNotes: ""
        });

        toast.success("Item added successfully!");
      } else {
        toast.error("Failed to add inventory item: " + (response.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error adding inventory item:", error);
      toast.error("Error adding inventory item");
    } finally {
      setIsAddingItem(false);
    }
  }

  async function deleteItem(index) {
    const item = purchaseOrder.items[index];

    if (!item.inventoryItemId) {
      toast.error("Cannot delete: Item ID not found");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete this item (${item.categoryName})? This will remove it from inventory.`
    );

    if (!confirmDelete) return;

    try {
      const response = await inventoryApi.deleteInventoryItem(item.inventoryItemId);

      if (response.success) {
        const updatedItems = [...purchaseOrder.items];
        updatedItems.splice(index, 1);

        updateTotals(
          updatedItems,
          purchaseOrder.discountAmount,
          purchaseOrder.taxPercentage,
          purchaseOrder.shippingCharges
        );

        toast.success("Item deleted successfully!");
      } else {
        toast.error("Failed to delete item: " + (response.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      toast.error("Error deleting item: " + error.message);
    }
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

    const defaultBuyGST = getDefaultBuyGST();

    setItemForm({
      categoryId: "",
      itemCode: "",
      categoryName: "",
      metalType: "",
      purityId: "",
      grossWeight: "",
      netWeight: "",
      stoneWeight: "",
      wastageType: "PERCENTAGE",
      wastageValue: "",
      wastageCharges: "",
      quantity: 1,
      purchaseRate: "",
      purchasePrice: "",
      purchaseGST: defaultBuyGST,
      otherCharges: "",
      otherChargesPrice: "",
      otherChargesPercentage: "",
      makingType: "PERCENTAGE",
      makingValue: "",
      makingCharges: "",
      profitPercentage: 20,
      thresholdProfitPercentage: 5,
      sellingPrice: "",
      stoneType: "",
      stoneQuality: "",
      certificateNumber: "",
      barcode: "",
      itemNotes: ""
    });
  }

  async function submitOrder() {
    if (purchaseOrder.items.length === 0) {
      toast.error("Please add at least one item to the purchase order");
      return;
    }

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
        inventoryItemId: item.inventoryItemId
      }))
    };

    try {
      const res = await purchaseApi.createPurchaseOrder(apiPayload);

      if (res.success) {
        toast.success("Purchase Order Created Successfully!");
        resetForm();
        reload();
        setShowSummary(false);
      } else {
        toast.error("Failed: " + (res.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating purchase order:", error);
      toast.error("Error creating purchase order: " + error.message);
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

        {selectedCategoryId && (
          <div className="add-item-box">
            {/* Row 1 */}
            <div className={`form-group ${errors.categoryId ? 'error' : ''}`}>
              <label>Select Category *</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => handleCategorySelect(e.target.value)}
              >
                <option value="">-- Select Category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name} ({c.metalType})
                  </option>
                ))}
              </select>
              {errors.categoryId && <span className="error-text">{errors.categoryId}</span>}
            </div>

            <div className="form-group">
              <label>Metal Type</label>
              <input
                type="text"
                value={itemForm.metalType}
                readOnly
              />
            </div>

            <div className={`form-group ${errors.purityId ? 'error' : ''}`}>
              <label>Purity *</label>
              <select
                value={itemForm.purityId}
                onChange={(e) => handlePurityChange(e.target.value)}
                disabled={!itemForm.metalType}
              >
                <option value="">-- Select Purity --</option>
                {getFilteredPurities(itemForm.metalType).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.karat} ({p.purityPercentage}%) - {p.description}
                  </option>
                ))}
              </select>
              {errors.purityId && <span className="error-text">{errors.purityId}</span>}
            </div>

            <div className={`form-group ${errors.grossWeight ? 'error' : ''}`}>
              <label>Gross Weight (g) *</label>
              <input
                type="number"
                step="0.001"
                placeholder="0"
                value={itemForm.grossWeight}
                onChange={(e) => handleGrossWeightChange(e.target.value)}
              />
              {errors.grossWeight && <span className="error-text">{errors.grossWeight}</span>}
            </div>

            <div className={`form-group ${errors.netWeight ? 'error' : ''}`}>
              <label>Net Weight (g) *</label>
              <input
                type="number"
                step="0.001"
                placeholder="0"
                value={itemForm.netWeight}
                onChange={(e) => handleNetWeightChange(e.target.value)}
              />
              {errors.netWeight && <span className="error-text">{errors.netWeight}</span>}
            </div>

            {/* Row 2 */}
            <div className="form-group">
              <label>Wastage Type</label>
              <select
                value={itemForm.wastageType}
                onChange={(e) => handleWastageTypeChange(e.target.value)}
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FLAT">Flat</option>
                <option value="PER_WEIGHT">Per weight</option>
              </select>
            </div>

            <div className={`form-group ${errors.wastageValue ? 'error' : ''}`}>
              <label>Wastage value</label>
              <input
                type="number"
                step="0.01"
                value={itemForm.wastageValue}
                onChange={(e) => handleWastageValueChange(e.target.value)}
                placeholder="0"
              />
              {errors.wastageValue && <span className="error-text">{errors.wastageValue}</span>}
            </div>

            <div className="form-group">
              <label>Wastage Charges (₹)</label>
              <input
                type="number"
                value={itemForm.wastageCharges}
                readOnly
              />
            </div>

            {/* Row 3 - NEW: Replaced single "Other charges" with split ₹ / % fields */}
            <div className="form-group">
              <label>Other charges </label>
              <div className="split-input-container">
                <input
                  type="number"
                  value={itemForm.otherChargesPrice}
                  onChange={(e) => handleOtherChargesPriceChange(e.target.value)}
                  placeholder="₹"
                  className="split-input-left"
                />
                <span className="split-input-divider">/</span>
                <input
                  type="number"
                  value={itemForm.otherChargesPercentage}
                  onChange={(e) => handleOtherChargesPercentageChange(e.target.value)}
                  placeholder="%"
                  className="split-input-right"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Purchase GST</label>
              <input
                type="number"
                step="0.01"
                value={itemForm.purchaseGST}
                onChange={(e) => handlePurchaseGSTChange(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className={`form-group ${errors.purchaseRate ? 'error' : ''}`}>
              <label>Purchase Rate (₹/g) *</label>
              <input
                type="number"
                step="0.01"
                onChange={(e) => handlePurchaseRateChange(e.target.value)}
                value={itemForm.purchaseRate}
              />
              {errors.purchaseRate && <span className="error-text">{errors.purchaseRate}</span>}
            </div>

            <div className="form-group">
              <label>Purchase Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={itemForm.purchasePrice}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Stone Weight (g)</label>
              <input
                type="number"
                step="0.001"
                value={itemForm.stoneWeight}
                onChange={(e) => setItemForm({ ...itemForm, stoneWeight: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="form-group">
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

            <div className="form-group">
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

            {/* Row 4 */}
            <div className="form-group">
              <label>Certificate/Hallmark No.</label>
              <input
                type="text"
                placeholder="Certificate/Hallmark No."
                value={itemForm.certificateNumber}
                onChange={(e) =>
                  setItemForm({ ...itemForm, certificateNumber: e.target.value })
                }
              />
            </div>

            <div className="form-group">
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

            <div className="form-group"></div>
            <div className="form-group"></div>
            <div className="form-group"></div>

            {/* Settings for Sell Section */}
            <div className="sell-settings-section">
              <div className="sell-settings-header">SubSection (Settings for Sell)</div>

              <div className="sell-settings-row">
                <div className="form-group">
                  <label>Making Type</label>
                  <select
                    value={itemForm.makingType}
                    onChange={(e) => handleMakingTypeChange(e.target.value)}
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FLAT">Flat</option>
                    <option value="PER_WEIGHT">Per weight</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Making value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.makingValue}
                    onChange={(e) => handleMakingValueChange(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Making Charges (₹)</label>
                  <input
                    type="number"
                    value={itemForm.makingCharges}
                    readOnly
                  />
                </div>

                <div className={`form-group ${errors.thresholdProfitPercentage ? 'error' : ''}`}>
                  <label>Threshold Profit % *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.thresholdProfitPercentage}
                    onChange={(e) => handleThresholdProfitPercentageChange(e.target.value)}
                  />
                  {errors.thresholdProfitPercentage && <span className="error-text">{errors.thresholdProfitPercentage}</span>}
                </div>

                <div className={`form-group ${errors.profitPercentage ? 'error' : ''}`}>
                  <label>Profit %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.profitPercentage}
                    onChange={(e) => handleProfitPercentageChange(e.target.value)}
                  />
                  {errors.profitPercentage && <span className="error-text">{errors.profitPercentage}</span>}
                </div>
              </div>
            </div>

            {/* Item Notes */}
            <div className="form-group item-notes-group">
              <label>item note</label>
              <textarea
                rows="3"
                placeholder="Additional notes for this item"
                value={itemForm.itemNotes}
                onChange={(e) =>
                  setItemForm({ ...itemForm, itemNotes: e.target.value })
                }
              />
            </div>

            <div className="form-group add-btn-wrapper">
              <button
                disabled={!selectedCategoryId || isAddingItem}
                className={(!selectedCategoryId || isAddingItem) ? "btn-disabled" : ""}
                onClick={selectedCategoryId && !isAddingItem ? addItem : undefined}
              >
                {isAddingItem ? "Adding..." : "Add Item to PO"}
              </button>
            </div>
          </div>
        )}

        {!selectedCategoryId && (
          <div className="no-category-selected">
            <select
              value={selectedCategoryId}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="category-selector"
            >
              <option value="">-- Select Category to Add Item --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name} ({c.metalType})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {purchaseOrder.items.length > 0 && (
        <div className="added-items-table-wrapper">
          <h3>Items in Purchase Order ({purchaseOrder.items.length})</h3>
          <table className="added-items-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Category</th>
                <th>Purity</th>
                <th>Threshold Profit %</th>
                <th>Profit %</th>
                <th>Gross Wt (g)</th>
                <th>Net Wt (g)</th>
                <th>Rate (₹/g)</th>
                <th>Final Price</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {purchaseOrder.items.map((it, i) => (
                <tr key={i}>
                  <td><strong>{it.itemCode}</strong></td>
                  <td>
                    <div className="added-item-category-cell">
                      <strong>{it.categoryName}</strong>
                    </div>
                  </td>
                  <td>{getPurityLabel(it.purityId)}</td>
                  <td>{it.thresholdProfitPercentage.toFixed(2)}%</td>
                  <td>{it.profitPercentage.toFixed(2)}%</td>
                  <td>{it.grossWeight.toFixed(3)}</td>
                  <td>{it.netWeight.toFixed(3)}</td>
                  <td>₹{it.purchaseRate.toFixed(2)}</td>
                  <td><strong>₹{(it.purchasePrice + it.makingCharges).toFixed(2)}</strong></td>
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