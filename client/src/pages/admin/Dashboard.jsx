import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetPurchasedCoursesQuery } from '@/features/api/purchaseApi';
import React from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";

// Custom Tooltip component - defined outside main component to avoid recreation on each render
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 shadow-lg border border-gray-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
                <p className="text-lg font-bold text-blue-600">
                    ₹{payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

const Dashboard = () => {
    const { data, isLoading, isError } = useGetPurchasedCoursesQuery();

    if (isLoading) return <h1>Loading....</h1>;
    if (isError) return <h1 className='text-red-600'>Failed to load purchased course</h1>;

    // Handle both possible response structures
    const purchasedCourse = data?.purchasedCourse || data?.purchasedCourses || data?.courses || [];

    const courseData = purchasedCourse.map((purchase) => ({
        name: purchase.course?.courseTitle || "",
        price: purchase.course?.coursePrice || 0,
    }));

    const totalSales = purchasedCourse.length;

    const totalRevenue = purchasedCourse.reduce(
        (acc, purchase) => acc + (purchase.course?.coursePrice || 0),
        0
    );

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                    Dashboard
                </h1>

                <p className="text-sm md:text-base text-muted-foreground">
                    Monitor your course sales and revenue.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">

                {/* Total Sales */}
                <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all">
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            Total Sales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl md:text-4xl font-bold text-blue-600">
                            {totalSales}
                        </p>
                    </CardContent>
                </Card>

                {/* Total Revenue */}
                <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all">
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl md:text-4xl font-bold text-blue-600">
                            ₹{totalRevenue.toLocaleString("en-IN")}
                        </p>
                    </CardContent>
                </Card>

            </div>

            {/* Chart */}
            <div className="mt-6 mb-0">
                <Card className="rounded-2xl border shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-800">
                                    Course Revenue Overview
                                </CardTitle>
                                <p className="text-sm text-gray-500 mt-1">
                                    Price comparison across all courses
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                                    <span className="text-xs text-gray-600">Price</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto"> </div>
                        <div className="min-w-[500px] lg:min-w-0"></div>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={courseData}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    stroke="#6b7280"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: "#e5e7eb" }}
                                    angle={-20}
                                    textAnchor="end"
                                    interval={0}
                                    height={80}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={12}
                                    tick={{ fill: '#6b7280' }}
                                    tickLine={false}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;