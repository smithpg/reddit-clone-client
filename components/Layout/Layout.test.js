import React from 'react'
import Layout from "./Layout.js"
import { render, fireEvent, waitFor, screen } from '@testing-library/react'

describe("Layout", () => {

    test('renders without crashing', async () => {
        render(<Layout/>)

        expect(screen.getByTestId("Layout")).toBeTruthy()
    })
})