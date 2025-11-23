
import { TestPhase, EngineState, SpeedPoint, PacketLossPoint, PingPoint } from "../types";

// Mocking real network functions for React Native initial port
// In a full implementation, we would use react-native-network-info or similar
const measureRealLatency = async (): Promise<number> => {
    return Math.floor(Math.random() * 20) + 20; // Mock 20-40ms
};

const runRealDownloadTest = async (
    duration: number,
    onProgress: (speed: number, progress: number) => void,
    signal: AbortSignal
): Promise<number> => {
    const start = Date.now();
    let mockSpeed = 0;

    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (signal.aborted) {
                clearInterval(interval);
                resolve(mockSpeed);
                return;
            }

            const elapsed = Date.now() - start;
            const progress = Math.min(100, (elapsed / duration) * 100);

            // Mock speed curve
            mockSpeed = Math.min(500, mockSpeed + Math.random() * 50);

            onProgress(mockSpeed, progress);

            if (progress >= 100) {
                clearInterval(interval);
                resolve(mockSpeed);
            }
        }, 100);
    });
};

export class NetworkSimulationEngine {
    private state: EngineState;
    private abortController: AbortController | null = null;
    private onUpdate: (state: EngineState) => void;
    private onComplete: (results: Partial<EngineState>) => void;
    private limit: number | null = null;
    private baseLatency: number = 15;

    // Local buffers to avoid mutating frozen state objects
    private _downloadData: SpeedPoint[] = [];
    private _uploadData: SpeedPoint[] = [];
    private _packetLossData: PacketLossPoint[] = [];
    private _pingData: PingPoint[] = [];

    constructor(
        onUpdate: (state: EngineState) => void,
        onComplete: (results: Partial<EngineState>) => void
    ) {
        this.onUpdate = onUpdate;
        this.onComplete = onComplete;
        this.state = {
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
        };
    }

    private calculateStabilityScore(jitter: number | null, packetLoss: number | null): number {
        let score = 100;

        // Jitter Penalty: 
        // < 5ms: negligible
        // 5-20ms: -0.5 per ms
        // > 20ms: -1 per ms
        if (jitter) {
            const jitterPenalty = Math.max(0, jitter - 5) * 0.5 + Math.max(0, jitter - 20) * 0.5;
            score -= jitterPenalty;
        }

        // Packet Loss Penalty: -25 points per 1% loss
        // Packet loss is severely detrimental to stability.
        if (packetLoss) {
            score -= (packetLoss * 25);
        }

        return Math.max(0, Math.min(100, Math.floor(score)));
    }

    public async start(limit: number | null = null, baseLatency: number = 15, isDataSaver: boolean = false) {
        this.stop(); // Ensure clean start
        this.abortController = new AbortController();

        this.limit = limit;
        this.baseLatency = baseLatency;

        // Reset local buffers
        this._downloadData = [];
        this._uploadData = [];
        this._packetLossData = [];
        this._pingData = [];

        this.state = {
            ...this.state,
            phase: TestPhase.PING,
            progress: 0,
            currentSpeed: 0,
            graphData: [],
            downloadGraphData: [],
            uploadGraphData: [],
            pingGraphData: [],
            packetLossData: [],
            downloadPeak: 0,
            uploadPeak: 0,
            ping: null,
            jitter: null,
            packetLoss: 0,
            stabilityScore: 100
        };

        this.onUpdate({ ...this.state });

        // Configurable durations based on Data Saver
        const DOWNLOAD_DURATION = isDataSaver ? 3000 : 8000;
        const UPLOAD_DURATION = isDataSaver ? 2000 : 5000;
        const PING_SAMPLES = isDataSaver ? 8 : 20;

        // --- 1. REAL PING PHASE ---
        const pings: number[] = [];
        try {
            for (let i = 0; i < PING_SAMPLES; i++) {
                if (this.abortController.signal.aborted) return;
                const rtt = await measureRealLatency();
                if (rtt > 0) {
                    pings.push(rtt);
                    this._pingData.push({ time: Date.now(), ping: rtt });

                    // Update state live
                    const currentAvg = pings.reduce((a, b) => a + b, 0) / pings.length;
                    this.state.ping = Math.floor(currentAvg);
                    this.state.pingGraphData = [...this._pingData];
                    this.onUpdate({ ...this.state });
                }
                await new Promise(r => setTimeout(r, 100));
            }
        } catch (e) {
            console.warn("Ping failed", e);
        }

        if (pings.length === 0) pings.push(this.baseLatency); // Fallback

        const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
        const jitter = Math.sqrt(pings.map(x => Math.pow(x - avgPing, 2)).reduce((a, b) => a + b) / pings.length);

        this.state.ping = Math.floor(avgPing);
        this.state.jitter = Math.floor(jitter);
        this.state.packetLoss = 0;
        this.state.stabilityScore = this.calculateStabilityScore(this.state.jitter, 0);

        this.onUpdate({ ...this.state });

        await new Promise(r => setTimeout(r, 500));

        // --- 2. REAL DOWNLOAD PHASE ---
        if (this.abortController.signal.aborted) return;
        this.state.phase = TestPhase.DOWNLOAD;
        this.state.graphData = [];
        this.onUpdate({ ...this.state });

        const rawDownloadSpeed = await runRealDownloadTest(
            DOWNLOAD_DURATION,
            (speed, progress) => {
                let displaySpeed = speed;

                if (this.limit && speed > this.limit) {
                    const noise = (Math.random() - 0.5) * (this.limit * 0.02);
                    displaySpeed = this.limit + noise;
                }

                this.state.currentSpeed = displaySpeed;
                this.state.progress = progress;

                if (displaySpeed > this.state.downloadPeak) {
                    this.state.downloadPeak = displaySpeed;
                }

                const point: SpeedPoint = { time: Date.now(), speed: displaySpeed };

                this._downloadData.push(point);
                this.state.downloadGraphData = [...this._downloadData];
                this.state.graphData = [...this.state.graphData, point].slice(-50);

                // Simulate Packet Loss during load
                let currentLoss = 0;
                if (Math.random() > 0.95) {
                    currentLoss = Math.random() * 0.5;
                    this._packetLossData.push({ time: Date.now(), loss: currentLoss });
                } else {
                    this._packetLossData.push({ time: Date.now(), loss: 0 });
                }
                this.state.packetLossData = [...this._packetLossData];

                // Calculate average packet loss for the session so far
                const totalLoss = this._packetLossData.reduce((acc, p) => acc + p.loss, 0);
                const avgLoss = this._packetLossData.length > 0 ? totalLoss / this._packetLossData.length : 0;

                this.state.packetLoss = avgLoss;
                this.state.stabilityScore = this.calculateStabilityScore(this.state.jitter, avgLoss);

                this.onUpdate({ ...this.state });
            },
            this.abortController.signal
        );

        this.state.currentSpeed = 0;
        this.onUpdate({ ...this.state });

        await new Promise(r => setTimeout(r, 1000));

        // --- 3. ESTIMATED UPLOAD PHASE ---
        if (this.abortController.signal.aborted) return;

        let effectiveDownload = rawDownloadSpeed;
        if (this.limit && effectiveDownload > this.limit) {
            effectiveDownload = this.limit;
        }

        this.runUploadSimulation(effectiveDownload, avgPing, UPLOAD_DURATION);
    }

