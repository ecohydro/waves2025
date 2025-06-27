import { render, screen, fireEvent } from '@testing-library/react';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../Modal';

describe('Modal', () => {
  it('should render when open', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <div>Modal content</div>
      </Modal>,
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <div>Modal content</div>
      </Modal>,
    );
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('should call onClose when backdrop is clicked', () => {
    const handleClose = jest.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <div>Modal content</div>
      </Modal>,
    );

    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when escape key is pressed', () => {
    const handleClose = jest.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <div>Modal content</div>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when modal content is clicked', () => {
    const handleClose = jest.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <div>Modal content</div>
      </Modal>,
    );

    const content = screen.getByText('Modal content');
    fireEvent.click(content);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should render with custom className', () => {
    render(
      <Modal open={true} onClose={() => {}} className="custom-modal">
        <div>Modal content</div>
      </Modal>,
    );
    const modal = screen.getByTestId('modal-content');
    expect(modal).toHaveClass('custom-modal');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(
      <Modal open={true} onClose={() => {}} size="sm">
        <div>Small modal</div>
      </Modal>,
    );
    expect(screen.getByTestId('modal-content')).toHaveClass('max-w-sm');

    rerender(
      <Modal open={true} onClose={() => {}} size="md">
        <div>Medium modal</div>
      </Modal>,
    );
    expect(screen.getByTestId('modal-content')).toHaveClass('max-w-md');

    rerender(
      <Modal open={true} onClose={() => {}} size="lg">
        <div>Large modal</div>
      </Modal>,
    );
    expect(screen.getByTestId('modal-content')).toHaveClass('max-w-lg');
  });
});

describe('ModalHeader', () => {
  it('should render with title', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <ModalHeader title="Modal Title" />
      </Modal>,
    );
    expect(screen.getByText('Modal Title')).toBeInTheDocument();
  });

  it('should render with close button', () => {
    const handleClose = jest.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <ModalHeader title="Title" showCloseButton />
      </Modal>,
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should render with custom className', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <ModalHeader title="Title" className="custom-header" />
      </Modal>,
    );
    const header = screen.getByText('Title').closest('div[class*="border-b"]');
    expect(header).toHaveClass('custom-header');
  });
});

describe('ModalContent', () => {
  it('should render children', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <ModalContent>Content here</ModalContent>
      </Modal>,
    );
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <ModalContent className="custom-content">Content</ModalContent>
      </Modal>,
    );
    expect(screen.getByText('Content')).toHaveClass('custom-content');
  });
});

describe('ModalFooter', () => {
  it('should render children', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <ModalFooter>Footer content</ModalFooter>
      </Modal>,
    );
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <ModalFooter className="custom-footer">Footer</ModalFooter>
      </Modal>,
    );
    expect(screen.getByText('Footer')).toHaveClass('custom-footer');
  });
});

describe('Modal Composition', () => {
  it('should render complete modal with all parts', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <ModalHeader title="Test Title" />
        <ModalContent>Test content</ModalContent>
        <ModalFooter>Test footer</ModalFooter>
      </Modal>,
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Test footer')).toBeInTheDocument();
  });
});
