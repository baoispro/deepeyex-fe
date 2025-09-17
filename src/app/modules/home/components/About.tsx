import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="relative">
      <div className="py-4 px-6 md:px-12">
        <div className="flex justify-between gap-20">
          <div>
            <div className="mb-6 relative">
              {/* Who We Are? */}
              <span
                className="relative inline-block text-8xl font-jost font-extrabold text-transparent"
                style={{
                  background: "-webkit-linear-gradient(0deg, #f4e5da, #def4f1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Who We Are?
              </span>

              {/* H2 nằm trên */}
              <h2 className="absolute -bottom-10 left-0 text-3xl font-semibold text-gray-800">
                AI-Powered Eye Diagnosis for Early Detection and Vision Care
              </h2>
            </div>
            <p className="mt-15 text-gray-700 text-justify">
              DeepEyeX is an AI-powered eye disease diagnosis system that helps you detect eye
              conditions early, ensuring precise, personalized, and holistic care for your vision.
              With up to 94% accuracy, you can trust our technology to protect your eyes and take
              control of your eye health.
            </p>
          </div>
          <div className="relative inline-block flex-shrink-0">
            <Image
              src="https://23july.hostlin.com/optcare/wp-content/uploads/2022/05/about-1.png"
              alt="About Us"
              width={500}
              height={500}
              className="relative"
            />
            <div className="absolute left-0 bottom-0 p-4 bg-[#f17732] rounded-lg flex items-center space-x-2 w-60 gap-5">
              <h2 className="text-lg font-bold text-white">10,000+</h2>
              <h4 className="text-sm text-white">Eyes Diagnosed with AI Precision</h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
