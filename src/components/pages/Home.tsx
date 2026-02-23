import { memo } from 'react';
import HeroSection from '../shared/HeroSection';
import HomeServices from '../shared/HomeServices';
import Tabs from '../shared/Tabs';
import BottomNav from '../shared/BottomNav';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './Home.css';

const Home = memo(function Home() {
  // Scroll reveal animations standardizzate
  useScrollReveal('.home-page .scroll-reveal-item', {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  return (
    <main className="home-page">
      {/* Hero section è nel viewport iniziale - non nascondere per ottimizzare LCP */}
      <section className="scroll-reveal-item scroll-reveal-visible">
        <HeroSection />
      </section>
      <nav className="scroll-reveal-item scroll-reveal-hidden">
        <BottomNav />
      </nav>
      <section className="scroll-reveal-item scroll-reveal-hidden">
        <HomeServices />
      </section>
      <section className="scroll-reveal-item scroll-reveal-hidden">
        <Tabs />
      </section>
    </main>
  );
});

export default Home;
