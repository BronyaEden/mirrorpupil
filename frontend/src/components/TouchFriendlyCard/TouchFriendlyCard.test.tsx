import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TouchFriendlyCard from './index';

describe('TouchFriendlyCard', () => {
  test('renders card with children', () => {
    render(<TouchFriendlyCard><div>Card Content</div></TouchFriendlyCard>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<TouchFriendlyCard onClick={handleClick}><div>Card Content</div></TouchFriendlyCard>);
    
    fireEvent.click(screen.getByText('Card Content'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick handler when disabled', () => {
    const handleClick = jest.fn();
    render(<TouchFriendlyCard onClick={handleClick} disabled><div>Card Content</div></TouchFriendlyCard>);
    
    fireEvent.click(screen.getByText('Card Content'));
    expect(handleClick).toHaveBeenCalledTimes(0);
  });

  test('applies correct elevation styles', () => {
    const { container } = render(<TouchFriendlyCard elevation="high"><div>Card Content</div></TouchFriendlyCard>);
    expect(container.firstChild).toHaveStyle('box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 15px 15px rgba(0, 0, 0, 0.2)');
  });
});