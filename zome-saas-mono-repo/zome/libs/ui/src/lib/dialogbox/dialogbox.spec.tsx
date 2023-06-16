import React from 'react';
import { render } from '@testing-library/react';

import Dialogbox from './dialogbox';

describe('Dialogbox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Dialogbox />);
    expect(baseElement).toBeTruthy();
  });
});
