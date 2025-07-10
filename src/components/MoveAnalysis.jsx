import React, { useState } from 'react';
import { Gem, CheckCircle, ThumbsUp, AlertTriangle, X, Zap } from 'lucide-react';

const MoveAnalysis = () => {
  const [hoveredMove, setHoveredMove] = useState(null);
  
  const moveTypes = [
    {
      id: 'brilliant',
      name: 'Brilliant',
      icon: Gem,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50 border-cyan-200',
      textColor: 'text-cyan-700',
      description: 'An exceptional move that shows deep calculation and creativity'
    },
    {
      id: 'best',
      name: 'Best',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
      description: 'The optimal move in the position according to engine analysis'
    },
    {
      id: 'good',
      name: 'Good',
      icon: ThumbsUp,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
      description: 'A solid move that maintains your position without major flaws'
    },
    {
      id: 'inaccurate',
      name: 'Inaccurate',
      icon: AlertTriangle,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-700',
      description: 'A move that slightly worsens your position but is still playable'
    },
    {
      id: 'mistake',
      name: 'Mistake',
      icon: X,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-700',
      description: 'A move that significantly damages your position'
    },
    {
      id: 'blunder',
      name: 'Blunder',
      icon: Zap,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-700',
      description: 'A serious mistake that loses material or the game'
    }
  ];

  const sampleMoves = [
    { move: 'Qh5+', type: 'brilliant', evaluation: '+2.5' },
    { move: 'Nf3', type: 'best', evaluation: '+0.2' },
    { move: 'Bc4', type: 'good', evaluation: '+0.1' },
    { move: 'h3', type: 'inaccurate', evaluation: '-0.3' },
    { move: 'Qg4??', type: 'blunder', evaluation: '-4.2' }
  ];

  // Chess piece symbols for the demo board
  const chessPieces = {
    'white-king': '♔',
    'white-queen': '♕',
    'white-rook': '♖',
    'white-bishop': '♗',
    'white-knight': '♘',
    'white-pawn': '♙',
    'black-king': '♚',
    'black-queen': '♛',
    'black-rook': '♜',
    'black-bishop': '♝',
    'black-knight': '♞',
    'black-pawn': '♟'
  };

  // Sample mid-game position
  const sampleBoard = [
    ['black-rook', null, null, 'black-queen', 'black-king', null, null, 'black-rook'],
    ['black-pawn', 'black-pawn', null, null, null, 'black-pawn', 'black-pawn', 'black-pawn'],
    [null, null, 'black-pawn', null, null, 'black-knight', null, null],
    [null, null, null, 'black-pawn', 'white-pawn', null, null, null],
    [null, null, 'white-bishop', 'white-pawn', null, null, null, null],
    [null, null, 'white-knight', null, null, 'white-knight', null, null],
    ['white-pawn', 'white-pawn', 'white-pawn', null, null, 'white-pawn', 'white-pawn', 'white-pawn'],
    ['white-rook', null, null, 'white-queen', 'white-king', null, null, 'white-rook']
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Real-time Move Analysis
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get instant feedback on every move with our advanced evaluation system. 
            Learn from your games and improve your chess understanding.
          </p>
        </div>

        {/* Move Rating System */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {moveTypes.map((moveType) => {
            const MoveTypeIcon = moveType.icon;
            return (
              <div
                key={moveType.id}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:-translate-y-1 ${moveType.bgColor}`}
                onMouseEnter={() => setHoveredMove(moveType.id)}
                onMouseLeave={() => setHoveredMove(null)}
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${moveType.color} mr-4`}>
                    <MoveTypeIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold ${moveType.textColor}`}>
                    {moveType.name}
                  </h3>
                </div>
                
                <p className="text-gray-600 leading-relaxed">
                  {moveType.description}
                </p>
                
                {hoveredMove === moveType.id && (
                  <div className="mt-4 text-sm text-gray-500 animate-fade-in">
                    Click to see examples →
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Interactive Demo */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Interactive Move Analysis Demo
          </h3>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-8 gap-1 mb-6 max-w-md mx-auto">
              {sampleBoard.map((row, rowIndex) =>
                row.map((piece, colIndex) => {
                  const isLight = (rowIndex + colIndex) % 2 === 0;
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`aspect-square rounded-sm flex items-center justify-center text-lg ${
                        isLight ? 'bg-orange-100' : 'bg-orange-800'
                      }`}
                    >
                      {piece && (
                        <span className="text-gray-800 drop-shadow-sm">
                          {chessPieces[piece]}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Moves Analysis:</h4>
              {sampleMoves.map((move, index) => {
                const moveTypeData = moveTypes.find(type => type.id === move.type);
                const IconComponent = moveTypeData.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${moveTypeData?.color}`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-mono text-lg font-semibold">{move.move}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${moveTypeData?.textColor} ${moveTypeData?.bgColor}`}>
                        {moveTypeData?.name}
                      </span>
                    </div>
                    <span className={`font-mono font-semibold ${
                      move.evaluation.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {move.evaluation}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoveAnalysis;