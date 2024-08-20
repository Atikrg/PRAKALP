import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./ProjectOverview.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { faTrashAlt, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { Buffer } from "buffer";
import "../../pages/TaskOverview/TaskOverview.css";
import EditProjectPopup from "../../components/TaskOverview/EditProjectPopup";
import DeleteProjectPopup from "../../components/TaskOverview/DeleteProjectPopup";

function decryptToken(token) {
  const decodedToken = Buffer.from(token, "base64").toString("utf-8");
  const userData = JSON.parse(decodedToken)[0];
  return userData;
}

const ProjectOverview = () => {
  const today = new Date();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const [dates, setDates] = useState([]);
  const [startDateIndex, setStartDateIndex] = useState(0);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [totalProjects, setTotalProjects] = useState(0);
  const [projectDetails, setProjectDetails] = useState({});
  const [totalTaskCount, setTotalTaskCount] = useState(0);
  const [totalPlannedSum, setTotalPlannedSum] = useState(0);
  const [totalActualSum, setTotalActualSum] = useState(0);
  const [totalYTSNosSum, setTotalYTSNosSum] = useState(0);
  const [totalYTSPlannedSum, setTotalYTSPlannedSum] = useState(0);
  const [totalWIPNosSum, setTotalWIPNosSum] = useState(0);
  const [totalWIPPlannedSum, setTotalWIPPlannedSum] = useState(0);
  const [totalWIPActualSum, setTotalWIPActualSum] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const newDates = [];
    let currentDate = new Date(today);
    const startIndex = startDateIndex;
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(
        currentDate.setDate(currentDate.getDate() + startIndex + i)
      );
      newDates.push({
        date: newDate,
        dateString: newDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        day: daysOfWeek[newDate.getDay()],
        isSunday: newDate.getDay() === 0,
      });
      currentDate = new Date(today);
    }
    setDates(newDates);
  }, [startDateIndex]);

  const handleNextDayClick = () => {
    const nextIndex = startDateIndex + 7;
    setStartDateIndex(nextIndex);
  };

  const handlePreviousDayClick = () => {
    const previousIndex = startDateIndex - 7;
    setStartDateIndex(previousIndex);
  };

  const getBackgroundColor = (proj_status) => {
    switch (proj_status) {
      case 1:
        return "#ADD8E6";
      case 2:
        return "#ffff00ad";
      case 3:
        return "#ff8d00b8";
      case 4:
        return "#04ff00b8";
      default:
        return "#FFFFFF";
    }
  };

  const seconds2hrmin = (ss) => {
    if (ss === 0) {
        return '-'; // Return '-' if the input is zero seconds
    }
    
    const hours = ss / 3600; // Convert seconds to hours
    const formattedHours = Math.round(hours * 10) / 10; // Round to one decimal place

    // Check if the decimal part is zero
    if (formattedHours % 1 === 0) {
        return `${formattedHours.toFixed(0)}`; // Return as integer
    } else {
        return `${formattedHours.toFixed(1)}`; // Return as decimal
    }
};


  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.SERVER_URL}/api/projectOverview`, {
        params: { token } // Send token as query parameter
      });
      setProjects(response.data.projects); // Set projects state with the response data
      setTotalProjects(response.data.totalProjects); // Set total projects count
      fetchProjectDetails(response.data.projects);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projects) => {
    try {
      const projectNames = projects.map(project => project.ProjectName);
      const response = await axios.get(`${process.env.SERVER_URL}/api/totalHrs`, {
        params: {
          employeeId: decryptToken(localStorage.getItem('token')).id,
          projectNames,
          token : localStorage.getItem('token')
        }
      });

      // Calculate the sums of planned and actual times
      const totalPlannedSum = Object.values(response.data.projects).reduce(
        (acc, projectDetail) => acc + (projectDetail.planned || 0),
        0
      );

      const totalActualSum = Object.values(response.data.projects).reduce(
        (acc, projectDetail) => acc + (projectDetail.actual || 0),
        0
      );

      setProjectDetails(response.data.projects); // Set project details state with the response data
      setTotalTaskCount(response.data.totalTaskCount); // Set the total task count
      setTotalPlannedSum(totalPlannedSum); // Set the total planned sum in state
      setTotalActualSum(totalActualSum); // Set the total actual sum in state
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  };

 
  

  useEffect(() => {
    console.log("Fetching projects...");
    fetchProjects();
  }, []);

  useEffect(() => {
    console.log("Projects state:", projects);
  }, [projects]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleOpenEditProjectDialog = (project) => {
    setSelectedProject({
      salesOrder: project.sales_order,
      projectName: project.ProjectName,
      projectStatus: project.Status,
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

  return (
    <div>
      {dates.length > 0 && (
        <Navbar
          onPreviousDayClick={handlePreviousDayClick}
          onNextDayClick={handleNextDayClick}
          dates={dates}
        />
      )}
      <div className="container-fluid p-0" style={{ marginTop: "2.5rem" }}>
        <div className="card shadow">
          <div className="card-body p-0">
            <div className="table-responsive text-dark" id="tb1respon">
              <table
                id="sum_table"
                className="table table-bordered text-dark"
                width="100%"
                cellSpacing="0"
              >
                <thead className="text-white" id="theaderproject">
                  <tr
                    className="text-center small totalColumn"
                    id="totalColumn1"
                  >
                    <th rowSpan="4" style={{ width: "20rem" }}>
                      Projects
                    </th>
                    <th colSpan="11">Task Status</th>
                    {dates.map((date, index) => (
                      <th
                        key={index}
                        colSpan="2"
                        rowSpan="3"
                        style={{
                          backgroundColor: date.isSunday ? "red" : "",
                          color: "white",
                        }}
                      >
                        {date.dateString}
                        <br />[ {date.day} ]
                      </th>
                    ))}
                  </tr>
                  <tr
                    className="text-center small totalColumn"
                    id="totalColumn1"
                  >
                    <th className="text-light" colSpan="3">
                      Total
                    </th>
                    <th className="text-light" colSpan="2">
                      YTS
                    </th>
                    <th className="text-light" colSpan="3">
                      WIP
                    </th>
                    <th className="text-light" colSpan="3">
                      CMP
                    </th>
                  </tr>
                  <tr
                    className="text-center small totalColumn"
                    id="totalColumn1"
                  >
                    <th className="text-light">Nos</th>
                    <th className="text-light" colSpan="2">
                      Hrs
                    </th>
                    <th className="text-light">Nos</th>
                    <th className="text-light">Hrs</th>
                    <th className="text-light">Nos</th>
                    <th className="text-light" colSpan="2">
                      Hrs
                    </th>
                    <th className="text-light">Nos</th>
                    <th className="text-light" colSpan="2">
                      Hrs
                    </th>
                  </tr>
                  <tr className="text-center small totalColumn">
                    <th className="bg-total text-dark" style={{background:'#dda5e7'}}></th>
                    <th className="bg-secondary text-dark">P</th>
                    <th className="bg-actual text-dark"style={{background:'#c6e6eb'}}>A</th>
                    <th className="bg-total text-dark" style={{background:'#dda5e7'}}></th>
                    <th className="bg-secondary text-dark">P</th>
                    <th className="bg-total text-dark"style={{background:'#dda5e7'}}></th>
                    <th className="bg-secondary text-dark">P</th>
                    <th className="bg-actual text-dark">A</th>
                    <th className="bg-total text-dark"></th>
                    <th className="bg-secondary text-dark">P</th>
                    <th className="bg-actual text-dark">A</th>
                    <th className="bg-secondary text-dark">P</th>
                    <th className="bg-actual text-dark">A</th>
                    <th className="bg-secondary text-dark">P</th>
                    <th className="bg-actual text-dark">A</th>
                    <th className="bg-secondary text-dark">P</th>
                    <th className="bg-actual text-dark">A</th>
                    <th className="bg-secondary text-dark">P</th>
                    <th className="bg-actual text-dark">A</th>
                    <th className="bg-secondary text-dark">P</th>
                    <th className="bg-actual text-dark">A</th>
                    <th className="bg-secondary text-dark">P</th>
                    <th className="bg-actual text-dark">A</th>
                    <th className="bg-secondary text-dark">P</th>
                    <th className="bg-actual text-dark">A</th>
                  </tr>
                  <tr className="text-center small totalColumn" id="totalCol1">
                    <th
                      className="pname_total_count"
                      style={{ textAlign: "left" }}
                    >
                      Total Project : {projects.length} / {totalProjects}
                    </th>
                    <th className="totalCol">{totalTaskCount} </th>
                    <th className="totalCol">{seconds2hrmin(totalPlannedSum)} </th>
                    <th className="totalCol">{seconds2hrmin(totalActualSum)} </th>
                    {/* Placeholder cells for the remaining columns */}
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                    <th className="totalCol"></th>
                  </tr>
                </thead>
                <tbody id="projectviewtbody">
                  {projects.map((project, index) => {
                    const projectDetail = projectDetails[project.ProjectName] || {};
                    const taskCount = projectDetail.task_count || 0;
                    const planned = projectDetail.planned || 0;
                    const actual = projectDetail.actual || 0;
                   
                    return (
                      <tr key={index}>
                        <td
                          className="text-left"
                          style={{
                            backgroundColor: getBackgroundColor(project.Status),
                            color: "black",
                            padding: "0 0 0 0.5rem",
                            fontSize: "13.44px",
                          }}
                        >
                          [{project.sales_order}]
                          <a
                            className="deleteproj p-1"
                            style={{ float: "right", cursor: "pointer" }}
                            title="Delete project"
                            name={project.sales_order}
                            onClick={() =>
                              handleOpenDeleteProjectDialog(project.projectId, project.ProjectName)
                            }
                          >
                            <FontAwesomeIcon icon={faTrashAlt} className="text-danger" />
                          </a>
                          <a
                            className="editproj p-1"
                            style={{ float: "right", cursor: "pointer" }}
                            title="Edit project"
                            name={project.ProjectName}
                            value={project.Status}
                            onClick={() => handleOpenEditProjectDialog(project)}
                          >
                            <FontAwesomeIcon icon={faPencilAlt} className="text-primary" />
                          </a>
                          <br />
                          {project.ProjectName}
                        </td>

                        {taskCount !== 0 ? (
                          <>
                            <td style={{padding:'0', textAlign:'center',verticalAlign:'middle',background:'#dda5e7'}}>{taskCount}</td>
                            <td style={{padding:'0', textAlign:'center',verticalAlign:'middle' ,background:'#858796'}}>{seconds2hrmin(planned)}</td>
                            <td style={{padding:'0', textAlign:'center',verticalAlign:'middle',background:'#c6e6eb'}}>{seconds2hrmin(actual)}</td>
                           
                          <td
                              className="text-center addtask"
                              style={{ fontSize: "13.44px", verticalAlign: "middle" }}
                              colSpan="17"
                            >
                              test
                            </td>
                          </>
                        ) : (
                          <td
                            title='Create new Task'
                            className="text-center addtask"
                            name={project.ProjectName}
                            style={{
                              fontSize: '13.44px',
                              verticalAlign: 'middle',
                              cursor: 'pointer',
                              textDecoration: 'none'
                            }}
                            colSpan="25"
                          >
                            No Task Found.
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>

              </table>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
