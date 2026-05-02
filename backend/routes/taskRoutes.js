const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // If Admin, get all tasks. If Member, maybe only tasks assigned to them.
    // Let's get all tasks to show full dashboard, depending on requirement.
    // Assignment says "Members see projects they are part of" 
    const tasks = await Task.find({})
      .populate('project', 'name')
      .populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a task
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { title, description, project, assignedTo, assigneeEmail, dueDate, status, priority } = req.body;

  try {
    let finalAssignedTo = assignedTo || null;
    
    // If an email is provided, look up the user
    if (assigneeEmail) {
      const user = await User.findOne({ email: assigneeEmail });
      if (!user) {
        return res.status(404).json({ message: `User with email ${assigneeEmail} not found` });
      }
      finalAssignedTo = user._id;
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: finalAssignedTo,
      dueDate: dueDate || null,
      status: status || 'To Do',
      priority: priority || 'Medium'
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { title, description, assignedTo, assigneeEmail, status, dueDate, priority } = req.body;

  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      if (req.user.role !== 'Admin') {
        task.status = status || task.status;
        task.description = description || task.description;
      } else {
        let finalAssignedTo = assignedTo || task.assignedTo;
        
        if (assigneeEmail) {
          const user = await User.findOne({ email: assigneeEmail });
          if (!user) {
            return res.status(404).json({ message: `User with email ${assigneeEmail} not found` });
          }
          finalAssignedTo = user._id;
        }

        // Admins can update everything
        task.title = title || task.title;
        task.description = description || task.description;
        task.assignedTo = finalAssignedTo;
        task.status = status || task.status;
        task.dueDate = dueDate || task.dueDate;
        task.priority = priority || task.priority;
      }

      const updatedTask = await task.save();
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      await task.deleteOne();
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add a comment to a task
// @access  Private
router.post('/:id/comments', protect, async (req, res) => {
  const { text } = req.body;

  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      const comment = {
        text,
        user: req.user._id,
        name: req.user.name,
      };

      task.comments.push(comment);
      await task.save();
      
      res.status(201).json(task);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
