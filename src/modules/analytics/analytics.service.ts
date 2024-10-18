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

    // Dapatkan tanggal 6 bulan yang lalu
    const sixMonthsAgo = subMonths(currentDate, 5); // 5 bulan + bulan ini = 6 bulan

    // Menggunakan groupBy untuk mengelompokkan data berdasarkan bulan
    const monthlyReports = await this.prisma.contents.groupBy({
      by: ['created_at'],
      where: {
        type: 'PklReport',
        created_at: {
          gte: startOfMonth(sixMonthsAgo), // Mulai dari awal 6 bulan yang lalu
          lte: endOfMonth(currentDate), // Hingga akhir bulan ini
        },
      },
      _count: {
        _all: true,
      },
    });

    // Mengubah hasil groupBy untuk memformat data per bulan
    const monthlyStats = [];
    for (let i = 0; i < 6; i++) {
      const targetMonth = subMonths(currentDate, i);
      const startOfTargetMonth = startOfMonth(targetMonth);
      const endOfTargetMonth = endOfMonth(targetMonth);

      // Temukan laporan di bulan target
      const reportsInMonth = monthlyReports.filter((report) => {
        const reportDate = new Date(report.created_at);
        return (
          reportDate >= startOfTargetMonth && reportDate <= endOfTargetMonth
        );
      });

      // Hitung jumlah laporan di bulan tersebut
      const reportCount = reportsInMonth.reduce(
        (acc, report) => acc + report._count._all,
        0,
      );

      // Masukkan data ke dalam array
      monthlyStats.unshift({
        month: targetMonth.toLocaleString('default', { month: 'long' }),
        count: reportCount,
      });
    }

    return {
      lastSixMonthsReports: monthlyStats,
    };
  }

  async getFeedbackStats() {
    const currentDate = new Date();

    const commentTotal = await this.prisma.comments.count();
    const likeTotal = await this.prisma.likes.count();

    // Dapatkan semua data comment dan like selama 3 bulan terakhir
    const commentsData = await this.prisma.comments.groupBy({
      by: ['created_at'],
      _count: true,
      where: {
        created_at: {
          gte: subDays(currentDate, 90), // 90 hari terakhir
          lte: currentDate,
        },
      },
    });

    const likesData = await this.prisma.likes.groupBy({
      by: ['created_at'],
      _count: true,
      where: {
        created_at: {
          gte: subDays(currentDate, 90),
          lte: currentDate,
        },
      },
    });

    // Buat map untuk agregasi berdasarkan tanggal
    const commentMap = new Map();
    const likeMap = new Map();

    // Agregasi comments berdasarkan tanggal
    commentsData.forEach((comment) => {
      const date = comment.created_at.toISOString().split('T')[0]; // format YYYY-MM-DD
      const currentCount = commentMap.get(date) || 0;
      commentMap.set(date, currentCount + comment._count);
    });

    // Agregasi likes berdasarkan tanggal
    likesData.forEach((like) => {
      const date = like.created_at.toISOString().split('T')[0];
      const currentCount = likeMap.get(date) || 0;
      likeMap.set(date, currentCount + like._count);
    });

    // Format hasil akhir sebagai array untuk frontend
    const dailyCommentStats = Array.from(commentMap.entries()).map(
      ([date, count]) => ({
        date,
        count,
      }),
    );

    const dailyLikeStats = Array.from(likeMap.entries()).map(
      ([date, count]) => ({
        date,
        count,
      }),
    );

    return {
      lastThreeMonthsComment: dailyCommentStats,
      lastThreeMonthsLike: dailyLikeStats,
      commentTotal,
      likeTotal,
    };
  }
}
