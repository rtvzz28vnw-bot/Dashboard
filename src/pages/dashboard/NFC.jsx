import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
  Tooltip,
  Input,
  Alert,
} from "@material-tailwind/react";
import {
  User,
  Mail,
  Briefcase,
  Eye,
  Calendar,
  Shield,
  Palette,
  Hash,
  FileText,
  Link as LinkIcon,
  MousePointerClick,
  CheckCircle,
  XCircle,
  Users as UsersIcon,
  Search,
  ExternalLink,
  RefreshCw,
  AlertCircle,
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

// Helper Component
function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <Icon className="w-4 h-4 text-blue-gray-400 mt-1 flex-shrink-0" />
      )}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <Typography variant="small" className="font-bold text-blue-gray-700">
          {label}
        </Typography>
        {typeof value === "string" ? (
          <Typography color="gray" className="text-sm break-words">
            {value || "-"}
          </Typography>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

// Profile Card Component for Mobile View
const ProfileCard = ({ profile, onView }) => {
  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow">
      <CardBody className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar
            src={profile.avatarUrl}
            alt={profile.name}
            size="md"
            variant="circular"
            className="ring-2 ring-blue-gray-100 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <Typography
              variant="h6"
              color="blue-gray"
              className="font-bold truncate"
            >
              {profile.name}
            </Typography>
            <Typography variant="small" color="gray" className="truncate">
              {profile.title || "No title"}
            </Typography>
          </div>
          <Chip
            variant="ghost"
            color={profile.isActive ? "green" : "red"}
            value={profile.isActive ? "Active" : "Disabled"}
            size="sm"
            icon={
              profile.isActive ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )
            }
            className="flex-shrink-0"
          />
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-gray-400 flex-shrink-0" />
            <Typography variant="small" className="text-blue-gray-700 truncate">
              {profile.user?.email || "N/A"}
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-gray-400 flex-shrink-0" />
            <Typography variant="small" className="text-blue-gray-700">
              {profile.viewCount} views
            </Typography>
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Chip
            value={profile.profileType}
            variant="gradient"
            color={profile.profileType === "personal" ? "blue" : "purple"}
            size="sm"
            className="capitalize"
            icon={<Briefcase className="w-3 h-3" />}
          />
          <Chip
            value={new Date(profile.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            variant="ghost"
            size="sm"
            icon={<Calendar className="w-3 h-3" />}
          />
        </div>

        {/* Action */}
        <Button
          size="sm"
          variant="gradient"
          color="blue"
          onClick={() => onView(profile)}
          className="w-full flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          View Details
        </Button>
      </CardBody>
    </Card>
  );
};

// Main Component
export function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
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
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      const res = await fetch(`${API_URL}/api/admin/dashboard/profiles/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setProfiles(data.data || []);
    } catch (err) {
      console.error("Error fetching profiles", err);
      setError(err.message || "Failed to load profiles. Please try again.");
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (profile = null) => {
    setSelected(profile);
    setOpen(!open);
  };

  const handleRetry = () => {
    setError(null);
    fetchProfiles();
  };

  const handleViewPublicProfile = () => {
    if (selected?.slug) {
      window.open(`${window.location.origin}/${selected.slug}`, "_blank");
    }
  };

  // Memoized filtered profiles
  const filteredProfiles = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return profiles;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    return profiles.filter(
      (profile) =>
        profile.name?.toLowerCase().includes(searchLower) ||
        profile.user?.email?.toLowerCase().includes(searchLower) ||
        profile.title?.toLowerCase().includes(searchLower) ||
        profile.profileType?.toLowerCase().includes(searchLower) ||
        profile.slug?.toLowerCase().includes(searchLower)
    );
  }, [profiles, debouncedSearchTerm]);

  // Loading state
  if (loading && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <Typography variant="h6" color="blue-gray">
          Loading profiles...
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
              <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <div>
                <Typography
                  variant="h5"
                  color="white"
                  className="font-bold text-lg sm:text-xl"
                >
                  Profiles Management
                </Typography>
                <Typography
                  variant="small"
                  color="white"
                  className="font-normal opacity-80 hidden sm:block"
                >
                  View and manage all user profiles
                </Typography>
              </div>
            </div>
            <Chip
              value={`${filteredProfiles.length} profiles`}
              variant="gradient"
              color="white"
              size="sm"
              className="font-semibold"
            />
          </div>
        </CardHeader>

        <CardBody className="px-2 sm:px-6 pt-0 pb-4">
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
                    Error Loading Profiles
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
                label="Search profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="lg"
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            {searchTerm && (
              <Typography variant="small" color="gray" className="mt-2">
                {filteredProfiles.length} result
                {filteredProfiles.length !== 1 ? "s" : ""} found
              </Typography>
            )}
          </div>

          {/* Content */}
          {filteredProfiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <UsersIcon className="w-16 h-16 text-blue-gray-300 mb-4" />
              <Typography variant="h6" color="blue-gray" className="mb-2">
                No profiles found
              </Typography>
              <Typography
                variant="small"
                color="gray"
                className="text-center px-4"
              >
                {searchTerm
                  ? "Try a different search term"
                  : "No profiles available yet"}
              </Typography>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden">
                {filteredProfiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onView={handleOpen}
                  />
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[800px] table-auto">
                  <thead>
                    <tr>
                      {[
                        { label: "Avatar", icon: User },
                        { label: "Name", icon: User },
                        { label: "Email", icon: Mail },
                        { label: "Profile Type", icon: Briefcase },
                        { label: "Title", icon: FileText },
                        { label: "Views", icon: Eye },
                        { label: "Status", icon: CheckCircle },
                        { label: "Created", icon: Calendar },
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
                    {filteredProfiles.map((p, index) => {
                      const className = `py-4 px-5 ${
                        index === filteredProfiles.length - 1
                          ? ""
                          : "border-b border-blue-gray-50"
                      }`;

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-blue-gray-50/50 transition-colors"
                        >
                          <td className={className}>
                            <Avatar
                              src={p.avatarUrl}
                              alt={p.name}
                              size="md"
                              variant="circular"
                              className="ring-2 ring-blue-gray-100"
                            />
                          </td>

                          <td className={className}>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-semibold"
                            >
                              {p.name}
                            </Typography>
                          </td>

                          <td className={className}>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-blue-gray-400" />
                              <Typography className="text-xs font-medium text-blue-gray-700">
                                {p.user?.email || "N/A"}
                              </Typography>
                            </div>
                          </td>

                          <td className={className}>
                            <Chip
                              value={p.profileType}
                              variant="gradient"
                              color={
                                p.profileType === "personal" ? "blue" : "purple"
                              }
                              className="py-1 px-3 text-xs w-fit capitalize"
                              icon={<Briefcase className="w-3 h-3" />}
                            />
                          </td>

                          <td className={className}>
                            <Typography className="text-xs text-blue-gray-600">
                              {p.title || "N/A"}
                            </Typography>
                          </td>

                          <td className={className}>
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-blue-gray-400" />
                              <Typography className="text-xs font-semibold text-blue-gray-700">
                                {p.viewCount || 0}
                              </Typography>
                            </div>
                          </td>

                          <td className={className}>
                            <Chip
                              variant="ghost"
                              color={p.isActive ? "green" : "red"}
                              value={p.isActive ? "Active" : "Disabled"}
                              className="py-1 px-3 text-xs w-fit"
                              icon={
                                p.isActive ? (
                                  <CheckCircle className="w-3 h-3" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )
                              }
                            />
                          </td>

                          <td className={className}>
                            <Chip
                              value={new Date(p.createdAt).toLocaleDateString(
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
                            <Tooltip content="View Profile Details">
                              <IconButton
                                size="sm"
                                variant="gradient"
                                color="blue"
                                onClick={() => handleOpen(p)}
                                className="rounded-lg hover:shadow-lg transition-shadow"
                              >
                                <Eye className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>
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

      {/* View Dialog */}
      <Dialog
        size="xl"
        open={open}
        handler={() => handleOpen(null)}
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
              Profile Details
            </Typography>
            <Typography variant="small" color="gray" className="font-normal">
              Full profile information including user & social links
            </Typography>
          </div>
        </DialogHeader>

        <DialogBody className="max-h-[70vh] overflow-y-auto p-4 sm:p-6">
          {selected && (
            <div className="space-y-4 sm:space-y-6">
              {/* Basic Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 bg-blue-gray-50 rounded-lg">
                <Avatar
                  src={selected.avatarUrl}
                  alt={selected.name}
                  size="xl"
                  variant="circular"
                  className="ring-4 ring-blue-500 shadow-lg"
                />
                <div className="flex-1 text-center sm:text-left">
                  <Typography
                    variant="h5"
                    className="font-bold text-blue-gray-800"
                  >
                    {selected.name}
                  </Typography>
                  <Typography color="gray" className="text-sm mb-2">
                    {selected.title || "No title"}
                  </Typography>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <Chip
                      value={selected.profileType}
                      variant="gradient"
                      color={
                        selected.profileType === "personal" ? "blue" : "purple"
                      }
                      size="sm"
                      className="capitalize"
                    />
                    <Chip
                      variant="ghost"
                      color={selected.isActive ? "green" : "red"}
                      value={selected.isActive ? "Active" : "Disabled"}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Data */}
              <div className="p-4 border border-blue-gray-100 rounded-lg">
                <Typography
                  variant="small"
                  className="font-bold uppercase text-blue-gray-600 flex items-center gap-2 mb-4"
                >
                  <FileText className="w-4 h-4" />
                  Profile Information
                </Typography>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem icon={Hash} label="Slug" value={selected.slug} />
                  <InfoItem
                    icon={Palette}
                    label="Design Mode"
                    value={selected.designMode || "N/A"}
                  />
                  <InfoItem
                    icon={FileText}
                    label="Template"
                    value={selected.template || "N/A"}
                  />
                  <InfoItem
                    icon={Palette}
                    label="Color"
                    value={
                      selected.color ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border-2 border-gray-300"
                            style={{ backgroundColor: selected.color }}
                          />
                          <span className="font-mono text-sm">
                            {selected.color}
                          </span>
                        </div>
                      ) : (
                        "N/A"
                      )
                    }
                  />
                  <InfoItem
                    icon={Eye}
                    label="Total Views"
                    value={
                      <span className="font-bold text-blue-600">
                        {selected.viewCount || 0}
                      </span>
                    }
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Created"
                    value={new Date(selected.createdAt).toLocaleString()}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="p-4 border border-blue-gray-100 rounded-lg">
                <Typography
                  variant="small"
                  className="font-bold uppercase text-blue-gray-600 flex items-center gap-2 mb-3"
                >
                  <FileText className="w-4 h-4" />
                  Biography
                </Typography>
                <Typography
                  color="gray"
                  className="leading-relaxed break-words"
                >
                  {selected.bio || "No biography provided"}
                </Typography>
              </div>

              {/* User Data */}
              {selected.user && (
                <div className="p-4 border border-blue-gray-100 rounded-lg">
                  <Typography
                    variant="small"
                    className="font-bold uppercase text-blue-gray-600 flex items-center gap-2 mb-4"
                  >
                    <User className="w-4 h-4" />
                    User Information
                  </Typography>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem
                      icon={User}
                      label="First Name"
                      value={selected.user.firstName || "N/A"}
                    />
                    <InfoItem
                      icon={User}
                      label="Last Name"
                      value={selected.user.lastName || "N/A"}
                    />
                    <InfoItem
                      icon={Mail}
                      label="Email"
                      value={selected.user.email || "N/A"}
                    />
                    <InfoItem
                      icon={Shield}
                      label="Role"
                      value={
                        <Chip
                          value={selected.user.role || "user"}
                          variant="gradient"
                          color={
                            selected.user.role === "admin"
                              ? "red"
                              : selected.user.role === "business"
                              ? "blue"
                              : "green"
                          }
                          size="sm"
                          className="capitalize w-fit"
                        />
                      }
                    />
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div className="p-4 border border-blue-gray-100 rounded-lg">
                <Typography
                  variant="small"
                  className="font-bold uppercase text-blue-gray-600 flex items-center gap-2 mb-4"
                >
                  <LinkIcon className="w-4 h-4" />
                  Social Links ({selected.socialLinks?.length || 0})
                </Typography>

                {!selected.socialLinks || selected.socialLinks.length === 0 ? (
                  <div className="text-center py-8">
                    <LinkIcon className="w-12 h-12 text-blue-gray-300 mx-auto mb-3" />
                    <Typography color="gray" variant="small">
                      No social links added yet
                    </Typography>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selected.socialLinks.map((s) => (
                      <div
                        key={s.id}
                        className="border-2 border-blue-gray-100 p-4 rounded-lg bg-white hover:bg-blue-gray-50 hover:border-blue-500 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <Typography
                            variant="small"
                            className="font-semibold text-blue-gray-800 flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="truncate">{s.platform}</span>
                          </Typography>
                          <Chip
                            variant="ghost"
                            color={s.isVisible ? "green" : "red"}
                            value={s.isVisible ? "Visible" : "Hidden"}
                            size="sm"
                            className="text-xs flex-shrink-0"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-3 h-3 text-blue-gray-400 flex-shrink-0" />
                            <a
                              href={
                                s.url?.startsWith("http")
                                  ? s.url
                                  : `https://${s.url}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline truncate flex-1"
                            >
                              {s.url}
                            </a>
                          </div>

                          <div className="flex items-center gap-2">
                            <MousePointerClick className="w-3 h-3 text-blue-gray-400 flex-shrink-0" />
                            <Typography color="gray" className="text-xs">
                              <span className="font-semibold">
                                {s.clickCount || 0}
                              </span>{" "}
                              clicks
                            </Typography>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter className="gap-2 sm:gap-3 p-4 sm:p-6">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => handleOpen(null)}
            className="flex-1 sm:flex-initial"
          >
            Close
          </Button>
          <Button
            variant="gradient"
            color="blue"
            className="flex items-center gap-2 flex-1 sm:flex-initial"
            onClick={handleViewPublicProfile}
            disabled={!selected?.slug}
          >
            <ExternalLink className="w-4 h-4" />
            View Public Profile
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Profiles;
