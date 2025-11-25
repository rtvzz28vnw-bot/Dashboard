import {
  HomeIcon,
  UserGroupIcon,
  TableCellsIcon,
  ServerStackIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  SignalIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import Orders from "./pages/dashboard/Orders";
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import Home from "./pages/dashboard/home";
import { SignIn } from "@/pages/auth";
import User from "./pages/dashboard/Users";
import Message from "./pages/dashboard/Message";
import NFC from "./pages/dashboard/NFC";
import Terms from "./pages/dashboard/Terms";
import Privecy from "./pages/dashboard/Privecy";

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
        icon: <ChatBubbleLeftRightIcon {...icon} />,
        name: "message",
        path: "/message",
        element: <Message />,
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
