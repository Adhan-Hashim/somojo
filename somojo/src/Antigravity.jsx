/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

const AntigravityInner = ({
    count = 150, // Less count for bigger 3D objects like antigravity.google
    particleSize = 1,
    autoAnimate = false
}) => {
    const meshRef = useRef(null);
    const { viewport } = useThree();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const targetMouse = useRef({ x: 0, y: 0 });

    // Global mouse listener
    useEffect(() => {
        let width = window.innerWidth;
        let height = window.innerHeight;

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
        };

        const handleMouseMove = (e) => {
            targetMouse.current = {
                x: (e.clientX / width) * 2 - 1,
                y: -(e.clientY / height) * 2 + 1
            };
        };

        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const particles = useMemo(() => {
        const temp = [];
        const width = viewport.width || 100;
        const height = viewport.height || 100;

        for (let i = 0; i < count; i++) {
            // Random positions across a wide depth
            const x = (Math.random() - 0.5) * width;
            const y = (Math.random() - 0.5) * height;
            const z = (Math.random() - 0.5) * 40; // Deep Z space for scale variety

            // Pure white color
            const color = new THREE.Color('#ffffff');

            temp.push({
                cx: x,
                cy: y,
                cz: z,
                // Gentle random drift velocity
                vx: (Math.random() - 0.5) * 0.04,
                vy: (Math.random() - 0.5) * 0.04,
                vz: (Math.random() - 0.5) * 0.04,
                // Rotation angles
                rx: Math.random() * Math.PI * 2,
                ry: Math.random() * Math.PI * 2,
                rz: Math.random() * Math.PI * 2,
                // Rotation velocities
                rvx: (Math.random() - 0.5) * 0.02,
                rvy: (Math.random() - 0.5) * 0.02,
                rvz: (Math.random() - 0.5) * 0.02,
                color,
                // Highly varied base sizes like antigravity.google
                baseScale: 0.5 + Math.random() * 2.5,
            });
        }
        return temp;
    }, [count, viewport.width, viewport.height]);

    useFrame((state) => {
        const mesh = meshRef.current;
        if (!mesh) return;

        const { viewport: v } = state;

        const mouseX = (targetMouse.current.x * v.width) / 2;
        const mouseY = (targetMouse.current.y * v.height) / 2;

        particles.forEach((p, i) => {
            // Smooth, fluid mouse repulsion
            const dx = p.cx - mouseX;
            const dy = p.cy - mouseY;
            // Add Z distance so background elements aren't pushed as hard
            const dist = Math.sqrt(dx * dx + dy * dy + p.cz * p.cz * 0.1);

            if (dist < 12) {
                const force = (12 - dist) * 0.006;
                p.vx += (dx / (dist || 1)) * force;
                p.vy += (dy / (dist || 1)) * force;
                // Add a little spin when hit
                p.rvx += (Math.random() - 0.5) * force * 0.5;
                p.rvy += (Math.random() - 0.5) * force * 0.5;
            }

            // Apply velocity
            p.cx += p.vx;
            p.cy += p.vy;
            p.cz += p.vz;

            // Apply rotation
            p.rx += p.rvx;
            p.ry += p.rvy;
            p.rz += p.rvz;

            // Damping for extremely smooth fluid motion
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.vz *= 0.96;

            // Damping for rotation
            p.rvx *= 0.99;
            p.rvy *= 0.99;
            p.rvz *= 0.99;

            // Add back a tiny bit of random drift so they don't stop entirely
            p.vx += (Math.random() - 0.5) * 0.002;
            p.vy += (Math.random() - 0.5) * 0.002;

            // Screen wrapping for infinite flow
            const limitX = v.width / 2 + 5;
            const limitY = v.height / 2 + 5;
            const limitZ = 25;

            if (p.cx > limitX) p.cx = -limitX;
            if (p.cx < -limitX) p.cx = limitX;
            if (p.cy > limitY) p.cy = -limitY;
            if (p.cy < -limitY) p.cy = limitY;
            if (p.cz > limitZ) p.cz = -limitZ;
            if (p.cz < -limitZ) p.cz = limitZ;

            dummy.position.set(p.cx, p.cy, p.cz);
            dummy.rotation.set(p.rx, p.ry, p.rz);

            // Set final scale
            const scale = p.baseScale * particleSize;
            dummy.scale.set(scale, scale, scale);

            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
            mesh.setColorAt(i, p.color);
        });

        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            {/* Smooth 3D capsule geometry to match antigravity.google */}
            <capsuleGeometry args={[0.3, 0.8, 16, 32]} />
            {/* Rich 3D lighting material */}
            <meshStandardMaterial
                roughness={0.2}
                metalness={0.1}
                color="#ffffff"
            />
        </instancedMesh>
    );
};

const Antigravity = props => {
    return (
        <Canvas camera={{ position: [0, 0, 50], fov: 35 }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 10, 10]} intensity={2.5} />
            <pointLight position={[-10, -5, 10]} intensity={1} color="#ffffff" />
            <AntigravityInner {...props} />
        </Canvas>
    );
};

export default Antigravity;
