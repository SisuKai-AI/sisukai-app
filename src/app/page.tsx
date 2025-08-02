import Link from 'next/link'

export default function BasicNextJSPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          🚀 SisuKai - Step 1
        </h1>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '2rem',
          opacity: 0.9
        }}>
          Basic Next.js Features Test
        </p>
        <div style={{
          fontSize: '1rem',
          opacity: 0.8,
          marginBottom: '2rem'
        }}>
          <p>✅ Next.js 15 App Router</p>
          <p>✅ Next.js Link Component</p>
          <p>✅ Basic Navigation</p>
        </div>
        
        {/* Test Next.js Link component */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link 
            href="/dashboard" 
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            Dashboard
          </Link>
          <Link 
            href="/upgrade" 
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            Upgrade
          </Link>
        </div>
        
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          <strong>Step 1 - Basic Next.js:</strong> {new Date().toISOString()}
        </div>
      </div>
    </div>
  )
}

