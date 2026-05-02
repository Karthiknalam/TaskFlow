import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/tasks')
      ]);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', formData);
      setFormData({ name: '', description: '' });
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating project');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`/api/projects/${id}`);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <>
      <div className="container animate-fade-in">
        <div className="flex-between mb-4">
          <h2>Projects</h2>
          {user?.role === 'Admin' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}/> 
              New Project
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {projects.map(project => {
            const projectTasks = tasks.filter(t => t.project && t.project._id === project._id);
            const doneTasks = projectTasks.filter(t => t.status === 'Done').length;
            const inProgressTasks = projectTasks.filter(t => t.status === 'In Progress').length;
            const totalTasks = projectTasks.length;
            const progressPercent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

            return (
              <div key={project._id} className="card glass">
                <div className="flex-between mb-4">
                  <h3 style={{ color: 'var(--primary-color)' }}>{project.name}</h3>
                  {user?.role === 'Admin' && (
                    <button onClick={() => handleDelete(project._id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <p className="mb-4" style={{ minHeight: '48px' }}>{project.description}</p>
                
                <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                  <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '5px', fontWeight: '500' }}>
                    <span>Progress</span>
                    <span style={{ color: progressPercent === 100 ? 'var(--success)' : 'inherit' }}>{progressPercent}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', background: progressPercent === 100 ? 'var(--success)' : 'var(--primary-color)', transition: 'width 0.5s ease' }}></div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    {doneTasks} Done • {inProgressTasks} In Progress • {totalTasks} Total
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  Created by: {project.createdBy?.name || 'Unknown'}
                </div>
              </div>
            );
          })}
          {projects.length === 0 && <p>No projects found.</p>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="card modal-content animate-fade-in">
            <div className="modal-header">
              <h3>Create New Project</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Projects;
