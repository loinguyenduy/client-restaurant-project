import React from "react";
import TableCard from "./TableCard";

const TableMap = ({ tables, isAdmin, busyId, onStatus, onEdit, onDelete }) => {
  const counts = tables.reduce((result, table) => ({
    ...result,
    [table.status]: (result[table.status] || 0) + 1,
  }), {});

  return (
    <>
      <section className="table-summary" aria-label="Table status summary">
        <div><strong>{tables.length}</strong><span>Total tables</span></div>
        <div><strong>{counts.available || 0}</strong><span>Available</span></div>
        <div><strong>{counts.occupied || 0}</strong><span>Occupied</span></div>
        <div><strong>{counts.out_of_service || 0}</strong><span>Out of service</span></div>
        {counts.reserved > 0 && <div><strong>{counts.reserved}</strong><span>Legacy reserved</span></div>}
      </section>
      <section className="table-map-grid">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            isAdmin={isAdmin}
            busy={busyId === table.id}
            onStatus={onStatus}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </section>
    </>
  );
};

export default TableMap;
