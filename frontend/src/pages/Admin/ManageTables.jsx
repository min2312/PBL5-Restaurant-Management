import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
// import { useHistory } from "react-router-dom";

const ManageTables = () => {
  // States for tables data and UI
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // States for create modal
  const [showModal, setShowModal] = useState(false);
  const [newTable, setNewTable] = useState({
    tableNumber: "",
    status: "available"
  });
  
  // States for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTable, setEditTable] = useState({
    id: "",
    tableNumber: "",
    status: ""
  });
  
  // States for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);

  // Fetch tables on component mount
  useEffect(() => {
    fetchTables();
  }, []);

  // Fetch tables from API
  const fetchTables = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockTables = [
        { id: 1, tableNumber: "T001", status: "available" },
        { id: 2, tableNumber: "T002", status: "occupied" },
        { id: 3, tableNumber: "T003", status: "reserved" }
      ];
      setTables(mockTables);
      
      // For actual API implementation:
      // const response = await fetch('/api/tables');
      // const data = await response.json();
      // setTables(data);
      
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    switch (status) {
      case "available":
        return "Available";
      case "occupied":
        return "Occupied";
      case "reserved":
        return "Reserved";
      case "maintenance":
        return "Maintenance";
      default:
        return status;
    }
  };

  // Handle input change for create form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTable({ ...newTable, [name]: value });
  };

  // Handle input change for edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditTable({ ...editTable, [name]: value });
  };

  // Modal handlers - Create
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewTable({ tableNumber: "", status: "available" });
  };

  // Modal handlers - Edit
  const handleShowEditModal = (table) => {
    setEditTable({
      id: table.id,
      tableNumber: table.tableNumber,
      status: table.status
    });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditTable({ id: "", tableNumber: "", status: "" });
  };

  // Modal handlers - Delete
  const handleShowDeleteModal = (table) => {
    setTableToDelete(table);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setTableToDelete(null);
  };

  // Create new table
  const handleCreateTable = async () => {
    if (!newTable.tableNumber.trim()) {
      toast.error("Table number is required");
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      const newId = tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1;
      const createdTable = {
        id: newId,
        tableNumber: newTable.tableNumber,
        status: newTable.status
      };
      
      setTables([...tables, createdTable]);
      toast.success("Table created successfully");
      handleCloseModal();
      
      // For actual API implementation:
      // const response = await fetch('/api/tables', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newTable)
      // });
      // const data = await response.json();
      // if (response.ok) {
      //   fetchTables();
      //   toast.success("Table created successfully");
      //   handleCloseModal();
      // } else {
      //   toast.error(data.message || "Failed to create table");
      // }
      
    } catch (error) {
      console.error("Error creating table:", error);
      toast.error("Failed to create table");
    } finally {
      setLoading(false);
    }
  };

  // Edit table
  const handleEditTable = async () => {
    if (!editTable.tableNumber.trim()) {
      toast.error("Table number is required");
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      const updatedTables = tables.map(table => 
        table.id === editTable.id ? { ...editTable } : table
      );
      
      setTables(updatedTables);
      toast.success("Table updated successfully");
      handleCloseEditModal();
      
      // For actual API implementation:
      // const response = await fetch(`/api/tables/${editTable.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editTable)
      // });
      // const data = await response.json();
      // if (response.ok) {
      //   fetchTables();
      //   toast.success("Table updated successfully");
      //   handleCloseEditModal();
      // } else {
      //   toast.error(data.message || "Failed to update table");
      // }
      
    } catch (error) {
      console.error("Error updating table:", error);
      toast.error("Failed to update table");
    } finally {
      setLoading(false);
    }
  };

  // Delete table
  const handleDeleteTable = async () => {
    if (!tableToDelete) return;

    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      const filteredTables = tables.filter(table => table.id !== tableToDelete.id);
      setTables(filteredTables);
      toast.success("Table deleted successfully");
      handleCloseDeleteModal();
      
      // For actual API implementation:
      // const response = await fetch(`/api/tables/${tableToDelete.id}`, {
      //   method: 'DELETE'
      // });
      // if (response.ok) {
      //   fetchTables();
      //   toast.success("Table deleted successfully");
      //   handleCloseDeleteModal();
      // } else {
      //   const data = await response.json();
      //   toast.error(data.message || "Failed to delete table");
      // }
      
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error("Failed to delete table");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 flex flex-col items-center">
      <header className="w-full bg-gradient-to-r from-blue-700 to-blue-500 mb-4 rounded-md shadow-md">
        <h1 className="text-4xl font-bold text-black text-center">
          Manage Users
        </h1>
      </header>

      <div className="flex justify-center mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          style={{ backgroundColor: '#3B82F6', color: 'white' }}
          onClick={handleShowModal}
          disabled={loading}
        >
          Create New Table
        </button>
      </div>

      {loading && (
        <div className="text-center my-4">
          <p>Loading...</p>
        </div>
      )}

      <div className="flex justify-center items-center w-full px-4 py-6">
        <div className="overflow-x-auto shadow-md rounded-lg mx-auto" style={{ maxWidth: '900px' }}>
          <table className="bg-white border-collapse mx-auto" style={{ maxWidth: '900px', width: 'auto' }}>
            <thead>
              <tr className="bg-blue-600 text-black">
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">ID</th>
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Table Number</th>
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Status</th>
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tables.length > 0 ? (
                tables.map((table, index) => (
                  <tr key={table.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3 px-4 border border-gray-300">{table.id}</td>
                    <td className="py-3 px-4 border border-gray-300">{table.tableNumber}</td>
                    <td className="py-3 px-4 border border-gray-300">{formatStatus(table.status)}</td>
                    <td className="py-3 px-4 border border-gray-300">
                      <div className="flex flex-col gap-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded w-full"
                          style={{ backgroundColor: '#3B82F6', color: 'white' }}
                          onClick={() => handleShowEditModal(table)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded w-full"
                          style={{ backgroundColor: '#EF4444', color: 'white' }}
                          onClick={() => handleShowDeleteModal(table)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-3 px-4 border border-gray-300 text-center">
                    No tables found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Table Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Table</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formTableNumber" className="mb-3">
              <Form.Label>Table Number <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter table number"
                name="tableNumber"
                value={newTable.tableNumber}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formStatus" className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={newTable.status}
                onChange={handleInputChange}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateTable} disabled={loading}>
            {loading ? "Creating..." : "Create Table"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Table Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Table</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="editTableNumber" className="mb-3">
              <Form.Label>Table Number <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter table number"
                name="tableNumber"
                value={editTable.tableNumber}
                onChange={handleEditInputChange}
              />
            </Form.Group>
            <Form.Group controlId="editStatus" className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={editTable.status}
                onChange={handleEditInputChange}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal} disabled={loading}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditTable} disabled={loading}>
            {loading ? "Updating..." : "Update Table"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tableToDelete && (
            <p>Are you sure you want to delete table <strong>{tableToDelete.tableNumber}</strong>?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTable} disabled={loading}>
            {loading ? "Deleting..." : "Delete Table"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageTables;