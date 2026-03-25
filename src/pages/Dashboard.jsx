import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STATUS_COLORS = {
  pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  in_progress: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const PRIORITY_COLORS = {
  low: 'bg-slate-500/20 text-slate-300',
  medium: 'bg-orange-500/20 text-orange-300',
  high: 'bg-red-500/20 text-red-300',
};

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', status: 'pending', priority: 'medium', due_date: '',
  });

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.tasks);
    } catch {
      showMsg('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const resetForm = () => {
    setForm({ title: '', description: '', status: 'pending', priority: 'medium', due_date: '' });
    setEditingTask(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.due_date) delete payload.due_date;

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
        showMsg('Task updated successfully');
      } else {
        await api.post('/tasks', payload);
        showMsg('Task created successfully');
      }
      resetForm();
      fetchTasks();
    } catch (err) {
      showMsg(err.response?.data?.error || 'Operation failed', 'error');
    }
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.slice(0, 16) : '',
    });
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      showMsg('Task deleted');
      fetchTasks();
    } catch (err) {
      showMsg(err.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">TaskFlow</h1>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="text-xs px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition"
              >
                Admin Panel
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-purple-200 text-sm">
              {user?.full_name}
              <span className="ml-2 text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                {user?.role}
              </span>
            </span>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="text-sm px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Toast */}
        {message.text && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm border ${
            message.type === 'error'
              ? 'bg-red-500/20 border-red-500/50 text-red-200'
              : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
          }`} id="toast-message">
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isAdmin ? 'All Tasks' : 'My Tasks'}
            </h2>
            <p className="text-purple-200/70 text-sm mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            id="new-task-btn"
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all"
          >
            + New Task
          </button>
        </div>

        {/* Task Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-5">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">Title</label>
                  <input
                    id="task-title"
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">Description</label>
                  <textarea
                    id="task-description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
                    placeholder="Optional description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-1">Status</label>
                    <select
                      id="task-status"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    >
                      <option value="pending" className="bg-slate-800">Pending</option>
                      <option value="in_progress" className="bg-slate-800">In Progress</option>
                      <option value="completed" className="bg-slate-800">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-1">Priority</label>
                    <select
                      id="task-priority"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    >
                      <option value="low" className="bg-slate-800">Low</option>
                      <option value="medium" className="bg-slate-800">Medium</option>
                      <option value="high" className="bg-slate-800">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-1">Due Date</label>
                  <input
                    id="task-duedate"
                    type="datetime-local"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    id="task-submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition"
                  >
                    {editingTask ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tasks Grid */}
        {loading ? (
          <div className="text-center text-purple-200 py-20">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-purple-200/70 text-lg">No tasks yet</p>
            <p className="text-purple-200/50 text-sm mt-1">Click "New Task" to get started</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-semibold text-lg leading-tight flex-1 mr-2">{task.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${STATUS_COLORS[task.status]}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                {task.description && (
                  <p className="text-purple-200/60 text-sm mb-3 line-clamp-2">{task.description}</p>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                  {task.due_date && (
                    <span className="text-xs text-purple-200/50">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {isAdmin && task.username && (
                  <p className="text-xs text-purple-200/40 mb-3">by @{task.username}</p>
                )}

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-xs px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-xs px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
