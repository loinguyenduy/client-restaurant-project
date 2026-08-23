import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const emptyForm = { table_number: "", capacity: 2 };

const TableFormModal = ({ table, busy, onClose, onSubmit }) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(table ? { table_number: table.table_number, capacity: table.capacity } : emptyForm);
    setError("");
  }, [table]);

  const submit = (event) => {
    event.preventDefault();
    const tableNumber = form.table_number.trim();
    const capacity = Number(form.capacity);
    if (!tableNumber || tableNumber.length > 20) {
      return setError("Table number is required and must be 20 characters or fewer.");
    }
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) {
      return setError("Capacity must be a whole number from 1 to 50.");
    }
    setError("");
    return onSubmit({ table_number: tableNumber, capacity });
  };

  return (
    <div className="table-form-overlay" role="presentation" onClick={onClose}>
      <form
        className="table-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="table-form-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <header>
          <div>
            <span>Admin structural management</span>
            <h2 id="table-form-title">{table ? `Edit ${table.table_number}` : "Create Table"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close table form"><X /></button>
        </header>
        <div className="table-form-body">
          <label>
            Table number
            <input
              value={form.table_number}
              onChange={(event) => setForm({ ...form, table_number: event.target.value })}
              maxLength="20"
              placeholder="T01"
              autoFocus
            />
          </label>
          <label>
            Capacity
            <input
              type="number"
              min="1"
              max="50"
              value={form.capacity}
              onChange={(event) => setForm({ ...form, capacity: event.target.value })}
            />
          </label>
          {error && <p role="alert">{error}</p>}
        </div>
        <footer>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary" disabled={busy}>
            {busy ? "Saving..." : table ? "Save changes" : "Create table"}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default TableFormModal;
