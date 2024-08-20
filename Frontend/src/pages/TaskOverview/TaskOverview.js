import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import '../../pages/TaskOverview/TaskOverview.css';
import Footer from '../../components/Footer';
import EditProjectPopup from '../../components/TaskOverview/EditProjectPopup';
import DeleteProjectPopup from '../../components/TaskOverview/DeleteProjectPopup';
import AddTaskModal from '../../components/Navbar/Dropdown/Add Task/AddTask';
import AggregateTaskView from '../../components/TaskOverview/AggregateTaskView';
import IndividualTaskView from '../../components/TaskOverview/IndividualTaskView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { faEye, faEyeSlash, faTrashAlt, faPencilAlt, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';

const today = new Date();

const daysOfWeek = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

const seconds2dayhrmin = (ss) => {
  const s = ss % 60;
  const h = Math.floor((ss % 28800) / 3600); // 8 hours = 28,800 seconds
  const d = Math.floor((ss % 230400) / 28800); // 8 hours * 30 days = 230,400 seconds
  const m = Math.floor((ss % 3600) / 60);

  const formattedH = h < 10 ? '0' + h : h;
  const formattedM = m < 10 ? '0' + m : m;
  const formattedD = d < 10 ? '0' + d : d;

  return ` ${formattedD} : ${formattedH} : ${formattedM} `;
};

const getBackgroundColor = (proj_status) => {
  switch (proj_status) {
    case 1:
      return '#ADD8E6';
    case 2:
      return '#ffff00ad';
    case 3:
      return '#ff8d00b8';
    case 4:
      return '#04ff00b8';
    default:
      return '#FFFFFF';
  }
};

