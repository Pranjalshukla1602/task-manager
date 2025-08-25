// src/components/tasks/TaskItem.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { deleteTask, updateTask } from '../../store/slices/taskSlice';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';
import TaskForm from './TaskForm';

const TaskItem = ({ task }) => {
  const dispatch = useDispatch();
  const [showEditForm, setShowEditForm] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(task._id));
    }
  };

  const handleStatusChange = (newStatus) => {
    dispatch(updateTask({
      id: task._id,
      updates: { status: newStatus }
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title and Status */}
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-medium text-gray-900 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[task.status]}`}>
                  {task.status.replace('-', ' ')}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Due Date and Created Date */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              {task.dueDate && (
                <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
                  <Calendar className="w-4 h-4" />
                  <span>Due: {formatDate(task.dueDate)}</span>
                  {isOverdue && <span className="text-red-600 font-medium">(Overdue)</span>}
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Created: {formatDate(task.createdAt)}</span>
              </div>
            </div>

            {/* Quick Status Change */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className="flex space-x-1">
                {['pending', 'in-progress', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      task.status === status
                        ? STATUS_COLORS[status]
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setShowEditForm(true)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <TaskForm
          task={task}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </>
  );
};

export default TaskItem;