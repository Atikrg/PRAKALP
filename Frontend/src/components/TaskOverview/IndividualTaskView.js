import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TaskInfoDialog from './TaskInfoPopup';
import { faEye, faEyeSlash, faCopyright, faPencilAlt, faCircleInfo, faTrashAlt, faL } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import EditTaskPopup from './EditTaskPopup';
import DeleteTaskPopup from './DeleteTaskPopup';
import TaskCompletePopup from './TaskCompletePopup';
import { Buffer } from 'buffer';
import { format } from 'date-fns';

function getTaskStatusColor(status, approved) {
  if (approved === 1) {
    return "bg-success border border-success";
  } else if (status === "2") {
    return "bg-warning border border-warning";
  } else {
    return "bg-warning border border-warning";
  }
}

function decryptToken(token) {
  const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
  const userData = JSON.parse(decodedToken)[0];
  return userData;
}

const IndividualTaskView = ({ project, dates, task, toggleShowTimeComplete, seconds2dayhrmin }) => {
  const [localShowTimeDetails, setLocalShowTimeDetails] = useState(false);
  const [taskInfoDialogOpen, setTaskInfoDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState({});
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [taskDetails, setTaskDetails] = useState(null);
  const [taskCompleteOpen, setTaskCompleteOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [taskTimings, setTaskTimings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskCompletionTime, setTaskCompletionTime] = useState(null);  // New state to hold task completion time

  const seconds2hrmin = (ss) => {
    const h = Math.floor(ss / 3600); // Total hours
    const m = Math.floor((ss % 3600) / 60); // Remaining minutes

    const formattedH = h < 10 ? '0' + h : h;
    const formattedM = m < 10 ? '0' + m : m;

    return `${formattedH} : ${formattedM}`;
  };

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${process.env.SERVER_URL}/api/taskInfoDialog`, {
          token,
          taskId: task.taskId,
        });
        setTaskDetails(response.data);
      } catch (error) {
        console.error('Failed to fetch task details:', error);
      }
    };

    fetchTaskDetails();
  }, [task.taskId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = decryptToken(token);
        setNickname(userData.Nickname);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchTaskTimings = async () => {
      try {
        const formattedDates = dates.map(item => format(new Date(item.date), 'yyyy-MM-dd'));
        const responses = await Promise.all(formattedDates.map(formattedDate => (
          axios.post(`${process.env.SERVER_URL}/api/indViewPATimes`, {
            projectName: project.projectName,
            dates: [formattedDate]
          })
        )));
        const responseData = responses.map(response => response.data);
        setTaskTimings(responseData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch task timings:', error);
      }
    };

    fetchTaskTimings();
  }, [project.projectName, dates]);

  const handleTaskInfoDialogOpen = () => {
    setTaskInfoDialogOpen(true);
  };

  const handleTaskInfoDialogClose = () => {
    setTaskInfoDialogOpen(false);
  };

  const handleOpenEditTaskDialog = () => {
    setSelectedProject({
      projectName: project.projectName,
      projectLastTask: project.projectLastTask,
      taskName: task.taskName,
      taskActualTime: task.taskActualTime,
      taskDetails: task.taskDetails,
    });
    setEditTaskDialogOpen(true);
  };

  const handleCloseEditTaskDialog = () => {
    setSelectedProject(null);
    setEditTaskDialogOpen(false);
  };

  const handleToggleShowTimeComplete = (e) => {
    e.stopPropagation();
    setLocalShowTimeDetails(prev => !prev);
  };

  const handleOpenDeleteTaskDialog = () => {
    setTaskToDelete({ taskId: task.taskId, taskName: task.taskName });
    setDeleteTaskDialogOpen(true);
  };

  const handleCloseDeleteTaskDialog = () => {
    setTaskToDelete(null);
    setDeleteTaskDialogOpen(false);
  };

  const handleOpenTaskCompleteDialog = (time) => {
    setTaskCompletionTime(time);
    setTaskCompleteOpen(true);
  };

  const handleCloseTaskCompleteDialog = () => {
    setTaskCompleteOpen(false);
  };

  return (
    <div className="task-container" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="p-0" style={{ width: '100%', verticalAlign: 'top', height: '100%', display: 'flex', border: 'none' }}>
        <div className="card" style={{ flex: '1', height: '2rem', display: 'flex', flexDirection: 'column', width: '11rem', marginLeft: '0' }}>
          <div style={{ height: '5rem', width: '13.2rem', border: 'none' }}>
            <h6 className={`m-0 py-1 text-center font-weight-bold text-white ${getTaskStatusColor(task.taskStatus, task.taskApproved)}`} style={{ marginTop: '0.5rem', fontSize: '11px' }}>
              {task.taskName}
            </h6>
            <FontAwesomeIcon icon={faTrashAlt} title='Delete Task' style={{ float: 'right', cursor: 'pointer', color: 'red', paddingTop: '0.2rem', paddingLeft: '0.5rem', paddingRight: '0.4rem' }} onClick={handleOpenDeleteTaskDialog} />
            <FontAwesomeIcon icon={faPencilAlt} title='Edit Task' style={{ float: 'right', cursor: 'pointer', color: '#4e73df', paddingTop: '0.2rem', paddingLeft: '0.5rem' }} onClick={handleOpenEditTaskDialog} />
            {task.taskStatus === "1" && (<FontAwesomeIcon icon={faCopyright} color='#1cc88a' title='Marked as Complete' style={{ marginLeft: '0.4rem', verticalAlign: 'middle' }} />)}
            <FontAwesomeIcon icon={faCircleInfo} title='Task Info' style={{ float: 'right', cursor: 'pointer', color: '#4e73df', paddingTop: '0.2rem', paddingLeft: '0.5rem' }} onClick={handleTaskInfoDialogOpen} />
            {project.projectLastTask === 1 && (<FontAwesomeIcon icon={faL} title='Last Task' style={{ color: '#36b9cc', paddingTop: '0.2rem', paddingLeft: '0.5rem' }} />)}
            <FontAwesomeIcon title='Show/Hide Time' icon={localShowTimeDetails ? faEyeSlash : faEye} onClick={handleToggleShowTimeComplete} style={{ float: 'right', cursor: 'pointer', color: '#4e73df', paddingTop: '0.2rem' }} />
          </div>

          <TaskInfoDialog
            key={task.taskId}
            open={taskInfoDialogOpen}
            project={project}
            task={task}
            taskDetails={taskDetails}
            handleClose={handleTaskInfoDialogClose}
          />

          <EditTaskPopup
            open={editTaskDialogOpen}
            handleClose={handleCloseEditTaskDialog}
            projectDetails={selectedProject}
          />

          {deleteTaskDialogOpen && (
            <DeleteTaskPopup
              task={taskToDelete}
              open={deleteTaskDialogOpen}
              handleClose={handleCloseDeleteTaskDialog}
            />
          )}

          {taskCompleteOpen && (
            <TaskCompletePopup
              open={taskCompleteOpen}
              task={task}
              handleClose={handleCloseTaskCompleteDialog}
              completionTime={taskCompletionTime}  // Pass the task completion time as a prop
            />
          )}

          {localShowTimeDetails && (
            <div className="card-body text-left" style={{ padding: '0', fontSize: '11px', height: 'auto', width: '13rem', marginLeft: '0.2rem', marginBottom: '0.2rem' }}>
              R: {seconds2dayhrmin(task.taskRequiredTime)}
              <br />
              T: {seconds2dayhrmin(task.taskActualTime)}
            </div>
          )}
        </div>

        <table style={{ marginLeft: '13.2rem' }}>
          <tbody>
            <tr>
              <td title='Planned Timings' style={{ padding: '0.73rem 0.5rem', display: 'block', backgroundColor: 'gray', color: 'white', fontSize: '13.44px', borderStyle: 'none solid none none' }}>P</td>
              {dates.map((date, i) => (
                <td key={i} style={{ minWidth: '8.5rem', backgroundColor: 'gray', color: 'white', borderStyle: 'none solid solid none', textAlign: 'center', fontWeight: '800', fontSize: '13px' }}>
                  {loading ? '' : (
                    taskTimings[i]?.map(timing => (
                      timing.taskid === task.taskId ? `${nickname} : ${seconds2hrmin(timing.planned)}` : ''
                    ))
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td title='Actual Timings' style={{ padding: '0.6rem 0.5rem', fontSize: '13.44px' }}>A</td>
              {dates.map((date, i) => (
                <td key={i} style={{ minWidth: '8.5rem', backgroundColor: 'white', border: '1px solid gray', textAlign: 'center', fontWeight: '800', fontSize: '13px' }}>
                  {loading ? '' : (
                    taskTimings[i]?.map(timing => (
                      timing.taskid === task.taskId ? (
                        <>
                          <span key={timing.id} onClick={() => handleOpenTaskCompleteDialog(timing.actual)} style={{ color: seconds2hrmin(timing.actual) ? '#1cc88a' : 'inherit', cursor: 'pointer' }}>{nickname} </span> : {seconds2hrmin(timing.actual)}
                        </>
                      ) : ''
                    ))
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IndividualTaskView;
