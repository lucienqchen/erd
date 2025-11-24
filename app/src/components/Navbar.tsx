import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import './Navbar.css';

interface NavbarProps {
    appName?: string
}

const Navbar: FC<NavbarProps> = ({
    appName = 'ERD',
}) => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="navbar-title">
                <h1>{appName}</h1>
            </div>
            <div className="navbar-menu">
                <Link
                    to={ROUTES.HOME}
                    className={location.pathname === ROUTES.HOME ? 'active' : ''}
                >
                    Home
                </Link>
                <Link
                    to={ROUTES.CANVAS} 
                    className={location.pathname === ROUTES.CANVAS ? 'active' : ''}
                >
                    Canvas
                </Link>
                <Link
                    to={ROUTES.EDITOR}
                    className={location.pathname === ROUTES.EDITOR ? 'active' : ''}
                >
                    Editor
                </Link>
            </div>
        </nav>
    )
}

export default Navbar