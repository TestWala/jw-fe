import { useContext, useEffect, useState } from "react";
import "./MetalPriceSettings.css";
import { AppContext } from "../../context/AppContext";
import metalPriceApi from "../../api/metalBasePriceApi";
import { toast } from "react-toastify";

export default function MetalPriceSettings() {
  const { purity, metalPrices, reload } = useContext(AppContext);

  const [priceMap, setPriceMap] = useState({});
  const [headerPrices, setHeaderPrices] = useState([]);

  const canEditPrice = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.role === "admin" || user?.role === "owner";
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("metal_header_prices");
    if (stored) {
      setHeaderPrices(JSON.parse(stored));
    }
  }, []);


  useEffect(() => {
    if (!metalPrices?.length) return;

    const map = {};
    metalPrices.forEach(mp => {
      if (mp.active) {
        map[mp.purityId] = mp.price;
      }
    });

    setPriceMap(map);
  }, [metalPrices]);

  const toggleHeader = (purityId, price) => {
    const alreadySelected = headerPrices.some(p => p.purityId === purityId);

    // If trying to ADD and already 3 selected → block
    if (!alreadySelected && headerPrices.length >= 3) {
      toast.warning("You can set a maximum of 3 metals on header ⚠️");
      return;
    }

    let updated;

    if (alreadySelected) {
      // REMOVE
      updated = headerPrices.filter(p => p.purityId !== purityId);
    } else {
      // ADD
      updated = [...headerPrices, { purityId, price }];
    }

    setHeaderPrices(updated);
    localStorage.setItem("metal_header_prices", JSON.stringify(updated));
  };


  const updatePrice = async (purityId) => {
    try {
      const payload = {
        purityId: purityId,
        price: Number(priceMap[purityId]),
        updateDate: new Date("2025-12-23T00:00:00+05:30")
          .toISOString()
          .replace("Z", "+05:30")
      };


      const res = await metalPriceApi.updateMetalPrices(payload);

      if (res.success) {
        toast.success("Price updated successfully 💰");
        reload();
      } else {
        toast.error(res.error || "Update failed");
      }
    } catch {
      toast.error("Server error");
    }
  };

  const renderMetalTable = (metalType, title) => (
    <div className={`metal-box ${metalType}`} key={metalType}>
      <h3>{title}</h3>

      <table>
        <thead>
          <tr>
            <th>Purity</th>
            <th>Purity %</th>
            <th>Price (₹)</th>
            <th>Set on Header</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {purity
            .filter(p => p.metalType === metalType)
            .map(p => {
              const price = priceMap[p.id] || "";
              const isHeader = headerPrices.some(h => h.purityId === p.id);

              return (
                <tr key={p.id}>
                  <td>{p.karat}</td>
                  <td>{p.purityPercentage}%</td>

                  <td>
                    <input
                      type="number"
                      value={price}
                      disabled={!canEditPrice()}
                      className="price-input"
                      onChange={(e) =>
                        setPriceMap({
                          ...priceMap,
                          [p.id]: e.target.value
                        })
                      }
                    />
                  </td>

                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={isHeader}
                        disabled={!canEditPrice() || (!isHeader && headerPrices.length >= 3)}
                        onChange={() => toggleHeader(p.id, price)}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>

                  <td>
                    <button
                      className="update-btn"
                      disabled={!canEditPrice()}
                      onClick={() => updatePrice(p.id)}
                    >
                      Update
                    </button>
                  </td>

                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );


  return (
    <div className="metal-page">
      <h2>Metal Prices</h2>

      {renderMetalTable("gold", "Gold")}
      {renderMetalTable("silver", "Silver")}
      {renderMetalTable("platinum", "Platinum")}
    </div>
  );
}
