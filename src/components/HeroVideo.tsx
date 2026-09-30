import React, { useState } from 'react';

export const HeroVideo: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const vimeoId = 347747035;

  return (
    <div className="absolute inset-0 size-full overflow-hidden" aria-hidden="true">
      {/* Background Poster Image */}
      <img
        src="https://atlasglobaltours.com/wp-content/uploads/2025/01/pexels-hasan-olker-2148049930-30050170-scaled.jpg"
        alt="Türkiye scenic background"
        className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Vimeo Background Video */}
      <iframe
        src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&loop=1&background=1&title=0&byline=0&portrait=0&dnt=1`}
        className="absolute inset-0 h-full w-full pointer-events-none scale-105"
        style={{ border: 'none' }}
        allow="autoplay; fullscreen; picture-in-picture"
        loading="eager"
        title="Hero background video"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};
