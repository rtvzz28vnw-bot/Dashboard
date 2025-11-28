import React, { useEffect, useState } from "react";
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
  Filter,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

export function Tables() {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleOpen = (profile = null) => {
    setSelected(profile);
    setOpen(!open);
  };

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/admin/dashboard/profiles/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setProfiles(data.data || []);
        setFilteredProfiles(data.data || []);
      } catch (err) {
        console.error("Error fetching profiles", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredProfiles(profiles);
      return;
    }

    const filtered = profiles.filter(
      (profile) =>
        profile.name.toLowerCase().includes(value.toLowerCase()) ||
        profile.user?.email.toLowerCase().includes(value.toLowerCase()) ||
        profile.title?.toLowerCase().includes(value.toLowerCase()) ||
        profile.profileType.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProfiles(filtered);
  };

  if (loading) {
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
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card className="shadow-xl">
        <CardHeader
          variant="gradient"
          color="blue"
          className="mb-8 p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UsersIcon className="w-6 h-6 text-white" />
              <Typography variant="h5" color="white" className="font-bold">
                Profiles Management
              </Typography>
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

        {/* Search Bar */}
        <div className="px-6 mb-6">
          <div className="relative flex w-full max-w-md">
            <Input
              type="text"
              label="Search profiles..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-20"
              size="lg"
              icon={<Search className="w-5 h-5" />}
            />
          </div>
        </div>

        <CardBody className="overflow-x-auto px-0 pt-0 pb-4">
          {filteredProfiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <UsersIcon className="w-16 h-16 text-blue-gray-300 mb-4" />
              <Typography variant="h6" color="blue-gray" className="mb-2">
                No profiles found
              </Typography>
              <Typography variant="small" color="gray">
                {searchTerm
                  ? "Try a different search term"
                  : "No profiles available yet"}
              </Typography>
            </div>
          ) : (
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
                      {/* Avatar */}
                      <td className={className}>
                        <Avatar
                          src={p.avatarUrl}
                          alt={p.name}
                          size="md"
                          variant="circular"
                          className="ring-2 ring-blue-gray-100"
                        />
                      </td>

                      {/* Name */}
                      <td className={className}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {p.name}
                        </Typography>
                      </td>

                      {/* Email */}
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-gray-400" />
                          <Typography className="text-xs font-medium text-blue-gray-700">
                            {p.user?.email}
                          </Typography>
                        </div>
                      </td>

                      {/* Profile Type */}
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

                      {/* Title */}
                      <td className={className}>
                        <Typography className="text-xs text-blue-gray-600">
                          {p.title || "N/A"}
                        </Typography>
                      </td>

                      {/* Views */}
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-gray-400" />
                          <Typography className="text-xs font-semibold text-blue-gray-700">
                            {p.viewCount}
                          </Typography>
                        </div>
                      </td>

                      {/* Status */}
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

                      {/* Created At */}
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

                      {/* Actions */}
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
          )}
        </CardBody>
      </Card>

      {/* ========================= VIEW DIALOG ========================= */}
      <Dialog
        size="xl"
        open={open}
        handler={() => handleOpen(null)}
        className="shadow-2xl"
      >
        <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <Typography variant="h5" color="blue-gray">
              Profile Details
            </Typography>
            <Typography variant="small" color="gray" className="font-normal">
              Full profile information including user & social links
            </Typography>
          </div>
        </DialogHeader>

        <DialogBody className="max-h-[75vh] overflow-y-auto p-6">
          {selected && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-center gap-6 p-4 bg-blue-gray-50 rounded-lg">
                <Avatar
                  src={selected.avatarUrl}
                  alt={selected.name}
                  size="xl"
                  variant="circular"
                  className="ring-4 ring-blue-500 shadow-lg"
                />
                <div className="flex-1">
                  <Typography
                    variant="h5"
                    className="font-bold text-blue-gray-800"
                  >
                    {selected.name}
                  </Typography>
                  <Typography color="gray" className="text-sm mb-2">
                    {selected.title || "No title"}
                  </Typography>
                  <div className="flex gap-2">
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
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem icon={Hash} label="Slug" value={selected.slug} />
                  <InfoItem
                    icon={Palette}
                    label="Design Mode"
                    value={selected.designMode}
                  />
                  <InfoItem
                    icon={FileText}
                    label="Template"
                    value={selected.template}
                  />
                  <InfoItem
                    icon={Palette}
                    label="Color"
                    value={
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border-2 border-gray-300"
                          style={{ backgroundColor: selected.color }}
                        />
                        <span className="font-mono text-sm">
                          {selected.color}
                        </span>
                      </div>
                    }
                  />
                  <InfoItem
                    icon={Eye}
                    label="Total Views"
                    value={
                      <span className="font-bold text-blue-600">
                        {selected.viewCount}
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
                <Typography color="gray" className="leading-relaxed">
                  {selected.bio || "No biography provided"}
                </Typography>
              </div>

              {/* User Data */}
              <div className="p-4 border border-blue-gray-100 rounded-lg">
                <Typography
                  variant="small"
                  className="font-bold uppercase text-blue-gray-600 flex items-center gap-2 mb-4"
                >
                  <User className="w-4 h-4" />
                  User Information
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    icon={User}
                    label="First Name"
                    value={selected.user.firstName}
                  />
                  <InfoItem
                    icon={User}
                    label="Last Name"
                    value={selected.user.lastName}
                  />
                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={selected.user.email}
                  />
                  <InfoItem
                    icon={Shield}
                    label="Role"
                    value={
                      <Chip
                        value={selected.user.role}
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

              {/* Social Links */}
              <div className="p-4 border border-blue-gray-100 rounded-lg">
                <Typography
                  variant="small"
                  className="font-bold uppercase text-blue-gray-600 flex items-center gap-2 mb-4"
                >
                  <LinkIcon className="w-4 h-4" />
                  Social Links ({selected.socialLinks.length})
                </Typography>

                {selected.socialLinks.length === 0 ? (
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
                        <div className="flex items-start justify-between mb-2">
                          <Typography
                            variant="small"
                            className="font-semibold text-blue-gray-800 flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4 text-blue-500" />
                            {s.platform}
                          </Typography>
                          <Chip
                            variant="ghost"
                            color={s.isVisible ? "green" : "red"}
                            value={s.isVisible ? "Visible" : "Hidden"}
                            size="sm"
                            className="text-xs"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-3 h-3 text-blue-gray-400" />
                            <a
                              href={
                                s.url.startsWith("http")
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
                            <MousePointerClick className="w-3 h-3 text-blue-gray-400" />
                            <Typography color="gray" className="text-xs">
                              <span className="font-semibold">
                                {s.clickCount}
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

        <DialogFooter className="gap-3">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => handleOpen(null)}
          >
            Close
          </Button>
          <Button
            variant="gradient"
            color="blue"
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Public Profile
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

/* Helper Component */
function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="w-4 h-4 text-blue-gray-400 mt-1" />}
      <div className="flex flex-col gap-1">
        <Typography variant="small" className="font-bold text-blue-gray-700">
          {label}
        </Typography>
        {typeof value === "string" ? (
          <Typography color="gray" className="text-sm">
            {value || "-"}
          </Typography>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

export default Tables;
