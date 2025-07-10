import { RotateCcw } from 'lucide-react';

const MoveHistory = ({ moves, className = "" }) => {
  // Group moves by pairs (white and black)
  const groupedMoves = [];
  for (let i = 0; i < moves.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = moves[i];
    const blackMove = moves[i + 1];
    groupedMoves.push({ moveNumber, whiteMove, blackMove });
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-md border border-gray-200 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <RotateCcw className="w-5 h-5 text-orange-600" />
        <h3 className="font-semibold text-gray-800">Move History</h3>
      </div>

      <div className="space-y-3">
        {moves.length === 0 ? (
          <div className="text-center py-8">
            <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No moves yet</p>
            <p className="text-gray-400 text-sm mt-1">Start playing to see move history</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {groupedMoves.map((moveGroup) => (
              <div key={moveGroup.moveNumber} className="flex items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="text-sm font-mono text-gray-700 w-8">{moveGroup.moveNumber}.</span>
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-white border border-gray-400 rounded-sm"></span>
                    <span className="text-sm font-medium text-gray-800">{moveGroup.whiteMove}</span>
                  </div>
                  {moveGroup.blackMove && (
                    <div className="flex items-center space-x-1">
                      <span className="w-3 h-3 bg-gray-800 rounded-sm"></span>
                      <span className="text-sm font-medium text-gray-800">{moveGroup.blackMove}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveHistory;