import express from 'express'
import { getAllPsController, getPsByIdController, createPsController, updatePsController, deletePsController } from '../controller/psController.js'

const router = express.Router()

router.get('/', getAllPsController)
router.get('/:id', getPsByIdController)
router.post('/', createPsController)
router.put('/:id', updatePsController)
router.delete('/:id', deletePsController)

export default router