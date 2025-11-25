import React, { useEffect, useState } from "react";
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
} from "@material-tailwind/react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

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

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, searchQuery, roleFilter, verifiedFilter]);

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
          search: searchQuery || undefined,
          role: roleFilter || undefined,
          verified: verifiedFilter === "" ? undefined : verifiedFilter,
        },
      });

      console.log("📥 API Response:", response.data);

      // Check if response has the wrapped format
      if (response.data.success && response.data.data) {
        setUsersData(response.data.data);
        setPagination(response.data.pagination);
      } else if (Array.isArray(response.data)) {
        // Fallback for plain array response
        setUsersData(response.data);
      }
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      setUsersData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
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
        Swal.fire({
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

      Swal.fire({
        icon: "error",
        title: error.response?.data?.message || "Error creating user",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    }
  };

  const handleUpdateUser = async () => {
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
        Swal.fire({
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

      Swal.fire({
        icon: "error",
        title: error.response?.data?.message || "Error updating user",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
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
        Swal.fire({
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
      Swal.fire({
        icon: "error",
        title: error.response?.data?.message || "Error deleting user",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
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
        Swal.fire({
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
      Swal.fire({
        icon: "error",
        title: error.response?.data?.message || "Error toggling user status",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    }
  };

  const handleResetPassword = async () => {
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Passwords do not match!",
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
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

        Swal.fire({
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

      Swal.fire({
        icon: "error",
        title: error.response?.data?.message || "Error resetting password",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
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
    setPagination({ ...pagination, page: 1 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <Typography variant="h6" color="white">
              User Management
            </Typography>
            <Button
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setOpenCreateModal(true)}
            >
              <UserPlusIcon className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>

        <CardBody className="px-6 pt-0 pb-6">
          {/* Search and Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Input
                label="Search users..."
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Select
              label="Filter by Role"
              value={roleFilter}
              onChange={(val) => {
                setRoleFilter(val);
                setPagination({ ...pagination, page: 1 });
              }}
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
            >
              <Option value="">All Status</Option>
              <Option value="true">Verified</Option>
              <Option value="false">Not Verified</Option>
            </Select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-scroll">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {[
                    "ID",
                    "Full Name",
                    "Email",
                    "Phone",
                    "Role",
                    "Status",
                    "Profiles",
                    "Created At",
                    "Actions",
                  ].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {usersData.map((user, key) => {
                  const className = `py-3 px-5 ${
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
                    <tr key={user.id}>
                      <td className={className}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {user.id}
                        </Typography>
                      </td>

                      <td className={className}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {fullName}
                        </Typography>
                      </td>

                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {user.email}
                        </Typography>
                      </td>

                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {user.phoneNumber || "N/A"}
                        </Typography>
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
                          className="py-0.5 px-2 text-[11px] font-medium capitalize"
                        />
                      </td>

                      <td className={className}>
                        <Chip
                          variant="ghost"
                          color={user.isVerified ? "green" : "red"}
                          size="sm"
                          value={user.isVerified ? "Verified" : "Not Verified"}
                          icon={
                            user.isVerified ? (
                              <CheckCircleIcon className="h-4 w-4" />
                            ) : (
                              <XCircleIcon className="h-4 w-4" />
                            )
                          }
                        />
                      </td>

                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {user.profiles?.length || 0}
                        </Typography>
                      </td>

                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </td>

                      <td className={className}>
                        <div className="flex gap-2">
                          <Tooltip content="View Details">
                            <IconButton
                              variant="text"
                              color="blue"
                              onClick={() => openViewDialog(user)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip content="Edit User">
                            <IconButton
                              variant="text"
                              color="blue-gray"
                              onClick={() => openEditDialog(user)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip content="Reset Password">
                            <IconButton
                              variant="text"
                              color="orange"
                              onClick={() => openResetPasswordDialog(user)}
                            >
                              <LockClosedIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip content="Toggle Status">
                            <IconButton
                              variant="text"
                              color={user.isVerified ? "red" : "green"}
                              onClick={() => handleToggleStatus(user.id)}
                            >
                              {user.isVerified ? (
                                <XCircleIcon className="h-4 w-4" />
                              ) : (
                                <CheckCircleIcon className="h-4 w-4" />
                              )}
                            </IconButton>
                          </Tooltip>

                          <Tooltip content="Delete User">
                            <IconButton
                              variant="text"
                              color="red"
                              onClick={() => openDeleteDialog(user)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal"
            >
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} users
            </Typography>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Create User Modal */}
      <Dialog open={openCreateModal} handler={setOpenCreateModal} size="md">
        <DialogHeader>Create New User</DialogHeader>
        <DialogBody divider className="h-[400px] overflow-y-scroll">
          {selectedUser ? (
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <Input
                label="Second Name (Optional)"
                value={formData.secondName}
                onChange={(e) =>
                  setFormData({ ...formData, secondName: e.target.value })
                }
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <Input
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <Select
                label="Role"
                value={formData.role}
                onChange={(val) => setFormData({ ...formData, role: val })}
              >
                <Option value="user">User</Option>
                <Option value="business">Business</Option>
                <Option value="admin">Admin</Option>
              </Select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(e) =>
                    setFormData({ ...formData, isVerified: e.target.checked })
                  }
                />
                <Typography variant="small">Mark as Verified</Typography>
              </div>
            </div>
          ) : (
            <p>No user selected</p>
          )}
        </DialogBody>
        <DialogFooter>
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
          <Button variant="gradient" color="green" onClick={handleCreateUser}>
            Create User
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={openEditModal} handler={setOpenEditModal} size="md">
        <DialogHeader>Edit User</DialogHeader>
        <DialogBody divider className="h-[400px] overflow-y-scroll">
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
            <Input
              label="Second Name (Optional)"
              value={formData.secondName}
              onChange={(e) =>
                setFormData({ ...formData, secondName: e.target.value })
              }
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <Input
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
            />
            <Select
              label="Role"
              value={formData.role}
              onChange={(val) => setFormData({ ...formData, role: val })}
            >
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) =>
                  setFormData({ ...formData, isVerified: e.target.checked })
                }
              />
              <Typography variant="small">Mark as Verified</Typography>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
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
          <Button variant="gradient" color="blue" onClick={handleUpdateUser}>
            Update User
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} handler={setOpenDeleteModal} size="sm">
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody>
          Are you sure you want to delete user{" "}
          <strong>
            {selectedUser?.firstName} {selectedUser?.lastName}
          </strong>
          ? This action cannot be undone and will also delete all their
          profiles.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setOpenDeleteModal(false)}
            className="mr-1"
          >
            Cancel
          </Button>
          <Button variant="gradient" color="red" onClick={handleDeleteUser}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      {/* View User Details Modal */}
      <Dialog open={openViewModal} handler={setOpenViewModal} size="md">
        <DialogHeader>User Details</DialogHeader>
        <DialogBody divider className="h-[400px] overflow-y-scroll">
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-bold"
                >
                  Full Name
                </Typography>
                <Typography variant="small">
                  {selectedUser.firstName} {selectedUser.secondName}{" "}
                  {selectedUser.lastName}
                </Typography>
              </div>
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-bold"
                >
                  Email
                </Typography>
                <Typography variant="small">{selectedUser.email}</Typography>
              </div>
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-bold"
                >
                  Phone Number
                </Typography>
                <Typography variant="small">
                  {selectedUser.phoneNumber || "N/A"}
                </Typography>
              </div>
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-bold"
                >
                  Role
                </Typography>
                <Typography variant="small" className="capitalize">
                  {selectedUser.role}
                </Typography>
              </div>
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-bold"
                >
                  Status
                </Typography>
                <Chip
                  variant="ghost"
                  color={selectedUser.isVerified ? "green" : "red"}
                  size="sm"
                  value={selectedUser.isVerified ? "Verified" : "Not Verified"}
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
                <Typography variant="small">
                  {selectedUser.profiles?.length || 0}
                </Typography>
              </div>
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-bold"
                >
                  Created At
                </Typography>
                <Typography variant="small">
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
                <Typography variant="small">
                  {new Date(selectedUser.updatedAt).toLocaleString()}
                </Typography>
              </div>

              {/* User Profiles */}
              {selectedUser.profiles && selectedUser.profiles.length > 0 && (
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-bold mb-2"
                  >
                    Profiles
                  </Typography>
                  <div className="space-y-2">
                    {selectedUser.profiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="p-3 border border-blue-gray-100 rounded-lg"
                      >
                        <Typography variant="small" className="font-semibold">
                          {profile.name}
                        </Typography>
                        <Typography
                          variant="small"
                          className="text-blue-gray-500 capitalize"
                        >
                          {profile.profileType}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="gradient"
            color="blue-gray"
            onClick={() => setOpenViewModal(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog
        open={openResetPasswordModal}
        handler={setOpenResetPasswordModal}
        size="sm"
      >
        <DialogHeader>Reset User Password</DialogHeader>
        <DialogBody divider>
          <div className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={resetPasswordData.newPassword}
              onChange={(e) =>
                setResetPasswordData({
                  ...resetPasswordData,
                  newPassword: e.target.value,
                })
              }
            />
            <Input
              label="Confirm Password"
              type="password"
              value={resetPasswordData.confirmPassword}
              onChange={(e) =>
                setResetPasswordData({
                  ...resetPasswordData,
                  confirmPassword: e.target.value,
                })
              }
            />
          </div>
        </DialogBody>
        <DialogFooter>
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
          >
            Reset Password
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Users;
