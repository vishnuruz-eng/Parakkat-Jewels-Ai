/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface ImageComparatorProps {
  beforeSrc: string;
  afterSrc: string;
  sliderPosition: number;
}

const ImageComparator: React.FC<ImageComparatorProps> = ({ beforeSrc, afterSrc, sliderPosition }) => {
  return (
    <div className="relative w-full h-full">
      <img
        src={beforeSrc}
        alt="Before"
        className="absolute top-0 left-0 w-full h-full object-contain"
      />
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={afterSrc}
          alt="After"
          className="absolute top-0 left-0 w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default ImageComparator;