import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeToggle } from './components/ThemeToggle';
import { WelcomePage } from './pages/WelcomePage';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WelcomePage />
    <ThemeToggle />
  </StrictMode>,
);
