import { render, screen } from '@testing-library/react';
import Speedometer from './Speedometer';
import { describe, it, expect } from 'vitest';
import { TestPhase } from '../types';

describe('Speedometer', () => {
    it('renders correctly', () => {
        render(<Speedometer speed={0} phase={TestPhase.IDLE} max={1000} limit={null} />);
        expect(screen.getByText(/Mbps/i)).toBeInTheDocument();
    });
});
