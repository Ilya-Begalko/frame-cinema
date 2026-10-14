import { StrictMode } from 'react'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { Providers } from '../../app/providers'
import { AppShell } from '../../components/layout/AppShell'
import { DiscoverPage } from './DiscoverPage'

describe('DiscoverPage', () => {
  it('открывается, даже если каталог отвечает ошибкой', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ status_message: 'no key' }), { status: 503 })),
    )
    const router = createMemoryRouter(
      [{ path: '/', element: <AppShell />, children: [{ index: true, element: <DiscoverPage /> }] }],
      { initialEntries: ['/'] },
    )
    render(
      <StrictMode>
        <Providers>
          <RouterProvider router={router} />
        </Providers>
      </StrictMode>,
    )

    expect(await screen.findByRole('heading', { name: /Find films by the way/ })).toBeInTheDocument()
    vi.unstubAllGlobals()
  })
})
