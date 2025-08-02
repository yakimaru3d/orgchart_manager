'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Users,
  Calendar,
  Building
} from 'lucide-react';

export default function ReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState('overview');
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  const reportTypes = [
    { value: 'overview', label: 'Organization Overview', icon: BarChart3 },
    { value: 'demographics', label: 'Employee Demographics', icon: PieChart },
    { value: 'department', label: 'Department Analysis', icon: Building },
    { value: 'growth', label: 'Growth Trends', icon: TrendingUp },
  ];

  const formats = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV File' },
  ];

  const quickStats = [
    { label: 'Total Employees', value: '247', change: '+12', changeType: 'increase' },
    { label: 'Active Departments', value: '8', change: '+2', changeType: 'increase' },
    { label: 'Management Positions', value: '24', change: '+3', changeType: 'increase' },
    { label: 'Average Tenure', value: '3.2 years', change: '+0.5', changeType: 'increase' },
  ];

  const recentReports = [
    {
      name: 'Q4 2024 Organization Overview',
      type: 'PDF',
      date: '2024-01-15',
      size: '2.4 MB',
    },
    {
      name: 'Department Headcount Analysis',
      type: 'Excel',
      date: '2024-01-10',
      size: '856 KB',
    },
    {
      name: 'Employee Demographics Report',
      type: 'PDF',
      date: '2024-01-05',
      size: '1.8 MB',
    },
  ];

  const handleGenerateReport = () => {
    // In a real app, this would generate and download the report
    console.log(`Generating ${selectedReportType} report in ${selectedFormat} format`);
  };

  const handleDownloadReport = (reportName: string) => {
    // In a real app, this would download the specific report
    console.log(`Downloading: ${reportName}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">
            Generate insights and export organizational data
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      <Badge 
                        variant={stat.changeType === 'increase' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {stat.change}
                      </Badge>
                      <span className="text-xs text-gray-500 ml-2">vs last month</span>
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Generator */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Generate New Report</CardTitle>
                <CardDescription>
                  Create custom reports based on your organizational data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Report Type</label>
                    <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              <type.icon className="h-4 w-4" />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Export Format</label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {formats.map(format => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Report Preview/Description */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Report Description</h4>
                  {selectedReportType === 'overview' && (
                    <p className="text-sm text-gray-600">
                      Comprehensive overview of your organization including headcount, 
                      department distribution, management structure, and key metrics.
                    </p>
                  )}
                  {selectedReportType === 'demographics' && (
                    <p className="text-sm text-gray-600">
                      Detailed analysis of employee demographics including age distribution, 
                      tenure analysis, skill distribution, and diversity metrics.
                    </p>
                  )}
                  {selectedReportType === 'department' && (
                    <p className="text-sm text-gray-600">
                      Department-wise breakdown showing headcount, growth trends, 
                      organizational levels, and performance indicators.
                    </p>
                  )}
                  {selectedReportType === 'growth' && (
                    <p className="text-sm text-gray-600">
                      Historical analysis of organizational growth including hiring trends, 
                      department expansion, and projected growth patterns.
                    </p>
                  )}
                </div>

                <Button onClick={handleGenerateReport} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>
                  Previously generated reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentReports.map((report, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{report.name}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{report.type}</span>
                          <span>•</span>
                          <span>{report.size}</span>
                          <span>•</span>
                          <span>{new Date(report.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadReport(report.name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Employee Directory Export
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Building className="mr-2 h-4 w-4" />
                  Department Structure Export
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Monthly Summary Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytics Dashboard Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>
              Key metrics and trends at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium">Department Growth</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Engineering</span>
                    <span className="text-green-600">+15%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Marketing</span>
                    <span className="text-green-600">+8%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sales</span>
                    <span className="text-green-600">+12%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Average Tenure by Level</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Directors</span>
                    <span>5.2 years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Managers</span>
                    <span>3.8 years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Individual Contributors</span>
                    <span>2.4 years</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recent Hiring</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span>12 new hires</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Month</span>
                    <span>8 new hires</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Two Months Ago</span>
                    <span>15 new hires</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}