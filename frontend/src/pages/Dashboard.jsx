import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Clock, AlertCircle, Folder } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalTasks: 0, done: 0, inProgress: 0, projects: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          axios.get('/api/tasks'),
          axios.get('/api/projects')
        ]);

        let userTasks = tasksRes.data;
        // If not admin, maybe filter to show only tasks they are assigned to
        if (user.role !== 'Admin') {
          userTasks = userTasks.filter(t => t.assignedTo && t.assignedTo._id === user._id);
        }

        const done = userTasks.filter(t => t.status === 'Done').length;
        const inProgress = userTasks.filter(t => t.status === 'In Progress').length;
        
        setStats({
          totalTasks: userTasks.length,
          done,
          inProgress,
          projects: projectsRes.data.length
        });
        
        setRecentTasks(userTasks.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };
    
    fetchData();
  }, [user]);

  return (
    <div className="container animate-fade-in">
      <div className="flex-between mb-4">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, <strong style={{color: 'var(--primary-color)'}}>{user.name}</strong></p>
      </div>
      
      <div className="dashboard-stats">
        <div className="card glass stat-card">
          <Folder size={32} color="var(--primary-color)" className="mb-4" />
          <div className="stat-value">{stats.projects}</div>
          <div>Total Projects</div>
        </div>
        <div className="card glass stat-card">
          <AlertCircle size={32} color="var(--warning)" className="mb-4" />
          <div className="stat-value">{stats.totalTasks}</div>
          <div>My Tasks</div>
        </div>
        <div className="card glass stat-card">
          <Clock size={32} color="var(--secondary-color)" className="mb-4" />
          <div className="stat-value">{stats.inProgress}</div>
          <div>In Progress</div>
        </div>
        <div className="card glass stat-card">
          <CheckCircle size={32} color="var(--success)" className="mb-4" />
          <div className="stat-value">{stats.done}</div>
          <div>Completed</div>
        </div>
      </div>
      
      <h2>Recent Tasks</h2>
      <div className="card glass mt-4">
        {recentTasks.length === 0 ? (
          <p>No recent tasks found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {recentTasks.map(task => (
              <div key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <h4 style={{ marginBottom: '5px' }}>{task.title}</h4>
                  <p style={{ fontSize: '0.85rem' }}>Project: {task.project?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className={`badge badge-${task.status.replace(' ', '').toLowerCase()}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
