import prisma from '../prisma/client.js'

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
    if (name) {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { name }
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
