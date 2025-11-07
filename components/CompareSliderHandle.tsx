/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useCallback, MouseEvent, TouchEvent, RefObject, useEffect } from 'react';

interface CompareSliderHandleProps {
  position: number;
  setPosition: (position: number) => void;
  containerRef: RefObject<HTMLDivElement>;
}

const CompareSliderHandle: React.FC<CompareSliderHandleProps> = ({ position, setPosition, containerRef }) => {
  const isDragging = useRef(false);
  const handleRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setPosition(percent);
  }, [containerRef, setPosition]);

  const handleGlobalMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  }, [handleMove]);

  const handleGlobalTouchMove = useCallback((e: globalThis.TouchEvent) => {
    if (!isDragging.current || !e.touches[0]) return;
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    window.removeEventListener('mousemove', handleGlobalMouseMove);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchmove', handleGlobalTouchMove);
    window.removeEventListener('touchend', handleDragEnd);
  }, [handleGlobalMouseMove, handleGlobalTouchMove]);

  const handleDragStart = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    isDragging.current = true;
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleGlobalTouchMove);
    window.addEventListener('touchend', handleDragEnd);
  }, [handleDragEnd, handleGlobalMouseMove, handleGlobalTouchMove]);
  
  useEffect(() => handleDragEnd, [handleDragEnd]);

  return (
    <div
      ref={handleRef}
      className="absolute top-0 h-full w-10 cursor-ew-resize z-20"
      style={{
        left: `${position}%`,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={handleDragStart as (e: MouseEvent) => void}
      onTouchStart={handleDragStart as (e: TouchEvent) => void}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-0.5 bg-white/75 pointer-events-none" />
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/70 flex items-center justify-center shadow-lg backdrop-blur-md pointer-events-none">
        <svg className="w-6 h-6 text-gray-800 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </div>
    </div>
  );
};

export default CompareSliderHandle;