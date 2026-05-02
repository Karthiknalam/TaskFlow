import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Clock } from 'lucide-react';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchMyTasks();
  }, [user]);

  const fetchMyTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');
      const myTasks = res.data.filter(t => t.assignedTo && t.assignedTo._id === user._id);
      setTasks(myTasks);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      fetchMyTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const statusOptions = ['To Do', 'In Progress', 'Done'];

  return (
    <div className="container animate-fade-in">
      <div className="flex-between mb-4">
        <h2>My Tasks</h2>
        <span className="badge" style={{ background: 'var(--surface-hover)', color: 'var(--text-primary)' }}>
          {tasks.length} Assigned
        </span>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {tasks.length === 0 ? (
          <p>You have no tasks assigned to you right now.</p>
        ) : (
          tasks.map(task => (
            <div key={task._id} className="card glass flex-between" style={{ padding: '20px' }}>
              <div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0 }}>{task.title}</h3>
                  <span className={`badge priority-${task.priority?.toLowerCase() || 'medium'}`}>
                    {task.priority || 'Medium'}
                  </span>
                  <span className={`badge badge-${task.status.replace(' ', '').toLowerCase()}`}>
                    {task.status}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Project: {task.project?.name || 'N/A'}
                </p>
              </div>
              <div>
                <select 
                  className="form-control" 
                  style={{ width: 'auto' }}
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                >
                  {statusOptions.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyTasks;
