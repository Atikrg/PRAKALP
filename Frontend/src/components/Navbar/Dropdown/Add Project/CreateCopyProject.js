import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, InputLabel, Select, FormControl, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import './CreateCopyProject.css';
import axios from 'axios';

function CreateCopyProject({ open, onClose, onBack }) {
  const [projectName, setProjectName] = useState('');
  const [salesOrder, setSalesOrder] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [checkedTasks, setCheckedTasks] = useState({});
  const [allChecked, setAllChecked] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    if (selectedProject) {
      axios.get(`https://prakalp.onrender.com/api/task?projectName=${selectedProject}`)
        .then((response) => {
          setTasks(response.data);
          const initialCheckedTasks = response.data.reduce((acc, task) => {
            acc[task.TaskName] = true;
            return acc;
          }, {});
          setCheckedTasks(initialCheckedTasks);
          setAllChecked(true);
        })
        .catch((error) => {
          console.error('Error fetching tasks:', error);
        });
    }
  }, [selectedProject]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`https://prakalp.onrender.com/api/getProjectNames`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

 

  //Save button
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous messages
      setErrorMessage('');
      setSuccessMessage('');

    const taskNames = [];
    const taskValues = [];

    tasks.forEach(task => {
      if (checkedTasks[task.TaskName]) {
        taskNames.push(task.TaskName);
        taskValues.push(task.timetocomplete); // Assuming each task has a TaskValue field
      }
    });
   
      
     
     
      // Validation checks
      const firstchar = salesOrder.charAt(0);
    const withSpace = salesOrder.length;

    if (salesOrder === '') {
        setErrorMessage("Please enter project sales order");
        return;
    } else if (firstchar !== '2' && firstchar !== "I") {
        setErrorMessage("Please enter project sales order with first letter must be '2' or 'I'");
        return;
      } else if (withSpace !== 6) {
        setErrorMessage("Sales order length must be equal to 6 characters");
        return;
    } else if (projectName === '') {
        setErrorMessage("Please enter project name");
        return;
    } 
    try {
      const response = await axios.post(`https://prakalp.onrender.com/api/createCopyProject`, {
        projectName,
        salesOrder,
        taskNames,
        taskValues
      });

      if (response.data === 'Project exist') {
        setErrorMessage('Project already exists');
      } else if (response.data === 'Success') {
        setSuccessMessage('Project created successfully');
        setTimeout(() => {
          onClose();
      }, 1500);
      
      } else {
        setErrorMessage('Error creating project');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // setErrorMessage('Error submitting form');
    }
  };
  
  const handleAllChange = (event) => {
    const checked = event.target.checked;
    setAllChecked(checked);
    const updatedCheckedTasks = tasks.reduce((acc, task) => {
      acc[task.TaskName] = checked;
      return acc;
    }, {});
    setCheckedTasks(updatedCheckedTasks);
  };

  const handleTaskChange = (event) => {
    const { name, checked } = event.target;
    setCheckedTasks((prev) => ({
      ...prev,
      [name]: checked,
    }));

    if (!checked) {
      setAllChecked(false);
    } else {
      const allCheckedNow = tasks.every((task) => checkedTasks[task.TaskName] || task.TaskName === name);
      setAllChecked(allCheckedNow);
    }
  };

  

  return (
    <Dialog open={open} onClose={onClose} maxWidth="100%">
      <DialogTitle style={{ textAlign: 'left', fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '30px' }}>
        Add New Project
        <Button style={{ float: 'right', backgroundColor: '#858796', color: 'white', fontFamily: 'Nunito', textTransform: 'capitalize', marginLeft: '10rem' }} onClick={onBack} color="primary">
          Back
        </Button>
      </DialogTitle>
      <DialogContent>
        <div className='row'>
          <div className='col-md-6'>
            <div className="col-12 col-md-12">
              <InputLabel style={{ fontFamily: 'Nunito', color: 'black', fontWeight: '700', fontSize: '18px' }}>Sales Order</InputLabel>
              <TextField
                id='outlined-salesorder'
                placeholder='Enter Sales Order'
                autoFocus
                margin="dense"
                type="text"
                fullWidth
                value={salesOrder}
                onChange={(e) => setSalesOrder(e.target.value)}
                inputProps={{ style: { padding: '0.5rem', fontFamily: 'Nunito' } }}
              />

              <InputLabel style={{ fontFamily: 'Nunito', color: 'black', fontWeight: '700', fontSize: '18px' }}>Project Name</InputLabel>
              <TextField
                id='outlined-projname'
                placeholder='Enter Project Name'
                autoFocus
                margin="dense"
                type="text"
                fullWidth
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                inputProps={{ style: { padding: '0.5rem', fontFamily: 'Nunito' } }}
              />
            </div>
          </div>
          <div className='col-md-6'>
            <div className="col-12 col-md-12">
            <FormControl style={{ marginTop: '2rem', marginRight: '3rem' }}>
            <InputLabel style={{color:'black'}}>Select Project</InputLabel>
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
              {selectedProject && (
                <FormControl className="m-2 border border-primary rounded" style={{ maxHeight: '12rem', maxWidth: '20rem', overflow: 'auto', paddingLeft: '1rem' }}>
                  <FormControlLabel
                    control={<Checkbox checked={allChecked} onChange={handleAllChange} />}
                    label="All"
                  />
                  {tasks.map((task, index) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          checked={checkedTasks[task.TaskName] || false}
                          onChange={handleTaskChange}
                          name={task.TaskName}
                        />
                      }
                      label={task.TaskName}
                    />
                  ))}
                </FormControl>
              )}
            </div>
          </div>
        </div>

        {errorMessage && <p style={{ color: 'red', marginTop: '0.5rem' }}>{errorMessage}</p>}
                          {!errorMessage && (
                            <div className="text-center">
                              <p style={{ color: 'green', marginTop: '0.5rem' }}>{successMessage}</p>
                            </div>)}
      </DialogContent>
      <DialogActions>
        <Button style={{ fontFamily: 'Nunito', backgroundColor: 'red', color: 'white' }} onClick={onClose} color="primary">
          Close
        </Button>
        {selectedProject && (
        <Button style={{ fontFamily: 'Nunito', backgroundColor: '#1cc88a', color: 'white' }} onClick={handleSubmit} color="primary">
          Save
        </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default CreateCopyProject;
