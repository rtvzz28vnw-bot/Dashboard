import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  IconButton,
  Tooltip,
  Switch,
} from "@material-tailwind/react";
import {
  Pencil,
  Trash2,
  Eye,
  Search,
  UserPlus,
  Lock,
  CheckCircle,
  XCircle,
  Users as UsersIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  User,
  Filter,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import Swal from "sweetalert2";

export function Users() {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");

  // Modal states
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openResetPasswordModal, setOpenResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    secondName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "user",
    isVerified: false,
  });

  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users when debounced search or other filters change
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, debouncedSearchQuery, roleFilter, verifiedFilter]);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/api/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearchQuery || undefined,
          role: roleFilter || undefined,
          verified:
            verifiedFilter === "" ? undefined : verifiedFilter === "true",
        },
      });

      console.log("📥 API Response:", response.data);

      if (response.data.success && response.data.data) {
        setUsersData(response.data.data);
        setPagination(response.data.pagination);
      } else if (Array.isArray(response.data)) {
        setUsersData(response.data);
      }
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      setUsersData([]);
    } finally {
      setLoading(false);
    }
  };

  // Custom Swal configuration for modals
  const showAlert = (config) => {
    return Swal.fire({
      ...config,
      customClass: {
        container: "swal-high-z-index",
      },
    });
  };

  const handleCreateUser = async () => {
    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      showAlert({
        icon: "warning",
        title: "Please fill all required fields",
        text: "First Name, Last Name, Email, and Password are required",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/api/admin/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setOpenCreateModal(false);
        fetchUsers();
        resetForm();
        showAlert({
          icon: "success",
          title: "User created successfully!",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);

      showAlert({
        icon: "error",
        title: "Error creating user",
        text:
          error.response?.data?.message ||
          "An error occurred while creating the user",
        confirmButtonText: "OK",
      });
    }
  };

  const handleUpdateUser = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      showAlert({
        icon: "warning",
        title: "Please fill all required fields",
        text: "First Name, Last Name, and Email are required",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/api/admin/${selectedUser.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setOpenEditModal(false);
        fetchUsers();
        resetForm();
        showAlert({
          icon: "success",
          title: "User updated successfully!",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);

      showAlert({
        icon: "error",
        title: "Error updating user",
        text:
          error.response?.data?.message ||
          "An error occurred while updating the user",
        confirmButtonText: "OK",
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `${API_URL}/api/admin/${selectedUser.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setOpenDeleteModal(false);
        fetchUsers();
        showAlert({
          icon: "success",
          title: "User deleted successfully!",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showAlert({
        icon: "error",
        title: "Error deleting user",
        text:
          error.response?.data?.message ||
          "An error occurred while deleting the user",
        confirmButtonText: "OK",
      });
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `${API_URL}/api/admin/${userId}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        fetchUsers();
        showAlert({
          icon: "success",
          title: response.data.message,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      showAlert({
        icon: "error",
        title: "Error toggling user status",
        text: error.response?.data?.message || "An error occurred",
        confirmButtonText: "OK",
      });
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordData.newPassword || !resetPasswordData.confirmPassword) {
      showAlert({
        icon: "warning",
        title: "Please fill all fields",
        text: "Both password fields are required",
        confirmButtonText: "OK",
      });
      return;
    }

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      showAlert({
        icon: "warning",
        title: "Passwords do not match!",
        text: "Please make sure both passwords are identical",
        confirmButtonText: "OK",
      });
      return;
    }

    if (resetPasswordData.newPassword.length < 6) {
      showAlert({
        icon: "warning",
        title: "Password too short",
        text: "Password must be at least 6 characters long",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/api/admin/${selectedUser.id}/reset-password`,
        { newPassword: resetPasswordData.newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setOpenResetPasswordModal(false);
        setResetPasswordData({ newPassword: "", confirmPassword: "" });

        showAlert({
          icon: "success",
          title: "Password reset successfully!",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (error) {
      console.error("Error resetting password:", error);

      showAlert({
        icon: "error",
        title: "Error resetting password",
        text:
          error.response?.data?.message ||
          "An error occurred while resetting the password",
        confirmButtonText: "OK",
      });
    }
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || "",
      secondName: user.secondName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      role: user.role || "user",
      isVerified: user.isVerified || false,
    });
    setOpenEditModal(true);
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteModal(true);
  };

  const openViewDialog = async (user) => {
    setSelectedUser(user);
    setOpenViewModal(true);
  };

  const openResetPasswordDialog = (user) => {
    setSelectedUser(user);
    setOpenResetPasswordModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      secondName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "user",
      isVerified: false,
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Reset to page 1 when search query changes
    if (pagination.page !== 1) {
      setPagination({ ...pagination, page: 1 });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <Typography variant="h6" color="blue-gray">
          Loading users...
        </Typography>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .swal-high-z-index {
            z-index: 99999 !important;
          }
          .swal2-container {
            z-index: 99999 !important;
          }
        `}
      </style>
      <div className="mt-12 mb-8 flex flex-col gap-12">
        <Card className="shadow-xl">
          <CardHeader
            variant="gradient"
            color="blue"
            className="mb-8 p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UsersIcon className="w-6 h-6 text-white" />
                <Typography variant="h5" color="white" className="font-bold">
                  User Management
                </Typography>
              </div>
              <div className="flex items-center gap-3">
                <Chip
                  value={`${pagination.total} total users`}
                  variant="gradient"
                  color="white"
                  size="sm"
                  className="font-semibold"
                />
                <Button
                  size="sm"
                  className="flex items-center gap-2 shadow-lg"
                  onClick={() => {
                    resetForm();
                    setOpenCreateModal(true);
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  Add User
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardBody className="px-6 pt-0 pb-6">
            {/* Search and Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Input
                  label="Search users..."
                  icon={<Search className="h-5 w-5" />}
                  value={searchQuery}
                  onChange={handleSearch}
                  size="lg"
                />
              </div>
              <Select
                label="Filter by Role"
                value={roleFilter}
                onChange={(val) => {
                  setRoleFilter(val);
                  setPagination({ ...pagination, page: 1 });
                }}
                size="lg"
              >
                <Option value="">All Roles</Option>
                <Option value="user">User</Option>
                <Option value="admin">Admin</Option>
              </Select>
              <Select
                label="Filter by Status"
                value={verifiedFilter}
                onChange={(val) => {
                  setVerifiedFilter(val);
                  setPagination({ ...pagination, page: 1 });
                }}
                size="lg"
              >
                <Option value="">All Status</Option>
                <Option value="true">Verified</Option>
                <Option value="false">Not Verified</Option>
              </Select>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              {usersData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <UsersIcon className="w-16 h-16 text-blue-gray-300 mb-4" />
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    No users found
                  </Typography>
                  <Typography variant="small" color="gray">
                    {searchQuery || roleFilter || verifiedFilter
                      ? "Try adjusting your filters"
                      : "Start by creating your first user"}
                  </Typography>
                </div>
              ) : (
                <table className="w-full min-w-[640px] table-auto">
                  <thead>
                    <tr>
                      {[
                        { label: "ID", icon: null },
                        { label: "Full Name", icon: User },
                        { label: "Email", icon: Mail },
                        { label: "Phone", icon: Phone },
                        { label: "Role", icon: Shield },
                        { label: "Status", icon: CheckCircle },
                        { label: "Profiles", icon: UsersIcon },
                        { label: "Created At", icon: Calendar },
                        { label: "Actions", icon: null },
                      ].map((el) => (
                        <th
                          key={el.label}
                          className="border-b border-blue-gray-100 bg-blue-gray-50/50 py-4 px-5 text-left"
                        >
                          <div className="flex items-center gap-2">
                            {el.icon && (
                              <el.icon className="w-4 h-4 text-blue-gray-500" />
                            )}
                            <Typography
                              variant="small"
                              className="text-xs font-bold uppercase text-blue-gray-600"
                            >
                              {el.label}
                            </Typography>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {usersData.map((user, key) => {
                      const className = `py-4 px-5 ${
                        key === usersData.length - 1
                          ? ""
                          : "border-b border-blue-gray-50"
                      }`;

                      const fullName = [
                        user.firstName,
                        user.secondName,
                        user.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-blue-gray-50/50 transition-colors"
                        >
                          <td className={className}>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              #{user.id}
                            </Typography>
                          </td>

                          <td className={className}>
                            <div className="flex items-center gap-3">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-semibold"
                              >
                                {fullName}
                              </Typography>
                            </div>
                          </td>

                          <td className={className}>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-blue-gray-400" />
                              <Typography className="text-xs font-medium text-blue-gray-700">
                                {user.email}
                              </Typography>
                            </div>
                          </td>

                          <td className={className}>
                            <div className="flex items-center gap-2">
                              {user.phoneNumber ? (
                                <>
                                  <Phone className="w-4 h-4 text-blue-gray-400" />
                                  <Typography className="text-xs font-normal text-blue-gray-600">
                                    {user.phoneNumber}
                                  </Typography>
                                </>
                              ) : (
                                <Typography className="text-xs font-normal text-blue-gray-400">
                                  N/A
                                </Typography>
                              )}
                            </div>
                          </td>

                          <td className={className}>
                            <Chip
                              variant="gradient"
                              color={
                                user.role === "admin"
                                  ? "red"
                                  : user.role === "business"
                                  ? "blue"
                                  : "green"
                              }
                              value={user.role}
                              className="py-1 px-3 text-xs font-semibold capitalize"
                              icon={<Shield className="w-3 h-3" />}
                            />
                          </td>

                          <td className={className}>
                            <Chip
                              variant="ghost"
                              color={user.isVerified ? "green" : "red"}
                              size="sm"
                              value={
                                user.isVerified ? "Verified" : "Not Verified"
                              }
                              icon={
                                user.isVerified ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )
                              }
                            />
                          </td>

                          <td className={className}>
                            <Chip
                              variant="ghost"
                              size="sm"
                              value={`${user.profiles?.length || 0} profiles`}
                              className="w-fit"
                            />
                          </td>

                          <td className={className}>
                            <Chip
                              value={new Date(
                                user.createdAt
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                              variant="ghost"
                              size="sm"
                              className="w-fit"
                              icon={
                                <Calendar className="w-3 h-3 text-blue-gray-600" />
                              }
                            />
                          </td>

                          <td className={className}>
                            <div className="flex gap-2">
                              <Tooltip content="View Details">
                                <IconButton
                                  size="sm"
                                  variant="outlined"
                                  color="green"
                                  onClick={() => openViewDialog(user)}
                                  className="hover:shadow-md transition-shadow"
                                >
                                  <Eye className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip content="Edit User">
                                <IconButton
                                  size="sm"
                                  variant="outlined"
                                  color="blue"
                                  onClick={() => openEditDialog(user)}
                                  className="hover:shadow-md transition-shadow"
                                >
                                  <Pencil className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip content="Reset Password">
                                <IconButton
                                  size="sm"
                                  variant="outlined"
                                  color="orange"
                                  onClick={() => openResetPasswordDialog(user)}
                                  className="hover:shadow-md transition-shadow"
                                >
                                  <Lock className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip content="Toggle Status">
                                <IconButton
                                  size="sm"
                                  variant="outlined"
                                  color={user.isVerified ? "red" : "green"}
                                  onClick={() => handleToggleStatus(user.id)}
                                  className="hover:shadow-md transition-shadow"
                                >
                                  {user.isVerified ? (
                                    <XCircle className="h-4 w-4" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </IconButton>
                              </Tooltip>

                              <Tooltip content="Delete User">
                                <IconButton
                                  size="sm"
                                  variant="outlined"
                                  color="red"
                                  onClick={() => openDeleteDialog(user)}
                                  className="hover:shadow-md transition-shadow"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {usersData.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-blue-gray-100">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal"
                >
                  Showing{" "}
                  <strong>
                    {usersData.length > 0
                      ? (pagination.page - 1) * pagination.limit + 1
                      : 0}
                  </strong>{" "}
                  to{" "}
                  <strong>
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </strong>{" "}
                  of <strong>{pagination.total}</strong> users
                </Typography>
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page - 1,
                      })
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outlined"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page + 1,
                      })
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Create User Modal */}
        <Dialog
          open={openCreateModal}
          handler={setOpenCreateModal}
          size="md"
          className="shadow-2xl"
        >
          <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <Typography variant="h5" color="blue-gray">
              Create New User
            </Typography>
          </DialogHeader>
          <DialogBody divider className="h-[400px] overflow-y-scroll p-6">
            <div className="grid grid-cols-1 gap-5">
              <Input
                label="First Name *"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
                size="lg"
                icon={<User className="w-5 h-5" />}
              />
              <Input
                label="Second Name (Optional)"
                value={formData.secondName}
                onChange={(e) =>
                  setFormData({ ...formData, secondName: e.target.value })
                }
                size="lg"
                icon={<User className="w-5 h-5" />}
              />
              <Input
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
                size="lg"
                icon={<User className="w-5 h-5" />}
              />
              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                size="lg"
                icon={<Mail className="w-5 h-5" />}
              />
              <Input
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                size="lg"
                icon={<Phone className="w-5 h-5" />}
              />
              <Input
                label="Password *"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                size="lg"
                icon={<Lock className="w-5 h-5" />}
              />
              <Select
                label="Role"
                value={formData.role}
                onChange={(val) => setFormData({ ...formData, role: val })}
                size="lg"
              >
                <Option value="user">User</Option>
                <Option value="business">Business</Option>
                <Option value="admin">Admin</Option>
              </Select>
              <div className="flex items-center justify-between p-4 bg-blue-gray-50 rounded-lg">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold"
                >
                  Mark as Verified
                </Typography>
                <Switch
                  checked={formData.isVerified}
                  onChange={(e) =>
                    setFormData({ ...formData, isVerified: e.target.checked })
                  }
                  color="green"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="gap-3">
            <Button
              variant="text"
              color="red"
              onClick={() => {
                setOpenCreateModal(false);
                resetForm();
              }}
              className="mr-1"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              color="green"
              onClick={handleCreateUser}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Create User
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog
          open={openEditModal}
          handler={setOpenEditModal}
          size="md"
          className="shadow-2xl"
        >
          <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <Typography variant="h5" color="blue-gray">
              Edit User
            </Typography>
          </DialogHeader>
          <DialogBody divider className="h-[400px] overflow-y-scroll p-6">
            <div className="grid grid-cols-1 gap-5">
              <Input
                label="First Name *"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
                size="lg"
                icon={<User className="w-5 h-5" />}
              />
              <Input
                label="Second Name (Optional)"
                value={formData.secondName}
                onChange={(e) =>
                  setFormData({ ...formData, secondName: e.target.value })
                }
                size="lg"
                icon={<User className="w-5 h-5" />}
              />
              <Input
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
                size="lg"
                icon={<User className="w-5 h-5" />}
              />
              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                size="lg"
                icon={<Mail className="w-5 h-5" />}
              />
              <Input
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                size="lg"
                icon={<Phone className="w-5 h-5" />}
              />
              <Select
                label="Role"
                value={formData.role}
                onChange={(val) => setFormData({ ...formData, role: val })}
                size="lg"
              >
                <Option value="user">User</Option>
                <Option value="admin">Admin</Option>
              </Select>
              <div className="flex items-center justify-between p-4 bg-blue-gray-50 rounded-lg">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold"
                >
                  Mark as Verified
                </Typography>
                <Switch
                  checked={formData.isVerified}
                  onChange={(e) =>
                    setFormData({ ...formData, isVerified: e.target.checked })
                  }
                  color="green"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="gap-3">
            <Button
              variant="text"
              color="red"
              onClick={() => {
                setOpenEditModal(false);
                resetForm();
              }}
              className="mr-1"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              color="blue"
              onClick={handleUpdateUser}
              className="flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Update User
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={openDeleteModal}
          handler={setOpenDeleteModal}
          size="sm"
          className="shadow-2xl"
        >
          <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <Typography variant="h5" color="red">
              Confirm Delete
            </Typography>
          </DialogHeader>
          <DialogBody className="p-6">
            <Typography>
              Are you sure you want to delete user{" "}
              <strong className="text-blue-gray-900">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </strong>
              ? This action cannot be undone and will also delete all their
              profiles.
            </Typography>
          </DialogBody>
          <DialogFooter className="gap-3">
            <Button
              variant="text"
              color="blue-gray"
              onClick={() => setOpenDeleteModal(false)}
              className="mr-1"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              color="red"
              onClick={handleDeleteUser}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete User
            </Button>
          </DialogFooter>
        </Dialog>

        {/* View User Details Modal */}
        <Dialog
          open={openViewModal}
          handler={setOpenViewModal}
          size="md"
          className="shadow-2xl"
        >
          <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <Typography variant="h5" color="blue-gray">
              User Details
            </Typography>
          </DialogHeader>
          <DialogBody divider className="h-[500px] overflow-y-scroll p-6">
            {selectedUser && (
              <div className="space-y-4">
                {/* User Avatar and Name */}
                <div className="flex items-center gap-4 p-4 bg-blue-gray-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <Typography variant="h4" className="font-bold text-white">
                      {selectedUser.firstName.charAt(0).toUpperCase()}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="h6" color="blue-gray">
                      {selectedUser.firstName} {selectedUser.secondName}{" "}
                      {selectedUser.lastName}
                    </Typography>
                    <Chip
                      variant="ghost"
                      color={selectedUser.isVerified ? "green" : "red"}
                      size="sm"
                      value={
                        selectedUser.isVerified ? "Verified" : "Not Verified"
                      }
                      className="w-fit mt-1"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 p-4 border border-blue-gray-100 rounded-lg">
                  <Typography
                    variant="small"
                    className="font-bold uppercase text-blue-gray-600 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Contact Information
                  </Typography>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold"
                      >
                        Email
                      </Typography>
                      <Typography
                        variant="small"
                        className="text-blue-gray-700"
                      >
                        {selectedUser.email}
                      </Typography>
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold"
                      >
                        Phone Number
                      </Typography>
                      <Typography
                        variant="small"
                        className="text-blue-gray-700"
                      >
                        {selectedUser.phoneNumber || "N/A"}
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-3 p-4 border border-blue-gray-100 rounded-lg">
                  <Typography
                    variant="small"
                    className="font-bold uppercase text-blue-gray-600 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Account Information
                  </Typography>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold"
                      >
                        Role
                      </Typography>
                      <Chip
                        variant="gradient"
                        color={
                          selectedUser.role === "admin"
                            ? "red"
                            : selectedUser.role === "business"
                            ? "blue"
                            : "green"
                        }
                        value={selectedUser.role}
                        className="py-1 px-3 text-xs font-medium capitalize w-fit mt-1"
                      />
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold"
                      >
                        Total Profiles
                      </Typography>
                      <Typography
                        variant="small"
                        className="text-blue-gray-700"
                      >
                        {selectedUser.profiles?.length || 0}
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="space-y-3 p-4 border border-blue-gray-100 rounded-lg">
                  <Typography
                    variant="small"
                    className="font-bold uppercase text-blue-gray-600 flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Timestamps
                  </Typography>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold"
                      >
                        Created At
                      </Typography>
                      <Typography
                        variant="small"
                        className="text-blue-gray-700"
                      >
                        {new Date(selectedUser.createdAt).toLocaleString()}
                      </Typography>
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold"
                      >
                        Updated At
                      </Typography>
                      <Typography
                        variant="small"
                        className="text-blue-gray-700"
                      >
                        {new Date(selectedUser.updatedAt).toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* User Profiles */}
                {selectedUser.profiles && selectedUser.profiles.length > 0 && (
                  <div className="space-y-3 p-4 border border-blue-gray-100 rounded-lg">
                    <Typography
                      variant="small"
                      className="font-bold uppercase text-blue-gray-600 flex items-center gap-2 mb-3"
                    >
                      <UsersIcon className="w-4 h-4" />
                      Profiles ({selectedUser.profiles.length})
                    </Typography>
                    <div className="space-y-2">
                      {selectedUser.profiles.map((profile) => (
                        <div
                          key={profile.id}
                          className="p-3 bg-blue-gray-50 rounded-lg hover:bg-blue-gray-100 transition-colors"
                        >
                          <Typography
                            variant="small"
                            className="font-semibold text-blue-gray-800"
                          >
                            {profile.name}
                          </Typography>
                          <Chip
                            variant="ghost"
                            size="sm"
                            value={profile.profileType}
                            className="capitalize w-fit mt-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogBody>
          <DialogFooter className="gap-3">
            <Button
              variant="text"
              color="blue-gray"
              onClick={() => setOpenViewModal(false)}
            >
              Close
            </Button>
            <Button
              variant="gradient"
              color="blue"
              onClick={() => {
                setOpenViewModal(false);
                openEditDialog(selectedUser);
              }}
              className="flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit User
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Reset Password Modal */}
        <Dialog
          open={openResetPasswordModal}
          handler={setOpenResetPasswordModal}
          size="sm"
          className="shadow-2xl"
        >
          <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <Typography variant="h5" color="blue-gray">
                Reset User Password
              </Typography>
              <Typography variant="small" color="gray" className="font-normal">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </Typography>
            </div>
          </DialogHeader>
          <DialogBody divider className="p-6">
            <div className="space-y-5">
              <Input
                label="New Password *"
                type="password"
                value={resetPasswordData.newPassword}
                onChange={(e) =>
                  setResetPasswordData({
                    ...resetPasswordData,
                    newPassword: e.target.value,
                  })
                }
                required
                size="lg"
                icon={<Lock className="w-5 h-5" />}
              />
              <Input
                label="Confirm Password *"
                type="password"
                value={resetPasswordData.confirmPassword}
                onChange={(e) =>
                  setResetPasswordData({
                    ...resetPasswordData,
                    confirmPassword: e.target.value,
                  })
                }
                required
                size="lg"
                icon={<Lock className="w-5 h-5" />}
              />
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <Typography
                  variant="small"
                  color="orange"
                  className="font-medium"
                >
                  Password must be at least 6 characters long
                </Typography>
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="gap-3">
            <Button
              variant="text"
              color="red"
              onClick={() => {
                setOpenResetPasswordModal(false);
                setResetPasswordData({ newPassword: "", confirmPassword: "" });
              }}
              className="mr-1"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              color="orange"
              onClick={handleResetPassword}
              className="flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Reset Password
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </>
  );
}

export default Users;
