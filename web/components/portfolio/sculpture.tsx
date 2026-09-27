'use client';
import { useRef } from 'react';
import Image from 'next/image';
export function Sculpture() {
  const ref = useRef<HTMLDivElement>(null);
  return <figure className="sculpture" onPointerMove={e => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    if (ref.current) ref.current.style.transform = `perspective(1000px) rotateY(${((e.clientX-r.left)/r.width-.5)*7}deg) rotateX(${((e.clientY-r.top)/r.height-.5)*-5}deg)`;
  }} onPointerLeave={() => { if(ref.current) ref.current.style.transform = ''; }}>
    <div ref={ref} className="sculpture-object"><Image src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/sculpture.webp`} width="1254" height="1254" alt="Conceptual exploded sculpture of brushed metal and translucent orange glass" fetchPriority="high" /></div>
    <figcaption>An exploration of systems,<br/>inside out.</figcaption>
  </figure>;
}
