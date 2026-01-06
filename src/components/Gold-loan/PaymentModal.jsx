export default function PaymentModal({ onClose }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Receive Payment</h3>

        <input placeholder="Amount" />
        <select>
          <option>Interest</option>
          <option>Principal</option>
        </select>
        <select>
          <option>Cash</option>
          <option>UPI</option>
          <option>Bank Transfer</option>
        </select>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button className="primary">Submit</button>
        </div>
      </div>
    </div>
  );
}
