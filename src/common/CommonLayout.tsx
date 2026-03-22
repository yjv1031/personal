import type { ReactNode } from 'react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './CommonLayout.css'

type CommonLayoutProps = {
  children: ReactNode
}

function CommonLayout({ children }: CommonLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <div className="app-shell">
      <div className="common-layout">
        <header className="common-header">
          <div className="header-left">
            <p className="common-eyebrow">MY APP</p>
            <h1 className="common-title">personal</h1>
          </div>
          <div className="header-right">
            <span className="header-status">Online</span>
            <button
              className="common-action"
              type="button"
              aria-label="Open menu"
              onClick={() => setIsMenuOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </header>

        <main className="common-main">{children}</main>

        <div
          className={isMenuOpen ? 'menu-overlay is-open' : 'menu-overlay'}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
          onClick={closeMenu}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              closeMenu()
            }
          }}
        />

        <aside className={isMenuOpen ? 'slide-menu is-open' : 'slide-menu'} aria-hidden={!isMenuOpen}>
          <div className="menu-header">
            <div>
              <p className="menu-kicker">Workspace</p>
              <h2>Navigation</h2>
            </div>
            <button type="button" className="menu-close" onClick={closeMenu} aria-label="Close menu">
              +
            </button>
          </div>
          <section className="menu-profile">
            <div className="menu-avatar" aria-hidden>
              YJ
            </div>
            <div>
              <p className="menu-name">YJ Workspace</p>
              <p className="menu-mail">personal@app.local</p>
            </div>
          </section>
          <nav className="menu-nav" aria-label="Menu navigation">
            <NavLink
              to="/home"
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            >
              <span className="menu-dot" aria-hidden />
              Home
            </NavLink>
            <NavLink
              to="/coin"
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            >
              <span className="menu-dot" aria-hidden />
              Coin
            </NavLink>
          </nav>
        </aside>
      </div>
    </div>
  )
}

export default CommonLayout
