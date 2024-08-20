import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputAdornment, FormControlLabel, InputLabel, MenuItem, Select,
  TextField,
} from '@mui/material';
import './AddTask.css'
import axios from 'axios';

const theme = createTheme({
  typography: {
    fontFamily: 'Nunito, sans-serif',
  },
});

const AddTaskModal = ({ projectName, open, onClose }) => {
  const [taskName, setTaskName] = useState('');
  const [lastTask, setLastTask] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [minAssign, setMinAssign] = useState(0);
  const [assignDate, setAssignDate] = useState(new Date().toISOString().substr(0, 10));
  const [hrAssign, setHrAssign] = useState(0);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(projectName|| '');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [employees, setEmployees] = useState([]);
  const [taskDetails, setTaskDetails] = useState('');

  const handleClose = () => {
    onClose();
  };

  const handleSave = async () => {

    const showMessage = (setMessage, message) => {
      setMessage(message);
      setTimeout(() => setMessage(''), 1500);
    };

    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');

    // Validation checks
    if (selectedProject === '') {
      showMessage(setErrorMessage, 'Select at least one project');
      return;
    }
    if (hours === 0 && minutes === 0) {
      showMessage(setErrorMessage, 'Please enter time required to complete the task');
      return;
    }
    if (hours > 99 || minutes > 59) {
      showMessage(setErrorMessage, 'Hours limit must be less than 100 and minutes limit must be less than 60');
      return;
    }
    if (selectedEmployee === '') {
      showMessage(setErrorMessage, 'Select an employee');
      return;
    }
    if (taskName === '') {
      showMessage(setErrorMessage, 'Please enter task name');
      return;
    }

    try {
      const response = await axios.post(`https://prakalp.onrender.com/api/createTask`, {
        ProjectName: selectedProject,
        TaskName: taskName,
        Empname: selectedEmployee,
        islasttask: lastTask ? 1 : 0,
        taskdetails: taskDetails,
        hr: hours,
        min: minutes,
        assignDate: assignDate,
        hrAssign: hrAssign,
        minAssign: minAssign,
        token: localStorage.getItem('token'),
      });

      if (response.data === 'Success') {
        showMessage(setSuccessMessage, "Task added Successfully !");
        setTimeout(onClose, 2500);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      showMessage(setErrorMessage, 'Error saving task');
    }
  };


  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`https://prakalp.onrender.com/api/getProjectNames`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  //Select Employee api 
  const fetchEmployees = async () => {
    try {
      const response = await axios.post(`https://prakalp.onrender.com/api/empDropdown`, {
        token: localStorage.getItem('token'),
      });
      setSelectedEmployee('');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
    <Dialog open={open} onClose={handleClose} aria-labelledby="addnewTitle" maxWidth='lg'>
      <DialogTitle id="addnewtask" style={{ textAlign: 'left', fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '30px' }}>
        Add New Task</DialogTitle>
      <DialogContent>
        <div>
          <FormControl style={{ marginTop: '1rem', marginRight: '3rem' }}>
            <InputLabel >Select Project</InputLabel>
            <Select
              label="Select Project"
              id="addprojdrop"
              size='small'
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{ fontFamily: 'Nunito', width: '15rem' }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 400,
                    width: '25rem',
                  },
                },
              }}
            >
              {projects.map((project, index) => (
                <MenuItem key={index} value={project} dense>
                  {project}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl style={{ marginTop: '1rem' }}>
            <InputLabel >Select Employee</InputLabel>
            <Select
              id="selempdrop"
              label="Select Employee"
              size='small'
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={{ fontFamily: 'Nunito', width: '15rem' }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 400,
                    width: '10rem',
                  },
                },
              }}
            >
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.Name} dense>
                  {employee.Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <InputLabel style={{ fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '18px', marginTop: '1rem' }}>Task Details</InputLabel>
        <InputLabel style={{ fontFamily: 'Nunito', color: 'Black', fontWeight: '700', fontSize: '18px' }}>Task Name</InputLabel>
        <TextField
          autoFocus
          margin="dense"
          id="addtaskname"
          type="text"
          placeholder='Task Name Enter'
          fullWidth
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          inputProps={{ style: { padding: '0.5rem', fontFamily: 'Nunito' } }}
        />

        <FormControlLabel
          control={<Checkbox
            checked={lastTask}
            onChange={(e) => setLastTask(e.target.checked)}
            id="islasttask"
          />}
          label="Last Task"
        />
        <InputLabel style={{ fontFamily: 'Nunito', color: 'Black', fontWeight: '700', fontSize: '18px' }}>Required Time</InputLabel>
        <TextField
          style={{ marginRight: '1rem' }}
          margin="dense"
          id="addprojhr"
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" style={{ outline: 'none' }}>Hr</InputAdornment>
            ),
            style: { fontFamily: 'Nunito', color: 'black', fontWeight: '700', fontSize: '18px', border: 'none' },
            inputProps: { min: 0, max: 12, style: { padding: '1.3rem' } }
          }}
        />
        <TextField

          margin="dense"
          id="addprojmin"
          type="number"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" style={{ outline: 'none', }}>Min</InputAdornment>
            ),
            style: { fontFamily: 'Nunito', color: 'black', fontWeight: '700', fontSize: '18px', border: 'none' },
            inputProps: { min: 0, max: 59, style: { padding: '1.3rem' } }
          }}
        />

        {selectedEmployee && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', marginRight: '2.5rem' }}>
                <InputLabel style={{ fontFamily: 'Nunito', color: 'Black', fontWeight: '700', fontSize: '18px', marginTop: '0.5rem' }}>Assign Date</InputLabel>
                <TextField
                  type="date"
                  value={assignDate}
                  onChange={(e) => setAssignDate(e.target.value)}
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  style={{ marginBottom: '0.5rem' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <InputLabel
                  style={{
                    fontFamily: 'Nunito',
                    color: 'Black',
                    fontWeight: '700',
                    fontSize: '18px',
                    marginTop: '0.25rem',
                    marginBottom: '0',
                  }}>
                  Planned Time
                </InputLabel>
                <div style={{ display: 'flex', marginTop: '0.25rem' }}>
                  <TextField
                    margin="dense"
                    id="addprojhr_emp_assign"
                    type="number"
                    value={hrAssign}
                    onChange={(e) => setHrAssign(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end" style={{ outline: 'none' }}>Hr</InputAdornment>
                      ),
                      style: {
                        fontFamily: 'Nunito',
                        color: 'black',
                        fontWeight: '700',
                        fontSize: '18px',
                        border: 'none',
                        marginTop: '0'
                      },
                      inputProps: { min: 0, max: 12, style: { padding: '1.3rem' } }
                    }}
                    style={{ marginRight: '1rem' }}
                  />
                  <TextField
                    margin="dense"
                    size="small"
                    id="addprojmin_emp_assign"
                    type="number"
                    value={minAssign}
                    onChange={(e) => setMinAssign(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end" style={{ outline: 'none' }}>Min</InputAdornment>
                      ),
                      style: {
                        fontFamily: 'Nunito',
                        color: 'black',
                        fontWeight: '700',
                        fontSize: '18px',
                        border: 'none'
                      },
                      inputProps: { min: 0, max: 59, style: { padding: '1.3rem' } }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <TextField
          margin="dense"
          id="addtaskdetails"
          label="Description"
          multiline
          fullWidth
          value={taskDetails}
          onChange={(e) => setTaskDetails(e.target.value)}
        />


        {errorMessage && <p style={{ color: 'red', marginTop: '0.5rem', textAlign: 'center' }}>{errorMessage}</p>}
        {successMessage && (
          <div className="text-center">
            <p style={{ color: 'green', marginTop: '0.5rem' }}>{successMessage}</p>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button style={{ fontFamily: 'Nunito', backgroundColor: 'red', color: 'white' }} onClick={handleClose} color="primary">
          Close
        </Button>
        <Button style={{ fontFamily: 'Nunito', backgroundColor: '#1cc88a', color: 'white' }} onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
    </ThemeProvider>
  );
};

export default AddTaskModal;
