import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import './SettingsDialog.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const SettingsDialog = ({ open, onClose }) => {
    const [activeLink, setActiveLink] = useState('pv');
    const [checkedValues, setCheckedValues] = useState([0, 1, 2, 3, 4]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleClose = () => {
        onClose();
    };

    const handleClick = (id) => {
        setActiveLink(id);
    };

    const handleCheckboxChange = (value) => {
        const index = checkedValues.indexOf(value);
        if (index === -1) {
            setCheckedValues([...checkedValues, value]); // Add to checkedValues if not already present
        } else {
            setCheckedValues(checkedValues.filter((val) => val !== value)); // Remove from checkedValues if already present
        }
    };

    const handleSave = () => {
        setSuccessMessage('');
        setErrorMessage('');
        const token = localStorage.getItem('token');
        const data = {
            token: token,
            projshowval: activeLink === 'pv' ? checkedValues : null,
            projshowval2: activeLink === 'pv2' ? checkedValues : null,
            projshowval_pv: activeLink === 'ev' ? checkedValues : null
        };

        axios.post(`${process.env.SERVERURL}/api/updateProjectSorting`, data)
            .then(response => {
                if (response.data.message === 'Success') {
                    setTimeout(() => setSuccessMessage('Projects sorted successfully !'), 1700);
                    setTimeout(onClose, 2500);
                }

            })
            .catch(error => {
                console.error('Error updating project sorting:', error);
                setErrorMessage('Error in updating project sorting.')
            });
    };

    setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
    }, 3000);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle id="addnewtask" style={{ textAlign: 'left', fontFamily: 'Nunito', color: '#4e73df', fontWeight: '700', fontSize: '30px' }}>Setting

                <FontAwesomeIcon onClick={handleClose} icon={faXmark} style={{ color: 'red', marginLeft: '64rem' }} />

            </DialogTitle>
            <DialogContent>
                <div className="modal-body">
                    <main className="row d-flex flex-nowrap small">
                        <div className="col-3 col-md-2 d-flex flex-column flex-shrink-0 bg-light bg-myweb border-right border-warning">
                            <ul className="nav nav-pills flex-column mb-auto">
                                <li className="nav-item">
                                    <a href="#pv" className={`nav-link pge ${activeLink === 'pv' ? 'active' : ''}`} onClick={() => handleClick('pv')}>
                                        Overview - Task
                                    </a>
                                </li>
                                <li>
                                    <a href="#pv2" className={`nav-link pge ${activeLink === 'pv2' ? 'active' : ''}`} onClick={() => handleClick('pv2')}>
                                        Overview - Project
                                    </a>
                                </li>
                                <li>
                                    <a href="#ev" className={`nav-link pge ${activeLink === 'ev' ? 'active' : ''}`} onClick={() => handleClick('ev')}>
                                        Overview - Employee
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-9 col-md-10 d-flex flex-column flex-shrink-0 bg-light">
                            <div className="row">
                                <div id="pv" className={`col-lg-12 pc p-1 ${activeLink === 'pv' ? '' : 'd-none'}`} style={{ maxHeight: '30rem', overflow: 'auto' }}>                                    <div className="card border border-warning mb-1">
                                    <div className="card-header p-2">
                                        <h6 className="text-myback font-weight-bold m-1">Show projects by</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="input-group flex-nowrap mb-2">
                                            <div className="form-check m-1">
                                                <input className="form-check-input mt-2 projschekck_setting" type="checkbox" value="0" id="projectst_setting_nw" checked={checkedValues.includes(0)} onChange={() => handleCheckboxChange(0)} defaultChecked />
                                                <label className="rounded-pill form-check-label  p-1" htmlFor="projectst_setting_nw" style={{ backgroundColor: 'white' }}>New</label>
                                            </div>
                                            <div className="form-check m-1">
                                                <input className="form-check-input mt-2 projschekck_setting" type="checkbox" value="1" id="projectst_setting" checked={checkedValues.includes(1)} onChange={() => handleCheckboxChange(1)} defaultChecked />
                                                <label className="rounded-pill form-check-label  p-1" htmlFor="projectst_setting" style={{ backgroundColor: '#ADD8E6' }}>Planning</label>
                                            </div>
                                            <div className="form-check m-1" style={{ textAlign: 'center' }}>
                                                <input className="form-check-input mt-2 projschekck_setting" type="checkbox" value="2" id="projectst2_setting" checked={checkedValues.includes(2)} onChange={() => handleCheckboxChange(2)} defaultChecked />
                                                <label className="rounded-pill form-check-label  p-1" htmlFor="projectst2_setting" style={{ backgroundColor: '#ffff00ad' }}>Execution</label>
                                            </div>
                                            <div className="form-check m-1" style={{ textAlign: 'end' }}>
                                                <input className="form-check-input mt-2 projschekck_setting" type="checkbox" value="3" id="projectst3_setting" checked={checkedValues.includes(3)} onChange={() => handleCheckboxChange(3)} defaultChecked />
                                                <label className="rounded-pill form-check-label  p-1" htmlFor="projects3_setting" style={{ backgroundColor: '#ff8d00b8' }}>Last Lap</label>
                                            </div>
                                            <div className="form-check m-1" style={{ textAlign: 'end' }}>
                                                <input className="form-check-input mt-2 projschekck_setting" type="checkbox" value="4" id="projectst4_setting" checked={checkedValues.includes(4)} onChange={() => handleCheckboxChange(4)} defaultChecked />
                                                <label className="rounded-pill form-check-label  p-1" htmlFor="projects4_setting" style={{ backgroundColor: '#04ff00b8' }}>Complete</label>
                                            </div>
                                        </div>
                                        <a id="pagesort" onClick={handleSave} className="btn btn-success">Apply</a>
                                    </div>
                                </div>
                                    <div className="card border border-warning mb-1">
                                        <div className="card-header p-2">
                                            <h6 className="text-myback font-weight-bold m-1">Process to create project</h6>
                                        </div>
                                        <div className="card-body"></div>
                                    </div>
                                </div>

                                {/* Content for Overview - Project */}
                                <div id="pv2" className={`col-lg-12 pc p-1 ${activeLink === 'pv2' ? '' : 'd-none'}`} style={{ maxHeight: '30rem', overflow: 'auto' }}>
                                    <div className='card border border-warning mb-1'>
                                        <div className="card-header p-2">
                                            <h6 className="text-myback font-weight-bold m-1">Show projects by</h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="input-group flex-nowrap mb-2">
                                                <div className="form-check m-1">
                                                    <input className="form-check-input mt-2 projschekck_setting" type="checkbox" value="0" id="projectst_setting_nw" checked={checkedValues.includes(0)} onChange={() => handleCheckboxChange(0)} defaultChecked />
                                                    <label className="rounded-pill form-check-label  p-1" htmlFor="projectst_setting_nw" style={{ backgroundColor: 'white' }}>New</label>
                                                </div>
                                                <div className="form-check m-1">
                                                    <input className="form-check-input mt-2 projschekck_setting" type="checkbox" value="1" id="projectst_setting" checked={checkedValues.includes(1)} onChange={() => handleCheckboxChange(1)} defaultChecked />
                                                    <label className="rounded-pill form-check-label  p-1" htmlFor="projectst_setting" style={{ backgroundColor: '#ADD8E6' }}>Planning</label>
                                                </div>
                                                <div className="form-check m-1" style={{ textAlign: 'center' }}>
                                                    <input className="form-check-input mt-2 projschekck_setting" type="checkbox" value="2" id="projectst2_setting" checked={checkedValues.includes(2)} onChange={() => handleCheckboxChange(2)} defaultChecked />
                                                    <label className="rounded-pill form-check-label  p-1" htmlFor="projectst2_setting" style={{ backgroundColor: '#ffff00ad' }}>Execution</label>
                                                </div>
                                                <div className="form-check m-1" style={{ textAlign: 'end' }}>
                                                    <input className="form-check-input mt-2 projschekck_setting" type="checkbox" value="3" id="projectst3_setting" checked={checkedValues.includes(3)} onChange={() => handleCheckboxChange(3)} defaultChecked />
                                                    <label className="rounded-pill form-check-label  p-1" htmlFor="projects3_setting" style={{ backgroundColor: '#ff8d00b8' }}>Last Lap</label>
                                                </div>
                                                <div className="form-check m-1" style={{ textAlign: 'end' }}>
                                                    <input className="form-check-input mt-2 projschekck_setting" type="checkbox" value="4" id="projectst4_setting" checked={checkedValues.includes(4)} onChange={() => handleCheckboxChange(4)} defaultChecked />
                                                    <label className="rounded-pill form-check-label  p-1" htmlFor="projects4_setting" style={{ backgroundColor: '#04ff00b8' }}>Complete</label>
                                                </div>
                                            </div>
                                            <a id="pagesort" onClick={handleSave} className="btn btn-success">Apply</a>
                                        </div>
                                    </div>
                                    <div className="card border border-warning mb-1">
                                        <div className="card-header p-2">
                                            <h6 className="text-myback font-weight-bold m-1">Process to create project</h6>
                                        </div>
                                        <div className="card-body"></div>
                                    </div>
                                </div>

                                <div id="ev" className={`col-lg-12 pc p-1 ${activeLink === 'ev' ? '' : 'd-none'}`} style={{ maxHeight: '30rem', overflow: 'auto' }}>
                                    <div className='card border border-warning mb-1'>
                                        <div className="card-header p-2">
                                            <h6 className="text-myback font-weight-bold m-1">Show projects by</h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="input-group flex-nowrap mb-2">
                                                <div className="form-check m-1">
                                                    <input className="form-check-input mt-2 projschekck_setting" type="checkbox" value="0" id="projectst_setting_nw" checked={checkedValues.includes(0)} onChange={() => handleCheckboxChange(0)} defaultChecked />
                                                    <label className="rounded-pill form-check-label  p-1" htmlFor="projectst_setting_nw" style={{ backgroundColor: 'white' }}>New</label>
                                                </div>
                                                <div className="form-check m-1">
                                                    <input className="form-check-input mt-2 projschekck_setting" type="checkbox" value="1" id="projectst_setting" checked={checkedValues.includes(1)} onChange={() => handleCheckboxChange(1)} defaultChecked />
                                                    <label className="rounded-pill form-check-label  p-1" htmlFor="projectst_setting" style={{ backgroundColor: '#ADD8E6' }}>Planning</label>
                                                </div>
                                                <div className="form-check m-1" style={{ textAlign: 'center' }}>
                                                    <input className="form-check-input mt-2 projschekck_setting" type="checkbox" value="2" id="projectst2_setting" checked={checkedValues.includes(2)} onChange={() => handleCheckboxChange(2)} defaultChecked />
                                                    <label className="rounded-pill form-check-label  p-1" htmlFor="projectst2_setting" style={{ backgroundColor: '#ffff00ad' }}>Execution</label>
                                                </div>
                                                <div className="form-check m-1" style={{ textAlign: 'end' }}>
                                                    <input className="form-check-input mt-2 projschekck_setting" type="checkbox" value="3" id="projectst3_setting" checked={checkedValues.includes(3)} onChange={() => handleCheckboxChange(3)} defaultChecked />
                                                    <label className="rounded-pill form-check-label  p-1" htmlFor="projects3_setting" style={{ backgroundColor: '#ff8d00b8' }}>Last Lap</label>
                                                </div>
                                                <div className="form-check m-1" style={{ textAlign: 'end' }}>
                                                    <input className="form-check-input mt-2 projschekck_setting" type="checkbox" value="4" id="projectst4_setting" checked={checkedValues.includes(4)} onChange={() => handleCheckboxChange(4)} defaultChecked />
                                                    <label className="rounded-pill form-check-label  p-1" htmlFor="projects4_setting" style={{ backgroundColor: '#04ff00b8' }}>Complete</label>
                                                </div>
                                            </div>
                                            <a id="pagesort" onClick={handleSave} className="btn btn-success">Apply</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {errorMessage && <p style={{ color: 'red', marginTop: '0.5rem', textAlign: 'center', fontSize: '16px' }}>{errorMessage}</p>}
                            {successMessage && (
                                <div className="text-center">
                                    <p style={{ color: 'green', marginTop: '0.5rem', fontSize: '16px' }}>{successMessage}</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SettingsDialog;
