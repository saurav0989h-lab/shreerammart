import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Mail, Phone, Lock, Loader2 } from 'lucide-react';

export default function Login({ initialMode = 'login' }) {
    const [authMode, setAuthMode] = useState(initialMode);
    const [loginMethod, setLoginMethod] = useState('email');
    const [signupMethod, setSignupMethod] = useState('email');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [signupLoading, setSignupLoading] = useState(false);
    const [signupPhoneLoading, setSignupPhoneLoading] = useState(false);
    const [signupOtpLoading, setSignupOtpLoading] = useState(false);

    // Email login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Phone login state
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);

    // Signup email state
    const [signupData, setSignupData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Signup phone state
    const [phoneSignup, setPhoneSignup] = useState({
        first_name: '',
        last_name: '',
        phone: ''
    });
    const [signupOtp, setSignupOtp] = useState('');
    const [showSignupOtp, setShowSignupOtp] = useState(false);

    useEffect(() => {
        setAuthMode(initialMode);
    }, [initialMode]);

    useEffect(() => {
        setShowSignupOtp(false);
        setSignupOtp('');
    }, [signupMethod]);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await base44.auth.login(email, password);
            toast.success('Successfully logged in!');
            window.location.href = '/';
        } catch (error) {
            toast.error('Login failed: ' + (error.message || 'Invalid credentials'));
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await base44.auth.requestPhoneOtp(phone);
            toast.success('OTP sent to your phone!');
            setShowOtp(true);
        } catch (error) {
            toast.error(error.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await base44.auth.verifyPhoneOtp(phone, otp);
            toast.success('Successfully logged in!');
            window.location.href = '/';
        } catch (error) {
            toast.error(error.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleSignupChange = (e) => {
        setSignupData({ ...signupData, [e.target.name]: e.target.value });
    };

    const handleEmailSignup = async (e) => {
        e.preventDefault();
        if (signupData.password !== signupData.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        setSignupLoading(true);
        try {
            await base44.auth.signup({
                first_name: signupData.first_name,
                last_name: signupData.last_name,
                email: signupData.email,
                password: signupData.password
            });
            toast.success('Account created successfully!');
            window.location.href = '/';
        } catch (error) {
            toast.error('Signup failed: ' + (error.message || 'Unknown error'));
        } finally {
            setSignupLoading(false);
        }
    };

    const handlePhoneSignupChange = (e) => {
        setPhoneSignup({ ...phoneSignup, [e.target.name]: e.target.value });
    };

    const handleSignupPhoneRequestOtp = async (e) => {
        e.preventDefault();
        setSignupPhoneLoading(true);
        try {
            await base44.auth.requestPhoneOtp(phoneSignup.phone);
            toast.success('OTP sent to your phone!');
            setShowSignupOtp(true);
        } catch (error) {
            toast.error(error.message || 'Failed to send OTP');
        } finally {
            setSignupPhoneLoading(false);
        }
    };

    const handleSignupPhoneVerifyOtp = async (e) => {
        e.preventDefault();
        if (!signupOtp) {
            toast.error('Enter the OTP to continue');
            return;
        }

        setSignupOtpLoading(true);
        try {
            await base44.auth.verifyPhoneOtp(phoneSignup.phone, signupOtp);
            const namePayload = {};
            if (phoneSignup.first_name) namePayload.first_name = phoneSignup.first_name;
            if (phoneSignup.last_name) namePayload.last_name = phoneSignup.last_name;
            if (Object.keys(namePayload).length > 0) {
                await base44.auth.updateMe(namePayload);
            }
            toast.success('Account created successfully!');
            window.location.href = '/';
        } catch (error) {
            toast.error(error.message || 'Failed to verify OTP');
        } finally {
            setSignupOtpLoading(false);
        }
    };

    const handleGoogleAuth = async (mode) => {
        setGoogleLoading(true);
        try {
            await base44.auth.loginWithGoogle();
            toast.success(mode === 'signup' ? 'Successfully signed up with Google!' : 'Successfully logged in with Google!');
            window.location.href = '/';
        } catch (error) {
            toast.error('Google authentication failed');
        } finally {
            setGoogleLoading(false);
        }
    };

    const renderDivider = (label) => (
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">{label}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-black text-gray-900 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                        {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {authMode === 'login' ? 'Sign in to your account' : 'Join Dang Bazaar today'}
                    </p>
                </div>

                <Tabs value={authMode} onValueChange={setAuthMode} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="space-y-6">
                        <Tabs value={loginMethod} onValueChange={setLoginMethod} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="email" className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Email
                                </TabsTrigger>
                                <TabsTrigger value="phone" className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> Phone
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="email">
                                <form className="space-y-6" onSubmit={handleEmailLogin}>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <Input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10"
                                                placeholder="Email address"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <Input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10"
                                                placeholder="Password"
                                            />
                                        </div>
                                    </div>

                                    <div className="text-right text-sm">
                                        <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
                                            Forgot details?
                                        </a>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white"
                                    >
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign in'}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="phone">
                                {!showOtp ? (
                                    <form className="space-y-6" onSubmit={handlePhoneRequestOtp}>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <Input
                                                type="tel"
                                                required
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="pl-10"
                                                placeholder="Mobile Number"
                                            />
                                            <p className="text-xs text-muted-foreground mt-2 ml-1">Mock: Use verified format (10 digits)</p>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send OTP'}
                                        </Button>
                                    </form>
                                ) : (
                                    <form className="space-y-6" onSubmit={handlePhoneVerifyOtp}>
                                        <div className="text-center mb-4">
                                            <p className="text-sm text-gray-600">Enter OTP sent to {phone}</p>
                                            <p className="text-xs text-emerald-600 font-mono mt-1">Mock OTP: 123456</p>
                                        </div>
                                        <div className="space-y-4">
                                            <Input
                                                type="text"
                                                required
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="text-center text-2xl tracking-widest"
                                                placeholder="000000"
                                                maxLength={6}
                                            />

                                            <div className="flex justify-between text-sm">
                                                <button type="button" onClick={() => setShowOtp(false)} className="text-gray-500 hover:text-gray-700">Change Number</button>
                                                <button type="button" onClick={handlePhoneRequestOtp} className="text-emerald-600 hover:text-emerald-500">Resend OTP</button>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white"
                                        >
                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify & Login'}
                                        </Button>
                                    </form>
                                )}
                            </TabsContent>
                        </Tabs>

                        {renderDivider('Or continue with')}

                        <Button
                            variant="outline"
                            type="button"
                            disabled={googleLoading}
                            onClick={() => handleGoogleAuth('login')}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            {googleLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.47 1.18 4.93l2.85-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                            )}
                            Continue with Google
                        </Button>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-6">
                        <Tabs value={signupMethod} onValueChange={setSignupMethod} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="email" className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Email
                                </TabsTrigger>
                                <TabsTrigger value="phone" className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> Phone
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="email">
                                <form className="space-y-6" onSubmit={handleEmailSignup}>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="first_name">First Name</Label>
                                                <Input
                                                    id="first_name"
                                                    name="first_name"
                                                    type="text"
                                                    required
                                                    value={signupData.first_name}
                                                    onChange={handleSignupChange}
                                                    className="mt-1"
                                                    placeholder="John"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="last_name">Last Name</Label>
                                                <Input
                                                    id="last_name"
                                                    name="last_name"
                                                    type="text"
                                                    required
                                                    value={signupData.last_name}
                                                    onChange={handleSignupChange}
                                                    className="mt-1"
                                                    placeholder="Doe"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="signup_email">Email address</Label>
                                            <Input
                                                id="signup_email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                value={signupData.email}
                                                onChange={handleSignupChange}
                                                className="mt-1"
                                                placeholder="you@example.com"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="signup_password">Password</Label>
                                            <Input
                                                id="signup_password"
                                                name="password"
                                                type="password"
                                                autoComplete="new-password"
                                                required
                                                value={signupData.password}
                                                onChange={handleSignupChange}
                                                className="mt-1"
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="signup_confirmPassword">Confirm Password</Label>
                                            <Input
                                                id="signup_confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                autoComplete="new-password"
                                                required
                                                value={signupData.confirmPassword}
                                                onChange={handleSignupChange}
                                                className="mt-1"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={signupLoading}
                                        className="w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700"
                                    >
                                        {signupLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign up'}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="phone">
                                {!showSignupOtp ? (
                                    <form className="space-y-6" onSubmit={handleSignupPhoneRequestOtp}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="signup_phone_first_name">First Name</Label>
                                                <Input
                                                    id="signup_phone_first_name"
                                                    name="first_name"
                                                    type="text"
                                                    value={phoneSignup.first_name}
                                                    onChange={handlePhoneSignupChange}
                                                    className="mt-1"
                                                    placeholder="John"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="signup_phone_last_name">Last Name</Label>
                                                <Input
                                                    id="signup_phone_last_name"
                                                    name="last_name"
                                                    type="text"
                                                    value={phoneSignup.last_name}
                                                    onChange={handlePhoneSignupChange}
                                                    className="mt-1"
                                                    placeholder="Doe"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="signup_phone">Phone number</Label>
                                            <Input
                                                id="signup_phone"
                                                name="phone"
                                                type="tel"
                                                required
                                                value={phoneSignup.phone}
                                                onChange={handlePhoneSignupChange}
                                                className="mt-1"
                                                placeholder="98XXXXXXXX"
                                            />
                                            <p className="text-xs text-muted-foreground mt-2 ml-1">Mock OTP code: 123456</p>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={signupPhoneLoading}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            {signupPhoneLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send OTP'}
                                        </Button>
                                    </form>
                                ) : (
                                    <form className="space-y-6" onSubmit={handleSignupPhoneVerifyOtp}>
                                        <div className="text-center mb-4">
                                            <p className="text-sm text-gray-600">Enter OTP sent to {phoneSignup.phone}</p>
                                            <p className="text-xs text-emerald-600 font-mono mt-1">Mock OTP: 123456</p>
                                        </div>

                                        <Input
                                            type="text"
                                            value={signupOtp}
                                            onChange={(e) => setSignupOtp(e.target.value)}
                                            className="text-center text-2xl tracking-widest"
                                            placeholder="000000"
                                            maxLength={6}
                                        />

                                        <div className="flex justify-between text-sm">
                                            <button type="button" onClick={() => setShowSignupOtp(false)} className="text-gray-500 hover:text-gray-700">Change Number</button>
                                            <button type="button" onClick={handleSignupPhoneRequestOtp} className="text-emerald-600 hover:text-emerald-500">Resend OTP</button>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={signupOtpLoading}
                                            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white"
                                        >
                                            {signupOtpLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify & Create account'}
                                        </Button>
                                    </form>
                                )}
                            </TabsContent>
                        </Tabs>

                        {renderDivider('Or continue with')}

                        <Button
                            variant="outline"
                            type="button"
                            disabled={googleLoading}
                            onClick={() => handleGoogleAuth('signup')}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            {googleLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.47 1.18 4.93l2.85-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                            )}
                            Continue with Google
                        </Button>
                    </TabsContent>
                </Tabs>

                <div className="text-center text-sm text-gray-600">
                    {authMode === 'login' ? (
                        <button type="button" onClick={() => setAuthMode('signup')} className="font-medium text-emerald-600 hover:text-emerald-500">
                            Need an account? Sign up instantly
                        </button>
                    ) : (
                        <button type="button" onClick={() => setAuthMode('login')} className="font-medium text-emerald-600 hover:text-emerald-500">
                            Already have an account? Switch to login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
