import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './CommonLayout.css'

type CommonLayoutProps = {
  children: ReactNode
}

function CommonLayout({ children }: CommonLayoutProps) {
  return (
    <div className="common-layout">
      <header className="common-header">
        <h1 className="common-title">personal</h1>
        <nav className="common-nav">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>

      <main className="common-main">{children}</main>

      <footer className="common-footer">© 2026 personal</footer>
    </div>
  )
}

export default CommonLayout
