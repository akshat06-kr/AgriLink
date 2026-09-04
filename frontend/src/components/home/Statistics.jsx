import React from 'react';

const Statistics = () => {
  const stats = [
    { label: "Farmers Connected", value: "250+", suffix: "" },
    { label: "Products Listed", value: "1,200+", suffix: "" },
    { label: "Orders Completed", value: "5,000+", suffix: "" },
    { label: "Regions Served", value: "12", suffix: "" }
  ];

  return (
    <div className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <section 
        className="relative py-8 sm:py-10 lg:py-12 max-w-7xl mx-auto rounded-3xl sm:rounded-[2.5rem] lg:rounded-[3rem] bg-slate-950 text-white overflow-hidden bg-cover bg-center bg-no-repeat shadow-2xl shadow-emerald-950/25 border border-emerald-900/30"
        style={{ backgroundImage: "url('/stats-farm-bg.jpg')" }}
        aria-label="AgriLink Platform Statistics"
      >
        {/* Subtle Translucent Dark-Green Overlay (30–40% visible tint) */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-emerald-950/65 to-slate-950/75 backdrop-blur-[1px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6 text-center">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="group relative p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-md bg-slate-900/60 border border-white/15 hover:border-emerald-400/40 shadow-lg shadow-slate-950/25 hover:shadow-2xl hover:shadow-emerald-950/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center items-center cursor-default"
              >
                {/* Stat Value */}
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-1.5 drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
                  {stat.value}
                </div>

                {/* Stat Label */}
                <div className="text-emerald-100 font-bold uppercase tracking-wider text-[11px] sm:text-xs lg:text-sm leading-snug">
                  {stat.label}
                </div>

                {/* Subtle Bottom Accent Indicator */}
                <div className="mt-2.5 w-6 h-0.5 bg-emerald-400/40 group-hover:w-10 group-hover:bg-emerald-400 rounded-full transition-all duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Statistics;
