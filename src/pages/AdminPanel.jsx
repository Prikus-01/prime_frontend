import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [usersRes, tasksRes] = await Promise.all([
        api.get('/users'),
        api.get('/tasks'),
      ]);
      setUsers(usersRes.data.users);
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
              Admin
            </span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/5 text-purple-200 hover:bg-white/10'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition ${
              activeTab === 'tasks'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/5 text-purple-200 hover:bg-white/10'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center text-purple-200 py-20">Loading...</div>
        ) : activeTab === 'users' ? (
          /* Users Table */
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-medium text-purple-200/70 uppercase tracking-wider px-6 py-4">ID</th>
                    <th className="text-left text-xs font-medium text-purple-200/70 uppercase tracking-wider px-6 py-4">Username</th>
                    <th className="text-left text-xs font-medium text-purple-200/70 uppercase tracking-wider px-6 py-4">Email</th>
                    <th className="text-left text-xs font-medium text-purple-200/70 uppercase tracking-wider px-6 py-4">Name</th>
                    <th className="text-left text-xs font-medium text-purple-200/70 uppercase tracking-wider px-6 py-4">Role</th>
                    <th className="text-left text-xs font-medium text-purple-200/70 uppercase tracking-wider px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="px-6 py-4 text-sm text-white">{u.id}</td>
                      <td className="px-6 py-4 text-sm text-white font-medium">@{u.username}</td>
                      <td className="px-6 py-4 text-sm text-purple-200/70">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-white">{u.full_name}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-purple-200/50">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Tasks Table */
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-medium text-purple-200/70 uppercase tracking-wider px-6 py-4">ID</th>
                    <th className="text-left text-xs font-medium text-purple-200/70 uppercase tracking-wider px-6 py-4">Title</th>
                    <th className="text-left text-xs font-medium text-purple-200/70 uppercase tracking-wider px-6 py-4">Owner</th>
                    <th className="text-left text-xs font-medium text-purple-200/70 uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-left text-xs font-medium text-purple-200/70 uppercase tracking-wider px-6 py-4">Priority</th>
                    <th className="text-left text-xs font-medium text-purple-200/70 uppercase tracking-wider px-6 py-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="px-6 py-4 text-sm text-white">{t.id}</td>
                      <td className="px-6 py-4 text-sm text-white font-medium">{t.title}</td>
                      <td className="px-6 py-4 text-sm text-purple-200/70">@{t.username}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full border ${
                          t.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          t.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          t.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                          t.priority === 'medium' ? 'bg-orange-500/20 text-orange-300' :
                          'bg-slate-500/20 text-slate-300'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-purple-200/50">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
