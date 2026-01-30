import { useState } from 'hono/jsx';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ textAlign: 'center', padding: '10px' }}>
      <p>カウント: {count}</p>
      <button
        onClick={() => setCount((c) => c + 1)}
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        +1
      </button>
    </div>
  );
}
