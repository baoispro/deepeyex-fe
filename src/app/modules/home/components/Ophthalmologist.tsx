import Image from "next/image";

export default function Ophthalmologist() {
  return (
    <section id="Ophthalmologist" className="relative">
      <div className="py-4 px-6 md:px-12">
        <div className="flex flex-col justify-between gap-20">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 relative">
              <span
                className="relative inline-block text-8xl font-jost font-extrabold text-transparent"
                style={{
                  background: "-webkit-linear-gradient(0deg, #f4e5da, #def4f1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Ophthalmologist
              </span>

              <h2 className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-3xl font-semibold text-gray-800">
                The Most Qualified Skillful & Professional staff
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 mt-5">
            <div className="relative bg-white shadow-lg rounded-2xl overflow-hidden group">
              <Image
                src="https://23july.hostlin.com/optcare/wp-content/uploads/2022/10/team-7-2.jpg"
                alt="Susan Hopkins"
                width={300}
                height={300}
                className="w-full h-auto object-cover transition-transform duration-300 ease-in-out transform group-hover:scale-105"
              />
              <div
                className="p-6"
                style={{
                  background: "-webkit-linear-gradient(10deg, #dff4f1, #faeae1 100%)",
                }}
              >
                <h3 className="text-xl font-semibold text-gray-800">Susan Hopkins</h3>
                <p className="text-gray-600">Cataract surgery</p>
              </div>
            </div>

            <div className="relative bg-white shadow-lg rounded-2xl overflow-hidden group">
              <Image
                src="https://23july.hostlin.com/optcare/wp-content/uploads/2022/05/team-7.jpg"
                alt="Keanu Reeves"
                width={300}
                height={300}
                className="w-full h-auto object-cover transition-transform duration-300 ease-in-out transform group-hover:scale-105"
              />
              <div
                className="p-6"
                style={{
                  background: "-webkit-linear-gradient(10deg, #dff4f1, #faeae1 100%)",
                }}
              >
                <h3 className="text-xl font-semibold text-gray-800">Keanu Reeves</h3>
                <p className="text-gray-600">Clarivu eye</p>
              </div>
            </div>

            <div className="relative bg-white shadow-lg rounded-2xl overflow-hidden group">
              <Image
                src="https://23july.hostlin.com/optcare/wp-content/uploads/2022/05/team-7.jpg"
                alt="Dr.Robert De Niro"
                width={300}
                height={300}
                className="w-full h-auto object-cover transition-transform duration-300 ease-in-out transform group-hover:scale-105"
              />
              <div
                className="p-6"
                style={{
                  background: "-webkit-linear-gradient(10deg, #dff4f1, #faeae1 100%)",
                }}
              >
                <h3 className="text-xl font-semibold text-gray-800">Dr. Robert De Niro</h3>
                <p className="text-gray-600">Glaucoma</p>
              </div>
            </div>

            <div className="relative bg-white shadow-lg rounded-2xl overflow-hidden group">
              <Image
                src="https://23july.hostlin.com/optcare/wp-content/uploads/2022/05/team-7.jpg"
                alt="Dr.Mel Gibson"
                width={300}
                height={300}
                className="w-full h-auto object-cover transition-transform duration-300 ease-in-out transform group-hover:scale-105"
              />
              <div
                className="p-6"
                style={{
                  background: "-webkit-linear-gradient(10deg, #dff4f1, #faeae1 100%)",
                }}
              >
                <h3 className="text-xl font-semibold text-gray-800">Dr. Mel Gibson</h3>
                <p className="text-gray-600">Laboratory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
