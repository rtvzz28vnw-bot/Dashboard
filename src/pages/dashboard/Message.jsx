import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from "@material-tailwind/react";
import { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import {
  Mail,
  Send,
  Eye,
  X,
  Calendar,
  User,
  MessageSquare,
  Search,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// Centralized API configuration
const API_URL = import.meta.env.VITE_API_URL;

// Message Card Component for Mobile View
const MessageCard = ({ message, onView, onReply }) => {
  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow">
      <CardBody className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
            <Typography variant="h6" className="font-bold text-white">
              {message.name?.charAt(0).toUpperCase()}
            </Typography>
          </div>
          <div className="flex-1 min-w-0">
            <Typography
              variant="h6"
              color="blue-gray"
              className="font-bold truncate"
            >
              {message.name}
            </Typography>
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-blue-gray-400 flex-shrink-0" />
              <Typography variant="small" color="gray" className="truncate">
                {message.email}
              </Typography>
            </div>
          </div>
        </div>

        {/* Message Preview */}
        <div className="mb-3">
          <Typography
            variant="small"
            className="text-blue-gray-600 line-clamp-3"
          >
            {message.message}
          </Typography>
        </div>

        {/* Date */}
        <div className="mb-3">
          <Chip
            value={new Date(message.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            variant="ghost"
            size="sm"
            className="w-fit"
            icon={<Calendar className="w-3 h-3 text-blue-gray-600" />}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outlined"
            color="green"
            onClick={() => onView(message)}
            className="flex items-center justify-center gap-2 flex-1"
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
          <Button
            size="sm"
            variant="gradient"
            color="blue"
            onClick={() => onReply(message.email, message.name)}
            className="flex items-center justify-center gap-2 flex-1"
          >
            <Send className="h-4 w-4" />
            Reply
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

// Main Component
export function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingReply, setSendingReply] = useState(false);

  // Modal states
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewMessage, setViewMessage] = useState(null);

  // Form states
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/get/contact-messages`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setMessages(data.data || []);
    } catch (err) {
      console.error("Failed to fetch messages", err);
      setError(err.message || "Failed to load messages. Please try again.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (email, name) => {
    setSelectedEmail(email);
    setSelectedName(name);
    setSubject(`Re: Your message to us`);
    setOpen(true);
  };

  const handleView = (message) => {
    setViewMessage(message);
    setViewOpen(true);
  };

  const handleCloseReplyModal = () => {
    // Check if there's unsaved content
    if (
      text.trim() ||
      (subject.trim() && subject !== `Re: Your message to us`)
    ) {
      Swal.fire({
        title: "Discard reply?",
        text: "You have unsaved changes. Are you sure you want to close?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, discard",
        cancelButtonText: "Keep editing",
      }).then((result) => {
        if (result.isConfirmed) {
          resetReplyForm();
          setOpen(false);
        }
      });
    } else {
      resetReplyForm();
      setOpen(false);
    }
  };

  const resetReplyForm = () => {
    setSubject("");
    setText("");
    setSelectedEmail("");
    setSelectedName("");
  };

  const sendReply = async () => {
    if (!subject.trim() || !text.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in both subject and message",
        confirmButtonText: "OK",
      });
      return;
    }

    if (text.length > 5000) {
      Swal.fire({
        icon: "warning",
        title: "Message Too Long",
        text: "Please keep your message under 5000 characters",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      setSendingReply(true);

      const res = await fetch(`${API_URL}/api/reply/contact-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selectedEmail, subject, text }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      Swal.fire({
        icon: "success",
        title: "Reply Sent!",
        text: "Your reply has been sent successfully",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });

      resetReplyForm();
      setOpen(false);
    } catch (err) {
      console.error("Error sending reply:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Send Reply",
        text: err.message || "Please try again later",
        confirmButtonText: "OK",
      });
    } finally {
      setSendingReply(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchMessages();
  };

  // Memoized filtered messages
  const filteredMessages = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return messages;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    return messages.filter(
      (msg) =>
        msg.name?.toLowerCase().includes(searchLower) ||
        msg.email?.toLowerCase().includes(searchLower) ||
        msg.message?.toLowerCase().includes(searchLower)
    );
  }, [messages, debouncedSearchTerm]);

  // Loading state
  if (loading && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <Typography variant="h6" color="blue-gray">
          Loading messages...
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-12 mb-8 px-2 sm:px-0">
      <Card className="shadow-xl">
        <CardHeader
          variant="gradient"
          color="blue"
          className="mb-6 sm:mb-8 p-4 sm:p-6 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <div>
                <Typography
                  variant="h5"
                  color="white"
                  className="font-bold text-lg sm:text-xl"
                >
                  Contact Messages
                </Typography>
                <Typography
                  variant="small"
                  color="white"
                  className="font-normal opacity-80 hidden sm:block"
                >
                  View and reply to customer messages
                </Typography>
              </div>
            </div>
            <Chip
              value={`${filteredMessages.length} messages`}
              variant="gradient"
              color="white"
              size="sm"
              className="font-semibold"
            />
          </div>
        </CardHeader>

        <CardBody className="px-2 sm:px-6 pt-0 pb-2">
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
                    Error Loading Messages
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

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative flex w-full max-w-md">
              <Input
                type="text"
                label="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="lg"
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            {searchTerm && (
              <Typography variant="small" color="gray" className="mt-2">
                {filteredMessages.length} result
                {filteredMessages.length !== 1 ? "s" : ""} found
              </Typography>
            )}
          </div>

          {/* Content */}
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-16 h-16 text-blue-gray-300 mb-4" />
              <Typography variant="h6" color="blue-gray" className="mb-2">
                No messages found
              </Typography>
              <Typography
                variant="small"
                color="gray"
                className="text-center px-4"
              >
                {searchTerm
                  ? "Try a different search term"
                  : "No contact messages available yet"}
              </Typography>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden">
                {filteredMessages.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    onView={handleView}
                    onReply={handleReply}
                  />
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[640px] table-auto">
                  <thead>
                    <tr>
                      {[
                        { label: "Name", icon: User },
                        { label: "Email", icon: Mail },
                        { label: "Message", icon: MessageSquare },
                        { label: "Date", icon: Calendar },
                        { label: "Actions", icon: null },
                      ].map((el) => (
                        <th
                          key={el.label}
                          className="border-b border-blue-gray-100 bg-blue-gray-50/50 py-4 px-6 text-left"
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
                    {filteredMessages.map((message, index) => {
                      const isLast = index === filteredMessages.length - 1;
                      const classes = isLast
                        ? "py-4 px-6"
                        : "py-4 px-6 border-b border-blue-gray-50";

                      return (
                        <tr
                          key={message.id}
                          className="hover:bg-blue-gray-50/50 transition-colors"
                        >
                          <td className={classes}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                <Typography
                                  variant="small"
                                  className="font-bold text-white"
                                >
                                  {message.name?.charAt(0).toUpperCase()}
                                </Typography>
                              </div>
                              <Typography className="font-semibold text-blue-gray-800">
                                {message.name}
                              </Typography>
                            </div>
                          </td>
                          <td className={classes}>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-blue-gray-400" />
                              <Typography className="text-sm text-blue-gray-700 font-medium">
                                {message.email}
                              </Typography>
                            </div>
                          </td>
                          <td className={classes}>
                            <Typography className="text-sm text-blue-gray-600 line-clamp-2 max-w-[250px]">
                              {message.message}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <Chip
                              value={new Date(
                                message.createdAt
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
                          <td className={classes}>
                            <div className="flex gap-2">
                              <Tooltip content="View full message">
                                <IconButton
                                  size="sm"
                                  variant="outlined"
                                  color="green"
                                  onClick={() => handleView(message)}
                                  className="hover:shadow-md transition-shadow"
                                >
                                  <Eye className="w-4 h-4" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip content="Reply to message">
                                <IconButton
                                  size="sm"
                                  variant="gradient"
                                  color="blue"
                                  onClick={() =>
                                    handleReply(message.email, message.name)
                                  }
                                  className="hover:shadow-lg transition-shadow"
                                >
                                  <Send className="w-4 h-4" />
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
            </>
          )}
        </CardBody>
      </Card>

      {/* Reply Dialog */}
      <Dialog
        open={open}
        handler={handleCloseReplyModal}
        size="md"
        className="shadow-2xl max-h-[95vh] overflow-hidden"
      >
        <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100 p-4 sm:p-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <Typography
              variant="h5"
              color="blue-gray"
              className="text-lg sm:text-xl"
            >
              Reply to Message
            </Typography>
            <Typography
              variant="small"
              color="gray"
              className="font-normal truncate"
            >
              Sending to: {selectedName} ({selectedEmail})
            </Typography>
          </div>
        </DialogHeader>
        <DialogBody
          divider
          className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 max-h-[60vh] overflow-y-auto"
        >
          <div>
            <Input
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              size="lg"
              icon={<Mail className="w-5 h-5" />}
              className="focus:!border-blue-500"
              disabled={sendingReply}
            />
          </div>
          <div>
            <Textarea
              label="Your Message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              size="lg"
              rows={6}
              className="focus:!border-blue-500"
              disabled={sendingReply}
            />
            <div className="flex justify-between items-center mt-2">
              <Typography
                variant="small"
                color={text.length > 5000 ? "red" : "gray"}
              >
                {text.length} / 5000 characters
              </Typography>
              {text.length > 4500 && text.length <= 5000 && (
                <Typography variant="small" color="orange">
                  Approaching limit
                </Typography>
              )}
              {text.length > 5000 && (
                <Typography variant="small" color="red">
                  Character limit exceeded!
                </Typography>
              )}
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="gap-2 sm:gap-3 p-4 sm:p-6">
          <Button
            variant="text"
            color="red"
            onClick={handleCloseReplyModal}
            disabled={sendingReply}
            className="flex items-center gap-2 flex-1 sm:flex-initial"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="blue"
            onClick={sendReply}
            disabled={sendingReply || text.length > 5000}
            className="flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow flex-1 sm:flex-initial"
          >
            {sendingReply ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Reply
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* View Message Dialog */}
      <Dialog
        open={viewOpen}
        handler={() => setViewOpen(false)}
        size="md"
        className="shadow-2xl max-h-[95vh] overflow-hidden"
      >
        <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100 p-4 sm:p-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <Typography
            variant="h5"
            color="blue-gray"
            className="text-lg sm:text-xl"
          >
            Message Details
          </Typography>
        </DialogHeader>
        <DialogBody className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
          {viewMessage && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-blue-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                  <Typography variant="h6" className="font-bold text-white">
                    {viewMessage.name?.charAt(0).toUpperCase()}
                  </Typography>
                </div>
                <div className="flex-1 min-w-0">
                  <Typography
                    variant="h6"
                    color="blue-gray"
                    className="break-words"
                  >
                    {viewMessage.name}
                  </Typography>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-blue-gray-400 flex-shrink-0" />
                    <Typography
                      variant="small"
                      color="gray"
                      className="break-words"
                    >
                      {viewMessage.email}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-blue-gray-400 flex-shrink-0" />
                    <Typography variant="small" color="gray">
                      {new Date(viewMessage.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-blue-gray-100 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-blue-gray-600" />
                  <Typography
                    variant="small"
                    className="font-bold uppercase text-blue-gray-600"
                  >
                    Message Content
                  </Typography>
                </div>
                <Typography className="text-blue-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                  {viewMessage.message}
                </Typography>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="gap-2 sm:gap-3 p-4 sm:p-6">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setViewOpen(false)}
            className="flex items-center gap-2 flex-1 sm:flex-initial"
          >
            <X className="w-4 h-4" />
            Close
          </Button>
          <Button
            variant="gradient"
            color="blue"
            onClick={() => {
              setViewOpen(false);
              handleReply(viewMessage?.email, viewMessage?.name);
            }}
            className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow flex-1 sm:flex-initial"
          >
            <Send className="w-4 h-4" />
            Reply
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default ContactMessages;
