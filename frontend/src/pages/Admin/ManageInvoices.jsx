import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";

const ManageInvoices = () => {
  // States for invoices data and UI
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // States for orders (for dropdowns)
  const [orders, setOrders] = useState([]);
  
  // States for create modal
  const [showModal, setShowModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    orderId: "",
    totalAmount: "",
    paymentMethod: "cash"
  });
  
  // States for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editInvoice, setEditInvoice] = useState({
    id: "",
    orderId: "",
    totalAmount: "",
    paymentMethod: ""
  });
  
  // States for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  // Fetch invoices and reference data on component mount
  useEffect(() => {
    fetchInvoices();
    fetchOrders();
  }, []);

  // Fetch invoices from API
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockInvoices = [
        { id: 1, orderId: 101, totalAmount: 125.50, paymentMethod: "cash" },
        { id: 2, orderId: 102, totalAmount: 78.25, paymentMethod: "bank transfer" },
        { id: 3, orderId: 103, totalAmount: 214.75, paymentMethod: "cash" }
      ];
      setInvoices(mockInvoices);
      
      // For actual API implementation:
      // const response = await fetch('/api/invoices');
      // const data = await response.json();
      // setInvoices(data);
      
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders for dropdown
  const fetchOrders = async () => {
    try {
      // Mock data - replace with actual API call
      const mockOrders = [
        { id: 101, customerName: "John Doe", totalAmount: 125.50 },
        { id: 102, customerName: "Jane Smith", totalAmount: 78.25 },
        { id: 103, customerName: "Mike Johnson", totalAmount: 214.75 }
      ];
      setOrders(mockOrders);
      
      // For actual API implementation:
      // const response = await fetch('/api/orders');
      // const data = await response.json();
      // setOrders(data);
      
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get order details by ID
  const getOrderDetails = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    return order ? `#${order.id} - ${order.customerName}` : `Order #${orderId}`;
  };

  // Format payment method for display
  const formatPaymentMethod = (method) => {
    switch (method) {
      case "cash":
        return "Cash";
      case "bank transfer":
        return "Bank Transfer";
      default:
        return method;
    }
  };

  // Handle input change for create form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice({ ...newInvoice, [name]: value });
  };

  // Handle input change for edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditInvoice({ ...editInvoice, [name]: value });
  };

  // Modal handlers - Create
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewInvoice({
      orderId: "",
      totalAmount: "",
      paymentMethod: "cash"
    });
  };

  // Modal handlers - Edit
  const handleShowEditModal = (invoice) => {
    setEditInvoice({
      id: invoice.id,
      orderId: invoice.orderId,
      totalAmount: invoice.totalAmount,
      paymentMethod: invoice.paymentMethod
    });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditInvoice({
      id: "",
      orderId: "",
      totalAmount: "",
      paymentMethod: ""
    });
  };

  // Modal handlers - Delete
  const handleShowDeleteModal = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setInvoiceToDelete(null);
  };

  // Create new invoice
  const handleCreateInvoice = async () => {
    if (!newInvoice.orderId || !newInvoice.totalAmount) {
      toast.error("Order and Total Amount are required");
      return;
    }

    if (isNaN(parseFloat(newInvoice.totalAmount))) {
      toast.error("Total Amount must be a valid number");
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      const newId = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
      const createdInvoice = {
        id: newId,
        orderId: Number(newInvoice.orderId),
        totalAmount: parseFloat(newInvoice.totalAmount),
        paymentMethod: newInvoice.paymentMethod
      };
      
      setInvoices([...invoices, createdInvoice]);
      toast.success("Invoice created successfully");
      handleCloseModal();
      
      // For actual API implementation:
      // const response = await fetch('/api/invoices', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newInvoice)
      // });
      // const data = await response.json();
      // if (response.ok) {
      //   fetchInvoices();
      //   toast.success("Invoice created successfully");
      //   handleCloseModal();
      // } else {
      //   toast.error(data.message || "Failed to create invoice");
      // }
      
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  // Edit invoice
  const handleEditInvoice = async () => {
    if (!editInvoice.orderId || !editInvoice.totalAmount) {
      toast.error("Order and Total Amount are required");
      return;
    }

    if (isNaN(parseFloat(editInvoice.totalAmount))) {
      toast.error("Total Amount must be a valid number");
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      const updatedInvoices = invoices.map(invoice => 
        invoice.id === editInvoice.id ? {
          ...editInvoice,
          orderId: Number(editInvoice.orderId),
          totalAmount: parseFloat(editInvoice.totalAmount)
        } : invoice
      );
      
      setInvoices(updatedInvoices);
      toast.success("Invoice updated successfully");
      handleCloseEditModal();
      
      // For actual API implementation:
      // const response = await fetch(`/api/invoices/${editInvoice.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editInvoice)
      // });
      // const data = await response.json();
      // if (response.ok) {
      //   fetchInvoices();
      //   toast.success("Invoice updated successfully");
      //   handleCloseEditModal();
      // } else {
      //   toast.error(data.message || "Failed to update invoice");
      // }
      
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;

    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      const filteredInvoices = invoices.filter(invoice => invoice.id !== invoiceToDelete.id);
      setInvoices(filteredInvoices);
      toast.success("Invoice deleted successfully");
      handleCloseDeleteModal();
      
      // For actual API implementation:
      // const response = await fetch(`/api/invoices/${invoiceToDelete.id}`, {
      //   method: 'DELETE'
      // });
      // if (response.ok) {
      //   fetchInvoices();
      //   toast.success("Invoice deleted successfully");
      //   handleCloseDeleteModal();
      // } else {
      //   const data = await response.json();
      //   toast.error(data.message || "Failed to delete invoice");
      // }
      
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
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
          Create New Invoice
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
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Order</th>
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Total Amount</th>
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Payment Method</th>
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map((invoice, index) => (
                  <tr key={invoice.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3 px-4 border border-gray-300">{invoice.id}</td>
                    <td className="py-3 px-4 border border-gray-300">{getOrderDetails(invoice.orderId)}</td>
                    <td className="py-3 px-4 border border-gray-300">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="py-3 px-4 border border-gray-300">{formatPaymentMethod(invoice.paymentMethod)}</td>
                    <td className="py-3 px-4 border border-gray-300">
                      <div className="flex flex-col gap-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded w-full"
                          style={{ backgroundColor: '#3B82F6', color: 'white' }}
                          onClick={() => handleShowEditModal(invoice)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded w-full"
                          style={{ backgroundColor: '#EF4444', color: 'white' }}
                          onClick={() => handleShowDeleteModal(invoice)}
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
                  <td colSpan="5" className="py-3 px-4 border border-gray-300 text-center">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formOrderId" className="mb-3">
              <Form.Label>Order <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="select"
                name="orderId"
                value={newInvoice.orderId}
                onChange={handleInputChange}
              >
                <option value="">Select Order</option>
                {orders.map(order => (
                  <option key={order.id} value={order.id}>
                    #{order.id} - {order.customerName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formTotalAmount" className="mb-3">
              <Form.Label>Total Amount <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="totalAmount"
                value={newInvoice.totalAmount}
                onChange={handleInputChange}
                placeholder="Enter total amount"
              />
            </Form.Group>
            <Form.Group controlId="formPaymentMethod" className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Control
                as="select"
                name="paymentMethod"
                value={newInvoice.paymentMethod}
                onChange={handleInputChange}
              >
                <option value="cash">Cash</option>
                <option value="bank transfer">Bank Transfer</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateInvoice} disabled={loading}>
            {loading ? "Creating..." : "Create Invoice"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Invoice Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="editOrderId" className="mb-3">
              <Form.Label>Order <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="select"
                name="orderId"
                value={editInvoice.orderId}
                onChange={handleEditInputChange}
              >
                <option value="">Select Order</option>
                {orders.map(order => (
                  <option key={order.id} value={order.id}>
                    #{order.id} - {order.customerName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="editTotalAmount" className="mb-3">
              <Form.Label>Total Amount <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="totalAmount"
                value={editInvoice.totalAmount}
                onChange={handleEditInputChange}
                placeholder="Enter total amount"
              />
            </Form.Group>
            <Form.Group controlId="editPaymentMethod" className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Control
                as="select"
                name="paymentMethod"
                value={editInvoice.paymentMethod}
                onChange={handleEditInputChange}
              >
                <option value="cash">Cash</option>
                <option value="bank transfer">Bank Transfer</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal} disabled={loading}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditInvoice} disabled={loading}>
            {loading ? "Updating..." : "Update Invoice"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {invoiceToDelete && (
            <p>Are you sure you want to delete invoice <strong>#{invoiceToDelete.id}</strong>?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteInvoice} disabled={loading}>
            {loading ? "Deleting..." : "Delete Invoice"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageInvoices;