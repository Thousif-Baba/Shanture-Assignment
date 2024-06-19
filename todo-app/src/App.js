import React, { Component } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      task: ''
    };
  }

  componentDidMount() {
    this.fetchTasks();
  }

  fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/tasks');
      this.setState({ tasks: response.data });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  addTask = async () => {
    if (!this.state.task) return;
    try {
      const response = await axios.post('http://localhost:5000/tasks', { description: this.state.task, completed: false });
      this.setState(prevState => ({
        tasks: [...prevState.tasks, response.data],
        task: ''
      }));
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${id}`);
      this.setState(prevState => ({
        tasks: prevState.tasks.filter(task => task._id !== id)
      }));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  toggleCompletion = async (id, completed) => {
    try {
      const response = await axios.put(`http://localhost:5000/tasks/${id}`, {
        completed: !completed
      });
      const updatedTasks = this.state.tasks.map(task => {
        if (task._id === id) {
          return { ...task, completed: response.data.completed };
        }
        return task;
      });
      this.setState({ tasks: updatedTasks });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  downloadTasksPDF = () => {
    window.open('http://localhost:5000/download-tasks', '_blank');
  };

  handleInputChange = (event) => {
    this.setState({ task: event.target.value });
  };

  render() {
    return (
      <div className="container mt-3">
        <div className="text-center mb-3">
          <img
            src="https://res.cloudinary.com/dnqgnmrup/image/upload/v1718774209/Screenshot_2024-06-19_104515_hexy6z.png"
            alt="Task Management"
            className="img-fluid"
          />
        </div>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Add new task"
            value={this.state.task}
            onChange={this.handleInputChange}
          />
          <div className="input-group-append">
            <button className="btn btn-outline-secondary" onClick={this.addTask}>Add Task</button>
          </div>
        </div>
        <button className="btn btn-primary mb-3" onClick={this.downloadTasksPDF}>Download Tasks as PDF</button>
        <ul className="list-group">
          {this.state.tasks.map(task => (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={task._id} style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.description}
              <div>
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={task.completed}
                  onChange={() => this.toggleCompletion(task._id, task.completed)}
                />
                <button className="btn btn-danger btn-sm" onClick={() => this.deleteTask(task._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default App;
