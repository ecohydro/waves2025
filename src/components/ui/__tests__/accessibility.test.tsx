// @vitest-environment jsdom
import React from 'react';
import { render } from '@testing-library/react';
import * as matchers from 'vitest-axe/matchers';
import { axe } from 'vitest-axe';
import { expect } from 'vitest';
import { Button } from '../Button';
import { Card, CardHeader, CardContent } from '../Card';
import { Input } from '../Input';
import { Modal, ModalHeader, ModalContent } from '../Modal';

expect.extend(matchers);

describe('Accessibility: UI Components', () => {
  it('Button should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Button as link should have no accessibility violations', async () => {
    const { container } = render(<Button href="/test">Go to page</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card should have no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader title="Test Card" subtitle="A subtitle" />
        <CardContent>
          <p>Card content here</p>
        </CardContent>
      </Card>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input with label should have no accessibility violations', async () => {
    const { container } = render(
      <Input label="Email address" type="email" placeholder="you@example.com" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input with error should have no accessibility violations', async () => {
    const { container } = render(
      <Input label="Email" type="email" error="Please enter a valid email" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Modal with header should have no accessibility violations', async () => {
    const { container } = render(
      <Modal open={true} onClose={() => {}}>
        <ModalHeader title="Test Modal" showCloseButton />
        <ModalContent>
          <p>Modal content here</p>
        </ModalContent>
      </Modal>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
