import React, { useState } from 'react';
import { Users, Zap, ArrowLeft } from 'lucide-react';

/**
 * TEEN PATTI GAME HUB
 * Choose between Online Multiplayer and Offline Bot Mode
 */

const TeenPattiHub = ({ TeenPattiMVP, TeenPattiOffline }) => {
  const [mode, setMode] = useState(null); // null | online | offline

  if (mode === 'online' && TeenPattiMVP) {
    return (
      <div>
        <div
          onClick={() => setMode(null)}
          className="absolute top-6 left-6 cursor-pointer text-cyan-400 hover:text-cyan-300 flex items-center gap-2 z-50"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </div>
        <TeenPattiMVP />
      </div>
    );
  }

  if (mode === 'offline' && TeenPattiOffline) {
    return (
      <div>
        <TeenPattiOffline onExit={() => setMode(null)} />
      </div>
    );
  }

  // Hub Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full">
        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
            Teen Patti
          </h1>
          <p className="text-xl text-gray-300">Choose Your Game Mode</p>
        </div>

        {/* Game Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Online Multiplayer */}
          <div
            onClick={() => setMode('online')}
            className="group cursor-pointer bg-white/10 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-8 hover:border-cyan-400/60 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-cyan-400/20"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-6 mx-auto group-hover:scale-110 transition-transform">
              <Users size={32} className="text-white" />
            </div>

            <h2 className="text-2xl font-bold text-cyan-400 text-center mb-4">Online Multiplayer</h2>

            <p className="text-gray-300 text-center mb-6">
              Play with real players online. Create a room, invite friends, and compete for prizes!
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                2-6 Players
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                Real-time Socket.IO
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                Live Betting
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                Requires Internet
              </li>
            </ul>

            <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all">
              Play Online
            </button>
          </div>

          {/* Offline Bot Mode */}
          <div
            onClick={() => setMode('offline')}
            className="group cursor-pointer bg-white/10 backdrop-blur-lg border border-purple-400/30 rounded-2xl p-8 hover:border-purple-400/60 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-400/20"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-6 mx-auto group-hover:scale-110 transition-transform">
              <Zap size={32} className="text-white" />
            </div>

            <h2 className="text-2xl font-bold text-purple-400 text-center mb-4">Offline Bot Mode</h2>

            <p className="text-gray-300 text-center mb-6">
              Play against AI bots offline. Perfect for practice or playing anytime, anywhere!
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-purple-400 rounded-full" />
                1-5 AI Bots
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-purple-400 rounded-full" />
                3 Difficulty Levels
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-purple-400 rounded-full" />
                No Internet Required
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 bg-purple-400 rounded-full" />
                Instant Play
              </li>
            </ul>

            <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
              Play Offline
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white/5 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-cyan-400 mb-4">Why Teen Patti?</h3>
          <p className="text-gray-300">
            Experience the ultimate online card game with stunning UI, smooth animations, real-time multiplayer, and
            intelligent AI opponents. Play anytime, anywhere!
          </p>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default TeenPattiHub;
