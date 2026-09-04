import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Ramesh Patel",
      role: "Organic Farmer, Nashik",
      quote: "AgriLink gives me a direct connection to consumers. I get fair market pricing instantly without middlemen taking 40% of my harvest value.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80"
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "Verified Buyer, New Delhi",
      quote: "The vegetables taste completely different when harvested fresh and delivered within 24 hours. The price transparency breakdown is remarkable.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80"
    },
    {
      id: 3,
      name: "Anil Kumar",
      role: "Tomato & Wheat Producer, Punjab",
      quote: "Managing my listings and viewing real-time demand insights has simplified my operations. I can plan crop cycles with confidence.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80"
    }
  ];

  return (
    <div className="py-24 bg-white border-y border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-surface-50 -z-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">What Our Users Say</h2>
          <div className="mt-4 h-1 w-20 bg-agri-green mx-auto rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="card relative p-8">
              <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-100 -z-10 transform rotate-180" />
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-earth-brown fill-current' : 'text-slate-300'}`} />
                ))}
              </div>
              <p className="text-slate-600 mb-6 italic text-lg leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center mt-auto">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-emerald-100 shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-slate-800">{testimonial.name}</h4>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
