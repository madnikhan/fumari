import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'today';

    const now = new Date();
    let startDate: Date;

    switch (range) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
    }

    // Get all orders
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        status: {
          in: ['completed', 'served'],
        },
      },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Today's metrics
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(
      (order) => order.createdAt >= todayStart
    );
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

    // Popular items
    const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.menuItem.name;
        const existing = itemMap.get(key) || { name: key, quantity: 0, revenue: 0 };
        itemMap.set(key, {
          name: key,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.price * item.quantity,
        });
      });
    });

    const popularItems = Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Hourly sales
    const hourlyMap = new Map<number, { revenue: number; orders: number }>();
    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, { revenue: 0, orders: 0 });
    }

    orders.forEach((order) => {
      const hour = order.createdAt.getHours();
      const existing = hourlyMap.get(hour) || { revenue: 0, orders: 0 };
      hourlyMap.set(hour, {
        revenue: existing.revenue + order.total,
        orders: existing.orders + 1,
      });
    });

    const hourlySales = Array.from(hourlyMap.entries())
      .map(([hour, data]) => ({ hour, ...data }))
      .sort((a, b) => a.hour - b.hour);

    // Category revenue breakdown
    const categoryMap = new Map<string, { name: string; revenue: number; orders: number }>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const categoryName = item.menuItem.category?.name || 'Other';
        const existing = categoryMap.get(categoryName) || { name: categoryName, revenue: 0, orders: 0 };
        categoryMap.set(categoryName, {
          name: categoryName,
          revenue: existing.revenue + item.price * item.quantity,
          orders: existing.orders + item.quantity,
        });
      });
    });

    const categoryRevenue = Array.from(categoryMap.values())
      .sort((a, b) => b.revenue - a.revenue);

    // Daily sales (for line chart)
    const dailyMap = new Map<string, { date: string; revenue: number; orders: number }>();
    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey) || { date: dateKey, revenue: 0, orders: 0 };
      dailyMap.set(dateKey, {
        date: dateKey,
        revenue: existing.revenue + order.total,
        orders: existing.orders + 1,
      });
    });

    const dailySales = Array.from(dailyMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // Last 7 days

    return NextResponse.json({
      totalRevenue,
      todayRevenue,
      totalOrders,
      todayOrders: todayOrders.length,
      averageOrderValue,
      popularItems,
      hourlySales,
      categoryRevenue,
      dailySales,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

