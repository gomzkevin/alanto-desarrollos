

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Precarga la imagen OG para compartir
const preloadOGImage = new Image();
preloadOGImage.src = 'https://desarrollos.alanto.mx/lovable-uploads/1215bc60-18b9-4e42-a292-f4b9980edaa7.png';

// Precarga el logo de Alanto
const preloadLogo = new Image();
preloadLogo.src = '/lovable-uploads/b85c95f1-cfe4-4a8f-9176-4b3b3539146b.png';

// Agregar una etiqueta Link para precargar la imagen OG
const ogImageLink = document.createElement('link');
ogImageLink.rel = 'preload';
ogImageLink.href = 'https://desarrollos.alanto.mx/lovable-uploads/1215bc60-18b9-4e42-a292-f4b9980edaa7.png';
ogImageLink.as = 'image';
document.head.appendChild(ogImageLink);

// Agregar una etiqueta Link para precargar el logo
const logoImageLink = document.createElement('link');
logoImageLink.rel = 'preload';
logoImageLink.href = '/lovable-uploads/b85c95f1-cfe4-4a8f-9176-4b3b3539146b.png';
logoImageLink.as = 'image';
document.head.appendChild(logoImageLink);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
