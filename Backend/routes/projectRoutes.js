const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.post('/addProject', projectController.addProject);
router.get('/getProjectNames', projectController.getProjectNames);
router.post('/empOverviewPrjIndividual', projectController.empOverviewPrjIndividual);
router.get('/EmpOverviewPlusMinus', projectController.EmpOverviewPlusMinus);
router.post('/createCopyProject', projectController.createCopyProject);
router.post('/updateProjectSorting',projectController.updateProjectSorting);
router.get('/projectOverview',projectController.projectOverview);


module.exports = router;
