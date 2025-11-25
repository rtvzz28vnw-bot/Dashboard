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
} from "@material-tailwind/react";

export function Tables() {
  const [profiles, setProfiles] = useState([]);
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
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/admin/dashboard/profiles/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setProfiles(data.data || []);
      } catch (err) {
        console.error("Error fetching profiles", err);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card className="shadow-lg shadow-blue-gray-200/40 rounded-xl">
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 rounded-xl"
        >
          <Typography variant="h6" color="white">
            Profiles Table
          </Typography>
        </CardHeader>

        <CardBody className="overflow-x-auto px-0 pt-0 pb-4">
          <table className="w-full min-w-[800px] table-auto">
            <thead>
              <tr>
                {[
                  "Avatar",
                  "Name",
                  "Email",
                  "Profile Type",
                  "Title",
                  "Views",
                  "Status",
                  "Created",
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
              {profiles.map((p, index) => {
                const className = `py-3 px-5 ${
                  index === profiles.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                }`;

                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    {/* Avatar */}
                    <td className={className}>
                      <Avatar
                        src={p.avatarUrl}
                        alt={p.name}
                        size="sm"
                        variant="circular"
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
                      <Typography className="text-xs font-medium text-blue-gray-600">
                        {p.user?.email}
                      </Typography>
                    </td>

                    {/* Profile Type */}
                    <td className={className}>
                      <Chip
                        value={p.profileType}
                        variant="gradient"
                        color="blue"
                        className="py-0.5 px-2 text-[11px] w-fit"
                      />
                    </td>

                    {/* Title */}
                    <td className={className}>
                      <Typography className="text-xs text-blue-gray-600">
                        {p.title}
                      </Typography>
                    </td>

                    {/* Views */}
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-700">
                        {p.viewCount}
                      </Typography>
                    </td>

                    {/* Status */}
                    <td className={className}>
                      <Chip
                        variant="gradient"
                        color={p.isActive ? "green" : "red"}
                        value={p.isActive ? "Active" : "Disabled"}
                        className="py-0.5 px-2 text-[11px] w-fit"
                      />
                    </td>

                    {/* Created At */}
                    <td className={className}>
                      <Typography className="text-xs text-blue-gray-600">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </Typography>
                    </td>

                    {/* Actions */}
                    <td className={className}>
                      <Button
                        size="sm"
                        color="blue"
                        onClick={() => handleOpen(p)}
                        className="rounded-md"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* ========================= VIEW DIALOG ========================= */}
      <Dialog size="xl" open={open} handler={() => handleOpen(null)}>
        <DialogHeader className="flex flex-col items-start gap-2">
          <Typography variant="h5" color="blue-gray">
            Profile Details
          </Typography>
          <Typography variant="small" color="gray">
            Full profile information including user + social links
          </Typography>
        </DialogHeader>

        <DialogBody className="max-h-[75vh] overflow-y-auto">
          {selected && (
            <div className="space-y-6 p-4">
              {/* Basic Info */}
              <div className="flex items-center gap-6">
                <Avatar
                  src={selected.avatarUrl}
                  alt={selected.name}
                  size="xl"
                  variant="circular"
                  className="ring-2 ring-blue-500"
                />
                <div>
                  <Typography variant="h5" className="font-bold">
                    {selected.name}
                  </Typography>
                  <Typography color="gray" className="text-sm">
                    {selected.title}
                  </Typography>
                </div>
              </div>

              <hr className="my-4" />

              {/* Profile Data */}
              <div className="grid grid-cols-2 gap-4">
                <Info label="Profile Type" value={selected.profileType} />
                <Info label="Slug" value={selected.slug} />
                <Info label="Design Mode" value={selected.designMode} />
                <Info label="Template" value={selected.template} />
                <Info label="Color" value={selected.color} />
                <Info label="Views" value={selected.viewCount} />
                <Info label="Active" value={selected.isActive ? "Yes" : "No"} />
                <Info
                  label="Created"
                  value={new Date(selected.createdAt).toLocaleString()}
                />
              </div>

              <hr className="my-4" />

              {/* Bio */}
              <div>
                <Typography variant="small" className="font-bold">
                  Bio
                </Typography>
                <Typography color="gray">{selected.bio}</Typography>
              </div>

              <hr className="my-4" />

              {/* User Data */}
              <div>
                <Typography variant="small" className="font-bold">
                  User Information
                </Typography>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <Info label="First Name" value={selected.user.firstName} />
                  <Info label="Last Name" value={selected.user.lastName} />
                  <Info label="Email" value={selected.user.email} />
                  <Info label="Role" value={selected.user.role} />
                </div>
              </div>

              <hr className="my-4" />

              {/* Social Links */}
              <div>
                <Typography variant="small" className="font-bold mb-2">
                  Social Links
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selected.socialLinks.map((s) => (
                    <div
                      key={s.id}
                      className="border p-3 rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <Typography variant="small" className="font-semibold">
                        {s.platform}
                      </Typography>
                      <Typography color="gray" className="text-sm truncate">
                        URL:{" "}
                        <a
                          href={
                            s.url.startsWith("http")
                              ? s.url
                              : `https://${s.url}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {s.url}
                        </a>
                      </Typography>
                      <Typography color="gray" className="text-sm">
                        Visible: {s.isVisible ? "Yes" : "No"}
                      </Typography>
                      <Typography color="gray" className="text-sm">
                        Clicks: {s.clickCount}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button color="red" onClick={() => handleOpen(null)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

/* Helper Component */
function Info({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <Typography variant="small" className="font-bold text-blue-gray-700">
        {label}
      </Typography>
      <Typography color="gray" className="text-sm">
        {value || "-"}
      </Typography>
    </div>
  );
}

export default Tables;
