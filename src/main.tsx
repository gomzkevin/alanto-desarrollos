
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Precarga la imagen OG para compartir
const preloadOGImage = new Image();
preloadOGImage.src = 'https://desarrollos.alanto.mx/lovable-uploads/1215bc60-18b9-4e42-a292-f4b9980edaa7.png';

// Agregar una etiqueta Link para precargar la imagen OG
const ogImageLink = document.createElement('link');
ogImageLink.rel = 'preload';
ogImageLink.href = 'https://desarrollos.alanto.mx/lovable-uploads/1215bc60-18b9-4e42-a292-f4b9980edaa7.png';
ogImageLink.as = 'image';
document.head.appendChild(ogImageLink);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