    private runUploadSimulation(downloadSpeed: number, avgPing: number, duration: number) {
        this.state.phase = TestPhase.UPLOAD;
        this.state.graphData = [];
        // Reset packet loss data for clean upload graph, but keep previous stats
        const previousLoss = this.state.packetLoss || 0;
        this._packetLossData = [];
        this.state.packetLossData = [];

        let ratio = 0.2;
        if (avgPing < 10) ratio = 0.95;
        else if (avgPing > 50) ratio = 0.3;

        const targetUpload = downloadSpeed * ratio;
        const start = performance.now();

        const loop = () => {
            if (this.abortController?.signal.aborted) return;

            const now = performance.now();
            const elapsed = now - start;
            const progress = (elapsed / duration) * 100;

            if (progress >= 100) {
                this.finish();
                return;
            }

            const ramp = Math.min(1, elapsed / 1000);
            const noise = (Math.random() - 0.5) * (targetUpload * 0.1);
            const speed = (targetUpload * ramp) + noise;

            this.state.currentSpeed = Math.max(0, speed);
            this.state.progress = progress;
            this.state.uploadPeak = Math.max(this.state.uploadPeak, this.state.currentSpeed);

            const point = { time: Date.now(), speed: this.state.currentSpeed };

            this._uploadData.push(point);

            // Minor packet loss simulation during upload
            let currentLoss = 0;
            if (Math.random() > 0.98) {
                currentLoss = Math.random() * 0.3;
            }
            this._packetLossData.push({ time: Date.now(), loss: currentLoss });
            this.state.packetLossData = [...this._packetLossData];

            // Update average loss (weighted with previous)
            const uploadLossTotal = this._packetLossData.reduce((acc, p) => acc + p.loss, 0);
            const uploadLossAvg = this._packetLossData.length > 0 ? uploadLossTotal / this._packetLossData.length : 0;
            // Combined average (simplified)
            this.state.packetLoss = (previousLoss + uploadLossAvg) / 2;

            this.state.stabilityScore = this.calculateStabilityScore(this.state.jitter, this.state.packetLoss);

            this.state.uploadGraphData = [...this._uploadData];
            this.state.graphData = [...this.state.graphData, point].slice(-50);

            this.onUpdate({ ...this.state });
            requestAnimationFrame(loop);
        };

        loop();
    }

    private finish() {
        this.state.phase = TestPhase.COMPLETE;
        this.state.progress = 100;
        this.state.currentSpeed = 0;
        this.onUpdate({ ...this.state });
        this.onComplete(this.state);
    }

    public stop() {
        if (this.abortController) {
            this.abortController.abort();
        }
        this.state.phase = TestPhase.IDLE;
        this.state.currentSpeed = 0;
        this.onUpdate({ ...this.state });
    }
}
