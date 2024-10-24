import { describe, test } from 'vitest'
import { render } from '@testing-library/react'

import App from './App'

describe("App tests", () => {
    test("App renders without crashing", () => {   
        render(<App />)  
    })
})
