import {
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  SignalIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/solid";
import Home from "./pages/dashboard/home";
import User from "./pages/dashboard/Users";
import Orders from "./pages/dashboard/Orders";
import Message from "./pages/dashboard/Message";
import Notifications from "./pages/dashboard/notifications";
import NFC from "./pages/dashboard/NFC";
import Terms from "./pages/dashboard/Terms";
import Privecy from "./pages/dashboard/Privecy";
import { SignIn } from "@/pages/auth";
import Products from "./pages/dashboard/Products";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "users",
        path: "/users",
        element: <User />,
      },
      {
        icon: <ShoppingCartIcon {...icon} />,
        name: "orders",
        path: "/orders",
        element: <Orders />,
      },
      {
        icon: <ChatBubbleLeftRightIcon {...icon} />,
        name: "messages",
        path: "/messages",
        element: <Message />,
      },
      {
        icon: <BellIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
      },
      {
        icon: <DocumentTextIcon {...icon} />,
        name: "terms and conditions",
        path: "/terms",
        element: <Terms />,
      },
      {
        icon: <ShieldCheckIcon {...icon} />,
        name: "privacy policy",
        path: "/privacy",
        element: <Privecy />,
      },
      {
        icon: <SignalIcon {...icon} />,
        name: "NFC",
        path: "/nfc",
        element: <NFC />,
      },
      {
        icon: <ShoppingBagIcon {...icon} />,
        name: "products",
        path: "/products",
        element: <Products />,
      },
    ],
  },
  {
    layout: "auth",
    pages: [
      {
        icon: <ArrowRightOnRectangleIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
];

export default routes;
