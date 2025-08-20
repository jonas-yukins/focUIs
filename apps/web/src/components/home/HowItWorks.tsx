"use client";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Download & Install",
              description: "Get the focUIs app from the App Store or Google Play Store. It's free and takes just a few seconds to install.",
      icon: "📥",
    },
    {
      number: "02",
      title: "Select Your Apps",
      description: "Choose which apps you want to keep accessible. You can select from common apps or add custom ones.",
      icon: "✅",
    },
    {
      number: "03",
      title: "Customize Interface",
      description: "Adjust font size, theme, and layout to match your preferences. Keep it simple or add personal touches.",
      icon: "🎨",
    },
    {
      number: "04",
      title: "Start Using",
      description: "Your new minimalist home screen is ready! Tap on app names to launch them, just like before.",
      icon: "🚀",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#172F50] mb-4">
            How It Works
          </h2>
          <p className="text-xl text-[#7A7A7A] max-w-3xl mx-auto">
            Transform your smartphone into a focUIs in just four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="text-6xl mb-4">{step.icon}</div>
                <div className="absolute -top-2 -right-2 bg-[#172F50] text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                  {step.number}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#172F50] mb-3">
                {step.title}
              </h3>
              <p className="text-[#7A7A7A] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-[#E1E1E1] p-8 rounded-lg max-w-4xl mx-auto border border-[#B3B3B3]">
            <h3 className="text-2xl font-bold text-[#172F50] mb-4">
              That&apos;s It!
            </h3>
            <p className="text-lg text-[#7A7A7A] mb-6">
              No complicated setup, no learning curve. Just a simple, effective way to reduce screen time and improve your digital wellbeing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#172F50] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0F1E35] transition-colors">
                Get Started Now
              </button>
              <button className="border border-[#172F50] text-[#172F50] px-8 py-3 rounded-lg font-semibold hover:bg-[#172F50] hover:text-white transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 