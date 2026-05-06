import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DashboardPage } from './DashboardPage'

describe('DashboardPage', () => {
  it('renders the progress section', () => {
    render(<DashboardPage />)
    expect(screen.getByText("Today's Progress")).toBeInTheDocument()
    expect(screen.getByText('0/4')).toBeInTheDocument()
  })

  it('toggles a habit when clicked', () => {
    render(<DashboardPage />)
    const habitButton = screen.getByRole('button', { name: /Morning Workout/i })
    fireEvent.click(habitButton)
    expect(screen.getByText('1/4')).toBeInTheDocument()
  })

  it('adds a new habit', () => {
    render(<DashboardPage />)
    const input = screen.getByPlaceholderText('Add a new habit...')
    const addButton = screen.getByRole('button', { name: /Add/i })

    fireEvent.change(input, { target: { value: 'Stretch' } })
    fireEvent.click(addButton)

    expect(screen.getByText('Stretch')).toBeInTheDocument()
    expect(screen.getByText('0/5')).toBeInTheDocument()
  })
})
