// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus } from 'lucide-react';
import { fetchTasks } from '../store/slices/taskSlice';
import Layout from '../components/common/Layout';
import TaskFilter from '../components/tasks/TaskFilter';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.tasks);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch tasks when filters change
  useEffect(() => {
    dispatch(fetchTasks(filters));
  }, [dispatch, filters]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600 mt-2">
              Manage and organize your tasks efficiently
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Task
          </button>
        </div>

        {/* Filters */}
        <TaskFilter />

        {/* Task List */}
        <TaskList />

        {/* Create Task Modal */}
        {showCreateForm && (
          <TaskForm onClose={() => setShowCreateForm(false)} />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;