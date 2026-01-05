const AboutSection = () => {
     const bio = `
    Folashade Adepoju holds a Bachelor of Arts degree in Library Science and Sociology from Bayero University, Kano, and a Master's Degree in Information Management from Ahmadu Bello University, Zaria.
    
    She serves as a Chief Librarian at the National Library of Nigeria Headquarters in Abuja. She is a passionate and dedicated advocate for literacy, education, girl child rights, and environmental/climate action.
    
    In 2025, she published her debut children's book titled *A Monster with a Name and Other Stories* - a thoughtful collection designed to help young readers understand the consequences of climate change through engaging storytelling.
    
    This work inspired deeper exploration into how cultural narratives can shape young minds. With a deep commitment to nurturing responsible future generations, Folashade uses the power of stories to foster empathy, awareness, and positive change in Nigerian children and beyond.
  `.trim();


  return (
    <section className="bg-white py-16">
    <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
      
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-[#0047AB] mb-4">
           About Folashade Adepoju
        </h2>
        <div className="bg-[#FFD700] w-24 h-1 mx-auto rounded-full"></div>
         </div>

         {/* Story */}
        <div className="rounded-2xl border border-blue-100 p-8 md:p-12 shadow-2xl">
            <p className="text-[#333333] leading-relaxed text-base md:text-lg">
                {bio}
            </p>

             {/* Add a signature or personal touch */}
          <div className="mt-10 pt-8 border-t border-gray-200 text-right">
            <p className="text-[#0047AB] font-medium italic text-lg">
              — Folashade Adepoju
            </p>
          </div>
       
      </div>

    </div>
    </section>
  )
}

export default AboutSection
