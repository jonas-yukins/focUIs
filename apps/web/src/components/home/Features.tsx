"use client";

import { CheckCircle } from "lucide-react";

const Features = () => {
  const features = [
    {
      title: "Minimalist Interface",
      description: "Replace colorful app icons with clean, text-based widgets that reduce visual distractions.",
      icon: "📱",
    },
    {
      title: "Customizable App Selection",
      description: "Choose exactly which apps to display on your home screen. Only show what you actually need.",
      icon: "⚙️",
    },
    {
      title: "Reduce Screen Time",
      description: "The simple interface helps you break the habit of mindlessly scrolling through colorful apps.",
      icon: "⏰",
    },
    {
      title: "Cross-Platform",
              description: "Works on both iOS and Android devices. Transform any smartphone into a focUIs device.",
      icon: "🔄",
    },
    {
      title: "Privacy Focused",
      description: "No tracking, no ads, no data collection. Your app usage stays private.",
      icon: "🔒",
    },
    {
      title: "Easy Setup",
      description: "Get started in minutes. Select your apps and start using your new minimalist interface.",
      icon: "🚀",
    },
  ];

  return (
    <section className="py-20 bg-[#F7F7F7]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#172F50] mb-4">
            Why Choose focUIs?
          </h2>
          <p className="text-xl text-[#7A7A7A] max-w-3xl mx-auto">
            Transform your smartphone experience with our minimalist approach to digital wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-lg border border-[#E1E1E1] hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-[#172F50] mb-3">
                {feature.title}
              </h3>
              <p className="text-[#7A7A7A] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-[#172F50] text-white p-8 rounded-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Phone?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of users who have already reduced their screen time and improved their digital wellbeing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-[#172F50] px-8 py-3 rounded-lg font-semibold hover:bg-[#E1E1E1] transition-colors">
                Download for iOS
              </button>
              <button className="bg-white text-[#172F50] px-8 py-3 rounded-lg font-semibold hover:bg-[#E1E1E1] transition-colors">
                Download for Android
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features; 