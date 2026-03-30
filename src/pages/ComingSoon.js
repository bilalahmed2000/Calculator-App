import React from 'react';
import { Link } from 'react-router-dom';

export default function ComingSoon() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '40px 20px',
      color: '#1e1b4b',
      fontFamily: 'inherit',
    }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: '#4f46e5' }}>
        Coming Soon
      </h1>
      <p style={{ margin: 0, color: '#6b7a9e', fontSize: '15px' }}>
        This calculator is under construction.
      </p>
      <Link
        to="/"
        style={{
          marginTop: '8px',
          padding: '10px 22px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '14px',
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}
