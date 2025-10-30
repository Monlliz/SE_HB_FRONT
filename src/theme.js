import { createTheme } from '@mui/material/styles';
//FUENTES
// Inter
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

// Poppins
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/700.css";

// Work Sans
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/500.css";
import "@fontsource/work-sans/600.css";
import "@fontsource/work-sans/700.css";

//sofia
import "@fontsource/sofia/400.css";
// Gabriela
import "@fontsource/gabriela/400.css";


import { header } from 'motion/react-client';

//Fin fuentes 

const theme = createTheme({
    palette: {
        primary: {
            main: "#1f3971",
            light: "#3e5aa0",
            dark: "#052659",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#ffab46",
            light: "#f4fdffff",
            dark: "#cc7f22",
            contrastText: "#1f1f1f",
        },
        background: {
            default: "#ffffff", // Fondo general
            paper: "#f8f9fc",   // Tarjetas
        },
        text: {
            primary: "#1f1f1f",
            secondary: "#5f6368",
        },
    },
    typography: {
        fontFamily: '"Inter", "Poppins", "Work Sans", "Arial", sans-serif',
        h1: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
        h2: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
        h3: { fontFamily: '"Work Sans", sans-serif', fontWeight: 600 },
        h4: { fontFamily: '"Sofia", serif', fontWeight: 400, fontSize: "4.5rem"},
        
        body1: { fontFamily: '"Inter", sans-serif', fontSize: "1rem" },
        body2: { fontFamily: '"Work Sans", sans-serif', fontSize: "0.9rem" },
    },
    shape: {
        borderRadius: 12, // más moderno que el default de 4
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    textTransform: "none",
                },
            },
            
        },
    }
});

export default theme;