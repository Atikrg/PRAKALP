import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Checkbox, Button, Grid, Box, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Nunito, sans-serif',
  },
});

const EditProjectPopup = ({ open, handleClose, projectDetails, onSave }) => {
  const [salesOrder, setSalesOrder] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [projectStatus, setProjectStatus] = useState({
    planning: false,
    execution: false,
    lastLap: false,
    complete: false,
  });

  const showMessage = (setMessage, message) => {
    setMessage(message);
    setTimeout(() => setMessage(''), 1500);
  };



  useEffect(() => {
    if (projectDetails) {
      setSalesOrder(projectDetails.salesOrder);
      setProjectName(projectDetails.projectName);
      setProjectId(projectDetails.projectId);
      setProjectStatus({
        planning: projectDetails.projectStatus === 1,
        execution: projectDetails.projectStatus === 2,
        lastLap: projectDetails.projectStatus === 3,
        complete: projectDetails.projectStatus === 4,
      });
    }
  }, [projectDetails]);

  const handleStatusChange = (event) => {
    const { name, checked } = event.target;

    // If the clicked checkbox is being checked
    if (checked) {
      // Set the state for the clicked checkbox to true
      setProjectStatus({
        planning: name === 'planning' ? true : false,
        execution: name === 'execution' ? true : false,
        lastLap: name === 'lastLap' ? true : false,
        complete: name === 'complete' ? true : false
      });
    } else {
      // If the clicked checkbox is being unchecked, set its state to false
      setProjectStatus({
        ...projectStatus,
        [name]: false
      });
    }
  };


  const handleSave = () => {
    setSuccessMessage('');
    setErrorMessage('');

    const payload = {
      ProjectName: projectName,
      Projectid: projectId,
      projstatus: projectStatus,
      editprojmodalisalesval: salesOrder,
    };

    // Validation checks
    if (!projectName || !salesOrder) {
      showMessage(setErrorMessage, "Please enter all credentials.");
      return;
    }
    if (salesOrder.charAt(0) !== '2' && salesOrder.charAt(0) !== 'I') {
      showMessage(setErrorMessage, "Please enter project sales order with the first letter must be '2' or 'I'.");
      return;
    }
    if (salesOrder.length !== 6) {
      showMessage(setErrorMessage, "Sales order length must be equal to 6 characters.");
      return;
    }
    // Check if project details are unchanged
    if (
      projectName === projectDetails.projectName &&
      salesOrder === projectDetails.salesOrder &&
      JSON.stringify(projectStatus) === JSON.stringify({
        planning: projectDetails.projectStatus === 1,
        execution: projectDetails.projectStatus === 2,
        lastLap: projectDetails.projectStatus === 3,
        complete: projectDetails.projectStatus === 4,
      })
    ) {
      showMessage(setErrorMessage, "Project details are unchanged.");
      return;
    }

    fetch(`https://prakalp.onrender.com/api/updateProject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => response.text())
      .then(data => {
        if (data === 'Success') {
          onSave({
            projectName,
            projectId,
            projectStatus,
            salesOrder
          });
          showMessage(setSuccessMessage, "Project updated Successfully !");
          setTimeout(handleClose, 2000);
        }
      })
      .catch((error) => {
        showMessage(setErrorMessage, "Could not update the project !");
        setTimeout(handleClose, 2000);
        console.error('Error:', error);
      });
  };


  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={handleClose} aria-labelledby="edit-project-title" maxWidth="sm" fullWidth style={{bottom:"25%", margin:"0", position:"absolute" }} >
        <DialogTitle id="edit-project-title" style={{ textAlign: 'left', fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '30px' }}>
          Edit Project<hr /></DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} style={{ marginTop: '0.4rem' }}>
              <TextField
                fullWidth
                id='editprojmodalisalesval'
                variant="outlined"
                label="Sales Order"
                placeholder="Enter Sales order"
                value={salesOrder}
                onChange={(e) => setSalesOrder(e.target.value)}
                InputLabelProps={{ className: 'text-dark font-weight-bold', sx: { fontFamily: 'Nunito, sans-serif', fontSize: '18px' } }}
                InputProps={{ sx: { fontFamily: 'Nunito, sans-serif' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id='editprojmodalinput'
                variant="outlined"
                label="Project Name"
                placeholder="Enter Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                InputLabelProps={{ className: 'text-dark font-weight-bold', sx: { fontFamily: 'Nunito, sans-serif', fontSize: '18px' } }}
                InputProps={{ sx: { fontFamily: 'Nunito, sans-serif' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                hidden
                value={projectId}
                InputProps={{ readOnly: true, sx: { fontFamily: 'Nunito, sans-serif' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={1}>
                <Grid item xs={3}>
                  <Box display="flex" justifyContent="center">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={projectStatus.planning}
                          onChange={handleStatusChange}
                          name="planning"
                          color="primary"
                        />
                      }
                      label="Planning"
                      sx={{
                        backgroundColor: '#ADD8E6',
                        borderRadius: '6rem',
                        padding: '0.1rem',
                        pr: 2,
                        fontFamily: 'Nunito, sans-serif'
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box display="flex" justifyContent="center">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={projectStatus.execution}
                          onChange={handleStatusChange}
                          name="execution"
                          color="primary"
                        />
                      }
                      label="Execution"
                      sx={{
                        backgroundColor: '#FFFF00',
                        borderRadius: '6rem',
                        padding: '0.1rem',
                        pr: 2,
                        fontFamily: 'Nunito, sans-serif'
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box display="flex" justifyContent="center">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={projectStatus.lastLap}
                          onChange={handleStatusChange}
                          name="lastLap"
                          color="primary"
                        />
                      }
                      label="Last Lap"
                      sx={{
                        backgroundColor: '#FF8D00',
                        borderRadius: '6rem',
                        padding: '0.1rem',
                        pr: 2,
                        fontFamily: 'Nunito, sans-serif'
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box display="flex" justifyContent="center">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={projectStatus.complete}
                          onChange={handleStatusChange}
                          name="complete"
                          color="primary"
                        />
                      }
                      label="Complete"
                      sx={{
                        backgroundColor: '#04FF00',
                        borderRadius: '6rem',
                        padding: '0.1rem',
                        pr: 2,
                        fontFamily: 'Nunito, sans-serif'
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

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
          <Button id='editprojsave' style={{ fontFamily: 'Nunito', backgroundColor: '#1cc88a', color: 'white' }} onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default EditProjectPopup;
