import { useEffect, useState, useContext } from "react";
import "./Settings.css";
import settingsApi from "../../api/settingsApi";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

export default function Settings() {
  const { settings, reloadSettings } = useContext(AppContext);

  const [valueMap, setValueMap] = useState({});

  /* =========================
     ROLE CHECK
  ========================= */
  const canEditSettings = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.role === "admin" || user?.role === "owner";
    } catch {
      return false;
    }
  };

  /* =========================
     SYNC INPUT VALUES
  ========================= */
  useEffect(() => {
    const map = {};
    settings.forEach(s => {
      map[s.id] = s.value;
    });
    setValueMap(map);
  }, [settings]);

  /* =========================
     UPDATE SETTING
  ========================= */
  const updateSetting = async (setting) => {
    if (!canEditSettings()) return;

    const payload = {
      id: setting.id,
      value: valueMap[setting.id],
      active: setting.active
    };

    const res = await settingsApi.updateSetting(payload);

    if (res.success) {
      toast.success(`${setting.key} updated successfully`);
      reloadSettings();
    } else {
      toast.error(res.error || "Update failed");
    }
  };

  /* =========================
     TOGGLE ACTIVE
  ========================= */
  const toggleActive = async (setting) => {
    const payload = {
      value: valueMap[setting.id],
      active: !setting.active
    };

    const res = await settingsApi.updateSetting(setting.id, payload);

    if (res.success) {
      toast.success("Status updated");
      reloadSettings();
    } else {
      toast.error(res.error || "Status update failed");
    }
  };

  return (
    <div className="settings-page">
      <h2>Tax Settings</h2>

      <div className="settings-table-wrapper">
        <table className="settings-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {settings.map((s) => (
              <tr key={s.id}>
                <td className="setting-key">{s.key}</td>

                <td>
                  <input
                    type="text"
                    value={valueMap[s.id] ?? s.value}
                    disabled={!canEditSettings()}
                    onChange={(e) =>
                      setValueMap({
                        ...valueMap,
                        [s.id]: e.target.value
                      })
                    }
                    className="setting-input"
                  />
                </td>

                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={s.active}
                      disabled={!canEditSettings()}
                      onChange={() => toggleActive(s)}
                    />
                    <span className="slider"></span>
                  </label>
                </td>

                <td>
                  <button
                    className="update-btn"
                    disabled={!canEditSettings()}
                    onClick={() => updateSetting(s)}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}

            {!settings.length && (
              <tr>
                <td colSpan="4" className="empty-text">
                  No settings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
