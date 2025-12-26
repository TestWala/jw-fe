import { useState } from "react";
import "./InventoryDetailsModal.css";

export default function InventoryDetailsModal({ item, purity, getPurityName, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        itemCode: item.itemCode || "",
        status: item.status || "",
        grossWeight: item.grossWeight || "",
        netWeight: item.netWeight || "",
        stoneWeight: item.stoneWeight || "",
        wastageType: item.wastageType || "FLAT",
        wastageValue: item.wastageValue || "",
        wastageCharges: item.wastageCharges || "",
        purchaseRate: item.purchaseRate || "",
        purchasePrice: item.purchasePrice || "",
        makingCharges: item.makingCharges || "",
        profitPercentage: item.profitPercentage || "",
        thresholdProfitPercentage: item.thresholdProfitPercentage || "",
        sellingPrice: item.sellingPrice || "",
        purityId: item.purityId || "",
        stoneType: item.stoneType || "",
        stoneQuality: item.stoneQuality || "",
        certificateNumber: item.certificateNumber || "",
        barcode: item.barcode || "",
        notes: item.notes || "",
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (field, value) => {
        const newFormData = { ...formData, [field]: value };
        
        // Recalculate wastage charges when relevant fields change
        if (field === 'wastageType' || field === 'wastageValue' || field === 'purchasePrice' || field === 'netWeight') {
            newFormData.wastageCharges = calculateWastageCharges(
                newFormData.wastageType,
                newFormData.wastageValue,
                newFormData.purchasePrice,
                newFormData.netWeight
            );
        }
        
        setFormData(newFormData);
    };

    const calculateWastageCharges = (wastageType, wastageValue, purchasePrice, netWeight) => {
        const value = Number(wastageValue) || 0;
        const price = Number(purchasePrice) || 0;
        const weight = Number(netWeight) || 0;
        
        switch (wastageType) {
            case 'FLAT':
                // Flat amount: value is the charge itself
                return value;
            case 'PERCENTAGE':
                // Percentage of purchase price
                return (price * value) / 100;
            case 'PER_WEIGHT':
                // Per gram rate multiplied by net weight
                return value * weight;
            default:
                return 0;
        }
    };

    const handleSave = () => {
        if (!onUpdate) return;

        const updatedPayload = {
            id: item.id,
            categoryId: formData.categoryId,
            itemCode: formData.itemCode,
            status: formData.status,
            grossWeight: Number(formData.grossWeight),
            netWeight: Number(formData.netWeight),
            stoneWeight: Number(formData.stoneWeight) || 0,
            wastageType: formData.wastageType,
            wastageValue: Number(formData.wastageValue) || 0,
            wastageCharges: Number(formData.wastageCharges) || 0,
            purchaseRate: Number(formData.purchaseRate) || 0,
            purchasePrice: Number(formData.purchasePrice) || 0,
            makingCharges: Number(formData.makingCharges) || 0,
            profitPercentage: Number(formData.profitPercentage) || 0,
            thresholdProfitPercentage: Number(formData.thresholdProfitPercentage) || 0,
            sellingPrice: Number(formData.sellingPrice) || 0,
            purityId: formData.purityId,
            stoneType: formData.stoneType || null,
            stoneQuality: formData.stoneQuality || null,
            certificateNumber: formData.certificateNumber || null,
            barcode: formData.barcode || null,
            notes: formData.notes || null,
        };

        onUpdate(updatedPayload);
        setIsEditing(false);
    };


    const handleCancel = () => {
        setFormData({
            itemCode: item.itemCode || "",
            categoryId: item.categoryId,
            status: item.status || "",
            grossWeight: item.grossWeight || "",
            netWeight: item.netWeight || "",
            stoneWeight: item.stoneWeight || "",
            wastageType: item.wastageType || "FLAT",
            wastageValue: item.wastageValue || "",
            wastageCharges: item.wastageCharges || "",
            purchaseRate: item.purchaseRate || "",
            purchasePrice: item.purchasePrice || "",
            makingCharges: item.makingCharges || "",
            profitPercentage: item.profitPercentage || "",
            thresholdProfitPercentage: item.thresholdProfitPercentage || "",
            sellingPrice: item.sellingPrice || "",
            purityId: item.purityId || "",
            stoneType: item.stoneType || "",
            stoneQuality: item.stoneQuality || "",
            certificateNumber: item.certificateNumber || "",
            barcode: item.barcode || "",
            notes: item.notes || "",
        });
        setIsEditing(false);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Inventory Item Details</h3>
                    <button className="close-icon" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Basic Information */}
                    <div className="section">
                        <h4 className="section-title">Basic Information</h4>
                        <div className="details-grid">
                            <div className="form-field">
                                <label>Item Code</label>
                                <input
                                    type="text"
                                    value={formData.itemCode}
                                    onChange={(e) => handleChange("itemCode", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-field">
                                <label>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                    disabled={!isEditing}
                                >
                                    <option value="IN_STOCK">In Stock</option>
                                    <option value="SOLD">Sold</option>
                                    <option value="GIFTED">Gifted</option>
                                    <option value="ADJUSTED">Adjusted</option>
                                    <option value="DAMAGED">Damaged</option>

                                </select>
                            </div>

                            <div className="form-field">
                                <label>Barcode</label>
                                <input
                                    type="text"
                                    value={formData.barcode}
                                    onChange={(e) => handleChange("barcode", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-field">
                                <label>Purity</label>
                                <select
                                    value={formData.purityId}
                                    onChange={(e) => handleChange("purityId", e.target.value)}
                                    disabled={!isEditing}
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
                    </div>

                    {/* Weight Details */}
                    <div className="section">
                        <h4 className="section-title">Weight Details (grams)</h4>
                        <div className="details-grid">
                            <div className="form-field">
                                <label>Gross Weight</label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={formData.grossWeight}
                                    onChange={(e) => handleChange("grossWeight", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-field">
                                <label>Net Weight</label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={formData.netWeight}
                                    onChange={(e) => handleChange("netWeight", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-field">
                                <label>Stone Weight</label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={formData.stoneWeight}
                                    onChange={(e) => handleChange("stoneWeight", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Wastage Details */}
                    <div className="section">
                        <h4 className="section-title">Wastage Details</h4>
                        <div className="details-grid">
                            <div className="form-field">
                                <label>Wastage Type</label>
                                <select
                                    value={formData.wastageType}
                                    onChange={(e) => handleChange("wastageType", e.target.value)}
                                    disabled={!isEditing}
                                >
                                    <option value="FLAT">Flat</option>
                                    <option value="PERCENTAGE">Percentage</option>
                                    <option value="PER_WEIGHT">Per Weight</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Wastage Value ({formData.wastageType === "PERCENTAGE" ? "%" : formData.wastageType === "PER_WEIGHT" ? "₹/gram" : "₹"})</label>
                                <input
                                    type="number"
                                    step={formData.wastageType === "PERCENTAGE" ? "0.01" : "0.001"}
                                    max={formData.wastageType === "PERCENTAGE" ? "100" : undefined}
                                    value={formData.wastageValue}
                                    onChange={(e) => handleChange("wastageValue", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-field">
                                <label>Wastage Charges (₹) - Calculated</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.wastageCharges}
                                    className="readonly-field"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing Information */}
                    <div className="section">
                        <h4 className="section-title">Pricing Information</h4>
                        <div className="details-grid">
                            <div className="form-field">
                                <label>Purchase Rate (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.purchaseRate}
                                    onChange={(e) => handleChange("purchaseRate", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-field">
                                <label>Purchase Price (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.purchasePrice}
                                    onChange={(e) => handleChange("purchasePrice", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-field">
                                <label>Making Charges (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.makingCharges}
                                    onChange={(e) => handleChange("makingCharges", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-field">
                                <label>Profit Percentage (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.profitPercentage}
                                    onChange={(e) => handleChange("profitPercentage", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-field">
                                <label>Threshold Profit Percentage (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.thresholdProfitPercentage}
                                    onChange={(e) => handleChange("thresholdProfitPercentage", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-field highlight-field">
                                <label>Selling Price (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.sellingPrice}
                                    onChange={(e) => handleChange("sellingPrice", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stone Details */}
                    <div className="section">
                        <h4 className="section-title">Stone Details</h4>
                        <div className="details-grid">
                            <div className="form-field">
                                <label>Stone Type</label>
                                <input
                                    type="text"
                                    value={formData.stoneType}
                                    onChange={(e) => handleChange("stoneType", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-field">
                                <label>Stone Quality</label>
                                <input
                                    type="text"
                                    value={formData.stoneQuality}
                                    onChange={(e) => handleChange("stoneQuality", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="form-field">
                                <label>Certificate Number</label>
                                <input
                                    type="text"
                                    value={formData.certificateNumber}
                                    onChange={(e) => handleChange("certificateNumber", e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="section">
                        <h4 className="section-title">Additional Notes</h4>
                        <div className="form-field full-width">
                            <label>Notes</label>
                            <textarea
                                rows="3"
                                value={formData.notes}
                                onChange={(e) => handleChange("notes", e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    {!isEditing ? (
                        <>
                            <button className="primary-btn" onClick={() => setIsEditing(true)}>
                                Edit
                            </button>
                            <button className="secondary-btn" onClick={onClose}>
                                Close
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="success-btn" onClick={handleSave}>
                                Save Changes
                            </button>
                            <button className="cancel-btn" onClick={handleCancel}>
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}