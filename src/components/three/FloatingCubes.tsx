'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FloatingCubes() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;

    const currentMount = mountRef.current;
    
    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, cubes: THREE.Group;
    let mouseX = 0, mouseY = 0;
    
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.z = 2000;

      cubes = new THREE.Group();
      scene.add(cubes);

      const geometry = new THREE.BoxGeometry(100, 100, 100);
      const material = new THREE.MeshBasicMaterial({ color: 0x800080, wireframe: true, transparent: true, opacity: 0.3 }); // Purple
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 }); // Cyan

      for (let i = 0; i < 100; i++) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = Math.random() * 4000 - 2000;
        cube.position.y = Math.random() * 4000 - 2000;
        cube.position.z = Math.random() * 4000 - 2000;
        cube.rotation.x = Math.random() * 2 * Math.PI;
        cube.rotation.y = Math.random() * 2 * Math.PI;
        cubes.add(cube);

        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, lineMaterial);
        line.position.copy(cube.position);
        line.rotation.copy(cube.rotation);
        cubes.add(line);
      }

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      currentMount.appendChild(renderer.domElement);
      
      document.addEventListener('mousemove', onDocumentMouseMove);
      window.addEventListener('resize', onWindowResize);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    function onDocumentMouseMove(event: MouseEvent) {
      mouseX = (event.clientX - windowHalfX) * 2;
      mouseY = (event.clientY - windowHalfY) * 2;
    }

    function animate() {
      requestAnimationFrame(animate);
      render();
    }

    function render() {
      const time = Date.now() * 0.0001;
      
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      
      cubes.rotation.x = Math.sin(time * 0.7) * 0.5;
      cubes.rotation.y = Math.cos(time * 0.5) * 0.5;
      cubes.rotation.z = Math.sin(time * 0.3) * 0.5;
      
      renderer.render(scene, camera);
    }

    init();
    animate();

    return () => {
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      if (renderer && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full -z-10" />;
}
