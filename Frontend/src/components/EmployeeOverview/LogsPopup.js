import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  styled,
  Checkbox,
  FormControlLabel,
  FormLabel,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { format, subDays } from "date-fns";

const LogsPopup = ({ open, handleClose, employee }) => {
  const [fromDate, setFromDate] = useState(
    format(subDays(new Date(), 1), "yyyy-MM-dd")
  );
  const [toDate, setToDate] = useState(
    format(subDays(new Date(), 1), "yyyy-MM-dd")
  );
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [noProjectFound, setNoProjectFound] = useState(true);
  const [projectFound, setProjectFound] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectAllProjects, setSelectAllProjects] = useState(true); // Set to true by default
  const [selectAllTasks, setSelectAllTasks] = useState(true); // Set to true by default
  const [ApplyProject, setApplyProject] = useState(false);
  const [pageLength, setPageLength] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);


  const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    backgroundColor: "#6c6e7e",
    border: "none",
  }));

  const StyledTable = styled(Table)(({ theme }) => ({
    borderCollapse: "collapse",
    border: "none",
    width: "100%",
  }));

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    padding: "1rem !important",
    backgroundColor: "#6c6e7e", // grey background
    color: "white", // white text color
    border: "none",
    padding: "8px", // padding for better spacing
  }));

  const StyledTableHeadCell = styled(StyledTableCell)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: "1rem", // adjust font size as needed
    textAlign: "center", // center-align text
    borderBottom: "1px solid #ddd", // bottom border for header
    borderColor: "whitesmoke",
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td, &:last-child th": {
      border: 0,
    },
    borderBottom: "1px solid #ddd", // bottom border for rows
  }));

  const seconds2human = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.post(
        `${process.env.SERVER_URL}/api/employeeLogs`,
        {
          employeeId: employee?.id,
          fromDate,
          toDate,
          page: currentPage,
          itemsPerPage: pageLength,
        }
      );

      if (response.data.length === 0) {
        setNoProjectFound(true);
        setProjectFound(false);
        setLogs([]);
        setSelectedProjects([]);
        setSelectAllProjects(false);
      } else {
        setNoProjectFound(false);
        setProjectFound(true);
        setLogs(response.data);
        setTotalItems(response.data.length);
        initializeSelectedItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching employee logs:", error);
      setTimeout(handleClose, 1500);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open, fromDate, toDate, currentPage, employee]);

  const initializeSelectedItems = (data) => {
    const projects = [...new Set(data.map((log) => log.projectName))];
    const tasks = [...new Set(data.map((log) => log.taskName))];

    // Update state with selected items
    setSelectedProjects(projects); // Ensure all projects are selected by default
    setSelectedTasks(selectAllTasks ? tasks : []);
  };

  const handleSelectAllChange = (event, type) => {
    const checked = event.target.checked;
    console.log(`Checked: ${checked}`);
    if (type === "project") {
      setSelectAllProjects(checked);
      setSelectedProjects(
        checked ? [...new Set(logs.map((log) => log.projectName))] : []
      );
    } else if (type === "task") {
      setSelectAllTasks(checked);
      setSelectedTasks(
        checked ? [...new Set(logs.map((log) => log.taskName))] : []
      );
    }
  };

  const handlePrevious = () => {
    setCurrentPage(Math.max(currentPage - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage(
      Math.min(currentPage + 1, Math.ceil(totalItems / pageLength))
    );
  };

  const handleCheckboxChange = (event) => {
    const { value, checked, name } = event.target;

    if (name === "project") {
      if (checked) {
        setSelectedProjects((prev) => [...prev, value]);
      } else {
        setSelectedProjects((prev) => prev.filter((item) => item !== value));
      }
    } else if (name === "task") {
      if (checked) {
        setSelectedTasks((prev) => [...prev, value]);
      } else {
        setSelectedTasks((prev) => prev.filter((item) => item !== value));
      }
    }
  };

  const handleApply = () => {
    // Apply logic can be added here
    setApplyProject(true);
    const filtered = logs.filter((log) =>
      selectedProjects.includes(log.projectName)
    );
    setFilteredTasks([...new Set(filtered.map((log) => log.taskName))]);
  };

  const filteredLogs = logs.filter((log) => {
    const searchLowerCase = searchQuery.toLowerCase();
    return (
      log.projectName.toLowerCase().includes(searchLowerCase) ||
      log.taskName.toLowerCase().includes(searchLowerCase) ||
      log.activity.toLowerCase().includes(searchLowerCase) ||
      log.logs.toLowerCase().includes(searchLowerCase)
    );
  });

  const currentData = filteredLogs
    .filter((log) =>
      selectedProjects.length === 0
        ? true
        : selectedProjects.includes(log.projectName)
    )
    .filter((log) =>
      selectedTasks.length === 0 ? true : selectedTasks.includes(log.taskName)
    )
    .slice((currentPage - 1) * pageLength, currentPage * pageLength);

  const firstItem = (currentPage - 1) * pageLength + 1;
  const lastItem = Math.min(currentPage * pageLength, totalItems);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle
        style={{
          padding: "0",
          textAlign: "left",
          fontFamily: "Nunito",
          color: "#4e73df",
          fontWeight: "500",
          fontSize: "25px",
        }}
      >
        {employee && employee.Name}
        <CloseIcon
          onClick={handleClose}
          style={{ float: "right", cursor: "pointer", color: "red" }}
        />
        <hr style={{ padding: "0", margin: "0" }} />
      </DialogTitle>
      <DialogContent>
        <Box
          display="flex"
          alignItems="center"
          sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}
        >
          <Typography variant="body2" sx={{ pr: 1 }}>
            From<sup style={{ color: "red" }}>*</sup>
          </Typography>
          <TextField
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputProps={{
              inputProps: { max: format(new Date(), "yyyy-MM-dd") },
            }}
            size="small"
            sx={{ mr: 2 }}
          />
          <Typography variant="body2" sx={{ pr: 1 }}>
            To<sup style={{ color: "red" }}>*</sup>
          </Typography>
          <TextField
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputProps={{
              inputProps: { max: format(new Date(), "yyyy-MM-dd") },
            }}
            size="small"
            sx={{ mr: 2 }}
          />
          {noProjectFound && (
            <FormControl size="small" sx={{ mr: 2 }}>
              <Select
                value=""
                displayEmpty
                inputProps={{ "aria-label": "No Project Found" }}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  fontFamily: "Nunito",
                  width: "11rem",
                }}
                MenuProps={{
                  PaperProps: { style: { maxHeight: 200, width: "15rem", } },
                }}
              >
                <MenuItem value="" disabled>
                  No Project Found
                </MenuItem>
              </Select>
            </FormControl>
          )}
          {projectFound && (
            <FormControl size="small" sx={{ mr: 2 }}  >
               <InputLabel style={{color:'black'}}>Select Project</InputLabel>
              <Select
                value=""
                displayEmpty
                inputProps={{ "aria-label": "Select Project" }}
                style={{ color: "black", fontFamily: "Nunito", width: "11rem" }}
                MenuProps={{
                  PaperProps: { style: { maxHeight:250, width:'25rem', }},
                }}
              >
                <MenuItem>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectAllProjects}
                        onChange={(e) => handleSelectAllChange(e, "project")}
                        defaultChecked // Added defaultChecked
                      />
                    }
                    label="All"
                  />
                </MenuItem>
                {[...new Set(logs.map((log) => log.projectName))].map(
                  (project, index) => (
                    <MenuItem
                      key={index}
                      value={project}
                      sx={{ textAlign: "right", padding:"0", width:"10rem"}}dense
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="project"
                            checked={selectedProjects.includes(project)}
                            onChange={handleCheckboxChange}
                            value={project}
                          />
                        }
                        label={project}
                      />
                    </MenuItem>
                  )
                )}

                <MenuItem>
                  <Button
                    onClick={handleApply}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Apply
                  </Button>
                </MenuItem>
              </Select>
            </FormControl>
          )}

          {ApplyProject && (
            <FormControl size="small" sx={{ mr: 2 }}>
              <Select
                value=""
                displayEmpty
                inputProps={{ "aria-label": "Select Task" }}
                style={{ color: "black", fontFamily: "Nunito", width: "11rem" }}
                MenuProps={{
                  PaperProps: { style: { maxHeight: 400, width: "15rem" } },
                }}
              >
                <MenuItem>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectAllTasks}
                        onChange={(e) => handleSelectAllChange(e, "task")}
                        defaultChecked // Added defaultChecked
                      />
                    }
                    label="All"
                  />
                </MenuItem>
                {filteredTasks.map((task, index) => (
                  <MenuItem
                    key={index}
                    value={task}
                    sx={{ textAlign: "right" }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="task"
                          checked={selectedTasks.includes(task)}
                          onChange={handleCheckboxChange}
                          value={task}
                        />
                      }
                      label={task}
                    />
                  </MenuItem>
                ))}
                <MenuItem>
                  <Button
                    onClick={handleApply}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Apply
                  </Button>
                </MenuItem>
              </Select>
            </FormControl>
          )}
          <hr style={{ marginTop: "2rem" }} />
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <FormLabel sx={{ mr: 1 }}>Show</FormLabel>
            <FormControl size="small" sx={{ mr: 1, mb: 1 }}>
              <Select dense
                value={pageLength}
                onChange={(e) => setPageLength(e.target.value)}
                displayEmpty
                inputProps={{ "aria-label": "Items per page" }}
              >
                {[10, 25, 50, 100].map((length) => (
                  <MenuItem dense key={length} value={length} >
                    {length}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormLabel>entries</FormLabel>
          </Box>
          <Box display="flex" alignItems="center">
            <TextField
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mr: 2 }}
            />
          </Box>
        </Box>
        <Box sx={{ maxHeight: "50vh", overflowY: "auto" }}>
          <StyledTableContainer
            component={Paper}
            sx={{ maxHeight: "inherit", overflow: "auto" }}
          >
            <StyledTable id="LogTable">
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>Date</StyledTableHeadCell>
                  <StyledTableHeadCell>Project Name</StyledTableHeadCell>
                  <StyledTableHeadCell>Task Name</StyledTableHeadCell>
                  <StyledTableHeadCell>
                    Time Required (Hr:Min)
                  </StyledTableHeadCell>
                  <StyledTableHeadCell>Time Taken (Hr:Min)</StyledTableHeadCell>
                  <StyledTableHeadCell>Activity</StyledTableHeadCell>
                  <StyledTableHeadCell>Logs</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentData && currentData.length > 0 ? (
                  currentData.map((log, index) => {
                    const timeRequired = seconds2human(
                      parseInt(log.timeRequired)
                    );
                    const timeTaken = log.timeTaken
                      ? seconds2human(parseInt(log.timeTaken))
                      : "-";
                    return (
                      <StyledTableRow key={index}>
                        <StyledTableCell>
                          {new Date(log.date).toISOString().split("T")[0]}
                        </StyledTableCell>
                        <StyledTableCell>{log.projectName}</StyledTableCell>
                        <StyledTableCell>{log.taskName}</StyledTableCell>
                        <StyledTableCell>{timeRequired}</StyledTableCell>
                        <StyledTableCell>{timeTaken}</StyledTableCell>
                        <StyledTableCell>{log.activity}</StyledTableCell>
                        <StyledTableCell>{log.logs}</StyledTableCell>
                      </StyledTableRow>
                    );
                  })
                ) : (
                  <StyledTableRow>
                    <StyledTableCell
                      colSpan={7}
                      style={{ textAlign: "center" }}
                    >
                      No data available in table.
                    </StyledTableCell>
                  </StyledTableRow>
                )}
              </TableBody>
            </StyledTable>
          </StyledTableContainer>
        </Box>

        <Box
          mt={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2">
            Showing {firstItem} to {lastItem} of {totalItems} entries
          </Typography>
          <DialogActions>
            <Button onClick={handlePrevious} disabled={currentPage === 1}>
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentPage === Math.ceil(totalItems / pageLength)}
            >
              Next
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LogsPopup;
  