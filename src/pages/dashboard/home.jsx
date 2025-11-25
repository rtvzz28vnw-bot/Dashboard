import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
} from "@material-tailwind/react";
import {
  UserGroupIcon,
  DocumentIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { ClockIcon } from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export function Home() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/admin/dashboard/analytics/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statisticsCardsData = [
    {
      color: "blue",
      icon: UserGroupIcon,
      title: "Total Users",
      value: dashboardData?.stats?.totalUsers?.value || 0,
      footer: {
        color: "text-green-500",
        value: `+${dashboardData?.stats?.totalUsers?.growth || 0}%`,
        label: "than last month",
      },
    },
    {
      color: "pink",
      icon: DocumentIcon,
      title: "Total Profiles",
      value: dashboardData?.stats?.totalProfiles?.value || 0,
      footer: {
        color: "text-blue-500",
        value: `${dashboardData?.stats?.totalProfiles?.today || 0}`,
        label: "created today",
      },
    },
    {
      color: "green",
      icon: EyeIcon,
      title: "Total Views",
      value: dashboardData?.stats?.totalViews?.value || 0,
      footer: {
        color: "text-green-500",
        value: `${dashboardData?.stats?.totalViews?.today || 0}`,
        label: "views today",
      },
    },
    {
      color: "orange",
      icon: CursorArrowRaysIcon,
      title: "Total Clicks",
      value: dashboardData?.stats?.totalClicks?.value || 0,
      footer: {
        color: "text-orange-500",
        value: "Social Links",
        label: "engagement",
      },
    },
    {
      color: "purple",
      icon: CheckCircleIcon,
      title: "Active Profiles",
      value: dashboardData?.stats?.activeProfiles?.value || 0,
      footer: {
        color: "text-purple-500",
        value: "Live",
        label: "profiles",
      },
    },
  ];

  // Prepare chart data
  const viewsChartData = {
    labels:
      dashboardData?.charts?.viewsOverTime?.map((item) => {
        const date = new Date(item.date);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }) || [],
    datasets: [
      {
        label: "Profile Views",
        data:
          dashboardData?.charts?.viewsOverTime?.map((item) => item.count) || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const usersChartData = {
    labels:
      dashboardData?.charts?.usersOverTime?.map((item) => {
        const date = new Date(item.date);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }) || [],
    datasets: [
      {
        label: "New Users",
        data:
          dashboardData?.charts?.usersOverTime?.map((item) => item.count) || [],
        backgroundColor: "rgba(236, 72, 153, 0.8)",
      },
    ],
  };

  const profileTypesData = {
    labels:
      dashboardData?.charts?.profilesByType?.map(
        (item) =>
          item.profileType.charAt(0).toUpperCase() + item.profileType.slice(1)
      ) || [],
    datasets: [
      {
        data:
          dashboardData?.charts?.profilesByType?.map((item) => item.count) ||
          [],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(236, 72, 153, 0.8)"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
  };

  return (
    <div className="mt-12">
      {/* Statistics Cards */}
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {statisticsCardsData.map(({ icon, title, value, footer, color }) => (
          <Card key={title} className="border border-blue-gray-100 shadow-sm">
            <CardHeader
              variant="gradient"
              color={color}
              floated={false}
              shadow={false}
              className="absolute grid h-12 w-12 place-items-center"
            >
              {React.createElement(icon, {
                className: "w-6 h-6 text-white",
              })}
            </CardHeader>
            <CardBody className="p-4 text-right">
              <Typography
                variant="small"
                className="font-normal text-blue-gray-600"
              >
                {title}
              </Typography>
              <Typography variant="h4" color="blue-gray">
                {value.toLocaleString()}
              </Typography>
            </CardBody>
            <div className="border-t border-blue-gray-50 p-4">
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Views Over Time Chart */}
        <Card>
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="flex flex-col gap-4 rounded-none md:flex-row md:items-center"
          >
            <div>
              <Typography variant="h6" color="blue-gray">
                Profile Views
              </Typography>
              <Typography
                variant="small"
                className="max-w-sm font-normal text-gray-600"
              >
                Views over the last 7 days
              </Typography>
            </div>
          </CardHeader>
          <CardBody className="px-2 pb-0">
            <div style={{ height: "300px" }}>
              <Line data={viewsChartData} options={chartOptions} />
            </div>
          </CardBody>
          <div className="border-t border-blue-gray-50 p-4">
            <Typography
              variant="small"
              className="flex items-center font-normal text-blue-gray-600"
            >
              <ClockIcon
                strokeWidth={2}
                className="h-4 w-4 text-blue-gray-400"
              />
              &nbsp;Updated just now
            </Typography>
          </div>
        </Card>

        {/* User Registration Chart */}
        <Card>
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="flex flex-col gap-4 rounded-none md:flex-row md:items-center"
          >
            <div>
              <Typography variant="h6" color="blue-gray">
                User Registrations
              </Typography>
              <Typography
                variant="small"
                className="max-w-sm font-normal text-gray-600"
              >
                New users in the last 7 days
              </Typography>
            </div>
          </CardHeader>
          <CardBody className="px-2 pb-0">
            <div style={{ height: "300px" }}>
              <Bar data={usersChartData} options={chartOptions} />
            </div>
          </CardBody>
          <div className="border-t border-blue-gray-50 p-4">
            <Typography
              variant="small"
              className="flex items-center font-normal text-blue-gray-600"
            >
              <ClockIcon
                strokeWidth={2}
                className="h-4 w-4 text-blue-gray-400"
              />
              &nbsp;Updated just now
            </Typography>
          </div>
        </Card>

        {/* Profile Types Distribution */}
        <Card>
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="flex flex-col gap-4 rounded-none md:flex-row md:items-center"
          >
            <div>
              <Typography variant="h6" color="blue-gray">
                Profile Types
              </Typography>
              <Typography
                variant="small"
                className="max-w-sm font-normal text-gray-600"
              >
                Personal vs Business profiles
              </Typography>
            </div>
          </CardHeader>
          <CardBody className="px-2 pb-0">
            <div style={{ height: "300px" }}>
              <Pie data={profileTypesData} options={chartOptions} />
            </div>
          </CardBody>
          <div className="border-t border-blue-gray-50 p-4">
            <Typography
              variant="small"
              className="flex items-center font-normal text-blue-gray-600"
            >
              <ClockIcon
                strokeWidth={2}
                className="h-4 w-4 text-blue-gray-400"
              />
              &nbsp;Total distribution
            </Typography>
          </div>
        </Card>
      </div>

      {/* Top Profiles */}
      <Card className="mt-6">
        <CardHeader
          floated={false}
          shadow={false}
          color="transparent"
          className="m-0 p-6"
        >
          <Typography variant="h6" color="blue-gray">
            Top Performing Profiles
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Profile", "Type", "Views", ""].map((el) => (
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
              {dashboardData?.topProfiles?.map((profile, index) => {
                const className = `py-3 px-5 ${
                  index === dashboardData.topProfiles.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                }`;

                return (
                  <tr key={profile.id}>
                    <td className={className}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        {profile.name}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography
                        variant="small"
                        className="font-medium text-blue-gray-600 capitalize"
                      >
                        {profile.profileType}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography
                        variant="small"
                        className="font-medium text-blue-gray-600"
                      >
                        {profile.viewCount.toLocaleString()}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography
                        as="a"
                        href={`/admin/profiles/${profile.id}`}
                        variant="small"
                        className="font-medium text-blue-gray-600 hover:text-blue-500"
                      >
                        View
                      </Typography>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default Home;
