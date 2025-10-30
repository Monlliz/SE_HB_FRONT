import React from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  useTheme,
  ListItemIcon,
  useMediaQuery,
} from "@mui/material";

import { Menu as MenuIcon, User as UserIcon, House as HomeIcon, Users as GroupIcon, GraduationCap as TeacherIcon, BookOpenText as SubjectIcon, ShieldAlert as ReportIcon } from "lucide-react";

export default function Navbar({ links = [] }) {
  const { logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const userMenuOpen = Boolean(anchorEl);



  const handleDrawerToggle = () => setDrawerOpen((v) => !v);
  const handleUserClick = (e) => {
    setAnchorEl(e.currentTarget);
    logout();
  };
  const handleUserClose = () => setAnchorEl(null);

  // Obtener la ruta actual
  const location = useLocation();
  const currentPath = location.pathname;
console.log(currentPath !== "/inicio");


  

  const navLinks = links.length
    ? links
    : [
        { label: "INICIO", href: "/inicio" },
        { label: "ESTUDIANTES", href: "/alumnos" },
        { label: "GRUPOS", href: "/grupos" },
        { label: "MATERIAS", href: "/materias" },
        { label: "DOCENTES", href: "/docentes" },
      ];

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#f4fdffff',
          width: { xs: '100%', md: "88%" },
          top: { xs: 0, md: "2%" },
          left: '50%',
          transform: 'translateX(-50%)',
          justifyContent: "center",
          height: { xs: "7%", md: "9%" },
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          borderRadius: { xs: 0, md: 1.5 },
          paddingX: 0

        }} >
        <Toolbar
          sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: { xs: "60%", sm: "40%", md: "15%", } }}>
            {isMobile && (
              <IconButton
                onClick={handleDrawerToggle}
                edge="start"
                aria-label="menu"
                size="large"
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo + Title */}
            {!isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}>
                <Box
                  component="img"
                  src="/img/herbart-logo.avif"
                  sx={{
                    width: "100%",
                    height: "9%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Center nav (desktop) */}
          {!isMobile && (currentPath !== "/inicio")  &&  (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 0,
                width: "100%"
              }}
            >
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  href={link.href}
                  variant="text"
                  sx={{
                    color: "primary.dark",
                    textTransform: "none",
                    fontWeight: 400,
                    fontSize: 18,
                    p: 2,
                    height: "6vh",
                    fontFamily: 'Poppins, sans-serif',
                    marginX: 1,
                    "&:hover": { color: "background.paper", bgcolor: "primary.main" },
                    // Resaltar el botón si la ruta coincide con el href
                    ...(currentPath === link.href && { bgcolor: "primary.main", color: "background.paper" }),
                  }}
                >
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,

                  }}>
                    {link.icon}
                    <span>{link.label}</span>
                  </Box>
                </Button>
              ))}
            </Box>
          )}

          {/* Right side: search + avatar */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {/* Action button (secondary) - hidden on mobile to save espacio */}
            {/*
                        {!isMobile && (
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: "secondary.main",
                                    color: "secondary.contrastText",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    ml: 1,
                                    "&:hover": { bgcolor: "secondary.dark" },
                                }}
                            >
                                Nuevo alumno
                            </Button>
                        )} */}

            {/* Avatar + menu */}
            <IconButton
              onClick={handleUserClick}
              aria-controls={userMenuOpen ? "user-menu" : undefined}
            >
              <Avatar sx={{ width: "36", height: "36", bgcolor: "primary.dark", p: 0.5 }}>
                <UserIcon size={16} />
              </Avatar>
            </IconButton>

            {/* <Menu
                            id="user-menu"
                            anchorEl={anchorEl}
                            open={userMenuOpen}
                            onClose={handleUserClose}
                            transformOrigin={{ horizontal: "right", vertical: "top" }}
                            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                        >
                            <MenuItem onClick={handleUserClose}>Perfil</MenuItem>
                            <MenuItem onClick={handleUserClose}>Ajustes</MenuItem>
                            <MenuItem onClick={handleUserClose}>Salir</MenuItem>
                        </Menu> */}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        <Box
          sx={{
            width: { xs: "70vw", sm: "40vw" },
            backgroundColor: "#f4fdffff",
            height: "100vh"
          }}
          role="presentation"
          onClick={handleDrawerToggle}
        >
          {/* Logo interno*/}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}>
            <Box
              component="img"
              src="/img/herbart-logo.avif"
              sx={{
                width: "80%",
                paddingTop: "10%",
                paddingLeft: "4%",
                paddingBottom: "4%",
                height: "8%",
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          </Box>
          { currentPath !== "/inicio" &&      
            <List
            sx={{
              fontFamily: 'Poppins',
              color: "primary.dark",
              fontWeight: 500,
              textTransform: "none",
              fontSize: 18,
            }}>
            {navLinks.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton 
                  component={Link} 
                  to={item.href}
                  sx={{
                    //borders
                    borderWidth: 1,
                    borderColor: "primary.light",
                    borderStyle: "solid",
                    //spacing
                    p: { xs: 0.5, sm: 1 },
                    paddingLeft: { xs: 2, sm: 4 },
                    borderRadius: 5,
                    //size
                    margin: { xs: "2%", sm: "2.5%" },
                    marginX: { xs: "8%", sm: "10%" },
                    //Colores
                    ...(currentPath === item.href && { bgcolor: "primary.main", color: "background.paper" })
                  }}>
                  <ListItemIcon sx={{
                    // Esto hace que el icono herede el color del texto (blanco cuando está activo)
                    color: 'inherit'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}

                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          }
        </Box>
      </Drawer>
    </>
  );
}

Navbar.propTypes = {
  links: PropTypes.array,
};
