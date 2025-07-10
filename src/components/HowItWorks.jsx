import React, {useState} from 'react';
import { UserPlus, Users, PlayCircle } from 'lucide-react';
import AuthModal from './AuthModal';
import { useNavigate } from 'react-router-dom';
const HowItWorks = () => {
  const navigate = useNavigate();
    const userId = sessionStorage.getItem('user');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
      const [isLoggedIn, setIsLoggedIn] = useState(false);
      const [showAuthModal, setShowAuthModal] = useState(false);
      const [authMode, setAuthMode] = useState('login');
  
      const handlePlayClick = () => {
      navigate('/dashboard'); 
    };
    
      const handleLogin = () => {
        setAuthMode('login');
        setShowAuthModal(true);
      };
    
    
      const handleAuthSuccess = () => {
        setIsLoggedIn(true);
        setShowAuthModal(false);
      };
   

  const steps = [
    {
      icon: UserPlus,
      title: "Create/Join Room",
      description: "Start by creating a private room or joining an existing one with a simple room code.",
      color: "orange"
    },
    {
      icon: Users,
      title: "Invite Your Friend or Play AI",
      description: "Share your room code with friends or challenge our advanced AI opponent.",
      color: "red"
    },
    {
      icon: PlayCircle,
      title: "Play, Talk, Learn and Enjoy",
      description: "Experience chess with voice commands, video calls, and AI commentary.",
      color: "pink"
    }
  ];

  return (
    <>
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in just three simple steps and experience the future of online chess.
          </p>
        </div>

        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-orange-300 to-pink-300 transform -translate-y-1/2"></div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={index} className="text-center relative">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                    {index + 1}
                  </div>
                  
                  {/* Icon Container */}
                  <div className={`mx-auto mb-6 w-20 h-20 bg-gradient-to-r ${
                    step.color === 'orange' ? 'from-orange-100 to-orange-200' :
                    step.color === 'red' ? 'from-red-100 to-red-200' :
                    'from-pink-100 to-pink-200'
                  } rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <StepIcon className={`h-10 w-10 ${
                      step.color === 'orange' ? 'text-orange-600' :
                      step.color === 'red' ? 'text-red-600' :
                      'text-pink-600'
                    }`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">

          {userId ? 
              (<button onClick={handlePlayClick}
               className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 hover:scale-105 shadow-lg">
            <PlayCircle className="h-5 w-5 mr-2" />
            Start Your First Game
          </button>) : 
              (<button onClick={handleLogin}
               className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 hover:scale-105 shadow-lg">
            <PlayCircle className="h-5 w-5 mr-2" />
            Start Your First Game
          </button>)
              }


  
        </div>
      </div>
    </section>

    <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSuccess={handleAuthSuccess}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />
    </>
  );
};

export default HowItWorks;