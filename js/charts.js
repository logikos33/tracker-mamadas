// Charts Module for Tracker de Mamadas
// Handles rendering and updating all charts using Chart.js

class ChartsManager {
    constructor() {
        this.charts = {};
        this.currentPeriod = 7; // Default to 7 days
    }

    // Initialize all charts
    init() {
        this.initDistributionChart();
        this.initTemporalLineChart();
        this.initTemporalBarChart();
        this.initAreaChart();
    }

    // Initialize distribution doughnut chart
    initDistributionChart() {
        const ctx = document.getElementById('feedChart');
        if (!ctx) return;

        this.charts.distribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Leite Materno', 'Fórmula'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#1976d2', '#f57c00'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                family: 'Poppins',
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Distribuição por Tipo',
                        font: {
                            family: 'Poppins',
                            size: 16,
                            weight: '600'
                        },
                        padding: {
                            bottom: 20
                        }
                    }
                }
            }
        });
    }

    // Initialize temporal line chart (feeds per day)
    initTemporalLineChart() {
        const ctx = document.getElementById('lineChart');
        if (!ctx) return;

        this.charts.line = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Leite Materno',
                        data: [],
                        borderColor: '#1976d2',
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Fórmula',
                        data: [],
                        borderColor: '#f57c00',
                        backgroundColor: 'rgba(245, 124, 0, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Total',
                        data: [],
                        borderColor: '#9c27b0',
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        tension: 0.4,
                        fill: false,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Poppins',
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Mamadas por Dia',
                        font: {
                            family: 'Poppins',
                            size: 16,
                            weight: '600'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: {
                                family: 'Poppins'
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Poppins'
                            }
                        }
                    }
                }
            }
        });
    }

    // Initialize temporal bar chart (duration per day)
    initTemporalBarChart() {
        const ctx = document.getElementById('barChart');
        if (!ctx) return;

        this.charts.bar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Leite Materno (min)',
                        data: [],
                        backgroundColor: 'rgba(25, 118, 210, 0.8)',
                        borderRadius: 5
                    },
                    {
                        label: 'Fórmula (min)',
                        data: [],
                        backgroundColor: 'rgba(245, 124, 0, 0.8)',
                        borderRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Poppins',
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Tempo Total de Alimentação por Dia',
                        font: {
                            family: 'Poppins',
                            size: 16,
                            weight: '600'
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            font: {
                                family: 'Poppins'
                            }
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            font: {
                                family: 'Poppins'
                            }
                        }
                    }
                }
            }
        });
    }

    // Initialize area chart (average duration)
    initAreaChart() {
        const ctx = document.getElementById('areaChart');
        if (!ctx) return;

        this.charts.area = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Média de Duração (min)',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.3)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Poppins',
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Média de Duração por Dia',
                        font: {
                            family: 'Poppins',
                            size: 16,
                            weight: '600'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                family: 'Poppins'
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Poppins'
                            }
                        }
                    }
                }
            }
        });
    }

    // Update distribution chart with today's data
    updateDistributionChart(feeds) {
        if (!this.charts.distribution) return;

        const maternoCount = feeds.filter(f => f.type === FEED_TYPES.MATERNO).length;
        const formulaCount = feeds.filter(f => f.type === FEED_TYPES.FORMULA).length;

        this.charts.distribution.data.datasets[0].data = [maternoCount, formulaCount];
        this.charts.distribution.update();
    }

    // Update temporal charts with grouped data
    updateTemporalCharts(groupedData) {
        if (!groupedData || groupedData.length === 0) {
            console.warn('No data to update temporal charts');
            return;
        }

        const labels = groupedData.map(d => this.formatDateLabel(d.date));
        const maternoData = groupedData.map(d => d.maternoCount);
        const formulaData = groupedData.map(d => d.formulaCount);
        const totalData = groupedData.map(d => d.count);
        const avgData = groupedData.map(d => d.count > 0 ? Math.round(d.totalDuration / d.count) : 0);

        // Calculate duration data for bar chart
        const maternoDuration = groupedData.map(d => {
            // Estimate: assume avg materno feed is 20 min
            return d.maternoCount * 20;
        });
        const formulaDuration = groupedData.map(d => {
            // Estimate: assume avg formula feed is 15 min
            return d.formulaCount * 15;
        });

        // Update line chart
        if (this.charts.line) {
            this.charts.line.data.labels = labels;
            this.charts.line.data.datasets[0].data = maternoData;
            this.charts.line.data.datasets[1].data = formulaData;
            this.charts.line.data.datasets[2].data = totalData;
            this.charts.line.update();
        }

        // Update bar chart
        if (this.charts.bar) {
            this.charts.bar.data.labels = labels;
            this.charts.bar.data.datasets[0].data = maternoDuration;
            this.charts.bar.data.datasets[1].data = formulaDuration;
            this.charts.bar.update();
        }

        // Update area chart
        if (this.charts.area) {
            this.charts.area.data.labels = labels;
            this.charts.area.data.datasets[0].data = avgData;
            this.charts.area.update();
        }
    }

    // Format date label for charts
    formatDateLabel(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit'
        });
    }

    // Set current period and update charts
    setPeriod(days) {
        this.currentPeriod = days;
    }

    // Get current period
    getPeriod() {
        return this.currentPeriod;
    }

    // Destroy all charts
    destroyAll() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}

// Create global charts instance
const chartsManager = new ChartsManager();
