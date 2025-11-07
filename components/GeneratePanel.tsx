/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';

interface GeneratePanelProps {
  onGenerate: (prompt: string) => void;
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


const GeneratePanel: React.FC<GeneratePanelProps> = ({ onGenerate, isLoading }) => {
  const [selectedCollection, setSelectedCollection] = useState<typeof collections[0] | null>(null);
  const [selectedType, setSelectedType] = useState<typeof jewelryTypes[0] | null>(null);
  const [gender, setGender] = useState<'female' | 'male'>('female');

  const isRingSelected = selectedType?.name === 'Ring';

  useEffect(() => {
    if (isRingSelected) {
      setSelectedCollection(null);
    }
  }, [isRingSelected]);

  const handleGenerate = () => {
    if (selectedType && (selectedCollection || isRingSelected)) {
      const genderPossessive = gender === 'female' ? "woman's" : "man's";
      const genderObjective = gender === 'female' ? "her" : "his";
      const stylePrompt = isRingSelected ? '' : selectedCollection!.promptStyle;
      
      const finalPrompt = selectedType.prompt
          .replace(/{style}/g, stylePrompt)
          .replace(/{genderPossessive}/g, genderPossessive)
          .replace(/{genderObjective}/g, genderObjective);
      onGenerate(finalPrompt);
    }
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
      <h3 className={`text-lg font-semibold text-center transition-colors ${isRingSelected ? 'text-gray-500' : 'text-gray-300'}`}>
        1. Select Collection {isRingSelected && <span className="font-normal">(Not required for Rings)</span>}
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {collections.map((collection) => (
          <button
            key={collection.name}
            onClick={() => setSelectedCollection(collection)}
            disabled={isLoading || isRingSelected}
            className={`w-full text-center bg-white/10 border border-transparent text-gray-200 font-semibold py-3 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed ${selectedCollection?.name === collection.name ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-red-500' : ''} ${isRingSelected ? 'opacity-50' : ''}`}
          >
            {collection.name}
          </button>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-center text-gray-300 mt-2">2. Select Jewelry Type</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {jewelryTypes.map((type) => (
          <button
            key={type.name}
            onClick={() => setSelectedType(type)}
            disabled={isLoading}
            className={`w-full text-center bg-white/10 border border-transparent text-gray-200 font-semibold py-3 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed ${selectedType?.name === type.name ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-red-500' : ''}`}
          >
            {type.name}
          </button>
        ))}
      </div>
      
      <h3 className="text-lg font-semibold text-center text-gray-300 mt-2">3. Select Model Gender</h3>
      <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setGender('female')}
            disabled={isLoading}
            className={`w-full text-center bg-white/10 border border-transparent text-gray-200 font-semibold py-3 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed ${gender === 'female' ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-red-500' : ''}`}
          >
            Female
          </button>
          <button
            onClick={() => setGender('male')}
            disabled={isLoading}
            className={`w-full text-center bg-white/10 border border-transparent text-gray-200 font-semibold py-3 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-base disabled:opacity-50 disabled:cursor-not-allowed ${gender === 'male' ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-red-500' : ''}`}
          >
            Male
          </button>
      </div>

      <div className="border-t border-gray-700/80 my-2"></div>

      <button
        onClick={handleGenerate}
        className="w-full bg-gradient-to-br from-red-600 to-red-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-red-800 disabled:to-red-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        disabled={isLoading || !selectedType || (!selectedCollection && !isRingSelected)}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Generating...</span>
          </>
        ) : (
          `Generate Model Image`
        )}
      </button>
    </div>
  );
};

export default GeneratePanel;