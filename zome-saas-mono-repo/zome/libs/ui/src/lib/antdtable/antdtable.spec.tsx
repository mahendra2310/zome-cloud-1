import React from 'react';
import { render } from '@testing-library/react';

import Antdtable from './antdtable';

describe('Antdtable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Antdtable />);
    expect(baseElement).toBeTruthy();
  });
});
