import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const theme = createTheme({
  typography: {
    fontFamily: 'Nunito, sans-serif',
  },
});

const showMessage = (setMessage, message) => {
  setMessage(message);
  setTimeout(() => setMessage(''), 1500);
};

const DeleteProjectPopup = ({ open, handleClose, selectedProjectId, projectName }) => {

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.SERVER_URL}/api/deleteProject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projid: selectedProjectId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === 'Success') {
          showMessage(setSuccessMessage, "Project deleted Successfully !");
          setTimeout(handleClose, 2000);
        } else {
          showMessage(setErrorMessage, "Could not delete the project !");
          setTimeout(handleClose, 1500);
        }
      } else {
        showMessage(setErrorMessage, "Could not delete the project !");
        setTimeout(handleClose, 1500);
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage(setErrorMessage, "Could not delete the project !");
      setTimeout(handleClose, 1500);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={handleClose} aria-labelledby="delete-project-title" maxWidth="sm" fullWidth>
        <DialogTitle id="delete-project-title" style={{ textAlign: 'left', color: 'red', fontWeight: '700', fontSize: '30px' }}>
          Delete Project<FontAwesomeIcon onClick={handleClose} icon={faTimes} style={{ color: 'gray', marginLeft: '20rem', cursor: 'pointer' }} />
        </DialogTitle>
        <DialogContent>
          <div style={{ textAlign: 'center' }}>Are you sure you want to permanently remove the project</div>
          <div style={{ fontWeight: '700', textAlign: 'center' }}>"{projectName}" ?</div>
          {errorMessage && <p style={{ color: 'red', marginTop: '0.5rem', textAlign: 'center' }}>{errorMessage}</p>}
          {successMessage && (
            <div className="text-center">
              <p style={{ color: 'green', marginTop: '0.5rem' }}>{successMessage}</p>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button style={{ backgroundColor: 'gray', color: 'white' }} onClick={handleClose}>
            Cancel
          </Button>
          <Button style={{ backgroundColor: 'red', color: 'white' }} onClick={handleDelete} >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default DeleteProjectPopup;
