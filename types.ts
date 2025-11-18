export interface FlowerConfig {
  id: number;
  x: number; // percentage
  height: number; // scale
  delay: number; // animation delay
  rotation: number; // initial rotation Z
  colorTone: 'pink' | 'lightPink' | 'hotPink';
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}