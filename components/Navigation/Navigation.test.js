import React from 'react'
import Navigation from "./Navigation.js"
import { render, fireEvent, waitFor, screen } from '@testing-library/react'

describe("Navigation", () => {

    test('renders without crashing', async () => {
        render(<Navigation/>)

        expect(screen.getByTestId("Navigation")).toBeTruthy()
    })
})