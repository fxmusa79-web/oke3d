import { brandIcon } from '../../data/products'
import './Navbar.css'

const links = [
  { href: '#bbq', label: 'Collectie' },
  { href: '#shop', label: 'Shop' },
  { href: '#about', label: 'Over' },
] as const

export function Navbar() {
  return (
    <header className="oke-nav">
      <a className="oke-nav__brand" href="#top" aria-label="OKE3D home">
        <img
          src={brandIcon}
          alt=""
          className="oke-nav__icon"
          width={40}
          height={40}
        />
        <span className="oke-nav__wordmark">
          OKE<span className="oke-nav__wordmark-3d">3D</span>
          <span className="oke-nav__tld">.nl</span>
        </span>
      </a>

      <nav className="oke-nav__links" aria-label="Hoofdnavigatie">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="oke-nav__link">
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
