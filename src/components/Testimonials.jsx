import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Alex Chen",
      role: "Chess Master",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
      rating: 5,
      content: "The AI commentary is absolutely brilliant! It's like having a grandmaster explain every move in real-time. The voice control feature is game-changing.",
      highlight: "AI commentary is absolutely brilliant!"
    },
    {
      name: "Sarah Williams",
      role: "Tournament Player",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
      rating: 5,
      content: "Playing chess with friends while on video call brings back the social aspect of the game. The move analysis helps me understand my mistakes instantly.",
      highlight: "Brings back the social aspect of chess"
    },
    {
      name: "Michael Rodriguez",
      role: "Chess Enthusiast",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
      rating: 5,
      content: "I've been playing chess for years, but this platform took my game to the next level. The different commentary modes keep every game interesting and educational.",
      highlight: "Took my game to the next level"
    },
    {
      name: "Emma Thompson",
      role: "Chess Coach",
      avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
      rating: 5,
      content: "As a coach, I love how this platform helps my students learn. The move quality analysis is perfect for teaching chess principles and tactical patterns.",
      highlight: "Perfect for teaching chess principles"
    },
    {
      name: "David Kim",
      role: "Software Developer",
      avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
      rating: 5,
      content: "The voice commands work flawlessly! I can play during breaks without even touching my mouse. The technology behind this is impressive.",
      highlight: "Voice commands work flawlessly!"
    },
    {
      name: "Lisa Anderson",
      role: "Chess Streamer",
      avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
      rating: 5,
      content: "My viewers love the entertaining commentary mode! It makes my streams more engaging and helps explain complex positions in a fun way.",
      highlight: "Makes streams more engaging"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Chess Players Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of chess enthusiasts who have transformed their game 
            with our revolutionary chess platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              {/* Quote Icon */}
              <div className="flex justify-between items-start mb-4">
                <Quote className="h-8 w-8 text-orange-500 opacity-20" />
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                {testimonial.content}
              </p>

              {/* Highlight */}
              <div className="bg-orange-50 rounded-lg p-3 mb-4 border-l-4 border-orange-500">
                <p className="text-orange-800 font-medium text-sm">
                  "{testimonial.highlight}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center space-x-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">10K+</div>
            <div className="text-gray-600">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">50K+</div>
            <div className="text-gray-600">Games Played</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">4.9</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">95%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;