import React from 'react';

interface HeroSectionProps {
  name: string;
  jobTitle: string;
  workplace: string;
  profileImage?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  name,
  jobTitle,
  workplace,
  profileImage
}) => {
  return (
    <section className="py-16">
    <div className="container mx-auto px-4">
      <div className='flex flex-col md:flex-row items-center gap-8 md:gap-12'>
        {/* Profile Picture */}
          <div className="w-64 h-80 md:w-80 md:h-96 bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-[#0047AB] shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg">Profile Picture/HeadShot</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-text mb-2 uppercase tracking-wide">
              {name}
            </h1>
            <p className="text-xl md:text-2xl text-text-light mb-2 uppercase tracking-wide">
              {jobTitle}
            </p>
            <p className="text-lg md:text-xl text-text-muted uppercase tracking-wide">
              {workplace}
            </p>
          </div>
      </div>
    </div>
    </section>
  );
};


export default HeroSection;
