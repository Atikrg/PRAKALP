import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import '../App.css';
import TaskOveriew from '../pages/TaskOverview/TaskOverview';
//import EmployeePage from '../pages/EmployeePage';
import Login from '../pages/Login/Login';
import EditEmployee from '../components/Navbar/Dropdown/Manage Employee/EditEmployee';
import Register from '../pages/Register/Register';
import ProjectOverview from '../pages/ProjectOverview/ProjectOverview';
import Profile from '../pages/Profile/Profile';
import EmployeeOverview from '../pages/EmployeeOverview/EmployeeOverview';

function RouteManager() {
    const [showAddProject, setShowAddProject] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [showAssignTask, setShowAssignTask] = useState(false);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile/>} />
                <Route path="/task" element={<TaskOveriew/>} />
                <Route path="/employeeOverview" element={<EmployeeOverview isPopupVisible={showAddProject || showAddTask || showAssignTask} />} />
                <Route path="/project" element={<ProjectOverview />} />
            </Routes>
        </Router>
    );
}

export default RouteManager;