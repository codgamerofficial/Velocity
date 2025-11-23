
import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { Activity, Play, Square, Wifi, Zap, ArrowDown, ArrowUp } from 'lucide-react-native';
import Speedometer from './components/Speedometer';
import { NetworkSimulationEngine } from './services/simulationEngine';
import { EngineState, TestPhase } from './types';

export default function App() {
    const [engineState, setEngineState] = useState<EngineState>({
        phase: TestPhase.IDLE,
        currentSpeed: 0,
        progress: 0,
        ping: null,
        jitter: null,
        packetLoss: null,
        stabilityScore: 100,
        downloadPeak: 0,
        uploadPeak: 0,
        graphData: [],
        downloadGraphData: [],
        uploadGraphData: [],
        pingGraphData: [],
        packetLossData: []
    });

    const engineRef = useRef<NetworkSimulationEngine | null>(null);

    const handleEngineUpdate = useCallback((newState: EngineState) => {
        setEngineState(newState);
    }, []);

    const handleComplete = useCallback((finalState: Partial<EngineState>) => {
        console.log('Test Complete', finalState);
    }, []);

    const startTest = () => {
        if (!engineRef.current) {
            engineRef.current = new NetworkSimulationEngine(handleEngineUpdate, handleComplete);
        }
        engineRef.current.start(null, 20, false);
    };

    const stopTest = () => {
        if (engineRef.current) {
            engineRef.current.stop();
        }
    };

    const isActive = engineState.phase !== TestPhase.IDLE && engineState.phase !== TestPhase.COMPLETE;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoRow}>
                    <Activity color="#00D4FF" size={24} />
                    <Text style={styles.title}>Velocity <Text style={styles.proBadge}>PRO</Text></Text>
                </View>
                <View style={styles.networkBadge}>
                    <Wifi color="#10B981" size={14} />
                    <Text style={styles.networkText}>WIFI</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Main Card */}
                <View style={styles.card}>
                    <Speedometer speed={engineState.currentSpeed} phase={engineState.phase} />

                    <View style={styles.buttonContainer}>
                        {isActive ? (
                            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopTest}>
                                <Square color="#EF4444" size={20} fill="#EF4444" />
                                <Text style={[styles.buttonText, styles.stopText]}>STOP TEST</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={[styles.button, styles.startButton]} onPress={startTest}>
                                <Play color="#FFFFFF" size={20} fill="#FFFFFF" />
                                <Text style={styles.buttonText}>START</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Zap color="#F59E0B" size={16} />
                            <Text style={styles.statLabel}>Ping</Text>
                        </View>
                        <Text style={styles.statValue}>
                            {engineState.ping !== null ? engineState.ping : '-'} <Text style={styles.statUnit}>ms</Text>
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Activity color="#F59E0B" size={16} />
                            <Text style={styles.statLabel}>Jitter</Text>
                        </View>
                        <Text style={styles.statValue}>
                            {engineState.jitter !== null ? engineState.jitter : '-'} <Text style={styles.statUnit}>ms</Text>
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <ArrowDown color="#00D4FF" size={16} />
                            <Text style={styles.statLabel}>Download</Text>
                        </View>
                        <Text style={[styles.statValue, { color: '#00D4FF' }]}>
                            {engineState.downloadPeak > 0 ? engineState.downloadPeak.toFixed(1) : '-'}
                        </Text>
                        <Text style={styles.statUnit}>Mbps</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <ArrowUp color="#9D6CFF" size={16} />
                            <Text style={styles.statLabel}>Upload</Text>
                        </View>
                        <Text style={[styles.statValue, { color: '#9D6CFF' }]}>
                            {engineState.uploadPeak > 0 ? engineState.uploadPeak.toFixed(1) : '-'}
                        </Text>
                        <Text style={styles.statUnit}>Mbps</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a', // slate-900
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    proBadge: {
        fontSize: 12,
        fontWeight: 'normal',
        color: '#94a3b8',
    },
    networkBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    networkText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#10B981',
    },
    scrollContent: {
        padding: 20,
    },
    card: {
        backgroundColor: '#1e293b', // slate-800
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 24,
    },
    buttonContainer: {
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 100,
        minWidth: 200,
    },
    startButton: {
        backgroundColor: '#00D4FF',
        shadowColor: '#00D4FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    stopButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.5)',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    stopText: {
        color: '#EF4444',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#94a3b8',
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    statUnit: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: 'normal',
    },
});
