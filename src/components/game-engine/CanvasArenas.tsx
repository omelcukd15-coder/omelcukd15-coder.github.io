'use client';

import React, { useEffect, useRef } from 'react';
import { LiveEvent } from '@/lib/server/liveHub';

interface ArenaProps {
  gameSlug: 'ball-royale' | 'land-grab' | 'snake' | 'fortress-battle' | 'doodle-guess';
  latestEvent: LiveEvent | null;
  paused: boolean;
  roundKey: number;
  ballShape: 'circle' | 'hex' | 'square';
  accentColor: string;
  doodleWord?: string;
  doodleProgress?: number;
  freeDrawMode?: boolean;
  onWinner?: (username: string, reason: string) => void;
}

interface Ball {
  id: string;
  name: string;
  vx: number;
  vy: number;
  x: number;
  y: number;
  r: number;
  color: string;
  shieldUntil: number;
  alive: boolean;
  team?: number;
}

interface Apple {
  x: number;
  y: number;
  name: string;
  golden: boolean;
}

interface Soldier {
  team: 1 | 2;
  x: number;
  y: number;
  hp: number;
  dmg: number;
  boss: boolean;
  name: string;
}

const COLORS = ['#8B5CF6', '#EC4899', '#22D3EE', '#10B981', '#F59E0B', '#F43F5E'];
const TEAM_COLORS = ['#F43F5E', '#3B82F6', '#A855F7', '#FBBF24'];

