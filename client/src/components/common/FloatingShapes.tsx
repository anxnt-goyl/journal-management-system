/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';

interface ShapeConfig {
  top: string;
  left: string;
  size: number;
  ratio: number;
  duration: number;
  delay: number;
  rotate: number;
}

// Deterministic layout so shapes don't jump around on re-render
const SHAPES: ShapeConfig[] = [
  { top: '8%', left: '6%', size: 150, ratio: 1.3, duration: 22, delay: 0, rotate: -8 },
  { top: '62%', left: '10%', size: 110, ratio: 1.15, duration: 26, delay: 2, rotate: 6 },
  { top: '20%', left: '82%', size: 130, ratio: 1.25, duration: 20, delay: 1, rotate: 10 },
  { top: '72%', left: '78%', size: 170, ratio: 1.35, duration: 28, delay: 3, rotate: -5 },
  { top: '42%', left: '46%', size: 90, ratio: 1.2, duration: 18, delay: 1.5, rotate: 4 },
  { top: '4%', left: '48%', size: 70, ratio: 1.1, duration: 24, delay: 0.5, rotate: -12 },
  { top: '85%', left: '42%', size: 100, ratio: 1.3, duration: 21, delay: 2.5, rotate: 8 },
];

export const FloatingShapes: React.FC = () => {
  const shapes = useMemo(() => SHAPES, []);

  return (
    <div className="shapes-field" aria-hidden="true">
      {shapes.map((shape, index) => (
        <div
          key={index}
          className="floating-shape"
          style={{
            top: shape.top,
            left: shape.left,
            width: `${shape.size}px`,
            height: `${shape.size * shape.ratio}px`,
            animationDuration: `${shape.duration}s`,
            animationDelay: `${shape.delay}s`,
            rotate: `${shape.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
};
