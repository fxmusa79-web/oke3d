import { brandLogo } from '../../data/products'
import './Navbar.css'

const links = [
  { href: '#shop', label: 'Shop' },
  { href: '#collections', label: 'Collections' },
  { href: '#about', label: 'About' },
] as const

export function Navbar() {
  return (
    <header className="oke-nav">
      <a className="oke-nav__brand" href="#top" aria-label="OKE3D home">
        <img
          src={brandLogo}
          alt="OKE3D"
          className="oke-nav__logo"
          width={160}
          height={48}
        />
      </a>

      <nav className="oke-nav__links" aria-label="Primary">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="oke-nav__link">
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
