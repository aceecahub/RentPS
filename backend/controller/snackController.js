import { getAllSnackService, getSnackByIdService, createSnackService, updateSnackService, deleteSnackService } from "../service/snackService.js"

export const getAllSnackController = async (req, res) => {
    try {
        const snack = await getAllSnackService()
        res.status(200).json({ message: "Berhasil menampilkan data Snack", snack })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getSnackByIdController = async (req, res) => {
    try {
        const snack = await getSnackByIdService(req.params.id)
        res.status(200).json({ message: "Berhasil menampilkan data Snack", snack })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const createSnackController = async (req, res) => {
    try {
        const snack = await createSnackService(req.body)
        res.status(200).json({ message: "Berhasil menambahkan data Snack", snack })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updateSnackController = async (req, res) => {
    try {
        const snack = await updateSnackService(req.params.id, req.body)
        res.status(200).json({ message: "Berhasil mengubah data Snack", snack })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const deleteSnackController = async (req, res) => {
    try {
        const snack = await deleteSnackService(req.params.id)

        if (!snack) {
            return res.status(404).json({ message: "Data Snack tidak ditemukan" })
        }

        res.status(200).json({ message: "Berhasil menghapus data Snack" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}