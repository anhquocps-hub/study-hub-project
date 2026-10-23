import { useEffect, useState } from 'react';
import { getHealth } from '../services/api';

export default function App() {
  const [message, setMessage] = useState('Đang kiểm tra kết nối...');

  useEffect(() => {
    getHealth()
      .then(() => setMessage('FE đã kết nối với BE và PostgreSQL.'))
      .catch(() => setMessage('Chưa kết nối được BE hoặc PostgreSQL.'));
  }, []);

  return <main><h1>Study Hub</h1><p>{message}</p></main>;
}
