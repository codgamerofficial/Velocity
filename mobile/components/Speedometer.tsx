
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { TestPhase } from '../types';

interface SpeedometerProps {
    speed: number;
    phase: TestPhase;
    max?: number;
}

const Speedometer: React.FC<SpeedometerProps> = ({ speed, phase, max = 1000 }) => {
    const radius = 120;
    const strokeWidth = 20;
    const center = radius + strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const halfCircumference = circumference / 2;

    // Calculate progress (0 to 1)
    const progress = Math.min(speed / max, 1);
    const strokeDashoffset = halfCircumference - (progress * halfCircumference);

    // Color based on phase
    let color = '#3b82f6'; // blue-500 default
    if (phase === TestPhase.DOWNLOAD) color = '#00D4FF'; // cyan
    if (phase === TestPhase.UPLOAD) color = '#9D6CFF'; // purple

    return (
        <View style={styles.container}>
            <Svg width={center * 2} height={center + 20} viewBox={`0 0 ${center * 2} ${center + 20}`}>
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor={color} stopOpacity="0.2" />
                        <Stop offset="1" stopColor={color} stopOpacity="1" />
                    </LinearGradient>
                </Defs>

                {/* Background Arc */}
                <Path
                    d={`M${strokeWidth},${center} A${radius},${radius} 0 0,1 ${center * 2 - strokeWidth},${center}`}
                    stroke="#334155"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Progress Arc */}
                <Path
                    d={`M${strokeWidth},${center} A${radius},${radius} 0 0,1 ${center * 2 - strokeWidth},${center}`}
                    stroke="url(#grad)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${halfCircumference} ${halfCircumference}`}
                    strokeDashoffset={strokeDashoffset}
                />
            </Svg>

            <View style={styles.textContainer}>
                <Text style={[styles.speedText, { color }]}>
                    {speed.toFixed(1)}
                </Text>
                <Text style={styles.unitText}>Mbps</Text>
                <Text style={styles.phaseText}>
                    {phase === TestPhase.IDLE ? 'READY' : phase}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    textContainer: {
        position: 'absolute',
        top: 80, // Adjust based on radius
        alignItems: 'center',
    },
    speedText: {
        fontSize: 48,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
    },
    unitText: {
        fontSize: 16,
        color: '#94a3b8', // slate-400
        marginTop: -5,
    },
    phaseText: {
        fontSize: 12,
        color: '#64748b', // slate-500
        marginTop: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});

export default Speedometer;
