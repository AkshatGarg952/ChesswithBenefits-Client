import React from 'react';
import { Crown, Mail, Github, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => (
  <footer style={{ background: '#060609', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #8b6914)', boxShadow: '0 0 15px rgba(201,168,76,0.3)' }}>
              <Crown className="h-5 w-5 text-[#0a0a0f]" />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: 'Cinzel, serif', background: 'linear-gradient(135deg, #f5e6c3, #c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Chess with Benefits
            </span>
          </div>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(220,210,185,0.4)' }}>
            The most advanced chess platform with AI commentary, voice control, and live social features.
          </p>
          <div className="flex gap-3">
            {[Twitter, Instagram, Github, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(220,210,185,0.4)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.12)'; e.currentTarget.style.color = '#c9a84c'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(220,210,185,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                <Icon style={{ width: '14px', height: '14px' }} />
              </a>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <h3 className="text-sm font-semibold mb-4 tracking-wider uppercase" style={{ color: 'rgba(201,168,76,0.7)' }}>Platform</h3>
          <ul className="space-y-2.5">
            {['Features', 'How It Works', 'Pricing', 'API', 'Mobile App'].map(l => (
              <li key={l}><a href="#" className="text-sm transition-colors" style={{ color: 'rgba(220,210,185,0.45)' }}
                onMouseEnter={e => e.target.style.color = '#c9a84c'}
                onMouseLeave={e => e.target.style.color = 'rgba(220,210,185,0.45)'}>{l}</a></li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-sm font-semibold mb-4 tracking-wider uppercase" style={{ color: 'rgba(201,168,76,0.7)' }}>Resources</h3>
          <ul className="space-y-2.5">
            {['Documentation', 'Chess Tutorials', 'Community', 'Blog', 'Support'].map(l => (
              <li key={l}><a href="#" className="text-sm transition-colors" style={{ color: 'rgba(220,210,185,0.45)' }}
                onMouseEnter={e => e.target.style.color = '#c9a84c'}
                onMouseLeave={e => e.target.style.color = 'rgba(220,210,185,0.45)'}>{l}</a></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold mb-4 tracking-wider uppercase" style={{ color: 'rgba(201,168,76,0.7)' }}>Contact</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Mail style={{ width: '14px', height: '14px', color: '#c9a84c', flexShrink: 0 }} />
              <span className="text-sm" style={{ color: 'rgba(220,210,185,0.45)' }}>hello@chesswithbenefits.com</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs" style={{ color: 'rgba(220,210,185,0.3)' }}>© 2026 Chess with Benefits. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
              <a key={l} href="#" className="text-xs transition-colors" style={{ color: 'rgba(220,210,185,0.3)' }}
                onMouseEnter={e => e.target.style.color = '#c9a84c'}
                onMouseLeave={e => e.target.style.color = 'rgba(220,210,185,0.3)'}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;