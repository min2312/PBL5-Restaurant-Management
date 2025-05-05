import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  GetAllUser,
  CreateNewUser,
  EditUserService,
  DeleteUser
} from '../../services/userService';

const ManageUsers = () => {
  // States for users data and UI
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // States for create modal
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "receptionist"
  });

  // States for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState({
    id: "",
    fullName: "",
    email: "",
    password: "",
    role: ""
  });

  // States for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await GetAllUser("ALL");
      if (response?.data?.errCode === 0) {
        setUsers(response.data.user || []);
      } else {
        throw new Error(response?.data?.errMessage || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Format role for display
  const formatRole = (role) => {
    switch (role) {
      case "receptionist":
        return "Receptionist";
      case "waiter":
        return "Waiter";
      case "chef":
        return "Chef";
      case "admin":
        return "Admin";
      default:
        return role;
    }
  };

  // Handle input change for create form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  // Handle input change for edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser({ ...editUser, [name]: value });
  };

  // Modal handlers - Create
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewUser({ fullName: "", email: "", password: "", role: "receptionist" });
  };

  // Modal handlers - Edit
  const handleShowEditModal = (user) => {
    setEditUser({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      password: "", // Do not show the actual password
      role: user.role
    });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditUser({ id: "", fullName: "", email: "", password: "", role: "" });
  };

  // Modal handlers - Delete
  const handleShowDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Create new user
  const handleCreateUser = async () => {
    if (!newUser.fullName.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const response = await CreateNewUser(newUser);
      if (response?.data?.errCode === 0) {
        toast.success("User created successfully");
        fetchUsers();
        handleCloseModal();
      } else {
        throw new Error(response?.data?.errMessage || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  // Edit user
  const handleEditUser = async () => {
    if (!editUser.fullName.trim() || !editUser.email.trim()) {
      toast.error("Full name and email are required");
      return;
    }

    setLoading(true);
    try {
      const response = await EditUserService(editUser);
      if (response?.data?.errCode === 0) {
        toast.success("User updated successfully");
        fetchUsers();
        handleCloseEditModal();
      } else {
        throw new Error(response?.data?.errMessage || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setLoading(true);
    try {
      const response = await DeleteUser(userToDelete.id);
      if (response?.data?.errCode === 0) {
        toast.success("User deleted successfully");
        fetchUsers();
        handleCloseDeleteModal();
      } else {
        throw new Error(response?.data?.errMessage || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 flex flex-col items-center">
      <header className="w-full bg-gradient-to-r from-blue-700 to-blue-500 mb-4 rounded-md shadow-md">
        <h1 className="text-4xl font-bold text-center"
          style={{ color: 'red' }}>
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
          Create New User
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
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Full Name</th>
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Email</th>
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Role</th>
                <th className="py-3 px-4 border border-gray-300 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3 px-4 border border-gray-300">{user.id}</td>
                    <td className="py-3 px-4 border border-gray-300">{user.fullName}</td>
                    <td className="py-3 px-4 border border-gray-300">{user.email}</td>
                    <td className="py-3 px-4 border border-gray-300">{formatRole(user.role)}</td>
                    <td className="py-3 px-4 border border-gray-300">
                      <div className="flex flex-col gap-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded w-full"
                          style={{ backgroundColor: '#3B82F6', color: 'white' }}
                          onClick={() => handleShowEditModal(user)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded w-full"
                          style={{ backgroundColor: '#EF4444', color: 'white' }}
                          onClick={() => handleShowDeleteModal(user)}
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
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFullName" className="mb-3">
              <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter full name"
                name="fullName"
                value={newUser.fullName}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Password <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                name="password"
                value={newUser.password}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formRole" className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Control
                as="select"
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
              >
                <option value="receptionist">Receptionist</option>
                <option value="waiter">Waiter</option>
                <option value="chef">Chef</option>
                <option value="admin">Admin</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateUser} disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="editFullName" className="mb-3">
              <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter full name"
                name="fullName"
                value={editUser.fullName}
                onChange={handleEditInputChange}
              />
            </Form.Group>
            <Form.Group controlId="editEmail" className="mb-3">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                value={editUser.email}
                onChange={handleEditInputChange}
              />
            </Form.Group>
            <Form.Group controlId="editPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password (leave blank to keep current)"
                name="password"
                value={editUser.password}
                onChange={handleEditInputChange}
              />
            </Form.Group>
            <Form.Group controlId="editRole" className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Control
                as="select"
                name="role"
                value={editUser.role}
                onChange={handleEditInputChange}
              >
                <option value="receptionist">Receptionist</option>
                <option value="waiter">Waiter</option>
                <option value="chef">Chef</option>
                <option value="admin">Admin</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal} disabled={loading}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditUser} disabled={loading}>
            {loading ? "Updating..." : "Update User"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <p>Are you sure you want to delete user <strong>{userToDelete.fullName}</strong>?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser} disabled={loading}>
            {loading ? "Deleting..." : "Delete User"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageUsers;