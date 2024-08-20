import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import AddTaskModal from '../Navbar/Dropdown/Add Task/AddTask';
import { Buffer } from 'buffer';
import Skeleton from '@mui/material/Skeleton'; // Import Skeleton from Material-UI

const AggregateTaskView = ({ project, dates, toggleShowTimeComplete, seconds2dayhrmin, showComplete }) => {
  const [localShowTimeDetails, setLocalShowTimeDetails] = useState(() => {
    const storedValue = localStorage.getItem('showTimeDetails');
    const details = storedValue ? JSON.parse(storedValue) : {};
    if (details[project.projectId] === undefined) {
      details[project.projectId] = true;
      localStorage.setItem('showTimeDetails', JSON.stringify(details));
    }
    return details[project.projectId];
  });
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [projectTimeDetails, setProjectTimeDetails] = useState({ planned: {}, actual: {} });
  const [loading, setLoading] = useState(true); // Loading state

  const seconds2hrmin = (ss) => {
    if (ss === 0) { return ``; }
    const h = Math.floor(ss / 3600);
    const m = Math.floor((ss % 3600) / 60);
    const formattedH = h < 10 ? '0' + h : h;
    const formattedM = m < 10 ? '0' + m : m;
    return `${formattedH} : ${formattedM}`;
  };

  const fetchProjectTimeDetails = async (projectName, userId, startDate) => {
    try {
      const response = await axios.get(`${process.env.SERVER_URL}/api/empOverviewIndAggPATimes`, {
        params: { projectName, userId, startDate }
      });

      const updatedProjectTimeDetails = { planned: {}, actual: {} };
      response.data.data.forEach(row => {
        updatedProjectTimeDetails.planned[row.taskDate] = row.planned || 0;
        updatedProjectTimeDetails.actual[row.taskDate] = row.actual || 0;
      });

      setProjectTimeDetails(updatedProjectTimeDetails);
    } catch (error) {
      console.error('Error fetching project time details:', error);
    }
  };

  function decryptToken(token) {
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
    const userData = JSON.parse(decodedToken)[0];
    return userData;
  }

  const decrypToken = decryptToken(localStorage.getItem('token'));

  useEffect(() => {
    const assignBy = decrypToken.id;
    const projectName = project.projectName;
    const startDate = dates[0]?.ymdDate;

    setLoading(true); 
    fetchProjectTimeDetails(projectName, assignBy, startDate);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [project.projectName, dates]);

  const handleToggleShowTimeComplete = (e) => {
    e.stopPropagation();
    setLocalShowTimeDetails(prev => !prev);
    toggleShowTimeComplete(project.projectId);
  };

  const handleOpenAddTaskDialog = () => {
    setAddTaskDialogOpen(true);
  };

  const handleCloseAddTaskDialog = () => {
    setAddTaskDialogOpen(false);
  };

  function getTaskStatusColor(requiredTime, takenTime) {
    if (requiredTime < takenTime) {
      return 'bg-danger border border-danger';
    } else if (takenTime === 0) {
      return 'bg-warning border border-warning';
    } else {
      return 'bg-success border border-success';
    }
  }

  const filteredTasks = project.tasks.filter(task => showComplete || task.taskAproved !== 1);
  const noOfAssignedTasks = filteredTasks.length;

  return (
    <>
      <td style={{ width: '15rem', verticalAlign: 'unset', paddingBottom: 'auto', display: 'flex', alignItems: 'center', border: 'none' }} className="p-0">
        <div className="card" style={{ flex: '1', height: '100%' }}>
          <div className="card-header p-0">
            <h6 className={`m-0 text-center font-weight-bold text-white ${getTaskStatusColor(project.requiredTime, project.takenTime)}`} style={{ fontSize: '11px', paddingTop: '0.1rem' }}>
              Total Task: {noOfAssignedTasks}
              <a className="show p-0" style={{ float: 'right' }} title="Show/Hide Time" name="31">
                <div className="taskEye" style={{ position: 'absolute', right: '1rem' }}>
                  <FontAwesomeIcon
                    icon={localShowTimeDetails ? faEye : faEyeSlash}
                    className="eyeicon"
                    style={{ cursor: 'pointer', color: 'blue' }}
                    onClick={handleToggleShowTimeComplete}
                  />
                </div>
              </a>
            </h6>
          </div>
          <div className="card-body text-left" style={{ padding: '0.37rem' }}>
            {localShowTimeDetails && (
              <>
                <h6 title="Required" className="text-left m-0 Required" style={{ fontSize: '11px' }}>R : {seconds2dayhrmin(project.requiredTime)}</h6>
                <h6 title="Taken" className="text-left m-0 Taken" style={{ fontSize: '11px' }}>T : {seconds2dayhrmin(project.takenTime)}</h6>
              </>
            )}
          </div>
        </div>
        <div style={{ verticalAlign: 'middle', height: 'auto', display: 'flex', flexDirection: 'column' }}>
          <td title='Planned Timings' style={{ padding: '0.35rem 0.4rem', display: 'block', backgroundColor: 'gray', color: 'white', fontSize: '13.44px', borderStyle: 'none solid none solid' }}>P</td>
          <td title='Actual Timings' style={{ padding: '0.3rem 0.35rem', fontSize: '13.44px', borderStyle: 'solid none none solid' }}>A</td>
        </div>
      </td>
      {dates.map((date, i) => {
        const plannedTime = projectTimeDetails.planned[date.ymdDate] || 0;
        const actualTime = projectTimeDetails.actual[date.ymdDate] || 0;
        const showSkeleton = loading && (plannedTime !== 0 || actualTime !== 0);

        return (
          <td key={i} style={{ padding: '0', fontSize: '15px', width: '7rem', overflow: 'hidden' }}>
            {showSkeleton ? (
              <>
                <div style={{ cursor: 'pointer', paddingTop: '0.2rem', width: '8.55rem', display: 'block', backgroundColor: 'gray', color: 'white', border: 'none', textAlign: 'center', height: '2rem', verticalAlign: 'middle' }}>
                  <Skeleton variant="text" width={95} height={25} style={{ marginLeft: '1rem', backgroundColor: 'rgba(1,1,1,0.5)', }} />
                </div>
                <div style={{ paddingTop: '0.2rem', width: '8.55rem', display: 'block', borderStyle: 'solid none none none', textAlign: 'center', height: '2rem', verticalAlign: 'middle', borderWidth: 'thin' }}>
                  <Skeleton variant="text" width={95} height={25} style={{ marginLeft: '1rem', backgroundColor: 'rgba(0,0,0,0.2)' }} />
                </div>
              </>
            ) : (
              <>
                <div title='Create New Task' style={{ cursor: 'pointer', paddingTop: '0.2rem', width: '8.55rem', display: 'block', backgroundColor: 'gray', color: 'white', border: 'none', textAlign: 'center', height: '2rem', verticalAlign: 'middle' }}
                  onClick={handleOpenAddTaskDialog}>
                  {seconds2hrmin(plannedTime)}
                </div>
                <div style={{ paddingTop: '0.2rem', width: '8.55rem', display: 'block', borderStyle: 'solid none none none', textAlign: 'center', height: '2rem', verticalAlign: 'middle', borderWidth: 'thin' }}>
                  {seconds2hrmin(actualTime)}
                </div>
              </>
            )}
          </td>
        );
      })}
      {<AddTaskModal projectName={project.projectName} open={addTaskDialogOpen} onClose={handleCloseAddTaskDialog} />}
    </>
  );
}

export default AggregateTaskView;
