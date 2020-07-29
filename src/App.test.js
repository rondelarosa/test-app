import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  const { getByText } = render(<App test={'learn react'} />);

  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
