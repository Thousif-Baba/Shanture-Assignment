const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const PDFDocument = require('pdfkit');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/ShantureBackend', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

const TaskSchema = new mongoose.Schema({
    description: String,
    completed: Boolean
});

const Task = mongoose.model('Task', TaskSchema);

app.get('/tasks', async (req, res) => {
    const tasks = await Task.find();
    res.send(tasks);
});

app.post('/tasks', async (req, res) => {
    const newTask = new Task(req.body);
    await newTask.save();
    res.send(newTask);
});

app.delete('/tasks/:id', async (req, res) => {
    const result = await Task.findByIdAndDelete(req.params.id);
    res.send(result);
});

app.put('/tasks/:id', async (req, res) => {
    const { completed } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, { completed }, { new: true });
    res.send(updatedTask);
});

app.get('/download-tasks', async (req, res) => {
    const tasks = await Task.find();
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.pdf');

    doc.pipe(res);

    doc.fontSize(16).text('Tasks List:', { underline: true });
    doc.moveDown();

    tasks.forEach(task => {
        const status = task.completed ? 'Completed' : 'Pending';
        doc.fontSize(14).text(`Task: ${task.description} - [${status}]`);
        doc.moveDown(0.5);
    });

    doc.end();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
