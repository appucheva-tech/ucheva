const router = require('express').Router();
const { createSubject} = require('../controller/subjectController')
const { checkAdmin } = require('../middleware/authenticator');

/**
 * @swagger
 * tags:
 *   name: Subject
 *   description: Subject management
 */
/**
 * @swagger
 * components:
 *  schemas:
 *   Subject:
 *    type: object
 *    required:
 *      - subjectName
 *      - applicableSection
 *      - aplicableDepartment
 *    properties:
 *      id:
 *        type: string
 *        format: uuid
 *      subjectName:
 *        type: string
 *      applicableSection:
 *        type: string
 *      aplicableDepartment:
 *        type: string
 *      adminId:
 *        type: string
 *        format: uuid
 *    createdAt:
 *     type: string
 *    format: date-time
 *   updatedAt:
 *    type: string
 *   format: date-time
 * /api/v1/subject/{id}:
 *  post:
 *   summary: Create a new subject
 *  tags: [Subject]
 *  parameters:
 *  - in: path
 *  name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * requestBody:
 * required: true
 * content:
 * application/json:
 *   schema:
 *     $ref: '#/components/schemas/Subject'
 * responses:
 * 201:
 * description: Subject created successfully
 * content:
 * application/json:
 *   schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Subject created successfully
 * subject:
 * $ref: '#/components/schemas/Subject'
 */

router.post('/subject/:id', checkAdmin,  createSubject)

module.exports = router