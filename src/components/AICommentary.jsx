import React, { useState } from 'react';
import { Brain, Zap, Smile, ChevronLeft, ChevronRight } from 'lucide-react';

const AICommentary = () => {
  const [activeMode, setActiveMode] = useState(0);
  
  const commentaryModes = [
    {
      icon: Brain,
      title: "Basic Commentary Mode",
      description: "Clean, educational commentary perfect for learning chess fundamentals.",
      example: "White develops the knight to f3, controlling the center and preparing kingside castling.",
      color: "blue",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: Zap,
      title: "Advanced Tactical Commentary",
      description: "Deep analysis with tactical explanations and strategic insights.",
      example: "This knight fork creates a double attack on the king and rook - a classic tactical motif that wins material.",
      color: "purple",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: Smile,
      title: "Funny & Entertaining Commentary",
      description: "Humorous commentary that makes chess fun and engaging for everyone.",
      example: "Oh my! That rook just went on a vacation to the wrong square - looks like it's getting evicted!",
      color: "orange",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const nextMode = () => {
    setActiveMode((prev) => (prev + 1) % commentaryModes.length);
  };

  const prevMode = () => {
    setActiveMode((prev) => (prev - 1 + commentaryModes.length) % commentaryModes.length);
  };

  const ActiveIcon = commentaryModes[activeMode].icon;

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AI Commentary Modes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from three distinct AI commentary styles that enhance your chess experience 
            and help you learn while you play.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Mode Selector */}
          <div className="flex justify-center mb-8 space-x-4">
            {commentaryModes.map((mode, index) => {
              const ModeIcon = mode.icon;
              return (
                <button
                  key={index}
                  onClick={() => setActiveMode(index)}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    activeMode === index
                      ? `bg-gradient-to-r ${mode.gradient} text-white shadow-lg scale-105`
                      : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
                  }`}
                >
                  <ModeIcon className="h-6 w-6" />
                </button>
              );
            })}
          </div>

          {/* Active Mode Display */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <div className="text-center mb-6">
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${commentaryModes[activeMode].gradient} mb-4`}>
                <ActiveIcon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {commentaryModes[activeMode].title}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {commentaryModes[activeMode].description}
              </p>
            </div>

            {/* Commentary Example */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">AI Commentary</p>
                  <p className="text-gray-900 leading-relaxed">
                    "{commentaryModes[activeMode].example}"
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevMode}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              
              <div className="flex space-x-2">
                {commentaryModes.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      activeMode === index ? 'bg-orange-500 w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextMode}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AICommentary;