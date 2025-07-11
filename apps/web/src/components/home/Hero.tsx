"use client";

import Image from "next/image";

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-[#172F50] to-[#0F1E35] text-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transform Your{" "}
              <span className="text-[#C8D2E0]">Smartphone</span>{" "}
              Into a Plainphone
            </h1>
            <p className="text-xl md:text-2xl text-[#C8D2E0] mb-8 leading-relaxed">
              Reduce screen time and digital distractions with our minimalist app that replaces colorful icons with simple text.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button className="bg-white text-[#172F50] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#E1E1E1] transition-colors">
                Download for iOS
              </button>
              <button className="bg-white text-[#172F50] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#E1E1E1] transition-colors">
                Download for Android
              </button>
            </div>
            <div className="flex items-center gap-6 text-[#C8D2E0]">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span>4.8/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                <span>10K+ Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                <span>Privacy First</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white p-8 rounded-2xl shadow-2xl">
              <div className="bg-[#F7F7F7] p-6 rounded-xl">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-[#172F50] mb-2">Plainphone</h3>
                  <p className="text-[#7A7A7A]">Your minimalist home screen</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#E1E1E1] p-4 rounded-lg text-center border border-[#B3B3B3]">
                    <p className="text-[#172F50] font-medium">Phone</p>
                  </div>
                  <div className="bg-[#E1E1E1] p-4 rounded-lg text-center border border-[#B3B3B3]">
                    <p className="text-[#172F50] font-medium">Messages</p>
                  </div>
                  <div className="bg-[#E1E1E1] p-4 rounded-lg text-center border border-[#B3B3B3]">
                    <p className="text-[#172F50] font-medium">Camera</p>
                  </div>
                  <div className="bg-[#E1E1E1] p-4 rounded-lg text-center border border-[#B3B3B3]">
                    <p className="text-[#172F50] font-medium">Maps</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-[#28A745] text-white px-4 py-2 rounded-full text-sm font-semibold">
              New
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
