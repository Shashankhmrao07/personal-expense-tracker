import { useEffect, useState } from 'react';

// --- 1. TYPES (The Blueprints) ---
interface Expense {
  id: string;
  amount: number; // Stored in cents
  category: string;
  description: string;
  date: string;
  created_at: string;
}

interface CreateExpensePayload {
  amount: number;
  category: string;
  description: string;
  date: string;
}

// --- 2. API FUNCTIONS (The Pipes) ---
const API_URL = 'http://localhost:8080';

async function fetchExpensesApi(category?: string, sort?: boolean): Promise<Expense[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (sort) params.append('sort', 'date_desc');
  const res = await fetch(`${API_URL}/expenses?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
}

async function createExpenseApi(payload: CreateExpensePayload): Promise<Expense> {
  const res = await fetch(`${API_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save expense');
  return res.json();
}

// --- 3. SUB-COMPONENTS (The Building Blocks) ---

function CategorySummary({ expenses }: { expenses: Expense[] }) {
  // Safety check: ensure expenses is actually an array before reducing
  if (!Array.isArray(expenses)) return null;

  const summary = expenses.reduce((acc, exp) => {
    // Safety check: handle missing categories or malformed objects
    const cat = exp.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + (exp.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  if (Object.keys(summary).length === 0) return null;

  return (
    <div style={{ background: '#f0f2f5', padding: '15px', borderRadius: '8px', margin: '20px 0', border: '1px solid #d1d9e0' }}>
      <h3 style={{ marginTop: 0, color: '#1a1a1a' }}>Category Totals</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
        {Object.entries(summary).map(([cat, amt]) => (
          <div key={cat} style={{ background: 'white', padding: '10px', borderRadius: '4px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>{cat}</div>
            <strong style={{ fontSize: '1.1rem' }}>${((amt || 0) / 100).toFixed(2)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpenseForm({ onAdd }: { onAdd: (p: CreateExpensePayload) => Promise<void> }) {
  const [amt, setAmt] = useState('');
  const [cat, setCat] = useState('Food');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const sub = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({ amount: Math.round(parseFloat(amt) * 100), category: cat, description: desc, date });
      setAmt(''); setDesc('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={sub} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ marginTop: 0 }}>Add New Expense</h2>
      <input type="number" step="0.01" placeholder="Amount (e.g. 10.50)" value={amt} onChange={e => setAmt(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
      <select value={cat} onChange={e => setCat(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
        <option value="Food">Food</option>
        <option value="Transport">Transport</option>
        <option value="Utilities">Utilities</option>
        <option value="Entertainment">Entertainment</option>
      </select>
      <input type="text" placeholder="What was this for?" value={desc} onChange={e => setDesc(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
      <button type="submit" disabled={loading} style={{ background: '#007bff', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
        {loading ? 'Saving...' : 'Add Expense'}
      </button>
    </form>
  );
}

// --- 4. MAIN APPLICATION ---
export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
  try {
    const data = await fetchExpensesApi(filter, sort);
    
    // DEBUG: Look at your browser console (F12) to see what the backend sent!
    console.log("Backend Data received:", data);

    // If data is null or not an array, default to an empty list
    setExpenses(Array.isArray(data) ? data : []);
    setError(null);
  } catch (err) {
    console.error("Fetch error:", err);
    setExpenses([]); // Clear list on error to prevent map/reduce crashes
    setError("Cannot connect to backend. Is the Go server running?");
  }
};

  useEffect(() => { refresh(); }, [filter, sort]);

  return (
    <div style={{ backgroundColor: '#fdfdfd', minHeight: '100vh', padding: '40px 20px', color: '#333', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2.5rem', color: '#111' }}>Expense Tracker</h1>

        {error && <div style={{ background: '#ffeef0', color: '#d73a49', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #d73a49' }}>{error}</div>}
        
        <ExpenseForm onAdd={async (p) => { await createExpenseApi(p); refresh(); }} />

        <CategorySummary expenses={expenses} />

        <div style={{ margin: '30px 0 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
          <div>
            <strong>Filter by Category: </strong>
            <select onChange={e => setFilter(e.target.value)} style={{ padding: '5px', borderRadius: '4px' }}>
              <option value="">All</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>
          <label style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            <input type="checkbox" onChange={e => setSort(e.target.checked)} /> Newest First
          </label>
        </div>

        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f6f8fa', borderBottom: '2px solid #eee' }}>
                <th align="left" style={{ padding: '15px' }}>Date</th>
                <th align="left" style={{ padding: '15px' }}>Details</th>
                <th align="right" style={{ padding: '15px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No expenses logged yet.</td></tr>
              ) : (
                expenses.map(ex => (
                  <tr key={ex.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '15px' }}>{ex.date}</td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: 'bold' }}>{ex.description}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>{ex.category}</div>
                    </td>
                    <td align="right" style={{ padding: '15px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      ${(ex.amount / 100).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}