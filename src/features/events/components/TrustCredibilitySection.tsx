import React from 'react';
import { ShieldCheck, Award, Users, HeartHandshake, CheckCircle2, Star, Sparkles } from 'lucide-react';

export const TrustCredibilitySection: React.FC = () => {
  const trustPillars = [
    {
      icon: <VolumeIcon className="w-5 h-5 text-[#23A2B3]" />,
      title: 'Acoustically Audited Stages',
      description:
        'Every partner auditorium, stone atrium, and studio is pre-calibrated to deliver natural reverberation without deafening synthetic PA systems.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: 'Anti-Scalp QR Guarantee',
      description:
        'Dynamic non-transferable digital passes ensure tickets reach real listeners at face value. Instant 100% full refund up to 24 hours prior.',
    },
    {
      icon: <Award className="w-5 h-5 text-amber-400" />,
      title: 'Curator & Artist First',
      description:
        'Over 85% of net ticket revenue transfers directly to independent performers within 48 hours of final curtain call.',
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-[#E34060]" />,
      title: 'Intimate Patron Circles',
      description:
        'Small gathering caps (25 to 80 attendees) create genuine conversation between performers and listeners over artisanal refreshments.',
    },
  ];

  return (
    <section className="bg-[#231E59] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#23A2B3]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#E34060]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#23A2B3] text-xs font-bold uppercase tracking-wider font-heading">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Credibility & Patron Trust</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-heading tracking-tight leading-tight">
            The Gold Standard for Intimate Acoustic Sound
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
            In an era of stadium noise and algorithmic hype, Iktaraa stands for listening intimacy, fair compensation for artists, and transparent cultural curation.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-14">
          {trustPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6 transition-all duration-300 space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                {pillar.icon}
              </div>

              <h4 className="text-base font-bold text-white font-heading leading-snug">
                {pillar.title}
              </h4>

              <p className="text-xs text-neutral-300 font-light leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

        {/* Patron Testimonials & Stat Ribbons */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex -space-x-2 shrink-0">
              {['/src/assets/images/event_story_coffee_1794043988015.jpg', '/src/assets/images/hero_acoustic_live_1794043985230.jpg', '/src/assets/images/promo_instruments_studio_1794043985261.jpg'].map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Patron"
                  className="w-10 h-10 rounded-full border-2 border-[#231E59] object-cover"
                />
              ))}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
                <span className="text-xs font-bold text-white ml-1 font-mono">4.96 / 5.0</span>
              </div>
              <p className="text-xs text-neutral-300 font-light">
                Loved by <strong>45,000+</strong> listeners across Chennai, Bengaluru & Mumbai
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-neutral-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              100% Refundable Tickets
            </span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#23A2B3] shrink-0" />
              Verified Organizer Badges
            </span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#E34060] shrink-0" />
              Safe Razorpay/UPI Checkout
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

const VolumeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
    />
  </svg>
);
