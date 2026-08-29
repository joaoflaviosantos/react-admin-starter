import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Descriptions } from './index';

describe('Descriptions', () => {
  it('renders bordered items with labels and values', () => {
    render(
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Name">Admin</Descriptions.Item>
        <Descriptions.Item label="Email">admin@example.com</Descriptions.Item>
        <Descriptions.Item label="Notes" span={2}>
          Full width note
        </Descriptions.Item>
      </Descriptions>,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Full width note')).toBeInTheDocument();
  });
});
