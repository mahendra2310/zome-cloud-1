import React from 'react';
import { render } from '@testing-library/react';

import AdminReport from './admin-report';

describe('AdminReport', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AdminReport />);
    expect(baseElement).toBeTruthy();
  });
});
