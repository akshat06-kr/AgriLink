import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: "What is AgriLink?", a: "AgriLink is a digital marketplace that connects farmers directly with customers, removing unnecessary middlemen to ensure fair pricing and complete transparency." },
    { q: "How does AgriLink help farmers?", a: "We provide farmers with a platform to list their products, manage orders, track earnings, and gain visibility into market reference prices." },
    { q: "How can I buy products directly from farmers?", a: "Simply sign up as a Customer, browse the marketplace for fresh local produce, add items to your cart, and place an order directly with the farmer." },
    { q: "How does price transparency work?", a: "For eligible products, we display the Farmer's Price alongside a Market Reference Price, showing exactly how much the farmer earns and how much you save." },
    { q: "Can I track my order?", a: "Yes, you can track your order status (Placed, Confirmed, Packed, Shipped, Delivered) directly from your Customer Dashboard." },
    { q: "Can customers rate products?", a: "Yes, once an order is marked as 'Delivered', customers can leave ratings and reviews to help other buyers make informed decisions." },
    { q: "How can farmers start selling?", a: "Click on 'Join as Farmer' or 'Sell on AgriLink', complete the registration with your farm details, and start listing your products immediately!" }
  ];

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Frequently Asked Questions</h2>
          <div className="mt-4 h-1 w-20 bg-agri-green mx-auto rounded"></div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border rounded-xl transition-all duration-300 ${openIndex === index ? 'border-agri-green bg-agri-green/5 shadow-md' : 'border-slate-200 hover:border-agri-green/50'}`}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                onClick={() => toggle(index)}
              >
                <span className="font-semibold text-slate-800 pr-4">{faq.q}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-agri-green flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="p-5 pt-0 text-slate-600">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
