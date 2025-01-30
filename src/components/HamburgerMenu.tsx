"use client";

import React, { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import SignOutButton from "./SignOutButton";
import DashboardButton from "./DashboardButton";
import PresetEditor from "./PresetEditor"; // Import the PresetEditor component
import BuyMeACoffee from "./BuyMeACoffee";

// Define the MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1e3a8a", // Vibrant blue
    },
    secondary: {
      main: "#ffffff", // White
    },
    background: {
      default: "#1f2937", // Dark gray
      paper: "#1f2937", // Dark gray for menus
    },
  },
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#ffffff", // White for the icon
          "&:hover": {
            backgroundColor: "#1e3a8a", // Blue background on hover
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1f2937", // Dark gray background
          color: "#ffffff", // White text
          border: "1px solid #1e3a8a", // Blue border
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", // Subtle shadow
        },
      },
    },
  },
});

const MenuWithCustomStyles: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditorVisible, setIsEditorVisible] = useState(false); // Track PresetEditor visibility
  const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditorOpen = () => {
    setIsEditorVisible(true);
    handleMenuClose(); // Close the menu when opening the editor
  };

  const handleEditorClose = () => {
    setIsEditorVisible(false);
  };

  const toggleCoffeeMenu = () => {
    setIsCoffeeOpen((prev) => !prev);
    handleMenuClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="bg-gray-700 rounded-md">
        <IconButton
          onClick={handleMenuClick}
          aria-controls={open ? "user-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <MenuIcon className="-scale-150" />
        </IconButton>
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <MenuItem>
            <DashboardButton />
          </MenuItem>
          <MenuItem>
            <button
              onClick={handleEditorOpen}
              className="bg-gray-600 text-white rounded-md hover:bg-gray-700 px-4 py-2 w-full"
            >
              Workout Editor
            </button>
          </MenuItem>
          <MenuItem>
          <button
              onClick={toggleCoffeeMenu} // Toggles the BuyMeACoffee menu
            
              className="bg-gray-600 text-white rounded-md hover:bg-gray-700 px-4 py-2 w-full"
            >
              ☕ coffee?
            </button>
          </MenuItem>
          <MenuItem>
            <SignOutButton />
          </MenuItem>
        </Menu>

        {/* PresetEditor Overlay */}
        {isEditorVisible && <PresetEditor closeEditor={handleEditorClose} />}
        {isCoffeeOpen && <BuyMeACoffee toggleMenu={toggleCoffeeMenu} />}
      </div>
    </ThemeProvider>
  );
};

export default MenuWithCustomStyles;
