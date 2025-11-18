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
    // A deep, romantic purple-slate background to match the pink lily vibe
    scene.background = new THREE.Color(0x1a0b2e); 
    scene.fog = new THREE.Fog(0x1a0b2e, 15, 90);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 25);
    camera.lookAt(0, 6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Warm Sunlight
    const dirLight = new THREE.DirectionalLight(0xffd700, 1.2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Pink Atmospheric Light (Stronger now)
    const pinkLight = new THREE.PointLight(0xff00cc, 3, 60);
    pinkLight.position.set(0, 15, -10);
    scene.add(pinkLight);

    // --- Ground ---
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({ 
        color: 0x1f1033, // Dark purple ground
        roughness: 0.7,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ==========================================
    // SHARED GEOMETRY & MATERIALS (Optimization)
    // ==========================================
    
    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.08, 0.12, 1, 8);
    stemGeo.translate(0, 0.5, 0);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });

    // Petal (Stargazer Shape - Wide and pointy)
    const petalGeo = new THREE.ConeGeometry(0.6, 2.5, 8);
    petalGeo.translate(0, 1.25, 0);
    petalGeo.scale(1, 1, 0.15); // Flatten
    
    const petalMat = new THREE.MeshStandardMaterial({
        color: 0xe879f9, 
        emissive: 0xbe185d,
        emissiveIntensity: 0.3,
        roughness: 0.4,
        metalness: 0.1,
        side: THREE.DoubleSide
    });

    // Pistil
    const pistilGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.8, 5);
    pistilGeo.translate(0, 0.9, 0);
    const pistilMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });

    // Helper to create a Lily Head (Used for both Bouquet and Rain)
    const createLilyHead = (isOpen: boolean) => {
        const head = new THREE.Group();
        const numPetals = 6;
        
        // Petals
        for(let i=0; i<numPetals; i++) {
            const petal = new THREE.Mesh(petalGeo, petalMat);
            const angle = (Math.PI * 2 / numPetals) * i;
            petal.rotation.y = angle;
            // If it's for rain, start fully open. If bouquet, start closed (handled in animation)
            petal.rotation.z = isOpen ? Math.PI / 3.2 : 0.1; 
            
            // Add a subtle curve to the petal tip if possible via rotation
            // (Not changing geometry, but we can rotate x a bit more for flair)
            
            head.add(petal);
        }

        // Pistils
        for(let j=0; j<3; j++) {
            const pistil = new THREE.Mesh(pistilGeo, pistilMat);
            pistil.rotation.x = (Math.random() - 0.5) * 0.4;
            pistil.rotation.z = (Math.random() - 0.5) * 0.4;
            head.add(pistil);
        }
        return head;
    };

    // ==========================================
    // 1. MAIN BOUQUET
    // ==========================================
    const flowers: any[] = [];

    const createFlowerInstance = (totalHeight: number, delay: number, x: number, z: number) => {
        const group = new THREE.Group() as any;
        group.position.set(x, 0, z);

        // Stem
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.scale.y = 0.01; 
        stem.castShadow = true;
        stem.receiveShadow = true;
        group.add(stem);

        // Head
        const head = createLilyHead(false); // Start closed
        head.position.y = 0;
        group.add(head);

        // Store references for animation
        const petals = head.children.filter(c => (c as THREE.Mesh).geometry === petalGeo);

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

    // Create Bouquet
    const bouquetCount = 45;
    for(let i=0; i<bouquetCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Distribution: Dense center, sparse edge
        const rRand = Math.random();
        const radius = (rRand * rRand) * 12; 
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const h = 9 + Math.random() * 6; // Varied height
        const d = Math.random() * 3; // Random start delay
        
        flowers.push(createFlowerInstance(h, d, x, z));
    }

    // ==========================================
    // 2. FALLING LILY RAIN (UPDATED)
    // ==========================================
    const rainLilies: THREE.Group[] = [];
    const rainCount = 100; // Increased density "que llueva asi"

    const createRainLily = () => {
        const g = createLilyHead(true); // Fully open
        
        // Random Start Position
        g.position.set(
            (Math.random() - 0.5) * 80,      // Wide X
            20 + Math.random() * 60,         // High Y
            (Math.random() - 0.5) * 40 - 10  // Z depth (behind and around)
        );
        
        // Random Rotation
        g.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);

        // Random Scale (some smaller, some normal)
        const scale = 0.6 + Math.random() * 0.4;
        g.scale.set(scale, scale, scale);

        g.userData = {
            fallSpeed: 0.05 + Math.random() * 0.1,
            rotVel: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            }
        };
        scene.add(g);
        return g;
    };

    for(let i=0; i<rainCount; i++) {
        rainLilies.push(createRainLily());
    }

    // ==========================================
    // 3. PARTICLES
    // ==========================================
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i++) {
        pPos[i] = (Math.random() - 0.5) * 80;
        pPos[i+1] = Math.random() * 40;
        pPos[i+2] = (Math.random() - 0.5) * 60;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xffaaff, 
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

        // 1. Animate Bouquet
        flowers.forEach(flower => {
            const { totalHeight, delay, stem, head, petals, swaySpeed, swayOffset } = flower.userData;
            if (time > delay) {
                const age = time - delay;
                const growDuration = 3.5;
                const growProgress = Math.min(age / growDuration, 1);
                const growth = 1 - Math.pow(1 - growProgress, 3); // Ease Out Cubic

                // Stem Growth
                const currentH = growth * totalHeight;
                stem.scale.y = Math.max(0.01, currentH);
                head.position.y = currentH;

                // Petal Bloom
                // Start opening at 20% growth
                if (growProgress > 0.2) {
                    const bloomAge = Math.min((age - (growDuration * 0.2)) / 2, 1);
                    const bloom = 1 - Math.pow(1 - bloomAge, 3);
                    
                    const startAngle = 0.1;
                    const endAngle = Math.PI / 3.2;
                    
                    petals.forEach((petal: THREE.Mesh) => {
                        petal.rotation.z = startAngle + (endAngle - startAngle) * bloom;
                    });
                }

                // Wind Sway
                if (growProgress > 0.8) {
                    const wind = Math.sin(time * swaySpeed + swayOffset) * 0.05;
                    const turbulence = Math.cos(time * swaySpeed * 1.3) * 0.02;
                    flower.rotation.z = wind + turbulence;
                    flower.rotation.x = turbulence;
                }
            }
        });

        // 2. Animate Rain
        rainLilies.forEach(lily => {
            lily.position.y -= lily.userData.fallSpeed;
            
            // Tumble
            lily.rotation.x += lily.userData.rotVel.x;
            lily.rotation.y += lily.userData.rotVel.y;
            lily.rotation.z += lily.userData.rotVel.z;

            // Reset if too low
            if(lily.position.y < -5) {
                lily.position.y = 35 + Math.random() * 10;
                lily.position.x = (Math.random() - 0.5) * 80;
                lily.position.z = (Math.random() - 0.5) * 40 - 10;
            }
        });

        // 3. Particles
        particles.rotation.y = time * 0.03;

        renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(reqId);
        window.removeEventListener('resize', handleResize);
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }
        // Dispose
        stemGeo.dispose(); stemMat.dispose();
        petalGeo.dispose(); petalMat.dispose();
        pistilGeo.dispose(); pistilMat.dispose();
        groundGeo.dispose(); groundMat.dispose();
        pGeo.dispose(); pMat.dispose();
    };
  }, [text]);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="absolute inset-0 bg-gradient-to-b from-slate-900 to-purple-900" />
      
      {/* Text Overlay */}
      <div className="absolute top-[15%] w-full flex justify-center z-10 px-4 pointer-events-none">
        <h1 
            className="text-5xl md:text-7xl lg:text-8xl text-center animate-pulse drop-shadow-2xl"
            style={{
                color: '#fce7f3', // pink-100
                textShadow: '0 0 30px #db2777, 0 0 60px #be185d',
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