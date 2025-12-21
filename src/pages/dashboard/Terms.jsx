import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Textarea,
  Input,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineBody,
  Progress,
} from "@material-tailwind/react";
import {
  FileText,
  Eye,
  Calendar,
  User,
  Clock,
  Pencil,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Shield,
  Sparkles,
  Info,
  Save,
  X,
  Copy,
  Database,
  Scale,
  Download,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";

const Terms = () => {
  const navigate = useNavigate();
  const [termsData, setTermsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [formErrors, setFormErrors] = useState({});
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    version: "",
    effectiveDate: "",
    lastModifiedBy: "",
    changesSummary: "",
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // Authorization check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchTermsAndConditions();

    // Load draft if exists
    const draft = localStorage.getItem("terms-draft");
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        // Optional: Ask user if they want to restore draft
        console.log("Draft found:", parsedDraft);
      } catch (e) {
        console.error("Failed to parse draft:", e);
      }
    }
  }, [navigate]);

  // Auto-save draft
  useEffect(() => {
    if (openEditDialog && editForm.content) {
      const timer = setTimeout(() => {
        localStorage.setItem("terms-draft", JSON.stringify(editForm));
      }, 2000); // Auto-save after 2 seconds of inactivity
      return () => clearTimeout(timer);
    }
  }, [editForm, openEditDialog]);

  const fetchTermsAndConditions = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/terms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📥 Fetched terms data:", response.data);

      if (response.data.success) {
        const termsDoc = response.data.data;

        // ⚠️ IMPORTANT: Check if ID exists
        if (!termsDoc.id) {
          console.error("❌ Terms document has no ID:", termsDoc);
          setError("Terms document is missing an ID. Please contact support.");
          return;
        }

        console.log("✅ Terms ID:", termsDoc.id);

        setTermsData(termsDoc);
        setEditForm({
          title: termsDoc.title || "",
          content: termsDoc.content || "",
          version: termsDoc.version || "",
          effectiveDate: termsDoc.effectiveDate
            ? new Date(termsDoc.effectiveDate).toISOString().split("T")[0]
            : "",
          lastModifiedBy: termsDoc.lastModifiedBy || "",
          changesSummary: termsDoc.changesSummary || "",
        });
      }
    } catch (err) {
      console.error("❌ Error fetching terms:", err);
      console.error("❌ Response:", err.response?.data);

      if (err.response?.status === 401) {
        navigate("/admin/login");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to access this page");
      } else {
        setError(
          err.response?.data?.message || "Failed to load terms and conditions"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
    setError(null);
    setSuccess(null);
    setFormErrors({});
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setError(null);
    setSuccess(null);
    setFormErrors({});
  };

  const handleOpenViewDialog = () => {
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!editForm.title || editForm.title.trim() === "") {
      errors.title = "Title is required";
    }

    if (!editForm.content || editForm.content.trim() === "") {
      errors.content = "Content is required";
    }

    if (!editForm.version || editForm.version.trim() === "") {
      errors.version = "Version is required";
    } else if (!/^\d+\.\d+\.\d+$/.test(editForm.version)) {
      errors.version = "Version must be in format X.Y.Z (e.g., 1.0.0)";
    }

    if (!editForm.effectiveDate) {
      errors.effectiveDate = "Effective date is required";
    }

    if (!editForm.lastModifiedBy || editForm.lastModifiedBy.trim() === "") {
      errors.lastModifiedBy = "Modified by field is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenConfirmDialog = () => {
    if (!validateForm()) {
      setError("Please fix all validation errors before saving");
      return;
    }
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleUpdateTerms = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem("token");

      const updatePayload = {
        title: editForm.title,
        content: editForm.content,
        version: editForm.version,
        effectiveDate: editForm.effectiveDate
          ? new Date(editForm.effectiveDate).toISOString()
          : null,
        lastModifiedBy: editForm.lastModifiedBy,
        changesSummary: editForm.changesSummary || "",
        isActive: true,
      };

      console.log("🔄 Starting update...");
      console.log("📝 Update payload:", updatePayload);
      console.log("🔑 Token:", token ? "Present" : "Missing");
      console.log("🎯 URL:", `${API_URL}/api/terms/${termsData.id}`);
      console.log("🆔 Terms ID:", termsData.id);

      const response = await axios.put(
        `${API_URL}/api/terms/${termsData.id}`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Update response:", response.data);

      if (response.data.success) {
        setSuccess("Terms & Conditions updated successfully!");
        setTermsData(response.data.data);

        // Clear draft after successful save
        localStorage.removeItem("terms-draft");

        setTimeout(() => {
          handleCloseConfirmDialog();
          handleCloseEditDialog();
          fetchTermsAndConditions();
        }, 1500);
      } else {
        console.error("❌ Update failed:", response.data);
        setError(response.data.message || "Failed to update");
      }
    } catch (err) {
      console.error("❌ FULL ERROR:", err);
      console.error("❌ Error response:", err.response);
      console.error("❌ Error status:", err.response?.status);
      console.error("❌ Error data:", err.response?.data);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => navigate("/admin/login"), 2000);
      } else if (err.response?.status === 403) {
        setError("You don't have permission to edit terms");
      } else if (err.response?.status === 404) {
        setError("Terms & Conditions not found. ID: " + termsData?.id);
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to update terms and conditions"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewVersion = () => {
    if (!termsData) return;

    // Parse current version and increment
    const currentVersion = termsData.version || "1.0.0";
    const versionParts = currentVersion.split(".");
    const newMinor = parseInt(versionParts[1] || 0) + 1;
    const newVersion = `${versionParts[0]}.${newMinor}.0`;

    setEditForm({
      ...editForm,
      version: newVersion,
      effectiveDate: new Date().toISOString().split("T")[0],
      changesSummary: "",
    });

    handleOpenEditDialog();
  };

  const handleExportAsPDF = () => {
    // Create a printable version
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${termsData?.title || "Terms & Conditions"}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.6;
            }
            h1 {
              color: #1e40af;
              border-bottom: 3px solid #1e40af;
              padding-bottom: 10px;
            }
            .meta {
              color: #666;
              font-size: 14px;
              margin: 20px 0;
            }
            .content {
              margin-top: 30px;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <h1>${termsData?.title || "Terms & Conditions"}</h1>
          <div class="meta">
            <p><strong>Version:</strong> ${termsData?.version || "N/A"}</p>
            <p><strong>Effective Date:</strong> ${
              termsData?.effectiveDate
                ? new Date(termsData.effectiveDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                : "N/A"
            }</p>
            <p><strong>Last Updated:</strong> ${
              termsData?.updatedAt
                ? new Date(termsData.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"
            }</p>
          </div>
          <div class="content">${DOMPurify.sanitize(
            termsData?.content || ""
          )}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getCharacterCount = () => {
    return editForm.content.length;
  };

  const getWordCount = () => {
    return editForm.content.trim().split(/\s+/).filter(Boolean).length;
  };

  if (loading && !termsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <Typography variant="h6" color="blue-gray">
          Loading Terms & Conditions...
        </Typography>
        <Progress value={70} color="blue" className="mt-4 w-64" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <Card className="overflow-hidden shadow-xl">
            <CardHeader
              variant="gradient"
              color="blue"
              className="p-8 shadow-lg"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <Typography
                      variant="h3"
                      color="white"
                      className="font-bold mb-1"
                    >
                      Terms & Conditions
                    </Typography>
                    <Typography
                      variant="paragraph"
                      className="text-blue-100 font-normal"
                    >
                      Manage your platform's legal terms and agreements
                    </Typography>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Tooltip content="View full document">
                    <IconButton
                      size="lg"
                      className="bg-white/20 backdrop-blur-lg hover:bg-white/30"
                      onClick={handleOpenViewDialog}
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content="Export as PDF">
                    <IconButton
                      size="lg"
                      className="bg-white/20 backdrop-blur-lg hover:bg-white/30"
                      onClick={handleExportAsPDF}
                    >
                      <Download className="w-5 h-5 text-white" />
                    </IconButton>
                  </Tooltip>
                  <Button
                    size="lg"
                    className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                    onClick={handleOpenEditDialog}
                    disabled={loading || !termsData}
                  >
                    <Pencil className="w-5 h-5" />
                    Edit Terms
                  </Button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <Typography
                    variant="small"
                    className="text-blue-100 mb-1 uppercase font-semibold"
                  >
                    Version
                  </Typography>
                  <Typography variant="h4" color="white" className="font-bold">
                    {termsData?.version || "N/A"}
                  </Typography>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <Typography
                    variant="small"
                    className="text-blue-100 mb-1 uppercase font-semibold"
                  >
                    Status
                  </Typography>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        termsData?.isActive ? "bg-green-400" : "bg-gray-400"
                      } animate-pulse`}
                    ></div>
                    <Typography
                      variant="h6"
                      color="white"
                      className="font-bold"
                    >
                      {termsData?.isActive ? "Active" : "Inactive"}
                    </Typography>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <Typography
                    variant="small"
                    className="text-blue-100 mb-1 uppercase font-semibold"
                  >
                    Last Updated
                  </Typography>
                  <Typography variant="h6" color="white" className="font-bold">
                    {termsData?.updatedAt
                      ? new Date(termsData.updatedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )
                      : "N/A"}
                  </Typography>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <Typography
                    variant="small"
                    className="text-blue-100 mb-1 uppercase font-semibold"
                  >
                    Content Size
                  </Typography>
                  <Typography variant="h6" color="white" className="font-bold">
                    {termsData?.content
                      ? `${Math.ceil(termsData.content.length / 1000)}KB`
                      : "0KB"}
                  </Typography>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            color="red"
            icon={<AlertCircle className="w-6 h-6" />}
            className="mb-6 shadow-lg border border-red-200"
            dismissible={{
              onClose: () => setError(null),
            }}
          >
            <Typography variant="h6" className="mb-1 font-bold">
              Error Occurred
            </Typography>
            <Typography variant="small">{error}</Typography>
          </Alert>
        )}

        {success && (
          <Alert
            color="green"
            icon={<CheckCircle className="w-6 h-6" />}
            className="mb-6 shadow-lg border border-green-200"
            dismissible={{
              onClose: () => setSuccess(null),
            }}
          >
            <Typography variant="h6" className="mb-1 font-bold">
              Success!
            </Typography>
            <Typography variant="small">{success}</Typography>
          </Alert>
        )}

        {/* Main Content with Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Document Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Document Information Card */}
            <Card className="shadow-xl border border-blue-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <CardHeader
                variant="gradient"
                color="blue"
                className="mb-0 p-6 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <Typography
                      variant="h6"
                      color="white"
                      className="font-bold"
                    >
                      Document Info
                    </Typography>
                    <Typography variant="small" className="text-blue-100">
                      Current version details
                    </Typography>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Version Badge */}
                <div className="flex items-center justify-between p-4 bg-blue-gray-50 rounded-xl border border-blue-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        color="gray"
                        className="font-medium"
                      >
                        Version
                      </Typography>
                      <Typography
                        variant="h6"
                        color="blue-gray"
                        className="font-bold"
                      >
                        {termsData?.version || "N/A"}
                      </Typography>
                    </div>
                  </div>
                  <Chip
                    value="Current"
                    size="sm"
                    color="blue"
                    variant="gradient"
                    icon={<CheckCircle className="w-4 h-4" />}
                  />
                </div>

                {/* Status */}
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <Typography
                      variant="small"
                      color="gray"
                      className="font-medium"
                    >
                      Document Status
                    </Typography>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        termsData?.isActive ? "bg-green-500" : "bg-gray-400"
                      } animate-pulse`}
                    ></div>
                  </div>
                  <Chip
                    value={
                      termsData?.isActive ? "Active & Published" : "Inactive"
                    }
                    color={termsData?.isActive ? "green" : "gray"}
                    variant="gradient"
                    className="w-full justify-center"
                    icon={<CheckCircle className="w-4 h-4" />}
                  />
                </div>

                {/* Timeline */}
                <div>
                  <Typography
                    variant="small"
                    color="gray"
                    className="font-semibold mb-3 flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Document Timeline
                  </Typography>
                  <Timeline>
                    <TimelineItem>
                      <TimelineConnector />
                      <TimelineHeader className="h-3">
                        <TimelineIcon className="p-2 bg-blue-500">
                          <Calendar className="w-3 h-3 text-white" />
                        </TimelineIcon>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          Effective Date
                        </Typography>
                      </TimelineHeader>
                      <TimelineBody className="pb-6">
                        <Typography variant="small" color="gray">
                          {termsData?.effectiveDate
                            ? new Date(
                                termsData.effectiveDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "N/A"}
                        </Typography>
                      </TimelineBody>
                    </TimelineItem>
                    <TimelineItem>
                      <TimelineConnector />
                      <TimelineHeader className="h-3">
                        <TimelineIcon className="p-2 bg-green-500">
                          <Clock className="w-3 h-3 text-white" />
                        </TimelineIcon>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          Last Updated
                        </Typography>
                      </TimelineHeader>
                      <TimelineBody className="pb-6">
                        <Typography variant="small" color="gray">
                          {termsData?.updatedAt
                            ? new Date(termsData.updatedAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "N/A"}
                        </Typography>
                      </TimelineBody>
                    </TimelineItem>
                    {termsData?.lastModifiedBy && (
                      <TimelineItem>
                        <TimelineHeader className="h-3">
                          <TimelineIcon className="p-2 bg-purple-500">
                            <User className="w-3 h-3 text-white" />
                          </TimelineIcon>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-semibold"
                          >
                            Modified By
                          </Typography>
                        </TimelineHeader>
                        <TimelineBody>
                          <Typography variant="small" color="gray">
                            {termsData.lastModifiedBy}
                          </Typography>
                        </TimelineBody>
                      </TimelineItem>
                    )}
                  </Timeline>
                </div>

                {/* Changes Summary */}
                {termsData?.changesSummary && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <Typography
                        variant="small"
                        color="amber"
                        className="font-semibold"
                      >
                        Recent Changes
                      </Typography>
                    </div>
                    <Typography
                      variant="small"
                      color="gray"
                      className="leading-relaxed"
                    >
                      {termsData.changesSummary}
                    </Typography>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="pt-4 border-t border-blue-gray-200">
                  <Typography
                    variant="small"
                    color="gray"
                    className="font-semibold mb-3"
                  >
                    Quick Actions
                  </Typography>
                  <div className="space-y-2">
                    <Button
                      variant="gradient"
                      color="blue"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleOpenEditDialog}
                    >
                      <Pencil className="w-4 h-4" />
                      Edit Document
                    </Button>
                    <Button
                      variant="outlined"
                      size="sm"
                      color="blue"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleCreateNewVersion}
                    >
                      <Copy className="w-4 h-4" />
                      Create New Version
                    </Button>
                    <Button
                      variant="outlined"
                      size="sm"
                      color="green"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleExportAsPDF}
                    >
                      <Download className="w-4 h-4" />
                      Export as PDF
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Legal Badge */}
            <Card className="shadow-xl border border-blue-gray-100 bg-gradient-to-br from-blue-500 to-blue-700">
              <CardBody className="text-center p-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scale className="w-8 h-8 text-white" />
                </div>
                <Typography
                  variant="h6"
                  color="white"
                  className="mb-2 font-bold"
                >
                  Legal Compliance
                </Typography>
                <Typography
                  variant="small"
                  className="text-blue-100 leading-relaxed"
                >
                  This document is legally binding and actively enforced across
                  your platform.
                </Typography>
              </CardBody>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border border-blue-gray-100">
              <CardBody className="p-0">
                <Tabs value={activeTab}>
                  <TabsHeader
                    className="bg-blue-gray-50 p-2"
                    indicatorProps={{
                      className: "bg-white shadow-md",
                    }}
                  >
                    <Tab
                      value="preview"
                      onClick={() => setActiveTab("preview")}
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>Preview</span>
                      </div>
                    </Tab>
                    <Tab value="raw" onClick={() => setActiveTab("raw")}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Raw Content</span>
                      </div>
                    </Tab>
                  </TabsHeader>
                  <TabsBody>
                    <TabPanel value="preview" className="p-8">
                      <div className="mb-6">
                        <Typography
                          variant="h3"
                          color="blue-gray"
                          className="mb-2 font-bold"
                        >
                          {termsData?.title || "Terms & Conditions"}
                        </Typography>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Chip
                            value={`Version ${termsData?.version || "N/A"}`}
                            size="sm"
                            variant="gradient"
                            color="blue"
                          />
                          <Typography
                            variant="small"
                            color="gray"
                            className="flex items-center gap-1"
                          >
                            <Clock className="w-4 h-4" />
                            Last updated:{" "}
                            {termsData?.updatedAt
                              ? new Date(
                                  termsData.updatedAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </Typography>
                        </div>
                      </div>
                      <div
                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
                        style={{
                          fontFamily: "system-ui, -apple-system, sans-serif",
                        }}
                      >
                        {termsData?.content || "No content available"}
                      </div>
                    </TabPanel>
                    <TabPanel value="raw" className="p-8">
                      <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
                        <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap break-words">
                          {termsData?.content || "No content available"}
                        </pre>
                      </div>
                    </TabPanel>
                  </TabsBody>
                </Tabs>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* View Full Document Dialog */}
        <Dialog
          open={openViewDialog}
          handler={handleCloseViewDialog}
          size="xl"
          className="shadow-2xl"
        >
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg p-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6" />
                <div>
                  <Typography variant="h4" color="white" className="font-bold">
                    {termsData?.title || "Terms & Conditions"}
                  </Typography>
                  <Typography variant="small" className="text-blue-100">
                    Version {termsData?.version || "N/A"}
                  </Typography>
                </div>
              </div>
              <IconButton
                color="white"
                size="sm"
                variant="text"
                onClick={handleCloseViewDialog}
                className="hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </IconButton>
            </div>
          </DialogHeader>
          <DialogBody className="overflow-y-auto max-h-[70vh] p-8">
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              {termsData?.content || "No content available"}
            </div>
          </DialogBody>
          <DialogFooter className="bg-blue-gray-50">
            <Button
              variant="gradient"
              color="blue"
              onClick={handleExportAsPDF}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export as PDF
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Enhanced Edit Dialog */}
        <Dialog
          open={openEditDialog}
          handler={handleCloseEditDialog}
          size="xxl"
          className="min-h-[90vh] shadow-2xl"
        >
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-lg p-6">
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center">
                <Pencil className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <Typography variant="h4" color="white" className="font-bold">
                  Edit Terms & Conditions
                </Typography>
                <Typography
                  variant="small"
                  className="text-blue-100 font-normal"
                >
                  Update your platform's legal terms
                </Typography>
              </div>
              <IconButton
                color="white"
                size="sm"
                variant="text"
                onClick={handleCloseEditDialog}
                className="hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </IconButton>
            </div>
          </DialogHeader>
          <DialogBody divider className="overflow-y-auto max-h-[60vh] p-6">
            {error && (
              <Alert
                color="red"
                icon={<AlertCircle className="w-6 h-6" />}
                className="mb-6"
              >
                <Typography variant="h6" className="mb-1 font-bold">
                  Error
                </Typography>
                <Typography variant="small">{error}</Typography>
              </Alert>
            )}

            {success && (
              <Alert
                color="green"
                icon={<CheckCircle className="w-6 h-6" />}
                className="mb-6"
              >
                <Typography variant="h6" className="mb-1 font-bold">
                  Success!
                </Typography>
                <Typography variant="small">{success}</Typography>
              </Alert>
            )}

            <div className="space-y-6">
              {/* Basic Information Section */}
              <div className="p-4 border border-blue-gray-100 rounded-lg">
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="mb-4 font-bold flex items-center gap-2"
                >
                  <Info className="w-5 h-5 text-blue-600" />
                  Basic Information
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Document Title"
                      name="title"
                      value={editForm.title}
                      onChange={handleInputChange}
                      size="lg"
                      icon={<FileText className="w-5 h-5" />}
                      error={!!formErrors.title}
                    />
                    {formErrors.title && (
                      <Typography
                        variant="small"
                        color="red"
                        className="mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.title}
                      </Typography>
                    )}
                  </div>
                  <div>
                    <Input
                      label="Version (e.g., 1.0.0)"
                      name="version"
                      value={editForm.version}
                      onChange={handleInputChange}
                      size="lg"
                      icon={<FileText className="w-5 h-5" />}
                      error={!!formErrors.version}
                    />
                    {formErrors.version && (
                      <Typography
                        variant="small"
                        color="red"
                        className="mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.version}
                      </Typography>
                    )}
                  </div>
                  <div>
                    <Input
                      label="Effective Date"
                      name="effectiveDate"
                      type="date"
                      value={editForm.effectiveDate}
                      onChange={handleInputChange}
                      size="lg"
                      icon={<Calendar className="w-5 h-5" />}
                      error={!!formErrors.effectiveDate}
                    />
                    {formErrors.effectiveDate && (
                      <Typography
                        variant="small"
                        color="red"
                        className="mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.effectiveDate}
                      </Typography>
                    )}
                  </div>
                  <div>
                    <Input
                      label="Last Modified By"
                      name="lastModifiedBy"
                      value={editForm.lastModifiedBy}
                      onChange={handleInputChange}
                      size="lg"
                      icon={<User className="w-5 h-5" />}
                      error={!!formErrors.lastModifiedBy}
                    />
                    {formErrors.lastModifiedBy && (
                      <Typography
                        variant="small"
                        color="red"
                        className="mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.lastModifiedBy}
                      </Typography>
                    )}
                  </div>
                </div>
              </div>

              {/* Changes Summary Section */}
              <div className="p-4 border border-blue-gray-100 rounded-lg">
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="mb-4 font-bold flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  Changes Summary
                </Typography>
                <Textarea
                  label="Describe the changes in this version"
                  name="changesSummary"
                  value={editForm.changesSummary}
                  onChange={handleInputChange}
                  rows={3}
                  className="text-base"
                />
              </div>

              {/* Content Section */}
              <div className="p-4 border border-blue-gray-100 rounded-lg">
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="mb-4 font-bold flex items-center gap-2"
                >
                  <Database className="w-5 h-5 text-blue-600" />
                  Document Content
                </Typography>
                <Textarea
                  label="Terms & Conditions Content"
                  name="content"
                  value={editForm.content}
                  onChange={handleInputChange}
                  rows={15}
                  className="font-mono text-sm"
                  error={!!formErrors.content}
                />
                {formErrors.content && (
                  <Typography
                    variant="small"
                    color="red"
                    className="mt-1 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.content}
                  </Typography>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <Typography
                    variant="small"
                    color="gray"
                    className="flex items-center gap-1"
                  >
                    <Info className="w-4 h-4" />
                    Use line breaks to format your content
                  </Typography>
                  <Typography variant="small" color="gray">
                    {getWordCount()} words • {getCharacterCount()} characters
                  </Typography>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="bg-blue-gray-50 gap-3 p-6">
            <Button
              variant="outlined"
              color="red"
              onClick={handleCloseEditDialog}
              size="lg"
              className="flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </Button>
            <Button
              variant="gradient"
              color="blue"
              onClick={handleOpenConfirmDialog}
              disabled={loading}
              size="lg"
              className="flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog
          open={openConfirmDialog}
          handler={handleCloseConfirmDialog}
          size="sm"
        >
          <DialogHeader className="bg-amber-50 border-b border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <Typography variant="h5" color="blue-gray">
                Confirm Changes
              </Typography>
            </div>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <Typography color="gray">
              You are about to update the Terms & Conditions document. This
              will:
            </Typography>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                Update to version <strong>{editForm.version}</strong>
              </li>
              <li>
                Set effective date to{" "}
                <strong>
                  {editForm.effectiveDate
                    ? new Date(editForm.effectiveDate).toLocaleDateString()
                    : "N/A"}
                </strong>
              </li>
              <li>Be visible to all users immediately</li>
            </ul>
            <Typography color="gray" className="font-semibold">
              Are you sure you want to proceed?
            </Typography>
          </DialogBody>
          <DialogFooter className="gap-3">
            <Button
              variant="outlined"
              color="gray"
              onClick={handleCloseConfirmDialog}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              color="blue"
              onClick={handleUpdateTerms}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm & Save
                </>
              )}
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </div>
  );
};

export default Terms;
