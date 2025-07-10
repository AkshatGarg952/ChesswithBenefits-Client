import { useEffect, useRef } from 'react';

const VideoCall = ({
  isLocal = false,
  peerConnection,
  targetSocketId,
  socket,
  onCallUser = null, // Only passed for local player
  isActive = false,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const setup = async () => {
      if (isLocal) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;

        stream.getTracks().forEach((track) =>
          peerConnection.addTrack(track, stream)
        );
      } else {
        peerConnection.ontrack = (event) => {
          if (videoRef.current) videoRef.current.srcObject = event.streams[0];
        };
      }
    };
    setup();
  }, [isLocal, peerConnection]);

  return (
    <div
      className={`relative w-full h-full rounded-lg lg:rounded-xl overflow-hidden transition-all duration-300 ${
        isActive ? 'ring-2 ring-orange-200' : ''
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted={isLocal}
        className="w-full h-full object-cover"
      />

      {/* Optional call button for local player */}
      {isLocal && onCallUser && (
        <button
          onClick={onCallUser}
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-md shadow-md"
        >
          📞 Call Other Player
        </button>
      )}
    </div>
  );
};

export default VideoCall;
