'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Settings, 
  Shield, 
  CreditCard,
  Bell,
  Globe,
  Database,
  Key,
  Mail,
  Palette,
  Users,
  Lock,
  Server,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react'

export default function PlatformSettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    platformName: 'SisuKai',
    platformUrl: 'https://sisukai.com',
    supportEmail: 'support@sisukai.com',
    maxUsers: '10000',
    sessionTimeout: '30',
    enableRegistration: true,
    requireEmailVerification: true,
    enableMFA: false,
    passwordMinLength: '8',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    stripePublicKey: '',
    stripeSecretKey: '',
    openaiApiKey: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981'
  })

  if (!user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Access Denied</div>
  }

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'system', label: 'System', icon: Server }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Information</CardTitle>
                <CardDescription>Basic platform configuration and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Platform Name</label>
                    <Input
                      value={settings.platformName}
                      onChange={(e) => handleSettingChange('platformName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Platform URL</label>
                    <Input
                      value={settings.platformUrl}
                      onChange={(e) => handleSettingChange('platformUrl', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Support Email</label>
                    <Input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Users</label>
                    <Input
                      type="number"
                      value={settings.maxUsers}
                      onChange={(e) => handleSettingChange('maxUsers', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Registration</CardTitle>
                <CardDescription>Control how new users can join the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Enable User Registration</label>
                    <p className="text-sm text-gray-600">Allow new users to create accounts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableRegistration}
                    onChange={(e) => handleSettingChange('enableRegistration', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Require Email Verification</label>
                    <p className="text-sm text-gray-600">Users must verify their email before accessing the platform</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.requireEmailVerification}
                    onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>Configure security and authentication options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
                    <Input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password Minimum Length</label>
                    <Input
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => handleSettingChange('passwordMinLength', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Enable Multi-Factor Authentication</label>
                    <p className="text-sm text-gray-600">Require additional verification for user logins</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableMFA}
                    onChange={(e) => handleSettingChange('enableMFA', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Protection</CardTitle>
                <CardDescription>Privacy and data protection settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-yellow-800">GDPR Compliance</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Ensure your platform complies with data protection regulations. 
                          Review privacy policies and data handling procedures regularly.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Download Privacy Policy Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'email':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SMTP Configuration</CardTitle>
                <CardDescription>Configure email delivery settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">SMTP Host</label>
                    <Input
                      value={settings.smtpHost}
                      onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SMTP Port</label>
                    <Input
                      value={settings.smtpPort}
                      onChange={(e) => handleSettingChange('smtpPort', e.target.value)}
                      placeholder="587"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SMTP Username</label>
                    <Input
                      value={settings.smtpUsername}
                      onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SMTP Password</label>
                    <Input
                      type="password"
                      value={settings.smtpPassword}
                      onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Test Email Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'payments':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway</CardTitle>
                <CardDescription>Configure Stripe payment processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Stripe Publishable Key</label>
                    <Input
                      value={settings.stripePublicKey}
                      onChange={(e) => handleSettingChange('stripePublicKey', e.target.value)}
                      placeholder="pk_test_..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Stripe Secret Key</label>
                    <Input
                      type="password"
                      value={settings.stripeSecretKey}
                      onChange={(e) => handleSettingChange('stripeSecretKey', e.target.value)}
                      placeholder="sk_test_..."
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <CreditCard className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-800">Payment Security</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        All payment data is processed securely through Stripe. 
                        Your platform never stores sensitive payment information.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'api':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage third-party service integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
                  <Input
                    type="password"
                    value={settings.openaiApiKey}
                    onChange={(e) => handleSettingChange('openaiApiKey', e.target.value)}
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for AI-powered content generation and adaptive learning features
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <Key className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-green-800">API Security</h4>
                      <p className="text-sm text-green-700 mt-1">
                        API keys are encrypted and stored securely. 
                        Regularly rotate your keys for enhanced security.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'branding':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
                <CardDescription>Customize the platform's visual appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Primary Color</label>
                    <div className="flex space-x-2">
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                      />
                      <div 
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: settings.primaryColor }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Secondary Color</label>
                    <div className="flex space-x-2">
                      <Input
                        value={settings.secondaryColor}
                        onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                      />
                      <div 
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: settings.secondaryColor }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'system':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Platform status and system details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Platform Version:</strong> 1.0.0</p>
                    <p className="text-sm"><strong>Database Status:</strong> <span className="text-green-600">Connected</span></p>
                    <p className="text-sm"><strong>Cache Status:</strong> <span className="text-green-600">Active</span></p>
                    <p className="text-sm"><strong>Last Backup:</strong> 2024-01-30 14:30</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Total Users:</strong> 15,420</p>
                    <p className="text-sm"><strong>Active Sessions:</strong> 234</p>
                    <p className="text-sm"><strong>Storage Used:</strong> 2.4 GB</p>
                    <p className="text-sm"><strong>Uptime:</strong> 99.9%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Actions</CardTitle>
                <CardDescription>Maintenance and system operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline">
                    <Server className="h-4 w-4 mr-2" />
                    System Health Check
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure platform settings, security, and integrations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-none first:rounded-t-lg last:rounded-b-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
            
            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

