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
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
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
  Filter,
} from "lucide-react";

export function Tables() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // New state for viewing message
  const [viewOpen, setViewOpen] = useState(false);
  const [viewMessage, setViewMessage] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/get/contact-messages`);
      const data = await res.json();
      setMessages(data.data);
      setFilteredMessages(data.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
      Swal.fire({
        icon: "error",
        title: "Failed to load messages",
        text: "Please try again later.",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
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

  const sendReply = async () => {
    if (!subject.trim() || !text.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Please fill in all fields",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/reply/contact-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selectedEmail, subject, text }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Reply sent successfully!",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        setOpen(false);
        setSubject("");
        setText("");
        setSelectedEmail("");
        setSelectedName("");
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to send reply",
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (err) {
      console.error("Error sending reply:", err);

      Swal.fire({
        icon: "error",
        title: "Error sending reply",
        text: "Please try again later.",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredMessages(messages);
      return;
    }

    const filtered = messages.filter(
      (msg) =>
        msg.name.toLowerCase().includes(value.toLowerCase()) ||
        msg.email.toLowerCase().includes(value.toLowerCase()) ||
        msg.message.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredMessages(filtered);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card className="shadow-xl">
        <CardHeader
          variant="gradient"
          color="blue"
          className="mb-8 p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-white" />
              <Typography variant="h5" color="white" className="font-bold">
                Contact Messages
              </Typography>
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

        {/* Search Bar */}
        <div className="px-6 mb-6">
          <div className="relative flex w-full max-w-md">
            <Input
              type="text"
              label="Search messages..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-20"
              icon={<Search className="w-5 h-5" />}
            />
          </div>
        </div>

        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-16 h-16 text-blue-gray-300 mb-4" />
              <Typography variant="h6" color="blue-gray" className="mb-2">
                No messages found
              </Typography>
              <Typography variant="small" color="gray">
                {searchTerm
                  ? "Try a different search term"
                  : "No contact messages available yet"}
              </Typography>
            </div>
          ) : (
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
                {filteredMessages.map(
                  ({ id, name, email, message, createdAt }, index) => {
                    const isLast = index === filteredMessages.length - 1;
                    const classes = isLast
                      ? "py-4 px-6"
                      : "py-4 px-6 border-b border-blue-gray-50";

                    return (
                      <tr
                        key={id}
                        className="hover:bg-blue-gray-50/50 transition-colors"
                      >
                        <td className={classes}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                              <Typography
                                variant="small"
                                className="font-bold text-white"
                              >
                                {name.charAt(0).toUpperCase()}
                              </Typography>
                            </div>
                            <Typography className="font-semibold text-blue-gray-800">
                              {name}
                            </Typography>
                          </div>
                        </td>
                        <td className={classes}>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-gray-400" />
                            <Typography className="text-sm text-blue-gray-700 font-medium">
                              {email}
                            </Typography>
                          </div>
                        </td>
                        <td className={classes}>
                          <Typography className="text-sm text-blue-gray-600 line-clamp-2 max-w-[250px]">
                            {message}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Chip
                            value={new Date(createdAt).toLocaleDateString(
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
                        <td className={classes}>
                          <div className="flex gap-2">
                            <Tooltip content="View full message">
                              <IconButton
                                size="sm"
                                variant="outlined"
                                color="green"
                                onClick={() =>
                                  handleView({
                                    name,
                                    email,
                                    message,
                                    createdAt,
                                  })
                                }
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
                                onClick={() => handleReply(email, name)}
                                className="hover:shadow-lg transition-shadow"
                              >
                                <Send className="w-4 h-4" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Reply Dialog */}
      <Dialog
        open={open}
        handler={() => setOpen(false)}
        size="md"
        className="shadow-2xl"
      >
        <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div>
            <Typography variant="h5" color="blue-gray">
              Reply to Message
            </Typography>
            <Typography variant="small" color="gray" className="font-normal">
              Sending to: {selectedName} ({selectedEmail})
            </Typography>
          </div>
        </DialogHeader>
        <DialogBody divider className="flex flex-col gap-6 p-6">
          <div>
            <Input
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              size="lg"
              icon={<Mail className="w-5 h-5" />}
              className="focus:!border-blue-500"
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
            />
            <Typography variant="small" color="gray" className="mt-2">
              {text.length} characters
            </Typography>
          </div>
        </DialogBody>
        <DialogFooter className="gap-3">
          <Button
            variant="text"
            color="red"
            onClick={() => {
              setOpen(false);
              setSubject("");
              setText("");
            }}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="blue"
            onClick={sendReply}
            className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Send className="w-4 h-4" />
            Send Reply
          </Button>
        </DialogFooter>
      </Dialog>

      {/* View Message Dialog */}
      <Dialog
        open={viewOpen}
        handler={() => setViewOpen(false)}
        size="md"
        className="shadow-2xl"
      >
        <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <Typography variant="h5" color="blue-gray">
            Message Details
          </Typography>
        </DialogHeader>
        <DialogBody className="p-6">
          {viewMessage && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-blue-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                  <Typography variant="h6" className="font-bold text-white">
                    {viewMessage.name.charAt(0).toUpperCase()}
                  </Typography>
                </div>
                <div>
                  <Typography variant="h6" color="blue-gray">
                    {viewMessage.name}
                  </Typography>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-blue-gray-400" />
                    <Typography variant="small" color="gray">
                      {viewMessage.email}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-blue-gray-400" />
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
                <Typography className="text-blue-gray-800 leading-relaxed whitespace-pre-wrap">
                  {viewMessage.message}
                </Typography>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="gap-3">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setViewOpen(false)}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </Button>
          <Button
            variant="gradient"
            color="blue"
            onClick={() => {
              setViewOpen(false);
              handleReply(viewMessage.email, viewMessage.name);
            }}
            className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Send className="w-4 h-4" />
            Reply to this Message
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Tables;
