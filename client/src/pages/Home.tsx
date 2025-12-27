import Footer from '../components/Footer'
import Header from '../components/Header'
import AboutSection from '../components/home/AboutSection'
import HeroSection from '../components/home/HeroSection'

// import profileImage from '../assets/images/Folasade_Adepoju.jpg'
import profileImage from '../assets/images/Folashade-960x750.jpg'
import ContributionsSection from '../components/home/ContributionsSection'

const Home = () => {
  
  return (
    <div className='min-h-screen bg-[#f0f0f0]'>

      {/* Header component */}
      <Header />

      {/* Hero Section */}
      <HeroSection
        name="Folasade Adepoju"
        jobTitle="Chief Librarian"
        workplace="The National Library of Nigeria Headquarters, Abuja."
        profileImage={profileImage} 
      />

      {/* About Section */}
      <section  id='about'>
      <AboutSection />
      </section >

      {/* Contributions Section */}
      <ContributionsSection />
      {/* <ContributionsSection archives={archives} /> */}

      {/* Footer component */}
      <Footer />

    </div>
  )
}

export default Home