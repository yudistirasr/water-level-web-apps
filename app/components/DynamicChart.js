'use client'
import { useEffect, useRef } from 'react';

export default function DynamicChart({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create sophisticated gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.9)');  // Cyan-400
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.5)'); // Blue-500
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.1)');   // Indigo-500
    
    // Enhanced background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.3)'; // Slate-900 with opacity
    ctx.fillRect(0, 0, width, height);
    
    // Improved grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)'; // Slate-400 with low opacity
    ctx.lineWidth = 1;
    
    // Draw horizontal grid lines with labels
    for(let i = 0; i <= 4; i++) {
      const y = height * i / 4;
      
      // Grid line
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      
      // Value label
      const value = ((4 - i) * Math.max(...data.values) / 4).toFixed(1);
      ctx.font = '12px Inter, system-ui';
      ctx.fillStyle = 'rgba(203, 213, 225, 0.7)'; // Slate-300
      ctx.fillText(`${value}m`, 10, y - 5);
    }
    
    // Calculate points
    const points = data.values.map((value, index) => ({
      x: (width / (data.values.length - 1)) * index,
      y: height - (value / Math.max(...data.values)) * height * 0.8
    }));
    
    // Draw area fill
    ctx.beginPath();
    ctx.moveTo(points[0].x, height);
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.lineTo(points[0].x, height);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw line with glow effect
    ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    
    // Draw points with double circle effect
    points.forEach((point) => {
      // Outer glow
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.fill();
      
      // Inner circle
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
    
    // Draw time labels
    ctx.font = '12px Inter, system-ui';
    ctx.fillStyle = 'rgba(203, 213, 225, 0.8)';
    ctx.shadowBlur = 0;
    data.labels.forEach((label, index) => {
      const x = points[index].x;
      ctx.fillText(label, x - 15, height - 10);
    });
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-xl backdrop-blur-sm bg-slate-900/20"
      width={800}
      height={400}
    />
  );
}
