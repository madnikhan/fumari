'use client';

import Image from 'next/image';
import { useState } from 'react';

interface FumariLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  small: { width: 40, height: 40 },
  medium: { width: 80, height: 80 },
  large: { width: 120, height: 120 },
  xlarge: { width: 160, height: 160 },
};

export default function FumariLogo({ 
  size = 'medium', 
  className = '',
  showText = false 
}: FumariLogoProps) {
  const dimensions = sizeMap[size];
  const [imgSrc, setImgSrc] = useState('/fumari-logo.png');
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
        {!hasError ? (
          <Image
            src={imgSrc}
            alt="Fumari Logo"
            width={dimensions.width}
            height={dimensions.height}
            className="object-contain"
            style={{ width: 'auto', height: 'auto' }}
            priority
            onError={() => {
              // Fallback to SVG if PNG doesn't exist
              if (imgSrc.includes('.png')) {
                setImgSrc('/fumari-logo.svg');
              } else {
                setHasError(true);
              }
            }}
          />
        ) : (
          // Fallback icon if logo file doesn't exist
          <div 
            className="w-full h-full bg-[#9B4E3F] rounded-lg flex items-center justify-center border-2 border-[#FFE176]"
            style={{ width: dimensions.width, height: dimensions.height }}
          >
            <span className="text-[#FFE176] font-bold text-xs">F</span>
          </div>
        )}
      </div>
      {showText && (
        <h1 className="text-2xl font-bold text-[#FFE176] mt-2">Fumari</h1>
      )}
    </div>
  );
}

