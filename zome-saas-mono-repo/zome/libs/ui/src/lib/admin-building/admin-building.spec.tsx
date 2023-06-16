import React from 'react';
import { render } from '@testing-library/react';

import AdminBuilding from './admin-building';

describe('AdminBuilding', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AdminBuilding />);
    expect(baseElement).toBeTruthy();
  });
});
