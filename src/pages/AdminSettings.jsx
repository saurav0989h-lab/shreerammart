import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Lock, Save, Loader2, Menu, Plus, Trash2, Shield, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminSettings() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [newUserData, setNewUserData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'subadmin'
    });

    useEffect(() => {
        const checkAuth = async () => {
            const isAuth = await base44.auth.isAuthenticated();
            if (!isAuth) {
                navigate(createPageUrl('AdminLogin'));
                return;
            }
            const userData = await base44.auth.me();
            if (userData.role !== 'admin') {
                navigate(createPageUrl('Home'));
                return;
            }
            setUser(userData);
            setFormData(prev => ({
                ...prev,
                full_name: userData.full_name || '',
                email: userData.email || ''
            }));
        };
        checkAuth();
    }, [navigate]);

    // Fetch all admin users
    const { data: adminUsers = [] } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const users = await base44.entities.User.list();
            return users.filter(u => u.role === 'admin' || u.role === 'subadmin');
        },
        enabled: !!user
    });

    const createUserMutation = useMutation({
        mutationFn: async (userData) => {
            return await base44.entities.User.create(userData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success('User created successfully');
            setIsDialogOpen(false);
            setNewUserData({ full_name: '', email: '', password: '', role: 'subadmin' });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create user');
        }
    });

    const updateUserRoleMutation = useMutation({
        mutationFn: async ({ userId, role }) => {
            return await base44.entities.User.update(userId, { role });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success('User role updated');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update role');
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId) => {
            return await base44.entities.User.delete(userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success('User deleted');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete user');
        }
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNewUserChange = (field, value) => {
        setNewUserData(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (formData.new_password || formData.confirm_password) {
                if (!formData.current_password) {
                    throw new Error('Current password is required to change password');
                }
                if (formData.new_password !== formData.confirm_password) {
                    throw new Error('New passwords do not match');
                }
                if (formData.new_password.length < 6) {
                    throw new Error('New password must be at least 6 characters');
                }
            }

            const updateData = {
                full_name: formData.full_name,
                email: formData.email
            };

            if (formData.new_password) {
                updateData.current_password = formData.current_password;
                updateData.new_password = formData.new_password;
            }

            await base44.users.update(user.id, updateData);

            toast.success('Profile updated successfully!');

            setFormData(prev => ({
                ...prev,
                current_password: '',
                new_password: '',
                confirm_password: ''
            }));

            const updatedUser = await base44.auth.me();
            setUser(updatedUser);
            setFormData(prev => ({
                ...prev,
                full_name: updatedUser.full_name || '',
                email: updatedUser.email || ''
            }));
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = (e) => {
        e.preventDefault();
        if (!newUserData.full_name || !newUserData.email || !newUserData.password) {
            toast.error('Please fill all fields');
            return;
        }
        if (newUserData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        createUserMutation.mutate(newUserData);
    };

    const handleRoleChange = (userId, newRole) => {
        if (userId === user.id) {
            toast.error("You cannot change your own role");
            return;
        }
        updateUserRoleMutation.mutate({ userId, role: newRole });
    };

    const handleDeleteUser = (userId) => {
        if (userId === user.id) {
            toast.error("You cannot delete your own account");
            return;
        }
        if (confirm('Are you sure you want to delete this user?')) {
            deleteUserMutation.mutate(userId);
        }
    };

    if (!user) return <div className="p-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar
                user={user}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 min-h-screen">
                <header className="bg-white border-b h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
                            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-900">Admin Settings</h1>
                    </div>
                </header>

                <div className="p-4 sm:p-6 max-w-5xl space-y-6">
                    {/* Your Profile Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Profile</CardTitle>
                            <CardDescription>Update your admin account information and password</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="full_name">
                                            <User className="w-4 h-4 inline mr-2" />
                                            Full Name
                                        </Label>
                                        <Input
                                            id="full_name"
                                            name="full_name"
                                            type="text"
                                            value={formData.full_name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            <Mail className="w-4 h-4 inline mr-2" />
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="text-sm font-semibold text-gray-900">Change Password</h3>
                                    <p className="text-sm text-gray-500">Leave blank if you don't want to change your password</p>

                                    <div className="space-y-2">
                                        <Label htmlFor="current_password">
                                            <Lock className="w-4 h-4 inline mr-2" />
                                            Current Password
                                        </Label>
                                        <Input
                                            id="current_password"
                                            name="current_password"
                                            type="password"
                                            value={formData.current_password}
                                            onChange={handleInputChange}
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="new_password">
                                            <Lock className="w-4 h-4 inline mr-2" />
                                            New Password
                                        </Label>
                                        <Input
                                            id="new_password"
                                            name="new_password"
                                            type="password"
                                            value={formData.new_password}
                                            onChange={handleInputChange}
                                            placeholder="Enter new password"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirm_password">
                                            <Lock className="w-4 h-4 inline mr-2" />
                                            Confirm New Password
                                        </Label>
                                        <Input
                                            id="confirm_password"
                                            name="confirm_password"
                                            type="password"
                                            value={formData.confirm_password}
                                            onChange={handleInputChange}
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* User Management */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>User Management</CardTitle>
                                    <CardDescription>Manage admin and sub-admin users</CardDescription>
                                </div>
                                <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add User
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {adminUsers.map((adminUser) => (
                                    <div key={adminUser.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                {adminUser.role === 'admin' ? (
                                                    <Shield className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <UserCog className="w-5 h-5 text-green-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{adminUser.full_name}</p>
                                                <p className="text-sm text-gray-500">{adminUser.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Select
                                                value={adminUser.role}
                                                onValueChange={(value) => handleRoleChange(adminUser.id, value)}
                                                disabled={adminUser.id === user.id}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">
                                                        <Badge className="bg-blue-100 text-blue-800">Admin</Badge>
                                                    </SelectItem>
                                                    <SelectItem value="subadmin">
                                                        <Badge className="bg-green-100 text-green-800">Sub-Admin</Badge>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {adminUser.id !== user.id && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleDeleteUser(adminUser.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {adminUsers.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">No admin users found</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Create User Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new_full_name">Full Name</Label>
                            <Input
                                id="new_full_name"
                                value={newUserData.full_name}
                                onChange={(e) => handleNewUserChange('full_name', e.target.value)}
                                placeholder="Enter full name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new_email">Email</Label>
                            <Input
                                id="new_email"
                                type="email"
                                value={newUserData.email}
                                onChange={(e) => handleNewUserChange('email', e.target.value)}
                                placeholder="Enter email"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new_password">Password</Label>
                            <Input
                                id="new_password"
                                type="password"
                                value={newUserData.password}
                                onChange={(e) => handleNewUserChange('password', e.target.value)}
                                placeholder="Enter password (min 6 characters)"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new_role">Role</Label>
                            <Select value={newUserData.role} onValueChange={(value) => handleNewUserChange('role', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin (Full Access)</SelectItem>
                                    <SelectItem value="subadmin">Sub-Admin (Limited Access)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createUserMutation.isPending}>
                                {createUserMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create User'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
