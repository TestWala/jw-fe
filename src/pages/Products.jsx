import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import "./Products.css";

export default function Products() {
  const { inventoryItems, purity } = useContext(AppContext);
  const [search, setSearch] = useState("");

  const getPurityName = (purityId) => {
    if (!purity || !purityId) return purityId;

    const p = purity.find(x => x.id === purityId);

    return p ? `${p.metalType} (${p.karat})` : purityId;
  };


  const filtered = inventoryItems.filter((item) =>
    [
      item.itemCode,
      item.shortName,
      item.metalType,
      item.categoryName,
      getPurityName(item.purityId)
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="products-page">
      <h2>Inventory Items</h2>

      <input
        className="search-box"
        placeholder="Search by Code, Name, Metal..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* SCROLL WRAPPER */}
      <div className="product-table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Name</th>
              <th>Metal</th>
              <th>Purity</th>
              <th>Gross Wt</th>
              <th>Net Wt</th>
              <th>Purchase</th>
              <th>Selling</th>
              <th>Qty</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item, i) => (
              <tr key={i} className={item.currentQuantity < 2 ? "row-low-stock" : ""}>
                <td>{item.itemCode}</td>
                <td>{item.shortName}</td>
                <td>{item.metalType}</td>
                <td>{getPurityName(item.purityId)}</td>
                <td>{item.grossWeight}</td>
                <td>{item.netWeight}</td>
                <td>₹{item.purchasePrice}</td>
                <td>₹{item.sellingPrice}</td>
                <td>{item.currentQuantity}</td>
                <td>{item.isActive ? "Active" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  );
}
