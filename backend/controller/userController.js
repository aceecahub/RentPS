import prisma from '../prisma/client.js'
import bcrypt from 'bcrypt'

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        userProfile: {
          select: {
            phone: true,
            address: true,
            avatarUrl: true,
            nik: true
          }
        },
        bookings: {
          select: { id: true, status: true, totalPrice: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({
      success: true,
      data: users
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Cari profil, jika tidak ada, buatkan otomatis
    let profile = await prisma.userProfile.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      }
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId: parseInt(userId)
        },
        include: {
          user: {
            select: { name: true, email: true, role: true }
          }
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { phone, address, avatarUrl, name, nik } = req.body;

    // Update profil
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: parseInt(userId) },
      update: {
        phone,
        address,
        avatarUrl,
        nik
      },
      create: {
        userId: parseInt(userId),
        phone,
        address,
        avatarUrl,
        nik
      }
    });

    // Update nama user utama jika dikirim
    const userUpdateData = {}
    if (name) userUpdateData.name = name
    if (req.body.password) {
      userUpdateData.password = await bcrypt.hash(req.body.password, 10)
    }

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: userUpdateData
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: updatedProfile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export const updateAvatar = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file yang diunggah'
      });
    }

    const avatarUrl = `/img/avatars/${req.file.filename}`;

    // Update profil
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: parseInt(userId) },
      update: {
        avatarUrl
      },
      create: {
        userId: parseInt(userId),
        avatarUrl
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Avatar berhasil diperbarui',
      data: updatedProfile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

