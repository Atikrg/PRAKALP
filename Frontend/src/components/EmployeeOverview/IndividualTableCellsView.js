import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faTrashAlt, faPencilAlt, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import AggregateTaskDetailsView from './AggregateTaskDetailsView';
import IndividualTaskDetailsView from './IndividualTaskDetailsView';
import EditProjectPopup from '../TaskOverview/EditProjectPopup';
import DeleteProjectPopup from '../TaskOverview/DeleteProjectPopup';
import { CircularProgress } from '@mui/material';

const getBackgroundColor = (proj_status) => {
    switch (proj_status) {
        case 1:
            return '#ADD8E6';
        case 2:
            return '#ffff00';
        case 3:
            return '#ff8d00';
        case 4:
            return '#04ff00';
        default:
            return '#FFFFFF';
    }
};

function GradientCircularProgress() {
    return (
        <td colSpan={9} style={{ padding: '0.4rem 40rem', minWidth:'auto' }}>
            <svg width={0} height={0}>
                <defs>
                    <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ff9900" />
                        <stop offset="50%" stopColor="#0099cc" />
                        <stop offset="100%" stopColor="#009933" />
                    </linearGradient>
                </defs>
            </svg>
            <CircularProgress sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }} />
        </td>
    );
}

function IndividualTableCellsView({ employee, isComplete, dates }) {
    const [localShowTimeDetails, setLocalShowTimeDetails] = useState(true);
    const [totalTasks, setTotalTasks] = useState(0);
    const [projects, setProjects] = useState([]);
    const [cachedProjects, setCachedProjects] = useState({});
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
    const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
    const [projectName, setProjectName] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedProjects, setExpandedProjects] = useState({});
    const empId = employee.id;
    const empType = employee.Type;

    useEffect(() => {
        const fetchProjects = async () => {
            if (cachedProjects[empId]) {
                setProjects(cachedProjects[empId]);
            } else {
                try {
                    const response = await axios.get(`${process.env.SERVER_URL}/api/EmpOverviewPlusMinus`, {
                        params: { empid: empId, U_type: empType }
                    });
                    setProjects(response.data);
                    setLoading(false);
                    setCachedProjects(prevState => ({ ...prevState, [empId]: response.data }));
                } catch (error) {
                    console.error('Error fetching project data:', error);
                }
            }
        };

        fetchProjects();
    }, [empId, cachedProjects]);

    const handleExpandTasks = (projectId) => {
        setExpandedProjects((prevState) => ({
            ...prevState,
            [projectId]: prevState[projectId] === 'individual' ? 'aggregate' : 'individual',
        }));
    };

    const handleSaveEditProject = async (updatedProject) => {
        try {
            const response = await axios.post(
                `${process.env.SERVER_URL}/api/updateProject`,
                {
                    ProjectName: updatedProject.projectName,
                    Projectid: updatedProject.projectId,
                    projstatus: updatedProject.projectStatus,
                    editprojmodalisalesval: updatedProject.salesOrder,
                }
            );

            if (response.data === "Success") {
                // Update the projects state after saving
                setProjects((prevProjects) =>
                    prevProjects.map((proj) =>
                        proj.projectSalesOrder === updatedProject.salesOrder
                            ? {
                                ...proj,
                                projectName: updatedProject.projectName,
                                proj_status: updatedProject.projectStatus,
                            }
                            : proj
                    )
                );
            } else {
                console.error("Failed to update project:", response.data);
            }
        } catch (error) {
            console.error("Error:", error);
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

    const handleToggleShowTimeComplete = (e) => {
        e.stopPropagation();
        setLocalShowTimeDetails(prev => !prev);
    };

    const seconds2dayhrmin = (ss) => {
        if (ss === 0) {
            return '00 : 00 : 00';
        }

        const h = Math.floor((ss % 28800) / 3600); // 8 hours = 28,800 seconds
        const d = Math.floor((ss % 230400) / 28800); // 8 hours * 30 days = 230,400 seconds
        const m = Math.floor((ss % 3600) / 60);

        const formattedH = h < 10 ? '0' + h : h;
        const formattedM = m < 10 ? '0' + m : m;
        const formattedD = d < 10 ? '0' + d : d;

        return `${formattedD} : ${formattedH} : ${formattedM}`;
    };

    return (
        <>
            {loading ? (
                    <GradientCircularProgress />
            ) : (
                projects.length > 0 ? (
                    projects.map((project) => (
                        <React.Fragment key={project.projectId}>
                            <tr>
                                <td style={{ fontSize: '13.5px', padding: '0', backgroundColor: getBackgroundColor(project.proj_status), minWidth: '15rem' }}>
                                    <div className="text-left" style={{ backgroundColor: getBackgroundColor(project.proj_status), color: 'black', paddingLeft: '0.5rem', fontSize: '13.44px' }}>
                                        {project.assigntaskpresent && (
                                            <FontAwesomeIcon
                                                icon={expandedProjects[project.projectId] === 'individual' ? faMinus : faPlus}
                                                style={{ cursor: 'pointer', marginRight: '0.2rem' }}
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
                                    </div>
                                </td>
                                {expandedProjects[project.projectId] === 'individual' ? (
                                    <IndividualTaskDetailsView dates={dates} localShowTimeDetails={localShowTimeDetails} handleToggleShowTimeComplete={handleToggleShowTimeComplete}
                                        seconds2dayhrmin={seconds2dayhrmin} project={project} employee={employee} />
                                ) : (
                                    <AggregateTaskDetailsView dates={dates} localShowTimeDetails={localShowTimeDetails} handleToggleShowTimeComplete={handleToggleShowTimeComplete}
                                        seconds2dayhrmin={seconds2dayhrmin} project={project} employee={employee} />
                                )}
                            </tr>
                        </React.Fragment>
                    ))
                ) : (
                    <td style={{ textAlign: 'center' }} colSpan={9}>No Projects Assigned.</td>
                )
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
        </>
    );
}

export default IndividualTableCellsView;
