// نظام المصادقة المتقدم لبيكسل آرت

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.token = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
    }
    
    async init() {
        // التحقق من وجود جلسة سابقة
        await this.checkExistingSession();
        
        // تهيئة تجديد التوكن التلقائي
        this.initTokenRefresh();
    }
    
    async checkExistingSession() {
        try {
            const token = localStorage.getItem('auth_token');
            const userData = localStorage.getItem('user_data');
            
            if (token && userData) {
                // التحقق من صلاحية التوكن
                const isValid = await this.validateToken(token);
                
                if (isValid) {
                    this.currentUser = JSON.parse(userData);
                    this.token = token;
                    this.isAuthenticated = true;
                    this.tokenExpiry = localStorage.getItem('token_expiry');
                    
                    console.log('تم استعادة جلسة المستخدم');
                    return true;
                } else {
                    // محاولة تجديد التوكن
                    const refreshed = await this.refreshAuthToken();
                    if (refreshed) {
                        return true;
                    }
                }
            }
        } catch (error) {
            console.error('فشل التحقق من الجلسة:', error);
        }
        
        // تسجيل خروج إذا فشل التحقق
        await this.logout();
        return false;
    }
    
    async validateToken(token) {
        // التحقق من صلاحية التوكن (محاكاة)
        return new Promise(resolve => {
            setTimeout(() => {
                // في تطبيق حقيقي، هنا يتم التحقق من الخادم
                const expiry = localStorage.getItem('token_expiry');
                if (expiry && new Date(expiry) > new Date()) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 300);
        });
    }
    
    async login(email, password, rememberMe = false) {
        try {
            // التحقق من البيانات
            if (!email || !password) {
                throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
            }
            
            // عرض حالة التحميل
            this.showLoading('جاري تسجيل الدخول...');
            
            // محاكاة API للدخول
            const response = await this.mockLoginAPI(email, password);
            
            if (response.success) {
                // حفظ بيانات المستخدم
                this.currentUser = response.user;
                this.token = response.token;
                this.refreshToken = response.refreshToken;
                this.tokenExpiry = response.expiry;
                this.isAuthenticated = true;
                
                // حفظ في localStorage
                this.saveAuthData(rememberMe);
                
                // إخفاء حالة التحميل
                this.hideLoading();
                
                // تسجيل الحدث
                this.logEvent('login_success', { userId: this.currentUser.id });
                
                return {
                    success: true,
                    user: this.currentUser
                };
            } else {
                throw new Error(response.message || 'فشل تسجيل الدخول');
            }
            
        } catch (error) {
            // إخفاء حالة التحميل
            this.hideLoading();
            
            // تسجيل الحدث
            this.logEvent('login_failed', { error: error.message });
            
            throw error;
        }
    }
    
    async mockLoginAPI(email, password) {
        // محاكاة API للدخول
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // في تطبيق حقيقي، هنا يكون اتصال بالخادم
                
                // بيانات وهمية للتحقق
                const users = [
                    {
                        id: 1,
                        email: 'client@example.com',
                        password: 'password123',
                        name: 'عميل تجريبي',
                        role: 'client',
                        avatar: 'https://ui-avatars.com/api/?name=عميل&background=0a9396&color=fff',
                        balance: 1250
                    },
                    {
                        id: 2,
                        email: 'designer@example.com',
                        password: 'password123',
                        name: 'مصمم تجريبي',
                        role: 'designer',
                        avatar: 'https://ui-avatars.com/api/?name=مصمم&background=005f73&color=fff',
                        rating: 4.8
                    }
                ];
                
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    resolve({
                        success: true,
                        user: {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            avatar: user.avatar,
                            balance: user.balance,
                            rating: user.rating,
                            joinDate: new Date().toISOString()
                        },
                        token: this.generateToken(user.id),
                        refreshToken: this.generateRefreshToken(user.id),
                        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 ساعة
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
                    });
                }
            }, 1500);
        });
    }
    
    generateToken(userId) {
        // توليد توكن وهمي (في تطبيق حقيقي، يتم من الخادم)
        return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ 
            userId, 
            exp: Date.now() + 24 * 60 * 60 * 1000 
        }))}.dummy_signature`;
    }
    
    generateRefreshToken(userId) {
        // توليد توكن تجديد وهمي
        return `refresh_${btoa(JSON.stringify({ 
            userId, 
            exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 أيام
        }))}`;
    }
    
    async register(userData) {
        try {
            // التحقق من صحة البيانات
            this.validateRegistrationData(userData);
            
            // عرض حالة التحميل
            this.showLoading('جاري إنشاء الحساب...');
            
            // محاكاة API للتسجيل
            const response = await this.mockRegisterAPI(userData);
            
            if (response.success) {
                // حفظ بيانات المستخدم
                this.currentUser = response.user;
                this.token = response.token;
                this.refreshToken = response.refreshToken;
                this.tokenExpiry = response.expiry;
                this.isAuthenticated = true;
                
                // حفظ في localStorage
                this.saveAuthData(true);
                
                // حفظ في قاعدة البيانات المحلية
                await this.saveUserToLocalDB(this.currentUser);
                
                // إخفاء حالة التحميل
                this.hideLoading();
                
                // تسجيل الحدث
                this.logEvent('register_success', { userId: this.currentUser.id });
                
                // إرسال بريد ترحيبي
                this.sendWelcomeEmail(userData.email);
                
                return {
                    success: true,
                    user: this.currentUser
                };
            } else {
                throw new Error(response.message || 'فشل إنشاء الحساب');
            }
            
        } catch (error) {
            // إخفاء حالة التحميل
            this.hideLoading();
            
            // تسجيل الحدث
            this.logEvent('register_failed', { error: error.message });
            
            throw error;
        }
    }
    
    validateRegistrationData(userData) {
        const errors = [];
        
        // التحقق من الاسم
        if (!userData.firstName || userData.firstName.length < 2) {
            errors.push('الاسم الأول يجب أن يكون على الأقل حرفين');
        }
        
        if (!userData.lastName || userData.lastName.length < 2) {
            errors.push('الاسم الأخير يجب أن يكون على الأقل حرفين');
        }
        
        // التحقق من البريد الإلكتروني
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            errors.push('البريد الإلكتروني غير صالح');
        }
        
        // التحقق من رقم الهاتف
        const phoneRegex = /^[\+]?[0-9]{10,15}$/;
        if (!phoneRegex.test(userData.phone)) {
            errors.push('رقم الهاتف غير صالح');
        }
        
        // التحقق من كلمة المرور
        if (!userData.password || userData.password.length < 8) {
            errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
        }
        
        if (userData.password !== userData.confirmPassword) {
            errors.push('كلمة المرور وتأكيدها غير متطابقين');
        }
        
        // التحقق من الموافقة على الشروط
        if (!userData.agreeTerms) {
            errors.push('يجب الموافقة على شروط الخدمة وسياسة الخصوصية');
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }
    }
    
    async mockRegisterAPI(userData) {
        // محاكاة API للتسجيل
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // في تطبيق حقيقي، هنا يكون اتصال بالخادم
                
                // التحقق من عدم وجود حساب بنفس البريد
                const existingUser = localStorage.getItem(`user_${userData.email}`);
                
                if (existingUser) {
                    resolve({
                        success: false,
                        message: 'هذا البريد الإلكتروني مسجل مسبقاً'
                    });
                    return;
                }
                
                // إنشاء حساب جديد
                const userId = Date.now();
                const user = {
                    id: userId,
                    email: userData.email,
                    name: `${userData.firstName} ${userData.lastName}`,
                    phone: userData.phone,
                    role: userData.userType || 'client',
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.firstName + ' ' + userData.lastName)}&background=0a9396&color=fff`,
                    balance: 0,
                    rating: 0,
                    joinDate: new Date().toISOString(),
                    settings: {
                        notifications: true,
                        darkMode: false,
                        language: 'ar'
                    }
                };
                
                resolve({
                    success: true,
                    user,
                    token: this.generateToken(userId),
                    refreshToken: this.generateRefreshToken(userId),
                    expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                });
            }, 2000);
        });
    }
    
    async saveUserToLocalDB(user) {
        try {
            // حفظ في IndexedDB
            await window.saveUser(user);
            
            // حفظ في localStorage للوصول السريع
            localStorage.setItem(`user_${user.email}`, JSON.stringify(user));
            
        } catch (error) {
            console.error('فشل حفظ المستخدم في قاعدة البيانات المحلية:', error);
        }
    }
    
    async logout() {
        try {
            // تسجيل الحدث
            this.logEvent('logout', { userId: this.currentUser?.id });
            
            // محاكاة API للخروج
            await this.mockLogoutAPI();
            
            // مسح بيانات المصادقة
            this.clearAuthData();
            
            // إعادة التوجيه لصفحة تسجيل الدخول
            window.location.reload();
            
        } catch (error) {
            console.error('فشل تسجيل الخروج:', error);
            
            // مسح البيانات المحلية على أي حال
            this.clearAuthData();
            window.location.reload();
        }
    }
    
    async mockLogoutAPI() {
        // محاكاة API للخروج
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true });
            }, 500);
        });
    }
    
    async refreshAuthToken() {
        try {
            if (!this.refreshToken) {
                throw new Error('لا يوجد توكن تجديد');
            }
            
            // محاكاة تجديد التوكن
            const response = await this.mockRefreshTokenAPI(this.refreshToken);
            
            if (response.success) {
                this.token = response.token;
                this.refreshToken = response.refreshToken;
                this.tokenExpiry = response.expiry;
                
                // حفظ البيانات الجديدة
                this.saveAuthData(true);
                
                return true;
            } else {
                throw new Error('فشل تجديد التوكن');
            }
            
        } catch (error) {
            console.error('فشل تجديد التوكن:', error);
            await this.logout();
            return false;
        }
    }
    
    async mockRefreshTokenAPI(refreshToken) {
        // محاكاة API لتجديد التوكن
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // فك تشفير التوكن (محاكاة)
                    const tokenData = JSON.parse(atob(refreshToken.split('_')[1]));
                    
                    if (new Date(tokenData.exp) > new Date()) {
                        resolve({
                            success: true,
                            token: this.generateToken(tokenData.userId),
                            refreshToken: this.generateRefreshToken(tokenData.userId),
                            expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                        });
                    } else {
                        resolve({
                            success: false,
                            message: 'انتهت صلاحية توكن التجديد'
                        });
                    }
                } catch (error) {
                    resolve({
                        success: false,
                        message: 'توكن التجديد غير صالح'
                    });
                }
            }, 500);
        });
    }
    
    initTokenRefresh() {
        // تجديد التوكن تلقائياً قبل انتهاء صلاحيته
        setInterval(async () => {
            if (this.isAuthenticated && this.tokenExpiry) {
                const expiryTime = new Date(this.tokenExpiry).getTime();
                const currentTime = Date.now();
                const timeUntilExpiry = expiryTime - currentTime;
                
                // إذا بقي أقل من 5 دقائق على انتهاء الصلاحية
                if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
                    console.log('جاري تجديد التوكن تلقائياً...');
                    await this.refreshAuthToken();
                }
            }
        }, 60000); // التحقق كل دقيقة
    }
    
    saveAuthData(rememberMe = false) {
        if (rememberMe) {
            // حفظ في localStorage (يبقى حتى بعد إغلاق المتصفح)
            localStorage.setItem('auth_token', this.token);
            localStorage.setItem('refresh_token', this.refreshToken);
            localStorage.setItem('user_data', JSON.stringify(this.currentUser));
            localStorage.setItem('token_expiry', this.tokenExpiry);
        } else {
            // حفظ في sessionStorage (يزول بعد إغلاق المتصفح)
            sessionStorage.setItem('auth_token', this.token);
            sessionStorage.setItem('refresh_token', this.refreshToken);
            sessionStorage.setItem('user_data', JSON.stringify(this.currentUser));
            sessionStorage.setItem('token_expiry', this.tokenExpiry);
        }
    }
    
    clearAuthData() {
        // مسح من localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('token_expiry');
        
        // مسح من sessionStorage
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user_data');
        sessionStorage.removeItem('token_expiry');
        
        // إعادة تعيين المتغيرات
        this.currentUser = null;
        this.token = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        this.isAuthenticated = false;
    }
    
    showLoading(message) {
        // إنشاء عنصر التحميل إذا لم يكن موجوداً
        let loadingEl = document.getElementById('authLoading');
        
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'authLoading';
            loadingEl.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                color: white;
            `;
            
            loadingEl.innerHTML = `
                <div class="spinner" style="
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(255,255,255,.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                "></div>
                <div>${message}</div>
            `;
            
            // إضافة أنيميشن الـ spin
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(loadingEl);
        } else {
            loadingEl.style.display = 'flex';
            loadingEl.querySelector('div:last-child').textContent = message;
        }
    }
    
    hideLoading() {
        const loadingEl = document.getElementById('authLoading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }
    
    sendWelcomeEmail(email) {
        // محاكاة إرسال بريد ترحيبي
        console.log(`إرسال بريد ترحيبي إلى: ${email}`);
        
        // في تطبيق حقيقي، هنا يكون اتصال بخادم البريد
        setTimeout(() => {
            console.log('تم إرسال البريد الترحيبي');
        }, 1000);
    }
    
    logEvent(eventName, data = {}) {
        // تسجيل الحدث للأغراض التحليلية
        const event = {
            event: eventName,
            timestamp: new Date().toISOString(),
            userId: this.currentUser?.id,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            ...data
        };
        
        // حفظ في قاعدة البيانات المحلية
        this.saveEventToDB(event);
        
        // إرسال للخادم (محاكاة)
        this.sendEventToServer(event);
    }
    
    async saveEventToDB(event) {
        try {
            await window.saveAnalyticsEvent(event);
        } catch (error) {
            console.error('فشل حفظ الحدث:', error);
        }
    }
    
    async sendEventToServer(event) {
        // محاكاة إرسال الحدث للخادم
        setTimeout(() => {
            console.log('حدث تحليلي:', event);
        }, 100);
    }
    
    // التحقق من الصلاحيات
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        const permissions = {
            client: [
                'view_designs',
                'request_design',
                'view_projects',
                'view_messages',
                'make_payments'
            ],
            designer: [
                'view_designs',
                'create_design',
                'manage_projects',
                'view_messages',
                'receive_payments',
                'edit_profile',
                'upload_portfolio'
            ],
            admin: [
                'all'
            ]
        };
        
        const userPermissions = permissions[this.currentUser.role] || [];
        
        return userPermissions.includes('all') || userPermissions.includes(permission);
    }
    
    // التحقق من الدور
    hasRole(role) {
        return this.currentUser?.role === role;
    }
    
    // الحصول على بيانات المستخدم الحالي
    getUser() {
        return this.currentUser;
    }
    
    // التحقق من حالة المصادقة
    isLoggedIn() {
        return this.isAuthenticated;
    }
    
    // الحصول على التوكن
    getToken() {
        return this.token;
    }
    
    // تحديث بيانات المستخدم
    async updateUserProfile(updatedData) {
        try {
            // التحقق من الصلاحيات
            if (!this.isAuthenticated) {
                throw new Error('غير مصرح بالدخول');
            }
            
            // عرض حالة التحميل
            this.showLoading('جاري تحديث الملف الشخصي...');
            
            // محاكاة API للتحديث
            const response = await this.mockUpdateProfileAPI(updatedData);
            
            if (response.success) {
                // تحديث بيانات المستخدم الحالي
                this.currentUser = { ...this.currentUser, ...updatedData };
                
                // حفظ في localStorage
                const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
                if (userData) {
                    const storedUser = JSON.parse(userData);
                    const updatedUser = { ...storedUser, ...updatedData };
                    
                    localStorage.setItem('user_data', JSON.stringify(updatedUser));
                    sessionStorage.setItem('user_data', JSON.stringify(updatedUser));
                }
                
                // تحديث في قاعدة البيانات المحلية
                await this.saveUserToLocalDB(this.currentUser);
                
                // إخفاء حالة التحميل
                this.hideLoading();
                
                // تسجيل الحدث
                this.logEvent('profile_updated', { 
                    userId: this.currentUser.id,
                    updatedFields: Object.keys(updatedData)
                });
                
                return {
                    success: true,
                    user: this.currentUser
                };
            } else {
                throw new Error(response.message || 'فشل تحديث الملف الشخصي');
            }
            
        } catch (error) {
            // إخفاء حالة التحميل
            this.hideLoading();
            
            // تسجيل الحدث
            this.logEvent('profile_update_failed', { error: error.message });
            
            throw error;
        }
    }
    
    async mockUpdateProfileAPI(updatedData) {
        // محاكاة API لتحديث الملف الشخصي
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'تم تحديث الملف الشخصي بنجاح'
                });
            }, 1000);
        });
    }
    
    // تغيير كلمة المرور
    async changePassword(currentPassword, newPassword) {
        try {
            // التحقق من كلمة المرور الحالية
            if (!await this.verifyPassword(currentPassword)) {
                throw new Error('كلمة المرور الحالية غير صحيحة');
            }
            
            // التحقق من قوة كلمة المرور الجديدة
            if (newPassword.length < 8) {
                throw new Error('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
            }
            
            // عرض حالة التحميل
            this.showLoading('جاري تغيير كلمة المرور...');
            
            // محاكاة API لتغيير كلمة المرور
            const response = await this.mockChangePasswordAPI(newPassword);
            
            if (response.success) {
                // إخفاء حالة التحميل
                this.hideLoading();
                
                // تسجيل الحدث
                this.logEvent('password_changed', { userId: this.currentUser.id });
                
                return {
                    success: true,
                    message: 'تم تغيير كلمة المرور بنجاح'
                };
            } else {
                throw new Error(response.message || 'فشل تغيير كلمة المرور');
            }
            
        } catch (error) {
            // إخفاء حالة التحميل
            this.hideLoading();
            
            // تسجيل الحدث
            this.logEvent('password_change_failed', { error: error.message });
            
            throw error;
        }
    }
    
    async verifyPassword(password) {
        // محاكاة التحقق من كلمة المرور
        return new Promise((resolve) => {
            setTimeout(() => {
                // في تطبيق حقيقي، هنا يتم التحقق من الخادم
                resolve(password === 'password123'); // كلمة المرور الافتراضية للتجربة
            }, 500);
        });
    }
    
    async mockChangePasswordAPI(newPassword) {
        // محاكاة API لتغيير كلمة المرور
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'تم تغيير كلمة المرور بنجاح'
                });
            }, 1000);
        });
    }
    
    // استعادة كلمة المرور
    async resetPassword(email) {
        try {
            // التحقق من البريد الإلكتروني
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('البريد الإلكتروني غير صالح');
            }
            
            // عرض حالة التحميل
            this.showLoading('جاري إرسال رابط استعادة كلمة المرور...');
            
            // محاكاة API لاستعادة كلمة المرور
            const response = await this.mockResetPasswordAPI(email);
            
            if (response.success) {
                // إخفاء حالة التحميل
                this.hideLoading();
                
                // تسجيل الحدث
                this.logEvent('password_reset_requested', { email });
                
                return {
                    success: true,
                    message: 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني'
                };
            } else {
                throw new Error(response.message || 'فشل إرسال رابط الاستعادة');
            }
            
        } catch (error) {
            // إخفاء حالة التحميل
            this.hideLoading();
            
            // تسجيل الحدث
            this.logEvent('password_reset_failed', { email, error: error.message });
            
            throw error;
        }
    }
    
    async mockResetPasswordAPI(email) {
        // محاكاة API لاستعادة كلمة المرور
        return new Promise((resolve) => {
            setTimeout(() => {
                // التحقق من وجود الحساب
                const userExists = localStorage.getItem(`user_${email}`);
                
                if (userExists) {
                    resolve({
                        success: true,
                        message: 'تم إرسال رابط الاستعادة'
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني'
                    });
                }
            }, 1500);
        });
    }
}

// تهيئة نظام المصادقة
const auth = new AuthSystem();
window.auth = auth;

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    await auth.init();
});