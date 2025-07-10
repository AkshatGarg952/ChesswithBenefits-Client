import React from 'react';
import { Users, Video, MessageCircle, Brain, Mic, TrendingUp } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Play with Friends in Private Rooms",
      description: "Create exclusive chess rooms and invite friends for private matches with custom settings.",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: Video,
      title: "Video Call While You Play",
      description: "See your opponent's reactions in real-time with integrated video calling during matches.",
      gradient: "from-green-500 to-teal-600"
    },
    {
      icon: MessageCircle,
      title: "Real-Time Chat Support",
      description: "Communicate with your opponent through our built-in chat system with emoji support.",
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: Brain,
      title: "3 Modes of AI Live Commentary",
      description: "Choose from Basic, Advanced Tactical, or Entertaining commentary styles during your games.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: Mic,
      title: "Voice Mode to Command Moves",
      description: "Control your pieces using voice commands - just say your move and watch it happen.",
      gradient: "from-indigo-500 to-blue-600"
    },
    {
      icon: TrendingUp,
      title: "Move Quality Analysis",
      description: "Get instant feedback on your moves from Brilliant to Blunder with detailed explanations.",
      gradient: "from-yellow-500 to-orange-600"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Revolutionary Chess Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience chess like never before with our cutting-edge features designed 
            for modern players who want more than just a game.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <FeatureIcon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="mt-6 flex items-center text-orange-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm">Learn more</span>
                  <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;