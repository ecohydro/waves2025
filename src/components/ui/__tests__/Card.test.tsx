// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent, CardFooter } from '../Card';

describe('Card', () => {
  it('should render with default props', () => {
    render(<Card>Card content</Card>);
    const card = screen.getByText('Card content').closest('div');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-md');
  });

  it('should render with custom className', () => {
    render(<Card className="custom-card">Custom Card</Card>);
    const card = screen.getByText('Custom Card').closest('div');
    expect(card).toHaveClass('custom-card');
  });

  it('should render with different variants', () => {
    const { rerender } = render(<Card variant="default">Default</Card>);
    const card = screen.getByText('Default').closest('div');
    expect(card).toHaveClass('bg-white');

    rerender(<Card variant="outlined">Outlined</Card>);
    const outlinedCard = screen.getByText('Outlined').closest('div');
    expect(outlinedCard).toHaveClass('border', 'border-gray-200');
  });
});

describe('CardHeader', () => {
  it('should render with title and subtitle', () => {
    render(<CardHeader title="Card Title" subtitle="Card Subtitle" />);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Subtitle')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(<CardHeader className="custom-header" title="Title" />);
    expect(screen.getByText('Title').parentElement).toHaveClass('custom-header');
  });
});

describe('CardContent', () => {
  it('should render children', () => {
    render(<CardContent>Content here</CardContent>);
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(<CardContent className="custom-content">Content</CardContent>);
    expect(screen.getByText('Content')).toHaveClass('custom-content');
  });
});

describe('CardFooter', () => {
  it('should render children', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(<CardFooter className="custom-footer">Footer</CardFooter>);
    expect(screen.getByText('Footer')).toHaveClass('custom-footer');
  });
});

describe('Card Composition', () => {
  it('should render complete card with all parts', () => {
    render(
      <Card>
        <CardHeader title="Test Title" subtitle="Test Subtitle" />
        <CardContent>Test content</CardContent>
        <CardFooter>Test footer</CardFooter>
      </Card>,
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Test footer')).toBeInTheDocument();
  });
});