export function CanvasArena({
  gameSlug,
  latestEvent,
  paused,
  roundKey,
  ballShape,
  accentColor,
  doodleWord = 'кот',
  doodleProgress = 0.25,
  freeDrawMode = false,
  onWinner,
}: ArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef(paused);
  const onWinnerRef = useRef(onWinner);
  pausedRef.current = paused;
  onWinnerRef.current = onWinner;

  const simRef = useRef({
    balls: [] as Ball[],
    food: [] as { x: number; y: number; color: string }[],
    zoneRadius: 195,
    grid: [] as number[],
    gridCols: 12,
    gridRows: 16,
    timerSec: 45,
    snakeBody: [
      { x: 6, y: 8 },
      { x: 5, y: 8 },
      { x: 4, y: 8 },
    ],
    snakeDir: { x: 1, y: 0 },
    apples: [] as Apple[],
    fortressHp: [1000, 1000] as [number, number],
    soldiers: [] as Soldier[],
    winnerAnnounced: false,
    userStrokes: [] as { x: number; y: number; break?: boolean }[],
    isDrawing: false,
  });

  useEffect(() => {
    const W = 400;
    const H = 500;
    const s = simRef.current;
    s.winnerAnnounced = false;
    s.zoneRadius = 192;
    s.timerSec = 45;
    s.userStrokes = [];

    if (gameSlug === 'ball-royale') {
      s.balls = [
        { id: 'b1', name: 'artem_gg', x: 120, y: 180, vx: 1.9, vy: 1.4, r: 20, color: COLORS[0], shieldUntil: 0, alive: true },
        { id: 'b2', name: 'lera_fox', x: 280, y: 180, vx: -1.7, vy: 1.8, r: 20, color: COLORS[1], shieldUntil: 0, alive: true },
        { id: 'b3', name: 'max_turbo', x: 200, y: 310, vx: 1.5, vy: -1.6, r: 20, color: COLORS[2], shieldUntil: 0, alive: true },
      ];
      s.food = Array.from({ length: 18 }, () => ({
        x: 70 + Math.random() * (W - 140),
        y: 90 + Math.random() * (H - 180),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    } else if (gameSlug === 'land-grab') {
      s.grid = Array.from({ length: s.gridCols * s.gridRows }, (_, idx) => {
        const col = idx % s.gridCols;
        const row = Math.floor(idx / s.gridCols);
        if (col < 6 && row < 8) return 0;
        if (col >= 6 && row < 8) return 1;
        if (col < 6 && row >= 8) return 2;
        return 3;
      });
      s.balls = [
        { id: 't0', name: 'Красные', x: 90, y: 110, vx: 2.3, vy: 1.9, r: 16, color: TEAM_COLORS[0], shieldUntil: 0, alive: true, team: 0 },
        { id: 't1', name: 'Синие', x: 310, y: 110, vx: -2.2, vy: 2.1, r: 16, color: TEAM_COLORS[1], shieldUntil: 0, alive: true, team: 1 },
        { id: 't2', name: 'Фиолет', x: 90, y: 370, vx: 2.0, vy: -2.4, r: 16, color: TEAM_COLORS[2], shieldUntil: 0, alive: true, team: 2 },
        { id: 't3', name: 'Жёлтые', x: 310, y: 370, vx: -2.1, vy: -2.0, r: 16, color: TEAM_COLORS[3], shieldUntil: 0, alive: true, team: 3 },
      ];
    } else if (gameSlug === 'snake') {
      s.snakeBody = [
        { x: 6, y: 8 },
        { x: 5, y: 8 },
        { x: 4, y: 8 },
        { x: 3, y: 8 },
      ];
      s.snakeDir = { x: 1, y: 0 };
      s.apples = [
        { x: 10, y: 6, name: 'artem_gg', golden: false },
        { x: 8, y: 12, name: 'lera_fox', golden: false },
      ];
    } else if (gameSlug === 'fortress-battle') {
      s.fortressHp = [1000, 1000];
      s.soldiers = [
        { team: 1, x: 75, y: 250, hp: 50, dmg: 12, boss: false, name: 'Рыцарь' },
        { team: 2, x: 325, y: 250, hp: 50, dmg: 12, boss: false, name: 'Лучник' },
      ];
    }
  }, [gameSlug, roundKey]);

  useEffect(() => {
    if (!latestEvent) return;
    const s = simRef.current;

    if (gameSlug === 'ball-royale') {
      if (latestEvent.type === 'chat') {
        const existing = s.balls.find((b) => b.name === latestEvent.username && b.alive);
        if (existing) {
          existing.r = Math.min(46, existing.r + 2);
          existing.vx += (Math.random() - 0.5) * 1.4;
          existing.vy += (Math.random() - 0.5) * 1.4;
        } else if (s.balls.length < 36) {
          s.balls.push({
            id: latestEvent.id,
            name: latestEvent.username,
            x: 110 + Math.random() * 180,
            y: 140 + Math.random() * 200,
            vx: (Math.random() > 0.5 ? 1 : -1) * (1.4 + Math.random() * 1.4),
            vy: (Math.random() > 0.5 ? 1 : -1) * (1.4 + Math.random() * 1.4),
            r: 18,
            color: COLORS[s.balls.length % COLORS.length],
            shieldUntil: 0,
            alive: true,
          });
        }
      } else if (latestEvent.type === 'gift') {
        const target = s.balls.find((b) => b.name === latestEvent.username) || s.balls[0];
        if (target) {
          target.alive = true;
          target.r = Math.min(54, target.r + 9);
          target.shieldUntil = Date.now() + 10000;
        }
      }
    } else if (gameSlug === 'land-grab') {
      const msg = (latestEvent.message || '').trim();
      let teamIdx = ['1', '2', '3', '4'].indexOf(msg);
      if (teamIdx === -1) teamIdx = Math.floor(Math.random() * 4);

      if (latestEvent.type === 'chat' && s.balls.length < 28) {
        s.balls.push({
          id: latestEvent.id,
          name: latestEvent.username,
          x: teamIdx % 2 === 0 ? 90 : 310,
          y: teamIdx < 2 ? 120 : 360,
          vx: (Math.random() > 0.5 ? 1 : -1) * 2.5,
          vy: (Math.random() > 0.5 ? 1 : -1) * 2.5,
          r: 14,
          color: TEAM_COLORS[teamIdx],
          shieldUntil: 0,
          alive: true,
          team: teamIdx,
        });
      } else if (latestEvent.type === 'gift') {
        for (let i = 0; i < 3; i++) {
          s.balls.push({
            id: `${latestEvent.id}-${i}`,
            name: `${latestEvent.username}`,
            x: 200,
            y: 250,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            r: (latestEvent.coins || 1) >= 20 ? 28 : 16,
            color: TEAM_COLORS[teamIdx],
            shieldUntil: Date.now() + 8000,
            alive: true,
            team: teamIdx,
          });
        }
      }
    } else if (gameSlug === 'snake') {
      if (latestEvent.type === 'chat' && s.apples.length < 18) {
        s.apples.push({
          x: Math.floor(Math.random() * 14),
          y: Math.floor(Math.random() * 18),
          name: latestEvent.username,
          golden: false,
        });
      } else if (latestEvent.type === 'gift') {
        const count = (latestEvent.coins || 1) >= 5 ? 1 : 5;
        for (let i = 0; i < count; i++) {
          s.apples.push({
            x: Math.floor(Math.random() * 14),
            y: Math.floor(Math.random() * 18),
            name: latestEvent.username,
            golden: (latestEvent.coins || 1) >= 5,
          });
        }
      }
    } else if (gameSlug === 'fortress-battle') {
      if (latestEvent.type === 'chat' || latestEvent.type === 'like') {
        const msg = (latestEvent.message || '').trim();
        const team: 1 | 2 = msg.includes('2') ? 2 : msg.includes('1') ? 1 : Math.random() > 0.5 ? 1 : 2;
        s.soldiers.push({
          team,
          x: team === 1 ? 60 : 340,
          y: 160 + Math.random() * 180,
          hp: 40,
          dmg: 14,
          boss: false,
          name: latestEvent.username,
        });
      } else if (latestEvent.type === 'gift') {
        const team: 1 | 2 = Math.random() > 0.5 ? 1 : 2;
        const isBoss = (latestEvent.coins || 1) >= 20;
        const count = isBoss ? 1 : 4;
        for (let i = 0; i < count; i++) {
          s.soldiers.push({
            team,
            x: team === 1 ? 65 : 335,
            y: 170 + Math.random() * 160,
            hp: isBoss ? 240 : 65,
            dmg: isBoss ? 55 : 22,
            boss: isBoss,
            name: latestEvent.username,
          });
        }
      }
    }
  }, [latestEvent, gameSlug]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastSnakeTick = 0;

    const drawCyberGrid = (W: number, H: number) => {
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    };

    const drawBallShape = (x: number, y: number, r: number, color: string, name: string, shield: boolean) => {
      ctx.save();
      ctx.shadowBlur = shield ? 20 : 12;
      ctx.shadowColor = shield ? '#22D3EE' : color;
      ctx.beginPath();
      if (ballShape === 'square') {
        ctx.roundRect(x - r, y - r, r * 2, r * 2, 8);
      } else if (ballShape === 'hex') {
        for (let i = 0; i < 6; i++) {
          const ang = (Math.PI / 3) * i;
          const px = x + r * Math.cos(ang);
          const py = y + r * Math.sin(ang);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else {
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = shield ? 3.5 : 2;
      ctx.strokeStyle = shield ? '#22D3EE' : 'rgba(255,255,255,0.85)';
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px Manrope, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name.slice(0, 8), x, y);
      ctx.restore();
    };

    const render = (ts: number) => {
      const W = canvas.width;
      const H = canvas.height;
      const s = simRef.current;

      ctx.clearRect(0, 0, W, H);

      if (gameSlug === 'ball-royale') {
        ctx.fillStyle = '#070512';
        ctx.fillRect(0, 0, W, H);
        drawCyberGrid(W, H);

        if (!pausedRef.current && s.zoneRadius > 75) {
          s.zoneRadius -= 0.04;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, s.zoneRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(30, 20, 68, 0.72)';
        ctx.fill();
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#F43F5E';
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#F43F5E';
        ctx.stroke();
        ctx.restore();

        s.food.forEach((f) => {
          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = f.color;
          ctx.beginPath();
          ctx.arc(f.x, f.y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = f.color;
          ctx.fill();
          ctx.restore();
        });

        const aliveBalls = s.balls.filter((b) => b.alive);
        if (!pausedRef.current) {
          for (const b of aliveBalls) {
            b.x += b.vx;
            b.y += b.vy;
            const dx = b.x - W / 2;
            const dy = b.y - H / 2;
            const dist = Math.hypot(dx, dy);
            if (dist + b.r > s.zoneRadius) {
              const nx = dx / (dist || 1);
              const ny = dy / (dist || 1);
              b.x = W / 2 + nx * (s.zoneRadius - b.r);
              b.y = H / 2 + ny * (s.zoneRadius - b.r);
              b.vx *= -0.98;
              b.vy *= -0.98;
            }
            s.food.forEach((f) => {
              if (Math.hypot(b.x - f.x, b.y - f.y) < b.r + 4) {
                b.r = Math.min(50, b.r + 0.6);
                f.x = W / 2 + (Math.random() - 0.5) * s.zoneRadius;
                f.y = H / 2 + (Math.random() - 0.5) * s.zoneRadius;
              }
            });
          }

          for (let i = 0; i < aliveBalls.length; i++) {
            for (let j = i + 1; j < aliveBalls.length; j++) {
              const a = aliveBalls[i];
              const b = aliveBalls[j];
              if (!a.alive || !b.alive) continue;
              const d = Math.hypot(a.x - b.x, a.y - b.y);
              if (d < a.r + b.r) {
                if (a.r > b.r + 4 && b.shieldUntil < Date.now()) {
                  b.alive = false;
                  a.r = Math.min(56, a.r + b.r * 0.28);
                } else if (b.r > a.r + 4 && a.shieldUntil < Date.now()) {
                  a.alive = false;
                  b.r = Math.min(56, b.r + a.r * 0.28);
                } else {
                  const tvx = a.vx;
                  const tvy = a.vy;
                  a.vx = b.vx;
                  a.vy = b.vy;
                  b.vx = tvx;
                  b.vy = tvy;
                }
              }
            }
          }
        }

        const remaining = s.balls.filter((b) => b.alive);
        remaining.forEach((b) => drawBallShape(b.x, b.y, b.r, b.color, b.name, b.shieldUntil > Date.now()));

        if (remaining.length === 1 && s.balls.length > 1 && !s.winnerAnnounced) {
          s.winnerAnnounced = true;
          onWinnerRef.current?.(remaining[0].name, 'Последний выживший на арене!');
        }
      } else if (gameSlug === 'land-grab') {
        ctx.fillStyle = '#070512';
        ctx.fillRect(0, 0, W, H);
        const cellW = W / s.gridCols;
        const cellH = H / s.gridRows;
        for (let idx = 0; idx < s.grid.length; idx++) {
          const col = idx % s.gridCols;
          const row = Math.floor(idx / s.gridCols);
          ctx.fillStyle = TEAM_COLORS[s.grid[idx]] + '99';
          ctx.fillRect(col * cellW + 1, row * cellH + 1, cellW - 2, cellH - 2);
        }

        if (!pausedRef.current) {
          s.balls.forEach((b) => {
            b.x += b.vx;
            b.y += b.vy;
            if (b.x - b.r < 0 || b.x + b.r > W) b.vx *= -1;
            if (b.y - b.r < 0 || b.y + b.r > H) b.vy *= -1;
            b.x = Math.max(b.r, Math.min(W - b.r, b.x));
            b.y = Math.max(b.r, Math.min(H - b.r, b.y));
            const col = Math.min(s.gridCols - 1, Math.max(0, Math.floor(b.x / cellW)));
            const row = Math.min(s.gridRows - 1, Math.max(0, Math.floor(b.y / cellH)));
            if (typeof b.team === 'number') {
              s.grid[row * s.gridCols + col] = b.team;
            }
          });
        }
        s.balls.forEach((b) => drawBallShape(b.x, b.y, b.r, b.color, b.name, b.shieldUntil > Date.now()));
      } else if (gameSlug === 'snake') {
        const cols = 14;
        const rows = 18;
        const cw = W / cols;
        const ch = H / rows;
        ctx.fillStyle = '#061210';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.08)';
        for (let x = 0; x <= cols; x++) {
          ctx.beginPath();
          ctx.moveTo(x * cw, 0);
          ctx.lineTo(x * cw, H);
          ctx.stroke();
        }
        for (let y = 0; y <= rows; y++) {
          ctx.beginPath();
          ctx.moveTo(0, y * ch);
          ctx.lineTo(W, y * ch);
          ctx.stroke();
        }

        if (!pausedRef.current && ts - lastSnakeTick > 165) {
          lastSnakeTick = ts;
          const head = s.snakeBody[0];
          const target = s.apples[0];
          if (target) {
            if (target.x > head.x) s.snakeDir = { x: 1, y: 0 };
            else if (target.x < head.x) s.snakeDir = { x: -1, y: 0 };
            else if (target.y > head.y) s.snakeDir = { x: 0, y: 1 };
            else if (target.y < head.y) s.snakeDir = { x: 0, y: -1 };
          }
          const next = {
            x: (head.x + s.snakeDir.x + cols) % cols,
            y: (head.y + s.snakeDir.y + rows) % rows,
          };
          s.snakeBody.unshift(next);
          const eatenIdx = s.apples.findIndex((a) => a.x === next.x && a.y === next.y);
          if (eatenIdx >= 0) {
            const eaten = s.apples[eatenIdx];
            s.apples.splice(eatenIdx, 1);
            if (s.apples.length === 0) {
              s.apples.push({
                x: Math.floor(Math.random() * cols),
                y: Math.floor(Math.random() * rows),
                name: 'чат',
                golden: false,
              });
            }
            if (eaten.golden) {
              onWinnerRef.current?.(eaten.name, 'Золотое яблоко (+10)!');
            }
          } else {
            s.snakeBody.pop();
          }
        }

        s.apples.forEach((a) => {
          ctx.save();
          ctx.shadowBlur = 12;
          ctx.shadowColor = a.golden ? '#FACC15' : '#F43F5E';
          ctx.beginPath();
          ctx.arc(a.x * cw + cw / 2, a.y * ch + ch / 2, cw * 0.36, 0, Math.PI * 2);
          ctx.fillStyle = a.golden ? '#FACC15' : '#F43F5E';
          ctx.fill();
          ctx.restore();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px Manrope, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(a.name.slice(0, 7), a.x * cw + cw / 2, a.y * ch - 2);
        });

        s.snakeBody.forEach((seg, idx) => {
          ctx.save();
          ctx.shadowBlur = idx === 0 ? 14 : 6;
          ctx.shadowColor = '#34D399';
          ctx.fillStyle = idx === 0 ? '#A3E635' : '#10B981';
          ctx.beginPath();
          ctx.roundRect(seg.x * cw + 2, seg.y * ch + 2, cw - 4, ch - 4, 6);
          ctx.fill();
          ctx.restore();
        });
      } else if (gameSlug === 'fortress-battle') {
        ctx.fillStyle = '#090717';
        ctx.fillRect(0, 0, W, H);
        drawCyberGrid(W, H);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(0, 120, W, 280);

        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#F43F5E';
        ctx.fillStyle = '#F43F5E';
        ctx.beginPath();
        ctx.roundRect(10, 170, 48, 170, 12);
        ctx.fill();

        ctx.shadowColor = '#38BDF8';
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.roundRect(W - 58, 170, 48, 170, 12);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(16, 40, 150, 18);
        ctx.fillRect(W - 166, 40, 150, 18);
        ctx.fillStyle = '#F43F5E';
        ctx.fillRect(16, 40, 150 * Math.max(0, s.fortressHp[0] / 1000), 18);
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(W - 166, 40, 150 * Math.max(0, s.fortressHp[1] / 1000), 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Manrope, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`🔴 ${Math.max(0, s.fortressHp[0])} HP`, 16, 30);
        ctx.textAlign = 'right';
        ctx.fillText(`🔵 ${Math.max(0, s.fortressHp[1])} HP`, W - 16, 30);

        if (!pausedRef.current) {
          s.soldiers.forEach((unit) => {
            unit.x += unit.team === 1 ? 1.6 : -1.6;
            if (unit.team === 1 && unit.x >= W - 62) {
              s.fortressHp[1] -= unit.dmg;
              unit.hp = 0;
            } else if (unit.team === 2 && unit.x <= 62) {
              s.fortressHp[0] -= unit.dmg;
              unit.hp = 0;
            }
          });
          s.soldiers = s.soldiers.filter((u) => u.hp > 0);
        }

        s.soldiers.forEach((u) => {
          ctx.save();
          ctx.shadowBlur = 12;
          ctx.shadowColor = u.team === 1 ? '#FB7185' : '#38BDF8';
          ctx.beginPath();
          ctx.arc(u.x, u.y, u.boss ? 18 : 10, 0, Math.PI * 2);
          ctx.fillStyle = u.team === 1 ? '#FB7185' : '#38BDF8';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.stroke();
          ctx.restore();
        });

        if ((s.fortressHp[0] <= 0 || s.fortressHp[1] <= 0) && !s.winnerAnnounced) {
          s.winnerAnnounced = true;
          onWinnerRef.current?.(
            s.fortressHp[0] <= 0 ? 'Команда 2 (Синие)' : 'Команда 1 (Красные)',
            'Крепость соперника разрушена!'
          );
        }
      } else if (gameSlug === 'doodle-guess') {
        ctx.fillStyle = '#0D0920';
        ctx.fillRect(0, 0, W, H);
        drawCyberGrid(W, H);

        ctx.save();
        ctx.strokeStyle = accentColor === '#6C2BD9' ? '#22D3EE' : accentColor || '#22D3EE';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#22D3EE';
        ctx.lineWidth = 5.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const p = Math.min(1, doodleProgress);
        if (freeDrawMode && s.userStrokes.length > 0) {
          ctx.beginPath();
          s.userStrokes.forEach((pt, idx) => {
            if (idx === 0 || pt.break) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.stroke();
        } else {
          const w = doodleWord.toLowerCase();
          if (w === 'дом') {
            if (p > 0.1) { ctx.strokeRect(120, 220, 160, 150); }
            if (p > 0.35) { ctx.beginPath(); ctx.moveTo(100, 220); ctx.lineTo(200, 130); ctx.lineTo(300, 220); ctx.stroke(); }
            if (p > 0.6) { ctx.strokeRect(175, 290, 50, 80); }
            if (p > 0.8) { ctx.strokeRect(140, 245, 36, 36); ctx.strokeRect(224, 245, 36, 36); }
          } else if (w === 'ракета') {
            if (p > 0.1) { ctx.beginPath(); ctx.moveTo(200, 100); ctx.lineTo(250, 220); ctx.lineTo(240, 330); ctx.lineTo(160, 330); ctx.lineTo(150, 220); ctx.closePath(); ctx.stroke(); }
            if (p > 0.45) { ctx.beginPath(); ctx.arc(200, 210, 24, 0, Math.PI * 2); ctx.stroke(); }
            if (p > 0.75) { ctx.beginPath(); ctx.moveTo(175, 330); ctx.lineTo(200, 410); ctx.lineTo(225, 330); ctx.stroke(); }
          } else if (w === 'корона') {
            if (p > 0.15) {
              ctx.beginPath();
              ctx.moveTo(90, 330);
              ctx.lineTo(90, 190);
              ctx.lineTo(150, 260);
              ctx.lineTo(200, 160);
              ctx.lineTo(250, 260);
              ctx.lineTo(310, 190);
              ctx.lineTo(310, 330);
              ctx.closePath();
              ctx.stroke();
            }
          } else if (w === 'пицца') {
            if (p > 0.15) {
              ctx.beginPath();
              ctx.moveTo(200, 120);
              ctx.lineTo(300, 340);
              ctx.lineTo(100, 340);
              ctx.closePath();
              ctx.stroke();
            }
            if (p > 0.5) {
              ctx.beginPath();
              ctx.arc(200, 240, 16, 0, Math.PI * 2);
              ctx.arc(170, 295, 14, 0, Math.PI * 2);
              ctx.arc(230, 295, 14, 0, Math.PI * 2);
              ctx.stroke();
            }
          } else {
            if (p > 0.15) { ctx.beginPath(); ctx.arc(200, 260, 75, 0, Math.PI * 2); ctx.stroke(); }
            if (p > 0.4) { ctx.beginPath(); ctx.moveTo(140, 205); ctx.lineTo(130, 135); ctx.lineTo(185, 185); ctx.moveTo(260, 205); ctx.lineTo(270, 135); ctx.lineTo(215, 185); ctx.stroke(); }
            if (p > 0.65) { ctx.beginPath(); ctx.arc(175, 245, 9, 0, Math.PI * 2); ctx.arc(225, 245, 9, 0, Math.PI * 2); ctx.stroke(); }
            if (p > 0.85) { ctx.beginPath(); ctx.moveTo(110, 260); ctx.lineTo(155, 265); ctx.moveTo(110, 280); ctx.lineTo(155, 275); ctx.moveTo(290, 260); ctx.lineTo(245, 265); ctx.moveTo(290, 280); ctx.lineTo(245, 275); ctx.stroke(); }
          }
        }
        ctx.restore();
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [gameSlug, ballShape, accentColor, doodleWord, doodleProgress, freeDrawMode]);

  const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>, isStart: boolean, isEnd = false) => {
    if (gameSlug !== 'doodle-guess' || !freeDrawMode) return;
    const s = simRef.current;
    if (isEnd) {
      s.isDrawing = false;
      return;
    }
    if (isStart) s.isDrawing = true;
    if (!s.isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * e.currentTarget.width;
    const y = ((e.clientY - rect.top) / rect.height) * e.currentTarget.height;
    s.userStrokes.push({ x, y, break: isStart });
  };

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={500}
      onPointerDown={(e) => handlePointer(e, true)}
      onPointerMove={(e) => handlePointer(e, false)}
      onPointerUp={(e) => handlePointer(e, false, true)}
      onPointerLeave={(e) => handlePointer(e, false, true)}
      className="h-full w-full touch-none rounded-2xl border border-white/15 shadow-inner"
    />
  );
}
