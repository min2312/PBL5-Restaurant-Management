import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
// import { useHistory } from "react-router-dom";

const ManageOrders = () => {
  // States for orders data and UI
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // States for tables, customers and users (for dropdowns)
  const [tables, setTables] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);

  // States for create modal
  const [showModal, setShowModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerId: "",
    tableId: "",
    userId: "",
    status: "pending"
  });

  // States for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState({
    id: "",
    customerId: "",
    tableId: "",
    userId: "",
    status: ""
  });

  // States for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Fetch orders and reference data on component mount
  useEffect(() => {
    fetchOrders();
    fetchTables();
    fetchCustomers();
    fetchUsers();
  }, []);

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockOrders = [
        { id: 1, customerId: 101, tableId: 1, userId: 201, status: "pending" },
        { id: 2, customerId: 102, tableId: 2, userId: 202, status: "processing" },
        { id: 3, customerId: 103, tableId: 3, userId: 203, status: "completed" }
      ];
      setOrders(mockOrders);

      // For actual API implementation:
      // const response = await fetch('/api/orders');
      // const data = await response.json();
      // setOrders(data);

    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Fetch tables for dropdown
  const fetchTables = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTables = [
        { id: 1, tableNumber: "T001" },
        { id: 2, tableNumber: "T002" },
        { id: 3, tableNumber: "T003" }
      ];
      setTables(mockTables);

      // For actual API implementation:
      // const response = await fetch('/api/tables');
      // const data = await response.json();
      // setTables(data);

    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      // Mock data - replace with actual API call
      const mockCustomers = [
        { id: 101, name: "John Doe" },
        { id: 102, name: "Jane Smith" },
        { id: 103, name: "Mike Johnson" }
      ];
      setCustomers(mockCustomers);

      // For actual API implementation:
      // const response = await fetch('/api/customers');
      // const data = await response.json();
      // setCustomers(data);

    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      // Mock data - replace with actual API call
      const mockUsers = [
        { id: 201, fullName: "David Wilson", role: "waiter" },
        { id: 202, fullName: "Sarah Brown", role: "waiter" },
        { id: 203, fullName: "James Taylor", role: "waiter" }
      ];
      setUsers(mockUsers);

      // For actual API implementation:
      // const response = await fetch('/api/users');
      // const data = await response.json();
      // setUsers(data);

    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  // Get table number by ID
  const getTableNumber = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    return table ? table.tableNumber : tableId;
  };

  // Get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : customerId;
  };

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.fullName : userId;
  };

  // Handle input change for create form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder({ ...newOrder, [name]: value });
  };

  // Handle input change for edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditOrder({ ...editOrder, [name]: value });
  };

  // Modal handlers - Create
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewOrder({
      customerId: "",
      tableId: "",
      userId: "",
      status: "pending"
    });
  };

  // Modal handlers - Edit
  const handleShowEditModal = (order) => {
    setEditOrder({
      id: order.id,
      customerId: order.customerId,
      tableId: order.tableId,
      userId: order.userId,
      status: order.status
    });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditOrder({
      id: "",
      customerId: "",
      tableId: "",
      userId: "",
      status: ""
    });
  };

  // Modal handlers - Delete
  const handleShowDeleteModal = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  // Create new order
  const handleCreateOrder = async () => {
    if (!newOrder.customerId || !newOrder.tableId || !newOrder.userId) {
      toast.error("Customer, Table and User are required");
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
      const createdOrder = {
        id: newId,
        customerId: Number(newOrder.customerId),
        tableId: Number(newOrder.tableId),
        userId: Number(newOrder.userId),
        status: newOrder.status
      };

      setOrders([...orders, createdOrder]);
      toast.success("Order created successfully");
      handleCloseModal();

      // For actual API implementation:
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newOrder)
      // });
      // const data = await response.json();
      // if (response.ok) {
      //   fetchOrders();
      //   toast.success("Order created successfully");
      //   handleCloseModal();
      // } else {
      //   toast.error(data.message || "Failed to create order");
      // }

    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  // Edit order
  const handleEditOrder = async () => {
    if (!editOrder.customerId || !editOrder.tableId || !editOrder.userId) {
      toast.error("Customer, Table and User are required");
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      const updatedOrders = orders.map(order =>
        order.id === editOrder.id ? {
          ...editOrder,
          customerId: Number(editOrder.customerId),
          tableId: Number(editOrder.tableId),
          userId: Number(editOrder.userId)
        } : order
      );

      setOrders(updatedOrders);
      toast.success("Order updated successfully");
      handleCloseEditModal();

      // For actual API implementation:
      // const response = await fetch(`/api/orders/${editOrder.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editOrder)
      // });
      // const data = await response.json();
      // if (response.ok) {
      //   fetchOrders();
      //   toast.success("Order updated successfully");
      //   handleCloseEditModal();
      // } else {
      //   toast.error(data.message || "Failed to update order");
      // }

    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  // Delete order
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      const filteredOrders = orders.filter(order => order.id !== orderToDelete.id);
      setOrders(filteredOrders);
      toast.success("Order deleted successfully");
      handleCloseDeleteModal();

      // For actual API implementation:
      // const response = await fetch(`/api/orders/${orderToDelete.id}`, {
      //   method: 'DELETE'
      // });
      // if (response.ok) {
      //   fetchOrders();
      //   toast.success("Order deleted successfully");
      //   handleCloseDeleteModal();
      // } else {
      //   const data = await response.json();
      //   toast.error(data.message || "Failed to delete order");
      // }

    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
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
          Create New Order
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
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Customer</th>
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Table</th>
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Server</th>
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Status</th>
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <tr key={order.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3 px-4 border border-gray-300">{order.id}</td>
                    <td className="py-3 px-4 border border-gray-300">{getCustomerName(order.customerId)}</td>
                    <td className="py-3 px-4 border border-gray-300">{getTableNumber(order.tableId)}</td>
                    <td className="py-3 px-4 border border-gray-300">{getUserName(order.userId)}</td>
                    <td className="py-3 px-4 border border-gray-300">{formatStatus(order.status)}</td>
                    <td className="py-3 px-4 border border-gray-300">
                      <div className="flex flex-col gap-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded w-full"
                          style={{ backgroundColor: '#3B82F6', color: 'white' }}
                          onClick={() => handleShowEditModal(order)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded w-full"
                          style={{ backgroundColor: '#EF4444', color: 'white' }}
                          onClick={() => handleShowDeleteModal(order)}
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
                  <td colSpan="6" className="py-3 px-4 border border-gray-300 text-center">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formCustomerId" className="mb-3">
              <Form.Label>Customer <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="select"
                name="customerId"
                value={newOrder.customerId}
                onChange={handleInputChange}
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formTableId" className="mb-3">
              <Form.Label>Table <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="select"
                name="tableId"
                value={newOrder.tableId}
                onChange={handleInputChange}
              >
                <option value="">Select Table</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>
                    {table.tableNumber}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controllId="formUserId" className="mb-3">
              <Form.Label>Server <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="select"
                name="userId"
                value={newOrder.userId}
                onChange={handleInputChange}
              >
                <option value="">Select Server</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formStatus" className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={newOrder.status}
                onChange={handleInputChange}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateOrder} disabled={loading}>
            {loading ? "Creating..." : "Create Order"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Order Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="editCustomerId" className="mb-3">
              <Form.Label>Customer <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="select"
                name="customerId"
                value={editOrder.customerId}
                onChange={handleEditInputChange}
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="editTableId" className="mb-3">
              <Form.Label>Table <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="select"
                name="tableId"
                value={editOrder.tableId}
                onChange={handleEditInputChange}
              >
                <option value="">Select Table</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>
                    {table.tableNumber}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="editUserId" className="mb-3">
              <Form.Label>Server <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="select"
                name="userId"
                value={editOrder.userId}
                onChange={handleEditInputChange}
              >
                <option value="">Select Server</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="editStatus" className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={editOrder.status}
                onChange={handleEditInputChange}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal} disabled={loading}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditOrder} disabled={loading}>
            {loading ? "Updating..." : "Update Order"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {orderToDelete && (
            <p>Are you sure you want to delete order <strong>#{orderToDelete.id}</strong>?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteOrder} disabled={loading}>
            {loading ? "Deleting..." : "Delete Order"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageOrders;