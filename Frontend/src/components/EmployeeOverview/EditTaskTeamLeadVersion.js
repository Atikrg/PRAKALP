import React, { useState, useEffect } from 'react';
import {
  Dialog, FormControlLabel, InputAdornment, Checkbox, TextField, DialogTitle, MenuItem,
  FormControl, InputLabel, Select, DialogContent, DialogActions, Button, Typography
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const theme = createTheme({
  typography: {
    fontFamily: 'Nunito, sans-serif',
  },
});

const EditTaskTeamLeadVersion = ({ open, handleClose, projectDetails }) => {
  const [projectName, setProjectName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [originalTaskName, setOriginalTaskName] = useState('');
  const [lastTask, setLastTask] = useState(false);
  const [taskActualTime, setTaskActualTime] = useState('');
  const [taskDetails, setTaskDetails] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [projects, setProjects] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState(null);

  const showMessage = (setMessage, message) => {
    setMessage(message);
    setTimeout(() => {
      setMessage('');
      if (setMessage === setSuccessMessage) handleClose();
    }, 1500);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${process.env.SERVER_URL}/api/getProjectNames`);
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (projectDetails) {
      setProjectName(projectDetails.projectName || '');
      setTaskName(projectDetails.taskName || projectDetails.TaskName);
      setOriginalTaskName(projectDetails.taskName || projectDetails.TaskName); // Store the original task name
      setTaskActualTime(projectDetails.taskActualTime || '');
      setTaskDetails(projectDetails.taskDetails);
      setLastTask(projectDetails.projectLastTask || false);
      convertTimeToHoursAndMinutes(projectDetails.timetocomplete);
    }
  }, [projectDetails]);

  const convertTimeToHoursAndMinutes = (seconds) => {
    if (seconds) {
      const totalMinutes = Math.floor(seconds / 60);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      setHours(h);
      setMinutes(m);
    }
  };

  const handleSave = async () => {
    setSuccessMessage('');
    setErrorMessage('');

    const taskData = {
      projectName,
      taskName,
      originalTaskName, // Include the original task name in the request
      lastTask,
      taskActualTime: hours * 3600 + minutes * 60,
      taskDetails,
      approvalStatus,
    };

    try {
      const response = await axios.post(`${process.env.SERVER_URL}/api/saveEditTask`, taskData);
      if (response.data === 'Success') {
        showMessage(setSuccessMessage, 'Task saved successfully!');
      } else {
        showMessage(setErrorMessage, `Failed to save task: ${response.data}`);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      showMessage(setErrorMessage, `Error saving task: ${error.response ? error.response.data : error.message}`);
    }
  };

  const handleApprove = () => {
    setApprovalStatus(1); 
  };

  const handleDisapprove = () => {
    setApprovalStatus(0); 
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={handleClose} aria-labelledby="edit-project-title" maxWidth="sm" fullWidth>
        <DialogTitle id="edit-project-title" style={{ textAlign: 'left', fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '24px', paddingBottom: '0px' }}>
          Edit Task
          <FontAwesomeIcon onClick={handleClose} icon={faTimes} style={{ color: 'gray', marginLeft: '27rem', cursor: 'pointer' }} />
          <hr />
        </DialogTitle>
        <DialogContent style={{ padding: '0px 25px' }}>
          <FormControl fullWidth margin="dense">
            <InputLabel>Select Project</InputLabel>
            <Select
              label="Select Project"
              size='small'
              margin="dense"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{ fontFamily: 'Nunito' }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: '1rem',
                  },
                },
              }}
            >
              {projects.map((project, index) => (
                <MenuItem key={index} value={project} style={{ padding: '0.2rem 1rem' }}>
                  {project}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <InputLabel style={{ fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '16px', marginTop: '8px' }}>Task Details</InputLabel>
          <TextField
            label="Task Name"
            fullWidth
            size='small'
            margin="dense"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            style={{ fontFamily: 'Nunito' }}
          />
          <FormControlLabel
            control={<Checkbox
              checked={lastTask}
              onChange={(e) => setLastTask(e.target.checked)}
              id="islasttask"
            />}
            label="Last Task"
          />
          <InputLabel style={{ fontFamily: 'Nunito', color: 'Black', fontWeight: '700', fontSize: '16px' }}>Time Required</InputLabel>
          <TextField
            style={{ marginRight: '1rem', width: '9rem' }}
            margin="dense"
            id="addprojhr"
            size='small'
            type="number"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
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
            onChange={(e) => setMinutes(Number(e.target.value))}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" style={{ outline: 'none' }}>Min</InputAdornment>
              ),
              style: { fontFamily: 'Nunito', color: 'black', fontWeight: '700', fontSize: '18px', border: 'none' },
              inputProps: { min: 0, max: 59, style: { padding: '1.3rem' } }
            }}
          />
          <TextField
            label="Task Details"
            fullWidth
            size='small'
            margin="dense"
            multiline
            rows={2}
            value={taskDetails}
            onChange={(e) => setTaskDetails(e.target.value)}
            sx={{
              marginTop: '20px',
              fontFamily: 'Nunito',
              borderRadius: '4px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px',
              }
            }}
          />
          <Button style={{ fontFamily: 'Nunito', backgroundColor: '#1cc88a', color: 'white', marginTop: '1rem' }} onClick={handleApprove}>
            Approve
          </Button>
          <Button style={{ fontFamily: 'Nunito', backgroundColor: 'red', color: 'white', marginLeft: '1rem', marginTop: '1rem' }} onClick={handleDisapprove}>
            Disapprove
          </Button>

          {errorMessage && <Typography color="error" align="center">{errorMessage}</Typography>}
          {successMessage && <Typography color="green" align="center">{successMessage}</Typography>}
        </DialogContent>
        <DialogActions style={{ padding: '8px 24px' }}>
          <Button style={{ fontFamily: 'Nunito', backgroundColor: 'red', color: 'white' }} onClick={handleClose}>
            Close
          </Button>
          <Button style={{ fontFamily: 'Nunito', backgroundColor: '#1cc88a', color: 'white' }} onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default EditTaskTeamLeadVersion;
