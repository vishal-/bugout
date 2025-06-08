import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Typography
} from "@mui/material";
import { useMemo, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useLocation, useNavigate } from "react-router-dom";
import { AppRoutes } from "../app.config";

const Header = () => {
  const [open, setOpen] = useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setOpen(!open);

  const title = useMemo(
    () =>
      Object.keys(AppRoutes).find(
        (route) => AppRoutes[route].path === pathname
      ),
    [pathname]
  );

  const onChangePath = (path: string) => {
    navigate(path);
    toggleMenu();
  };

  return (
    <>
      <Box sx={{ display: "flex", my: 1 }}>
        <IconButton onClick={toggleMenu}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>

        <Typography variant="h5" sx={{ mx: 2, flexGrow: 1 }}>
          {title}
        </Typography>
      </Box>

      <Drawer variant="temporary" open={open} onClose={toggleMenu}>
        <List>
          {Object.keys(AppRoutes).map((route) => (
            <ListItem key={`menu_path_${route}`}>
              <ListItemButton
                onClick={() => onChangePath(AppRoutes[route].path)}
              >
                {route}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Header;
