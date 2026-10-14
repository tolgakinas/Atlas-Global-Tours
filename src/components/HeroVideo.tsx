import React, { useState } from 'react';

export const HeroVideo: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const vimeoId = 347747035;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Background Poster Image */}
      <img
        src="https://atlasglobaltours.com/wp-content/uploads/2025/01/pexels-hasan-olker-2148049930-30050170-scaled.jpg"
        alt="Global expeditions scenic background"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Vimeo Background Video - Full Width Stretched Cover Across All Devices */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&loop=1&background=1&title=0&byline=0&portrait=0&dnt=1`}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[100vw] h-[56.25vw] min-w-[177.78vh] min-h-full scale-[1.08]"
          style={{ border: 'none' }}
          allow="autoplay; fullscreen; picture-in-picture"
          loading="eager"
          title="Hero background video"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
};
