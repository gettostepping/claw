"use client"

import Link from "next/link"
import { useState } from "react"

export function FooterLink({ accentColor }: { accentColor: string }) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <Link
            href="/"
            className="hover:opacity-100 transition-all duration-300 hover:scale-110 inline-block"
            style={{
                color: isHovered ? accentColor : '',
                transition: 'color 300ms, opacity 300ms, transform 300ms'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            clawsome.beauty
        </Link>
    )
}
