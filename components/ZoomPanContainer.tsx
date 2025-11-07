/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, WheelEvent, MouseEvent, ReactNode, TouchEvent } from 'react';

interface ZoomPanContainerProps {
  children: ReactNode;
  zoom: number;
  setZoom: (zoom: number) => void;
  pan: { x: number; y: number };
  setPan: (pan: { x: number; y: number }) => void;
}

const ZoomPanContainer: React.FC<ZoomPanContainerProps> = ({ children, zoom, setZoom, pan, setPan }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isPanning = useRef(false);
    const startPoint = useRef({ x: 0, y: 0 });

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const zoomFactor = 1.1;
        const newZoom = e.deltaY > 0 ? zoom / zoomFactor : zoom * zoomFactor;
        const clampedZoom = Math.max(1, Math.min(newZoom, 10)); // Min zoom 1, max 10
        setZoom(clampedZoom);

        if (clampedZoom === 1) {
            setPan({x: 0, y: 0});
        }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
        if (zoom <= 1) return;
        e.preventDefault();
        isPanning.current = true;
        startPoint.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grabbing';
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isPanning.current || zoom <= 1) return;
        e.preventDefault();
        const newPan = {
            x: e.clientX - startPoint.current.x,
            y: e.clientY - startPoint.current.y
        };
        setPan(newPan);
    };

    const handleMouseUp = () => {
        isPanning.current = false;
        if (containerRef.current) {
            containerRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
        }
    };

    const handleTouchStart = (e: TouchEvent) => {
        if (zoom <= 1 || e.touches.length !== 1) return;
        isPanning.current = true;
        startPoint.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isPanning.current || zoom <= 1 || e.touches.length !== 1) return;
        const newPan = {
            x: e.touches[0].clientX - startPoint.current.x,
            y: e.touches[0].clientY - startPoint.current.y
        };
        setPan(newPan);
    };

    const handleTouchEnd = () => {
        isPanning.current = false;
    };
    
    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-hidden touch-none"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
        >
            <div
                className="w-full h-full transition-transform duration-100 ease-out"
                style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
            >
                {children}
            </div>
        </div>
    );
};

export default ZoomPanContainer;