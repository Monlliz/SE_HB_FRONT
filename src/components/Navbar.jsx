import React from "react";
import PropTypes from "prop-types";
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Button,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    InputBase,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
} from "@mui/material";

import { Menu as MenuIcon, Search as SearchIcon, User as UserIcon } from "lucide-react";

export default function Navbar({ links = [] }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const userMenuOpen = Boolean(anchorEl);

    const handleDrawerToggle = () => setDrawerOpen((v) => !v);
    const handleUserClick = (e) => setAnchorEl(e.currentTarget);
    const handleUserClose = () => setAnchorEl(null);

    const navLinks = links.length
        ? links
        : [
            { label: "INICIO", href: "/" },
            { label: "GRUPOS", href: "/grupos" },
            { label: "DOCENTES", href: "/docentes" },
            { label: "MATERIAS", href: "/materias" },
            { label: "REPORTES", href: "/reportes" },
        ];

    return (
        <>
            <AppBar position="fixed" color="transparent" elevation={1} 
            sx={{  background: "linear-gradient(35deg, #a1bdfaff 0%, #3e5aa0 50%, #15264d 100%)", 
                width: "100%",
                height: {xs: "9%"}
            }} >
                <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {isMobile && (
                            <IconButton onClick={handleDrawerToggle} edge="start" aria-label="menu" size="large">
                                <MenuIcon />
                            </IconButton>
                        )}

                        {/* Logo + Title */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}>
                            <Box
                                component="img"
                                src="/img/herbart-logo.avif"
                                sx={{
                                    width: "60%",
                                    height: "9%",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Center nav (desktop) */}
                    {!isMobile && (
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "center" }}>
                            {navLinks.map((link) => (
                                <Button
                                    key={link.label}
                                    href={link.href}
                                    variant="text"
                                    sx={{
                                        color: "background.paper",
                                        textTransform: "none",
                                        fontWeight: 700,
                                        fontSize: 18,
                                        px: 2,
                                        "&:hover": { bgcolor: "transparent", color: "primary.main" },
                                    }}
                                >
                                    {link.label}
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
                        <IconButton onClick={handleUserClick} aria-controls={userMenuOpen ? "user-menu" : undefined}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.dark" }}>
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
                <Box sx={{ width: 260 }} role="presentation" onClick={handleDrawerToggle}>
                    <List>
                        {navLinks.map((item) => (
                            <ListItem key={item.label} disablePadding>
                                <ListItemButton component="a" href={item.href}>
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </>
    );
}

Navbar.propTypes = {
    links: PropTypes.array,
};
