import express from 'express'
import { getAllSnackController, getSnackByIdController, createSnackController, updateSnackController, deleteSnackController } from '../controller/snackController.js'

const router = express.Router()

router.get('/', getAllSnackController)
router.get('/:id', getSnackByIdController)
router.post('/', createSnackController)
router.put('/:id', updateSnackController)
router.delete('/:id', deleteSnackController)

export default router