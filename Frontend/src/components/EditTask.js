import React, { useState, useEffect } from 'react';
import '../assets/styles/EditTask.css'
import arrow from '../assets/images/down-arrow.png';
import axios from 'axios';


const EditTask = ({ onClose, taskData, updateTaskList }) => {
  const [project, setProject] = useState(taskData ? taskData.project : '');
  const [taskName, setTaskName] = useState(taskData ? taskData.taskName : '');
  // const [timeRequired, setTimeRequired] = useState(taskData ? taskData.timeRequired : '');
  const [description, setDescription] = useState(taskData ? taskData.description : '');
  const [isLastTask, setIsLastTask] = useState(taskData ? taskData.isLastTask : '');
  const [hoursRequired, setHoursRequired] = useState(taskData ? parseInt(taskData.hoursRequired, 10) || '' : '');
  const [minutesRequired, setMinutesRequired] = useState(taskData ? parseInt(taskData.minutesRequired, 10) || '' : '');

  const [timeRequired, setTimeRequired] = useState(taskData ? `${taskData.hoursRequired}:${taskData.minutesRequired}` : '');


  const handleProjectChange = (event) => {
    setProject(event.target.value);
  };

  const handleTaskNameChange = (event) => {
    setTaskName(event.target.value);
  };

  const handleTimeRequiredChange = (event) => {
    setTimeRequired(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleIsLastTaskChange = (event) => {
    setIsLastTask(event.target.checked);
  };

  const handleHoursRequiredChange = (event) => {
    setHoursRequired(event.target.value);
  };

  const handleMinutesRequiredChange = (event) => {
    setMinutesRequired(event.target.value);
  };


  const [projectNames, setProjectNames] = useState([]);
  const [employeeNames, setEmployeeNames] = useState([]);

  
  const handleEditTask = async () => {
    // Combine hours and minutes into a single string
    const timeRequiredString = `${hoursRequired}:${minutesRequired}`;
    // console.log(timeRequiredString)
  
    axios.put(`https://prakalp.onrender.com/editTask/${taskData.id_t}`, { project, taskName, timeRequired: timeRequiredString, description, isLastTask })
      .then((response) => {
        console.log(response.data);
        updateTaskList(); // Update task list after editing
        onClose(); // Close the EditTask component
      })
      .catch((error) => {
        console.error('Error editing task:', error);
      });
      window.alert('Task updated successfully');
  };
  

  return (
    <div className="card2">
      <form>

        <div className='card-header2'>
          <button className="arrow-button2" onClick={onClose}><img src={arrow} /></button>
          <h2>Edit Task</h2>
        </div>

        <div className="form-group">
          <label htmlFor="project">Select Project:</label>
          <div className="input-project">
            <input
              id="project"
              name="project"
              value={project}
              onChange={handleProjectChange}
              readOnly
            >
            </input>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="taskName">Task Name:</label>
          <input
            type="text"
            id="taskName"
            name="taskName"
            value={taskName}
            onChange={handleTaskNameChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Time Required:</label>
          <div className="time-inputs">
            <input
              type="number"
              id="hoursRequired"
              name="hoursRequired"
              value={hoursRequired}
              onChange={handleHoursRequiredChange}
              min="0"
              max="8"
              maxLength={2}
              required
            />
            <label htmlFor="hoursRequired">Hours</label>

            <input
              type="number"
              id="minutesRequired"
              name="minutesRequired"
              value={minutesRequired}
              onChange={handleMinutesRequiredChange}
              min="0"
              max="59"
              maxLength={2}
              required
            />
            <label htmlFor="minutesRequired">Minutes</label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={handleDescriptionChange}
            required
          />
        </div>

        <div className="form-group">
          <div className='last-task'>
            <label htmlFor="isLastTask">Mark as Last Task:</label>
            <input
              type="checkbox"
              value={taskData.isLastTask}
              id="isLastTask"
              name="isLastTask"
              checked={isLastTask}
              onChange={handleIsLastTaskChange}
            />
          </div>

        </div>
        <div className="card-footer2">
          <button type="submit" onClick={handleEditTask}>Edit Task</button>
        </div>
      </form>
    </div>
  );
};

export default EditTask;

