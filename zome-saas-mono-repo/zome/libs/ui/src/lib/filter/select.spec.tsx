import React from 'react';
import { render } from '@testing-library/react';

import AntdSelect from './antdSelect';

describe('Antdtable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AntdSelect />);
    expect(baseElement).toBeTruthy();
  });
});
