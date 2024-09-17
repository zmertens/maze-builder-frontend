import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import App from './App'

describe("App tests", () => {
    test("App renders without crashing", () => {   
        render(<App />)  
        expect(screen.getByText(/Maze Builder/i)).toBeDefined()
    })
})
