import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Loader } from '@/components/Loader';

interface ThreeModelViewerProps {
  mode?: 'text' | 'model';
}

export function ThreeModelViewer({ mode = 'text' }: ThreeModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    // 3. Transparent WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7e6, 2.0);
    sunLight.position.set(5, 8, 5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x70d6ff, 1.5);
    rimLight.position.set(-6, -4, -3);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(0xffeedd, 1.2, 20);
    pointLight.position.set(0, 3, 4);
    scene.add(pointLight);

    // 5. Pivot Group for interactive 3D rotation & floating
    const pivot = new THREE.Group();
    scene.add(pivot);

    let currentMesh: THREE.Object3D | null = null;
    let isDisposed = false;

    if (mode === 'text') {
      const ttfLoader = new TTFLoader();
      ttfLoader.load('/fonts/segoeuib.ttf', (json) => {
        if (isDisposed) return;
        const font = new FontLoader().parse(json);

        const textGeo = new TextGeometry('joyride', {
          font,
          size: 1.3,
          depth: 0.5,
          curveSegments: 16,
          bevelEnabled: true,
          bevelThickness: 0.12,
          bevelSize: 0.06,
          bevelOffset: 0,
          bevelSegments: 6,
        });

        textGeo.computeBoundingBox();
        textGeo.center();

        // High-end tactile material with glossy clearcoat
        const textMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#1eb8d8'),
          emissive: new THREE.Color('#0b4f6c'),
          emissiveIntensity: 0.15,
          roughness: 0.2,
          metalness: 0.05,
          clearcoat: 0.8,
          clearcoatRoughness: 0.15,
          reflectivity: 0.9,
        });

        const mesh = new THREE.Mesh(textGeo, textMat);
        pivot.add(mesh);
        currentMesh = mesh;
        setLoading(false);
      });
    } else {
      const gltfLoader = new GLTFLoader();
      gltfLoader.load('/models/hourglass.glb', (gltf) => {
        if (isDisposed) return;
        const model = gltf.scene;

        // Center and scale
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.6 / maxDim;

        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));

        pivot.add(model);
        currentMesh = model;
        setLoading(false);
      });
    }

    // 6. Interactive Cursor Tracking (in true 3D space)
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const onPointerMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouse.targetX = (e.clientX - cx) / cx;
      mouse.targetY = (e.clientY - cy) / cy;
    };

    window.addEventListener('mousemove', onPointerMove);

    // 7. Render Loop with true 3D rotation & ambient floating
    let rafId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Smooth damping interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.07;
      mouse.y += (mouse.targetY - mouse.y) * 0.07;

      // Real 3D orientation: turns in X and Y
      pivot.rotation.y = mouse.x * 0.75;
      pivot.rotation.x = -mouse.y * 0.55;

      // Ambient 3D floating hover
      pivot.position.y = Math.sin(elapsed * 1.5) * 0.15;
      pivot.position.x = Math.cos(elapsed * 1.0) * 0.05;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW === 0 || newH === 0) return;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onPointerMove);
      resizeObserver.disconnect();
      if (currentMesh && 'geometry' in currentMesh) {
        (currentMesh as THREE.Mesh).geometry.dispose();
      }
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [mode]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {loading && <Loader />}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
