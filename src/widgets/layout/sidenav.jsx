import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useEffect } from "react";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;

  const isAuthenticated = Boolean(localStorage.getItem("token"));

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  // Close sidenav when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidenav = document.querySelector("aside");
      const isClickInsideSidenav = sidenav?.contains(event.target);
      const isMenuButton = event.target.closest("[data-sidenav-toggle]");

      // Close if click is outside sidenav and not on the menu button
      if (!isClickInsideSidenav && !isMenuButton && openSidenav) {
        setOpenSidenav(dispatch, false);
      }
    };

    // Only add listener on mobile/tablet (when sidenav can be toggled)
    if (openSidenav) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openSidenav, dispatch]);

  // Function to close sidenav
  const handleCloseSidenav = () => {
    // Only close on mobile/tablet screens
    if (window.innerWidth < 1280) {
      setOpenSidenav(dispatch, false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {openSidenav && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        />
      )}

      <aside
        className={`${sidenavTypes[sidenavType]} ${
          openSidenav ? "translate-x-0" : "-translate-x-80"
        } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
      >
        <div className={`relative`}>
          <Link
            to="/"
            className="py-6 px-8 text-center block"
            onClick={handleCloseSidenav}
          >
            <Typography
              variant="h6"
              color={sidenavType === "dark" ? "white" : "blue-gray"}
            >
              {brandName}
            </Typography>
          </Link>
          <IconButton
            variant="text"
            color="white"
            size="sm"
            ripple={false}
            className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
            onClick={() => setOpenSidenav(dispatch, false)}
          >
            <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
          </IconButton>
        </div>

        <div className="m-4 overflow-y-auto h-[calc(100vh-200px)]">
          {isAuthenticated &&
            routes.map(({ layout, title, pages }, key) => (
              <ul key={key} className="mb-4 flex flex-col gap-1">
                {title && (
                  <li className="mx-3.5 mt-4 mb-2">
                    <Typography
                      variant="small"
                      color={sidenavType === "dark" ? "white" : "blue-gray"}
                      className="font-black uppercase opacity-75"
                    >
                      {title}
                    </Typography>
                  </li>
                )}

                {pages
                  .filter(
                    ({ name }) => !(name === "sign in" && isAuthenticated)
                  )
                  .map(({ icon, name, path }) => (
                    <li key={name}>
                      <NavLink
                        to={`/${layout}${path}`}
                        onClick={handleCloseSidenav}
                      >
                        {({ isActive }) => (
                          <Button
                            variant={isActive ? "gradient" : "text"}
                            color={
                              isActive
                                ? sidenavColor
                                : sidenavType === "dark"
                                ? "white"
                                : "blue-gray"
                            }
                            className="flex items-center gap-4 px-4 capitalize"
                            fullWidth
                          >
                            {icon}
                            <Typography
                              color="inherit"
                              className="font-medium capitalize"
                            >
                              {name}
                            </Typography>
                          </Button>
                        )}
                      </NavLink>
                    </li>
                  ))}
              </ul>
            ))}

          {/* Logout Button */}
          {isAuthenticated && (
            <div className="mx-3.5 mt-6">
              <Button
                color="red"
                variant="outlined"
                fullWidth
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/auth/sign-in";
                }}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/Logo.svg",
  brandName: "Dot LinkMe",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
