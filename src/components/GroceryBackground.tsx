
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GroceryBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create floating grocery items
    const items: THREE.Mesh[] = [];
    const geometries = [
      new THREE.BoxGeometry(1, 1, 1), // Box for grocery items
      new THREE.SphereGeometry(0.5, 32, 32), // Sphere for fruits
      new THREE.CylinderGeometry(0.3, 0.3, 1, 32) // Cylinder for bottles
    ];

    const colors = [
      0x87CEEB, // Sky blue
      0x98FB98, // Pale green
      0xFFA07A  // Light salmon
    ];

    // Create multiple floating items with larger size and more spread out
    for (let i = 0; i < 20; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = new THREE.MeshPhongMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        transparent: true,
        opacity: 0.7 // Increased opacity
      });
      const item = new THREE.Mesh(geometry, material);

      // More spread out positions
      item.position.x = Math.random() * 30 - 15;
      item.position.y = Math.random() * 30 - 15;
      item.position.z = Math.random() * 30 - 20;

      // Make items larger
      item.scale.set(2, 2, 2);

      items.push(item);
      scene.add(item);
    }

    // Stronger lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Increased intensity
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Increased intensity
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    camera.position.z = 15; // Moved camera back

    // Enhanced animation
    const animate = () => {
      requestAnimationFrame(animate);

      items.forEach((item) => {
        item.rotation.x += 0.005; // Increased rotation speed
        item.rotation.y += 0.005;
        item.position.y += Math.sin(Date.now() * 0.001) * 0.05; // Increased floating movement
      });

      renderer.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      // Dispose of geometries and materials
      items.forEach((item) => {
        item.geometry.dispose();
        (item.material as THREE.Material).dispose();
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        opacity: 0.5, // Increased opacity
      }}
    />
  );
};

export default GroceryBackground;
