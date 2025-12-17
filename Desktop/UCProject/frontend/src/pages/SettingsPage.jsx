import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { Bell, Mail, MessageSquare, User, Lock, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
export const SettingsPage = () => {
  const { user } = useAuth();
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [dailySummary, setDailySummary] = useState(true);
  const [summaryTime, setSummaryTime] = useState('09:00');
  const [newLeadAlert, setNewLeadAlert] = useState(true);
  const [statusChangeAlert, setStatusChangeAlert] = useState(true);

  // Email Template
  const [emailTemplate, setEmailTemplate] = useState(
    'Hi {name},\n\nThank you for your interest in {service}.\n\nWe have received your inquiry and will get back to you within 24 hours.\n\nBest regards,\n{team_member}'
  );
  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+91 12345678',
    timezone: 'India'
  });

  // Theme
  const [theme, setTheme] = useState('light');

  const handleSaveNotifications = () => {
    toast.success('Notification settings saved');
  };
  const handleSaveTemplate = () => {
    toast.success('Email template saved');
  };

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = () => {
    toast.success('Password change email sent');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="shadow-md-custom border-border">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={profileData.timezone}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="pt-4">
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="shadow-md-custom border-border">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about new leads and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for new leads
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications" className="text-base">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get text messages for urgent updates
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new-lead-alert" className="text-base">New Lead Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Instant notification when a new lead arrives
                  </p>
                </div>
                <Switch
                  id="new-lead-alert"
                  checked={newLeadAlert}
                  onCheckedChange={setNewLeadAlert}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="status-change-alert" className="text-base">Status Change Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when lead status is updated
                  </p>
                </div>
                <Switch
                  id="status-change-alert"
                  checked={statusChangeAlert}
                  onCheckedChange={setStatusChangeAlert}
                />
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="daily-summary" className="text-base">Daily Summary</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a daily report of all leads
                    </p>
                  </div>
                  <Switch
                    id="daily-summary"
                    checked={dailySummary}
                    onCheckedChange={setDailySummary}
                  />
                </div>
                
                {dailySummary && (
                  <div className="space-y-2">
                    <Label htmlFor="summary-time">Summary Time</Label>
                    <Input
                      id="summary-time"
                      type="time"
                      value={summaryTime}
                      onChange={(e) => setSummaryTime(e.target.value)}
                      className="w-40"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md-custom border-border">
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                Recent notifications sent to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'New Lead', message: 'New lead from Website: John Doe', time: '2 hours ago' },
                  { type: 'Status Update', message: 'Lead #1234 marked as Converted', time: '5 hours ago' },
                  { type: 'Daily Summary', message: 'Daily lead report for today', time: '1 day ago' },
                ].map((notification, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border border-border">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-foreground">{notification.type}</div>
                      <div className="text-sm text-muted-foreground">{notification.message}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{notification.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card className="shadow-md-custom border-border">
            <CardHeader>
              <CardTitle>Email Template</CardTitle>
              <CardDescription>
                Customize the automatic response sent to new leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-template">Template Content</Label>
                <Textarea
                  id="email-template"
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Available Variables</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div><code className="bg-background px-1 rounded">{'{name}'}</code> - Lead name</div>
                  <div><code className="bg-background px-1 rounded">{'{email}'}</code> - Lead email</div>
                  <div><code className="bg-background px-1 rounded">{'{service}'}</code> - Service interest</div>
                  <div><code className="bg-background px-1 rounded">{'{team_member}'}</code> - Assigned team member</div>
                  <div><code className="bg-background px-1 rounded">{'{company}'}</code> - Company name</div>
                  <div><code className="bg-background px-1 rounded">{'{date}'}</code> - Current date</div>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveTemplate}>Save Template</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="shadow-md-custom border-border">
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <div className="pt-4">
                <Button onClick={handleChangePassword}>Change Password</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md-custom border-border">
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Require a code in addition to your password
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md-custom border-border">
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage devices where you're signed in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { device: 'Chrome on Windows', location: 'New York, US', current: true },
                  { device: 'Safari on iPhone', location: 'New York, US', current: false },
                ].map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <div className="font-medium text-sm text-foreground">{session.device}</div>
                      <div className="text-sm text-muted-foreground">{session.location}</div>
                      {session.current && (
                        <div className="text-xs text-success mt-1">Current session</div>
                      )}
                    </div>
                    {!session.current && (
                      <Button variant="outline" size="sm">Revoke</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="shadow-md-custom border-border">
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Choose your preferred color scheme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-smooth ${
                    theme === 'light' ? 'border-primary' : 'border-border'
                  }`}
                  onClick={() => setTheme('light')}
                >
                  <div className="bg-background rounded p-3 mb-2">
                    <div className="h-2 bg-foreground/20 rounded mb-1"></div>
                    <div className="h-2 bg-foreground/10 rounded w-2/3"></div>
                  </div>
                  <p className="font-medium text-center">Light</p>
                </div>
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-smooth ${
                    theme === 'dark' ? 'border-primary' : 'border-border'
                  }`}
                  onClick={() => setTheme('dark')}
                >
                  <div className="bg-foreground rounded p-3 mb-2">
                    <div className="h-2 bg-background/20 rounded mb-1"></div>
                    <div className="h-2 bg-background/10 rounded w-2/3"></div>
                  </div>
                  <p className="font-medium text-center">Dark</p>
                </div>
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-smooth ${
                    theme === 'auto' ? 'border-primary' : 'border-border'
                  }`}
                  onClick={() => setTheme('auto')}
                >
                  <div className="bg-linear-to-r from-background to-foreground rounded p-3 mb-2">
                    <div className="h-2 bg-foreground/20 rounded mb-1"></div>
                    <div className="h-2 bg-foreground/10 rounded w-2/3"></div>
                  </div>
                  <p className="font-medium text-center">Auto</p>
                </div>
              </div>
              <div className="pt-4">
                <Button onClick={() => toast.success('Theme preference saved')}>
                  Save Theme
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
