import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import "./Products.css";

export default function Products() {
  const { inventoryItems } = useContext(AppContext);
  const [search, setSearch] = useState("");

  const filtered = inventoryItems.filter((item) =>
    [
      item.itemCode,
      item.shortName,
      item.metalType,
      item.categoryName,
      item.purityName
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
            <tr key={i}>
              <td>{item.itemCode}</td>
              <td>{item.shortName}</td>
              <td>{item.metalType}</td>
              <td>{item.purityName || item.purityId}</td>
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
  );
}
