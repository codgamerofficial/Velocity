import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
    value: number | null;
    decimals?: number;
    className?: string;
    duration?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    decimals = 0,
    className = '',
    duration = 0.5
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useSpring(0, { duration: duration * 1000, bounce: 0.25 });
    const rounded = useTransform(motionValue, (latest) =>
        latest.toFixed(decimals)
    );

    useEffect(() => {
        if (value !== null) {
            motionValue.set(value);
        }
    }, [value, motionValue]);

    if (value === null) {
        return <span className={className}>--</span>;
    }

    return (
        <motion.span
            ref={ref}
            className={`count-up tabular-nums ${className}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {rounded}
        </motion.span>
    );
};

export default AnimatedCounter;
