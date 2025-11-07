/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import type { ImageState } from '../App';


export interface ImageStateWithUrl extends ImageState {
    url: string;
}

interface ImageThumbnailsProps {
  images: ImageStateWithUrl[];
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
}

const ImageThumbnails: React.FC<ImageThumbnailsProps> = ({ images, selectedImageId, onSelectImage }) => {
    return (
        <div className="w-full bg-gray-900/50 p-3 rounded-xl border border-gray-700 backdrop-blur-sm">
            <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map(image => {
                    const isSelected = image.id === selectedImageId;

                    return (
                        <button 
                            key={image.id} 
                            className="relative flex-shrink-0 focus:outline-none rounded-lg" 
                            onClick={() => onSelectImage(image.id)}
                            aria-label={`Select image ${image.originalFile.name}`}
                            aria-current={isSelected}
                        >
                            <img
                                src={image.url}
                                alt={`thumbnail of ${image.originalFile.name}`}
                                className={`w-24 h-24 object-cover rounded-lg transition-all duration-200 border-2 ${isSelected ? 'border-red-500 scale-105 shadow-lg shadow-red-500/20' : 'border-transparent hover:border-gray-500'}`}
                            />
                            {image.isLoading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
export default ImageThumbnails;