import * as React from 'react'

import { render, screen } from '@testing-library/react'

import { AppBar } from '../src/components/AppBar'

describe('AppBar', () => {
  test('should render', () => {
    render(<AppBar />)
    expect(screen.getByText('gpx-elevation-profile')).toBeTruthy()
  })
})
