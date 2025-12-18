import { useState } from "react";
import "./InventoryDetailsModal.css";

export default function InventoryDetailsModal({ item, purity, getPurityName, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        itemCode: item.itemCode || "",
        status: item.status || "",
        grossWeight: item.grossWeight || "",
        netWeight: item.netWeight || "",
        stoneWeight: item.stoneWeight || "",
        wastageWeight: item.wastageWeight || "",
        purchaseRate: item.purchaseRate || "",
        purchasePrice: item.purchasePrice || "",
        makingCharges: item.makingCharges || "",
        profitPercentage: item.profitPercentage || "",
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
        setFormData({ ...formData, [field]: value });
    };

    const handleSave = () => {
        if (!onUpdate) return;

        const updatedPayload = {
            id: item.id,
            itemCode: formData.itemCode,
            status: formData.status,

            grossWeight: Number(formData.grossWeight),
            netWeight: Number(formData.netWeight),
            stoneWeight: Number(formData.stoneWeight),
            wastageWeight: Number(formData.wastageWeight),

            purchaseRate: Number(formData.purchaseRate),
            purchasePrice: Number(formData.purchasePrice),
            makingCharges: Number(formData.makingCharges),
            profitPercentage: Number(formData.profitPercentage),
            sellingPrice: Number(formData.sellingPrice),

            purityId: formData.purityId,
            stoneType: formData.stoneType,
            stoneQuality: formData.stoneQuality,
            certificateNumber: formData.certificateNumber,
            barcode: formData.barcode,
            notes: formData.notes,
        };

        onUpdate(updatedPayload);
        setIsEditing(false);
    };


    const handleCancel = () => {
        // Reset to original values
        setFormData({
            itemCode: item.itemCode || "",
            status: item.status || "",
            grossWeight: item.grossWeight || "",
            netWeight: item.netWeight || "",
            stoneWeight: item.stoneWeight || "",
            wastageWeight: item.wastageWeight || "",
            purchaseRate: item.purchaseRate || "",
            purchasePrice: item.purchasePrice || "",
            makingCharges: item.makingCharges || "",
            profitPercentage: item.profitPercentage || "",
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

                            <div className="form-field">
                                <label>Wastage Weight</label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={formData.wastageWeight}
                                    onChange={(e) => handleChange("wastageWeight", e.target.value)}
                                    disabled={!isEditing}
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