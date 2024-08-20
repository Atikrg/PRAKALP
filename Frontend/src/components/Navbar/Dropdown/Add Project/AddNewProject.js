import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, InputLabel} from '@mui/material';
import CreateCopyProject  from './CreateCopyProject';
import axios from 'axios';

function AddNewProject({open,onClose}) {
  const [projectName, setProjectName] = useState('');
  const [salesOrder, setSalesOrder] = useState('');
  const [openCopyDialog, setOpenCopyDialog] = useState(false);
  const [showMainDialog, setShowMainDialog] = useState(true);
  const [projectSalesOrder, setProjectSalesOrder] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreateCopyProjectClick = () => {
    setShowMainDialog(false);
    setOpenCopyDialog(true);
  };

  const handleCopyCloseDialog = () => {
    setShowMainDialog(false);
    setOpenCopyDialog(false);
  };

  const handleCopyBackDialog = () => {
    setShowMainDialog(true);
    setOpenCopyDialog(false);
  };

  
 
    
  const handleSubmit = async () => {
    const firstchar = projectSalesOrder.charAt(0);
    const withSpace = projectSalesOrder.length;

    if (projectSalesOrder === '') {
        setErrorMessage("Please enter project sales order");
    } else if (firstchar !== '2' && firstchar !== "I") {
        setErrorMessage("Please enter project sales order with first letter must be '2' or 'I'");
      } else if (withSpace !== 6) {
        setErrorMessage("Sales order length must be equal to 6 characters");
    } else if (projectName === '') {
        setErrorMessage("Please enter project name");
    } else {
        try {
            const response = await axios.post(`https://prakalp.onrender.com/api/addProject`, {
                ProjectName: projectName,
                sales_order: projectSalesOrder
            });
            if (response.data === "Project exist") {
                setErrorMessage("This project name is already used");
            } else if (response.data === "Error") {
                setErrorMessage("Unable to create a new project");
            } else {
                setSuccessMessage("Project created successfully");
                setProjectName('');
                setProjectSalesOrder('');
            }
        } catch (error) {
            setErrorMessage("Error: Unable to create a new project");
        }
    }

    setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
    }, 5000);
};

  return (
    <>
      {showMainDialog && (
        <Dialog open={open} onClose={onClose}>
          <DialogTitle style={{ textAlign: 'left', fontFamily: 'Nunito', color: '#4e73df',fontWeight:'700', fontSize:'30px'}}>
            Add New Project
            <Button onClick={handleCreateCopyProjectClick} style={{ float: 'right', backgroundColor: '#858796', color: 'white', fontFamily: 'Nunito', textTransform: 'capitalize', marginLeft:'10rem' }} color="primary">
              Create Copy Project
            </Button>
          </DialogTitle>
          <DialogContent>
            <InputLabel style={{ fontFamily: 'Nunito', color:'black', fontWeight:'700', fontSize:'18px' }}>Sales Order</InputLabel>
            <TextField
              id='outlined-salesorder'
              placeholder='Enter Sales Order'
              autoFocus
              margin="dense"
              type="text"
              fullWidth
              inputProps={{ style: { padding: '20px', fontFamily: 'Nunito' } }}
              value={projectSalesOrder}
              onChange={(e) => setProjectSalesOrder(e.target.value)}
            />
            <InputLabel style={{ fontFamily: 'Nunito', color:'black', fontWeight:'700', fontSize:'18px', }}>Project Name</InputLabel>
            <TextField
              id='outlined-projname'
              placeholder='Enter Project Name'
              autoFocus
              margin="dense"
              type="text"
              fullWidth
              inputProps={{ style: { padding: '20px', fontFamily: 'Nunito' } }}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
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
            <Button style={{ fontFamily: 'Nunito', backgroundColor: '#1cc88a', color: 'white' }} onClick={handleSubmit} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {openCopyDialog && <CreateCopyProject open={openCopyDialog} onClose={handleCopyCloseDialog} onBack={handleCopyBackDialog}/>}
    </>
  );
}

export default AddNewProject;
