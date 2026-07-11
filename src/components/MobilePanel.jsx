import { X } from 'lucide-react';

const MobilePanel = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose}
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} />

      {/* Panel */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col animate-slide-right"
        style={{
          maxHeight: '80vh',
          background: 'linear-gradient(180deg, rgba(18,15,28,0.99) 0%, rgba(12,10,20,1) 100%)',
          border: '1px solid rgba(201,168,76,0.15)',
          borderBottom: 'none',
          borderRadius: '1.25rem 1.25rem 0 0',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.6)',
        }}>
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(201,168,76,0.25)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <h3 className="font-semibold text-sm" style={{ color: 'rgba(220,210,185,0.85)', fontFamily: 'Outfit, sans-serif' }}>{title}</h3>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <X style={{ width: '14px', height: '14px', color: 'rgba(220,210,185,0.7)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobilePanel;