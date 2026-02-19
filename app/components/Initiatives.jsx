"use client";

import {
  Scale,
  Award,
  HeartHandshake,
  Stethoscope,
  GraduationCap,
  Home,
} from "lucide-react";

export default function Initiatives() {
  const initiatives = [

     {
      icon: <Home size={32} />,
      title: "Old Age Homes Support",
      description:
        "Providing shelter, medical assistance, and emotional support to ensure dignity and care for senior citizens.",
    },

    {
      icon: <HeartHandshake size={32} />,
      title: "Marriage Counseling & Legal Support",
      description:
        "Professional marriage counseling and legal guidance to strengthen families, resolve conflicts peacefully, and promote emotional and legal awareness.",
    },
    {
      icon: <Award size={32} />,
      title: "Legendary Awards Function",
      description:
        "An annual recognition initiative honoring individuals who have rendered selfless service across various professions, inspiring leadership and excellence.",
    },
    {
      icon: <Scale size={32} />,
      title: "Free Marriage Introduction Platform",
      description:
        "A transparent and dignified annual platform supporting poor and middle-class families in finding suitable alliances within the community.",
    },
    {
      icon: <Stethoscope size={32} />,
      title: "Health Camps",
      description:
        "Free medical checkups, health screenings, and awareness programs conducted in rural and urban areas without discrimination.",
    },
    {
      icon: <GraduationCap size={32} />,
      title: "Educational Scholarships",
      description:
        "Financial assistance for children from economically weaker families to encourage education and long-term social upliftment.",
    },
   
  ];

  return (
    <section
  id="initiatives"
  className="py-20 bg-black text-white scroll-mt-32"
>


      <div className="max-w-7xl mx-auto px-6">

        {/* Section Title */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-yellow-400">
            Our Initiatives
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Kamma Icon Trust is committed to empowering society through structured
            initiatives focused on welfare, education, healthcare, and community development.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">

          {initiatives.map((item, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 p-8 rounded-2xl hover:border-yellow-400 transition duration-300"
            >
              <div className="text-yellow-400 mb-4">
                {item.icon}
              </div>

              <h3 className="text-xl font-semibold mb-4">
                {item.title}
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
