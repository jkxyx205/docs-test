import React from 'react';

export default function Color({ children, c = '#000' }) {
    return (
        <span style={{ color: c }}>
            {children}
        </span>
    );
}