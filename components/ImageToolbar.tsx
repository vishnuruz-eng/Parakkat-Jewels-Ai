/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { EyeIcon, ZoomInIcon, ZoomOutIcon, ResetViewIcon } from './icons';

interface ImageToolbarProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  pan: { x: number; y: number };
  setPan: (pan: { x: number; y: number }) => void;
  isCompareSliderActive: boolean;
  setIsCompareSliderActive: (isActive: boolean) => void;
  canCompare: boolean;
}

const ImageToolbar: React.FC<ImageToolbarProps> = ({
  zoom,
  setZoom,
  pan,
  setPan,
  isCompareSliderActive,
  setIsCompareSliderActive,
  canCompare,
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800/80 border border-gray-700/80 rounded-lg p-2 flex items-center justify-center gap-2 backdrop-blur-sm z-10 animate-fade-in">
        {canCompare && (
          <>
            <button 
                onClick={() => setIsCompareSliderActive(!isCompareSliderActive)}
                className={`flex items-center justify-center text-center border font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 active:scale-95 text-sm ${isCompareSliderActive ? 'bg-red-500/20 border-red-500/30 text-white' : 'bg-white/10 border-white/20 text-gray-200'}`}
                aria-label="Toggle before/after comparison slider"
            >
                <EyeIcon className="w-5 h-5 mr-2" />
                Compare
            </button>
            <div className="h-6 w-px bg-gray-600 mx-1"></div>
          </>
        )}

        <button 
            // FIX: The `setZoom` prop expects a number, not a function. Changed to use the `zoom` prop to calculate the new value.
            onClick={() => setZoom(Math.min(zoom * 1.2, 10))}
            className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base"
            aria-label="Zoom in"
        >
            <ZoomInIcon className="w-5 h-5" />
        </button>
        <button 
            onClick={() => {
                const newZoom = Math.max(zoom / 1.2, 1);
                setZoom(newZoom);
                if (newZoom === 1) {
                    setPan({x: 0, y: 0});
                }
            }}
            disabled={zoom <= 1}
            className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5"
            aria-label="Zoom out"
        >
            <ZoomOutIcon className="w-5 h-5" />
        </button>
        <button 
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            disabled={zoom <= 1 && pan.x === 0 && pan.y === 0}
            className="flex items-center justify-center text-center bg-white/10 border border-white/20 text-gray-200 font-semibold p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/30 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5"
            aria-label="Reset view"
        >
            <ResetViewIcon className="w-5 h-5" />
        </button>
    </div>
  );
};

export default ImageToolbar;
