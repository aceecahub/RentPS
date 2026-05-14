import prisma from '../prisma/client.js'
import bcrypt from 'bcrypt'
import { setupMitraProfile, updateApprovalStatus, manualCloseAndOpen, operatingHours, getIncomeReport } from '../service/mitraService.js';

export const getIncomeReportController = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, period } = req.query;

    const result = await getIncomeReport(id, { startDate, endDate, period });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const setupProfile = async (req, res) => {
  try {
    const { userId, ...profileData } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const result = await setupMitraProfile(userId, profileData);
    
    return res.status(201).json({
      success: true,
      message: 'Profil mitra berhasil disimpan, menunggu approval admin.',
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


export const CloseAndOpen = async (req, res) => {
  try {
    const { id } = req.params;
    const { isManualClosed, manualCloseReason } = req.body;

    const result = await manualCloseAndOpen(id, isManualClosed, manualCloseReason);

    return res.status(200).json({
      success: true,
      message: `Status mitra berhasil diubah menjadi ${isManualClosed ? 'Tutup' : 'Buka'}`,
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

export const OperatingHours = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, openTime, closeTime, isOpen } = req.body;

    const result = await operatingHours(id, day, openTime, closeTime, isOpen);

    return res.status(200).json({
      success: true,
      message: "Berhasil menambahkan jam operasional",
      data: result
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

export const addPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { isMain, caption } = req.body;
    let photoUrl = '';

    if (req.file) {
      photoUrl = `/img/mitra/${req.file.filename}`;
    } else if (req.body.photoUrl) {
      photoUrl = req.body.photoUrl;
    }

    if (!photoUrl) {
      return res.status(400).json({ success: false, message: "Pilih foto untuk diunggah" });
    }

    // Jika set ke isMain, ubah foto lama menjadi bukan main
    const isMainBool = isMain === 'true' || isMain === true;
    if (isMainBool) {
      await prisma.mitraPhoto.updateMany({
        where: { mitraId: id },
        data: { isMain: false }
      });
    }

    const result = await prisma.mitraPhoto.create({
      data: {
        mitraId: id,
        photoUrl,
        isMain: isMainBool,
        caption
      }
    });

    return res.status(201).json({
      success: true,
      message: "Berhasil menambahkan foto",
      data: result
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

export const deletePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    await prisma.mitraPhoto.delete({
      where: { id: photoId }
    });
    return res.status(200).json({
      success: true,
      message: "Berhasil menghapus foto"
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { shopName, address, description, latitude, longitude, npwp } = req.body;

    const result = await prisma.mitraProfile.update({
      where: { id: id },
      data: {
        shopName,
        address,
        description,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        npwp
      },
      include: {
        user: true
      }
    });

    // Update user info if name or password provided
    const userUpdateData = {}
    if (req.body.name) userUpdateData.name = req.body.name
    if (req.body.password) {
      userUpdateData.password = await bcrypt.hash(req.body.password, 10)
    }

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: result.userId },
        data: userUpdateData
      })
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil memperbarui profil mitra",
      data: result
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

export const getAllMitra = async (req, res) => {
  try {
    const mitras = await prisma.mitraProfile.findMany({
      where: { approvalStatus: 'APPROVED' },
      include: {
        photos: true,
        units: {
          select: { pricePerHour: true }
        },
        reviews: {
          select: { rating: true }
        }
      }
    })
    
    // Calculate stats for each mitra
    const formattedMitras = mitras.map(mitra => {
      const prices = mitra.units.map(u => parseFloat(u.pricePerHour))
      const reviewsCount = mitra.reviews.length
      const avgRating = reviewsCount > 0 
        ? mitra.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount 
        : 0

      return {
        ...mitra,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        reviewsCount,
        avgRating: parseFloat(avgRating.toFixed(1))
      }
    })

    return res.status(200).json({
      success: true,
      data: formattedMitras
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const getMitraById = async (req, res) => {
  try {
    const { id } = req.params
    const mitra = await prisma.mitraProfile.findUnique({
      where: { id: id },
      include: {
        photos: true,
        units: true,
        snacks: true,
        operatingHours: true,
        reviews: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (mitra) {
      const reviewsCount = mitra.reviews.length
      const avgRating = reviewsCount > 0 
        ? mitra.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount 
        : 0
      
      mitra.avgRating = parseFloat(avgRating.toFixed(1))
      mitra.reviewsCount = reviewsCount
    }

    if (!mitra) {
      return res.status(404).json({
        success: false,
        message: 'Mitra tidak ditemukan'
      })
    }

    return res.status(200).json({
      success: true,
      data: mitra
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId
    const mitra = await prisma.mitraProfile.findUnique({
      where: { userId: userId },
      include: {
        units: true,
        bookings: {
          select: { totalPrice: true, status: true }
        }
      }
    })

    if (!mitra) {
      return res.status(404).json({ success: false, message: 'Mitra not found' })
    }

    const totalRevenue = mitra.bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0)
    
    const activeUnits = mitra.units.filter(u => u.isAvailable).length

    return res.status(200).json({
      success: true,
      data: {
        mitraId: mitra.id,
        totalBookings: mitra.bookings.length,
        totalRevenue,
        activeUnits: `${activeUnits}/${mitra.units.length}`,
        approvalStatus: mitra.approvalStatus,
        rejectionReason: mitra.rejectionReason
      }
    })

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const getAdminStats = async (req, res) => {
  try {
    const totalMitra = await prisma.mitraProfile.count()
    const activeMitra = await prisma.mitraProfile.count({ where: { approvalStatus: 'APPROVED' } })
    const pendingMitra = await prisma.mitraProfile.count({ where: { approvalStatus: 'PENDING' } })
    const totalBookings = await prisma.booking.count()

    return res.status(200).json({
      success: true,
      data: {
        totalMitra,
        activeMitra,
        pendingMitra,
        totalBookings
      }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const getMitrasByStatus = async (req, res) => {
  try {
    const { status } = req.query
    const mitras = await prisma.mitraProfile.findMany({
      where: status ? { approvalStatus: status } : {},
      include: {
        user: { select: { name: true, email: true } },
        photos: true
      }
    })

    return res.status(200).json({
      success: true,
      data: mitras
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}