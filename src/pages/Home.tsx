import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton
} from "@mui/material";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const Home = () => {
  const [open, setOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      {/* Trigger to open the drawer */}
      <IconButton onClick={handleDrawerToggle}>
        {open ? <ChevronLeftIcon /> : <MenuIcon />}
      </IconButton>

      {/* The Drawer component */}
      <Drawer
        variant="temporary" // Or "permanent" for always visible
        open={open}
        onClose={handleDrawerToggle}
      >
        {/* Menu items */}
        <List>
          <ListItem>
            <ListItemButton>Okay</ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Home;
