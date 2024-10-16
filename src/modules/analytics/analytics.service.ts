import { Injectable } from '@nestjs/common';
import {
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // Statistik Pengguna
  async getUserStats() {
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

    const totalUsers = await this.prisma.users.count();
    const activeUsersMonthly = await this.prisma.users.count({
      where: {
        updated_at: {
          gte: subMonths(new Date(), 1),
        },
      },
    });
    const activeUsersDaily = await this.prisma.users.count({
      where: {
        updated_at: {
          gte: subMonths(new Date(), 1),
        },
      },
    });

    const lastMonthActiveUsers = await this.prisma.users.count({
      where: {
        updated_at: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    });

    const yesterdayStart = startOfDay(subDays(new Date(), 1));
    const yesterdayEnd = endOfDay(subDays(new Date(), 1));

    const lastDailyActiveUsers = await this.prisma.users.count({
      where: {
        updated_at: {
          gte: yesterdayStart, // Greater than or equal (>=) tanggal mulai kemarin
          lte: yesterdayEnd, // Less than or equal (<=) tanggal akhir kemarin
        },
      },
    });

    return {
      totalUsers,
      activeUsersMonthly,
      activeUsersDaily,
      lastMonthActiveUsers,
      lastDailyActiveUsers,
    };
  }

  async getContentStats() {
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

    const totalContents = await this.prisma.contents.count();
    const popularContent = await this.prisma.likes.groupBy({
      by: ['content_id'],
      _count: {
        content_id: true,
      },
      orderBy: {
        _count: {
          content_id: 'desc',
        },
      },
      take: 5, // ambil 5 konten terpopuler berdasarkan jumlah like
    });

    const monthlyContentCreate = await this.prisma.contents.count({
      where: {
        created_at: {
          gte: subMonths(new Date(), 1),
        },
      },
    });

    const lastMonthContentCreate = await this.prisma.contents.count({
      where: {
        created_at: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    });

    const contentStats = {
      totalContents,
      popularContent,
      monthlyContent: {
        monthlyContentCreate,
        lastMonthContentCreate,
      },
    };
    return contentStats;
  }

  async getContentTypeStats() {
    const currentSixMonths = subMonths(new Date(), 6); // 6 bulan terakhir
    const previousSixMonths = subMonths(currentSixMonths, 6); // 6 bulan sebelum 6 bulan terakhir
    const contentType = {
      ebook: await this.prisma.contents.count({
        where: {
          type: 'Ebook',
          created_at: {
            gte: currentSixMonths,
          },
        },
      }),
      novel: await this.prisma.contents.count({
        where: {
          type: 'Novel',
          created_at: {
            gte: currentSixMonths,
          },
        },
      }),
      audioPodcast: await this.prisma.contents.count({
        where: {
          type: 'AudioPodcast',
          created_at: {
            gte: currentSixMonths,
          },
        },
      }),
      pklReport: await this.prisma.contents.count({
        where: {
          type: 'PklReport',
          created_at: {
            gte: currentSixMonths,
          },
        },
      }),
      videoPodcast: await this.prisma.contents.count({
        where: {
          type: 'VideoPodcast',
          created_at: {
            gte: currentSixMonths,
          },
        },
      }),
      blog: await this.prisma.contents.count({
        where: {
          type: 'Blog',
          created_at: {
            gte: currentSixMonths,
          },
        },
      }),
    };

    const contentTypeCurrent = await this.prisma.contents.count({
      where: {
        created_at: {
          gte: currentSixMonths,
        },
      },
    });

    const contentTypePrevious = await this.prisma.contents.count({
      where: {
        created_at: {
          gte: previousSixMonths,
          lt: currentSixMonths,
        },
      },
    });

    // Hitung persentase perubahan
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0; // Jika sebelumnya 0 dan sekarang lebih besar, 100%
      return ((current - previous) / previous) * 100;
    };

    const trendingStat = calculatePercentageChange(
      contentTypeCurrent,
      contentTypePrevious,
    );

    return {
      contentType,
      trendingStat,
    };
  }

  async getPklReportsStats() {
    const currentDate = new Date();

    // Array untuk menyimpan hasil data setiap bulan
    const monthlyStats = [];

    // Loop melalui setiap bulan dari 6 bulan yang lalu hingga bulan ini
    for (let i = 0; i < 6; i++) {
      const targetMonth = subMonths(currentDate, i);
      const startOfTargetMonth = startOfMonth(targetMonth);
      const endOfTargetMonth = endOfMonth(targetMonth);

      const reportCount = await this.prisma.contents.count({
        where: {
          type: 'PklReport',
          created_at: {
            gte: startOfTargetMonth,
            lte: endOfTargetMonth,
          },
        },
      });

      // Push hasil ke dalam array
      monthlyStats.unshift({
        month: targetMonth.toLocaleString('default', { month: 'long' }), // Nama bulan
        count: reportCount,
      });
    }

    return {
      lastSixMonthsReports: monthlyStats,
    };
  }
}
