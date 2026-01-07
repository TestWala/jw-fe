import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import InventoryDetailsModal from "../components/Modals/InventoryDetailsModal.jsx";
import inventoryApi from "../api/inventoryApi";
import { toast } from "react-toastify"
import "./Products.css";

export default function Products() {
  const { inventoryItems, purity, reload } = useContext(AppContext);

  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const getPurityName = (purityId) => {
    if (!purity || !purityId) return "-";
    const purityRecord = purity.find((p) => p.id === purityId);
    return purityRecord
      ? `${purityRecord.metalType} (${purityRecord.karat})`
      : "-";
  };

  const filteredInventoryItems = inventoryItems.filter((item) =>
    [
      item.itemCode,
      getPurityName(item.purityId),
      item.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ================= UPDATE HANDLER =================
  const handleUpdateInventoryItem = async (updatedItem) => {
    const response = await inventoryApi.updateInventoryItem(updatedItem);

    if (response.success) {
      toast.success("Inventory item updated successfully");
      await reload();
      setSelectedItem(null);
    } else {
      toast.error("Update fails")
      console.log(response.error);
    }
  };

  return (
    <div className="products-page">
      <h2>Unique Assets</h2>

      <input
        className="search-box"
        placeholder="Search by Item Code / Purity / Status"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="product-table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Purity</th>
              <th>Gross Wt</th>
              <th>Net Wt</th>
              <th>Purchase</th>
              <th>Selling</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredInventoryItems.map((item) => (
              <tr key={item.id}>
                <td>{item.itemCode}</td>
                <td>{getPurityName(item.purityId)}</td>
                <td>{item.grossWeight}</td>
                <td>{item.netWeight}</td>
                <td>₹{item.purchasePrice}</td>
                <td>₹{item.sellingPrice}</td>
                <td>
                  <span className={`stock-badge ${item.status}`}>
                    {item.status === "CREATED" && "⏳ "}
                    {item.status === "IN_STOCK" && "✔ "}
                    {item.status === "SOLD" && "💰 "}
                    {item.status === "GIFTED" && "🎁 "}
                    {item.status === "ADJUSTED" && "⚙️ "}
                    {item.status === "DAMAGED" && "⚠️ "}
                    {item.status.replace("_", " ")}
                  </span>

                </td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => setSelectedItem(item)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {filteredInventoryItems.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-text">
                  No inventory items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETAILS MODAL */}
      {selectedItem && (
        <InventoryDetailsModal
          item={selectedItem}
          purity={purity}
          getPurityName={getPurityName}
          onClose={() => setSelectedItem(null)}
          onUpdate={handleUpdateInventoryItem}
        />
      )}
    </div>
  );
}
