const db = require('../config/db');
const decryptToken = require('../middleware/decryptToken');

exports.addProject = (req, res) => {
  const { ProjectName, sales_order } = req.body;
  const sql = 'INSERT INTO projects (ProjectName, sales_order) VALUES (?, ?)';
  db.query(sql, [ProjectName, sales_order], (err, result) => {
    if (err) {
      console.error('Error adding project to database:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).send('Project added successfully');
    }
  });
};

exports.getProjectNames = (req, res ) => {
  const sql = 'SELECT projectName FROM projects ORDER BY `projectName` ASC'; 
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching project names:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    const projectNames = results.map((row) => row.projectName);
    res.json(projectNames);
  });
};



exports.empOverviewPrjIndividual = (req, res ) => {
  const { employeeid } = req.body;
  if (!employeeid) {
    return res.status(400).send('employeeid is required');
  }

  const query1 = 'SELECT DISTINCT taskid FROM `Taskemp` WHERE AssignedTo_emp = ?';

  db.query(query1, [employeeid], (err, result) => {
    if (err) return res.status(500).send(err);

    const taskIds = result.map(row => row.taskid);

    if (taskIds.length === 0) {
      return res.status(404).send('No tasks found for this employee');
    }

    const placeholders = taskIds.map(() => '?').join(',');
    const query2 = `SELECT DISTINCT projectName FROM \`Task\` WHERE id IN (${placeholders})`;
    const query3 = `SELECT * FROM \`Task\` WHERE id IN (${placeholders})`;
    const query4 = `SELECT * FROM \`Task\` WHERE id IN (${placeholders}) AND aproved = '1'`;

    db.query(query2, taskIds, (err, projects) => {
      if (err) return res.status(500).send(err);
      const projectsCount= projects.length;

      db.query(query3, taskIds, (err, allTasks) => {
        if (err) return res.status(500).send(err);

        const totalTasks = allTasks.length;

        db.query(query4, taskIds, (err, approvedTasks) => {
          if (err) return res.status(500).send(err);

          const approvedTaskCount = approvedTasks.length;

          res.json({
            projectsCount,
            totalTasks,
            approvedTaskCount
          });
        });
      });
    });
  });
};

function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

