import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, Typography, Button, Zoom, Box } from '@mui/material';
import confetti from 'canvas-confetti';
import dayjs from 'dayjs';
import { capitalizarCadaPalabra } from '../utils/fornatters.js';
import dragonGif from '../assets/images/dragon.gif';

const BirthdayCelebration = ({ userBirthday, userName }) => {
  const [open, setOpen] = useState(false);
  // Usamos una referencia para controlar la animación sin depender del estado (renderizados)
  const animationRef = useRef(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (userBirthday) {
      const hoy = dayjs();
      const cumple = dayjs(userBirthday);
      const esSuCumple = hoy.month() === cumple.month() && hoy.date() === cumple.date();

      if (esSuCumple) {
        setOpen(true);
        startInfiniteConfetti();
      }
    }
    
    // Limpieza al desmontar
    return () => stopConfetti();
  }, [userBirthday]);

  const startInfiniteConfetti = () => {
    isAnimating.current = true;
    
    const duration = 15000; // Seguridad: parar automáticamente a los 15 seg si no tocan nada para no quemar la RAM
    const animationEnd = Date.now() + duration;
    
    // Configuración base de alto rendimiento y Z-INDEX MÁXIMO
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999, useWorker: true };
    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const frame = () => {
      if (!isAnimating.current) return;

      const timeLeft = animationEnd - Date.now();
      // Si quieres que sea infinito REAL hasta que den click, quita la condición de timeLeft
      if (timeLeft <= 0) {
          isAnimating.current = false;
          return; 
      }

      // 1. LLUVIA CONSTANTE (Sutil)
      // Lanza pocas partículas por frame para crear efecto de lluvia
      confetti({
        ...defaults,
        particleCount: 2,
        origin: { x: Math.random(), y: 0 } // Desde arriba, posición X aleatoria
      });

      // 2. EXPLOSIONES ALEATORIAS (Intensidad)
      // Solo ocurre el 5% de las veces en cada frame para que no sea excesivo
      if (Math.random() < 0.05) {
          confetti({
              ...defaults,
              startVelocity: 45, // Más explosivo
              particleCount: 50,
              spread: 100,
              origin: { x: randomInRange(0.1, 0.9), y: randomInRange(0.1, 0.9) }
          });
      }

      animationRef.current = requestAnimationFrame(frame);
    };

    frame();
  };

  const stopConfetti = () => {
    isAnimating.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    confetti.reset(); // Limpia el canvas inmediatamente
  };

  const handleClose = () => {
    stopConfetti(); // DETIENE LA FIESTA
    setOpen(false);
  };

  return (
    <Dialog 
      open={open} 
      TransitionComponent={Zoom} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          textAlign: 'center',
          overflow: 'hidden',
          position: 'relative',
          background: 'white',
          m: 2,
          minHeight: '400px', // Altura mínima para que luzca
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }
      }}
    >
      {/* GIF DE TENOR DE FONDO */}
      <Box
        component="img"
        src={dragonGif}
        alt="celebration background"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.20, // Opacidad baja para que se lea el texto
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <DialogContent sx={{ p: { xs: 3, md: 5 }, position: 'relative', zIndex: 1 }}>
        
        <Box sx={{ mb: 1, fontSize: { xs: '4rem', md: '6rem' }, animation: 'bounce 2s infinite' }}>
          🎂
        </Box>
        
        <Typography 
          variant="h4" 
          component="div"
          fontWeight="900" 
          sx={{ 
            fontSize: { xs: '1.8rem', md: '3rem' }, 
            lineHeight: 1.1,
            mb: 3,
            color: 'primary.main',
            textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
          }}
        >
          ¡Feliz Cumpleaños,<br/> 
          <span style={{ color: '#ffab46' }}>
            {capitalizarCadaPalabra(userName)}
          </span>!
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 'normal' }}>
          ¡Todo el equipo te celebra!<br/>
          Que hoy sea un día lleno de alegría. 🎉
        </Typography>

       
      </DialogContent>
      
      {/* Animación CSS simple para el emoji */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-20px);}
          60% {transform: translateY(-10px);}
        }
      `}</style>
    </Dialog>
  );
};

export default BirthdayCelebration;