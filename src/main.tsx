
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Precarga la imagen OG para compartir
const preloadOGImage = new Image();
preloadOGImage.src = '/lovable-uploads/1215bc60-18b9-4e42-a292-f4b9980edaa7.png';

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
