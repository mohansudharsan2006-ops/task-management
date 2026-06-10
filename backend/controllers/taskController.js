const Task = require('../models/Task');

exports.createTask = async (req, res) => {
    const { title, description, dueDate, category } = req.body;
    try {
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const task = await Task.create({
            user: req.user.id,
            title,
            description,
            dueDate,
            category,
        });

        res.status(201).json({ task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const { status, category } = req.query;
        const filter = { user: req.user.id };

        if (status) {
            if (status === 'completed') filter.completed = true;
            else if (status === 'open' || status === 'todo') filter.completed = false;
        }

        if (category && category !== 'All') {
            filter.category = category;
        }

        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        res.json({ tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        if (typeof req.body.completed === 'boolean') {
            task.completed = req.body.completed;
        }
        task.dueDate = req.body.dueDate || task.dueDate;

        await task.save();
        res.json({ task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
