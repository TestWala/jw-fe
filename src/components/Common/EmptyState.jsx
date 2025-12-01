import React from 'react';
export default function EmptyState({ title, subtitle }) {
    return <div style={{ padding: 20, textAlign: 'center' }}><h3>{title}</h3><p>{subtitle}</p></div>
}