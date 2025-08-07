'use client';

import React from 'react';

interface TwoDLogoProps {
  /** Text to render – now defaults to “Luorn” */
  text?: string;
  /** Tailwind size class for font (e.g. "text-6xl") */
  sizeClass?: string;
}

export default function TwoDLogo({
  text = 'Luorn',
  sizeClass = 'text-6xl',
}: TwoDLogoProps) {
  return (
    <div
      className={`${sizeClass} font-extrabold bg-clip-text text-transparent`}
      style={{
        backgroundImage:
          'linear-gradient(90deg, ' +
          '#1E3A8A 0%, ' +   
          '#3B82F6 25%, ' +  
          '#9333EA 50%, ' +  
          '#FF8C00 75%, ' +  
          '#FFD600 100%)',   
      }}
    >
      {text}
    </div>
  );
}

// 'use client';

// import React from 'react';

// interface CosmicLogoProps {
//   text?: string;
//   sizeClass?: string;
// }

// // Only dark blue and black shades
// const cosmicColors = ['#0B0F2B', '#111111', '#1A1C4E', '#000000'];

// export default function TwoDLogo({
//   text = 'Luorn',
//   sizeClass = 'text-6xl md:text-7xl',
// }: CosmicLogoProps) {
//   return (
//     <div className={`flex ${sizeClass} font-extrabold space-x-1`}>
//       {text.split('').map((char, index) => {
//         const color = cosmicColors[index % cosmicColors.length];

//         return (
//           <span
//             key={index}
//             style={{
//               color,
//               textShadow: '0 1px 4px rgba(0,0,0,0.15)',
//             }}
//           >
//             {char}
//           </span>
//         );
//       })}
//     </div>
//   );
// }

