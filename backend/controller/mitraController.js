
import { registerMitra, updateApprovalStatus } from '../service/mitraService.js';

export const register = async (req, res) => {
  try {
    // Controller hanya bertugas mempassing data
    const result = await registerMitra(req.body);
    
    return res.status(201).json({
      success: true,
      message: 'Pendaftaran mitra berhasil, menunggu approval admin.',
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const approveMitra = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus, rejectionReason } = req.body; // status: 'APPROVED' atau 'REJECTED'

    const result = await updateApprovalStatus(id, approvalStatus, rejectionReason);

    return res.status(200).json({
      success: true,
      message: `Status mitra berhasil diubah menjadi ${approvalStatus}`,
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
