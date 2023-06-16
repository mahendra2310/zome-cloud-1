import React from 'react';
import { render } from '@testing-library/react';

import AdminUi from './admin-ui';

describe('AdminUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AdminUi />);
    expect(baseElement).toBeTruthy();
  });
});
