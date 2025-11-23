import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Gradient Mesh Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface to-panel"></div>

            {/* Animated Orbs */}
            <motion.div
                className="absolute top-[10%] left-[10%] w-96 h-96 bg-accent-cyan/10 rounded-full blur-[120px]"
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                className="absolute top-[60%] right-[10%] w-96 h-96 bg-accent-purple/10 rounded-full blur-[120px]"
                animate={{
                    x: [0, -30, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                className="absolute bottom-[20%] left-[40%] w-72 h-72 bg-accent-green/8 rounded-full blur-[100px]"
                animate={{
                    x: [0, 40, 0],
                    y: [0, -20, 0],
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Gradient Overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80"></div>
        </div>
    );
};

export default AnimatedBackground;
