import React, { useEffect, useState, useRef } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
    const [phase, setPhase] = useState('drawing'); // drawing, filling, interactive, exit
    const containerRef = useRef(null);

    useEffect(() => {
        // Slower Timeline for animations
        // Drawing phase: 0s - 2.5s
        const drawTimer = setTimeout(() => setPhase('filling'), 2500);

        // Filling & Reveal phase: 2.5s - 5.5s
        const interactTimer = setTimeout(() => setPhase('interactive'), 5500);

        // Exit phase starts at 8s
        const exitTimer = setTimeout(() => handleExit(), 8000);

        return () => {
            clearTimeout(drawTimer);
            clearTimeout(interactTimer);
            clearTimeout(exitTimer);
        };
    }, []);

    const handleExit = () => {
        setPhase('exit');
        setTimeout(() => {
            if (onComplete) onComplete();
        }, 1200); // Slower exit transition
    };

    const handleMouseMove = (e) => {
        if (phase !== 'interactive' || !containerRef.current) return;

        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 20;
        const y = (clientY / window.innerHeight - 0.5) * 20;

        containerRef.current.style.setProperty('--mouse-x', `${x}px`);
        containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <div
            className={`splash-screen-container ${phase}`}
            onMouseMove={handleMouseMove}
            onClick={handleExit}
            ref={containerRef}
        >
            {/* Background Fabric Layers */}
            <div className="fabric-layers">
                <div className="fabric-layer layer-1"></div>
                <div className="fabric-layer layer-2"></div>
                <div className="fabric-layer layer-3"></div>
            </div>

            {/* Central Content */}
            <div className="splash-center">
                <div className="shirt-animation-container">
                    <svg viewBox="0 0 200 200" className="shirt-svg">
                        {/* Shirt Silhouette Path */}
                        <path
                            className="shirt-path"
                            d="M60,40 L40,60 L50,80 L70,70 L70,180 L130,180 L130,70 L150,80 L160,60 L140,40 Q100,55 60,40 Z"
                        />
                        {/* Internal Detail Lines (Collar/Placket/Pocket) */}
                        <path className="detail-path p1" d="M100,50 L100,180" /> {/* Placket */}
                        <path className="detail-path p2" d="M75,50 L100,70 L125,50" /> {/* Collar */}
                        <rect className="detail-path p3" x="110" y="90" width="15" height="15" rx="2" /> {/* Pocket */}
                        {/* Buttons */}
                        <circle className="detail-path p4" cx="106" cy="80" r="1.5" />
                        <circle className="detail-path p4" cx="106" cy="100" r="1.5" />
                        <circle className="detail-path p4" cx="106" cy="120" r="1.5" />
                        <circle className="detail-path p4" cx="106" cy="140" r="1.5" />
                    </svg>

                    {/* Glowing Needle Effect */}
                    <div className="needle-glow"></div>
                </div>

                <div className="brand-reveal">
                    <h1 className="splash-brand">
                        <span className="word-jay">Jay Shri</span>
                        <span className="word-textile">Textile</span>
                    </h1>
                    <div className="splash-loader-bar">
                        <div className="splash-progress"></div>
                    </div>
                </div>
            </div>

            <div className="weave-pattern-overlay"></div>
        </div>
    );
};

export default SplashScreen;
