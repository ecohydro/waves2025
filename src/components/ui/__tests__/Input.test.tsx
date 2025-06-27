import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('should render with default props', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('w-full', 'px-3', 'py-2', 'border');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Input size="sm" placeholder="Small" />);
    expect(screen.getByPlaceholderText('Small')).toHaveClass('px-2', 'py-1', 'text-sm');

    rerender(<Input size="md" placeholder="Medium" />);
    expect(screen.getByPlaceholderText('Medium')).toHaveClass('px-3', 'py-2', 'text-base');

    rerender(<Input size="lg" placeholder="Large" />);
    expect(screen.getByPlaceholderText('Large')).toHaveClass('px-4', 'py-3', 'text-lg');
  });

  it('should render with different variants', () => {
    const { rerender } = render(<Input variant="default" placeholder="Default" />);
    expect(screen.getByPlaceholderText('Default')).toHaveClass('border-gray-300');

    rerender(<Input variant="error" placeholder="Error" />);
    expect(screen.getByPlaceholderText('Error')).toHaveClass('border-red-500');

    rerender(<Input variant="success" placeholder="Success" />);
    expect(screen.getByPlaceholderText('Success')).toHaveClass('border-green-500');
  });

  it('should handle value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} placeholder="Test" />);

    const input = screen.getByPlaceholderText('Test');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('new value');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled" />);
    const input = screen.getByPlaceholderText('Disabled');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should render with custom className', () => {
    render(<Input className="custom-input" placeholder="Custom" />);
    expect(screen.getByPlaceholderText('Custom')).toHaveClass('custom-input');
  });

  it('should render with label', () => {
    render(<Input label="Test Label" placeholder="Test" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should render with helper text', () => {
    render(<Input helperText="Helper text" placeholder="Test" />);
    expect(screen.getByText('Helper text')).toBeInTheDocument();
  });

  it('should render with error message', () => {
    render(<Input error="Error message" placeholder="Test" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test')).toHaveClass('border-red-500');
  });

  it('should render with icon', () => {
    render(<Input icon={<span data-testid="icon">🔍</span>} placeholder="Search" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should render with different input types', () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" placeholder="Number" />);
    expect(screen.getByPlaceholderText('Number')).toHaveAttribute('type', 'number');
  });
});
