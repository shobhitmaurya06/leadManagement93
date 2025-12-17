import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Globe, Facebook, Zap, CheckCircle2, XCircle, Copy } from 'lucide-react';

const integrations = [
  {
    id: 'website',
    name: 'Website Forms',
    description: 'Capture leads directly from your website forms',
    icon: Globe,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    requiresConfig: true,
    fields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'text', readOnly: true },
      { name: 'apiKey', label: 'API Key', type: 'text', readOnly: true }
    ]
  },
  {
    id: 'meta',
    name: 'Meta Ads (Facebook)',
    description: 'Import leads from Facebook & Instagram lead ads',
    icon: Facebook,
    color: 'text-[#1877F2]',
    bgColor: 'bg-[#1877F2]/10',
    requiresConfig: true,
    fields: [
      { name: 'accessToken', label: 'Access Token', type: 'password' },
      { name: 'pageId', label: 'Page ID', type: 'text' },
      { name: 'formId', label: 'Form ID', type: 'text' }
    ]
  },
  {
    id: 'google',
    name: 'Google Ads',
    description: 'Sync leads from Google Ads campaigns',
    icon: Zap,
    color: 'text-[#4285F4]',
    bgColor: 'bg-[#4285F4]/10',
    requiresConfig: true,
    fields: [
      { name: 'clientId', label: 'Client ID', type: 'text' },
      { name: 'clientSecret', label: 'Client Secret', type: 'password' },
      { name: 'customerId', label: 'Customer ID', type: 'text' }
    ]
  }
];

export const IntegrationsPage = () => {
  const [activeIntegrations, setActiveIntegrations] = useState({
    website: true,
    meta: false,
    google: false
  });

  const [configs, setConfigs] = useState({
    website: {
      webhookUrl: `${process.env.REACT_APP_BACKEND_URL}`,
      apiKey: 'lf_' + Math.random().toString(36).substring(2, 15)
    },
    meta: {
      accessToken: '',
      pageId: '',
      formId: ''
    },
    google: {
      clientId: '',
      clientSecret: '',
      customerId: ''
    }
  });

  const handleToggle = (integrationId) => {
    const newState = !activeIntegrations[integrationId];
    setActiveIntegrations(prev => ({
      ...prev,
      [integrationId]: newState
    }));
    
    if (newState) {
      toast.success(`${integrations.find(i => i.id === integrationId).name} enabled`);
    } else {
      toast.info(`${integrations.find(i => i.id === integrationId).name} disabled`);
    }
  };

  const handleConfigChange = (integrationId, field, value) => {
    setConfigs(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        [field]: value
      }
    }));
  };

  const handleSaveConfig = (integrationId) => {
    // Mock save - in real app, would call API
    toast.success('Configuration saved successfully');
  };

  const handleTestConnection = (integrationId) => {
    // Mock test - in real app, would test the connection
    toast.loading('Testing connection...');
    setTimeout(() => {
      toast.success('Connection successful!');
    }, 1500);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Integrations</h1>
        <p className="text-muted-foreground">
          Connect and manage your lead sources
        </p>
      </div>

      {/* Integration Cards */}
      <div className="grid gap-6 lg:grid-cols-1">
        {integrations.map(integration => {
          const Icon = integration.icon;
          const isActive = activeIntegrations[integration.id];
          const config = configs[integration.id];

          return (
            <Card key={integration.id} className="shadow-md-custom border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg ${integration.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${integration.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold mb-1">
                        {integration.name}
                      </CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                      <div className="mt-2">
                        <Badge variant={isActive ? 'default' : 'secondary'} className="flex items-center w-fit">
                          {isActive ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Connected
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Disconnected
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => handleToggle(integration.id)}
                  />
                </div>
              </CardHeader>

              {isActive && integration.requiresConfig && (
                <CardContent>
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="grid gap-4">
                      {integration.fields.map(field => (
                        <div key={field.name} className="space-y-2">
                          <Label htmlFor={`${integration.id}-${field.name}`}>
                            {field.label}
                          </Label>
                          <div className="flex space-x-2">
                            <Input
                              id={`${integration.id}-${field.name}`}
                              type={field.type}
                              value={config[field.name]}
                              onChange={(e) => handleConfigChange(integration.id, field.name, e.target.value)}
                              readOnly={field.readOnly}
                              placeholder={field.readOnly ? '' : `Enter ${field.label.toLowerCase()}`}
                              className="flex-1"
                            />
                            {field.readOnly && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(config[field.name])}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      {integration.id !== 'website' && (
                        <>
                          <Button onClick={() => handleSaveConfig(integration.id)}>
                            Save Configuration
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleTestConnection(integration.id)}
                          >
                            Test Connection
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Setup Instructions */}
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 text-foreground">Setup Instructions</h4>
                      {integration.id === 'website' && (
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Copy the webhook URL and API key above</li>
                          <li>Add them to your website's form submission handler</li>
                          <li>Send POST requests with lead data to the webhook URL</li>
                          <li>Include the API key in the Authorization header</li>
                        </ul>
                      )}
                      {integration.id === 'meta' && (
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Go to Facebook Business Manager</li>
                          <li>Generate an access token with leads_retrieval permission</li>
                          <li>Find your Page ID and Form ID in Ads Manager</li>
                          <li>Enter the credentials above and save</li>
                        </ul>
                      )}
                      {integration.id === 'google' && (
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Create a project in Google Cloud Console</li>
                          <li>Enable the Google Ads API</li>
                          <li>Create OAuth 2.0 credentials</li>
                          <li>Get your Customer ID from Google Ads account</li>
                          <li>Enter the credentials above and save</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <Card className="shadow-md-custom border-border bg-primary-light/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Having trouble setting up an integration? Check our documentation or contact support.
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              View Documentation
            </Button>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsPage;
