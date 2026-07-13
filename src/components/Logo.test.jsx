import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Logo from './Logo.jsx';

describe('<Logo />', () => {
  it('renders the wordmark and tagline by default', () => {
    render(<Logo />);
    expect(screen.getByText('Stride')).toBeInTheDocument();
    expect(screen.getByText('Keep moving forward')).toBeInTheDocument();
  });

  it('hides the wordmark when showText is false', () => {
    render(<Logo showText={false} />);
    expect(screen.queryByText('Stride')).not.toBeInTheDocument();
  });

  it('renders the SVG mark at the requested size', () => {
    const { container } = render(<Logo size={48} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
  });
});
