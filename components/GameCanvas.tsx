
import React, { useRef, useEffect, useCallback } from 'react';
import { GameStatus, Player, Bullet, Enemy, EnemyType, Particle } from '../types';

interface Props {
  status: GameStatus;
  level: number;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  onLevelUp: (nextLevel: number) => void;
  touchInputs?: {
    left: boolean;
    right: boolean;
    fire: boolean;
  };
}

const CANVAS_WIDTH = 450;
const CANVAS_HEIGHT = 650;
const PLAYER_SIZE = 36; // Slightly larger for mobile visibility
const ENEMY_SIZE = 28;  // Slightly larger for mobile visibility
const BULLET_SIZE = 6;

const GameCanvas: React.FC<Props> = ({ status, level, onGameOver, onScoreUpdate, onLevelUp, touchInputs }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
    y: CANVAS_HEIGHT - 80,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    speed: 6, // Slightly faster for snappier feel
    lives: 3
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<{x: number, y: number, size: number, speed: number, color: string}[]>([]);
  const scoreRef = useRef(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const lastShotTime = useRef(0);
  const enemyMoveDir = useRef(1);
  const enemyGridOffset = useRef(0);

  // Initialize stars
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`
      });
    }
    starsRef.current = stars;
  }, []);

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push({
        x,
        y,
        width: 2,
        height: 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        maxLife: 1,
        color
      });
    }
  };

  const initEnemies = useCallback((lvl: number) => {
    const rows = 5;
    const cols = 7; // Slightly fewer columns for better spacing on small screens
    const padding = 20;
    const startX = (CANVAS_WIDTH - (cols * (ENEMY_SIZE + padding))) / 2;
    const startY = 80;

    const newEnemies: Enemy[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let type = EnemyType.BEE;
        let color = '#4ade80';
        let points = 50;

        if (r === 0) {
          type = EnemyType.BOSS;
          color = '#f87171';
          points = 150;
        } else if (r < 3) {
          type = EnemyType.BUTTERFLY;
          color = '#60a5fa';
          points = 80;
        }

        newEnemies.push({
          x: startX + c * (ENEMY_SIZE + padding),
          y: startY + r * (ENEMY_SIZE + padding),
          width: ENEMY_SIZE,
          height: ENEMY_SIZE,
          startX: startX + c * (ENEMY_SIZE + padding),
          startY: startY + r * (ENEMY_SIZE + padding),
          type,
          color,
          points,
          status: 'IDLE',
          diveAngle: 0,
          diveRadius: 0
        });
      }
    }
    enemiesRef.current = newEnemies;
  }, []);

  useEffect(() => {
    if (status === GameStatus.PLAYING && enemiesRef.current.length === 0) {
      initEnemies(level);
      scoreRef.current = 0;
      playerRef.current.lives = 3;
      onScoreUpdate(0);
    }
  }, [status, level, initEnemies, onScoreUpdate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const shoot = () => {
    const now = Date.now();
    if (now - lastShotTime.current > 250) { // Slightly faster fire rate
      bulletsRef.current.push({
        x: playerRef.current.x + playerRef.current.width / 2 - BULLET_SIZE / 2,
        y: playerRef.current.y,
        width: BULLET_SIZE,
        height: BULLET_SIZE * 3, // Taller bullets for laser look
        active: true
      });
      lastShotTime.current = now;
    }
  };

  const update = () => {
    if (status !== GameStatus.PLAYING) return;

    // Movement: Keyboard + Touch
    const moveLeft = keysRef.current['ArrowLeft'] || touchInputs?.left;
    const moveRight = keysRef.current['ArrowRight'] || touchInputs?.right;
    const isFiring = keysRef.current['Space'] || touchInputs?.fire;

    if (moveLeft && playerRef.current.x > 0) {
      playerRef.current.x -= playerRef.current.speed;
    }
    if (moveRight && playerRef.current.x < CANVAS_WIDTH - playerRef.current.width) {
      playerRef.current.x += playerRef.current.speed;
    }
    if (isFiring) {
      shoot();
    }

    bulletsRef.current.forEach(b => {
      b.y -= 12; // Faster bullets
      if (b.y < -30) b.active = false;
    });
    bulletsRef.current = bulletsRef.current.filter(b => b.active);

    // Update Particles
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // Update Stars
    starsRef.current.forEach(s => {
      s.y += s.speed;
      if (s.y > CANVAS_HEIGHT) s.y = 0;
    });

    enemyGridOffset.current += 1 * enemyMoveDir.current;
    if (Math.abs(enemyGridOffset.current) > 30) {
      enemyMoveDir.current *= -1;
    }

    const activeEnemies = enemiesRef.current;
    if (Math.random() < 0.006 + (level * 0.002)) {
      const idleEnemies = activeEnemies.filter(e => e.status === 'IDLE');
      if (idleEnemies.length > 0) {
        const diver = idleEnemies[Math.floor(Math.random() * idleEnemies.length)];
        diver.status = 'DIVING';
        diver.diveAngle = 0;
      }
    }

    activeEnemies.forEach(e => {
      if (e.status === 'IDLE') {
        e.x = e.startX + enemyGridOffset.current;
      } else if (e.status === 'DIVING') {
        e.y += 4 + (level * 0.6);
        e.x += Math.sin(e.diveAngle) * 6;
        e.diveAngle += 0.12;
        if (e.y > CANVAS_HEIGHT) {
          e.y = -50;
          e.status = 'RETURNING';
        }
      } else if (e.status === 'RETURNING') {
        e.y += 3;
        if (e.y >= e.startY) {
          e.status = 'IDLE';
        }
      }
    });

    bulletsRef.current.forEach(b => {
      activeEnemies.forEach(e => {
        if (
          b.x < e.x + e.width &&
          b.x + b.width > e.x &&
          b.y < e.y + e.height &&
          b.y + b.height > e.y
        ) {
          b.active = false;
          createExplosion(e.x + e.width / 2, e.y + e.height / 2, e.color);
          enemiesRef.current = enemiesRef.current.filter(item => item !== e);
          scoreRef.current += e.points;
          onScoreUpdate(scoreRef.current);
        }
      });
    });

    activeEnemies.forEach(e => {
      if (
        e.x < playerRef.current.x + playerRef.current.width * 0.8 &&
        e.x + e.width > playerRef.current.x + playerRef.current.width * 0.2 &&
        e.y < playerRef.current.y + playerRef.current.height * 0.8 &&
        e.y + e.height > playerRef.current.y + playerRef.current.height * 0.2
      ) {
        onGameOver(scoreRef.current);
      }
    });

    if (activeEnemies.length === 0) {
      onLevelUp(level + 1);
      initEnemies(level + 1);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background Gradient
    const bgGrad = ctx.createRadialGradient(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 0, CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, '#0a0a1a');
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars
    starsRef.current.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });

    // Player
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f2ff';
    ctx.fillStyle = '#00f2ff';
    
    // Ship body
    ctx.beginPath();
    ctx.moveTo(playerRef.current.x + playerRef.current.width / 2, playerRef.current.y);
    ctx.lineTo(playerRef.current.x + playerRef.current.width, playerRef.current.y + playerRef.current.height);
    ctx.lineTo(playerRef.current.x + playerRef.current.width / 2, playerRef.current.y + playerRef.current.height - 8);
    ctx.lineTo(playerRef.current.x, playerRef.current.y + playerRef.current.height);
    ctx.closePath();
    ctx.fill();

    // Engine glow
    const engineY = playerRef.current.y + playerRef.current.height - 5;
    const engineHeight = 10 + Math.random() * 10;
    const engineGrad = ctx.createLinearGradient(0, engineY, 0, engineY + engineHeight);
    engineGrad.addColorStop(0, '#ff4d00');
    engineGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = engineGrad;
    ctx.fillRect(playerRef.current.x + 10, engineY, playerRef.current.width - 20, engineHeight);
    ctx.restore();

    // Bullets
    bulletsRef.current.forEach(b => {
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#fbbf24';
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(b.x, b.y, b.width, b.height);
      
      // Inner core
      ctx.fillStyle = '#fff';
      ctx.fillRect(b.x + 1, b.y + 2, b.width - 2, b.height - 4);
      ctx.restore();
    });

    // Enemies
    enemiesRef.current.forEach(e => {
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = e.color;
      ctx.fillStyle = e.color;
      
      const wingOffset = Math.sin(Date.now() / 150) * 4;
      
      // Body
      ctx.beginPath();
      ctx.roundRect(e.x + 6, e.y, e.width - 12, e.height, 4);
      ctx.fill();

      // Wings
      ctx.beginPath();
      ctx.moveTo(e.x, e.y + 4 + wingOffset);
      ctx.lineTo(e.x + e.width, e.y + 4 + wingOffset);
      ctx.lineTo(e.x + e.width - 4, e.y + 10 + wingOffset);
      ctx.lineTo(e.x + 4, e.y + 10 + wingOffset);
      ctx.closePath();
      ctx.fill();
      
      // Eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(e.x + 10, e.y + 6, 2, 0, Math.PI * 2);
      ctx.arc(e.x + e.width - 10, e.y + 6, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== CANVAS_WIDTH * dpr) {
      canvas.width = CANVAS_WIDTH * dpr;
      canvas.height = CANVAS_HEIGHT * dpr;
      ctx.scale(dpr, dpr);
    }

    update();
    draw(ctx);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status, level, touchInputs]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="bg-black block mx-auto h-full w-full object-contain"
    />
  );
};

export default GameCanvas;
