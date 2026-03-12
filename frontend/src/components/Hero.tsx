"use client";

import { stats } from '@/utils/constant';
import { FC } from 'react';
import UploadIcon from './icons/UploadIcon';

interface HeroProps {
  onScrollToUpload: () => void;
}

const Hero: FC<HeroProps> = ({ onScrollToUpload }) => {

  return (
    <section className="flex flex-col items-center justify-center lg:py-28  py-10 pt-28 xl:pt-36 sm:py-20 px-6  relative overflow-hidden">
      <div className="absolute w-[40rem] lg:w-[48rem] h-[40rem] lg:h-[48rem] rounded-full top-12 -left-24 blur-3xl bg-purple-glow pointer-events-none" />
      <div className="absolute w-[32rem] lg:w-[40rem] h-[32rem] lg:h-[40rem] rounded-full bottom-12 -right-12 blur-3xl bg-emerald-glow pointer-events-none" />

      <div className="animate-fade-in-up bg-gradient-fancy inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple/10 border border-purple/25 mb-8 text-xs font-semibold tracking-wider text-white">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse-glow" />
        AI-Powered Meeting Intelligence
      </div>

      <h1 className="animate-fade-in-up delay-100 w-full text-4xl lg:text-5xl xl:text-7xl font-black text-center tracking-wide mx-auto mb-6 ">
        <span className="bg-gradient-to-r from-emerald-500 via-purple-400 to-purple-600 bg-clip-text text-transparent">Turn Meetings Into</span>{" "}
        <br />
        <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-emerald-500 bg-clip-text text-transparent">
          Actionable Insights
        </span>
      </h1>

      {/* Hero Description */}
      <p className="animate-fade-in-up delay-200 text-xl lg:text-xl text-text-secondary text-center max-w-2xl lg:max-w-3xl leading-relaxed mb-12">
        Upload recorded audio for instant AI summaries or get live transcripts during meetings.
        Save time, capture every key point effortlessly
      </p>

      {/* CTA Buttons */}
      <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 flex-wrap justify-center mb-20">
        <button
          onClick={onScrollToUpload}
          className="group bg-gradient-to-r from-purple-600 to-purple-500 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-2xl hover:-translate-y-2 hover:shadow-3xl active:scale-95 flex items-center gap-3"
          id="hero-upload-btn"
        >
          <UploadIcon />
          <span>Upload Your Meeting</span>
        </button>
      </div>

      <div className="animate-fade-in-up delay-400 flex flex-wrap gap-12 lg:gap-16 justify-center">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center min-w-[120px]">
            <div className="text-2xl lg:text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
              {stat.value}
            </div>
            <div className="text-xs uppercase text-text-muted mt-2 font-medium tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
