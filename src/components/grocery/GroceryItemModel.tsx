
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { GroceryItem } from '@/types/grocery';

// Common grocery items and their corresponding 3D model configurations
const GROCERY_MODELS: Record<string, {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  scale: THREE.Vector3;
}> = {
  apple: {
    geometry: new THREE.SphereGeometry(0.5, 32, 32),
    material: new THREE.MeshPhongMaterial({ color: 0xff0000 }),
    scale: new THREE.Vector3(1, 1, 1)
  },
  banana: {
    geometry: new THREE.TorusGeometry(0.3, 0.1, 16, 32, Math.PI),
    material: new THREE.MeshPhongMaterial({ color: 0xffeb3b }),
    scale: new THREE.Vector3(1, 1, 1)
  },
  orange: {
    geometry: new THREE.SphereGeometry(0.5, 32, 32),
    material: new THREE.MeshPhongMaterial({ color: 0xff9800 }),
    scale: new THREE.Vector3(1, 1, 1)
  },
  // More items can be added here
};

interface GroceryItemModelProps {
  item: GroceryItem;
  className?: string;  // Make className optional
}

export const GroceryItemModel: React.FC<GroceryItemModelProps> = ({ item, className }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Configure renderer
    renderer.setSize(48, 48);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(ambientLight);
    scene.add(directionalLight);

    // Create and add mesh
    const modelConfig = GROCERY_MODELS[item.name.toLowerCase()] || GROCERY_MODELS['apple'];
    const mesh = new THREE.Mesh(modelConfig.geometry, modelConfig.material);
    mesh.scale.copy(modelConfig.scale);
    scene.add(mesh);
    meshRef.current = mesh;

    // Position camera
    camera.position.z = 2;

    // Animation loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [item.name]);

  return (
    <div 
      ref={mountRef} 
      className={`w-12 h-12 inline-block mr-2 ${className || ''}`}
      onMouseEnter={() => {
        if (meshRef.current) {
          meshRef.current.scale.multiplyScalar(1.2);
        }
      }}
      onMouseLeave={() => {
        if (meshRef.current) {
          meshRef.current.scale.multiplyScalar(1/1.2);
        }
      }}
    />
  );
};

