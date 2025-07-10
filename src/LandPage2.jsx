import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import AICommentary from './components/AICommentary';
import MoveAnalysis from './components/MoveAnalysis';
import Testimonials from './components/Testimonials';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

function LandPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <AICommentary />
      <MoveAnalysis />
      <Testimonials />
      <CallToAction />
      <Footer />
    </div>
  );
}

export default LandPage;