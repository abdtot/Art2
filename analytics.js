// ============================================
// نظام الإحصائيات والتقارير
// ============================================

class AnalyticsManager {
    constructor() {
        this.charts = new Map();
        this.statistics = {};
        this.reports = [];
        this.init();
    }

    init() {
        this.loadData();
        this.initCharts();
        this.updateDashboardStats();
    }

    loadData() {
        // تحميل الإحصائيات من localStorage
        const storedStats = localStorage.getItem('pixelArtAnalytics');
        this.statistics = storedStats ? JSON.parse(storedStats) : this.getSampleStatistics();
        
        const storedReports = localStorage.getItem('pixelArtReports');
        this.reports = storedReports ? JSON.parse(storedReports) : this.getSampleReports();
    }

    saveData() {
        localStorage.setItem('pixelArtAnalytics', JSON.stringify(this.statistics));
        localStorage.setItem('pixelArtReports', JSON.stringify(this.reports));
    }

    initCharts() {
        // تهيئة مخططات Chart.js
        this.initRevenueChart();
        this.initProjectsChart();
        this.initDesignersChart();
        this.initCategoriesChart();
    }

    initRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                datasets: [{
                    label: 'الإيرادات',
                    data: [1200, 1900, 1500, 2500, 2200, 3000],
                    borderColor: '#0a9396',
                    backgroundColor: 'rgba(10, 147, 150, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `الإيرادات: ${context.parsed.y} ريال`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `${value} ريال`
                        }
                    }
                }
            }
        });
        
        this.charts.set('revenue', chart);
    }

    initProjectsChart() {
        const ctx = document.getElementById('projectsChart');
        if (!ctx) return;
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['مكتملة', 'نشطة', 'قيد الانتظار', 'متأخرة'],
                datasets: [{
                    data: [15, 8, 5, 2],
                    backgroundColor: [
                        '#2a9d8f',
                        '#0a9396',
                        '#ee9b00',
                        '#e76f51'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
        
        this.charts.set('projects', chart);
    }

    initDesignersChart() {
        const ctx = document.getElementById('designersChart');
        if (!ctx) return;
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['أحمد', 'سارة', 'خالد', 'نور', 'محمد'],
                datasets: [{
                    label: 'عدد المشاريع',
                    data: [12, 8, 15, 7, 10],
                    backgroundColor: '#94d2bd',
                    borderColor: '#0a9396',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
        
        this.charts.set('designers', chart);
    }

    initCategoriesChart() {
        const ctx = document.getElementById('categoriesChart');
        if (!ctx) return;
        
        const chart = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ['شعارات', 'إعلانات', 'هويات', 'بروشورات', 'مواقع'],
                datasets: [{
                    data: [35, 25, 20, 15, 5],
                    backgroundColor: [
                        '#0a9396',
                        '#94d2bd',
                        '#ee9b00',
                        '#ca6702',
                        '#9b2226'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
        
        this.charts.set('categories', chart);
    }

    updateDashboardStats() {
        this.calculateDashboardStats();
        this.updateStatsDisplay();
    }

    calculateDashboardStats() {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        
        // إحصائيات المشاريع
        this.statistics.projects = {
            total: 30,
            completed: 15,
            active: 8,
            pending: 5,
            late: 2,
            completionRate: 75
        };
        
        // إحصائيات المالية
        this.statistics.financial = {
            revenue: 12850,
            expenses: 8550,
            profit: 4300,
            growth: 15.5
        };
        
        // إحصائيات المستخدمين
        this.statistics.users = {
            total: 150,
            designers: 25,
            clients: 125,
            active: 120,
            growth: 8.2
        };
        
        // إحصائيات التصاميم
        this.statistics.designs = {
            total: 245,
            published: 200,
            drafts: 45,
            averageRating: 4.7,
            topCategory: 'شعارات'
        };
        
        this.saveData();
    }

    updateStatsDisplay() {
        // تحديث إحصائيات لوحة التحكم
        const statsElements = {
            'activeProjects': this.statistics.projects.active,
            'walletBalance': `ر.س ${this.statistics.financial.revenue.toLocaleString('ar-SA')}`,
            'pendingProjects': this.statistics.projects.pending,
            'userRating': this.statistics.designs.averageRating
        };
        
        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // تحديث المخططات
        this.updateCharts();
    }

    updateCharts() {
        // تحديث بيانات المخططات
        this.charts.forEach((chart, type) => {
            switch(type) {
                case 'revenue':
                    chart.data.datasets[0].data = [
                        this.statistics.financial.revenue * 0.2,
                        this.statistics.financial.revenue * 0.3,
                        this.statistics.financial.revenue * 0.25,
                        this.statistics.financial.revenue * 0.4,
                        this.statistics.financial.revenue * 0.35,
                        this.statistics.financial.revenue * 0.45
                    ];
                    break;
                    
                case 'projects':
                    chart.data.datasets[0].data = [
                        this.statistics.projects.completed,
                        this.statistics.projects.active,
                        this.statistics.projects.pending,
                        this.statistics.projects.late
                    ];
                    break;
            }
            
            chart.update();
        });
    }

    generateReport(type, period) {
        const report = {
            id: Date.now(),
            type,
            period,
            date: new Date().toISOString(),
            data: this.getReportData(type, period)
        };
        
        this.reports.unshift(report);
        this.saveData();
        
        return report;
    }

    getReportData(type, period) {
        switch(type) {
            case 'financial':
                return this.generateFinancialReport(period);
            case 'projects':
                return this.generateProjectsReport(period);
            case 'designers':
                return this.generateDesignersReport(period);
            default:
                return {};
        }
    }

    generateFinancialReport(period) {
        return {
            revenue: this.statistics.financial.revenue,
            expenses: this.statistics.financial.expenses,
            profit: this.statistics.financial.profit,
            growth: this.statistics.financial.growth,
            topEarningProjects: this.getTopEarningProjects(),
            paymentMethods: this.getPaymentMethodsDistribution()
        };
    }

    generateProjectsReport(period) {
        return {
            total: this.statistics.projects.total,
            completed: this.statistics.projects.completed,
            active: this.statistics.projects.active,
            completionRate: this.statistics.projects.completionRate,
            averageDuration: 14, // أيام
            topCategories: this.getProjectCategories(),
            successRate: 92 // نسبة نجاح المشاريع
        };
    }

    generateDesignersReport(period) {
        return {
            total: this.statistics.users.designers,
            active: 20,
            averageRating: 4.6,
            topPerformers: this.getTopPerformers(),
            averageProjects: 8.5,
            satisfactionRate: 95
        };
    }

    getTopEarningProjects() {
        return [
            { name: 'هوية بصرية لشركة', amount: 2500 },
            { name: 'تصميم موقع إلكتروني', amount: 1800 },
            { name: 'حملة إعلانية', amount: 1500 },
            { name: 'تصميم تطبيق', amount: 3200 },
            { name: 'شعار ومطبوعات', amount: 1200 }
        ];
    }

    getPaymentMethodsDistribution() {
        return [
            { method: 'بطاقات ائتمان', percentage: 60 },
            { method: 'تحويل بنكي', percentage: 25 },
            { method: 'محفظة إلكترونية', percentage: 15 }
        ];
    }

    getProjectCategories() {
        return [
            { category: 'شعارات', count: 35 },
            { category: 'إعلانات', count: 25 },
            { category: 'هويات', count: 20 },
            { category: 'بروشورات', count: 15 },
            { category: 'مواقع', count: 5 }
        ];
    }

    getTopPerformers() {
        return [
            { name: 'أحمد المصمم', projects: 12, rating: 4.8 },
            { name: 'سارة المصممة', projects: 8, rating: 4.7 },
            { name: 'خالد المصمم', projects: 15, rating: 4.9 },
            { name: 'نور المصممة', projects: 7, rating: 4.6 },
            { name: 'محمد المصمم', projects: 10, rating: 4.5 }
        ];
    }

    getSampleStatistics() {
        return {
            projects: {
                total: 30,
                completed: 15,
                active: 8,
                pending: 5,
                late: 2,
                completionRate: 75
            },
            financial: {
                revenue: 12850,
                expenses: 8550,
                profit: 4300,
                growth: 15.5
            },
            users: {
                total: 150,
                designers: 25,
                clients: 125,
                active: 120,
                growth: 8.2
            },
            designs: {
                total: 245,
                published: 200,
                drafts: 45,
                averageRating: 4.7,
                topCategory: 'شعارات'
            }
        };
    }

    getSampleReports() {
        return [
            {
                id: 1,
                type: 'financial',
                period: 'شهري',
                date: '2024-02-01T10:30:00Z',
                data: {
                    revenue: 12850,
                    expenses: 8550,
                    profit: 4300
                }
            },
            {
                id: 2,
                type: 'projects',
                period: 'ربع سنوي',
                date: '2024-01-15T14:20:00Z',
                data: {
                    total: 45,
                    completed: 30,
                    active: 10
                }
            }
        ];
    }
}

// تهيئة مدير الإحصائيات
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();
});
