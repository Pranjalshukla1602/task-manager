// src/utils/constants.js
export const TASK_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
  };
  
  export const TASK_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  };
  
  export const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: TASK_STATUS.PENDING, label: 'Pending' },
    { value: TASK_STATUS.IN_PROGRESS, label: 'In Progress' },
    { value: TASK_STATUS.COMPLETED, label: 'Completed' },
  ];
  
  export const PRIORITY_OPTIONS = [
    { value: '', label: 'All Priority' },
    { value: TASK_PRIORITY.LOW, label: 'Low' },
    { value: TASK_PRIORITY.MEDIUM, label: 'Medium' },
    { value: TASK_PRIORITY.HIGH, label: 'High' },
  ];
  
  export const STATUS_COLORS = {
    [TASK_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
    [TASK_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [TASK_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  };
  
  export const PRIORITY_COLORS = {
    [TASK_PRIORITY.LOW]: 'bg-gray-100 text-gray-800',
    [TASK_PRIORITY.MEDIUM]: 'bg-orange-100 text-orange-800',
    [TASK_PRIORITY.HIGH]: 'bg-red-100 text-red-800',
  };