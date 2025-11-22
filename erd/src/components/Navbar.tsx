import { FC } from 'react';
import './Navbar.css';

interface NavbarProps {
    appName?: string
    onNavClick?: (section: string) => void
}

const Navbar: FC<NavbarProps> = ({
    appName = 'ERD',
    onNavClick
}) => {
    const handleClick = (section: string) => (e: React.MouseEvent) => {
        e.preventDefault()
        onNavClick?.(section)
    }

    return (
        <nav className="navbar">
            <div className="navbar-title">
                <h1>{appName}</h1>
            </div>
            <div className="navbar-menu">
                <a href="#home" onClick={handleClick('home')}>Home</a>
                <a href="#canvas" onClick={handleClick('canvas')}>Canvas</a>
                <a href="#editor" onClick={handleClick('editor')}>Editor</a>
            </div>
        </nav>
    )
}

export default Navbar