'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  Shield,
  Eye,
  Edit,
  AlertCircle,
  Trash2,
  Plus,
  UserPlus,
  Settings
} from 'lucide-react'

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  if (!user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Access Denied</div>
  }

  const handleUserAction = (userId: string, action: string) => {
    switch (action) {
      case 'view':
        alert(`Viewing user details for ${userId}`)
        break
      case 'edit':
        alert(`Editing user ${userId}`)
        break
      case 'suspend':
        if (confirm(`Are you sure you want to suspend user ${userId}?`)) {
          alert(`User ${userId} suspended`)
        }
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete user ${userId}? This action cannot be undone.`)) {
          alert(`User ${userId} deleted`)
        }
        break
      default:
        break
    }
  }

  // Mock users data
  const mockUsers = [
    {
      id: 'user-1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      tier: 'pro',
      role: 'learner',
      xp: 2450,
      level: 5,
      streak: 12,
      joinedDate: '2024-01-15',
      lastActive: '2024-01-30T14:30:00Z',
      status: 'active'
    },
    {
      id: 'user-2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      tier: 'free',
      role: 'learner',
      xp: 890,
      level: 2,
      streak: 3,
      joinedDate: '2024-01-20',
      lastActive: '2024-01-29T09:15:00Z',
      status: 'active'
    },
    {
      id: 'user-3',
      name: 'Mike Chen',
      email: 'mike.chen@example.com',
      tier: 'pro',
      role: 'learner',
      xp: 3200,
      level: 7,
      streak: 25,
      joinedDate: '2024-01-10',
      lastActive: '2024-01-30T16:45:00Z',
      status: 'active'
    },
    {
      id: 'user-4',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      tier: 'free',
      role: 'learner',
      xp: 450,
      level: 1,
      streak: 1,
      joinedDate: '2024-01-25',
      lastActive: '2024-01-28T11:20:00Z',
      status: 'inactive'
    },
    {
      id: 'user-5',
      name: 'Alex Rodriguez',
      email: 'alex.rodriguez@example.com',
      tier: 'pro',
      role: 'sub-admin',
      xp: 1800,
      level: 4,
      streak: 8,
      joinedDate: '2024-01-12',
      lastActive: '2024-01-30T13:10:00Z',
      status: 'active'
    }
  ]

  const filteredUsers = mockUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = filterTier === 'all' || u.tier === filterTier
    return matchesSearch && matchesTier
  })

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'pro': return 'bg-purple-100 text-purple-800'
      case 'free': return 'bg-gray-100 text-gray-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const userStats = {
    total: mockUsers.length,
    active: mockUsers.filter(u => u.status === 'active').length,
    pro: mockUsers.filter(u => u.tier === 'pro').length,
    free: mockUsers.filter(u => u.tier === 'free').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                User Management
              </h1>
              <p className="text-gray-600 text-lg">
                Manage user accounts, roles, and platform access
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Sub-Admin
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pro Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.pro}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Free Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.free}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Tiers</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">User</th>
                    <th className="text-left py-3 px-4 font-medium">Tier</th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium">Progress</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Last Active</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-sm text-gray-600">{u.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTierColor(u.tier)}`}>
                          {u.tier}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{u.role}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="text-gray-900">Level {u.level}</p>
                          <p className="text-gray-600">{u.xp} XP • {u.streak} day streak</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(u.status)}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600">
                          {u.lastActive ? formatDateTime(u.lastActive) : 'Never'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserAction(u.id, 'view')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserAction(u.id, 'edit')}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserAction(u.id, 'suspend')}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <AlertCircle className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserAction(u.id, 'delete')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

