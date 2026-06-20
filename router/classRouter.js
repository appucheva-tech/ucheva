const router = require('express').Router();
const { checkAdmin } = require('../middleware/authenticator');
const {
    createClassValidator,
    updateClassValidator
} = require('../middleware/joiValidation');
const {
    assignOrCreateClass,
    getAllClasses,
    deleteClass,
    updateClass,
    getClassByPk,
    getAllUnassignedClass
} = require('../controller/classController');

router.post('/create-class', checkAdmin, createClassValidator, assignOrCreateClass);
router.get('/get-class', checkAdmin, getClassByPk);
router.get('/classes', checkAdmin, getAllClasses);
router.get('/unassigned-classes', checkAdmin, getAllUnassignedClass)
router.put('/classes/:id', checkAdmin, updateClassValidator, updateClass);
router.delete('/classes/:id', checkAdmin, deleteClass);

module.exports = router;
