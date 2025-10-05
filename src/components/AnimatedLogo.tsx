'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function AnimatedLogo() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(28, 28);
    currentMount.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff }); // Cyan
    const wireframe = new THREE.LineSegments(edges, lineMaterial);

    scene.add(wireframe);
    camera.position.z = 2.5;

    const animate = function () {
      requestAnimationFrame(animate);
      wireframe.rotation.x += 0.005;
      wireframe.rotation.y += 0.005;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-7 h-7" />;
}
