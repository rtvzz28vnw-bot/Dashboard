import React, { useEffect, useState, useMemo } from "react";
import {
  Typography,
  Alert,
  Card,
  CardHeader,
  CardBody,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import {
  Bell,
  ShoppingCart,
  Users,
  Mail,
  UserPlus,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Filter,
  Eye,
  Trash2,
  BellOff,
} from "lucide-react";

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

// Notification types with their icons and colors
const notificationTypes = {
  order: {
    icon: ShoppingCart,
    color: "blue",
    label: "New Order",
  },
  user: {
    icon: UserPlus,
    color: "green",
    label: "New User",
  },
  message: {
    icon: Mail,
    color: "purple",
    label: "New Message",
  },
  profile: {
    icon: FileText,
    color: "orange",
    label: "New Profile",
  },
  system: {
    icon: AlertCircle,
    color: "red",
    label: "System Alert",
  },
};

// Notification Card Component for Mobile
const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
  const type = notificationTypes[notification.type] || notificationTypes.system;
  const Icon = type.icon;

  return (
    <Card
      className={`mb-3 shadow-md hover:shadow-lg transition-shadow ${
        !notification.isRead ? "border-l-4 border-blue-500" : ""
      }`}
    >
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br from-${type.color}-400 to-${type.color}-600 flex items-center justify-center flex-shrink-0`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Chip
                value={type.label}
                size="sm"
                variant="ghost"
                color={type.color}
                className="capitalize"
              />
              {!notification.isRead && (
                <Chip
                  value="New"
                  size="sm"
                  color="blue"
                  className="flex-shrink-0"
                />
              )}
            </div>

            <Typography
              variant="small"
              className="font-semibold text-blue-gray-800 mb-1"
            >
              {notification.title}
            </Typography>
            <Typography variant="small" color="gray" className="mb-2">
              {notification.message}
            </Typography>

            <div className="flex items-center gap-2 text-xs text-blue-gray-500 mb-3">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(notification.createdAt)}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {!notification.isRead && (
                <Button
                  size="sm"
                  variant="outlined"
                  color="green"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="flex items-center gap-1 flex-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  Mark as Read
                </Button>
              )}
              <Button
                size="sm"
                variant="outlined"
                color="red"
                onClick={() => onDelete(notification.id)}
                className="flex items-center gap-1 flex-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// Time formatting helper
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

// Main Component
export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterRead, setFilterRead] = useState("all");

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock notifications - Replace with your actual API endpoint
      // const token = getAuthToken();
      // const response = await fetch(`${API_URL}/api/admin/notifications`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // const data = await response.json();
      // setNotifications(data.data || []);

      // For now, generate mock data based on your platform
      const mockNotifications = await generateMockNotifications();
      setNotifications(mockNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message || "Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock notifications based on your actual data
  const generateMockNotifications = async () => {
    try {
      const token = getAuthToken();
      const notifications = [];

      // Fetch recent orders
      try {
        const ordersRes = await fetch(
          `${API_URL}/api/orders/admin/all?limit=5`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const ordersData = await ordersRes.json();
        if (ordersData.success && ordersData.data?.orders) {
          ordersData.data.orders.slice(0, 3).forEach((order) => {
            notifications.push({
              id: `order-${order.id}`,
              type: "order",
              title: "New Order Received",
              message: `Order #${order.orderNumber} from ${order.customerFirstName} ${order.customerLastName} - ${order.totalAmount} JOD`,
              createdAt: order.createdAt,
              isRead: false,
            });
          });
        }
      } catch (err) {
        console.error("Error fetching orders for notifications:", err);
      }

      // Fetch recent users
      try {
        const usersRes = await fetch(`${API_URL}/api/admin/all?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await usersRes.json();
        if (usersData.success && usersData.data) {
          usersData.data.slice(0, 2).forEach((user) => {
            notifications.push({
              id: `user-${user.id}`,
              type: "user",
              title: "New User Registration",
              message: `${user.firstName} ${user.lastName} (${user.email}) joined the platform`,
              createdAt: user.createdAt,
              isRead: false,
            });
          });
        }
      } catch (err) {
        console.error("Error fetching users for notifications:", err);
      }

      // Fetch recent messages
      try {
        const messagesRes = await fetch(`${API_URL}/api/get/contact-messages`);
        const messagesData = await messagesRes.json();
        if (messagesData.data) {
          messagesData.data.slice(0, 2).forEach((msg) => {
            notifications.push({
              id: `message-${msg.id}`,
              type: "message",
              title: "New Contact Message",
              message: `${msg.name} sent a message: "${msg.message.substring(
                0,
                50
              )}${msg.message.length > 50 ? "..." : ""}"`,
              createdAt: msg.createdAt,
              isRead: false,
            });
          });
        }
      } catch (err) {
        console.error("Error fetching messages for notifications:", err);
      }

      // Fetch recent profiles
      try {
        const profilesRes = await fetch(
          `${API_URL}/api/admin/dashboard/profiles/all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const profilesData = await profilesRes.json();
        if (profilesData.data) {
          profilesData.data.slice(0, 2).forEach((profile) => {
            notifications.push({
              id: `profile-${profile.id}`,
              type: "profile",
              title: "New Profile Created",
              message: `${profile.name} created a ${profile.profileType} profile`,
              createdAt: profile.createdAt,
              isRead: Math.random() > 0.5, // Random read status for demo
            });
          });
        }
      } catch (err) {
        console.error("Error fetching profiles for notifications:", err);
      }

      // Sort by date (newest first)
      return notifications.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (err) {
      console.error("Error generating notifications:", err);
      return [];
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    if (filteredNotifications.length === 0) return;

    if (window.confirm("Are you sure you want to clear all notifications?")) {
      setNotifications([]);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchNotifications();
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((n) => n.type === filterType);
    }

    // Filter by read status
    if (filterRead === "unread") {
      filtered = filtered.filter((n) => !n.isRead);
    } else if (filterRead === "read") {
      filtered = filtered.filter((n) => n.isRead);
    }

    return filtered;
  }, [notifications, filterType, filterRead]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Loading state
  if (loading && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <Typography variant="h6" color="blue-gray">
          Loading notifications...
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-12 mb-8 px-2 sm:px-0 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center relative">
              <Bell className="w-6 h-6 text-white" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <Typography
                    variant="small"
                    className="text-white font-bold text-xs"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Typography>
                </div>
              )}
            </div>
            <div>
              <Typography
                variant="h3"
                color="blue-gray"
                className="font-bold text-xl sm:text-3xl"
              >
                Notifications
              </Typography>
              <Typography
                color="gray"
                className="font-normal text-sm sm:text-base"
              >
                Stay updated with platform activities
              </Typography>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outlined"
              color="blue"
              onClick={fetchNotifications}
              disabled={loading}
              className="flex items-center gap-2 flex-1 sm:flex-initial"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="gradient"
                color="green"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 flex-1 sm:flex-initial"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Mark All Read</span>
                <span className="sm:hidden">Read All</span>
              </Button>
            )}
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
                Error Loading Notifications
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="shadow-md">
          <CardBody className="p-4">
            <div className="text-center">
              <Typography variant="h4" color="blue-gray" className="font-bold">
                {notifications.length}
              </Typography>
              <Typography variant="small" color="gray">
                Total
              </Typography>
            </div>
          </CardBody>
        </Card>
        <Card className="shadow-md">
          <CardBody className="p-4">
            <div className="text-center">
              <Typography variant="h4" color="blue" className="font-bold">
                {unreadCount}
              </Typography>
              <Typography variant="small" color="gray">
                Unread
              </Typography>
            </div>
          </CardBody>
        </Card>
        <Card className="shadow-md">
          <CardBody className="p-4">
            <div className="text-center">
              <Typography variant="h4" color="green" className="font-bold">
                {notifications.filter((n) => n.isRead).length}
              </Typography>
              <Typography variant="small" color="gray">
                Read
              </Typography>
            </div>
          </CardBody>
        </Card>
        <Card className="shadow-md">
          <CardBody className="p-4">
            <div className="text-center">
              <Typography variant="h4" color="purple" className="font-bold">
                {notifications.filter((n) => n.type === "order").length}
              </Typography>
              <Typography variant="small" color="gray">
                Orders
              </Typography>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-lg mb-6">
        <CardBody className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-gray-600" />
            <Typography variant="h6" color="blue-gray" className="font-bold">
              Filters
            </Typography>
          </div>

          <div className="space-y-3">
            {/* Type Filter */}
            <div>
              <Typography
                variant="small"
                color="gray"
                className="mb-2 font-semibold"
              >
                Type
              </Typography>
              <div className="flex flex-wrap gap-2">
                <Chip
                  value="All"
                  onClick={() => setFilterType("all")}
                  variant={filterType === "all" ? "gradient" : "outlined"}
                  color="blue"
                  className="cursor-pointer"
                />
                {Object.entries(notificationTypes).map(
                  ([key, { label, color }]) => (
                    <Chip
                      key={key}
                      value={label}
                      onClick={() => setFilterType(key)}
                      variant={filterType === key ? "gradient" : "outlined"}
                      color={color}
                      className="cursor-pointer"
                    />
                  )
                )}
              </div>
            </div>

            {/* Read Status Filter */}
            <div>
              <Typography
                variant="small"
                color="gray"
                className="mb-2 font-semibold"
              >
                Status
              </Typography>
              <div className="flex flex-wrap gap-2">
                <Chip
                  value="All"
                  onClick={() => setFilterRead("all")}
                  variant={filterRead === "all" ? "gradient" : "outlined"}
                  color="blue"
                  className="cursor-pointer"
                />
                <Chip
                  value="Unread"
                  onClick={() => setFilterRead("unread")}
                  variant={filterRead === "unread" ? "gradient" : "outlined"}
                  color="orange"
                  className="cursor-pointer"
                />
                <Chip
                  value="Read"
                  onClick={() => setFilterRead("read")}
                  variant={filterRead === "read" ? "gradient" : "outlined"}
                  color="green"
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Notifications List */}
      <Card className="shadow-xl">
        <CardHeader
          variant="gradient"
          color="blue"
          className="mb-6 sm:mb-8 p-4 sm:p-6 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <Typography
                variant="h5"
                color="white"
                className="font-bold text-lg sm:text-xl"
              >
                Activity Feed
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Chip
                value={`${filteredNotifications.length} notifications`}
                variant="gradient"
                color="white"
                size="sm"
                className="font-semibold"
              />
              {filteredNotifications.length > 0 && (
                <Tooltip content="Clear all notifications">
                  <IconButton
                    size="sm"
                    variant="text"
                    color="white"
                    onClick={handleClearAll}
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-2 sm:px-6 pt-0 pb-4">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BellOff className="w-16 h-16 text-blue-gray-300 mb-4" />
              <Typography variant="h6" color="blue-gray" className="mb-2">
                No notifications found
              </Typography>
              <Typography
                variant="small"
                color="gray"
                className="text-center px-4"
              >
                {filterType !== "all" || filterRead !== "all"
                  ? "Try adjusting your filters"
                  : "You're all caught up! No new notifications"}
              </Typography>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Desktop List View */}
              <div className="hidden lg:block space-y-3">
                {filteredNotifications.map((notification) => {
                  const type =
                    notificationTypes[notification.type] ||
                    notificationTypes.system;
                  const Icon = type.icon;

                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                        !notification.isRead
                          ? "bg-blue-50 border-blue-200 border-l-4"
                          : "bg-white border-blue-gray-100 hover:bg-blue-gray-50"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br from-${type.color}-400 to-${type.color}-600 flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <Chip
                              value={type.label}
                              size="sm"
                              variant="ghost"
                              color={type.color}
                              className="capitalize"
                            />
                            {!notification.isRead && (
                              <Chip value="New" size="sm" color="blue" />
                            )}
                          </div>
                          <Typography
                            variant="small"
                            color="gray"
                            className="flex items-center gap-1 flex-shrink-0"
                          >
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(notification.createdAt)}
                          </Typography>
                        </div>

                        <Typography
                          variant="small"
                          className="font-semibold text-blue-gray-800 mb-1"
                        >
                          {notification.title}
                        </Typography>
                        <Typography variant="small" color="gray">
                          {notification.message}
                        </Typography>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <Tooltip content="Mark as read">
                            <IconButton
                              size="sm"
                              variant="outlined"
                              color="green"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip content="Delete">
                          <IconButton
                            size="sm"
                            variant="outlined"
                            color="red"
                            onClick={() => handleDelete(notification.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Notifications;
