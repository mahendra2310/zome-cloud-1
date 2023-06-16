import React from 'react';
import { render } from '@testing-library/react';

import AdminVacant from './admin-vacant';

describe('AdminReport', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AdminVacant />);
    expect(baseElement).toBeTruthy();
  });
});
