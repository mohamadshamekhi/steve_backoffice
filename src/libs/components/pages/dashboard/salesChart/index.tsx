'use client';

import type ApexCharts from 'apexcharts';
import Chart from 'libs/components/common/ApexChartClient';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
type ApexOptions = ApexCharts.ApexOptions;

const options: ApexOptions = {
    colors: ['#465fff'],
    chart: {
        fontFamily: 'var(--font-Vazir)',
        type: 'bar',
        height: 180,
        toolbar: {
            show: false
        }
    },
    plotOptions: {
        bar: {
            horizontal: false,
            // columnWidth: '39%',
            borderRadius: 5,
            borderRadiusApplication: 'end'
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        show: true,
        width: 3,
        colors: ['transparent']
    },
    xaxis: {
        categories: [
            'فروردین',
            'اردیبهشت',
            'خرداد',
            'تیر',
            'مرداد',
            'شهریور',
            'مهر',
            'آبان',
            'آذر',
            'دی',
            'بهمن',
            'اسفند'
        ],
        labels: {
            show: true,
            trim: false,
            style: {
                fontSize: '11px'
            }
        },
        axisBorder: {
            show: false
        },
        axisTicks: {
            show: false
        }
    },
    legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        fontFamily: 'Outfit'
    },
    yaxis: {
        title: {
            text: undefined
        }
    },
    grid: {
        yaxis: {
            lines: {
                show: true
            }
        }
    },
    fill: {
        opacity: 1
    },

    tooltip: {
        x: {
            show: false
        },
        y: {
            formatter: (val: number) => `${val}`
        }
    }
};

const series = [
    {
        name: 'فروش',
        data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112]
    }
];

const SalesChart: React.FC = () => {
    return (
        <ContentWrapper title='نمودار فروش'>
            <div className='custom-scrollbar max-w-full overflow-x-auto'>
                <div id='chartOne' className='rtl-chart'>
                    <Chart options={options} series={series} type='bar' height={180} />
                </div>
            </div>
        </ContentWrapper>
    );
};

export default SalesChart;
