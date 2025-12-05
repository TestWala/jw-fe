import React from 'react';
import './Navbar.css';


export default function Navbar() {
    return (
        <header className="nav">
            <div className="nav-left">Jewellery Inventory</div>
            <div className="nav-right">Owner · <strong>Name..</strong></div>
        </header>
    );
}