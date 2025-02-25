import React, { JSX } from 'react';

interface HighlightProps {
    children: React.ReactNode;
    color: string;
}

export default function Highlight({ children, color }: HighlightProps): JSX.Element {
    return (
        <span
            style={{
                backgroundColor: color,
                borderRadius: '2px',
                color: '#fff',
                padding: '0.2rem',
            }}>
            {children}
        </span>
    );
}