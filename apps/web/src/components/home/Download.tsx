"use client";

const Download = () => {
  return (
    <section className="py-20 bg-[#172F50]">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Download focUIs Today
        </h2>
        <p className="text-xl text-[#C8D2E0] mb-12 max-w-3xl mx-auto">
          Join thousands of users who have already transformed their smartphone experience and reduced their screen time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <div className="bg-white p-8 rounded-lg">
            <div className="text-4xl mb-4">🍎</div>
            <h3 className="text-2xl font-bold text-[#172F50] mb-3">iOS Version</h3>
            <p className="text-[#7A7A7A] mb-6">
              Available on iPhone and iPad. Optimized for iOS design guidelines.
            </p>
            <ul className="text-left text-[#7A7A7A] mb-6 space-y-2">
              <li>• iOS 13.0 or later</li>
              <li>• iPhone and iPad compatible</li>
              <li>• Optimized for iOS widgets</li>
              <li>• iCloud sync support</li>
            </ul>
            <button className="w-full bg-[#172F50] text-white py-3 rounded-lg font-semibold hover:bg-[#0F1E35] transition-colors">
              Download for iOS
            </button>
          </div>

          <div className="bg-white p-8 rounded-lg">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-[#172F50] mb-3">Android Version</h3>
            <p className="text-[#7A7A7A] mb-6">
              Available on all Android devices. Full access to installed apps.
            </p>
            <ul className="text-left text-[#7A7A7A] mb-6 space-y-2">
              <li>• Android 8.0 or later</li>
              <li>• All Android devices</li>
              <li>• App detection support</li>
              <li>• Custom launcher integration</li>
            </ul>
            <button className="w-full bg-[#172F50] text-white py-3 rounded-lg font-semibold hover:bg-[#0F1E35] transition-colors">
              Download for Android
            </button>
          </div>
        </div>

        <div className="bg-[#0F1E35] p-8 rounded-lg max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">
            What Users Are Saying
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-[#172F50] p-6 rounded-lg">
              <p className="text-[#C8D2E0] mb-4">
                &ldquo;Finally, a way to use my phone without getting distracted by colorful icons everywhere.&rdquo;
              </p>
              <p className="text-white font-semibold">- Sarah M.</p>
            </div>
            <div className="bg-[#172F50] p-6 rounded-lg">
              <p className="text-[#C8D2E0] mb-4">
                &ldquo;My screen time dropped by 60% in the first week. This app really works!&rdquo;
              </p>
              <p className="text-white font-semibold">- Mike R.</p>
            </div>
            <div className="bg-[#172F50] p-6 rounded-lg">
              <p className="text-[#C8D2E0] mb-4">
                &ldquo;Simple, effective, and exactly what I needed to break my phone addiction.&rdquo;
              </p>
              <p className="text-white font-semibold">- Lisa K.</p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-[#C8D2E0] mb-4">
            Free to download • No ads • No tracking • Privacy focused
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#28A745] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#218838] transition-colors">
              Start Free Trial
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#172F50] transition-colors">
              View Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Download; 