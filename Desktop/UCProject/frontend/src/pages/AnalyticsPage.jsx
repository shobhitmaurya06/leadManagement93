import React, { useMemo, useState } from 'react';
import { useLeads } from '../contexts/LeadContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Download, TrendingUp, DollarSign, Users, Target, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'sonner';

export const AnalyticsPage = () => {
  const { leads } = useLeads();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());

  // Filter leads by date range
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= startDate && leadDate <= endDate;
    });
  }, [leads, startDate, endDate]);

  // Source Performance
  const sourcePerformance = useMemo(() => {
    const sources = {};
    filteredLeads.forEach(lead => {
      if (!sources[lead.source]) {
        sources[lead.source] = { total: 0, converted: 0, value: 0 };
      }
      sources[lead.source].total++;
      if (lead.status === 'Converted') {
        sources[lead.source].converted++;
        sources[lead.source].value += lead.value;
      }
    });

    return Object.entries(sources).map(([name, data]) => ({
      name,
      total: data.total,
      converted: data.converted,
      conversionRate: ((data.converted / data.total) * 100).toFixed(1),
      value: data.value
    })).sort((a, b) => b.total - a.total);
  }, [filteredLeads]);

  // Campaign Performance
  const campaignPerformance = useMemo(() => {
    const campaigns = {};
    filteredLeads.forEach(lead => {
      if (!campaigns[lead.campaign]) {
        campaigns[lead.campaign] = { total: 0, converted: 0, value: 0 };
      }
      campaigns[lead.campaign].total++;
      if (lead.status === 'Converted') {
        campaigns[lead.campaign].converted++;
        campaigns[lead.campaign].value += lead.value;
      }
    });

    return Object.entries(campaigns).map(([name, data]) => ({
      name,
      leads: data.total,
      converted: data.converted,
      revenue: data.value
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredLeads]);

  // Daily Trend
  const dailyTrend = useMemo(() => {
    const days = {};
    filteredLeads.forEach(lead => {
      const date = new Date(lead.createdAt).toLocaleDateString();
      if (!days[date]) {
        days[date] = { new: 0, contacted: 0, converted: 0 };
      }
      if (lead.status === 'New') days[date].new++;
      else if (lead.status === 'Contacted') days[date].contacted++;
      else if (lead.status === 'Converted') days[date].converted++;
    });

    return Object.entries(days)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-14); // Last 14 days
  }, [filteredLeads]);

  // Status Funnel
  const statusFunnel = useMemo(() => {
    const statuses = {};
    filteredLeads.forEach(lead => {
      statuses[lead.status] = (statuses[lead.status] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [filteredLeads]);

  // Team Performance
  const teamPerformance = useMemo(() => {
    const team = {};
    filteredLeads.forEach(lead => {
      if (lead.assignedTo !== 'Unassigned') {
        if (!team[lead.assignedTo]) {
          team[lead.assignedTo] = { assigned: 0, converted: 0, value: 0 };
        }
        team[lead.assignedTo].assigned++;
        if (lead.status === 'Converted') {
          team[lead.assignedTo].converted++;
          team[lead.assignedTo].value += lead.value;
        }
      }
    });

    return Object.entries(team).map(([name, data]) => ({
      name,
      assigned: data.assigned,
      converted: data.converted,
      conversionRate: ((data.converted / data.assigned) * 100).toFixed(1),
      value: data.value
    }));
  }, [filteredLeads]);

  // Summary Stats
  const stats = useMemo(() => {
    const converted = filteredLeads.filter(l => l.status === 'Converted');
    const totalValue = converted.reduce((sum, lead) => sum + lead.value, 0);
    const avgValue = converted.length > 0 ? totalValue / converted.length : 0;
    const conversionRate = filteredLeads.length > 0 
      ? (converted.length / filteredLeads.length * 100).toFixed(1)
      : 0;

    return {
      totalLeads: filteredLeads.length,
      converted: converted.length,
      conversionRate,
      totalValue,
      avgValue
    };
  }, [filteredLeads]);

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  const exportReport = () => {
    const reportData = [
      { metric: 'Total Leads', value: stats.totalLeads },
      { metric: 'Converted Leads', value: stats.converted },
      { metric: 'Conversion Rate', value: `${stats.conversionRate}%` },
      { metric: 'Total Revenue', value: `$${stats.totalValue.toLocaleString()}` },
      { metric: 'Average Deal Value', value: `$${Math.round(stats.avgValue).toLocaleString()}` },
    ];

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Summary');

    const wsSource = XLSX.utils.json_to_sheet(sourcePerformance);
    XLSX.utils.book_append_sheet(wb, wsSource, 'Source Performance');

    const wsCampaign = XLSX.utils.json_to_sheet(campaignPerformance);
    XLSX.utils.book_append_sheet(wb, wsCampaign, 'Campaign Performance');

    XLSX.writeFile(wb, `analytics_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Analytics report downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Reports</h1>
          <p className="text-muted-foreground">Track performance and generate insights</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="shadow-md-custom border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Date Range:</span>
            </div>
            <div className="flex items-center space-x-2">
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="px-3 py-2 border border-border rounded-md text-sm"
              />
              <span className="text-muted-foreground">to</span>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="px-3 py-2 border border-border rounded-md text-sm"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
                setEndDate(new Date());
              }}
            >
              Last 30 Days
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-md-custom border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalLeads}</div>
          </CardContent>
        </Card>

        <Card className="shadow-md-custom border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Converted</CardTitle>
            <Target className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.converted}</div>
          </CardContent>
        </Card>

        <Card className="shadow-md-custom border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.conversionRate}%</div>
          </CardContent>
        </Card>

        <Card className="shadow-md-custom border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ${(stats.totalValue / 1000).toFixed(0)}K
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md-custom border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Deal Value</CardTitle>
            <DollarSign className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ${(stats.avgValue / 1000).toFixed(1)}K
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-md-custom border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Source Performance</CardTitle>
            <CardDescription>Lead count by acquisition source</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourcePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="total" fill="hsl(var(--primary))" name="Total Leads" radius={[8, 8, 0, 0]} />
                <Bar dataKey="converted" fill="hsl(var(--success))" name="Converted" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md-custom border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Status Distribution</CardTitle>
            <CardDescription>Current status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusFunnel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusFunnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend */}
      <Card className="shadow-md-custom border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Lead Trend Over Time</CardTitle>
          <CardDescription>Daily lead status breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="new" stackId="1" stroke="hsl(var(--info))" fill="hsl(var(--info))" name="New" />
              <Area type="monotone" dataKey="contacted" stackId="1" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" name="Contacted" />
              <Area type="monotone" dataKey="converted" stackId="1" stroke="hsl(var(--success))" fill="hsl(var(--success))" name="Converted" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Campaign Performance */}
      <Card className="shadow-md-custom border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Campaign Performance</CardTitle>
          <CardDescription>Revenue and conversion by campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={campaignPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="leads" fill="hsl(var(--primary))" name="Total Leads" radius={[0, 8, 8, 0]} />
              <Bar dataKey="converted" fill="hsl(var(--success))" name="Converted" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Team Performance Table */}
      <Card className="shadow-md-custom border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Team Performance</CardTitle>
          <CardDescription>Individual team member metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold text-muted-foreground">Team Member</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Assigned Leads</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Converted</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Conversion Rate</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.map(member => (
                  <tr key={member.name} className="border-b border-border hover:bg-muted/50 transition-smooth">
                    <td className="p-4 font-medium text-foreground">{member.name}</td>
                    <td className="p-4 text-foreground">{member.assigned}</td>
                    <td className="p-4 text-foreground">{member.converted}</td>
                    <td className="p-4">
                      <span className="text-success font-medium">{member.conversionRate}%</span>
                    </td>
                    <td className="p-4 font-medium text-foreground">${member.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
