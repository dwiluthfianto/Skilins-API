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

    // Mendapatkan konten terpopuler berdasarkan rata-rata rating
    const popularContent = await this.prisma.ratings.groupBy({
      by: ['content_id'],
      _avg: {
        rating_value: true,
      },
      orderBy: {
        _avg: {
          rating_value: 'desc',
        },
      },
      take: 5, // Ambil 5 konten dengan rata-rata rating tertinggi
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

    return {
      totalContents,
      popularContent,
      monthlyContent: {
        monthlyContentCreate,
        lastMonthContentCreate,
      },
    };
  }

  async getContentTypeStats() {
    const currentSixMonths = subMonths(new Date(), 6); // 6 bulan terakhir
    const previousSixMonths = subMonths(currentSixMonths, 6); // 6 bulan sebelum 6 bulan terakhir
    const contentType = {
      ebook: await this.prisma.contents.count({
        where: {
          type: 'EBOOK',
          created_at: {
            gte: currentSixMonths,
          },
        },
      }),
      novel: await this.prisma.contents.count({
        where: {
          type: 'STORY',
          created_at: {
            gte: currentSixMonths,
          },
        },
      }),
      audioPodcast: await this.prisma.contents.count({
        where: {
          type: 'AUDIO',
          created_at: {
            gte: currentSixMonths,
          },
        },
      }),
      pklReport: await this.prisma.contents.count({
        where: {
          type: 'PRAKERIN',
          created_at: {
            gte: currentSixMonths,
          },
        },
      }),
      videoPodcast: await this.prisma.contents.count({
        where: {
          type: 'VIDEO',
          created_at: {
            gte: currentSixMonths,
          },
        },
      }),
      blog: await this.prisma.contents.count({
        where: {
          type: 'BLOG',
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

  async getPrakerinStats() {
    const currentDate = new Date();

    // Dapatkan tanggal 6 bulan yang lalu
    const sixMonthsAgo = subMonths(currentDate, 5); // 5 bulan + bulan ini = 6 bulan

    // Menggunakan groupBy untuk mengelompokkan data berdasarkan bulan
    const monthlyReports = await this.prisma.contents.groupBy({
      by: ['created_at'],
      where: {
        type: 'BLOG',
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
    const ratingTotal = await this.prisma.ratings.count();

    // Mendapatkan data rating untuk periode 3 bulan terakhir
    const ratingsData = await this.prisma.ratings.groupBy({
      by: ['created_at'],
      _avg: {
        rating_value: true,
      },
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
    const ratingMap = new Map();

    // Agregasi comments berdasarkan tanggal
    const commentsData = await this.prisma.comments.groupBy({
      by: ['created_at'],
      _count: true,
      where: {
        created_at: {
          gte: subDays(currentDate, 90),
          lte: currentDate,
        },
      },
    });

    commentsData.forEach((comment) => {
      const date = comment.created_at.toISOString().split('T')[0];
      const currentCount = commentMap.get(date) || 0;
      commentMap.set(date, currentCount + comment._count);
    });

    // Agregasi rating berdasarkan tanggal
    ratingsData.forEach((rating) => {
      const date = rating.created_at.toISOString().split('T')[0];
      const currentCount = ratingMap.get(date) || 0;
      ratingMap.set(date, {
        count: currentCount + rating._count,
        avg: rating._avg.rating_value,
      });
    });

    // Format hasil akhir sebagai array untuk frontend
    const dailyCommentStats = Array.from(commentMap.entries()).map(
      ([date, count]) => ({
        date,
        count,
      }),
    );

    const dailyRatingStats = Array.from(ratingMap.entries()).map(
      ([date, data]) => ({
        date,
        count: data.count,
        averageRating: data.avg,
      }),
    );

    return {
      lastThreeMonthsComment: dailyCommentStats,
      lastThreeMonthsRating: dailyRatingStats,
      commentTotal,
      ratingTotal,
    };
  }
}
