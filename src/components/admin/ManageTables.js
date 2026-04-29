import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { getAllTablesApi, createTableApi, updateTableStatusApi, deleteTableApi } from '../../services/adminService';
import './AdminTable.scss';

const ManageTables = () => {
    const [tables, setTables] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        setIsLoading(true);
        try {
            const res = await getAllTablesApi();
            if (res && res.EC === 0) {
                setTables(res.DT);
            } else toast.error(res.EM || "Failed to fetch tables");
        } catch (error) { toast.error("Server error"); }
        setIsLoading(false);
    };

    const handleAddTable = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Add New Table',
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="Table Number (e.g. T01)">' +
                '<input id="swal-input2" type="number" class="swal2-input" placeholder="Capacity (e.g. 4)">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#0F172A',
            preConfirm: () => {
                const table_number = document.getElementById('swal-input1').value;
                const capacity = document.getElementById('swal-input2').value;
                if (!table_number || !capacity) {
                    Swal.showValidationMessage('Please enter both fields');
                    return null;
                }
                return { table_number, capacity };
            }
        });

        if (formValues) {
            try {
                let res = await createTableApi(formValues);
                if (res && res.EC === 0) {
                    toast.success("Table added successfully!");
                    fetchTables();
                } else toast.error(res.EM);
            } catch (e) { toast.error("Error adding table"); }
        }
    };

    const handleStatusChange = async (tableId, newStatus) => {
        try {
            let res = await updateTableStatusApi(tableId, newStatus);
            if (res && res.EC === 0) {
                toast.success("Status updated!");
                fetchTables();
            } else toast.error(res.EM);
        } catch (e) { toast.error("Error updating status"); }
    };

    const handleDeleteTable = async (tableId, tableNumber) => {
        const isConfirm = await Swal.fire({
            title: 'Delete Table?',
            text: `Are you sure you want to delete table ${tableNumber}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            confirmButtonText: 'Yes, delete it!'
        });

        if (isConfirm.isConfirmed) {
            try {
                let res = await deleteTableApi(tableId);
                if (res && res.EC === 0) {
                    toast.success("Table deleted!");
                    fetchTables();
                } else toast.error(res.EM);
            } catch (e) { toast.error("Error deleting table"); }
        }
    };

    return (
        <div className="admin-page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Manage Tables</h1>
                <button 
                    onClick={handleAddTable}
                    style={{ background: '#0F172A', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                    <Plus size={18} /> Add Table
                </button>
            </div>

            <div className="table-card">
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>TABLE NUMBER</th>
                                <th>CAPACITY</th>
                                <th>STATUS</th>
                                <th className="text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="4" className="empty-state"><Loader className="spin" size={24}/></td></tr>
                            ) : tables.length === 0 ? (
                                <tr><td colSpan="4" className="empty-state">No tables found.</td></tr>
                            ) : (
                                tables.map(table => (
                                    <tr key={table.id}>
                                        <td><span className="primary-text">{table.table_number}</span></td>
                                        <td><span className="secondary-text">{table.capacity} Persons</span></td>
                                        <td>
                                            <select 
                                                className="status-select"
                                                value={table.status}
                                                onChange={(e) => handleStatusChange(table.id, e.target.value)}
                                            >
                                                <option value="available">Available</option>
                                                <option value="occupied">Occupied</option>
                                                <option value="reserved">Reserved</option>
                                            </select>
                                        </td>
                                        <td className="text-right">
                                            <button 
                                                onClick={() => handleDeleteTable(table.id, table.table_number)}
                                                style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageTables;