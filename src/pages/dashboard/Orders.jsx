import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Select,
  Option,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
  Tooltip,
  Alert,
} from "@material-tailwind/react";
import {
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Settings,
  Calendar,
  ShoppingCart,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Palette,
  FileText,
  TrendingUp,
  RefreshCw,
  Filter,
  AlertCircle,
  ChevronDown,
  ExternalLink,
  Copy,
  Link as LinkIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import UniversalCardPreview from "../../components/shared/UniversalCardPreview";

// Centralized API configuration
const API_URL = import.meta.env.VITE_API_URL;

// Utility function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication token not found");
  }
  return token;
};

// Card Design Preview Component
function CardDesignPreview({ order }) {
  const profileData = {
    name:
      order.profile?.name ||
      `${order.customerFirstName} ${order.customerLastName}`,
    title:
      order.profile?.title ||
      (order.cardType === "personal" ? "Personal Card" : "Business Card"),
    bio: order.profile?.bio || "Smart NFC Digital Identity Card",
    profileType: order.cardType,
    avatarUrl: order.profile?.avatarUrl || null,
    color: order.cardColor,
    template: order.cardTemplate,
    designMode: order.cardDesignMode,
    aiBackground: order.cardAiBackground,
    customDesignUrl: order.customDesignUrl,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        <Chip
          variant="gradient"
          size="sm"
          color="blue"
          value={
            order.customDesignUrl
              ? "📸 Custom Upload"
              : order.cardDesignMode === "ai"
              ? "🎨 AI Generated"
              : order.cardDesignMode === "template"
              ? "📋 Template"
              : "🎨 Manual Color"
          }
        />
      </div>

      <UniversalCardPreview
        profile={profileData}
        selectedTemplate={order.cardTemplate}
        showViewCount={false}
        showLoading={true}
      />

      <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Design Mode:</span>
          <span className="font-medium capitalize">
            {order.customDesignUrl
              ? "Custom"
              : order.cardDesignMode || "Manual"}
          </span>
        </div>

        {order.cardDesignMode === "template" && order.cardTemplate && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Template:</span>
            <span className="font-medium">{order.cardTemplate}</span>
          </div>
        )}

        {order.cardDesignMode === "manual" && order.cardColor && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Color:</span>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded border"
                style={{ backgroundColor: order.cardColor }}
              />
              <span className="font-mono">{order.cardColor}</span>
            </div>
          </div>
        )}

        {order.cardDesignMode === "ai" && (
          <p className="text-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> AI Generated
          </p>
        )}

        {order.customDesignUrl && (
          <p className="text-purple-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Custom Upload
          </p>
        )}
      </div>
    </div>
  );
}