function TaskOverview() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);



  const [showComplete, setShowComplete] = useState(() => {
    // Get initial state from localStorage or set default value to true
    const storedValue = localStorage.getItem('showComplete');
    return storedValue ? JSON.parse(storedValue) : true;
  });
  const [showTimeComplete, setShowTimeComplete] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectName, setProjectName] = useState(null);
  const [showTimeDetails, setShowTimeDetails] = useState(true);
  const [projectTimeDetails, setProjectTimeDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [showMask, setShowMask] = useState(false);

  const toggleShowComplete = (e) => {
    e.stopPropagation();
    setShowComplete((prevShowComplete) => {
      const newValue = !prevShowComplete;
      localStorage.setItem('showCompletedTasks', JSON.stringify(newValue));
      return newValue;
    });
  };

  const toggleShowTimeComplete = (projectId) => {
    setProjectTimeDetails((prevState) => ({
      ...prevState,
      [projectId]: !prevState[projectId] || false,
    }));
  };

  useEffect(() => {
    const initialProjectTimeDetails = {};
    projects.forEach((project) => {
      initialProjectTimeDetails[project.projectId] = showTimeDetails;
    });
    setProjectTimeDetails(initialProjectTimeDetails);
  }, [projects, showTimeDetails]);

  const [dates, setDates] = useState([]);
  const [startDateIndex, setStartDateIndex] = useState(0);

  useEffect(() => {
    const newDates = [];
    let currentDate = new Date(today);
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(currentDate.setDate(currentDate.getDate() + startDateIndex + i));
      const formattedDate = newDate.toISOString().slice(0, 10);
      newDates.push({
        date: newDate,
        ymdDate: formattedDate,
        dateString: newDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        day: daysOfWeek[newDate.getDay()],
        isSunday: newDate.getDay() === 0,
      });
      currentDate = new Date(today);
    }
    setDates(newDates);
  }, [startDateIndex]);

  const handleExpandTasks = (projectId) => {
    setExpandedProjects((prevState) => ({
      ...prevState,
      [projectId]: !prevState[projectId],
    }));
  };

  const handleTodayClick = () => {
    showLoadingMask();
    setStartDateIndex(0);
  };

  const handleNextDayClick = () => {
    showLoadingMask();
    const nextIndex = startDateIndex + 7;
    setStartDateIndex(nextIndex);
  };

  const handlePreviousDayClick = () => {
    showLoadingMask();
    const previousIndex = startDateIndex - 7;
    setStartDateIndex(previousIndex);
  };

  const handleOpenAddTaskModal = (projectName) => {
    setProjectName(projectName);
    setShowAddTaskModal(true);
  };

  const handleCloseAddTaskModal = () => {
    setShowAddTaskModal(false);
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`https://prakalp.onrender.com/api/taskOverview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: localStorage.getItem('token'),
          is_complete: showComplete ? '1' : '0',
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        setLoading(false);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [showComplete]);

  function getTaskStatusColor(requiredTime, takenTime) {
    if (requiredTime < takenTime) {
      return 'bg-danger border border-danger';
    } else if (takenTime === 0) {
      return 'bg-warning border border-warning';
    } else {
      return 'bg-success border border-success';
    }
  }

  const handleOpenEditProjectDialog = (project) => {
    setSelectedProject({
      salesOrder: project.projectSalesOrder,
      projectName: project.projectName,
      projectStatus: project.proj_status,
      projectId: project.projectId,
    });
    setEditProjectDialogOpen(true);
  };

  const handleCloseEditProjectDialog = () => {
    setEditProjectDialogOpen(false);
    setSelectedProject(null);
  };

  const handleSaveEditProject = async (updatedProject) => {
    try {
      const response = await axios.post(`https://prakalp.onrender.com/api/updateProject`, {
        ProjectName: updatedProject.projectName,
        Projectid: updatedProject.projectId,
        projstatus: updatedProject.projectStatus,
        editprojmodalisalesval: updatedProject.salesOrder
      });

      if (response.data === 'Success') {
        // Update the projects state after saving
        setProjects((prevProjects) =>
          prevProjects.map((proj) =>
            proj.projectSalesOrder === updatedProject.salesOrder
              ? { ...proj, projectName: updatedProject.projectName, proj_status: updatedProject.projectStatus }
              : proj
          )
        );
      } else {
        console.error('Failed to update project:', response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleOpenDeleteProjectDialog = (projectId, projectName) => {
    setSelectedProjectId(projectId);
    setDeleteProjectDialogOpen(true);
    setProjectName(projectName);
  };

  const handleCloseDeleteProjectDialog = () => {
    setSelectedProjectId(null);
    setDeleteProjectDialogOpen(false);
  };

  const LoadingMask = () => {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 10,
        fontSize: '1.5rem',
        fontWeight: '700'
      }}>
        Loading...
      </div>
    );
  };

  const showLoadingMask = () => {
    setShowMask(true);
    setTimeout(() => {
      setShowMask(false);
    }, 1000);
  };

  return (
    <div>
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          <svg width={0} height={0}>
            <defs>
              <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff9900" />
                <stop offset="50%" stopColor="#0099cc" />
                <stop offset="100%" stopColor="#009933" />
              </linearGradient>
            </defs>
          </svg>
          <CircularProgress size={80} sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }} />
        </div>
      ) : (
        <>
          {showMask && <LoadingMask />}
          {dates.length > 0 && (
            <Navbar
              onTodayClick={handleTodayClick}
              onPreviousDayClick={handlePreviousDayClick}
              onNextDayClick={handleNextDayClick}
              dates={dates}
            />
          )}
          <table className="table table-bordered text-dark" width="100%" cellSpacing="0" style={{ marginTop: '38px', fontFamily: "Nunito", tableLayout: 'fixed' }}>
            <thead className="text-white" id="theader" style={{ fontSize: '13px' }}>
              <tr className="text-center small" style={{ position: 'sticky', top: '2.4rem', zIndex: '5' }}>
                <th style={{ width: '20rem', verticalAlign: 'revert', color: 'white' }}>Projects</th>
                <th style={{ width: '15rem', verticalAlign: 'revert', color: 'white', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <span style={{ textAlign: 'center' }}>Task Details</span>
                    <div className="taskEye" title='Show/Hide Approved Task(s)' style={{ position: 'absolute', right: '1rem' }}>
                      <FontAwesomeIcon
                        icon={showComplete ? faEye : faEyeSlash}
                        className="eyeicon"
                        style={{ cursor: 'pointer', color: 'white' }}
                        onClick={toggleShowComplete}
                      />
                    </div>
                  </div>
                </th>
                {dates.map((date, index) => {
                  const currentDate = new Date(date.date);
                  const isSunday = currentDate.getDay() === 0;
                  return (
                    <th
                      key={index}
                      className={isSunday ? 'th1th' : `th${date.day}`}
                      style={{ backgroundColor: isSunday ? 'red' : '', color: 'white', width: '8.57rem' }}
                    >
                      {currentDate.toLocaleString('default', { month: 'short', day: 'numeric' })}
                      <br />
                      [ {currentDate.toLocaleString('default', { weekday: 'short' })} ]
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody id="projectviewtbody">
              {projects.map((project, index) => (
                <tr key={index}>
                  <td className="text-left" style={{ backgroundColor: getBackgroundColor(project.proj_status), color: 'black', padding: '0 0 0 0.5rem', fontSize: '13.44px' }}>
                    {project.assigntaskpresent && (
                      <FontAwesomeIcon
                        icon={expandedProjects[project.projectId] ? faMinus : faPlus}
                        style={{ cursor: 'pointer' }}
                        title='Expand/Collapse Tasks'
                        onClick={() => handleExpandTasks(project.projectId)}
                      />
                    )}
                    [{project.projectSalesOrder}]
                    <a className="deleteproj p-1" style={{ float: 'right', cursor: 'pointer' }} title="Delete project" name={project.proid} onClick={() => handleOpenDeleteProjectDialog(project.projectId, project.projectName)}>
                      <FontAwesomeIcon icon={faTrashAlt} className="text-danger" />
                    </a>
                    <a className="editproj p-1" style={{ float: 'right', cursor: 'pointer' }} title="Edit project" id={project.projectId} name={project.projectName} value={project.proj_status} onClick={() => handleOpenEditProjectDialog(project)}>
                      <FontAwesomeIcon icon={faPencilAlt} className="text-primary" />
                    </a>
                    <br />
                    {project.projectName}
                  </td>
                  {project.assigntaskpresent && (
                    <>
                      {expandedProjects[project.projectId] ? (
                        project.tasks
                          // Filter out tasks with approved value equal to 1 if showComplete is false
                          .filter(task => showComplete || task.taskAproved !== 1)
                          .map(task => (
                            <IndividualTaskView
                              key={task.taskId}
                              project={project}
                              task={task}
                              dates={dates}
                              toggleShowTimeComplete={toggleShowTimeComplete}
                              seconds2dayhrmin={seconds2dayhrmin}
                            />
                          ))
                      ) : (
                        <AggregateTaskView
                          project={project}
                          dates={dates}
                          toggleShowTimeComplete={() => toggleShowTimeComplete(project.projectId)}
                          seconds2dayhrmin={seconds2dayhrmin}
                          showComplete={showComplete}
                        />
                      )}
                    </>
                  )}
                  {!project.assigntaskpresent && (
                    <td title='Create new Task' className="text-center addtask" name={project.projectName} style={{ fontSize: '13.44px', verticalAlign: 'middle', cursor: 'pointer', textDecoration: 'none' }} onClick={() => handleOpenAddTaskModal(project.projectName)} colSpan="9">
                      No Task Found.
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {showAddTaskModal && (
            <AddTaskModal
              open={showAddTaskModal}
              onClose={handleCloseAddTaskModal}
              projectName={projectName}
            />
          )}
          {selectedProject && (
            <EditProjectPopup
              open={editProjectDialogOpen}
              handleClose={handleCloseEditProjectDialog}
              projectDetails={selectedProject}
              onSave={handleSaveEditProject}
            />
          )}
          {selectedProjectId && (
            <DeleteProjectPopup
              open={deleteProjectDialogOpen}
              handleClose={handleCloseDeleteProjectDialog}
              selectedProjectId={selectedProjectId}
              projectName={projectName}
            />
          )}
          <Footer />
        </>
      )}
    </div>
  );
}

export default TaskOverview;
