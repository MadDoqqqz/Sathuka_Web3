import React, { useEffect, useRef, useState } from 'react';

interface SathukaBackgroundAnimationProps {
  interactive?: boolean;
}

export const SathukaBackgroundAnimation: React.FC<SathukaBackgroundAnimationProps> = ({
  interactive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [blockHeight, setBlockHeight] = useState(21849120);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Scroll state tracking
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let scrollOffset = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, currentScrollY / maxScroll));
      setScrollProgress(progress);

      scrollVelocity = (currentScrollY - lastScrollY) * 0.15;
      lastScrollY = currentScrollY;
      scrollOffset = currentScrollY;

      // Increment simulated blockchain block height with scroll activity
      setBlockHeight(prev => prev + Math.floor(Math.abs(scrollVelocity) * 2));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 1. Blockchain Block Nodes
    interface BlockchainBlock {
      x: number;
      y: number;
      w: number;
      h: number;
      hash: string;
      label: string;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
      connections: number[];
      pulse: number;
    }

    const blocks: BlockchainBlock[] = [];
    const blockCount = Math.min(9, Math.floor(width / 160));

    const sampleHashes = [
      '0x8f2a...91c0',
      '0x3e17...44d2',
      '0x99b1...fe88',
      '0x41ca...001b',
      '0x72d9...3a8f',
      '0xbf45...8e19',
      '0x10ae...d421',
      '0x66c8...5502'
    ];

    const blockLabels = [
      'BLOCK #21.8M',
      'SATHUKA L2',
      'BTC ETF PROOF',
      'ORBITAL NODE',
      'CONSENSUS OK',
      'CEX DEPTH #1',
      'POW/POS SYNC',
      'QUANT SIGNAL'
    ];

    for (let i = 0; i < blockCount; i++) {
      blocks.push({
        x: Math.random() * (width - 150) + 75,
        y: Math.random() * (height - 100) + 50,
        w: 120,
        h: 46,
        hash: sampleHashes[i % sampleHashes.length],
        label: blockLabels[i % blockLabels.length],
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        color: i % 2 === 0 ? '#00C49F' : '#F59E0B',
        alpha: Math.random() * 0.35 + 0.35,
        connections: [],
        pulse: Math.random() * Math.PI * 2
      });
    }

    // Connect nearest blocks to form a blockchain DAG
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        if (Math.random() > 0.45) {
          blocks[i].connections.push(j);
        }
      }
    }

    // 2. Data Packet Sparks (traveling along the blockchain wires)
    interface DataSpark {
      fromIndex: number;
      toIndex: number;
      progress: number;
      speed: number;
      color: string;
    }

    const sparks: DataSpark[] = [];
    for (let i = 0; i < 18; i++) {
      const from = Math.floor(Math.random() * blocks.length);
      const to = (from + 1) % blocks.length;
      sparks.push({
        fromIndex: from,
        toIndex: to,
        progress: Math.random(),
        speed: Math.random() * 0.008 + 0.004,
        color: i % 2 === 0 ? '#2DD4BF' : '#FBBF24'
      });
    }

    // 3. Floating Web3 Constellation Particles
    interface Web3Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
      shape: 'diamond' | 'hex' | 'circle';
      orbitAngle: number;
      orbitSpeed: number;
    }

    const particles: Web3Particle[] = [];
    const particleCount = Math.min(48, Math.floor(width / 30));
    const colors = ['#00C49F', '#2DD4BF', '#F59E0B', '#E5A93C', '#38BDF8', '#6366F1'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1.2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5 - 0.2, // upward drift
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
        shape: i % 3 === 0 ? 'diamond' : i % 5 === 0 ? 'hex' : 'circle',
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Dampen scroll velocity smoothly
      scrollVelocity *= 0.92;
      const dynamicSpeedBoost = Math.min(2.5, Math.abs(scrollVelocity) * 0.2);

      // 1. Draw glowing blockchain connection circuits between blocks
      ctx.lineWidth = 1.2;
      blocks.forEach((block, idx) => {
        block.pulse += 0.03;
        block.connections.forEach(targetIdx => {
          const target = blocks[targetIdx];
          if (!target) return;

          const grad = ctx.createLinearGradient(block.x, block.y, target.x, target.y);
          grad.addColorStop(0, block.color === '#00C49F' ? 'rgba(0, 196, 159, 0.35)' : 'rgba(245, 158, 11, 0.35)');
          grad.addColorStop(1, target.color === '#00C49F' ? 'rgba(0, 196, 159, 0.35)' : 'rgba(245, 158, 11, 0.35)');

          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.moveTo(block.x, block.y);

          // Circuit step routing (creates clean high-tech PCB/Web3 blockchain angle routes)
          const midX = (block.x + target.x) / 2;
          ctx.lineTo(midX, block.y);
          ctx.lineTo(midX, target.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        });
      });

      // 2. Draw Data Packet Sparks traveling along blockchain links
      sparks.forEach(spark => {
        spark.progress += spark.speed + (dynamicSpeedBoost * 0.01);
        if (spark.progress > 1) {
          spark.progress = 0;
          spark.fromIndex = Math.floor(Math.random() * blocks.length);
          spark.toIndex = (spark.fromIndex + 1 + Math.floor(Math.random() * (blocks.length - 1))) % blocks.length;
        }

        const bFrom = blocks[spark.fromIndex];
        const bTo = blocks[spark.toIndex];
        if (bFrom && bTo) {
          const curX = bFrom.x + (bTo.x - bFrom.x) * spark.progress;
          const curY = bFrom.y + (bTo.y - bFrom.y) * spark.progress;

          ctx.save();
          ctx.fillStyle = spark.color;
          ctx.shadowColor = spark.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // 3. Render Floating Blockchain Blocks
      blocks.forEach(b => {
        b.x += b.speedX + (scrollVelocity * 0.1);
        b.y += b.speedY - (scrollVelocity * 0.2);

        // Keep inside bounds
        if (b.x < -40) b.x = width + 40;
        if (b.x > width + 40) b.x = -40;
        if (b.y < -40) b.y = height + 40;
        if (b.y > height + 40) b.y = -40;

        ctx.save();
        ctx.translate(b.x, b.y);

        // Subtle block tilt based on scroll
        const tilt = Math.sin(time + b.pulse) * 0.05 + (scrollVelocity * 0.02);
        ctx.rotate(tilt);

        // Block glow
        const glowAlpha = Math.sin(b.pulse) * 0.1 + 0.2;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 12;

        // Block glass body
        ctx.fillStyle = 'rgba(11, 20, 42, 0.85)';
        ctx.strokeStyle = b.color === '#00C49F' ? `rgba(0, 196, 159, ${b.alpha})` : `rgba(245, 158, 11, ${b.alpha})`;
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, 6);
        ctx.fill();
        ctx.stroke();

        // Text labels inside the block
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(b.label, -b.w / 2 + 10, -b.h / 2 + 16);

        ctx.fillStyle = b.color;
        ctx.font = '8px monospace';
        ctx.fillText(b.hash, -b.w / 2 + 10, -b.h / 2 + 30);

        // Validation status dot
        ctx.beginPath();
        ctx.arc(b.w / 2 - 12, -b.h / 2 + 15, 3, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();

        ctx.restore();
      });

      // 4. Render Floating Sathuka Diamond Particles & Web3 Constellation Nodes
      particles.forEach(p => {
        p.orbitAngle += p.orbitSpeed;
        p.x += p.speedX + Math.cos(p.orbitAngle) * 0.35 + (scrollVelocity * 0.05);
        p.y += p.speedY + Math.sin(p.orbitAngle) * 0.35 - (scrollVelocity * 0.1);

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;

        if (p.shape === 'diamond') {
          // Sathuka logo diamond motif
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.6);
          ctx.lineTo(p.size * 1.6, 0);
          ctx.lineTo(0, p.size * 1.6);
          ctx.lineTo(-p.size * 1.6, 0);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'hex') {
          // Web3 hexagon token node
          const r = p.size * 1.4;
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const angle = (a * Math.PI) / 3;
            const hx = r * Math.cos(angle);
            const hy = r * Math.sin(angle);
            if (a === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      {/* 1. Deep Web3 Cyber Gradient Canvas (Vibrant deep space indigo / slate, NOT flat black) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080E21] via-[#0A132B] to-[#060B18]" />

      {/* 2. Cyber Blockchain Grid Overlay with Perspective Flow */}
      <div 
        className="absolute inset-0 bg-blockchain-grid opacity-35 animate-cyber-grid"
        style={{
          transform: `translateY(${(scrollProgress * 60) % 40}px)`,
          transition: 'transform 0.1s linear'
        }}
      />

      {/* 3. Radial Cyber Auroras - Sathuka Teal & Gold Energy Waves */}
      <div 
        className="absolute -top-40 -right-40 w-[750px] h-[750px] rounded-full bg-gradient-to-br from-teal-400/20 via-cyan-500/10 to-transparent blur-[120px] animate-sathuka-pulse-glow"
        style={{
          transform: `translate(${Math.sin(scrollProgress * Math.PI) * 40}px, ${scrollProgress * 80}px)`
        }}
      />

      <div 
        className="absolute -bottom-48 -left-48 w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-amber-500/22 via-yellow-600/10 to-transparent blur-[130px] animate-sathuka-pulse-glow"
        style={{ 
          animationDelay: '2.5s',
          transform: `translate(${-Math.sin(scrollProgress * Math.PI) * 40}px, ${-scrollProgress * 80}px)`
        }}
      />

      {/* 4. Center Intertwined Web3 Orbital Rings (Recreating Sathuka logo with 3D scroll tilt) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] opacity-35"
        style={{
          transform: `translate(-50%, -50%) rotate(${scrollProgress * 45}deg) scale(${1 + scrollProgress * 0.1})`,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Ring 1: Sathuka Teal Ellipse with neon glow */}
        <div 
          className="absolute inset-0 rounded-[48%] border-2 border-teal-400/60 shadow-[0_0_60px_rgba(45,212,191,0.35)] animate-sathuka-orbit-slow"
          style={{ transform: 'rotate(25deg) scaleX(1.4) scaleY(0.65)' }}
        />

        {/* Ring 2: Sathuka Gold Ellipse (Counter-orbit) */}
        <div 
          className="absolute inset-0 rounded-[48%] border-2 border-amber-400/55 shadow-[0_0_55px_rgba(245,158,11,0.3)] animate-sathuka-orbit-reverse"
          style={{ transform: 'rotate(-40deg) scaleX(1.35) scaleY(0.7)' }}
        />

        {/* Ring 3: Cyan Accent Orbit */}
        <div 
          className="absolute inset-10 rounded-[48%] border border-sky-400/45 animate-sathuka-orbit-medium"
          style={{ transform: 'rotate(80deg) scaleX(1.25) scaleY(0.75)' }}
        />
      </div>

      {/* 5. Floating Sathuka Watermark Motifs with Scroll Parallax */}
      <div 
        className="absolute top-28 right-14 opacity-[0.12] animate-sathuka-float"
        style={{
          transform: `translateY(${scrollProgress * -80}px)`
        }}
      >
        <img
          src="/assets/aistudio/image_1d08876f.png"
          alt=""
          className="w-96 h-96 object-contain filter drop-shadow-[0_0_60px_rgba(45,212,191,0.5)]"
        />
      </div>

      <div 
        className="absolute bottom-20 left-12 opacity-[0.09] animate-sathuka-float-reverse"
        style={{
          transform: `translateY(${scrollProgress * 70}px)`
        }}
      >
        <img
          src="/assets/aistudio/image_1d08876f.png"
          alt=""
          className="w-80 h-80 object-contain filter drop-shadow-[0_0_50px_rgba(245,158,11,0.4)]"
        />
      </div>

      {/* 6. Dynamic Canvas: Connected Blockchain DAG + Data Spark Telemetry */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* 7. Live Scroll-Reacting Web3 Blockchain Height Telemetry (Quiet, bottom-right) */}
      <div className="pointer-events-auto absolute bottom-4 right-4 z-40 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/70 text-[10px] font-mono text-slate-300 backdrop-blur shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-400">Blockchain Sync:</span>
        <span className="text-teal-400 font-bold">#{blockHeight.toLocaleString()}</span>
        <span className="text-slate-500">·</span>
        <span className="text-amber-400 font-semibold">{Math.round(scrollProgress * 100)}% Depth</span>
      </div>
    </div>
  );
};
