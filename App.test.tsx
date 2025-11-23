import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi } from 'vitest';

// Mock the services
vi.mock('./services/realNetwork', () => ({
    fetchClientInfo: vi.fn().mockResolvedValue({
        ip: '127.0.0.1',
        isp: 'Test ISP',
        city: 'Test City',
        country: 'Test Country',
        region: 'Test Region',
        timezone: 'UTC',
    }),
    getBrowserNetworkEstimates: vi.fn().mockReturnValue({
        type: 'wifi',
        rtt: 50,
        downlink: 10,
    }),
}));

describe('App', () => {
    it('renders the Velocity header', () => {
        render(<App />);
        expect(screen.getByText(/Velocity/i)).toBeInTheDocument();
    });

    it('renders the START button', async () => {
        render(<App />);

        // console.log('HTML:', document.body.innerHTML);

        // Check if mock was called
        const { fetchClientInfo } = await import('./services/realNetwork');
        expect(fetchClientInfo).toHaveBeenCalled();

        const startButton = screen.getByRole('button', { name: /start/i });
        expect(startButton).toBeInTheDocument();
    });
});
