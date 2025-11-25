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
  PencilIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  CalendarDaysIcon,
  SparklesIcon,
  LockClosedIcon,
  InformationCircleIcon,
  KeyIcon,
  FingerPrintIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  ClockIcon as ClockSolidIcon,
  ShieldCheckIcon as ShieldCheckSolidIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";

const Privacy = () => {
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    version: "",
    effectiveDate: "",
    lastModifiedBy: "",
    changesSummary: "",
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/privacy-policy`);

      if (response.data.success) {
        setPolicyData(response.data.data);
        setEditForm({
          title: response.data.data.title || "",
          content: response.data.data.content || "",
          version: response.data.data.version || "",
          effectiveDate: response.data.data.effectiveDate
            ? new Date(response.data.data.effectiveDate)
                .toISOString()
                .split("T")[0]
            : "",
          lastModifiedBy: response.data.data.lastModifiedBy || "",
          changesSummary: response.data.data.changesSummary || "",
        });
      }
    } catch (err) {
      console.error("Error fetching privacy policy:", err);
      setError(err.response?.data?.message || "Failed to load privacy policy");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdatePolicy = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await axios.put(
        `${API_URL}/api/privacy-policy/${policyData.id}`,
        {
          ...editForm,
          effectiveDate: editForm.effectiveDate
            ? new Date(editForm.effectiveDate).toISOString()
            : undefined,
        }
      );

      if (response.data.success) {
        setSuccess("Privacy Policy updated successfully!");
        setPolicyData(response.data.data);
        setTimeout(() => {
          handleCloseEditDialog();
          fetchPrivacyPolicy();
        }, 1500);
      }
    } catch (err) {
      console.error("Error updating privacy policy:", err);
      setError(
        err.response?.data?.message || "Failed to update privacy policy"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !policyData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Card className="w-96 shadow-2xl">
          <CardBody className="text-center p-10">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <ArrowPathIcon className="w-10 h-10 text-white animate-spin" />
              </div>
            </div>
            <Typography variant="h5" color="blue-gray" className="mb-2">
              Loading Privacy Policy
            </Typography>
            <Typography variant="small" color="gray" className="font-normal">
              Please wait while we retrieve the document...
            </Typography>
            <Progress value={70} color="indigo" className="mt-4" />
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <Card className="overflow-hidden shadow-xl border border-indigo-100">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-600 p-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg">
                    <ShieldCheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <Typography variant="h2" color="white" className="mb-1">
                      Privacy Policy
                    </Typography>
                    <Typography
                      variant="paragraph"
                      className="text-purple-100 font-normal"
                    >
                      Manage how you collect, use, and protect user data
                    </Typography>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Tooltip content="View document">
                    <IconButton
                      size="lg"
                      className="bg-white/20 backdrop-blur-lg hover:bg-white/30"
                    >
                      <EyeIcon className="w-5 h-5 text-white" />
                    </IconButton>
                  </Tooltip>
                  <Button
                    size="lg"
                    className="flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg"
                    onClick={handleOpenEditDialog}
                    disabled={loading || !policyData}
                  >
                    <PencilIcon className="w-5 h-5" />
                    Edit Policy
                  </Button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <Typography variant="small" className="text-purple-100 mb-1">
                    Version
                  </Typography>
                  <Typography variant="h4" color="white">
                    {policyData?.version || "N/A"}
                  </Typography>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <Typography variant="small" className="text-purple-100 mb-1">
                    Status
                  </Typography>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        policyData?.isActive ? "bg-green-400" : "bg-gray-400"
                      } animate-pulse`}
                    ></div>
                    <Typography variant="h6" color="white">
                      {policyData?.isActive ? "Active" : "Inactive"}
                    </Typography>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <Typography variant="small" className="text-purple-100 mb-1">
                    Last Updated
                  </Typography>
                  <Typography variant="h6" color="white">
                    {policyData?.updatedAt
                      ? new Date(policyData.updatedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )
                      : "N/A"}
                  </Typography>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <Typography variant="small" className="text-purple-100 mb-1">
                    Content Size
                  </Typography>
                  <Typography variant="h6" color="white">
                    {policyData?.content
                      ? `${Math.ceil(policyData.content.length / 1000)}KB`
                      : "0KB"}
                  </Typography>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            color="red"
            icon={<ExclamationCircleIcon className="w-6 h-6" />}
            className="mb-6 shadow-lg border border-red-200"
            dismissible={{
              onClose: () => setError(null),
            }}
          >
            <Typography variant="h6" className="mb-1">
              Error Occurred
            </Typography>
            <Typography variant="small">{error}</Typography>
          </Alert>
        )}

        {success && (
          <Alert
            color="green"
            icon={<CheckCircleIcon className="w-6 h-6" />}
            className="mb-6 shadow-lg border border-green-200"
            dismissible={{
              onClose: () => setSuccess(null),
            }}
          >
            <Typography variant="h6" className="mb-1">
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
            <Card className="shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <CardHeader
                floated={false}
                className="h-auto bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md"
              >
                <div className="p-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center">
                    <InformationCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <Typography variant="h5" color="white">
                      Policy Info
                    </Typography>
                    <Typography variant="small" className="text-purple-100">
                      Current version details
                    </Typography>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Version Badge */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <DocumentDuplicateIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        color="gray"
                        className="font-medium"
                      >
                        Version
                      </Typography>
                      <Typography variant="h6" color="blue-gray">
                        {policyData?.version || "N/A"}
                      </Typography>
                    </div>
                  </div>
                  <Chip
                    value="Current"
                    size="sm"
                    className="bg-indigo-500"
                    icon={<CheckCircleSolidIcon className="w-4 h-4" />}
                  />
                </div>

                {/* Status */}
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <Typography
                      variant="small"
                      color="gray"
                      className="font-medium"
                    >
                      Policy Status
                    </Typography>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        policyData?.isActive ? "bg-green-500" : "bg-gray-400"
                      } animate-pulse`}
                    ></div>
                  </div>
                  <Chip
                    value={
                      policyData?.isActive ? "Active & Published" : "Inactive"
                    }
                    color={policyData?.isActive ? "green" : "gray"}
                    className="w-full justify-center"
                    icon={<CheckCircleSolidIcon />}
                  />
                </div>

                {/* Timeline */}
                <div>
                  <Typography
                    variant="small"
                    color="gray"
                    className="font-semibold mb-3 flex items-center gap-2"
                  >
                    <ClockIcon className="w-4 h-4" />
                    Document Timeline
                  </Typography>
                  <Timeline>
                    <TimelineItem>
                      <TimelineConnector />
                      <TimelineHeader className="h-3">
                        <TimelineIcon className="p-2 bg-indigo-500">
                          <CalendarDaysIcon className="w-3 h-3 text-white" />
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
                          {policyData?.effectiveDate
                            ? new Date(
                                policyData.effectiveDate
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
                          <ClockSolidIcon className="w-3 h-3 text-white" />
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
                          {policyData?.updatedAt
                            ? new Date(policyData.updatedAt).toLocaleDateString(
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
                    {policyData?.lastModifiedBy && (
                      <TimelineItem>
                        <TimelineHeader className="h-3">
                          <TimelineIcon className="p-2 bg-purple-500">
                            <UserCircleIcon className="w-3 h-3 text-white" />
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
                            {policyData.lastModifiedBy}
                          </Typography>
                        </TimelineBody>
                      </TimelineItem>
                    )}
                  </Timeline>
                </div>

                {/* Changes Summary */}
                {policyData?.changesSummary && (
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                      <SparklesIcon className="w-4 h-4 text-amber-600" />
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
                      {policyData.changesSummary}
                    </Typography>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <Typography
                    variant="small"
                    color="gray"
                    className="font-semibold mb-3"
                  >
                    Quick Actions
                  </Typography>
                  <div className="space-y-2">
                    <Button
                      variant="outlined"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleOpenEditDialog}
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit Document
                    </Button>
                    <Button
                      variant="outlined"
                      size="sm"
                      color="green"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                      Create New Version
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Privacy Features Card */}
            <Card className="shadow-xl border border-gray-100">
              <CardBody className="p-6">
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Privacy Commitment
                </Typography>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <LockClosedIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        Encrypted Storage
                      </Typography>
                      <Typography variant="small" color="gray">
                        All data encrypted at rest
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <KeyIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        User Control
                      </Typography>
                      <Typography variant="small" color="gray">
                        Full data access rights
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FingerPrintIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        GDPR Compliant
                      </Typography>
                      <Typography variant="small" color="gray">
                        Meets global standards
                      </Typography>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Security Badge */}
            <Card className="shadow-xl border border-gray-100 bg-gradient-to-br from-indigo-500 to-purple-600">
              <CardBody className="text-center p-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckSolidIcon className="w-8 h-8 text-white" />
                </div>
                <Typography variant="h6" color="white" className="mb-2">
                  Privacy Protected
                </Typography>
                <Typography
                  variant="small"
                  className="text-purple-100 leading-relaxed"
                >
                  Your users' data is protected with enterprise-grade security
                  measures.
                </Typography>
              </CardBody>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border border-gray-100">
              <CardBody className="p-0">
                <Tabs value={activeTab}>
                  <TabsHeader
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 p-2"
                    indicatorProps={{
                      className: "bg-white shadow-md",
                    }}
                  >
                    <Tab
                      value="preview"
                      onClick={() => setActiveTab("preview")}
                    >
                      <div className="flex items-center gap-2">
                        <EyeIcon className="w-4 h-4" />
                        <span>Preview</span>
                      </div>
                    </Tab>
                    <Tab value="raw" onClick={() => setActiveTab("raw")}>
                      <div className="flex items-center gap-2">
                        <DocumentDuplicateIcon className="w-4 h-4" />
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
                          className="mb-2"
                        >
                          {policyData?.title || "Privacy Policy"}
                        </Typography>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Chip
                            value={`Version ${policyData?.version || "N/A"}`}
                            size="sm"
                            className="bg-indigo-100 text-indigo-900"
                          />
                          <Typography variant="small" color="gray">
                            Last updated:{" "}
                            {policyData?.updatedAt
                              ? new Date(
                                  policyData.updatedAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </Typography>
                        </div>
                      </div>
                      <div
                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                        style={{
                          fontFamily: "system-ui, -apple-system, sans-serif",
                        }}
                        dangerouslySetInnerHTML={{
                          __html:
                            policyData?.content?.replace(/\n/g, "<br />") || "",
                        }}
                      />
                    </TabPanel>
                    <TabPanel value="raw" className="p-8">
                      <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
                        <pre className="text-green-400 text-sm font-mono">
                          {policyData?.content || "No content available"}
                        </pre>
                      </div>
                    </TabPanel>
                  </TabsBody>
                </Tabs>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Enhanced Edit Dialog */}
        <Dialog
          open={openEditDialog}
          handler={handleCloseEditDialog}
          size="xxl"
          className="min-h-[90vh]"
        >
          <DialogHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center">
                <PencilIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <Typography variant="h4" color="white">
                  Edit Privacy Policy
                </Typography>
                <Typography
                  variant="small"
                  className="text-purple-100 font-normal"
                >
                  Update your platform's privacy policy
                </Typography>
              </div>
              <IconButton
                color="white"
                size="sm"
                variant="text"
                onClick={handleCloseEditDialog}
                className="hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </IconButton>
            </div>
          </DialogHeader>
          <DialogBody divider className="overflow-y-auto max-h-[60vh] p-6">
            {error && (
              <Alert
                color="red"
                icon={<ExclamationCircleIcon className="w-6 h-6" />}
                className="mb-6"
              >
                <Typography variant="h6" className="mb-1">
                  Error
                </Typography>
                <Typography variant="small">{error}</Typography>
              </Alert>
            )}

            {success && (
              <Alert
                color="green"
                icon={<CheckCircleIcon className="w-6 h-6" />}
                className="mb-6"
              >
                <Typography variant="h6" className="mb-1">
                  Success!
                </Typography>
                <Typography variant="small">{success}</Typography>
              </Alert>
            )}

            <div className="space-y-6">
              {/* Basic Information Section */}
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Basic Information
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Policy Title"
                    name="title"
                    value={editForm.title}
                    onChange={handleInputChange}
                    size="lg"
                    icon={<ShieldCheckIcon className="w-5 h-5" />}
                  />
                  <Input
                    label="Version (e.g., 1.0.0)"
                    name="version"
                    value={editForm.version}
                    onChange={handleInputChange}
                    size="lg"
                    icon={<DocumentDuplicateIcon className="w-5 h-5" />}
                  />
                  <Input
                    label="Effective Date"
                    name="effectiveDate"
                    type="date"
                    value={editForm.effectiveDate}
                    onChange={handleInputChange}
                    size="lg"
                    icon={<CalendarDaysIcon className="w-5 h-5" />}
                  />
                  <Input
                    label="Last Modified By"
                    name="lastModifiedBy"
                    value={editForm.lastModifiedBy}
                    onChange={handleInputChange}
                    size="lg"
                    icon={<UserCircleIcon className="w-5 h-5" />}
                  />
                </div>
              </div>

              {/* Changes Summary Section */}
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-4">
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
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Policy Content
                </Typography>
                <Textarea
                  label="Privacy Policy Content"
                  name="content"
                  value={editForm.content}
                  onChange={handleInputChange}
                  rows={15}
                  className="font-mono text-sm"
                />
                <Typography
                  variant="small"
                  color="gray"
                  className="mt-2 flex items-center gap-1"
                >
                  <InformationCircleIcon className="w-4 h-4" />
                  Use line breaks to format your content. HTML formatting is
                  supported.
                </Typography>
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="bg-gray-50 gap-3">
            <Button
              variant="text"
              color="red"
              onClick={handleCloseEditDialog}
              size="lg"
            >
              Cancel
            </Button>
            <Button
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
              onClick={handleUpdatePolicy}
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </div>
  );
};

export default Privacy;
