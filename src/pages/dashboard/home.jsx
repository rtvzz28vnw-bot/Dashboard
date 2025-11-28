import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Avatar,
} from "@material-tailwind/react";
import {
  Users,
  FileText,
  Eye,
  MousePointerClick,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Award,
  RefreshCw,
  Briefcase,
  User,
} from "lucide-react";
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <Typography variant="h6" color="blue-gray">
          Loading dashboard...
        </Typography>
      </div>
    );
  }

  const statisticsCardsData = [
    {
      color: "blue",
      icon: Users,
      title: "Total Users",
      value: dashboardData?.stats?.totalUsers?.value || 0,
      footer: {
        color: "text-green-500",
        value: `+${dashboardData?.stats?.totalUsers?.growth || 0}%`,
        label: "than last month",
        icon: TrendingUp,
      },
    },
    {
      color: "pink",
      icon: FileText,
      title: "Total Profiles",
      value: dashboardData?.stats?.totalProfiles?.value || 0,
      footer: {
        color: "text-blue-500",
        value: `${dashboardData?.stats?.totalProfiles?.today || 0}`,
        label: "created today",
        icon: Activity,
      },
    },
    {
      color: "green",
      icon: Eye,
      title: "Total Views",
      value: dashboardData?.stats?.totalViews?.value || 0,
      footer: {
        color: "text-green-500",
        value: `${dashboardData?.stats?.totalViews?.today || 0}`,
        label: "views today",
        icon: TrendingUp,
      },
    },
    {
      color: "orange",
      icon: MousePointerClick,
      title: "Total Clicks",
      value: dashboardData?.stats?.totalClicks?.value || 0,
      footer: {
        color: "text-orange-500",
        value: "Social Links",
        label: "engagement",
        icon: Activity,
      },
    },
    {
      color: "purple",
      icon: CheckCircle,
      title: "Active Profiles",
      value: dashboardData?.stats?.activeProfiles?.value || 0,
      footer: {
        color: "text-purple-500",
        value: "Live",
        label: "profiles",
        icon: CheckCircle,
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
        fill: true,
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
        borderRadius: 6,
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
        borderWidth: 2,
        borderColor: "#fff",
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
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="mt-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <Typography variant="h3" color="blue-gray" className="font-bold">
              Dashboard Overview
            </Typography>
            <Typography color="gray" className="font-normal">
              Welcome back! Here's what's happening with your platform
            </Typography>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {statisticsCardsData.map(
          ({ icon: Icon, title, value, footer, color }) => (
            <Card
              key={title}
              className="border border-blue-gray-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardHeader
                variant="gradient"
                color={color}
                floated={false}
                shadow={false}
                className="absolute grid h-16 w-16 place-items-center"
              >
                <Icon className="w-8 h-8 text-white" />
              </CardHeader>
              <CardBody className="p-4 text-right">
                <Typography
                  variant="small"
                  className="font-semibold text-blue-gray-600 uppercase"
                >
                  {title}
                </Typography>
                <Typography
                  variant="h4"
                  color="blue-gray"
                  className="font-bold"
                >
                  {value.toLocaleString()}
                </Typography>
              </CardBody>
              <div className="border-t border-blue-gray-50 p-4">
                <Typography className="font-normal text-blue-gray-600 flex items-center gap-2">
                  {footer.icon &&
                    React.createElement(footer.icon, {
                      className: `w-4 h-4 ${footer.color}`,
                    })}
                  <strong className={footer.color}>{footer.value}</strong>
                  <span>{footer.label}</span>
                </Typography>
              </div>
            </Card>
          )
        )}
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Views Over Time Chart */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="flex flex-col gap-4 rounded-none md:flex-row md:items-center p-6"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="font-bold"
                >
                  Profile Views
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-gray-600"
                >
                  Views over the last 7 days
                </Typography>
              </div>
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
              className="flex items-center gap-2 font-normal text-blue-gray-600"
            >
              <Clock className="h-4 w-4 text-blue-gray-400" />
              Updated just now
            </Typography>
          </div>
        </Card>

        {/* User Registration Chart */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="flex flex-col gap-4 rounded-none md:flex-row md:items-center p-6"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="font-bold"
                >
                  User Registrations
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-gray-600"
                >
                  New users in the last 7 days
                </Typography>
              </div>
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
              className="flex items-center gap-2 font-normal text-blue-gray-600"
            >
              <Clock className="h-4 w-4 text-blue-gray-400" />
              Updated just now
            </Typography>
          </div>
        </Card>

        {/* Profile Types Distribution */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="flex flex-col gap-4 rounded-none md:flex-row md:items-center p-6"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="font-bold"
                >
                  Profile Types
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-gray-600"
                >
                  Personal vs Business profiles
                </Typography>
              </div>
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
              className="flex items-center gap-2 font-normal text-blue-gray-600"
            >
              <PieChart className="h-4 w-4 text-blue-gray-400" />
              Total distribution
            </Typography>
          </div>
        </Card>
      </div>

      {/* Top Profiles */}
      <Card className="mt-16 shadow-xl">
        <CardHeader
          variant="gradient"
          color="blue"
          className="mb-8 p-6 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-white" />
            <Typography variant="h5" color="white" className="font-bold">
              Top Performing Profiles
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          {dashboardData?.topProfiles?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Award className="w-16 h-16 text-blue-gray-300 mb-4" />
              <Typography variant="h6" color="blue-gray" className="mb-2">
                No profiles yet
              </Typography>
              <Typography variant="small" color="gray">
                Top performing profiles will appear here
              </Typography>
            </div>
          ) : (
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {[
                    { label: "Rank", icon: Award },
                    { label: "Profile", icon: User },
                    { label: "Type", icon: Briefcase },
                    { label: "Views", icon: Eye },
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
                {dashboardData?.topProfiles?.map((profile, index) => {
                  const className = `py-4 px-5 ${
                    index === dashboardData.topProfiles.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr
                      key={profile.id}
                      className="hover:bg-blue-gray-50/50 transition-colors"
                    >
                      <td className={className}>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              index === 0
                                ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                                : index === 1
                                ? "bg-gradient-to-br from-gray-300 to-gray-500"
                                : index === 2
                                ? "bg-gradient-to-br from-orange-400 to-orange-600"
                                : "bg-gradient-to-br from-blue-400 to-blue-600"
                            }`}
                          >
                            <Typography
                              variant="small"
                              className="font-bold text-white"
                            >
                              #{index + 1}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={profile.avatarUrl}
                            alt={profile.name}
                            size="sm"
                            variant="circular"
                            className="ring-2 ring-blue-gray-100"
                          />
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-semibold"
                          >
                            {profile.name}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <Chip
                          value={profile.profileType}
                          variant="gradient"
                          color={
                            profile.profileType === "personal"
                              ? "blue"
                              : "purple"
                          }
                          size="sm"
                          className="capitalize"
                          icon={
                            profile.profileType === "personal" ? (
                              <User className="w-3 h-3" />
                            ) : (
                              <Briefcase className="w-3 h-3" />
                            )
                          }
                        />
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-gray-400" />
                          <Typography
                            variant="small"
                            className="font-bold text-blue-gray-800"
                          >
                            {profile.viewCount.toLocaleString()}
                          </Typography>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Home;
