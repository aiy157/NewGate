import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

// อ่าน Admin URL จาก Environment Variable (ปลอดภัยกว่าการ Hard-code)
const SECRET_ADMIN_URL = import.meta.env.VITE_ADMIN_SECRET_PATH || "/14082507";

function App() {
  return (
    <Router>
      <Routes>
        {/* หน้าหลักสำหรับนักศึกษา */}
        <Route path="/" element={<UserDashboard />} />

        {/* หน้า Admin (URL ลับ) */}
        <Route path={SECRET_ADMIN_URL} element={<AdminDashboard />} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-gray-950 text-2xl font-bold text-red-400">
              404 — ไม่พบหน้าที่ค้นหา
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;