// Order Card Component for Mobile View
const OrderCard = ({
  order,
  statusColors,
  statusIcons,
  onView,
  onStatusUpdate,
}) => {
  const StatusIcon = statusIcons[order.orderStatus];

  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow">
      <CardBody className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
              <Typography variant="h6" className="font-bold text-white">
                {order.customerFirstName?.charAt(0).toUpperCase()}
              </Typography>
            </div>
            <div className="flex-1 min-w-0">
              <Typography
                variant="small"
                className="font-bold text-blue-gray-800 truncate"
              >
                {order.customerFirstName} {order.customerLastName}
              </Typography>
              <Typography
                variant="small"
                color="gray"
                className="font-mono text-xs truncate"
              >
                {order.orderNumber}
              </Typography>
            </div>
          </div>
          <Chip
            variant="gradient"
            value={order.orderStatus}
            size="sm"
            color={statusColors[order.orderStatus]}
            icon={<StatusIcon className="w-3 h-3" />}
            className="capitalize flex-shrink-0"
          />
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-gray-400 flex-shrink-0" />
            <Typography variant="small" className="text-blue-gray-700 truncate">
              {order.customerEmail}
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-gray-400 flex-shrink-0" />
            <Typography variant="small" className="text-blue-gray-700">
              {order.customerPhone}
            </Typography>
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Chip
            variant="gradient"
            value={order.cardType}
            size="sm"
            color={order.cardType === "personal" ? "blue" : "purple"}
            className="capitalize"
          />
          <Chip
            value={new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            variant="ghost"
            size="sm"
            icon={<Calendar className="w-3 h-3" />}
          />
          <Chip
            value={`${order.totalAmount} JOD`}
            variant="ghost"
            size="sm"
            color="green"
            icon={<CreditCard className="w-3 h-3" />}
            className="font-bold"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            size="sm"
            variant="outlined"
            color="green"
            onClick={() => onView(order)}
            className="flex items-center justify-center gap-2 flex-1"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
          <div className="flex-1">
            <Select
              size="md"
              value={order.orderStatus}
              onChange={(val) => onStatusUpdate(order.id, val)}
              label="Update Status"
              className="w-full"
            >
              <Option value="pending">Pending</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="processing">Processing</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// Main Orders Component
export function Orders() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const statusColors = {
    pending: "amber",
    confirmed: "blue",
    processing: "purple",
    shipped: "indigo",
    delivered: "green",
    cancelled: "red",
  };

  const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    processing: Settings,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
  };

  useEffect(() => {
    fetchOrders();
    fetchStatistics();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      const url = filterStatus
        ? `${API_URL}/api/orders/admin/all?status=${filterStatus}`
        : `${API_URL}/api/orders/admin/all`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders || []);
      } else {
        throw new Error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.message || "Failed to load orders. Please try again.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/orders/admin/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    // Confirmation dialog
    const result = await Swal.fire({
      title: "Update Order Status?",
      text: `Change status to: ${newStatus}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setStatusUpdateLoading(true);
      const token = getAuthToken();

      const response = await fetch(
        `${API_URL}/api/orders/admin/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchOrders();
        await fetchStatistics();

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Order status updated successfully",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      } else {
        throw new Error(data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update order status",
        confirmButtonText: "OK",
      });
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleRetry = () => {
    setError(null);
    fetchOrders();
    fetchStatistics();
  };

  // Memoized statistics calculations
  const totalOrders = useMemo(() => {
    if (!stats?.ordersByStatus) return 0;
    return stats.ordersByStatus.reduce((sum, s) => sum + parseInt(s.count), 0);
  }, [stats]);

  const pendingOrders = useMemo(() => {
    if (!stats?.ordersByStatus) return 0;
    return (
      stats.ordersByStatus.find((s) => s.orderStatus === "pending")?.count || 0
    );
  }, [stats]);

  const deliveredOrders = useMemo(() => {
    if (!stats?.ordersByStatus) return 0;
    return (
      stats.ordersByStatus.find((s) => s.orderStatus === "delivered")?.count ||
      0
    );
  }, [stats]);

  // Loading state
  if (loading && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <Typography variant="h6" color="blue-gray">
          Loading orders...
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-12 mb-8 px-2 sm:px-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <Typography
                variant="h3"
                color="blue-gray"
                className="font-bold text-xl sm:text-3xl"
              >
                Orders Management
              </Typography>
              <Typography
                color="gray"
                className="font-normal text-sm sm:text-base"
              >
                Manage and track all customer orders
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert
          color="red"
          icon={<AlertCircle className="h-6 w-6" />}
          className="mb-6"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Typography variant="h6" color="white" className="mb-1">
                Error Loading Orders
              </Typography>
              <Typography color="white" className="font-normal text-sm">
                {error}
              </Typography>
            </div>
            <Button
              size="sm"
              color="white"
              variant="text"
              onClick={handleRetry}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardBody className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-600 text-xs sm:text-sm"
                  >
                    Total Orders
                  </Typography>
                  <Typography
                    variant="h4"
                    color="blue-gray"
                    className="font-bold text-2xl sm:text-3xl"
                  >
                    {totalOrders}
                  </Typography>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardBody className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-600 text-xs sm:text-sm"
                  >
                    Pending
                  </Typography>
                  <Typography
                    variant="h4"
                    color="blue-gray"
                    className="font-bold text-2xl sm:text-3xl"
                  >
                    {pendingOrders}
                  </Typography>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardBody className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-600 text-xs sm:text-sm"
                  >
                    Delivered
                  </Typography>
                  <Typography
                    variant="h4"
                    color="blue-gray"
                    className="font-bold text-2xl sm:text-3xl"
                  >
                    {deliveredOrders}
                  </Typography>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardBody className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-600 text-xs sm:text-sm"
                  >
                    This Month
                  </Typography>
                  <Typography
                    variant="h4"
                    color="blue-gray"
                    className="font-bold text-2xl sm:text-3xl"
                  >
                    {stats.ordersThisMonth || 0}
                  </Typography>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="shadow-lg mb-6 sm:mb-8">
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-gray-600" />
              <Typography
                variant="h6"
                color="blue-gray"
                className="font-bold text-base sm:text-lg"
              >
                Filter by Status
              </Typography>
            </div>
            <Button
              variant="text"
              size="sm"
              className="lg:hidden flex items-center gap-1"
              onClick={() => setShowFilters(!showFilters)}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>

          <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setFilterStatus("")}
                variant={filterStatus === "" ? "gradient" : "outlined"}
                size="sm"
                color="blue"
                className="flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">All Orders</span>
                <span className="sm:hidden">All</span>
              </Button>
              {Object.keys(statusColors).map((status) => {
                const Icon = statusIcons[status];
                return (
                  <Button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    variant={filterStatus === status ? "gradient" : "outlined"}
                    size="sm"
                    color={statusColors[status]}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="capitalize">{status}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Orders Content */}
      <Card className="shadow-xl">
        <CardHeader
          variant="gradient"
          color="blue"
          className="mb-6 sm:mb-8 p-4 sm:p-6 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <Typography
                variant="h5"
                color="white"
                className="font-bold text-lg sm:text-xl"
              >
                Orders List
              </Typography>
            </div>
            <Chip
              value={`${orders.length} orders`}
              variant="gradient"
              color="blue-gray"
              size="sm"
              className="font-semibold"
            />
          </div>
        </CardHeader>

        <CardBody className="px-2 sm:px-6 pt-0 pb-2">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="w-16 h-16 text-blue-gray-300 mb-4" />
              <Typography variant="h6" color="blue-gray" className="mb-2">
                No orders found
              </Typography>
              <Typography
                variant="small"
                color="gray"
                className="text-center px-4"
              >
                {filterStatus
                  ? `No ${filterStatus} orders at the moment`
                  : "No orders have been placed yet"}
              </Typography>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    statusColors={statusColors}
                    statusIcons={statusIcons}
                    onView={viewOrderDetails}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[640px] table-auto">
                  <thead>
                    <tr>
                      {[
                        { label: "Order #", icon: FileText },
                        { label: "Customer", icon: User },
                        { label: "Card Type", icon: CreditCard },
                        { label: "Status", icon: TrendingUp },
                        { label: "Date", icon: Calendar },
                        { label: "Amount", icon: CreditCard },
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
                    {orders.map((order, key) => {
                      const className = `py-4 px-5 ${
                        key === orders.length - 1
                          ? ""
                          : "border-b border-blue-gray-50"
                      }`;
                      const StatusIcon = statusIcons[order.orderStatus];

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-blue-gray-50/50 transition-colors"
                        >
                          <td className={className}>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-gray-400" />
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-bold font-mono"
                              >
                                {order.orderNumber}
                              </Typography>
                            </div>
                          </td>
                          <td className={className}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                <Typography
                                  variant="small"
                                  className="font-bold text-white"
                                >
                                  {order.customerFirstName
                                    ?.charAt(0)
                                    .toUpperCase()}
                                </Typography>
                              </div>
                              <div>
                                <Typography
                                  variant="small"
                                  className="font-semibold text-blue-gray-800"
                                >
                                  {order.customerFirstName}{" "}
                                  {order.customerLastName}
                                </Typography>
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-blue-gray-400" />
                                  <Typography
                                    variant="small"
                                    className="font-normal text-blue-gray-500 text-xs"
                                  >
                                    {order.customerEmail}
                                  </Typography>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={className}>
                            <Chip
                              variant="gradient"
                              value={order.cardType}
                              size="sm"
                              color={
                                order.cardType === "personal"
                                  ? "blue"
                                  : "purple"
                              }
                              className="capitalize"
                            />
                          </td>
                          <td className={className}>
                            <Chip
                              variant="gradient"
                              value={order.orderStatus}
                              size="sm"
                              color={statusColors[order.orderStatus]}
                              icon={<StatusIcon className="w-3 h-3" />}
                              className="capitalize"
                            />
                          </td>
                          <td className={className}>
                            <Chip
                              value={new Date(
                                order.createdAt
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
                            <Typography
                              variant="small"
                              className="font-bold text-blue-gray-800"
                            >
                              {order.totalAmount} JOD
                            </Typography>
                          </td>
                          <td className={className}>
                            <div className="flex gap-2 items-center">
                              <Tooltip content="View Order Details">
                                <IconButton
                                  size="md"
                                  variant="outlined"
                                  color="green"
                                  onClick={() => viewOrderDetails(order)}
                                  className="hover:shadow-md transition-shadow"
                                >
                                  <Eye className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>
                              <Select
                                size="md"
                                value={order.orderStatus}
                                onChange={(val) =>
                                  handleStatusUpdate(order.id, val)
                                }
                                label="Update Status"
                                className="min-w-[140px]"
                                disabled={statusUpdateLoading}
                              >
                                <Option value="pending">Pending</Option>
                                <Option value="confirmed">Confirmed</Option>
                                <Option value="processing">Processing</Option>
                                <Option value="shipped">Shipped</Option>
                                <Option value="delivered">Delivered</Option>
                                <Option value="cancelled">Cancelled</Option>
                              </Select>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog
          open={showOrderModal}
          handler={() => setShowOrderModal(false)}
          size="lg"
          className="shadow-2xl max-h-[95vh] overflow-hidden"
        >
          <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100 p-4 sm:p-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <Typography
                variant="h5"
                color="blue-gray"
                className="text-lg sm:text-xl"
              >
                Order Details
              </Typography>
              <Typography
                variant="small"
                color="gray"
                className="font-mono font-normal truncate"
              >
                {selectedOrder.orderNumber}
              </Typography>
            </div>
          </DialogHeader>

          <DialogBody
            divider
            className="max-h-[60vh] overflow-y-auto p-4 sm:p-6"
          >
            <div className="space-y-4 sm:space-y-6">
              {/* Order Status Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                      {React.createElement(
                        statusIcons[selectedOrder.orderStatus],
                        {
                          className: "w-6 h-6 text-blue-600",
                        }
                      )}
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        Current Status
                      </Typography>
                      <Chip
                        variant="gradient"
                        value={selectedOrder.orderStatus}
                        size="sm"
                        color={statusColors[selectedOrder.orderStatus]}
                        className="capitalize mt-1"
                      />
                    </div>
                  </div>
                  <Typography variant="h6" color="blue" className="font-bold">
                    {selectedOrder.totalAmount} JOD
                  </Typography>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-4 border border-blue-gray-100 rounded-lg">
                <Typography
                  variant="small"
                  className="font-bold uppercase text-blue-gray-600 flex items-center gap-2 mb-4"
                >
                  <User className="w-4 h-4" />
                  Customer Information
                </Typography>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                      <Typography
                        variant="small"
                        className="font-bold text-white"
                      >
                        {selectedOrder.customerFirstName
                          ?.charAt(0)
                          .toUpperCase()}
                      </Typography>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        Name
                      </Typography>
                      <Typography
                        variant="small"
                        color="gray"
                        className="break-words"
                      >
                        {selectedOrder.customerFirstName}{" "}
                        {selectedOrder.customerLastName}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-blue-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        Email
                      </Typography>
                      <Typography
                        variant="small"
                        color="gray"
                        className="break-words"
                      >
                        {selectedOrder.customerEmail}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-blue-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        Phone
                      </Typography>
                      <Typography variant="small" color="gray">
                        {selectedOrder.customerPhone}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        Order Date
                      </Typography>
                      <Typography variant="small" color="gray">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
              {/* Profile URL Section */}
              {selectedOrder.profileUrl && (
                <div className="p-4 border-2 border-blue-500 bg-blue-50 rounded-lg">
                  <Typography
                    variant="small"
                    className="font-bold uppercase text-blue-800 flex items-center gap-2 mb-3"
                  >
                    <LinkIcon className="w-4 h-4" />
                    NFC Card Profile URL
                  </Typography>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold mb-2"
                        >
                          Public Profile Link:
                        </Typography>
                        <a
                          href={selectedOrder.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 font-mono break-all underline flex items-center gap-2"
                        >
                          {selectedOrder.profileUrl}
                          <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        </a>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedOrder.profileUrl
                          );
                          Swal.fire({
                            icon: "success",
                            title: "Copied!",
                            text: "Profile URL copied to clipboard",
                            timer: 2000,
                            showConfirmButton: false,
                            toast: true,
                            position: "top-end",
                          });
                        }}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Copy className="w-5 h-5 text-blue-600" />
                      </button>
                    </div>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Typography
                        variant="small"
                        className="text-yellow-800 text-xs"
                      >
                        ⚠️ <strong>Important:</strong> This URL must be
                        programmed into the NFC card
                      </Typography>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Info */}
              <div className="p-4 border border-blue-gray-100 rounded-lg">
                <Typography
                  variant="small"
                  className="font-bold uppercase text-blue-gray-600 flex items-center gap-2 mb-4"
                >
                  <MapPin className="w-4 h-4" />
                  Shipping Address
                </Typography>
                <Card className="bg-blue-gray-50">
                  <CardBody className="p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Typography
                          variant="small"
                          className="font-medium text-blue-gray-800 break-words"
                        >
                          {selectedOrder.shippingAddress}
                        </Typography>
                        <Typography variant="small" color="gray">
                          {selectedOrder.shippingCity},{" "}
                          {selectedOrder.shippingCountry}
                        </Typography>
                        {selectedOrder.shippingNotes && (
                          <div className="mt-3 p-3 bg-white rounded border border-blue-gray-200">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-semibold mb-1"
                            >
                              Delivery Notes:
                            </Typography>
                            <Typography
                              variant="small"
                              color="gray"
                              className="italic break-words"
                            >
                              {selectedOrder.shippingNotes}
                            </Typography>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Card Design */}
              <div className="p-4 border border-blue-gray-100 rounded-lg">
                <Typography
                  variant="small"
                  className="font-bold uppercase text-blue-gray-600 flex items-center gap-2 mb-4"
                >
                  <CreditCard className="w-4 h-4" />
                  Card Design
                </Typography>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start gap-2">
                    <CreditCard className="w-4 h-4 text-blue-gray-400 mt-1" />
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        Type
                      </Typography>
                      <Chip
                        variant="gradient"
                        value={selectedOrder.cardType}
                        size="sm"
                        color={
                          selectedOrder.cardType === "personal"
                            ? "blue"
                            : "purple"
                        }
                        className="capitalize w-fit mt-1"
                      />
                    </div>
                  </div>

                  {selectedOrder.cardDesignMode !== "ai" &&
                    !selectedOrder.customDesignUrl &&
                    selectedOrder.cardTemplate && (
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-blue-gray-400 mt-1" />
                        <div>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-semibold"
                          >
                            Template
                          </Typography>
                          <Typography variant="small" color="gray">
                            {selectedOrder.cardTemplate}
                          </Typography>
                        </div>
                      </div>
                    )}

                  <div className="flex items-start gap-2">
                    <Palette className="w-4 h-4 text-blue-gray-400 mt-1" />
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        Design Mode
                      </Typography>
                      <Chip
                        variant="ghost"
                        value={
                          selectedOrder.customDesignUrl
                            ? "Custom Upload"
                            : selectedOrder.cardDesignMode === "ai"
                            ? "AI Generated"
                            : selectedOrder.cardDesignMode === "template"
                            ? "Template"
                            : "Manual"
                        }
                        size="sm"
                        className="w-fit mt-1"
                      />
                    </div>
                  </div>

                  {selectedOrder.cardDesignMode === "manual" &&
                    selectedOrder.cardColor && (
                      <div className="flex items-start gap-2">
                        <Palette className="w-4 h-4 text-blue-gray-400 mt-1" />
                        <div>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-semibold"
                          >
                            Color
                          </Typography>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="w-8 h-8 rounded-lg border-2 border-gray-300 shadow-sm"
                              style={{
                                backgroundColor: selectedOrder.cardColor,
                              }}
                            />
                            <Typography
                              variant="small"
                              className="font-mono text-blue-gray-700"
                            >
                              {selectedOrder.cardColor}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                {/* Card Preview */}
                <div className="flex justify-center mt-4">
                  <CardDesignPreview order={selectedOrder} />
                </div>
              </div>

              {/* Payment & Amount */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <Typography
                  variant="small"
                  className="font-bold uppercase text-green-800 flex items-center gap-2 mb-4"
                >
                  <CreditCard className="w-4 h-4" />
                  Payment Information
                </Typography>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        Payment Method
                      </Typography>
                      <Typography
                        variant="small"
                        className="text-green-700 font-medium"
                      >
                        Cash on Delivery
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        Total Amount
                      </Typography>
                      <Typography
                        variant="h6"
                        color="green"
                        className="font-bold"
                      >
                        {selectedOrder.totalAmount} JOD
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="gap-2 sm:gap-3 p-4 sm:p-6">
            <Button
              variant="text"
              color="blue-gray"
              onClick={() => setShowOrderModal(false)}
              className="flex-1 sm:flex-initial"
            >
              Close
            </Button>
            <Button
              variant="gradient"
              color="blue"
              className="flex items-center gap-2 flex-1 sm:flex-initial"
              onClick={() => window.print()}
            >
              <FileText className="w-4 h-4" />
              Print Order
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}

export default Orders;
