
export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  LEVEL_UP = 'LEVEL_UP'
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends Entity {
  speed: number;
  lives: number;
}

export interface Bullet extends Entity {
  active: boolean;
}

export enum EnemyType {
  BEE = 'BEE',
  BUTTERFLY = 'BUTTERFLY',
  BOSS = 'BOSS'
}

export interface Enemy extends Entity {
  type: EnemyType;
  points: number;
  status: 'IDLE' | 'DIVING' | 'RETURNING';
  startX: number;
  startY: number;
  diveAngle: number;
  diveRadius: number;
  color: string;
}

export interface Particle extends Entity {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface GameState {
  status: GameStatus;
  score: number;
  level: number;
  waveName: string;
  battleQuote: string;
}
