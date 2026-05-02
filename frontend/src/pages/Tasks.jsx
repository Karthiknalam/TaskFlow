import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, MessageSquare } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  
  const [formData, setFormData] = useState({ 
    title: '', description: '', project: '', assigneeEmail: '', status: 'To Do', priority: 'Medium' 
  });
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/projects')
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', formData);
      setShowModal(false);
      setFormData({ title: '', description: '', project: '', assigneeEmail: '', status: 'To Do', priority: 'Medium' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating task');
    }
  };

  const handleStatusChange = async (taskId, newStatus, e) => {
    if(e) e.stopPropagation();
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      fetchData();
      if(selectedTask && selectedTask._id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id, e) => {
    if(e) e.stopPropagation();
    if(window.confirm('Delete this task?')) {
      try {
        await axios.delete(`/api/tasks/${id}`);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
  };

  const updateTaskDescription = async () => {
    try {
      await axios.put(`/api/tasks/${selectedTask._id}`, { description: selectedTask.description });
      fetchData();
      alert('Description updated!');
    } catch (error) {
      console.error(error);
    }
  };

  const updateTaskPriority = async (newPriority) => {
    try {
      await axios.put(`/api/tasks/${selectedTask._id}`, { priority: newPriority });
      setSelectedTask(prev => ({ ...prev, priority: newPriority }));
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`/api/tasks/${selectedTask._id}/comments`, { text: newComment });
      setSelectedTask(res.data);
      setNewComment('');
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = ['To Do', 'In Progress', 'Done'];

  return (
    <>
      <div className="container animate-fade-in">
        <div className="flex-between mb-4">
          <h2>Task Board</h2>
          {user?.role === 'Admin' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}/> 
              Add Task
            </button>
          )}
        </div>

        <div className="task-board">
          {columns.map(status => (
            <div key={status} className="task-column">
              <div className="column-header">
                <h3 style={{ fontSize: '1.1rem' }}>{status}</h3>
                <span className="badge" style={{ background: 'var(--surface-hover)', color: 'black' }}>
                  {tasks.filter(t => t.status === status).length}
                </span>
              </div>
              
              <div className="task-list">
                {tasks.filter(t => t.status === status).map(task => (
                  <div key={task._id} className="task-item" onClick={() => openTaskDetails(task)}>
                    <div className="flex-between" style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <div className={`badge priority-${task.priority?.toLowerCase() || 'medium'}`}>
                          {task.priority || 'Medium'}
                        </div>
                      </div>
                      {user?.role === 'Admin' && (
                        <button onClick={(e) => handleDelete(task._id, e)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    
                    <h4 className="task-title">{task.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                      {task.project?.name || 'No Project'}
                    </p>
                    
                    <div className="flex-between">
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Assignee: {task.assignedTo?.name || 'Unassigned'}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {task.comments && task.comments.length > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MessageSquare size={12} /> {task.comments.length}
                          </span>
                        )}
                        <select 
                          className="form-control" 
                          style={{ width: 'auto', padding: '2px 6px', fontSize: '0.75rem' }}
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value, e)}
                          onClick={e => e.stopPropagation()}
                        >
                          {columns.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="card modal-content animate-fade-in">
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Project</label>
                  <select className="form-control" value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} required>
                    <option value="">Select</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To (Email address)</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="user@example.com (optional)" 
                  value={formData.assigneeEmail} 
                  onChange={e => setFormData({...formData, assigneeEmail: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="card modal-content animate-fade-in" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedTask.title}</h3>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>
            
            <div className="flex-between mb-4">
              <span className={`badge badge-${selectedTask.status.replace(' ', '').toLowerCase()}`}>
                {selectedTask.status}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Priority:</span>
                <select 
                  className="form-control" 
                  style={{ width: 'auto', padding: '4px 8px', fontSize: '0.85rem' }}
                  value={selectedTask.priority || 'Medium'}
                  onChange={e => updateTaskPriority(e.target.value)}
                  disabled={user?.role !== 'Admin'}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="form-group mt-4">
              <label className="form-label">Description (Editable)</label>
              <textarea 
                className="form-control" 
                rows="3" 
                value={selectedTask.description} 
                onChange={e => setSelectedTask({...selectedTask, description: e.target.value})}
              ></textarea>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={updateTaskDescription}>Save Description</button>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

            <h4>Comments</h4>
            <div style={{ margin: '15px 0', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
              {!selectedTask.comments || selectedTask.comments.length === 0 ? (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No comments yet.</p>
              ) : (
                selectedTask.comments.map((comment, index) => (
                  <div key={index} style={{ background: 'var(--surface-hover)', padding: '10px', borderRadius: '8px' }}>
                    <div className="flex-between" style={{ marginBottom: '5px' }}>
                      <strong style={{ fontSize: '0.85rem' }}>{comment.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(comment.date).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Write a comment..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">Post</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Tasks;
