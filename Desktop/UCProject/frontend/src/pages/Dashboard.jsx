import React, { useMemo } from 'react';
import { useLeads } from '../contexts/LeadContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Users, TrendingUp, DollarSign, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { leads } = useLeads();
  const navigate = useNavigate();

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const todayLeads = leads.filter(lead => 
      new Date(lead.createdAt).toDateString() === today.toDateString()
    );
  
    const yesterdayLeads = leads.filter(lead => 
      new Date(lead.createdAt).toDateString() === yesterday.toDateString()
    );

    const weekLeads = leads.filter(lead => 
      new Date(lead.createdAt) >= lastWeek
    );

    const converted = leads.filter(lead => lead.status === 'Converted');
    const totalValue = converted.reduce((sum, lead) => sum + lead.value, 0);
    const avgResponseTime = '2.5 hrs'; // Mock data

    const todayChange = yesterdayLeads.length > 0 
      ? ((todayLeads.length - yesterdayLeads.length) / yesterdayLeads.length * 100).toFixed(1)
      : 0;

    const conversionRate = leads.length > 0 
      ? ((converted.length / leads.length) * 100).toFixed(1)
      : 0;

    return {
      total: leads.length,
      today: todayLeads.length,
      todayChange,
      week: weekLeads.length,
      converted: converted.length,
      conversionRate,
      totalValue,
      avgResponseTime
    };
  }, [leads]);

  // Source distribution
  const sourceData = useMemo(() => {
    const sources = {};
    leads.forEach(lead => {
      sources[lead.source] = (sources[lead.source] || 0) + 1;
    });
    return Object.entries(sources).map(([name, value]) => ({ name, value }));
  }, [leads]);

  // Status distribution
  const statusData = useMemo(() => {
    const statuses = {};
    leads.forEach(lead => {
      statuses[lead.status] = (statuses[lead.status] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [leads]);

  // Leads over time (last 7 days)
  const timeData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLeads = leads.filter(lead => 
        new Date(lead.createdAt).toDateString() === date.toDateString()
      );
      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        leads: dayLeads.length,
        converted: dayLeads.filter(l => l.status === 'Converted').length
      });
    }
    return days;
  }, [leads]);

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  const recentLeads = leads.slice(0, 5);

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-info text-info-foreground';
      case 'Contacted':
        return 'bg-warning text-warning-foreground';
      case 'Qualified':
        return 'bg-accent text-accent-foreground';
      case 'Converted':
        return 'bg-success text-success-foreground';
      case 'Lost':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your lead management dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md-custom border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            <div className="flex items-center mt-2 text-xs">
              <span className="text-muted-foreground">{stats.today} today</span>
              {stats.todayChange !== 0 && (
                <span className={`ml-2 flex items-center ${
                  stats.todayChange > 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {stats.todayChange > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(stats.todayChange)}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md-custom border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.converted} converted leads
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md-custom border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            <DollarSign className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ${(stats.totalValue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              From {stats.converted} conversions
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md-custom border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
            <Clock className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Last 7 days average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lead Sources */}
        <Card className="shadow-md-custom border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="shadow-md-custom border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Lead Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
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
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Leads Trend */}
      <Card className="shadow-md-custom border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Lead Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeData}>
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
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              <Line 
                type="monotone" 
                dataKey="converted" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--success))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Leads */}
      <Card className="shadow-md-custom border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Leads</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate('/leads')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLeads.map(lead => (
              <div key={lead.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-smooth">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{lead.name}</div>
                  <div className="text-sm text-muted-foreground">{lead.email}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{lead.source}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
