import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import Swal from "sweetalert2";

export function Orders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

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
      const token = localStorage.getItem("token");
      const url = filterStatus
        ? `${API_URL}/api/orders/admin/all?status=${filterStatus}`
        : `${API_URL}/api/orders/admin/all`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/orders/admin/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
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

      const data = await response.json();

      if (data.success) {
        fetchOrders();
        fetchStatistics();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Order status updated successfully",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update order status",
        });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred",
      });
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  if (loading) {
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
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <Typography variant="h3" color="blue-gray" className="font-bold">
              Orders Management
            </Typography>
            <Typography color="gray" className="font-normal">
              Manage and track all customer orders
            </Typography>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-600"
                  >
                    Total Orders
                  </Typography>
                  <Typography
                    variant="h4"
                    color="blue-gray"
                    className="font-bold"
                  >
                    {stats.ordersByStatus.reduce(
                      (sum, s) => sum + parseInt(s.count),
                      0
                    )}
                  </Typography>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-600"
                  >
                    Pending Orders
                  </Typography>
                  <Typography
                    variant="h4"
                    color="blue-gray"
                    className="font-bold"
                  >
                    {stats.ordersByStatus.find(
                      (s) => s.orderStatus === "pending"
                    )?.count || 0}
                  </Typography>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-600"
                  >
                    Delivered
                  </Typography>
                  <Typography
                    variant="h4"
                    color="blue-gray"
                    className="font-bold"
                  >
                    {stats.ordersByStatus.find(
                      (s) => s.orderStatus === "delivered"
                    )?.count || 0}
                  </Typography>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-600"
                  >
                    This Month
                  </Typography>
                  <Typography
                    variant="h4"
                    color="blue-gray"
                    className="font-bold"
                  >
                    {stats.ordersThisMonth}
                  </Typography>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="shadow-lg">
        <CardBody className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-blue-gray-600" />
            <Typography variant="h6" color="blue-gray" className="font-bold">
              Filter by Status
            </Typography>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setFilterStatus("")}
              variant={filterStatus === "" ? "gradient" : "outlined"}
              size="sm"
              color="blue"
              className="flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              All Orders
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
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-xl">
        <CardHeader
          variant="gradient"
          color="blue"
          className="mb-8 p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-white" />
              <Typography variant="h5" color="white" className="font-bold">
                Orders List
              </Typography>
            </div>
            <Chip
              value={`${orders.length} orders`}
              variant="gradient"
              color="white"
              size="sm"
              className="font-semibold"
            />
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="w-16 h-16 text-blue-gray-300 mb-4" />
              <Typography variant="h6" color="blue-gray" className="mb-2">
                No orders found
              </Typography>
              <Typography variant="small" color="gray">
                {filterStatus
                  ? `No ${filterStatus} orders at the moment`
                  : "No orders have been placed yet"}
              </Typography>
            </div>
          ) : (
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
                              {order.customerFirstName.charAt(0).toUpperCase()}
                            </Typography>
                          </div>
                          <div>
                            <Typography
                              variant="small"
                              className="font-semibold text-blue-gray-800"
                            >
                              {order.customerFirstName} {order.customerLastName}
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
                            order.cardType === "personal" ? "blue" : "purple"
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
                          value={new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
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
                              size="sm"
                              variant="outlined"
                              color="green"
                              onClick={() => viewOrderDetails(order)}
                              className="hover:shadow-md transition-shadow"
                            >
                              <Eye className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                          <Select
                            size="sm"
                            value={order.orderStatus}
                            onChange={(val) =>
                              handleStatusUpdate(order.id, val)
                            }
                            label="Update Status"
                            className="min-w-[140px]"
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
          )}
        </CardBody>
      </Card>

      {/* Order Details Modal */}
      <Dialog
        open={showOrderModal}
        handler={() => setShowOrderModal(false)}
        size="lg"
        className="shadow-2xl"
      >
        {selectedOrder && (
          <>
            <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <Typography variant="h5" color="blue-gray">
                  Order Details
                </Typography>
                <Typography
                  variant="small"
                  color="gray"
                  className="font-mono font-normal"
                >
                  {selectedOrder.orderNumber}
                </Typography>
              </div>
            </DialogHeader>
            <DialogBody divider className="h-[40rem] overflow-scroll p-6">
              <div className="space-y-6">
                {/* Order Status Banner */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                        <Typography
                          variant="small"
                          className="font-bold text-white"
                        >
                          {selectedOrder.customerFirstName
                            .charAt(0)
                            .toUpperCase()}
                        </Typography>
                      </div>
                      <div>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          Name
                        </Typography>
                        <Typography variant="small" color="gray">
                          {selectedOrder.customerFirstName}{" "}
                          {selectedOrder.customerLastName}
                        </Typography>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-blue-gray-400 mt-1" />
                      <div>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          Email
                        </Typography>
                        <Typography variant="small" color="gray">
                          {selectedOrder.customerEmail}
                        </Typography>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-blue-gray-400 mt-1" />
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
                      <Calendar className="w-4 h-4 text-blue-gray-400 mt-1" />
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
                        <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                          <Typography
                            variant="small"
                            className="font-medium text-blue-gray-800"
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
                                className="italic"
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
                  <div className="grid grid-cols-2 gap-4">
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
                            selectedOrder.cardDesignMode === "ai"
                              ? "AI Generated"
                              : "Manual"
                          }
                          size="sm"
                          className="w-fit mt-1"
                        />
                      </div>
                    </div>
                    {selectedOrder.cardColor && (
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
                  <div className="grid grid-cols-2 gap-4">
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
            <DialogFooter className="gap-3">
              <Button
                variant="text"
                color="blue-gray"
                onClick={() => setShowOrderModal(false)}
              >
                Close
              </Button>
              <Button
                variant="gradient"
                color="blue"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Print Order
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  );
}

export default Orders;
