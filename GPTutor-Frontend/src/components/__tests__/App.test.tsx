import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple component test example
const TestComponent: React.FC = () => {
  return <div data-testid="test-component">GPTutor Test</div>;
};

describe('Component Tests', () => {
  test('renders test component', () => {
    render(<TestComponent />);
    const element = screen.getByTestId('test-component');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('GPTutor Test');
  });

  test('component snapshot', () => {
    const { container } = render(<TestComponent />);
    expect(container.firstChild).toMatchSnapshot();
  });
});