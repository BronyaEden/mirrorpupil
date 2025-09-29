import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TouchFriendlyButton from './index';

describe('TouchFriendlyButton', () => {
  test('renders button with correct text', () => {
    render(<TouchFriendlyButton>Click me</TouchFriendlyButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<TouchFriendlyButton onClick={handleClick}>Click me</TouchFriendlyButton>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick handler when disabled', () => {
    const handleClick = jest.fn();
    render(<TouchFriendlyButton onClick={handleClick} disabled>Click me</TouchFriendlyButton>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(0);
  });

  test('applies correct variant styles', () => {
    const { container } = render(<TouchFriendlyButton variant="secondary">Click me</TouchFriendlyButton>);
    expect(container.firstChild).toHaveStyle('background: rgba(255, 255, 255, 0.1)');
  });

  test('applies correct size styles', () => {
    const { container } = render(<TouchFriendlyButton size="large">Click me</TouchFriendlyButton>);
    expect(container.firstChild).toHaveStyle('padding: 16px 24px');
  });
});