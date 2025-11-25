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
  Input,
} from "@material-tailwind/react";
import { EyeIcon } from "@heroicons/react/24/solid";

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
    pending: "⏳",
    confirmed: "✓",
    processing: "⚙️",
    shipped: "🚚",
    delivered: "✅",
    cancelled: "❌",
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
        alert("Order status updated successfully");
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("An error occurred");
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {/* Header */}
      <div>
        <Typography variant="h3" color="blue-gray" className="mb-2">
          Orders Management
        </Typography>
        <Typography color="gray" className="font-normal">
          Manage and track all customer orders
        </Typography>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-600"
                  >
                    Total Orders
                  </Typography>
                  <Typography variant="h4" color="blue-gray">
                    {stats.ordersByStatus.reduce(
                      (sum, s) => sum + parseInt(s.count),
                      0
                    )}
                  </Typography>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-600"
                  >
                    Pending Orders
                  </Typography>
                  <Typography variant="h4" color="blue-gray">
                    {stats.ordersByStatus.find(
                      (s) => s.orderStatus === "pending"
                    )?.count || 0}
                  </Typography>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-600"
                  >
                    Delivered
                  </Typography>
                  <Typography variant="h4" color="blue-gray">
                    {stats.ordersByStatus.find(
                      (s) => s.orderStatus === "delivered"
                    )?.count || 0}
                  </Typography>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-600"
                  >
                    This Month
                  </Typography>
                  <Typography variant="h4" color="blue-gray">
                    {stats.ordersThisMonth}
                  </Typography>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setFilterStatus("")}
              variant={filterStatus === "" ? "gradient" : "outlined"}
              size="sm"
            >
              All Orders
            </Button>
            {Object.keys(statusColors).map((status) => (
              <Button
                key={status}
                onClick={() => setFilterStatus(status)}
                variant={filterStatus === status ? "gradient" : "outlined"}
                size="sm"
                color={statusColors[status]}
              >
                {statusIcons[status]}{" "}
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Orders List
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {[
                  "Order #",
                  "Customer",
                  "Card Type",
                  "Status",
                  "Date",
                  "Amount",
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
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📭</span>
                      <Typography color="blue-gray" className="font-normal">
                        No orders found
                      </Typography>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-gray-50/50">
                    <td className="py-3 px-5">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold font-mono"
                      >
                        {order.orderNumber}
                      </Typography>
                    </td>
                    <td className="py-3 px-5">
                      <div>
                        <Typography
                          variant="small"
                          className="font-semibold text-blue-gray-600"
                        >
                          {order.customerFirstName} {order.customerLastName}
                        </Typography>
                        <Typography
                          variant="small"
                          className="font-normal text-blue-gray-400"
                        >
                          {order.customerEmail}
                        </Typography>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <Chip
                        variant="gradient"
                        value={order.cardType}
                        size="sm"
                        color={
                          order.cardType === "personal" ? "blue" : "purple"
                        }
                      />
                    </td>
                    <td className="py-3 px-5">
                      <Chip
                        variant="gradient"
                        value={`${statusIcons[order.orderStatus]} ${
                          order.orderStatus
                        }`}
                        size="sm"
                        color={statusColors[order.orderStatus]}
                      />
                    </td>
                    <td className="py-3 px-5">
                      <Typography
                        variant="small"
                        className="font-normal text-blue-gray-600"
                      >
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </td>
                    <td className="py-3 px-5">
                      <Typography
                        variant="small"
                        className="font-semibold text-blue-gray-600"
                      >
                        {order.totalAmount} JOD
                      </Typography>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="text"
                          color="blue"
                          onClick={() => viewOrderDetails(order)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Select
                          size="sm"
                          value={order.orderStatus}
                          onChange={(val) => handleStatusUpdate(order.id, val)}
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
                ))
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Order Details Modal */}
      <Dialog
        open={showOrderModal}
        handler={() => setShowOrderModal(false)}
        size="lg"
      >
        {selectedOrder && (
          <>
            <DialogHeader>
              <Typography variant="h5">
                Order Details - {selectedOrder.orderNumber}
              </Typography>
            </DialogHeader>
            <DialogBody divider className="h-[40rem] overflow-scroll">
              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Customer Information
                  </Typography>
                  <div className="grid grid-cols-2 gap-4">
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
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        Status
                      </Typography>
                      <Chip
                        value={selectedOrder.orderStatus}
                        size="sm"
                        color={statusColors[selectedOrder.orderStatus]}
                        className="w-fit"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Shipping Address
                  </Typography>
                  <Card className="bg-gray-50">
                    <CardBody>
                      <Typography variant="small" className="font-medium">
                        {selectedOrder.shippingAddress}
                      </Typography>
                      <Typography variant="small" color="gray">
                        {selectedOrder.shippingCity},{" "}
                        {selectedOrder.shippingCountry}
                      </Typography>
                      {selectedOrder.shippingNotes && (
                        <Typography
                          variant="small"
                          color="gray"
                          className="mt-2 italic"
                        >
                          Note: {selectedOrder.shippingNotes}
                        </Typography>
                      )}
                    </CardBody>
                  </Card>
                </div>

                {/* Card Design */}
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Card Design
                  </Typography>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        Type
                      </Typography>
                      <Typography variant="small" color="gray">
                        {selectedOrder.cardType === "personal"
                          ? "👤 Personal"
                          : "💼 Business"}
                      </Typography>
                    </div>
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
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        Design Mode
                      </Typography>
                      <Typography variant="small" color="gray">
                        {selectedOrder.cardDesignMode === "ai"
                          ? "✨ AI Generated"
                          : "🎨 Manual"}
                      </Typography>
                    </div>
                    {selectedOrder.cardColor && (
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
                            className="w-8 h-8 rounded border-2 border-gray-300"
                            style={{ backgroundColor: selectedOrder.cardColor }}
                          />
                          <Typography variant="small" className="font-mono">
                            {selectedOrder.cardColor}
                          </Typography>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment & Amount */}
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Payment Information
                  </Typography>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        Payment Method
                      </Typography>
                      <Typography variant="small" color="gray">
                        💵 Cash on Delivery
                      </Typography>
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        Total Amount
                      </Typography>
                      <Typography variant="h6" color="blue">
                        {selectedOrder.totalAmount} JOD
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </DialogBody>
          </>
        )}
      </Dialog>
    </div>
  );
}

export default Orders;
