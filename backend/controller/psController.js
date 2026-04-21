import { getAllPsService, getPsByIdService, createPsService, updatePsService, deletePsService } from "../service/psService.js"

export const getAllPsController = async (req, res) => {
    try {
        const ps = await getAllPsService()
        res.status(200).json({ message: "Berhasil menampilkan data PS", ps })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getPsByIdController = async (req, res) => {
    try {
        const ps = await getPsByIdService(req.params.id)
        res.status(200).json({ message: "Berhasil menampilkan data PS", ps })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const createPsController = async (req, res) => {
    try {
        const ps = await createPsService(req.body)
        res.status(200).json({ message: "Berhasil menambahkan data PS", ps })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updatePsController = async (req, res) => {
    try {
        const ps = await updatePsService(req.params.id, req.body)
        res.status(200).json({ message: "Berhasil mengubah data PS", ps })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const deletePsController = async (req, res) => {
    try {
        const ps = await deletePsService(req.params.id)

        if (!ps) {
            return res.status(404).json({ message: "Data PS tidak ditemukan" })
        }

        res.status(200).json({ message: "Berhasil menghapus data PS" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}