exports.EmpOverviewPlusMinus = async(req, res ) => {
  const { empid, U_type } = req.query;

  if (!empid) {
    return res.status(400).send('Employee ID is required');
  }

  try {
    // Get the distinct task IDs
    const taskIdsResult = await query(`SELECT DISTINCT taskid FROM Taskemp WHERE AssignedTo_emp = ?`, [empid]);

    if (!Array.isArray(taskIdsResult) || taskIdsResult.length === 0) {
      return res.status(200).send({ projectNames: [], salesOrders: [] });
    }

    const taskIds = taskIdsResult.map(row => row.taskid);

    // Get the distinct project names
    const projectNamesResult = await query(`SELECT DISTINCT projectName FROM Task WHERE id IN (?)`, [taskIds]);

    if (!Array.isArray(projectNamesResult) || projectNamesResult.length === 0) {
      return res.status(200).send({ projectNames: [], salesOrders: [] });
    }

    const projectNames = projectNamesResult.map(row => row.projectName);

    // Fetch project details for each project name
    const projectDetailsQuery = `SELECT * FROM projects WHERE ProjectName IN (?)`;
    const projectDetailsResult = await query(projectDetailsQuery, [projectNames]);

    if (projectDetailsResult.length === 0) {
      return res.status(200).send({ projectNames: [], salesOrders: [] });
    }

    let response = [];
    let count = 0;
    projectDetailsResult.forEach(project => {
      const projectId = project.id;
      const projectName = project.ProjectName;
      const projectSalesOrder = project.sales_order;
      const proj_status = project.Status;
      const projectLastTask = project.lasttask;

      let selcttask;
      if (U_type !== 'Admin' && U_type !== 'Team Leader') {
        selcttask = `SELECT te.id, te.taskid, p.TaskName, te.timetocomplete_emp, p.timetocomplete, SUM(te.actualtimetocomplete_emp) AS total_actual_time, p.taskDetails, p.Status, p.aproved FROM Taskemp te JOIN Task p ON te.taskid = p.id WHERE te.AssignedTo_emp = ? AND p.ProjectName = ? GROUP BY te.taskid, p.TaskName ORDER BY te.taskid;`;
      } else {
        selcttask = `SELECT * FROM Task WHERE projectName = ?`;
      }

      db.query(selcttask, [empid, projectName], (err, taskResults) => {
        if (err) {
          console.error('Error executing task query:', err.stack);
          return res.status(500).send('Database query error');
        }

        let assigntaskpresent = taskResults.length > 0;
        let noofassigntasks = taskResults.length;
        // Prepare task details for each task
        const tasks = taskResults.map(task => ({
          taskId: task.taskid,
          taskempId: task.id,
          taskName: task.TaskName,
          taskGivenTime: task.timetocomplete_emp,
          taskRequiredTime: task.timetocomplete,
          taskActualTime: task.total_actual_time,
          taskDetails: task.taskDetails,
          taskStatus: task.Status,
          taskAproved: task.aproved
        }));

        const timeQuery = `SELECT sum(p.timetocomplete) as required, sum(te.actualtimetocomplete_emp) as taken FROM Taskemp te JOIN Task p ON te.taskid = p.id WHERE te.AssignedTo_emp = ? AND p.ProjectName = ?`;
        db.query(timeQuery, [empid, projectName], (err, timeResults) => {
          if (err) {
            console.error('Error executing time query:', err.stack);
            return res.status(500).send('Database query error');
          }

          const requiredTime = timeResults[0].required || 0;
          const takenTime = timeResults[0].taken || 0;

          response.push({
            projectId,
            projectName,
            projectSalesOrder,
            assigntaskpresent,
            noofassigntasks,
            proj_status,
            projectLastTask,
            requiredTime,
            takenTime,
            tasks
          });

          count++;
          if (count === projectDetailsResult.length) {
            res.json(response);
          }
        });
      });
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).send('Internal server error');
  }
};
//navbar
exports.createCopyProject = async(req, res ) => {
  const { projectName, salesOrder, taskNames, taskValues } = req.body;

  if (!projectName || !salesOrder) {
    return res.status(400).send('Project name and sales order are required');
  }

  const checkProjectQuery = 'SELECT * FROM projects WHERE ProjectName = ? OR sales_order = ?';
  db.query(checkProjectQuery, [projectName, salesOrder], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send('Database error');
    }

    if (results.length > 0) {
      return res.status(200).send('Project exist');
    }

    const insertProjectQuery = 'INSERT INTO projects (ProjectName, sales_order) VALUES (?, ?)';
    db.query(insertProjectQuery, [projectName, salesOrder], (err, result) => {
      if (err) {
        console.error('Error inserting into the database:', err);
        return res.status(500).send('Database error');
      }

      const projectId = result.insertId;
      const insertTaskQueries = taskNames.map((taskName, index) => {
        const taskValue = taskValues[index];
        return new Promise((resolve, reject) => {
          const insertTaskQuery = 'INSERT INTO Task (projectName, TaskName, timetocomplete) VALUES (?, ?, ?)';
          db.query(insertTaskQuery, [projectName, taskName, taskValue], (err, result) => {
            if (err) {
              return reject(err);
            }
            resolve(result);
          });
        });
      });

      Promise.all(insertTaskQueries)
        .then(() => res.status(200).send('Success'))
        .catch(err => {
          console.error('Error inserting tasks into the database:', err);
          res.status(500).send('Database error');
        });
    });
  });
};

//navbar
exports.updateProjectSorting = (req, res ) => {
  const { token, projshowval, projshowval2, projshowval_pv } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  const userData = decryptToken(token);
  const userId = userData.id;
  if (!userId) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Function to update project sorting in the database
  const updateProjectSorting = (column, value) => {
    let projshowvalFinal = '';
    if (value && !value.includes("-")) {
      projshowvalFinal = value.join(' ');
    }

    const query = `UPDATE Logincrd SET ${column} = ? WHERE id = ?`;
    db.query(query, [projshowvalFinal, userId], (err) => {
      if (err) {
        console.error('Error updating database: ', err);
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ message: 'Success' });
      }
    });
  };

  // Determine which sorting value to update
  if (projshowval) {
    updateProjectSorting('projsorting', projshowval);
  } else if (projshowval2) {
    updateProjectSorting('projsorting2', projshowval2);
  } else if (projshowval_pv) {
    updateProjectSorting('projsorting_pv', projshowval_pv);
  } else {
    res.status(400).json({ error: 'Bad Request' });
  }
};
