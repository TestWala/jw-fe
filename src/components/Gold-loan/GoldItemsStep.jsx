import { useState, useEffect } from "react";
import "./StepStyles.css";

export default function GoldItemsStep({ formData, onUpdate }) {
  const [items, setItems] = useState(
    formData.goldItems.length > 0
      ? formData.goldItems
      : [
          {
            item: "",
            purity: "22K",
            grossWeight: "",
            netWeight: "",
            value: 0
          }
        ]
  );

  useEffect(() => {
    onUpdate({ goldItems: items });
  }, [items]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        item: "",
        purity: "22K",
        grossWeight: "",
        netWeight: "",
        value: 0
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Auto-calculate net weight (95% of gross weight)
    if (field === "grossWeight" && value) {
      newItems[index].netWeight = (parseFloat(value) * 0.95).toFixed(2);
    }

    setItems(newItems);
  };

  return (
    <div className="step-form">
      <h3 className="step-title">Gold Items</h3>
      <p className="step-description">
        Add details of the gold items being pledged
      </p>

      <div className="items-list">
        {items.map((item, index) => (
          <div key={index} className="item-card">
            <div className="item-header">
              <h4>Item {index + 1}</h4>
              {items.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveItem(index)}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Item Type *</label>
                <select
                  value={item.item}
                  onChange={(e) =>
                    handleItemChange(index, "item", e.target.value)
                  }
                >
                  <option value="">Select item</option>
                  <option value="Gold Chain">Gold Chain</option>
                  <option value="Gold Necklace">Gold Necklace</option>
                  <option value="Gold Bangles">Gold Bangles</option>
                  <option value="Gold Ring">Gold Ring</option>
                  <option value="Gold Earrings">Gold Earrings</option>
                  <option value="Gold Bracelet">Gold Bracelet</option>
                  <option value="Gold Coins">Gold Coins</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Purity *</label>
                <select
                  value={item.purity}
                  onChange={(e) =>
                    handleItemChange(index, "purity", e.target.value)
                  }
                >
                  <option value="24K">24K (99.9%)</option>
                  <option value="22K">22K (91.6%)</option>
                  <option value="18K">18K (75%)</option>
                  <option value="14K">14K (58.3%)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Gross Weight (g) *</label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={item.grossWeight}
                  onChange={(e) =>
                    handleItemChange(index, "grossWeight", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Net Weight (g)</label>
                <input
                  type="number"
                  placeholder="Auto-calculated"
                  step="0.01"
                  value={item.netWeight}
                  onChange={(e) =>
                    handleItemChange(index, "netWeight", e.target.value)
                  }
                />
                <small className="help-text">
                  Auto-calculated as 95% of gross weight
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="add-item-btn" onClick={handleAddItem}>
        + Add Another Item
      </button>

      <div className="info-box">
        <span className="info-icon">⚖️</span>
        <p>
          Net weight is automatically calculated as 95% of gross weight to
          account for stone weight and impurities.
        </p>
      </div>
    </div>
  );
}