import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeSceneProps {
  text: string;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ text }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // slate-950 matching the app theme
    scene.fog = new THREE.Fog(0x020617, 20, 80);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 25);
    camera.lookAt(0, 6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffd700, 0.8); // Golden sunlight
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pinkLight = new THREE.PointLight(0xd946ef, 2, 30); // Fuchsia glow from within
    pinkLight.position.set(0, 5, 0);
    scene.add(pinkLight);

    // --- Ground ---
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ 
        color: 0x0f172a, // Dark slate
        roughness: 0.9,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Geometry Reuse ---
    // Stem: Cylinder
    const stemGeo = new THREE.CylinderGeometry(0.1, 0.15, 1, 8);
    stemGeo.translate(0, 0.5, 0); // Pivot at bottom
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }); // green-700

    // Petal: Flattened Cone/Pyramid to look like a lily petal
    // Stargazer shape: wide in middle, pointed tip.
    // We simulate this with a scaled cone.
    const petalGeo = new THREE.ConeGeometry(0.6, 2.5, 8);
    petalGeo.translate(0, 1.25, 0); // Pivot at base
    petalGeo.scale(1, 1, 0.15); // Flatten Z axis
    
    // Stargazer Pink Color
    const petalMat = new THREE.MeshStandardMaterial({
        color: 0xe879f9, // fuchsia-400
        emissive: 0xbe185d, // pink-700
        emissiveIntensity: 0.3,
        roughness: 0.4,
        metalness: 0.1,
        side: THREE.DoubleSide
    });

    // Pistil (Center part)
    const pistilGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.8, 5);
    pistilGeo.translate(0, 0.9, 0);
    const pistilMat = new THREE.MeshBasicMaterial({ color: 0xfde047 }); // yellow-300

    // --- Flower Creation ---
    const flowers: any[] = [];
    
    const createFlower = (totalHeight: number, delay: number, x: number, z: number) => {
        const group = new THREE.Group() as any;
        group.position.set(x, 0, z);

        // Stem
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.scale.y = 0.01; // Start tiny
        stem.castShadow = true;
        stem.receiveShadow = true;
        group.add(stem);

        // Head Group
        const head = new THREE.Group();
        head.position.y = 0;
        group.add(head);

        // Petals
        const petals: THREE.Mesh[] = [];
        const numPetals = 6;
        for(let i=0; i<numPetals; i++) {
            const petal = new THREE.Mesh(petalGeo, petalMat);
            const angle = (Math.PI * 2 / numPetals) * i;
            
            // Orient petal
            petal.rotation.y = angle;
            // Initial closed state: nearly vertical
            petal.rotation.z = 0.1; 
            
            head.add(petal);
            petals.push(petal);
        }

        // Pistils
        for(let j=0; j<3; j++) {
            const pistil = new THREE.Mesh(pistilGeo, pistilMat);
            pistil.rotation.x = (Math.random() - 0.5) * 0.5;
            pistil.rotation.z = (Math.random() - 0.5) * 0.5;
            head.add(pistil);
        }

        group.userData = {
            totalHeight,
            delay,
            stem,
            head,
            petals,
            swaySpeed: 0.5 + Math.random() * 0.5,
            swayOffset: Math.random() * Math.PI
        };

        scene.add(group);
        return group;
    };

    // --- Instantiate Bouquet ---
    const count = 40;
    for(let i=0; i<count; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Cluster them nicely
        const radius = Math.sqrt(Math.random()) * 12; 
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const h = 10 + Math.random() * 8; // Height
        const d = Math.random() * 3.5; // Delay

        flowers.push(createFlower(h, d, x, z));
    }

    // --- Particles (Fireflies/Pollen) ---
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i++) {
        pPos[i] = (Math.random() - 0.5) * 40;
        if(i % 3 === 1) pPos[i] = Math.random() * 20; // Y range 0-20
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xfff7ed, // orange-50
        size: 0.15,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let reqId: number;

    const animate = () => {
        reqId = requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // Animate Flowers
        flowers.forEach(flower => {
            const { totalHeight, delay, stem, head, petals, swaySpeed, swayOffset } = flower.userData;
            
            if (time > delay) {
                const age = time - delay;
                
                // Growth Phase (Logarithmic ease out for "shooting up" effect)
                const growDuration = 3;
                const growProgress = Math.min(age / growDuration, 1);
                // cubic ease out
                const growth = 1 - Math.pow(1 - growProgress, 3); 

                const currentH = growth * totalHeight;
                stem.scale.y = Math.max(0.1, currentH);
                head.position.y = currentH;

                // Blooming Phase (Starts after growth is halfway)
                if (growProgress > 0.3) {
                    const bloomDuration = 2;
                    const bloomAge = Math.min((age - (growDuration * 0.3)) / bloomDuration, 1);
                    const bloom = 1 - Math.pow(1 - bloomAge, 3);

                    petals.forEach((petal: THREE.Mesh) => {
                        // Target rotation for open flower: ~60 degrees (PI/3)
                        const startRot = 0.1;
                        const endRot = Math.PI / 3.5; 
                        // Rotate Z is the "opening" axis for our cone oriented Y-up
                        petal.rotation.z = startRot + (endRot - startRot) * bloom;
                    });
                }

                // Wind Sway
                if (growProgress > 0.8) {
                    const sway = Math.sin(time * swaySpeed + swayOffset) * 0.1;
                    flower.rotation.z = sway;
                    flower.rotation.x = Math.cos(time * swaySpeed * 0.7) * 0.05;
                }
            }
        });

        // Animate Particles
        particles.rotation.y = time * 0.05;
        const positions = particles.geometry.attributes.position.array as Float32Array;
        for(let i=1; i<positions.length; i+=3) {
            positions[i] += 0.02; // float up
            if(positions[i] > 20) positions[i] = 0; // reset
        }
        particles.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    };

    animate();

    // --- Resize Handler ---
    const handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
        cancelAnimationFrame(reqId);
        window.removeEventListener('resize', handleResize);
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }
        // Optional: dispose geometries/materials
        stemGeo.dispose(); stemMat.dispose();
        petalGeo.dispose(); petalMat.dispose();
        groundGeo.dispose(); groundMat.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="absolute inset-0" />
      
      {/* Text Overlay */}
      <div className="absolute top-[15%] w-full flex justify-center z-10 px-4 pointer-events-none">
        <h1 
            className="text-5xl md:text-7xl lg:text-8xl text-center font-['Great_Vibes'] animate-pulse"
            style={{
                color: '#fbcfe8', // pink-200
                textShadow: '0 0 20px #be185d, 0 0 40px #db2777',
                fontFamily: "'Great Vibes', cursive"
            }}
        >
            {text}
        </h1>
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
      `}</style>
    </div>
  );
};

export default ThreeScene;
