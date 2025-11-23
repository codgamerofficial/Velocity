import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface ConfettiEffectProps {
    trigger: boolean;
    duration?: number;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ trigger, duration = 3000 }) => {
    useEffect(() => {
        if (!trigger) return;

        const end = Date.now() + duration;
        const colors = ['#00D4FF', '#9D6CFF', '#10B981'];

        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }, [trigger, duration]);

    return null;
};

export default ConfettiEffect;
