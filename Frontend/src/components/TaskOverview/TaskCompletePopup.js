import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  InputLabel,
  InputAdornment,
} from '@mui/material';

const TaskCompletePopup = ({ open, task, handleClose, completionTime, timingId }) => {
  const [taskComplete, setTaskComplete] = useState(false);
  const [taskInProgress, setTaskInProgress] = useState(false);
  const [taskNotComplete, setTaskNotComplete] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [log, setLog] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (completionTime) {
      const seconds2hrmin = (ss) => {
        const h = Math.floor(ss / 3600); // Total hours
        const m = Math.floor((ss % 3600) / 60); // Remaining minutes

        const formattedH = h < 10 ? '0' + h : h;
        const formattedM = m < 10 ? '0' + m : m;

        setHours(formattedH);
        setMinutes(formattedM);
      };
      seconds2hrmin(completionTime);
    }
  }, [completionTime]);

  const theme = createTheme({
    typography: {
      fontFamily: 'Nunito, sans-serif',
    },
  });

  const handleTaskCompleteChange = () => {
    setTaskComplete(!taskComplete);
    setTaskInProgress(false);
    setTaskNotComplete(false);
  };

  const handleTaskInProgressChange = () => {
    setTaskInProgress(!taskInProgress);
    setTaskComplete(false);
    setTaskNotComplete(false);
  };

  const handleTaskNotCompleteChange = () => {
    setTaskNotComplete(!taskNotComplete);
    setTaskComplete(false);
    setTaskInProgress(false);
  };

  const handleSaveClick = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const token = localStorage.getItem('token');
    const taskCompleteData = {
      id: task.taskempId || timingId,
      min: minutes,
      hr: hours,
      msg: log,
      tid: Number(task.taskId) || task.id,
      isChecked: taskComplete,
      isChecked2: taskInProgress,
      isChecked3: taskNotComplete,
      token: token,
    };

    if ((hours === '' && minutes === '') || (hours == 0 && minutes == 0) || hours > 8 || minutes > 59) {
      setErrorMessage("Please check time format (hr less than 8 and min less than 59)");
      return;
    } else if (log === '') {
      setErrorMessage("Please enter log with no special character");
      return;
    } else {
      try {
        const response = await axios.post(`https://prakalp.onrender.com/api/completeTask`, taskCompleteData);
        if (response.data === 'Success') {
          setSuccessMessage('Task timimg changed successfully.')
          setTimeout(handleClose, 2500);
        } else {
          setErrorMessage('Error saving task data');
        }
      } catch (error) {
        setErrorMessage('Error saving task data');
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="time-complete-title"
        maxWidth="sm"
        fullWidth
        sx={{
          top: '0%',
          '& .MuiDialog-paper': {
            width: '80%',
            maxWidth: '500px',
          },
        }}
        style={{ bottom: "32%", margin: "0", position: "absolute" }}
      >
        <DialogTitle
          id="time-complete-title"
          style={{
            textAlign: 'left',
            fontFamily: 'Nunito',
            color: '#4e73df',
            fontWeight: '700',
            fontSize: '24px',
            padding: "0",
            marginTop: "1rem",
            marginLeft: "1rem",
          }}
        >
          Time taken To Complete Task
          <hr padding="0" />
        </DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid item xs={12}>
              <InputLabel style={{ fontFamily: 'Nunito', color: 'Black', fontWeight: '700', fontSize: '16px' }}>Time Taken</InputLabel>
            </Grid>
            <Box display="flex" alignItems="center" className="col-md-12">
              <input type="hidden" id="inputidhide" />
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
            </Box>
            <Grid item xs={10} marginTop={1} marginLeft={2}>
              <Box display="flex" justifyContent="left" alignItems="left">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={taskComplete}
                      onChange={handleTaskCompleteChange}
                      name="taskComplete"
                      color="primary"
                    />
                  }
                  label="Task Complete"
                  sx={{
                    backgroundColor: '#04FF00',
                    borderRadius: '6rem',
                    padding: '0.1rem',
                    pr: 2,
                    fontFamily: 'Nunito, sans-serif'
                  }}
                />
                <FormControlLabel marginLeft="1"
                  control={
                    <Checkbox
                      checked={taskInProgress}
                      onChange={handleTaskInProgressChange}
                      name="taskInProgress"
                      color="primary"
                    />
                  }
                  label="Task in Progress"
                  sx={{
                    backgroundColor: '#FFFF00',
                    borderRadius: '6rem',
                    padding: '0.1rem',
                    pr: 2,
                    fontFamily: 'Nunito, sans-serif'
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={taskNotComplete}
                      onChange={handleTaskNotCompleteChange}
                      name="taskNotComplete"
                      color="primary"
                    />
                  }
                  label="Task not Complete"
                  sx={{
                    backgroundColor: '#FF0000',
                    borderRadius: '6rem',
                    padding: '0.1rem',
                    pr: 2,
                    fontFamily: 'Nunito, sans-serif'
                  }}
                  style={{ display: 'none' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} marginLeft={1}>
              <TextField
                margin="dense"
                variant="outlined"
                label="Logs"
                placeholder="Data logs and part number issue"
                value={log}
                onChange={(e) => setLog(e.target.value)}
                multiline
                fullWidth
                sx={{ fontFamily: 'Nunito, sans-serif' }}
              />
            </Grid>
            {errorMessage && <p style={{ color: 'red', marginTop: '0.5rem', textAlign: 'center' }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: 'green', marginTop: '0.5rem', textAlign: 'center' }}>{successMessage}</p>}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button style={{ fontFamily: 'Nunito', backgroundColor: 'red', color: 'white' }} onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button style={{ fontFamily: 'Nunito', backgroundColor: '#1cc88a', color: 'white' }} onClick={handleSaveClick} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default TaskCompletePopup;
