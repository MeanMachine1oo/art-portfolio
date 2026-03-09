"use client";
import React from "react";
import Link from "next/link";

export function Nav() {
  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="site-nav-logo">Wildcard</Link>
        <nav className="site-nav-links">
          <Link href="/gallery" className="nav-link">Gallery</Link>
          <Link href="/#work" className="nav-link">Work</Link>
          <Link href="/#contact" className="nav-link">Contact</Link>
          <a href="mailto:nitin@wildcarddesign.in" className="nav-cta">Book a Call</a>
        </nav>
      </div>
    </header>
  );
}
