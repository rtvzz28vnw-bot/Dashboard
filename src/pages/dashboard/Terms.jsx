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
  Avatar,
  Progress,
} from "@material-tailwind/react";
import {
  PencilIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  ClockIcon as ClockSolidIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";

const Terms = () => {
  const [termsData, setTermsData] = useState(null);
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
    fetchTermsAndConditions();
  }, []);

  const fetchTermsAndConditions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/terms`);

      if (response.data.success) {
        setTermsData(response.data.data);
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
      console.error("Error fetching terms:", err);
      setError(
        err.response?.data?.message || "Failed to load terms and conditions"
      );
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

  const handleUpdateTerms = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await axios.put(`${API_URL}/api/terms/${termsData.id}`, {
        ...editForm,
        effectiveDate: editForm.effectiveDate
          ? new Date(editForm.effectiveDate).toISOString()
          : undefined,
      });

      if (response.data.success) {
        setSuccess("Terms & Conditions updated successfully!");
        setTermsData(response.data.data);
        setTimeout(() => {
          handleCloseEditDialog();
          fetchTermsAndConditions();
        }, 1500);
      }
    } catch (err) {
      console.error("Error updating terms:", err);
      setError(
        err.response?.data?.message || "Failed to update terms and conditions"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !termsData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="w-96 shadow-2xl">
          <CardBody className="text-center p-10">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <ArrowPathIcon className="w-10 h-10 text-white animate-spin" />
              </div>
            </div>
            <Typography variant="h5" color="blue-gray" className="mb-2">
              Loading Terms & Conditions
            </Typography>
            <Typography variant="small" color="gray" className="font-normal">
              Please wait while we retrieve the document...
            </Typography>
            <Progress value={70} color="blue" className="mt-4" />
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <Card className="overflow-hidden shadow-xl border border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 p-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg">
                    <DocumentTextIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <Typography variant="h2" color="white" className="mb-1">
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
                    className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                    onClick={handleOpenEditDialog}
                    disabled={loading || !termsData}
                  >
                    <PencilIcon className="w-5 h-5" />
                    Edit Terms
                  </Button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <Typography variant="small" className="text-blue-100 mb-1">
                    Version
                  </Typography>
                  <Typography variant="h4" color="white">
                    {termsData?.version || "N/A"}
                  </Typography>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <Typography variant="small" className="text-blue-100 mb-1">
                    Status
                  </Typography>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        termsData?.isActive ? "bg-green-400" : "bg-gray-400"
                      } animate-pulse`}
                    ></div>
                    <Typography variant="h6" color="white">
                      {termsData?.isActive ? "Active" : "Inactive"}
                    </Typography>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <Typography variant="small" className="text-blue-100 mb-1">
                    Last Updated
                  </Typography>
                  <Typography variant="h6" color="white">
                    {termsData?.updatedAt
                      ? new Date(termsData.updatedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )
                      : "N/A"}
                  </Typography>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <Typography variant="small" className="text-blue-100 mb-1">
                    Content Size
                  </Typography>
                  <Typography variant="h6" color="white">
                    {termsData?.content
                      ? `${Math.ceil(termsData.content.length / 1000)}KB`
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
                className="h-auto bg-gradient-to-br from-blue-500 to-blue-600 shadow-md"
              >
                <div className="p-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center">
                    <InformationCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <Typography variant="h5" color="white">
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
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DocumentDuplicateIcon className="w-5 h-5 text-blue-600" />
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
                        {termsData?.version || "N/A"}
                      </Typography>
                    </div>
                  </div>
                  <Chip
                    value="Current"
                    size="sm"
                    className="bg-blue-500"
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
                        <TimelineIcon className="p-2 bg-blue-500">
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
                            {termsData.lastModifiedBy}
                          </Typography>
                        </TimelineBody>
                      </TimelineItem>
                    )}
                  </Timeline>
                </div>

                {/* Changes Summary */}
                {termsData?.changesSummary && (
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
                      {termsData.changesSummary}
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

            {/* Security Badge */}
            <Card className="shadow-xl border border-gray-100">
              <CardBody className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                </div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Legal Compliance
                </Typography>
                <Typography
                  variant="small"
                  color="gray"
                  className="leading-relaxed"
                >
                  This document is legally binding and actively enforced across
                  your platform.
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
                    className="bg-gradient-to-r from-blue-50 to-purple-50 p-2"
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
                        <DocumentTextIcon className="w-4 h-4" />
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
                          {termsData?.title || "Terms & Conditions"}
                        </Typography>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Chip
                            value={`Version ${termsData?.version || "N/A"}`}
                            size="sm"
                            className="bg-blue-100 text-blue-900"
                          />
                          <Typography variant="small" color="gray">
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
                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                        style={{
                          fontFamily: "system-ui, -apple-system, sans-serif",
                        }}
                        dangerouslySetInnerHTML={{
                          __html:
                            termsData?.content?.replace(/\n/g, "<br />") || "",
                        }}
                      />
                    </TabPanel>
                    <TabPanel value="raw" className="p-8">
                      <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
                        <pre className="text-green-400 text-sm font-mono">
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

        {/* Enhanced Edit Dialog */}
        <Dialog
          open={openEditDialog}
          handler={handleCloseEditDialog}
          size="xxl"
          className="min-h-[90vh]"
        >
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center">
                <PencilIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <Typography variant="h4" color="white">
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
                    label="Document Title"
                    name="title"
                    value={editForm.title}
                    onChange={handleInputChange}
                    size="lg"
                    icon={<DocumentTextIcon className="w-5 h-5" />}
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
                  Document Content
                </Typography>
                <Textarea
                  label="Terms & Conditions Content"
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
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
              onClick={handleUpdateTerms}
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

export default Terms;
