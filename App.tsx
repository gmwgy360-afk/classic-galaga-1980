
import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameStatus, GameState } from './types';
import { getLevelFlavor } from './services/geminiService';
import { Play, RefreshCw, Zap, ArrowLeft, ArrowRight, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.START,
    score: 0,
    level: 1,
    waveName: '啟動準備中...',
    battleQuote: '按下 START 開始戰鬥'
  });

  const [inputs, setInputs] = useState({
    left: false,
    right: false,
    fire: false
  });

  const fetchFlavor = useCallback(async (level: number) => {
    const flavor = await getLevelFlavor(level);
    setGameState(prev => ({
      ...prev,
      waveName: flavor.waveName,
      battleQuote: flavor.battleQuote
    }));
  }, []);

  useEffect(() => {
    if (gameState.status === GameStatus.START) {
      fetchFlavor(1);
    }
  }, [gameState.status, fetchFlavor]);

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      status: GameStatus.PLAYING,
      score: 0,
      level: 1
    }));
  };

  const onGameOver = (finalScore: number) => {
    setGameState(prev => ({
      ...prev,
      status: GameStatus.GAMEOVER,
      score: finalScore
    }));
  };

  const onLevelUp = (nextLevel: number) => {
    fetchFlavor(nextLevel);
    setGameState(prev => ({
      ...prev,
      status: GameStatus.LEVEL_UP,
      level: nextLevel
    }));
    setTimeout(() => {
      setGameState(prev => ({ ...prev, status: GameStatus.PLAYING }));
    }, 3000);
  };

  const onScoreUpdate = (score: number) => {
    setGameState(prev => ({ ...prev, score }));
  };

  // Input handlers for mobile buttons
  const handleTouchStart = (key: 'left' | 'right' | 'fire') => {
    setInputs(prev => ({ ...prev, [key]: true }));
  };
  const handleTouchEnd = (key: 'left' | 'right' | 'fire') => {
    setInputs(prev => ({ ...prev, [key]: false }));
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-start md:justify-center bg-[#050508] overflow-hidden select-none touch-none font-sans">
      {/* HUD Top */}
      <div className="w-full max-w-4xl px-4 md:px-8 py-4 md:py-6 flex justify-between items-start z-10 shrink-0">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <div className="text-cyan-400 text-[10px] md:text-xs tracking-[0.2em] font-bold flex items-center gap-1 md:gap-2">
             <Zap size={14} className="text-yellow-400 fill-yellow-400 animate-pulse" /> SCORE
          </div>
          <div className="text-2xl md:text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            {gameState.score.toLocaleString()}
          </div>
        </motion.div>

        <div className="text-center space-y-1 flex-1 px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={gameState.waveName}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-red-500 text-xs md:text-lg tracking-[0.3em] uppercase font-black drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
            >
               {gameState.waveName}
            </motion.div>
          </AnimatePresence>
          <div className="hidden md:block text-[10px] text-gray-500 max-w-[300px] mx-auto italic opacity-70">
            "{gameState.battleQuote}"
          </div>
        </div>

        {/* 右側原本 BEST 區塊移除，不再顯示歷史最高分 */}
      </div>

      {/* Game Canvas Container */}
      <div className="relative border-2 md:border-4 border-white/10 rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,242,255,0.1)] w-full max-w-[450px] aspect-[450/650] max-h-[75vh] bg-black/40 backdrop-blur-sm">
         <GameCanvas 
          status={gameState.status}
          level={gameState.level}
          onGameOver={onGameOver}
          onScoreUpdate={onScoreUpdate}
          onLevelUp={onLevelUp}
          touchInputs={inputs}
         />
      </div>

      {/* Mobile Controls */}
      {gameState.status === GameStatus.PLAYING && (
        <div className="w-full max-w-4xl px-6 py-8 flex justify-between items-center z-20 mt-auto md:hidden">
          <div className="flex gap-4">
            <button 
              onPointerDown={() => handleTouchStart('left')}
              onPointerUp={() => handleTouchEnd('left')}
              onPointerLeave={() => handleTouchEnd('left')}
              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:bg-cyan-500/20 active:scale-90 transition-all shadow-lg"
            >
              <ArrowLeft className="text-cyan-400" size={32} />
            </button>
            <button 
              onPointerDown={() => handleTouchStart('right')}
              onPointerUp={() => handleTouchEnd('right')}
              onPointerLeave={() => handleTouchEnd('right')}
              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:bg-cyan-500/20 active:scale-90 transition-all shadow-lg"
            >
              <ArrowRight className="text-cyan-400" size={32} />
            </button>
          </div>
          
          <button 
            onPointerDown={() => handleTouchStart('fire')}
            onPointerUp={() => handleTouchEnd('fire')}
            onPointerLeave={() => handleTouchEnd('fire')}
            className="w-24 h-24 rounded-full bg-red-600/10 border-4 border-red-500/50 flex items-center justify-center active:bg-red-500 active:scale-95 transition-all shadow-[0_0_30px_rgba(239,68,68,0.3)]"
          >
            <Target className="text-white" size={40} />
          </button>
        </div>
      )}

      {/* Overlays */}
      <AnimatePresence>
        {gameState.status === GameStatus.START && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-30 backdrop-blur-xl p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-600 mb-2 tracking-tighter italic">
                GALAXIAN
              </h1>
              <div className="text-yellow-400 text-xl md:text-2xl font-black tracking-[0.5em] mb-8 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                NEON 2026
              </div>
            </motion.div>

            <p className="text-gray-400 mb-12 max-w-md leading-relaxed tracking-widest text-xs uppercase font-bold opacity-60">
              Interstellar Defense Protocol Initiated
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="group relative flex items-center gap-4 bg-white text-black px-12 py-6 rounded-full transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] font-black text-xl uppercase tracking-widest overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center gap-4 group-hover:text-white transition-colors">
                <Play fill="currentColor" size={24} /> START MISSION
              </span>
            </motion.button>

            <div className="mt-16 flex gap-12 text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">
               <div className="md:block hidden">Arrows to Move</div>
               <div className="md:block hidden">Space to Fire</div>
               <div className="md:hidden block">Touch Controls Active</div>
            </div>
          </motion.div>
        )}

        {gameState.status === GameStatus.GAMEOVER && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-950/40 flex flex-col items-center justify-center z-30 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-black/90 p-10 md:p-16 rounded-[2rem] border-2 border-red-500/30 flex flex-col items-center shadow-[0_0_100px_rgba(239,68,68,0.2)] w-full max-w-md relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
              <h2 className="text-5xl md:text-7xl text-red-500 mb-8 tracking-tighter font-black italic">DEFEATED</h2>
              
              <div className="text-white mb-12 flex flex-col items-center gap-2">
                <span className="text-gray-500 text-xs tracking-[0.4em] font-bold uppercase">Final Score</span>
                <span className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                  {gameState.score.toLocaleString()}
                </span>
              </div>

              <button 
                onClick={startGame}
                className="w-full flex items-center justify-center gap-4 bg-red-600 hover:bg-red-500 text-white px-8 py-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl font-black text-lg tracking-widest uppercase"
              >
                <RefreshCw size={24} /> Try Again
              </button>
            </motion.div>
          </motion.div>
        )}

        {gameState.status === GameStatus.LEVEL_UP && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-40 pointer-events-none"
          >
            <div className="text-yellow-400 text-8xl md:text-[12rem] font-black italic tracking-tighter drop-shadow-[0_0_50px_rgba(250,204,21,0.5)]">
              NEXT
            </div>
            <div className="text-white text-2xl md:text-4xl font-black tracking-[1em] -mt-8 uppercase">
              Wave {gameState.level}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="hidden md:block absolute bottom-8 text-gray-700 text-[8px] tracking-[0.5em] uppercase">
        TAIWAN RETRO ARCADE SERIES &copy; 2026
      </div>
    </div>
  );
};

export default App;
