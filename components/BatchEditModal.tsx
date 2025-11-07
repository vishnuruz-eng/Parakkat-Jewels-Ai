/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';

interface BatchEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  imageCount: number;
  isLoading: boolean;
}

const collections = [
  { name: 'Premium', promptStyle: "The scene is a high-end luxury photoshoot. Use expert studio lighting to accentuate the jewelry's premium finish and any stones. The model's pose should be sophisticated, reflecting a premium and elegant style." },
  { name: 'Sreshta', promptStyle: "The model must be wearing an elegant and traditional Kerala saree, reflecting the temple jewelry style. The background and lighting should evoke a sense of heritage and classic beauty." },
  { name: 'Aria', promptStyle: "The model must be wearing a simple, minimal, and modern outfit (like a plain silk blouse or a simple neckline dress). The aesthetic should be clean, fresh, and contemporary to complement the minimalist jewelry." },
];

const jewelryTypes = [
  { name: 'Ring', prompt: "As a creative assistant for Parakkat Jewels, place this ring on a {genderPossessive} gracefully posed hand. {style} The setting should be a professional, photorealistic studio shot with a light cream background. Ensure the ring fits perfectly and looks natural. The final image should be a tight, elegant crop focusing on the hand and jewelry, with no face visible." },
  { name: 'Bangle', prompt: "As a creative assistant for Parakkat Jewels, place this bangle on a {genderPossessive} gracefully posed wrist. {style} The setting should be a professional, photorealistic studio shot with a light cream background. Ensure the bangle fits perfectly and drapes naturally. The final image should be a tight, elegant crop focusing on the hand and wrist, with no face visible." },
  { name: 'Necklace', prompt: "As a creative assistant for Parakkat Jewels, place this necklace on a {genderPossessive} neck, resting naturally against the collarbone. If the original image also includes matching earrings, place them on {genderObjective} ears as well. {style} The setting should be a professional, photorealistic studio shot with a light cream background. The final image should be a tight crop on the neck and jawline, with no face visible, to keep the focus on the jewelry." },
  { name: 'Bracelet', prompt: "As a creative assistant for Parakkat Jewels, place this bracelet on a {genderPossessive} gracefully posed wrist. {style} The setting should be a professional, photorealistic studio shot with a light cream background. Ensure the bracelet fits perfectly and drapes naturally. The final image should be a tight, elegant crop focusing on the hand and wrist, with no face visible." },
  { name: 'Chain', prompt: "As a creative assistant for Parakkat Jewels, place this chain on a {genderPossessive} neck, ensuring it drapes naturally to its full, elegant length. {style} The setting should be a professional, photorealistic studio shot with a light cream background. Use expert studio lighting to accentuate the chain's intricate details, texture, and metallic shine. The lighting must create a clear, crisp separation between the jewelry and the model's skin, making the chain stand out with high contrast and definition. The final image should be a medium shot, gracefully cropped from just below the chin to the mid-chest area, perfectly balancing the chain's length with a focus on the product. No face should be visible." },
  { name: 'Pendant', prompt: "As a creative assistant for Parakkat Jewels, place this pendant (on its chain) on a {genderPossessive} neck, resting naturally against the collarbone. {style} The setting should be a professional, photorealistic studio shot with a light cream background. The final image should be a tight crop on the neck and jawline, with no face visible, to keep the focus on the jewelry." },
];

const BatchEditModal: React.FC<BatchEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  imageCount,
  isLoading,
}) => {
  const [selectedCollection, setSelectedCollection] = useState<typeof collections[0] | null>(null);
  const [selectedType, setSelectedType] = useState<typeof jewelryTypes[0] | null>(null);
  const [gender, setGender] = useState<'female' | 'male'>('female');

  const isRingSelected = selectedType?.name === 'Ring';

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCollection(null);
      setSelectedType(null);
      setGender('female');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isRingSelected) {
      setSelectedCollection(null);
    }
  }, [isRingSelected]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType && (selectedCollection || isRingSelected)) {
      const genderPossessive = gender === 'female' ? "woman's" : "man's";
      const genderObjective = gender === 'female' ? "her" : "his";
      const stylePrompt = isRingSelected ? '' : selectedCollection!.promptStyle;
      
      const finalPrompt = selectedType.prompt
          .replace(/{style}/g, stylePrompt)
          .replace(/{genderPossessive}/g, genderPossessive)
          .replace(/{genderObjective}/g, genderObjective);
      onSubmit(finalPrompt);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-100">Batch Edit {imageCount} Images</h2>
            <p className="mt-2 text-gray-400">Select options to apply to all uploaded images.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
                <label className={`block text-center text-sm font-medium mb-2 transition-colors ${isRingSelected ? 'text-gray-500' : 'text-gray-400'}`}>
                    1. Select Collection {isRingSelected && <span className="font-normal">(Not required for Rings)</span>}
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {collections.map((collection) => (
                    <button
                        key={collection.name}
                        type="button"
                        onClick={() => setSelectedCollection(collection)}
                        disabled={isLoading || isRingSelected}
                        className={`w-full text-center bg-white/10 border border-transparent text-gray-200 font-semibold py-3 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed ${selectedCollection?.name === collection.name ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-red-500' : ''} ${isRingSelected ? 'opacity-50' : ''}`}
                    >
                        {collection.name}
                    </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-center text-sm font-medium text-gray-400 mb-2 mt-4">2. Select Jewelry Type</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {jewelryTypes.map((type) => (
                    <button
                        key={type.name}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        disabled={isLoading}
                        className={`w-full text-center bg-white/10 border border-transparent text-gray-200 font-semibold py-3 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed ${selectedType?.name === type.name ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-red-500' : ''}`}
                    >
                        {type.name}
                    </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-center text-sm font-medium text-gray-400 mb-2 mt-4">3. Select Model Gender</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setGender('female')}
                        disabled={isLoading}
                        className={`w-full text-center bg-white/10 border border-transparent text-gray-200 font-semibold py-3 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed ${gender === 'female' ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-red-500' : ''}`}
                    >
                        Female
                    </button>
                    <button
                        type="button"
                        onClick={() => setGender('male')}
                        disabled={isLoading}
                        className={`w-full text-center bg-white/10 border border-transparent text-gray-200 font-semibold py-3 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed ${gender === 'male' ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-red-500' : ''}`}
                    >
                        Male
                    </button>
                </div>
            </div>

          <div className="border-t border-gray-700/80 my-2"></div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-br from-red-600 to-red-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-red-800 disabled:to-red-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            disabled={isLoading || !selectedType || (!selectedCollection && !isRingSelected)}
          >
            {isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Applying...</span>
                </>
            ) : (
                `Apply to ${imageCount} Images`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BatchEditModal;