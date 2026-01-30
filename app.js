// تطبيق بيكسل آرت - الإصدار المتقدم مع localStorage

class PixelArtApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.notifications = [];
        this.messages = [];
        this.projects = [];
        this.designs = [];
        this.designers = [];
        this.transactions = [];
        this.conversations = [];
        this.categories = [];
        this.settings = {};
        this.isSidebarOpen = false;
        this.isChatOpen = false;
        this.isNotificationsOpen = false;
        this.isDarkMode = false;
        this.isMusicPlaying = false;
        this.isOnline = navigator.onLine;
        
        // تهيئة التخزين
        this.storage = new PixelArtStorage();
        
        this.init();
    }
    
    async init() {
        // تهيئة التطبيق
        await this.initializeApp();
        
        // تهيئة الأحداث
        this.initializeEvents();
        
        // تحميل البيانات
        await this.loadInitialData();
        
        // تحديث الواجهة
        this.updateUI();
        
        // بدء الخدمات الخلفية
        this.startBackgroundServices();
    }
    
    async initializeApp() {
        // عرض شاشة التحميل
        this.showLoadingScreen();
        
        // التحقق من تسجيل الدخول
        await this.checkAuthStatus();
        
        // تهيئة الثيم
        this.initTheme();
        
        // تحميل الإعدادات
        await this.loadSettings();
        
        // إخفاء شاشة التحميل
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 1500);
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.display = 'flex';
        
        // محاكاة تقدم التحميل
        let progress = 0;
        const progressFill = document.getElementById('progressFill');
        const loadingText = document.getElementById('loadingText');
        
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 100) progress = 100;
            
            progressFill.style.width = `${progress}%`;
            
            if (progress < 30) {
                loadingText.textContent = 'جاري تحميل الواجهة...';
            } else if (progress < 60) {
                loadingText.textContent = 'جاري تهيئة التخزين...';
            } else if (progress < 90) {
                loadingText.textContent = 'جاري تحميل البيانات...';
            } else {
                loadingText.textContent = 'جاري إكمال التهيئة...';
            }
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 100);
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingScreen.style.opacity = '1';
        }, 500);
    }
    
    async checkAuthStatus() {
        // التحقق من وجود بيانات المستخدم في localStorage
        const userData = this.storage.getItem('currentUser');
        
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.showApp();
            
            // تحديث آخر نشاط
            this.currentUser.lastActive = new Date().toISOString();
            this.storage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            return true;
        }
        
        // عرض شاشة تسجيل الدخول
        this.showAuthScreen();
        return false;
    }
    
    showAuthScreen() {
        const authScreen = document.getElementById('authScreen');
        const appContainer = document.getElementById('appContainer');
        
        authScreen.style.display = 'block';
        appContainer.style.display = 'none';
        
        // إعادة تعيين النماذج
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
    }
    
    showApp() {
        const authScreen = document.getElementById('authScreen');
        const appContainer = document.getElementById('appContainer');
        
        authScreen.style.display = 'none';
        appContainer.style.display = 'block';
        
        // تحديث معلومات المستخدم في الواجهة
        this.updateUserInfo();
    }
    
    initTheme() {
        // التحقق من الوضع الداكن
        const darkMode = this.storage.getItem('darkMode') === 'true';
        
        if (darkMode) {
            this.enableDarkMode();
        } else {
            this.disableDarkMode();
        }
        
        // التحقق من تفضيل النظام
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            if (!this.storage.getItem('darkMode')) {
                this.enableDarkMode();
            }
        }
    }
    
    enableDarkMode() {
        document.body.classList.add('dark-mode');
        this.isDarkMode = true;
        this.storage.setItem('darkMode', 'true');
    }
    
    disableDarkMode() {
        document.body.classList.remove('dark-mode');
        this.isDarkMode = false;
        this.storage.setItem('darkMode', 'false');
    }
    
    async loadSettings() {
        try {
            const settings = this.storage.getItem('settings');
            if (settings) {
                this.settings = JSON.parse(settings);
            } else {
                // إعدادات افتراضية
                this.settings = {
                    language: 'ar',
                    currency: 'SAR',
                    notifications: true,
                    sound: true,
                    autoSave: true,
                    offlineMode: true,
                    fontSize: 'medium',
                    animationSpeed: 'normal'
                };
                this.saveSettings();
            }
        } catch (error) {
            console.error('فشل تحميل الإعدادات:', error);
        }
    }
    
    saveSettings() {
        this.storage.setItem('settings', JSON.stringify(this.settings));
    }
    
    initializeEvents() {
        // أحداث المصادقة
        this.initAuthEvents();
        
        // أحداث التنقل
        this.initNavigationEvents();
        
        // أحداث القائمة الجانبية
        this.initSidebarEvents();
        
        // أحداث البحث
        this.initSearchEvents();
        
        // أحداث الإشعارات
        this.initNotificationEvents();
        
        // أحداث الدردشة
        this.initChatEvents();
        
        // أحداث الموسيقى
        this.initMusicEvents();
        
        // أحداث المودالات
        this.initModalEvents();
        
        // أحداث السحب والإفلات
        this.initDragAndDropEvents();
        
        // أحداث لوحة المفاتيح
        this.initKeyboardEvents();
        
        // أحداث اللمس
        this.initTouchEvents();
        
        // أحداث الشبكة
        this.initNetworkEvents();
        
        // أحداث طلب التصميم
        this.initDesignRequestEvents();
    }
    
    initAuthEvents() {
        // التبديل بين تسجيل الدخول وإنشاء حساب
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                
                // تحديث التبويبات النشطة
                document.querySelectorAll('.auth-tab').forEach(t => {
                    t.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // عرض النموذج المناسب
                document.querySelectorAll('.auth-form').forEach(form => {
                    form.classList.remove('active');
                });
                document.getElementById(`${tabId}Form`).classList.add('active');
            });
        });
        
        // تسجيل الدخول
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            await this.handleLogin(email, password, rememberMe);
        });
        
        // إنشاء حساب
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('registerEmail').value,
                phone: document.getElementById('registerPhone').value,
                userType: document.getElementById('userType').value,
                password: document.getElementById('registerPassword').value
            };
            
            await this.handleRegister(userData);
        });
        
        // اختيار نوع الحساب
        document.querySelectorAll('.account-type').forEach(type => {
            type.addEventListener('click', (e) => {
                document.querySelectorAll('.account-type').forEach(t => {
                    t.classList.remove('selected');
                });
                e.currentTarget.classList.add('selected');
                
                document.getElementById('userType').value = e.currentTarget.dataset.type;
            });
        });
        
        // إظهار/إخفاء كلمة المرور
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const input = e.target.closest('.input-with-icon').querySelector('input');
                const icon = e.target.querySelector('i') || e.target;
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
        
        // قوة كلمة المرور
        const passwordInput = document.getElementById('registerPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.checkPasswordStrength(e.target.value);
            });
        }
        
        // تسجيل الدخول الاجتماعي
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const provider = e.currentTarget.classList.contains('google') ? 'google' : 'twitter';
                this.handleSocialLogin(provider);
            });
        });
        
        // نسيت كلمة المرور
        const forgotPassword = document.querySelector('.forgot-password');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }
    }
    
    async handleLogin(email, password, rememberMe) {
        try {
            // عرض حالة التحميل
            const loginBtn = document.getElementById('loginBtn');
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
            loginBtn.disabled = true;
            
            // محاكاة API
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // التحقق من البيانات
            if (!email || !password) {
                throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
            }
            
            // التحقق من وجود المستخدم في localStorage
            const users = this.storage.getItem('users') || '[]';
            const usersList = JSON.parse(users);
            const user = usersList.find(u => u.email === email && u.password === password);
            
            if (!user) {
                // إذا لم يكن موجوداً، إنشاء حساب تجريبي
                this.currentUser = {
                    id: Date.now(),
                    email,
                    name: email.split('@')[0],
                    role: 'client',
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=0a9396&color=fff`,
                    balance: 1250,
                    joinDate: new Date().toISOString(),
                    lastActive: new Date().toISOString()
                };
                
                // حفظ المستخدم في القائمة
                usersList.push({
                    ...this.currentUser,
                    password: password // تحذير: في تطبيق حقيقي، لا تحفظ كلمة المرور كنص واضح
                });
                this.storage.setItem('users', JSON.stringify(usersList));
            } else {
                this.currentUser = user;
                this.currentUser.lastActive = new Date().toISOString();
            }
            
            // حفظ بيانات المستخدم الحالي
            this.storage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            if (rememberMe) {
                this.storage.setItem('rememberMe', 'true');
            }
            
            // عرض رسالة نجاح
            this.showSuccess('تم تسجيل الدخول بنجاح', 'مرحباً بك في بيكسل آرت');
            
            // الانتقال للتطبيق
            this.showApp();
            
            // تحميل بيانات المستخدم
            await this.loadUserData();
            
            // إعادة تعيين النموذج
            document.getElementById('loginForm').reset();
            
        } catch (error) {
            this.showError('فشل تسجيل الدخول', error.message);
        } finally {
            // إعادة تعيين زر التسجيل
            const loginBtn = document.getElementById('loginBtn');
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    }
    
    async handleRegister(userData) {
        try {
            // التحقق من صحة البيانات
            if (!this.validateRegistration(userData)) {
                throw new Error('يرجى ملء جميع الحقول المطلوبة بشكل صحيح');
            }
            
            // التحقق من قوة كلمة المرور
            if (userData.password.length < 8) {
                throw new Error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            }
            
            // التحقق من عدم وجود حساب بنفس البريد
            const users = this.storage.getItem('users') || '[]';
            const usersList = JSON.parse(users);
            
            if (usersList.some(u => u.email === userData.email)) {
                throw new Error('هذا البريد الإلكتروني مسجل بالفعل');
            }
            
            // عرض حالة التحميل
            const registerBtn = document.getElementById('registerBtn');
            const originalText = registerBtn.innerHTML;
            registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
            registerBtn.disabled = true;
            
            // محاكاة API
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // إنشاء المستخدم
            this.currentUser = {
                id: Date.now(),
                ...userData,
                name: `${userData.firstName} ${userData.lastName}`,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.firstName + ' ' + userData.lastName)}&background=0a9396&color=fff`,
                balance: userData.userType === 'designer' ? 0 : 500, // هدية ترحيبية للعملاء
                rating: 0,
                joinDate: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                skills: userData.userType === 'designer' ? [] : null,
                portfolio: userData.userType === 'designer' ? [] : null
            };
            
            // حفظ المستخدم في القائمة
            usersList.push({
                ...this.currentUser,
                password: userData.password // تحذير: في تطبيق حقيقي، استخدم التجزئة
            });
            this.storage.setItem('users', JSON.stringify(usersList));
            
            // حفظ المستخدم الحالي
            this.storage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            // عرض رسالة نجاح
            this.showSuccess('تم إنشاء الحساب بنجاح', 'مرحباً بك في مجتمع بيكسل آرت');
            
            // إضافة رصيد ترحيبي
            if (userData.userType === 'client') {
                this.addTransaction({
                    type: 'deposit',
                    amount: 500,
                    description: 'رصيد ترحيبي',
                    status: 'completed'
                });
            }
            
            // الانتقال للتطبيق
            this.showApp();
            
            // تحميل بيانات المستخدم
            await this.loadUserData();
            
        } catch (error) {
            this.showError('فشل إنشاء الحساب', error.message);
        } finally {
            // إعادة تعيين زر التسجيل
            const registerBtn = document.getElementById('registerBtn');
            registerBtn.innerHTML = originalText;
            registerBtn.disabled = false;
        }
    }
    
    validateRegistration(userData) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\+]?[0-9]{10,15}$/;
        
        return (
            userData.firstName &&
            userData.lastName &&
            emailRegex.test(userData.email) &&
            phoneRegex.test(userData.phone) &&
            userData.password
        );
    }
    
    checkPasswordStrength(password) {
        const strengthBar = document.getElementById('strengthBar');
        const strengthText = document.getElementById('strengthText');
        
        if (!strengthBar || !strengthText) return;
        
        let strength = 0;
        let text = '';
        let color = '';
        
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        
        if (strength === 0) {
            text = 'لم تدخل كلمة مرور';
            color = 'transparent';
        } else if (strength <= 25) {
            text = 'ضعيفة جداً';
            color = '#ef4444';
        } else if (strength <= 50) {
            text = 'ضعيفة';
            color = '#f97316';
        } else if (strength <= 75) {
            text = 'جيدة';
            color = '#eab308';
        } else {
            text = 'قوية';
            color = '#22c55e';
        }
        
        strengthBar.style.width = `${strength}%`;
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = `قوة كلمة المرور: ${text}`;
        strengthText.style.color = color;
    }
    
    async handleSocialLogin(provider) {
        try {
            this.showLoading('جاري الاتصال بـ ' + (provider === 'google' ? 'Google' : 'Twitter'));
            
            // محاكاة تسجيل الدخول الاجتماعي
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // إنشاء/استعادة حساب
            const userEmail = `user_${Date.now()}@${provider}.com`;
            this.currentUser = {
                id: Date.now(),
                email: userEmail,
                name: provider === 'google' ? 'مستخدم Google' : 'مستخدم Twitter',
                role: 'client',
                avatar: `https://ui-avatars.com/api/?name=${provider}&background=0a9396&color=fff`,
                balance: 500,
                joinDate: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                socialLogin: provider
            };
            
            this.storage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            this.showSuccess('تم التسجيل بنجاح', 'مرحباً بك!');
            this.showApp();
            await this.loadUserData();
            
        } catch (error) {
            this.showError('فشل التسجيل', error.message);
        }
    }
    
    async handleForgotPassword() {
        const email = prompt('أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور:');
        if (email) {
            try {
                this.showLoading('جاري إرسال رابط إعادة التعيين...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                this.showSuccess('تم الإرسال', 'تحقق من بريدك الإلكتروني لإكمال العملية');
            } catch (error) {
                this.showError('فشل الإرسال', error.message);
            }
        }
    }
    
    initNavigationEvents() {
        // التنقل في القائمة الجانبية
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const href = e.currentTarget.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const page = href.substring(1);
                    this.navigateTo(page);
                }
            });
        });
        
        // التنقل في الشريط السفلي للأجهزة المحمولة
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const href = e.currentTarget.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const page = href.substring(1);
                    this.navigateTo(page);
                    
                    // تحديث العناصر النشطة
                    document.querySelectorAll('.mobile-nav-item').forEach(navItem => {
                        navItem.classList.remove('active');
                    });
                    e.currentTarget.classList.add('active');
                }
            });
        });
        
        // زر الإجراء السريع
        const quickActionBtn = document.getElementById('quickActionBtn');
        if (quickActionBtn) {
            quickActionBtn.addEventListener('click', () => {
                this.toggleQuickActions();
            });
        }
        
        // الإجراءات السريعة
        document.querySelectorAll('.quick-action').forEach(action => {
            action.addEventListener('click', (e) => {
                const actionType = e.currentTarget.dataset.action;
                this.handleQuickAction(actionType);
            });
        });
        
        // زر التصميم السريع
        const quickDesignBtn = document.getElementById('quickDesignBtn');
        if (quickDesignBtn) {
            quickDesignBtn.addEventListener('click', () => {
                this.openDesignRequestModal();
            });
        }
        
        // زر إنشاء مشروع جديد
        const createProjectBtn = document.getElementById('createProjectBtn');
        if (createProjectBtn) {
            createProjectBtn.addEventListener('click', () => {
                this.openNewProjectModal();
            });
        }
        
        // زر تحديث لوحة التحكم
        const refreshDashboard = document.getElementById('refreshDashboard');
        if (refreshDashboard) {
            refreshDashboard.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }
        
        // زر تحميل المزيد (استكشاف التصاميم)
        const loadMoreBtn = document.getElementById('loadMoreDesigns');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreDesigns();
            });
        }
        
        // زر التوظيف (المصممون)
        document.querySelectorAll('.hire-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const designerCard = e.target.closest('.designer-card');
                if (designerCard) {
                    const designerName = designerCard.querySelector('.designer-name').textContent;
                    this.hireDesigner(designerName);
                }
            });
        }
        
        // زر مشروع جديد (المشاريع)
        const newProjectBtn = document.getElementById('newProjectBtn');
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => {
                this.openNewProjectModal();
            });
        }
        
        // تغيير عرض المشاريع
        document.querySelectorAll('.view-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.changeProjectsView(view);
            });
        });
        
        // تصفية المشاريع
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.filterProjects(filter);
            });
        });
        
        // زر إيداع (المحفظة)
        const depositBtn = document.getElementById('depositBtn');
        if (depositBtn) {
            depositBtn.addEventListener('click', () => {
                this.openDepositModal();
            });
        }
        
        // زر سحب (المحفظة)
        const withdrawBtn = document.getElementById('withdrawBtn');
        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', () => {
                this.openWithdrawModal();
            });
        }
        
        // زر إضافة طريقة دفع
        const addPaymentMethod = document.getElementById('addPaymentMethod');
        if (addPaymentMethod) {
            addPaymentMethod.addEventListener('click', () => {
                this.openAddPaymentMethodModal();
            });
        }
        
        // زر رسالة جديدة (الدردشة)
        const newMessageBtn = document.getElementById('newMessageBtn');
        if (newMessageBtn) {
            newMessageBtn.addEventListener('click', () => {
                this.openNewMessageModal();
            });
        }
        
        // زر بحث (الدردشة)
        const chatSearchBtn = document.getElementById('chatSearchBtn');
        if (chatSearchBtn) {
            chatSearchBtn.addEventListener('click', () => {
                this.searchChat();
            });
        }
    }
    
    navigateTo(page) {
        // إخفاء جميع الصفحات
        document.querySelectorAll('.dashboard-section, .explore-section, .designers-section, .projects-section, .design-request-section, .design-tools-section, .wallet-section, .chat-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // إخفاء القائمة الجانبية على الأجهزة المحمولة
        if (window.innerWidth < 768) {
            this.closeSidebar();
        }
        
        // إخفاء الإجراءات السريعة
        this.hideQuickActions();
        
        // عرض الصفحة المطلوبة
        const targetPage = document.getElementById(page);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;
            
            // تحديث العنوان في المتصفح
            history.pushState({ page }, '', `#${page}`);
            
            // تحميل بيانات الصفحة
            this.loadPageData(page);
            
            // تحديث العناصر النشطة في القائمة الجانبية
            document.querySelectorAll('.nav-item').forEach(item => {
                if (item.getAttribute('href') === `#${page}`) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // تحديث العنوان في شريط العنوان
            document.title = `بيكسل آرت | ${this.getPageTitle(page)}`;
        }
    }
    
    getPageTitle(page) {
        const titles = {
            'dashboard': 'لوحة التحكم',
            'explore': 'استكشاف التصاميم',
            'designers': 'المصممون',
            'projects': 'المشاريع',
            'design-request': 'طلب تصميم جديد',
            'design-tools': 'أدوات التصميم',
            'wallet': 'المحفظة المالية',
            'messages': 'الرسائل'
        };
        return titles[page] || 'بيكسل آرت';
    }
    
    loadPageData(page) {
        switch (page) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'explore':
                this.loadExploreData();
                break;
            case 'designers':
                this.loadDesignersData();
                break;
            case 'projects':
                this.loadProjectsData();
                break;
            case 'design-request':
                this.loadDesignRequestData();
                break;
            case 'design-tools':
                this.loadDesignToolsData();
                break;
            case 'wallet':
                this.loadWalletData();
                break;
            case 'messages':
                this.loadMessagesData();
                break;
        }
    }
    
    async loadDashboardData() {
        try {
            // تحميل الإحصائيات
            const stats = await this.fetchDashboardStats();
            
            // تحديث واجهة المستخدم
            const activeProjectsEl = document.getElementById('activeProjects');
            const walletBalanceEl = document.getElementById('walletBalance');
            const pendingProjectsEl = document.getElementById('pendingProjects');
            const userRatingEl = document.getElementById('userRating');
            
            if (activeProjectsEl) activeProjectsEl.textContent = stats.activeProjects || 0;
            if (walletBalanceEl) walletBalanceEl.textContent = `${stats.walletBalance || 0} ريال`;
            if (pendingProjectsEl) pendingProjectsEl.textContent = stats.pendingProjects || 0;
            if (userRatingEl) userRatingEl.textContent = stats.userRating || '0.0';
            
            // تحميل التصاميم المميزة
            await this.loadFeaturedDesigns();
            
            // تحميل المشاريع الحديثة
            await this.loadRecentProjects();
            
            // تحميل النشاط الحديث
            await this.loadRecentActivity();
            
        } catch (error) {
            console.error('فشل تحميل بيانات لوحة التحكم:', error);
        }
    }
    
    async fetchDashboardStats() {
        // تحميل الإحصائيات من localStorage
        return new Promise(resolve => {
            setTimeout(() => {
                const projects = this.storage.getItem('projects') || '[]';
                const projectsList = JSON.parse(projects);
                const userProjects = projectsList.filter(p => p.userId === this.currentUser?.id);
                
                const activeProjects = userProjects.filter(p => p.status === 'active').length;
                const pendingProjects = userProjects.filter(p => p.status === 'pending').length;
                
                resolve({
                    activeProjects,
                    walletBalance: this.currentUser?.balance || 0,
                    pendingProjects,
                    userRating: this.currentUser?.rating || 4.8
                });
            }, 300);
        });
    }
    
    async loadFeaturedDesigns() {
        const slider = document.getElementById('featuredSlider');
        if (!slider) return;
        
        // تحميل التصاميم المميزة من localStorage
        const designs = this.storage.getItem('featuredDesigns') || '[]';
        let featuredDesigns = JSON.parse(designs);
        
        // إذا لم تكن هناك تصاميم، إنشاء بيانات تجريبية
        if (featuredDesigns.length === 0) {
            featuredDesigns = this.generateSampleDesigns(3);
            this.storage.setItem('featuredDesigns', JSON.stringify(featuredDesigns));
        }
        
        // إنشاء الشرائح
        slider.innerHTML = '';
        featuredDesigns.forEach((design, index) => {
            const slide = document.createElement('div');
            slide.className = 'featured-slide';
            slide.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${design.image})`;
            slide.style.backgroundSize = 'cover';
            slide.style.backgroundPosition = 'center';
            
            slide.innerHTML = `
                <div class="featured-slide-content">
                    <span class="design-category">${design.category}</span>
                    <h4>${design.title}</h4>
                    <p>${design.description}</p>
                    <div class="design-meta">
                        <span class="designer">بواسطة ${design.designer}</span>
                        <span class="rating">⭐ ${design.rating}</span>
                        <span class="price">${design.price} ريال</span>
                    </div>
                    <button class="action-btn" onclick="app.viewDesign(${design.id})">
                        <i class="fas fa-eye"></i>
                        عرض التصميم
                    </button>
                </div>
            `;
            
            slider.appendChild(slide);
        });
        
        // تهيئة المنزلق
        this.initFeaturedSlider();
    }
    
    generateSampleDesigns(count = 3) {
        const designs = [
            {
                id: 1,
                title: "تصميم هوية متكاملة",
                description: "هوية بصرية متكاملة لعلامة تجارية ناشئة",
                category: "هوية بصرية",
                designer: "أحمد المصمم",
                rating: 4.9,
                price: 1500,
                image: "https://images.unsplash.com/photo-1567446537710-0c5ff5a6ac32?w=600&h=400&fit=crop"
            },
            {
                id: 2,
                title: "تصميم تطبيق جوال",
                description: "واجهة مستخدم لتطبيق توصيل طعام",
                category: "UI/UX",
                designer: "سارة المصممة",
                rating: 4.8,
                price: 2500,
                image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop"
            },
            {
                id: 3,
                title: "تصميم موقع إلكتروني",
                description: "موقع متكامل للتجارة الإلكترونية",
                category: "Web Design",
                designer: "محمد المصمم",
                rating: 4.7,
                price: 3500,
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
            }
        ];
        
        return designs.slice(0, count);
    }
    
    initFeaturedSlider() {
        const slider = document.getElementById('featuredSlider');
        if (!slider) return;
        
        const slides = slider.querySelectorAll('.featured-slide');
        if (slides.length === 0) return;
        
        let currentSlide = 0;
        
        // وظيفة عرض الشريحة
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.style.transform = `translateX(${100 * (i - index)}%)`;
            });
        }
        
        // التبديل التلقائي
        const interval = setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }, 5000);
        
        // إيقاف التبديل عند التفاعل
        slider.addEventListener('mouseenter', () => clearInterval(interval));
        slider.addEventListener('mouseleave', () => {
            interval = setInterval(() => {
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            }, 5000);
        });
        
        // العرض الأولي
        showSlide(0);
    }
    
    async loadRecentProjects() {
        const tableBody = document.getElementById('projectsTable');
        if (!tableBody) return;
        
        // تحميل المشاريع من localStorage
        const projects = this.storage.getItem('projects') || '[]';
        const projectsList = JSON.parse(projects);
        const userProjects = projectsList.filter(p => p.userId === this.currentUser?.id);
        
        // إنشاء صفوف الجدول
        tableBody.innerHTML = '';
        userProjects.slice(0, 5).forEach(project => {
            const row = document.createElement('div');
            row.className = 'project-row';
            
            let statusText = '';
            let statusClass = '';
            
            switch (project.status) {
                case 'pending':
                    statusText = 'قيد الانتظار';
                    statusClass = 'pending';
                    break;
                case 'in-progress':
                    statusText = 'قيد التنفيذ';
                    statusClass = 'in-progress';
                    break;
                case 'completed':
                    statusText = 'مكتمل';
                    statusClass = 'completed';
                    break;
                default:
                    statusText = 'جديد';
                    statusClass = 'pending';
            }
            
            row.innerHTML = `
                <div class="project-info">
                    <div class="project-icon">
                        <i class="fas fa-palette"></i>
                    </div>
                    <div class="project-details">
                        <h4>${project.name}</h4>
                        <span>${project.price} ريال</span>
                    </div>
                </div>
                <div class="designer-info">
                    <img src="${project.designerAvatar || 'https://ui-avatars.com/api/?name=مصمم&background=005f73&color=fff'}" 
                         alt="${project.designerName}" class="designer-avatar">
                    <span>${project.designerName || 'مصمم'}</span>
                </div>
                <div class="status-badge ${statusClass}">${statusText}</div>
                <div>${this.formatDate(project.createdAt)}</div>
                <div class="project-actions">
                    <button class="action-icon-btn" onclick="app.viewProject('${project.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-icon-btn" onclick="app.editProject('${project.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-icon-btn" onclick="app.deleteProject('${project.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    async loadRecentActivity() {
        const timeline = document.getElementById('activityTimeline');
        if (!timeline) return;
        
        // تحميل النشاط من localStorage
        const activities = this.storage.getItem('activities') || '[]';
        let activitiesList = JSON.parse(activities);
        
        // إذا لم تكن هناك نشاطات، إنشاء بيانات تجريبية
        if (activitiesList.length === 0) {
            activitiesList = this.generateSampleActivities();
            this.storage.setItem('activities', JSON.stringify(activitiesList));
        }
        
        // عرض آخر 4 نشاطات للمستخدم
        const userActivities = activitiesList
            .filter(a => a.userId === this.currentUser?.id)
            .slice(0, 4);
        
        // إنشاء خط الزمن
        timeline.innerHTML = '';
        userActivities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            item.innerHTML = `
                <div class="activity-dot"></div>
                <div class="activity-time">${this.formatTime(activity.time)}</div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                </div>
            `;
            
            timeline.appendChild(item);
        });
    }
    
    generateSampleActivities() {
        return [
            {
                id: 1,
                userId: this.currentUser?.id,
                time: new Date(Date.now() - 300000).toISOString(),
                title: "تم إنشاء مشروع جديد",
                description: "تم إنشاء مشروع 'هوية بصرية لمطعم'"
            },
            {
                id: 2,
                userId: this.currentUser?.id,
                time: new Date(Date.now() - 1800000).toISOString(),
                title: "تم استلام الدفعة",
                description: "تم استلام دفعة بقيمة 1500 ريال للمشروع #123"
            },
            {
                id: 3,
                userId: this.currentUser?.id,
                time: new Date(Date.now() - 10800000).toISOString(),
                title: "تم إكمال التصميم",
                description: "تم تسليم التصميم النهائي للمشروع #122"
            },
            {
                id: 4,
                userId: this.currentUser?.id,
                time: new Date(Date.now() - 86400000).toISOString(),
                title: "تمت إضافة تقييم جديد",
                description: "أضاف أحمد المصمم تقييماً جديداً لعملك"
            }
        ];
    }
    
    initSidebarEvents() {
        // زر فتح/إغلاق القائمة
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menuToggle');
            
            if (this.isSidebarOpen && 
                sidebar && 
                !sidebar.contains(e.target) && 
                menuToggle && 
                !menuToggle.contains(e.target)) {
                this.closeSidebar();
            }
        });
        
        // زر الترقية
        const upgradeBtn = document.querySelector('.upgrade-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                this.openUpgradeModal();
            });
        }
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
            this.isSidebarOpen = sidebar.classList.contains('open');
            
            // إضافة تأثير على المحتوى الرئيسي
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                if (this.isSidebarOpen && window.innerWidth >= 768) {
                    mainContent.style.marginRight = '280px';
                } else {
                    mainContent.style.marginRight = '0';
                }
            }
        }
    }
    
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
            this.isSidebarOpen = false;
            
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.style.marginRight = '0';
            }
        }
    }
    
    initSearchEvents() {
        const searchInput = document.getElementById('globalSearch');
        const searchFilter = document.getElementById('searchFilter');
        
        if (searchInput) {
            // بحث بزمن تأخير
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 500);
            });
            
            // بحث عند الضغط على Enter
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }
        
        if (searchFilter) {
            // زر الفلتر
            searchFilter.addEventListener('click', () => {
                this.openSearchFilterModal();
            });
        }
    }
    
    async performSearch(query) {
        if (!query.trim()) {
            this.clearSearchResults();
            return;
        }
        
        try {
            // البحث في localStorage
            const results = await this.searchInStorage(query);
            
            // عرض النتائج
            this.displaySearchResults(results, query);
            
        } catch (error) {
            console.error('فشل البحث:', error);
            this.showError('فشل البحث', 'حدث خطأ أثناء البحث');
        }
    }
    
    async searchInStorage(query) {
        return new Promise(resolve => {
            setTimeout(() => {
                // تحميل البيانات من localStorage
                const designs = JSON.parse(this.storage.getItem('designs') || '[]');
                const designers = JSON.parse(this.storage.getItem('designers') || '[]');
                const projects = JSON.parse(this.storage.getItem('projects') || '[]');
                
                const searchResults = {
                    designs: designs.filter(d => 
                        d.title?.toLowerCase().includes(query.toLowerCase()) ||
                        d.description?.toLowerCase().includes(query.toLowerCase()) ||
                        d.category?.toLowerCase().includes(query.toLowerCase())
                    ).slice(0, 5),
                    
                    designers: designers.filter(d => 
                        d.name?.toLowerCase().includes(query.toLowerCase()) ||
                        d.title?.toLowerCase().includes(query.toLowerCase()) ||
                        d.skills?.some(s => s.toLowerCase().includes(query.toLowerCase()))
                    ).slice(0, 5),
                    
                    projects: projects.filter(p => 
                        p.name?.toLowerCase().includes(query.toLowerCase()) ||
                        p.description?.toLowerCase().includes(query.toLowerCase())
                    ).slice(0, 5)
                };
                
                resolve(searchResults);
            }, 300);
        });
    }
    
    displaySearchResults(results, query) {
        // إنشاء مودال لعرض النتائج
        this.showSearchResultsModal(results, query);
    }
    
    showSearchResultsModal(results, query) {
        // حساب إجمالي النتائج
        const totalResults = 
            (results.designs?.length || 0) + 
            (results.designers?.length || 0) + 
            (results.projects?.length || 0);
        
        // إنشاء محتوى المودال
        const modalContent = `
            <div class="modal-header">
                <h3>نتائج البحث عن: "${query}"</h3>
                <button class="modal-close" onclick="app.closeModal('searchResultsModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="search-summary">
                    <p>تم العثور على ${totalResults} نتيجة</p>
                </div>
                
                ${results.designs?.length > 0 ? `
                <div class="search-section">
                    <h4>التصاميم (${results.designs.length})</h4>
                    <div class="search-results-list">
                        ${results.designs.map(design => `
                            <div class="search-result-item" onclick="app.viewDesign(${design.id})">
                                <div class="result-icon">
                                    <i class="fas fa-palette"></i>
                                </div>
                                <div class="result-details">
                                    <h5>${design.title}</h5>
                                    <p>${design.description?.substring(0, 100)}...</p>
                                    <span class="result-meta">${design.category} • ${design.price} ريال</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${results.designers?.length > 0 ? `
                <div class="search-section">
                    <h4>المصممون (${results.designers.length})</h4>
                    <div class="search-results-list">
                        ${results.designers.map(designer => `
                            <div class="search-result-item" onclick="app.viewDesigner(${designer.id})">
                                <div class="result-icon">
                                    <img src="${designer.avatar}" alt="${designer.name}">
                                </div>
                                <div class="result-details">
                                    <h5>${designer.name}</h5>
                                    <p>${designer.title}</p>
                                    <span class="result-meta">⭐ ${designer.rating} • ${designer.projects} مشروع</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${results.projects?.length > 0 ? `
                <div class="search-section">
                    <h4>المشاريع (${results.projects.length})</h4>
                    <div class="search-results-list">
                        ${results.projects.map(project => `
                            <div class="search-result-item" onclick="app.viewProject('${project.id}')">
                                <div class="result-icon">
                                    <i class="fas fa-project-diagram"></i>
                                </div>
                                <div class="result-details">
                                    <h5>${project.name}</h5>
                                    <p>${project.description?.substring(0, 100)}...</p>
                                    <span class="result-meta">${this.formatDate(project.createdAt)} • ${project.status}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${totalResults === 0 ? `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>لا توجد نتائج للبحث عن "${query}"</p>
                </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="action-btn outline" onclick="app.closeModal('searchResultsModal')">
                    إغلاق
                </button>
            </div>
        `;
        
        // إنشاء أو تحديث المودال
        let modal = document.getElementById('searchResultsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'searchResultsModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = modalContent;
        this.openModal('searchResultsModal');
    }
    
    clearSearchResults() {
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.value = '';
        }
        this.closeModal('searchResultsModal');
    }
    
    initNotificationEvents() {
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationsPanel = document.getElementById('notificationsPanel');
        
        if (notificationBtn) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotifications();
            });
        }
        
        // إغلاق عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (this.isNotificationsOpen && 
                notificationsPanel && 
                !notificationsPanel.contains(e.target) && 
                notificationBtn && 
                !notificationBtn.contains(e.target)) {
                this.closeNotifications();
            }
        });
        
        // تعيين الكل كمقروء
        const markAllRead = document.getElementById('markAllRead');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                this.markAllNotificationsAsRead();
            });
        }
        
        // حذف الكل
        const clearNotifications = document.getElementById('clearNotifications');
        if (clearNotifications) {
            clearNotifications.addEventListener('click', () => {
                this.clearAllNotifications();
            });
        }
    }
    
    toggleNotifications() {
        const panel = document.getElementById('notificationsPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
            this.isNotificationsOpen = panel.style.display === 'block';
            
            if (this.isNotificationsOpen) {
                this.loadNotifications();
            }
        }
    }
    
    closeNotifications() {
        const panel = document.getElementById('notificationsPanel');
        if (panel) {
            panel.style.display = 'none';
            this.isNotificationsOpen = false;
        }
    }
    
    async loadNotifications() {
        const list = document.getElementById('notificationsList');
        if (!list) return;
        
        // تحميل الإشعارات من localStorage
        const notifications = this.storage.getItem('notifications') || '[]';
        let notificationsList = JSON.parse(notifications);
        
        // تصفية إشعارات المستخدم الحالي
        const userNotifications = notificationsList
            .filter(n => n.userId === this.currentUser?.id)
            .sort((a, b) => new Date(b.time) - new Date(a.time));
        
        // تحديث العد
        const unreadCount = userNotifications.filter(n => !n.read).length;
        const countElement = document.getElementById('notificationCount');
        if (countElement) {
            countElement.textContent = unreadCount > 9 ? '9+' : unreadCount;
            countElement.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
        
        // عرض الإشعارات
        list.innerHTML = '';
        userNotifications.slice(0, 10).forEach(notification => {
            const item = document.createElement('div');
            item.className = `notification-item ${notification.read ? '' : 'unread'}`;
            item.onclick = () => this.handleNotificationClick(notification);
            
            item.innerHTML = `
                <div class="notification-header">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-time">${this.formatTime(notification.time)}</div>
                </div>
                <div class="notification-content">${notification.message}</div>
                ${!notification.read ? `
                <div class="notification-actions">
                    <button class="action-link" onclick="event.stopPropagation(); app.markNotificationAsRead('${notification.id}')">تعيين كمقروء</button>
                </div>
                ` : ''}
            `;
            
            list.appendChild(item);
        });
        
        if (userNotifications.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p>لا توجد إشعارات</p>
                </div>
            `;
        }
    }
    
    async fetchNotifications() {
        // تحميل الإشعارات من localStorage
        const notifications = this.storage.getItem('notifications') || '[]';
        return JSON.parse(notifications)
            .filter(n => n.userId === this.currentUser?.id)
            .sort((a, b) => new Date(b.time) - new Date(a.time));
    }
    
    initChatEvents() {
        const chatBtn = document.getElementById('chatBtn');
        const chatWindow = document.getElementById('chatWindow');
        const minimizeChat = document.getElementById('minimizeChat');
        const closeChat = document.getElementById('closeChat');
        const sendMessageBtn = document.getElementById('sendMessageBtn');
        const chatInput = document.getElementById('chatInput');
        
        if (chatBtn) {
            chatBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleChat();
            });
        }
        
        if (minimizeChat) {
            minimizeChat.addEventListener('click', () => {
                this.minimizeChatWindow();
            });
        }
        
        if (closeChat) {
            closeChat.addEventListener('click', () => {
                this.closeChat();
            });
        }
        
        if (sendMessageBtn) {
            sendMessageBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        
        // إغلاق عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (this.isChatOpen && 
                chatWindow && 
                !chatWindow.contains(e.target) && 
                chatBtn && 
                !chatBtn.contains(e.target)) {
                this.closeChat();
            }
        });
    }
    
    toggleChat() {
        const window = document.getElementById('chatWindow');
        if (window) {
            window.style.display = window.style.display === 'flex' ? 'none' : 'flex';
            this.isChatOpen = window.style.display === 'flex';
            
            if (this.isChatOpen) {
                this.loadChatMessages();
                const chatInput = document.getElementById('chatInput');
                if (chatInput) chatInput.focus();
            }
        }
    }
    
    minimizeChatWindow() {
        const window = document.getElementById('chatWindow');
        if (window) {
            const body = document.getElementById('chatBody');
            const footer = document.querySelector('.chat-footer');
            
            if (window.classList.contains('minimized')) {
                window.classList.remove('minimized');
                if (body) body.style.display = 'block';
                if (footer) footer.style.display = 'flex';
                window.style.height = '500px';
            } else {
                window.classList.add('minimized');
                if (body) body.style.display = 'none';
                if (footer) footer.style.display = 'none';
                window.style.height = 'auto';
            }
        }
    }
    
    closeChat() {
        const window = document.getElementById('chatWindow');
        if (window) {
            window.style.display = 'none';
            this.isChatOpen = false;
        }
    }
    
    async loadChatMessages() {
        const chatBody = document.getElementById('chatBody');
        if (!chatBody) return;
        
        // تحميل الرسائل من localStorage
        const messages = this.storage.getItem('chatMessages') || '[]';
        let messagesList = JSON.parse(messages);
        
        // إذا لم تكن هناك رسائل، إنشاء بيانات تجريبية
        if (messagesList.length === 0) {
            messagesList = this.generateSampleMessages();
            this.storage.setItem('chatMessages', JSON.stringify(messagesList));
        }
        
        // عرض الرسائل
        chatBody.innerHTML = '';
        messagesList.forEach(message => {
            this.displayMessage(message);
        });
        
        // التمرير للأسفل
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    
    generateSampleMessages() {
        return [
            {
                id: 1,
                conversationId: 'conv1',
                sender: 'designer',
                senderName: 'أحمد المصمم',
                senderAvatar: 'https://ui-avatars.com/api/?name=أحمد+المصمم&background=005f73&color=fff',
                message: 'مرحباً، كيف يمكنني مساعدتك اليوم؟',
                time: new Date(Date.now() - 3600000).toISOString(),
                read: true
            },
            {
                id: 2,
                conversationId: 'conv1',
                sender: 'user',
                senderName: this.currentUser?.name || 'أنت',
                senderAvatar: this.currentUser?.avatar,
                message: 'أحتاج إلى تعديلات على التصميم الذي قدمته',
                time: new Date(Date.now() - 1800000).toISOString(),
                read: true
            },
            {
                id: 3,
                conversationId: 'conv1',
                sender: 'designer',
                senderName: 'أحمد المصمم',
                senderAvatar: 'https://ui-avatars.com/api/api/?name=أحمد+المصمم&background=005f73&color=fff',
                message: 'أي تعديلات بالضبط تريدها؟',
                time: new Date(Date.now() - 600000).toISOString(),
                read: true
            }
        ];
    }
    
    async sendMessage() {
        const input = document.getElementById('chatInput');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        try {
            // إنشاء رسالة جديدة
            const newMessage = {
                id: Date.now(),
                conversationId: 'conv1',
                sender: 'user',
                senderName: this.currentUser?.name || 'أنت',
                senderAvatar: this.currentUser?.avatar,
                message,
                time: new Date().toISOString(),
                read: false
            };
            
            // عرض الرسالة
            this.displayMessage(newMessage);
            
            // حفظ الرسالة في localStorage
            const messages = this.storage.getItem('chatMessages') || '[]';
            const messagesList = JSON.parse(messages);
            messagesList.push(newMessage);
            this.storage.setItem('chatMessages', JSON.stringify(messagesList));
            
            // محاكاة رد المصمم
            setTimeout(() => {
                const response = {
                    id: Date.now() + 1,
                    conversationId: 'conv1',
                    sender: 'designer',
                    senderName: 'أحمد المصمم',
                    senderAvatar: 'https://ui-avatars.com/api/?name=أحمد+المصمم&background=005f73&color=fff',
                    message: 'تم استلام رسالتك، سأقوم بالتعديلات المطلوبة',
                    time: new Date().toISOString(),
                    read: false
                };
                
                this.displayMessage(response);
                messagesList.push(response);
                this.storage.setItem('chatMessages', JSON.stringify(messagesList));
                
                // تحديث عد الرسائل غير المقروءة
                this.updateUnreadMessagesCount();
                
                // إضافة إشعار
                this.addNotification({
                    userId: this.currentUser?.id,
                    title: 'رد جديد',
                    message: 'قام أحمد المصمم بالرد على رسالتك',
                    type: 'message'
                });
                
            }, 1000);
            
            // تفريغ حقل الإدخال
            input.value = '';
            input.focus();
            
        } catch (error) {
            console.error('فشل إرسال الرسالة:', error);
            this.showError('فشل إرسال الرسالة', 'يرجى المحاولة مرة أخرى');
        }
    }
    
    displayMessage(message) {
        const chatBody = document.getElementById('chatBody');
        if (!chatBody) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender === 'user' ? 'sent' : 'received'}`;
        
        const time = this.formatTime(message.time);
        
        messageElement.innerHTML = `
            ${message.sender !== 'user' ? `
            <div class="message-avatar">
                <img src="${message.senderAvatar}" alt="${message.senderName}">
            </div>
            ` : ''}
            <div class="message-content">
                ${message.sender !== 'user' ? `
                <div class="message-header">
                    <span class="sender-name">${message.senderName}</span>
                </div>
                ` : ''}
                <div class="message-body">
                    <p>${message.message}</p>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;
        
        chatBody.appendChild(messageElement);
        
        // التمرير للأسفل
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    
    initMusicEvents() {
        const playPause = document.getElementById('playPause');
        const prevTrack = document.getElementById('prevTrack');
        const nextTrack = document.getElementById('nextTrack');
        const progressSlider = document.getElementById('progressSlider');
        const playerSettings = document.getElementById('playerSettings');
        const playerClose = document.getElementById('playerClose');
        
        if (playPause) {
            playPause.addEventListener('click', () => {
                this.toggleMusic();
            });
        }
        
        if (prevTrack) {
            prevTrack.addEventListener('click', () => {
                this.previousTrack();
            });
        }
        
        if (nextTrack) {
            nextTrack.addEventListener('click', () => {
                this.nextTrack();
            });
        }
        
        if (progressSlider) {
            progressSlider.addEventListener('input', (e) => {
                this.seekMusic(e.target.value);
            });
        }
        
        if (playerSettings) {
            playerSettings.addEventListener('click', () => {
                this.openMusicSettings();
            });
        }
        
        if (playerClose) {
            playerClose.addEventListener('click', () => {
                this.closeMusicPlayer();
            });
        }
    }
    
    toggleMusic() {
        const playPause = document.getElementById('playPause');
        if (!playPause) return;
        
        const icon = playPause.querySelector('i');
        
        if (this.isMusicPlaying) {
            // إيقاف الموسيقى
            this.pauseMusic();
            if (icon) {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        } else {
            // تشغيل الموسيقى
            this.playMusic();
            if (icon) {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
            }
        }
        
        this.isMusicPlaying = !this.isMusicPlaying;
    }
    
    playMusic() {
        console.log('تشغيل الموسيقى...');
        this.startProgressUpdate();
        
        // حفظ حالة التشغيل
        this.storage.setItem('musicPlaying', 'true');
    }
    
    pauseMusic() {
        console.log('إيقاف الموسيقى...');
        this.stopProgressUpdate();
        
        // حفظ حالة الإيقاف
        this.storage.setItem('musicPlaying', 'false');
    }
    
    startProgressUpdate() {
        // محاكاة تحديث شريط التقدم
        this.progressInterval = setInterval(() => {
            const slider = document.getElementById('progressSlider');
            if (slider) {
                let value = parseInt(slider.value);
                
                if (value < 100) {
                    slider.value = value + 1;
                } else {
                    this.nextTrack();
                }
            }
        }, 1000);
    }
    
    stopProgressUpdate() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
    }
    
    previousTrack() {
        console.log('الانتقال إلى المقطع السابق');
        const slider = document.getElementById('progressSlider');
        if (slider) slider.value = 0;
    }
    
    nextTrack() {
        console.log('الانتقال إلى المقطع التالي');
        const slider = document.getElementById('progressSlider');
        if (slider) slider.value = 0;
    }
    
    seekMusic(position) {
        console.log('التقدم إلى:', position, '%');
    }
    
    initModalEvents() {
        // إغلاق المودالات عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (e.target.id === 'modalOverlay') {
                this.closeAllModals();
            }
        });
        
        // إغلاق المودالات بمفتاح Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // إغلاق المودالات بزر الإغلاق
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal-close') || e.target.closest('.close-actions')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            }
        });
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            modal.style.display = 'block';
            overlay.style.display = 'block';
            
            // منع التمرير خلف المودال
            document.body.style.overflow = 'hidden';
            
            // إضافة تأثير الظهور
            modal.style.animation = 'modalIn 0.3s ease';
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modalOverlay');
        
        if (modal) {
            modal.style.display = 'none';
        }
        
        // إخفاء الـ overlay إذا لم تكن هناك مودالات مفتوحة
        const openModals = document.querySelectorAll('.modal[style*="display: block"]');
        if (openModals.length === 0 && overlay) {
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        document.body.style.overflow = 'auto';
    }
    
    initDragAndDropEvents() {
        // سحب وإفلات الملفات
        const dropZones = document.querySelectorAll('.file-upload-area');
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('dragover');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('dragover');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                const target = zone.dataset.target || 'default';
                this.handleDroppedFiles(files, target);
            });
        });
        
        // نقر لرفع الملفات
        dropZones.forEach(zone => {
            zone.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT') {
                    const fileInput = zone.querySelector('input[type="file"]');
                    if (fileInput) {
                        fileInput.click();
                    }
                }
            });
        });
        
        // تغيير الملفات عند الاختيار
        document.querySelectorAll('input[type="file"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const files = e.target.files;
                const target = e.target.dataset.target || 'default';
                this.handleSelectedFiles(files, target);
            });
        });
    }
    
    async handleDroppedFiles(files, target) {
        try {
            this.showLoading('جاري رفع الملفات...');
            
            for (let file of files) {
                await this.uploadFile(file, target);
            }
            
            this.showSuccess('تم رفع الملفات', `تم رفع ${files.length} ملف بنجاح`);
        } catch (error) {
            this.showError('فشل رفع الملفات', error.message);
        }
    }
    
    async handleSelectedFiles(files, target) {
        try {
            this.showLoading('جاري معالجة الملفات...');
            
            for (let file of files) {
                await this.processFile(file, target);
            }
            
            this.showSuccess('تم معالجة الملفات', `تمت معالجة ${files.length} ملف بنجاح`);
        } catch (error) {
            this.showError('فشل معالجة الملفات', error.message);
        }
    }
    
    async uploadFile(file, target) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (file.size > 10 * 1024 * 1024) {
                    reject(new Error('الملف كبير جداً (الحد الأقصى 10MB)'));
                    return;
                }
                
                // إنشاء رابط مؤقت للملف
                const fileUrl = URL.createObjectURL(file);
                
                // حفظ معلومات الملف في localStorage
                const fileData = {
                    id: Date.now(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: fileUrl,
                    target: target,
                    uploadDate: new Date().toISOString(),
                    userId: this.currentUser?.id
                };
                
                // حفظ في localStorage
                const files = this.storage.getItem('uploadedFiles') || '[]';
                const filesList = JSON.parse(files);
                filesList.push(fileData);
                this.storage.setItem('uploadedFiles', JSON.stringify(filesList));
                
                // عرض الملف المرفوع
                this.displayUploadedFile(fileData);
                
                resolve(fileData);
            }, 1000);
        });
    }
    
    async processFile(file, target) {
        // نفس وظيفة uploadFile ولكن بدون رفع حقيقي
        return this.uploadFile(file, target);
    }
    
    displayUploadedFile(fileData) {
        const uploadedFiles = document.getElementById('uploadedFiles');
        if (!uploadedFiles) return;
        
        const fileElement = document.createElement('div');
        fileElement.className = 'uploaded-file';
        fileElement.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file ${this.getFileIcon(fileData.type)}"></i>
                <div>
                    <div class="file-name">${fileData.name}</div>
                    <div class="file-size">${this.formatFileSize(fileData.size)}</div>
                </div>
            </div>
            <div class="file-actions">
                <button class="action-icon-btn" onclick="app.previewFile('${fileData.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-icon-btn" onclick="app.downloadFile('${fileData.id}')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="action-icon-btn danger" onclick="app.deleteFile('${fileData.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        uploadedFiles.appendChild(fileElement);
    }
    
    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return 'fa-image';
        if (fileType.includes('pdf')) return 'fa-file-pdf';
        if (fileType.includes('word')) return 'fa-file-word';
        if (fileType.includes('photoshop') || fileType.includes('psd')) return 'fa-file-image';
        if (fileType.includes('illustrator') || fileType.includes('ai')) return 'fa-file-image';
        return 'fa-file';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    initKeyboardEvents() {
        // اختصارات لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            // Ctrl + S لحفظ المشروع
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveCurrentProject();
            }
            
            // Ctrl + F للبحث
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('globalSearch');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Ctrl + D للوضع الداكن
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleDarkMode();
            }
            
            // Ctrl + N لمشروع جديد
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.openNewProjectModal();
            }
            
            // Ctrl + M للدردشة
            if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                e.preventDefault();
                this.toggleChat();
            }
        });
    }
    
    initTouchEvents() {
        // إيماءات اللمس
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            
            // سحب من الحافة اليمنى لفتح القائمة الجانبية (للأجهزة المحمولة)
            if (window.innerWidth < 768) {
                if (touchStartX > window.innerWidth - 50 && diffX < -100) {
                    this.openSidebar();
                }
                
                // سحب من الحافة اليسرى لإغلاق القائمة الجانبية
                if (touchStartX < 50 && diffX > 100) {
                    this.closeSidebar();
                }
            }
            
            // سحب لأعلى من الأسفل لقائمة الإجراءات السريعة
            if (touchStartY > window.innerHeight - 100 && diffY > 100) {
                this.showQuickActions();
            }
        });
    }
    
    initNetworkEvents() {
        // مراقبة حالة الاتصال
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showSuccess('تم استعادة الاتصال', 'أنت الآن متصل بالإنترنت');
            
            // مزامنة البيانات عند استعادة الاتصال
            this.syncPendingData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showError('فقد الاتصال', 'أنت غير متصل بالإنترنت');
        });
    }
    
    initDesignRequestEvents() {
        // أحداث طلب التصميم (إن وجدت)
        const designRequestForm = document.getElementById('designRequestForm');
        if (designRequestForm) {
            designRequestForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitDesignRequest();
            });
            
            // أحداث الخطوات
            document.querySelectorAll('.next-step').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const nextStep = e.target.dataset.next;
                    this.goToStep(nextStep);
                });
            });
            
            document.querySelectorAll('.prev-step').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const prevStep = e.target.dataset.prev;
                    this.goToStep(prevStep);
                });
            });
            
            // اختيار نوع التصميم
            document.querySelectorAll('.design-type-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    document.querySelectorAll('.design-type-card').forEach(c => {
                        c.classList.remove('selected');
                    });
                    e.currentTarget.classList.add('selected');
                });
            });
            
            // اختيار خيار التسليم
            document.querySelectorAll('.delivery-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    document.querySelectorAll('.delivery-option').forEach(o => {
                        o.classList.remove('selected');
                    });
                    e.currentTarget.classList.add('selected');
                });
            });
            
            // اختيار طريقة الدفع
            document.querySelectorAll('.payment-method').forEach(method => {
                method.addEventListener('click', (e) => {
                    document.querySelectorAll('.payment-method').forEach(m => {
                        m.classList.remove('selected');
                    });
                    e.currentTarget.classList.add('selected');
                });
            });
        }
    }
    
    async submitDesignRequest() {
        try {
            this.showLoading('جاري إنشاء طلب التصميم...');
            
            // جمع بيانات النموذج
            const formData = {
                type: document.querySelector('.design-type-card.selected')?.querySelector('h4')?.textContent || 'تصميم جرافيك',
                title: document.getElementById('projectTitle')?.value || '',
                description: document.getElementById('projectDescription')?.value || '',
                budget: document.getElementById('projectBudget')?.value || '1000',
                delivery: document.querySelector('.delivery-option.selected')?.querySelector('span')?.textContent || '7 أيام',
                paymentMethod: document.querySelector('.payment-method.selected')?.querySelector('span')?.textContent || 'المحفظة',
                createdAt: new Date().toISOString(),
                status: 'pending',
                userId: this.currentUser?.id
            };
            
            // حفظ طلب التصميم
            const requests = this.storage.getItem('designRequests') || '[]';
            const requestsList = JSON.parse(requests);
            const newRequest = {
                id: Date.now(),
                ...formData
            };
            requestsList.push(newRequest);
            this.storage.setItem('designRequests', JSON.stringify(requestsList));
            
            // خصم المبلغ من رصيد المستخدم
            if (this.currentUser) {
                const amount = parseInt(formData.budget);
                this.currentUser.balance = (this.currentUser.balance || 0) - amount;
                this.storage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                // إضافة معاملة
                this.addTransaction({
                    type: 'payment',
                    amount: -amount,
                    description: `دفع لطلب تصميم: ${formData.title}`,
                    status: 'completed'
                });
            }
            
            this.showSuccess('تم إنشاء الطلب', 'سيتم مراجعة طلبك قريباً');
            
            // إعادة تعيين النموذج
            if (designRequestForm) {
                designRequestForm.reset();
                this.goToStep(1);
            }
            
            // الانتقال إلى صفحة المشاريع
            setTimeout(() => {
                this.navigateTo('projects');
            }, 2000);
            
        } catch (error) {
            this.showError('فشل إنشاء الطلب', error.message);
        }
    }
    
    goToStep(stepNumber) {
        // إخفاء جميع الخطوات
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // إخفاء جميع خطوات الـ stepper
        document.querySelectorAll('.stepper-step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
        
        // عرض الخطوة المطلوبة
        const targetStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (targetStep) {
            targetStep.classList.add('active');
        }
        
        // تحديث الـ stepper
        for (let i = 1; i <= stepNumber; i++) {
            const stepperStep = document.querySelector(`.stepper-step:nth-child(${i})`);
            if (stepperStep) {
                if (i === stepNumber) {
                    stepperStep.classList.add('active');
                } else {
                    stepperStep.classList.add('completed');
                }
            }
        }
    }
    
    toggleDarkMode() {
        if (this.isDarkMode) {
            this.disableDarkMode();
        } else {
            this.enableDarkMode();
        }
    }
    
    toggleQuickActions() {
        const menu = document.getElementById('quickActionsMenu');
        if (menu) {
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }
    }
    
    showQuickActions() {
        const menu = document.getElementById('quickActionsMenu');
        if (menu) {
            menu.style.display = 'block';
        }
    }
    
    hideQuickActions() {
        const menu = document.getElementById('quickActionsMenu');
        if (menu) {
            menu.style.display = 'none';
        }
    }
    
    handleQuickAction(action) {
        this.hideQuickActions();
        
        switch (action) {
            case 'new-design':
                this.openDesignRequestModal();
                break;
            case 'hire-designer':
                this.navigateTo('designers');
                break;
            case 'ai-design':
                this.openAIDesignModal();
                break;
            case 'upload-design':
                this.openUploadDesignModal();
                break;
            case 'create-invoice':
                this.openCreateInvoiceModal();
                break;
            case 'schedule-meeting':
                this.openScheduleMeetingModal();
                break;
        }
    }
    
    openDesignRequestModal() {
        this.navigateTo('design-request');
    }
    
    openAIDesignModal() {
        // إنشاء مودال الذكاء الاصطناعي الديناميكي
        const modalContent = `
            <div class="modal-header">
                <h3>التصميم بالذكاء الاصطناعي</h3>
                <button class="modal-close" onclick="app.closeModal('aiDesignModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="ai-design-interface">
                    <div class="ai-prompt-section">
                        <label>صف التصميم الذي تريده:</label>
                        <textarea id="aiPrompt" placeholder="مثال: شعار لمطعم بحري بألوان زرقاء وبيضاء..." rows="4"></textarea>
                        <div class="prompt-options">
                            <div class="style-options">
                                <label>النمط:</label>
                                <select id="aiStyle">
                                    <option value="modern">عصري</option>
                                    <option value="minimal">بسيط</option>
                                    <option value="vintage">كلاسيكي</option>
                                    <option value="playful">مرح</option>
                                </select>
                            </div>
                            <div class="color-options">
                                <label>الألوان:</label>
                                <input type="color" id="aiColor1" value="#0a9396">
                                <input type="color" id="aiColor2" value="#ffffff">
                            </div>
                        </div>
                    </div>
                    <div class="ai-preview-section">
                        <div class="preview-placeholder">
                            <i class="fas fa-robot"></i>
                            <p>ستظهر النتيجة هنا</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="action-btn outline" onclick="app.closeModal('aiDesignModal')">
                    إلغاء
                </button>
                <button class="action-btn" onclick="app.generateAIDesign()">
                    <i class="fas fa-magic"></i>
                    توليد التصميم
                </button>
            </div>
        `;
        
        this.createModal('aiDesignModal', modalContent);
        this.openModal('aiDesignModal');
    }
    
    async generateAIDesign() {
        try {
            this.showLoading('جاري توليد التصميم بالذكاء الاصطناعي...');
            
            // محاكاة توليد التصميم
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // إنشاء تصميم وهمي
            const design = {
                id: Date.now(),
                title: 'تصميم بالذكاء الاصطناعي',
                description: 'تم توليد هذا التصميم بناءً على طلبك',
                image: 'https://images.unsplash.com/photo-1567446537710-0c5ff5a6ac32?w=400&h=300&fit=crop',
                createdAt: new Date().toISOString(),
                aiGenerated: true
            };
            
            // حفظ التصميم
            const designs = this.storage.getItem('designs') || '[]';
            const designsList = JSON.parse(designs);
            designsList.push(design);
            this.storage.setItem('designs', JSON.stringify(designsList));
            
            this.closeModal('aiDesignModal');
            this.showSuccess('تم التوليد', 'تم إنشاء التصميم بنجاح');
            
            // عرض التصميم
            this.viewDesign(design.id);
            
        } catch (error) {
            this.showError('فشل التوليد', error.message);
        }
    }
    
    openUploadDesignModal() {
        // إنشاء مودال رفع التصميم
        const modalContent = `
            <div class="modal-header">
                <h3>رفع تصميم جديد</h3>
                <button class="modal-close" onclick="app.closeModal('uploadDesignModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="uploadDesignForm">
                    <div class="form-group">
                        <label>عنوان التصميم *</label>
                        <input type="text" id="designTitle" required placeholder="أدخل عنوان التصميم">
                    </div>
                    <div class="form-group">
                        <label>وصف التصميم</label>
                        <textarea id="designDescription" rows="3" placeholder="صف التصميم..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>الفئة</label>
                        <select id="designCategory">
                            <option value="logo">شعار</option>
                            <option value="branding">هوية بصرية</option>
                            <option value="ui-ux">UI/UX</option>
                            <option value="graphic">تصميم جرافيك</option>
                            <option value="illustration">رسم</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>السعر (ريال)</label>
                        <input type="number" id="designPrice" min="0" value="0" placeholder="أدخل السعر">
                    </div>
                    <div class="form-group">
                        <label>رفع ملف التصميم *</label>
                        <div class="file-upload-area">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>اسحب وأفلت الملف هنا أو <span>انقر للتصفح</span></p>
                            <input type="file" id="designFile" accept="image/*,.psd,.ai,.pdf" required>
                            <small>الصور، PSD، AI، PDF (الحد الأقصى 10MB)</small>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="designAgreement" required>
                            <span>أوافق على <a href="#">شروط رفع التصميم</a></span>
                        </label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="action-btn outline" onclick="app.closeModal('uploadDesignModal')">
                    إلغاء
                </button>
                <button class="action-btn" type="submit" form="uploadDesignForm">
                    <i class="fas fa-upload"></i>
                    رفع التصميم
                </button>
            </div>
        `;
        
        this.createModal('uploadDesignModal', modalContent);
        
        // إضافة حدث للنموذج
        setTimeout(() => {
            const form = document.getElementById('uploadDesignForm');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.uploadNewDesign();
                });
            }
        }, 100);
        
        this.openModal('uploadDesignModal');
    }
    
    async uploadNewDesign() {
        try {
            this.showLoading('جاري رفع التصميم...');
            
            // جمع بيانات النموذج
            const designData = {
                title: document.getElementById('designTitle')?.value,
                description: document.getElementById('designDescription')?.value,
                category: document.getElementById('designCategory')?.value,
                price: parseInt(document.getElementById('designPrice')?.value) || 0,
                createdAt: new Date().toISOString(),
                designerId: this.currentUser?.id,
                designerName: this.currentUser?.name,
                rating: 0,
                downloads: 0,
                views: 0
            };
            
            // محاكاة رفع الملف
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // إنشاء تصميم وهمي
            const design = {
                id: Date.now(),
                ...designData,
                image: 'https://images.unsplash.com/photo-1567446537710-0c5ff5a6ac32?w=400&h=300&fit=crop'
            };
            
            // حفظ التصميم
            const designs = this.storage.getItem('designs') || '[]';
            const designsList = JSON.parse(designs);
            designsList.push(design);
            this.storage.setItem('designs', JSON.stringify(designsList));
            
            this.closeModal('uploadDesignModal');
            this.showSuccess('تم الرفع', 'تم رفع التصميم بنجاح');
            
            // الانتقال إلى صفحة الاستكشاف
            setTimeout(() => {
                this.navigateTo('explore');
            }, 1000);
            
        } catch (error) {
            this.showError('فشل الرفع', error.message);
        }
    }
    
    openCreateInvoiceModal() {
        this.showInfo('قريباً', 'هذه الميزة قيد التطوير');
    }
    
    openScheduleMeetingModal() {
        this.showInfo('قريباً', 'هذه الميزة قيد التطوير');
    }
    
    createModal(modalId, content) {
        // إنشاء المودال إذا لم يكن موجوداً
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = content;
    }
    
    async loadInitialData() {
        try {
            if (!this.currentUser) return;
            
            // تحميل بيانات المستخدم
            await this.loadUserData();
            
            // تحميل الإشعارات
            await this.loadNotifications();
            
            // تحميل الرسائل
            await this.loadChatMessages();
            
            // تحميل المشاريع
            await this.loadProjects();
            
            // تحميل التصاميم
            await this.loadDesigns();
            
            // تحميل المصممين
            await this.loadDesigners();
            
            // تحميل المعاملات
            await this.loadTransactions();
            
            // تحميل المحادثات
            await this.loadConversations();
            
            // تحميل الفئات
            await this.loadCategories();
            
        } catch (error) {
            console.error('فشل تحميل البيانات الأولية:', error);
        }
    }
    
    async loadUserData() {
        if (!this.currentUser) return;
        
        try {
            // تحديث معلومات المستخدم من localStorage
            const users = this.storage.getItem('users') || '[]';
            const usersList = JSON.parse(users);
            const updatedUser = usersList.find(u => u.id === this.currentUser.id);
            
            if (updatedUser) {
                this.currentUser = { ...this.currentUser, ...updatedUser };
                this.storage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
            
            // تحديث واجهة المستخدم
            this.updateUserInfo();
            
        } catch (error) {
            console.error('فشل تحميل بيانات المستخدم:', error);
        }
    }
    
    updateUserInfo() {
        if (!this.currentUser) return;
        
        try {
            // تحديث اسم المستخدم
            const userName = document.getElementById('userName');
            if (userName) {
                userName.textContent = this.currentUser.name || 'مستخدم';
            }
            
            // تحديث الدور
            const userRole = document.getElementById('userRole');
            if (userRole) {
                userRole.textContent = this.currentUser.role === 'designer' ? 'مصمم' : 'عميل';
            }
            
            // تحديث الرصيد
            const userBalance = document.getElementById('userBalance');
            if (userBalance) {
                userBalance.textContent = `${this.currentUser.balance || 0} ريال`;
            }
            
            // تحديث الصورة الشخصية
            const profileImage = document.querySelector('.profile-image');
            if (profileImage && this.currentUser.avatar) {
                profileImage.src = this.currentUser.avatar;
                profileImage.alt = this.currentUser.name;
            }
            
            // تحديث الصورة الشخصية في القائمة الجانبية
            const sidebarProfileImage = document.querySelector('.user-profile .profile-image');
            if (sidebarProfileImage && this.currentUser.avatar) {
                sidebarProfileImage.src = this.currentUser.avatar;
                sidebarProfileImage.alt = this.currentUser.name;
            }
            
        } catch (error) {
            console.error('فشل تحديث معلومات المستخدم:', error);
        }
    }
    
    async loadProjects() {
        try {
            const projects = this.storage.getItem('projects') || '[]';
            this.projects = JSON.parse(projects);
        } catch (error) {
            console.error('فشل تحميل المشاريع:', error);
        }
    }
    
    async loadDesigns() {
        try {
            const designs = this.storage.getItem('designs') || '[]';
            this.designs = JSON.parse(designs);
        } catch (error) {
            console.error('فشل تحميل التصاميم:', error);
        }
    }
    
    async loadDesigners() {
        try {
            const designers = this.storage.getItem('designers') || '[]';
            this.designers = JSON.parse(designers);
            
            // إذا لم تكن هناك مصممين، إنشاء بيانات تجريبية
            if (this.designers.length === 0) {
                this.designers = this.generateSampleDesigners();
                this.storage.setItem('designers', JSON.stringify(this.designers));
            }
        } catch (error) {
            console.error('فشل تحميل المصممين:', error);
        }
    }
    
    generateSampleDesigners() {
        return [
            {
                id: 1,
                name: "أحمد علي",
                title: "مصمم جرافيك محترف",
                avatar: "https://ui-avatars.com/api/?name=أحمد+علي&background=0a9396&color=fff&size=100",
                rating: 4.8,
                projects: 245,
                satisfaction: 98,
                experience: 3,
                skills: ["فوتوشوب", "Illustrator", "After Effects", "Figma"],
                price: 250,
                online: true
            },
            {
                id: 2,
                name: "سارة محمد",
                title: "مصممة UI/UX",
                avatar: "https://ui-avatars.com/api/?name=سارة+محمد&background=9a031e&color=fff&size=100",
                rating: 4.5,
                projects: 187,
                satisfaction: 96,
                experience: 2,
                skills: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
                price: 350,
                online: false
            },
            {
                id: 3,
                name: "خالد سعيد",
                title: "مصمم ومونتير فيديو",
                avatar: "https://ui-avatars.com/api/?name=خالد+سعيد&background=005f73&color=fff&size=100",
                rating: 5.0,
                projects: 312,
                satisfaction: 99,
                experience: 5,
                skills: ["Premiere Pro", "After Effects", "DaVinci Resolve", "Motion Graphics"],
                price: 500,
                online: true
            }
        ];
    }
    
    async loadTransactions() {
        try {
            const transactions = this.storage.getItem('transactions') || '[]';
            this.transactions = JSON.parse(transactions);
        } catch (error) {
            console.error('فشل تحميل المعاملات:', error);
        }
    }
    
    async loadConversations() {
        try {
            const conversations = this.storage.getItem('conversations') || '[]';
            this.conversations = JSON.parse(conversations);
        } catch (error) {
            console.error('فشل تحميل المحادثات:', error);
        }
    }
    
    async loadCategories() {
        try {
            const categories = this.storage.getItem('categories') || '[]';
            this.categories = JSON.parse(categories);
            
            // إذا لم تكن هناك فئات، إنشاء فئات افتراضية
            if (this.categories.length === 0) {
                this.categories = [
                    { id: 1, name: 'جميع التصاميم', icon: 'fa-palette', count: 0 },
                    { id: 2, name: 'إعلانات', icon: 'fa-bullhorn', count: 12 },
                    { id: 3, name: 'بروشورات', icon: 'fa-book', count: 8 },
                    { id: 4, name: 'ملابس', icon: 'fa-tshirt', count: 15 },
                    { id: 5, name: 'تطبيقات', icon: 'fa-mobile-alt', count: 20 },
                    { id: 6, name: 'هويات بصرية', icon: 'fa-building', count: 25 },
                    { id: 7, name: 'فيديو', icon: 'fa-video', count: 10 },
                    { id: 8, name: 'تصوير', icon: 'fa-camera', count: 18 }
                ];
                this.storage.setItem('categories', JSON.stringify(this.categories));
            }
        } catch (error) {
            console.error('فشل تحميل الفئات:', error);
        }
    }
    
    updateUI() {
        // تحديث الواجهة بناءً على بيانات المستخدم
        if (this.currentUser) {
            // إظهار/إخفاء العناصر بناءً على دور المستخدم
            if (this.currentUser.role === 'designer') {
                this.showDesignerFeatures();
            } else {
                this.showClientFeatures();
            }
        }
        
        // تحديث حالة الموسيقى
        const musicPlaying = this.storage.getItem('musicPlaying') === 'true';
        if (musicPlaying && !this.isMusicPlaying) {
            this.toggleMusic();
        }
    }
    
    showDesignerFeatures() {
        // إظهار ميزات المصمم
        document.querySelectorAll('.designer-only').forEach(el => {
            el.style.display = 'block';
        });
        
        document.querySelectorAll('.client-only').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    showClientFeatures() {
        // إظهار ميزات العميل
        document.querySelectorAll('.client-only').forEach(el => {
            el.style.display = 'block';
        });
        
        document.querySelectorAll('.designer-only').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    startBackgroundServices() {
        // التحقق من التحديثات
        this.startUpdateCheck();
        
        // مزامنة البيانات
        this.startDataSync();
        
        // التحقق من الإشعارات الجديدة
        this.startNotificationCheck();
        
        // حفظ البيانات تلقائياً
        this.startAutoSave();
    }
    
    startUpdateCheck() {
        // التحقق من التحديثات كل ساعة
        this.updateCheckInterval = setInterval(async () => {
            try {
                await this.checkForUpdates();
            } catch (error) {
                console.error('فشل التحقق من التحديثات:', error);
            }
        }, 3600000); // كل ساعة
    }
    
    startDataSync() {
        // مزامنة البيانات كل 5 دقائق
        this.dataSyncInterval = setInterval(async () => {
            try {
                await this.syncData();
            } catch (error) {
                console.error('فشل مزامنة البيانات:', error);
            }
        }, 300000); // كل 5 دقائق
    }
    
    startNotificationCheck() {
        // التحقق من الإشعارات الجديدة كل دقيقة
        this.notificationCheckInterval = setInterval(async () => {
            try {
                await this.checkNewNotifications();
            } catch (error) {
                console.error('فشل التحقق من الإشعارات:', error);
            }
        }, 60000); // كل دقيقة
    }
    
    startAutoSave() {
        // حفظ البيانات تلقائياً كل 30 ثانية
        this.autoSaveInterval = setInterval(() => {
            this.autoSaveData();
        }, 30000); // كل 30 ثانية
    }
    
    async checkForUpdates() {
        // التحقق من وجود تحديثات للتطبيق
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.update();
                console.log('تم التحقق من التحديثات');
            } catch (error) {
                console.error('فشل التحقق من التحديثات:', error);
            }
        }
    }
    
    async syncData() {
        // مزامنة البيانات مع localStorage
        console.log('مزامنة البيانات المحلية...');
        
        // مزامنة بيانات المستخدم
        if (this.currentUser) {
            this.storage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
        
        // مزامنة المشاريع
        this.storage.setItem('projects', JSON.stringify(this.projects));
        
        // مزامنة التصاميم
        this.storage.setItem('designs', JSON.stringify(this.designs));
        
        // مزامنة الإشعارات
        this.storage.setItem('notifications', JSON.stringify(this.notifications));
        
        console.log('تمت مزامنة البيانات');
    }
    
    async checkNewNotifications() {
        // التحقق من الإشعارات الجديدة
        const newNotifications = await this.fetchNewNotifications();
        
        if (newNotifications.length > 0) {
            // إضافة الإشعارات الجديدة
            this.notifications = [...newNotifications, ...this.notifications];
            
            // تحديث العد
            this.updateNotificationCount();
            
            // عرض إشعارات تطفلية
            if (!document.hidden) {
                this.showPushNotifications(newNotifications);
            }
        }
    }
    
    async fetchNewNotifications() {
        // محاكاة جلب إشعارات جديدة
        return new Promise(resolve => {
            setTimeout(() => {
                // 20% فرصة لإشعار جديد
                if (Math.random() < 0.2) {
                    const newNotification = {
                        id: Date.now(),
                        userId: this.currentUser?.id,
                        title: "تذكير",
                        message: "لديك مشروع ينتهي غداً",
                        time: new Date().toISOString(),
                        read: false,
                        type: "reminder"
                    };
                    
                    // حفظ الإشعار في localStorage
                    const notifications = this.storage.getItem('notifications') || '[]';
                    const notificationsList = JSON.parse(notifications);
                    notificationsList.push(newNotification);
                    this.storage.setItem('notifications', JSON.stringify(notificationsList));
                    
                    resolve([newNotification]);
                } else {
                    resolve([]);
                }
            }, 500);
        });
    }
    
    updateNotificationCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const countElement = document.getElementById('notificationCount');
        
        if (countElement) {
            countElement.textContent = unreadCount > 9 ? '9+' : unreadCount;
            countElement.style.display = unreadCount > 0 ? 'flex' : 'none';
            
            // تأثير اهتزاز
            if (unreadCount > 0) {
                countElement.classList.add('bounce');
                setTimeout(() => {
                    countElement.classList.remove('bounce');
                }, 1000);
            }
        }
    }
    
    updateUnreadMessagesCount() {
        // تحميل الرسائل من localStorage
        const messages = this.storage.getItem('chatMessages') || '[]';
        const messagesList = JSON.parse(messages);
        
        const unreadCount = messagesList.filter(m => !m.read && m.sender !== 'user').length;
        const countElement = document.getElementById('unreadMessages');
        
        if (countElement) {
            countElement.textContent = unreadCount > 9 ? '9+' : unreadCount;
            countElement.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }
    
    showPushNotifications(notifications) {
        if (!this.settings.notifications) return;
        
        notifications.forEach(notification => {
            // استخدام Toastify لعرض الإشعارات
            Toastify({
                text: `${notification.title}: ${notification.message}`,
                duration: 5000,
                gravity: "top",
                position: "left",
                backgroundColor: "linear-gradient(135deg, #0a9396, #005f73)",
                stopOnFocus: true,
                onClick: () => {
                    this.handleNotificationClick(notification);
                }
            }).showToast();
        });
    }
    
    autoSaveData() {
        // حفظ البيانات تلقائياً
        if (this.settings.autoSave) {
            this.syncData();
            console.log('تم الحفظ التلقائي:', new Date().toLocaleTimeString());
        }
    }
    
    async syncPendingData() {
        // مزامنة البيانات المعلقة عند استعادة الاتصال
        console.log('مزامنة البيانات المعلقة...');
        
        // هنا يمكن إضافة منطق لمزامنة البيانات مع الخادم
        // في هذا الإصدار، نقوم فقط بمزامنة localStorage
        
        await this.syncData();
        this.showSuccess('تمت المزامنة', 'تمت مزامنة جميع البيانات بنجاح');
    }
    
    handleNotificationClick(notification) {
        // معالجة النقر على الإشعار
        switch (notification.type) {
            case 'project':
                this.viewProject(notification.data?.projectId);
                break;
            case 'message':
                this.openChat();
                break;
            case 'approval':
                this.viewProject(notification.data?.projectId);
                break;
            case 'reminder':
                this.navigateTo('projects');
                break;
            default:
                // تعيين الإشعار كمقروء
                this.markNotificationAsRead(notification.id);
        }
        
        // إغلاق لوحة الإشعارات
        this.closeNotifications();
    }
    
    async markNotificationAsRead(id) {
        try {
            // تحديث حالة الإشعار في القائمة
            const notification = this.notifications.find(n => n.id === id);
            if (notification) {
                notification.read = true;
            }
            
            // تحديث localStorage
            const notifications = this.storage.getItem('notifications') || '[]';
            let notificationsList = JSON.parse(notifications);
            notificationsList = notificationsList.map(n => 
                n.id === id ? { ...n, read: true } : n
            );
            this.storage.setItem('notifications', JSON.stringify(notificationsList));
            
            // تحديث العد
            this.updateNotificationCount();
            
            // إعادة تحميل الإشعارات إذا كانت اللوحة مفتوحة
            if (this.isNotificationsOpen) {
                await this.loadNotifications();
            }
            
        } catch (error) {
            console.error('فشل تعيين الإشعار كمقروء:', error);
        }
    }
    
    async markAllNotificationsAsRead() {
        try {
            // تحديث جميع الإشعارات في القائمة
            this.notifications.forEach(notification => {
                notification.read = true;
            });
            
            // تحديث localStorage
            const notifications = this.storage.getItem('notifications') || '[]';
            let notificationsList = JSON.parse(notifications);
            notificationsList = notificationsList.map(n => ({ ...n, read: true }));
            this.storage.setItem('notifications', JSON.stringify(notificationsList));
            
            // تحديث العد
            this.updateNotificationCount();
            
            // إعادة تحميل الإشعارات
            await this.loadNotifications();
            
            this.showSuccess('تم التعيين', 'تم تعيين جميع الإشعارات كمقروءة');
            
        } catch (error) {
            console.error('فشل تعيين جميع الإشعارات كمقروءة:', error);
            this.showError('فشل التعيين', 'حدث خطأ أثناء تعيين الإشعارات');
        }
    }
    
    async clearAllNotifications() {
        try {
            if (confirm('هل أنت متأكد من رغبتك في حذف جميع الإشعارات؟')) {
                // حذف جميع إشعارات المستخدم
                const notifications = this.storage.getItem('notifications') || '[]';
                let notificationsList = JSON.parse(notifications);
                notificationsList = notificationsList.filter(n => n.userId !== this.currentUser?.id);
                this.storage.setItem('notifications', JSON.stringify(notificationsList));
                
                // إعادة تعيين القائمة
                this.notifications = [];
                
                // تحديث العد
                this.updateNotificationCount();
                
                // إعادة تحميل الإشعارات
                await this.loadNotifications();
                
                this.showSuccess('تم الحذف', 'تم حذف جميع الإشعارات');
            }
        } catch (error) {
            console.error('فشل حذف الإشعارات:', error);
            this.showError('فشل الحذف', 'حدث خطأ أثناء حذف الإشعارات');
        }
    }
    
    openChat() {
        this.toggleChat();
    }
    
    refreshDashboard() {
        this.loadDashboardData();
        this.showSuccess('تم التحديث', 'تم تحديث بيانات لوحة التحكم');
    }
    
    viewDesign(designId) {
        this.openModal('designViewModal');
        this.loadDesignDetails(designId);
    }
    
    async loadDesignDetails(designId) {
        try {
            // تحميل بيانات التصميم من localStorage
            const designs = this.storage.getItem('designs') || '[]';
            const designsList = JSON.parse(designs);
            const design = designsList.find(d => d.id === designId);
            
            if (design) {
                // إنشاء محتوى المودال
                const modalContent = `
                    <div class="modal-header">
                        <h3>${design.title}</h3>
                        <button class="modal-close" onclick="app.closeModal('designViewModal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="design-details">
                            <div class="design-image">
                                <img src="${design.image}" alt="${design.title}">
                            </div>
                            <div class="design-info">
                                <div class="design-description">
                                    <h4>الوصف</h4>
                                    <p>${design.description}</p>
                                </div>
                                <div class="design-meta">
                                    <div class="meta-item">
                                        <span class="label">الفئة:</span>
                                        <span class="value">${design.category}</span>
                                    </div>
                                    <div class="meta-item">
                                        <span class="label">المصمم:</span>
                                        <span class="value">${design.designerName || 'مجهول'}</span>
                                    </div>
                                    <div class="meta-item">
                                        <span class="label">السعر:</span>
                                        <span class="value">${design.price} ريال</span>
                                    </div>
                                    <div class="meta-item">
                                        <span class="label">التقييم:</span>
                                        <span class="value">⭐ ${design.rating || '0.0'}</span>
                                    </div>
                                </div>
                                <div class="design-actions">
                                    <button class="action-btn" onclick="app.purchaseDesign(${design.id})">
                                        <i class="fas fa-shopping-cart"></i>
                                        شراء التصميم
                                    </button>
                                    <button class="action-btn outline" onclick="app.downloadDesign(${design.id})">
                                        <i class="fas fa-download"></i>
                                        تنزيل العينة
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // تحديث المودال
                const modal = document.getElementById('designViewModal');
                if (modal) {
                    modal.innerHTML = modalContent;
                }
            }
        } catch (error) {
            console.error('فشل تحميل تفاصيل التصميم:', error);
            this.showError('خطأ', 'فشل تحميل تفاصيل التصميم');
        }
    }
    
    viewProject(projectId) {
        this.openModal('projectViewModal');
        this.loadProjectDetails(projectId);
    }
    
    async loadProjectDetails(projectId) {
        try {
            // تحميل بيانات المشروع من localStorage
            const projects = this.storage.getItem('projects') || '[]';
            const projectsList = JSON.parse(projects);
            const project = projectsList.find(p => p.id === projectId);
            
            if (project) {
                // إنشاء محتوى المودال
                const modalContent = `
                    <div class="modal-header">
                        <h3>${project.name}</h3>
                        <button class="modal-close" onclick="app.closeModal('projectViewModal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="project-details">
                            <div class="project-status ${project.status}">
                                <span>الحالة: ${this.getStatusText(project.status)}</span>
                            </div>
                            <div class="project-description">
                                <h4>الوصف</h4>
                                <p>${project.description}</p>
                            </div>
                            <div class="project-meta">
                                <div class="meta-item">
                                    <span class="label">تاريخ البدء:</span>
                                    <span class="value">${this.formatDate(project.createdAt)}</span>
                                </div>
                                <div class="meta-item">
                                    <span class="label">الموعد النهائي:</span>
                                    <span class="value">${this.formatDate(project.deadline)}</span>
                                </div>
                                <div class="meta-item">
                                    <span class="label">الميزانية:</span>
                                    <span class="value">${project.budget} ريال</span>
                                </div>
                                <div class="meta-item">
                                    <span class="label">المصمم:</span>
                                    <span class="value">${project.designerName}</span>
                                </div>
                            </div>
                            <div class="project-progress">
                                <h4>تقدم المشروع</h4>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
                                </div>
                                <span class="progress-text">${project.progress || 0}% مكتمل</span>
                            </div>
                            <div class="project-actions">
                                <button class="action-btn" onclick="app.openChat()">
                                    <i class="fas fa-comments"></i>
                                    محادثة المصمم
                                </button>
                                <button class="action-btn outline" onclick="app.downloadProjectFiles('${project.id}')">
                                    <i class="fas fa-download"></i>
                                    تنزيل الملفات
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                // تحديث المودال
                const modal = document.getElementById('projectViewModal');
                if (modal) {
                    modal.innerHTML = modalContent;
                }
            }
        } catch (error) {
            console.error('فشل تحميل تفاصيل المشروع:', error);
            this.showError('خطأ', 'فشل تحميل تفاصيل المشروع');
        }
    }
    
    getStatusText(status) {
        const statusMap = {
            'pending': 'قيد الانتظار',
            'in-progress': 'قيد التنفيذ',
            'completed': 'مكتمل',
            'cancelled': 'ملغى'
        };
        return statusMap[status] || status;
    }
    
    editProject(projectId) {
        this.openModal('projectEditModal');
        this.loadProjectForEdit(projectId);
    }
    
    async loadProjectForEdit(projectId) {
        try {
            // تحميل بيانات المشروع للتعديل
            const projects = this.storage.getItem('projects') || '[]';
            const projectsList = JSON.parse(projects);
            const project = projectsList.find(p => p.id === projectId);
            
            if (project) {
                // إنشاء نموذج التعديل
                const modalContent = `
                    <div class="modal-header">
                        <h3>تعديل المشروع</h3>
                        <button class="modal-close" onclick="app.closeModal('projectEditModal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="editProjectForm">
                            <div class="form-group">
                                <label>اسم المشروع *</label>
                                <input type="text" id="editProjectName" value="${project.name}" required>
                            </div>
                            <div class="form-group">
                                <label>وصف المشروع</label>
                                <textarea id="editProjectDescription" rows="3">${project.description || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label>الميزانية (ريال)</label>
                                <input type="number" id="editProjectBudget" value="${project.budget}" min="0">
                            </div>
                            <div class="form-group">
                                <label>الحالة</label>
                                <select id="editProjectStatus">
                                    <option value="pending" ${project.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                                    <option value="in-progress" ${project.status === 'in-progress' ? 'selected' : ''}>قيد التنفيذ</option>
                                    <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>تقدم المشروع (%)</label>
                                <input type="range" id="editProjectProgress" min="0" max="100" value="${project.progress || 0}">
                                <span id="progressValue">${project.progress || 0}%</span>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="action-btn outline" onclick="app.closeModal('projectEditModal')">
                            إلغاء
                        </button>
                        <button class="action-btn" type="submit" form="editProjectForm">
                            <i class="fas fa-save"></i>
                            حفظ التغييرات
                        </button>
                    </div>
                `;
                
                // تحديث المودال
                const modal = document.getElementById('projectEditModal');
                if (modal) {
                    modal.innerHTML = modalContent;
                    
                    // إضافة حدث للنموذج
                    setTimeout(() => {
                        const form = document.getElementById('editProjectForm');
                        if (form) {
                            form.addEventListener('submit', async (e) => {
                                e.preventDefault();
                                await this.updateProject(projectId);
                            });
                        }
                        
                        // تحديث قيمة التقدم
                        const progressSlider = document.getElementById('editProjectProgress');
                        const progressValue = document.getElementById('progressValue');
                        if (progressSlider && progressValue) {
                            progressSlider.addEventListener('input', (e) => {
                                progressValue.textContent = e.target.value + '%';
                            });
                        }
                    }, 100);
                }
            }
        } catch (error) {
            console.error('فشل تحميل المشروع للتعديل:', error);
            this.showError('خطأ', 'فشل تحميل بيانات المشروع');
        }
    }
    
    async updateProject(projectId) {
        try {
            // جمع البيانات من النموذج
            const updatedData = {
                name: document.getElementById('editProjectName')?.value,
                description: document.getElementById('editProjectDescription')?.value,
                budget: parseInt(document.getElementById('editProjectBudget')?.value) || 0,
                status: document.getElementById('editProjectStatus')?.value,
                progress: parseInt(document.getElementById('editProjectProgress')?.value) || 0,
                updatedAt: new Date().toISOString()
            };
            
            // تحديث المشروع في localStorage
            const projects = this.storage.getItem('projects') || '[]';
            let projectsList = JSON.parse(projects);
            projectsList = projectsList.map(p => 
                p.id === projectId ? { ...p, ...updatedData } : p
            );
            this.storage.setItem('projects', JSON.stringify(projectsList));
            
            // تحديث القائمة
            this.projects = projectsList;
            
            this.closeModal('projectEditModal');
            this.showSuccess('تم التحديث', 'تم تحديث المشروع بنجاح');
            
            // تحديث عرض المشاريع
            if (this.currentPage === 'projects') {
                this.loadProjectsData();
            }
            
        } catch (error) {
            console.error('فشل تحديث المشروع:', error);
            this.showError('فشل التحديث', error.message);
        }
    }
    
    async deleteProject(projectId) {
        try {
            if (confirm('هل أنت متأكد من رغبتك في حذف هذا المشروع؟')) {
                // حذف المشروع من localStorage
                const projects = this.storage.getItem('projects') || '[]';
                let projectsList = JSON.parse(projects);
                projectsList = projectsList.filter(p => p.id !== projectId);
                this.storage.setItem('projects', JSON.stringify(projectsList));
                
                // تحديث القائمة
                this.projects = projectsList;
                
                this.showSuccess('تم الحذف', 'تم حذف المشروع بنجاح');
                
                // تحديث عرض المشاريع
                if (this.currentPage === 'projects') {
                    this.loadProjectsData();
                }
            }
        } catch (error) {
            console.error('فشل حذف المشروع:', error);
            this.showError('فشل الحذف', error.message);
        }
    }
    
    async loadExploreData() {
        try {
            // تحميل الفئات
            await this.loadCategories();
            
            // تحميل التصاميم
            await this.loadDesignsForExplore();
            
            // تحديث عدد التصاميم في كل فئة
            this.updateCategoryCounts();
            
        } catch (error) {
            console.error('فشل تحميل بيانات الاستكشاف:', error);
        }
    }
    
    async loadDesignsForExplore() {
        const designsGrid = document.querySelector('.designs-grid');
        if (!designsGrid) return;
        
        // تحميل التصاميم من localStorage
        const designs = this.storage.getItem('designs') || '[]';
        let designsList = JSON.parse(designs);
        
        // إذا لم تكن هناك تصاميم، إنشاء بيانات تجريبية
        if (designsList.length === 0) {
            designsList = this.generateSampleExploreDesigns();
            this.storage.setItem('designs', JSON.stringify(designsList));
        }
        
        // عرض التصاميم
        designsGrid.innerHTML = '';
        designsList.slice(0, 8).forEach(design => {
            const designCard = document.createElement('div');
            designCard.className = 'design-card';
            designCard.innerHTML = `
                <div class="design-image">
                    <img src="${design.image}" alt="${design.title}" loading="lazy">
                    <div class="design-overlay">
                        <button class="overlay-btn like-btn" onclick="app.likeDesign(${design.id})">
                            <i class="far fa-heart"></i>
                            <span>${design.likes || 0}</span>
                        </button>
                        <button class="overlay-btn view-btn" onclick="app.viewDesign(${design.id})">
                            <i class="fas fa-eye"></i>
                            <span>${design.views || 0}</span>
                        </button>
                    </div>
                </div>
                <div class="design-info">
                    <h3 class="design-title">${design.title}</h3>
                    <p class="design-description">${design.description}</p>
                    <div class="design-meta">
                        <div class="designer-info">
                            <img src="${design.designerAvatar || 'https://ui-avatars.com/api/?name=مصمم&background=005f73&color=fff'}" 
                                 alt="${design.designerName}" class="designer-avatar">
                            <span class="designer-name">${design.designerName}</span>
                        </div>
                        <div class="design-price">${design.price} ريال</div>
                    </div>
                    <div class="design-tags">
                        <span class="tag">${design.category}</span>
                        ${design.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
                    </div>
                </div>
            `;
            
            designsGrid.appendChild(designCard);
        });
    }
    
    generateSampleExploreDesigns() {
        return [
            {
                id: 1,
                title: "تصميم إعلان لمطعم",
                description: "تصميم إعلاني احترافي لمطعم متخصص في المأكولات العربية",
                category: "إعلان",
                designerName: "أحمد المصمم",
                designerAvatar: "https://ui-avatars.com/api/?name=أحمد&background=005f73&color=fff",
                price: 450,
                image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop",
                likes: 125,
                views: 2500,
                tags: ["طعام", "ألوان زاهية"]
            },
            {
                id: 2,
                title: "هوية بصرية لشركة تقنية",
                description: "تصميم شعار وبطاقات عمل لشركة ناشئة في مجال التكنولوجيا",
                category: "هوية بصرية",
                designerName: "سارة المصممة",
                designerAvatar: "https://ui-avatars.com/api/?name=سارة&background=9a031e&color=fff",
                price: 850,
                image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop",
                likes: 89,
                views: 1800,
                tags: ["شعار", "تقنية", "عصري"]
            },
            {
                id: 3,
                title: "بروشور لمؤتمر تعليمي",
                description: "تصميم بروشور ثلاثي الطيات لمؤتمر التعليم الإلكتروني",
                category: "بروشور",
                designerName: "خالد المصمم",
                designerAvatar: "https://ui-avatars.com/api/?name=خالد&background=bb3e03&color=fff",
                price: 350,
                image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=300&h=200&fit=crop",
                likes: 67,
                views: 1200,
                tags: ["تعليم", "مهني"]
            },
            {
                id: 4,
                title: "تصميم قميص رياضي",
                description: "تصميم جرافيكي لقميص رياضي لفريق كرة سلة",
                category: "ملابس",
                designerName: "نور المصممة",
                designerAvatar: "https://ui-avatars.com/api/?name=نور&background=ae2012&color=fff",
                price: 280,
                image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=200&fit=crop",
                likes: 210,
                views: 3400,
                tags: ["رياضة", "جرافيك"]
            }
        ];
    }
    
    updateCategoryCounts() {
        // تحديث عدد التصاميم في كل فئة
        const designs = this.storage.getItem('designs') || '[]';
        const designsList = JSON.parse(designs);
        
        this.categories.forEach(category => {
            const count = designsList.filter(d => d.category === category.name).length;
            category.count = count;
        });
        
        // حفظ الفئات المحدثة
        this.storage.setItem('categories', JSON.stringify(this.categories));
    }
    
    async loadDesignersData() {
        try {
            // تحميل المصممين
            await this.loadDesigners();
            
            // عرض المصممين
            this.displayDesigners();
            
        } catch (error) {
            console.error('فشل تحميل بيانات المصممين:', error);
        }
    }
    
    displayDesigners() {
        const designersGrid = document.querySelector('.designers-grid');
        if (!designersGrid) return;
        
        designersGrid.innerHTML = '';
        this.designers.forEach(designer => {
            const designerCard = document.createElement('div');
            designerCard.className = 'designer-card';
            designerCard.innerHTML = `
                <div class="designer-header">
                    <div class="designer-avatar-large">
                        <img src="${designer.avatar}" alt="${designer.name}">
                        <span class="online-status ${designer.online ? 'online' : 'offline'}"></span>
                    </div>
                    <div class="designer-info">
                        <h3 class="designer-name">${designer.name}</h3>
                        <span class="designer-title">${designer.title}</span>
                        <div class="designer-rating">
                            <div class="stars">
                                ${this.generateStarRating(designer.rating)}
                            </div>
                            <span class="rating-value">${designer.rating} (${designer.projects} مشروع)</span>
                        </div>
                    </div>
                </div>
                <div class="designer-stats">
                    <div class="stat-item">
                        <span class="stat-value">${designer.projects}</span>
                        <span class="stat-label">مشروع</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${designer.satisfaction}%</span>
                        <span class="stat-label">رضا العملاء</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${designer.experience}</span>
                        <span class="stat-label">سنوات خبرة</span>
                    </div>
                </div>
                <div class="designer-skills">
                    ${designer.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
                <div class="designer-footer">
                    <div class="price-range">
                        <span>يبدأ من</span>
                        <span class="price">${designer.price} ريال</span>
                    </div>
                    <button class="action-btn small hire-btn" onclick="app.hireDesigner(${designer.id})">
                        <i class="fas fa-briefcase"></i>
                        توظيف
                    </button>
                </div>
            `;
            
            designersGrid.appendChild(designerCard);
        });
    }
    
    generateStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        return stars;
    }
    
    async hireDesigner(designerId) {
        try {
            const designer = this.designers.find(d => d.id === designerId);
            if (!designer) {
                throw new Error('المصمم غير موجود');
            }
            
            // فتح نموذج توظيف المصمم
            this.openHireDesignerModal(designer);
            
        } catch (error) {
            this.showError('خطأ', error.message);
        }
    }
    
    openHireDesignerModal(designer) {
        const modalContent = `
            <div class="modal-header">
                <h3>توظيف ${designer.name}</h3>
                <button class="modal-close" onclick="app.closeModal('hireDesignerModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="hireDesignerForm">
                    <div class="designer-info-summary">
                        <img src="${designer.avatar}" alt="${designer.name}" class="designer-avatar-modal">
                        <div>
                            <h4>${designer.name}</h4>
                            <p>${designer.title}</p>
                            <div class="rating">⭐ ${designer.rating}</div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>نوع المشروع *</label>
                        <select id="projectType" required>
                            <option value="">اختر نوع المشروع</option>
                            <option value="logo">تصميم شعار</option>
                            <option value="branding">هوية بصرية</option>
                            <option value="ui-ux">تصميم UI/UX</option>
                            <option value="graphic">تصميم جرافيك</option>
                            <option value="video">مونتاج فيديو</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>وصف المشروع *</label>
                        <textarea id="projectDescription" rows="4" required placeholder="صف مشروعك بالتفصيل..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>الميزانية المقترحة (ريال) *</label>
                        <input type="number" id="projectBudget" min="${designer.price}" value="${designer.price}" required>
                        <small>الحد الأدنى: ${designer.price} ريال</small>
                    </div>
                    <div class="form-group">
                        <label>موعد التسليم *</label>
                        <select id="deliveryTime" required>
                            <option value="3">3 أيام (عاجل)</option>
                            <option value="7" selected>7 أيام</option>
                            <option value="14">14 يوم</option>
                            <option value="30">30 يوم</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="termsAgreement" required>
                            <span>أوافق على <a href="#">شروط التوظيف</a></span>
                        </label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="action-btn outline" onclick="app.closeModal('hireDesignerModal')">
                    إلغاء
                </button>
                <button class="action-btn" type="submit" form="hireDesignerForm">
                    <i class="fas fa-paper-plane"></i>
                    إرسال العرض
                </button>
            </div>
        `;
        
        this.createModal('hireDesignerModal', modalContent);
        
        // إضافة حدث للنموذج
        setTimeout(() => {
            const form = document.getElementById('hireDesignerForm');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.submitHireRequest(designer);
                });
            }
        }, 100);
        
        this.openModal('hireDesignerModal');
    }
    
    async submitHireRequest(designer) {
        try {
            this.showLoading('جاري إرسال طلب التوظيف...');
            
            // جمع بيانات النموذج
            const hireRequest = {
                designerId: designer.id,
                designerName: designer.name,
                projectType: document.getElementById('projectType')?.value,
                description: document.getElementById('projectDescription')?.value,
                budget: parseInt(document.getElementById('projectBudget')?.value),
                deliveryTime: parseInt(document.getElementById('deliveryTime')?.value),
                createdAt: new Date().toISOString(),
                status: 'pending',
                userId: this.currentUser?.id
            };
            
            // حفظ طلب التوظيف
            const hireRequests = this.storage.getItem('hireRequests') || '[]';
            const hireRequestsList = JSON.parse(hireRequests);
            hireRequestsList.push({
                id: Date.now(),
                ...hireRequest
            });
            this.storage.setItem('hireRequests', JSON.stringify(hireRequestsList));
            
            this.closeModal('hireDesignerModal');
            this.showSuccess('تم الإرسال', 'تم إرسال طلب التوظيف بنجاح');
            
            // إضافة إشعار للمصمم (محاكاة)
            this.addNotification({
                userId: designer.id,
                title: 'طلب توظيف جديد',
                message: `${this.currentUser?.name} يريد توظيفك لمشروع ${hireRequest.projectType}`,
                type: 'hire-request'
            });
            
        } catch (error) {
            this.showError('فشل الإرسال', error.message);
        }
    }
    
    async loadProjectsData() {
        try {
            // تحميل المشاريع
            await this.loadProjects();
            
            // عرض المشاريع
            this.displayProjects();
            
        } catch (error) {
            console.error('فشل تحميل بيانات المشاريع:', error);
        }
    }
    
    displayProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        if (!projectsGrid) return;
        
        // تصفية مشاريع المستخدم الحالي
        const userProjects = this.projects.filter(p => p.userId === this.currentUser?.id);
        
        projectsGrid.innerHTML = '';
        userProjects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = `project-card ${project.status}`;
            projectCard.innerHTML = `
                <div class="project-header">
                    <div class="project-title">
                        <h3>${project.name}</h3>
                        <span class="project-id">#${project.id.toString().substring(0, 8)}</span>
                    </div>
                    <div class="project-status ${project.status}">
                        <i class="fas fa-circle"></i>
                        ${this.getStatusText(project.status)}
                    </div>
                </div>
                <div class="project-description">
                    <p>${project.description || 'لا يوجد وصف'}</p>
                </div>
                <div class="project-meta">
                    <div class="meta-item">
                        <i class="fas fa-user"></i>
                        <span>${project.designerName || 'لم يتم التعيين'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${this.formatDate(project.createdAt)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${project.deadline ? this.getRemainingTime(project.deadline) : 'غير محدد'}</span>
                    </div>
                </div>
                <div class="project-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
                    </div>
                    <span class="progress-text">${project.progress || 0}% مكتمل</span>
                </div>
                <div class="project-footer">
                    <div class="project-budget">
                        <span class="budget-label">الميزانية</span>
                        <span class="budget-value">${project.budget} ريال</span>
                    </div>
                    <div class="project-actions">
                        <button class="action-btn small outline" onclick="app.viewProject('${project.id}')">
                            <i class="fas fa-eye"></i>
                            عرض
                        </button>
                        <button class="action-btn small" onclick="app.openChat()">
                            <i class="fas fa-comment"></i>
                            محادثة
                        </button>
                    </div>
                </div>
            `;
            
            projectsGrid.appendChild(projectCard);
        });
        
        if (userProjects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="empty-projects">
                    <i class="fas fa-project-diagram"></i>
                    <p>لا توجد مشاريع</p>
                    <button class="action-btn" onclick="app.openNewProjectModal()">
                        <i class="fas fa-plus"></i>
                        إنشاء مشروع جديد
                    </button>
                </div>
            `;
        }
    }
    
    getRemainingTime(deadline) {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        
        if (days < 0) {
            return 'منتهي';
        } else if (days === 0) {
            return 'ينتهي اليوم';
        } else if (days === 1) {
            return 'يوم واحد متبقي';
        } else {
            return `${days} أيام متبقية`;
        }
    }
    
    async loadDesignRequestData() {
        try {
            // تحميل أنواع التصميم
            await this.loadDesignTypes();
            
            // تهيئة الخطوات
            this.initDesignRequestSteps();
            
        } catch (error) {
            console.error('فشل تحميل بيانات طلب التصميم:', error);
        }
    }
    
    async loadDesignTypes() {
        // تحميل أنواع التصميم من localStorage أو استخدام القيم الافتراضية
        const designTypes = this.storage.getItem('designTypes') || '[]';
        let designTypesList = JSON.parse(designTypes);
        
        if (designTypesList.length === 0) {
            designTypesList = [
                {
                    id: 1,
                    name: 'تصميم جرافيك',
                    icon: 'fa-paint-brush',
                    description: 'تصاميم إعلانية، بروشورات، بطاقات',
                    priceRange: '150 - 800 ريال'
                },
                {
                    id: 2,
                    name: 'تصميم شعار',
                    icon: 'fa-object-group',
                    description: 'هوية بصرية، شعارات، بطاقات عمل',
                    priceRange: '300 - 1,500 ريال'
                },
                {
                    id: 3,
                    name: 'تصميم UI/UX',
                    icon: 'fa-mobile-alt',
                    description: 'واجهات تطبيقات ومواقع إلكترونية',
                    priceRange: '500 - 3,000 ريال'
                },
                {
                    id: 4,
                    name: 'مونتاج فيديو',
                    icon: 'fa-video',
                    description: 'تحرير فيديو، موشن جرافيك',
                    priceRange: '200 - 1,200 ريال'
                }
            ];
            this.storage.setItem('designTypes', JSON.stringify(designTypesList));
        }
        
        // عرض أنواع التصميم
        const designTypeGrid = document.querySelector('.design-type-grid');
        if (designTypeGrid) {
            designTypeGrid.innerHTML = '';
            designTypesList.forEach(type => {
                const typeCard = document.createElement('div');
                typeCard.className = 'design-type-card';
                typeCard.dataset.type = type.id;
                typeCard.innerHTML = `
                    <div class="type-icon">
                        <i class="fas ${type.icon}"></i>
                    </div>
                    <h4>${type.name}</h4>
                    <p>${type.description}</p>
                    <span class="price-range">${type.priceRange}</span>
                `;
                
                typeCard.addEventListener('click', () => {
                    document.querySelectorAll('.design-type-card').forEach(c => {
                        c.classList.remove('selected');
                    });
                    typeCard.classList.add('selected');
                });
                
                designTypeGrid.appendChild(typeCard);
            });
            
            // تحديد أول نوع افتراضي
            const firstCard = designTypeGrid.querySelector('.design-type-card');
            if (firstCard) {
                firstCard.classList.add('selected');
            }
        }
    }
    
    initDesignRequestSteps() {
        // تهيئة متتبع الأحرف
        const descriptionTextarea = document.getElementById('projectDescription');
        const charCount = document.getElementById('charCount');
        
        if (descriptionTextarea && charCount) {
            descriptionTextarea.addEventListener('input', (e) => {
                const count = e.target.value.length;
                charCount.textContent = count;
                
                if (count > 1000) {
                    charCount.style.color = '#e76f51';
                } else if (count > 800) {
                    charCount.style.color = '#e9c46a';
                } else {
                    charCount.style.color = 'var(--text-light)';
                }
            });
        }
        
        // تهيئة سليدر الميزانية
        const budgetSlider = document.getElementById('projectBudget');
        const currentBudget = document.getElementById('currentBudget');
        
        if (budgetSlider && currentBudget) {
            budgetSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                currentBudget.textContent = `${value.toLocaleString()} ريال`;
            });
            
            // تعيين القيمة الابتدائية
            currentBudget.textContent = `${parseInt(budgetSlider.value).toLocaleString()} ريال`;
        }
    }
    
    async loadDesignToolsData() {
        try {
            // تهيئة محرر التصميم
            this.initDesignEditor();
            
            // تحميل أدوات الذكاء الاصطناعي
            await this.loadAITools();
            
        } catch (error) {
            console.error('فشل تحميل بيانات أدوات التصميم:', error);
        }
    }
    
    initDesignEditor() {
        // الحصول على عنصر الكانفاس
        const canvas = document.getElementById('designCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // تهيئة الكانفاس بخلفية بيضاء
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // إضافة نص ترحيبي
        ctx.fillStyle = '#0a9396';
        ctx.font = '24px Cairo';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('محرر التصميم', canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = '#64748b';
        ctx.font = '16px Cairo';
        ctx.fillText('ابدأ بالرسم باستخدام الأدوات على اليمين', canvas.width / 2, canvas.height / 2 + 40);
        
        // تهيئة أدوات الرسم
        this.initDrawingTools(ctx, canvas);
    }
    
    initDrawingTools(ctx, canvas) {
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        let currentTool = 'pencil';
        let currentColor = '#0a9396';
        let currentSize = 5;
        
        // وظيفة البدء في الرسم
        function startDrawing(e) {
            isDrawing = true;
            [lastX, lastY] = getMousePos(canvas, e);
        }
        
        // وظيفة الرسم
        function draw(e) {
            if (!isDrawing) return;
            
            const [x, y] = getMousePos(canvas, e);
            
            ctx.beginPath();
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = currentSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            if (currentTool === 'pencil') {
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
            } else if (currentTool === 'eraser') {
                ctx.save();
                ctx.globalCompositeOperation = 'destination-out';
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.restore();
            }
            
            [lastX, lastY] = [x, y];
        }
        
        // وظيفة إيقاف الرسم
        function stopDrawing() {
            isDrawing = false;
            ctx.beginPath();
            
            // حفظ الحالة في localStorage
            saveCanvasState();
        }
        
        // الحصول على موقع الماوس
        function getMousePos(canvas, e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            let clientX, clientY;
            
            if (e.type.includes('touch')) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            
            return [
                (clientX - rect.left) * scaleX,
                (clientY - rect.top) * scaleY
            ];
        }
        
        // حفظ حالة الكانفاس
        function saveCanvasState() {
            const imageData = canvas.toDataURL('image/png');
            localStorage.setItem('canvasState', imageData);
        }
        
        // تحميل حالة الكانفاس المحفوظة
        function loadCanvasState() {
            const imageData = localStorage.getItem('canvasState');
            if (imageData) {
                const img = new Image();
                img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                };
                img.src = imageData;
            }
        }
        
        // تحميل الحالة المحفوظة
        loadCanvasState();
        
        // إضافة أحداث الماوس
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // إضافة أحداث اللمس
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startDrawing(e);
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            draw(e);
        });
        canvas.addEventListener('touchend', stopDrawing);
        
        // تهيئة أدوات التحكم
        this.initDrawingControls(ctx, {
            setTool: (tool) => { currentTool = tool; },
            setColor: (color) => { currentColor = color; },
            setSize: (size) => { currentSize = size; },
            clearCanvas: () => {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                saveCanvasState();
            },
            saveCanvas: () => {
                const link = document.createElement('a');
                link.download = 'تصميم-بيكسل-آرت.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        });
    }
    
    initDrawingControls(ctx, callbacks) {
        // اختيار الأداة
        document.querySelectorAll('.tool-icon').forEach(tool => {
            tool.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-icon').forEach(t => {
                    t.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
                
                const toolName = e.currentTarget.querySelector('span').textContent;
                const toolMap = {
                    'اختيار': 'select',
                    'مستطيل': 'rectangle',
                    'دائرة': 'circle',
                    'نص': 'text',
                    'قلم': 'pencil',
                    'محو': 'eraser'
                };
                
                callbacks.setTool(toolMap[toolName] || 'pencil');
            });
        });
        
        // اختيار اللون
        const colorPreview = document.querySelector('.color-preview');
        const colorInput = document.querySelector('input[type="color"]');
        
        if (colorPreview && colorInput) {
            colorPreview.addEventListener('click', () => {
                colorInput.click();
            });
            
            colorInput.addEventListener('input', (e) => {
                colorPreview.style.backgroundColor = e.target.value;
                callbacks.setColor(e.target.value);
            });
        }
        
        // تغيير حجم الفرشاة
        const sizeSlider = document.querySelector('input[type="range"]');
        if (sizeSlider) {
            sizeSlider.addEventListener('input', (e) => {
                callbacks.setSize(parseInt(e.target.value));
            });
        }
        
        // زر المسح
        const clearBtn = document.querySelector('.clear-btn');
        if (!clearBtn) {
            // إنشاء زر المسح إذا لم يكن موجوداً
            const saveOptions = document.querySelector('.save-options');
            if (saveOptions) {
                const clearBtn = document.createElement('button');
                clearBtn.className = 'save-btn danger';
                clearBtn.innerHTML = '<i class="fas fa-trash"></i> مسح الكل';
                clearBtn.addEventListener('click', callbacks.clearCanvas);
                saveOptions.appendChild(clearBtn);
            }
        }
        
        // زر الحفظ
        const saveBtn = document.querySelector('.save-btn.primary');
        if (saveBtn) {
            saveBtn.addEventListener('click', callbacks.saveCanvas);
        }
    }
    
    async loadAITools() {
        // تحميل أدوات الذكاء الاصطناعي
        // في هذا الإصدار، نعرض فقط الواجهة الأساسية
        console.log('تم تحميل أدوات الذكاء الاصطناعي');
    }
    
    async loadWalletData() {
        try {
            // تحميل المعاملات
            await this.loadTransactions();
            
            // عرض الرصيد والمعاملات
            this.displayWalletData();
            
        } catch (error) {
            console.error('فشل تحميل بيانات المحفظة:', error);
        }
    }
    
    displayWalletData() {
        // تحديث الرصيد
        const balanceAmount = document.querySelector('.balance-amount .amount');
        if (balanceAmount && this.currentUser) {
            balanceAmount.textContent = `${this.currentUser.balance || 0} ريال`;
        }
        
        // عرض المعاملات
        this.displayTransactions();
        
        // عرض طرق الدفع
        this.displayPaymentMethods();
    }
    
    displayTransactions() {
        const transactionsList = document.querySelector('.transactions-list');
        if (!transactionsList) return;
        
        // تصفية معاملات المستخدم الحالي
        const userTransactions = this.transactions.filter(t => t.userId === this.currentUser?.id);
        
        transactionsList.innerHTML = '';
        userTransactions.slice(0, 10).forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.className = `transaction-item ${transaction.type}`;
            transactionItem.innerHTML = `
                <div class="transaction-icon">
                    <i class="fas ${this.getTransactionIcon(transaction.type)}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description}</h4>
                    <span class="transaction-date">${this.formatDate(transaction.date)}</span>
                </div>
                <div class="transaction-amount">
                    <span class="amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                        ${transaction.amount > 0 ? '+' : ''}${transaction.amount} ريال
                    </span>
                    <span class="status ${transaction.status}">${this.getStatusText(transaction.status)}</span>
                </div>
            `;
            
            transactionsList.appendChild(transactionItem);
        });
        
        if (userTransactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="empty-transactions">
                    <i class="fas fa-wallet"></i>
                    <p>لا توجد معاملات</p>
                </div>
            `;
        }
    }
    
    getTransactionIcon(type) {
        const iconMap = {
            'deposit': 'fa-arrow-down',
            'withdrawal': 'fa-arrow-up',
            'payment': 'fa-shopping-cart',
            'refund': 'fa-undo',
            'pending': 'fa-clock'
        };
        return iconMap[type] || 'fa-exchange-alt';
    }
    
    displayPaymentMethods() {
        const paymentMethodsList = document.querySelector('.payment-methods-list');
        if (!paymentMethodsList) return;
        
        // تحميل طرق الدفع من localStorage
        const paymentMethods = this.storage.getItem('paymentMethods') || '[]';
        let paymentMethodsListData = JSON.parse(paymentMethods);
        
        // إذا لم تكن هناك طرق دفع، إنشاء بيانات تجريبية
        if (paymentMethodsListData.length === 0) {
            paymentMethodsListData = [
                {
                    id: 1,
                    type: 'visa',
                    name: 'بطاقة Visa',
                    number: '•••• •••• •••• 4242',
                    expiry: '06/2025',
                    isDefault: true
                },
                {
                    id: 2,
                    type: 'bank',
                    name: 'البنك الأهلي السعودي',
                    number: '•••• •••• 1234',
                    expiry: null,
                    isDefault: false
                }
            ];
            this.storage.setItem('paymentMethods', JSON.stringify(paymentMethodsListData));
        }
        
        paymentMethodsList.innerHTML = '';
        paymentMethodsListData.forEach(method => {
            const methodCard = document.createElement('div');
            methodCard.className = `payment-method-card ${method.isDefault ? 'primary' : ''}`;
            methodCard.innerHTML = `
                <div class="method-header">
                    <div class="method-icon">
                        <i class="${method.type === 'visa' ? 'fab fa-cc-visa' : 'fas fa-university'}"></i>
                    </div>
                    <span class="method-type">${method.name}</span>
                    ${method.isDefault ? '<span class="badge primary">الافتراضية</span>' : ''}
                </div>
                <div class="method-details">
                    <span class="${method.type === 'visa' ? 'card-number' : 'bank-name'}">${method.number}</span>
                    ${method.expiry ? `<span class="card-expiry">تنتهي في ${method.expiry}</span>` : ''}
                </div>
                <div class="method-actions">
                    <button class="action-icon" onclick="app.editPaymentMethod(${method.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-icon danger" onclick="app.deletePaymentMethod(${method.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            paymentMethodsList.appendChild(methodCard);
        });
        
        if (paymentMethodsListData.length === 0) {
            paymentMethodsList.innerHTML = `
                <div class="empty-payment-methods">
                    <i class="fas fa-credit-card"></i>
                    <p>لا توجد طرق دفع</p>
                    <button class="action-btn small" onclick="app.openAddPaymentMethodModal()">
                        <i class="fas fa-plus"></i>
                        إضافة طريقة دفع
                    </button>
                </div>
            `;
        }
    }
    
    async loadMessagesData() {
        try {
            // تحميل المحادثات
            await this.loadConversations();
            
            // عرض المحادثات
            this.displayConversations();
            
        } catch (error) {
            console.error('فشل تحميل بيانات الرسائل:', error);
        }
    }
    
    displayConversations() {
        const conversationsList = document.querySelector('.conversations');
        if (!conversationsList) return;
        
        // تصفية محادثات المستخدم الحالي
        const userConversations = this.conversations.filter(c => 
            c.participants?.includes(this.currentUser?.id)
        );
        
        conversationsList.innerHTML = '';
        userConversations.forEach(conversation => {
            const lastMessage = conversation.messages?.[conversation.messages.length - 1];
            const unreadCount = conversation.messages?.filter(m => 
                !m.read && m.senderId !== this.currentUser?.id
            ).length || 0;
            
            const conversationItem = document.createElement('div');
            conversationItem.className = `conversation-item ${conversation.unread ? 'unread' : ''}`;
            conversationItem.innerHTML = `
                <div class="conversation-avatar">
                    <img src="${conversation.avatar || 'https://ui-avatars.com/api/?name=محادثة&background=0a9396&color=fff'}" 
                         alt="${conversation.name}">
                    <span class="online-status ${conversation.online ? 'online' : 'offline'}"></span>
                </div>
                <div class="conversation-details">
                    <div class="conversation-header">
                        <h4>${conversation.name}</h4>
                        <span class="conversation-time">${lastMessage ? this.formatTime(lastMessage.time) : ''}</span>
                    </div>
                    <p class="conversation-preview">${lastMessage?.text || 'لا توجد رسائل'}</p>
                    <div class="conversation-meta">
                        ${conversation.projectId ? `<span class="project-tag">مشروع #${conversation.projectId}</span>` : ''}
                        ${unreadCount > 0 ? `<span class="unread-count">${unreadCount}</span>` : ''}
                    </div>
                </div>
            `;
            
            conversationItem.addEventListener('click', () => {
                this.openConversation(conversation.id);
            });
            
            conversationsList.appendChild(conversationItem);
        });
        
        if (userConversations.length === 0) {
            conversationsList.innerHTML = `
                <div class="empty-conversations">
                    <i class="fas fa-comments"></i>
                    <p>لا توجد محادثات</p>
                    <button class="action-btn small" onclick="app.openNewMessageModal()">
                        <i class="fas fa-plus"></i>
                        بدء محادثة جديدة
                    </button>
                </div>
            `;
        }
    }
    
    openConversation(conversationId) {
        // تحميل المحادثة المحددة
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (conversation) {
            // عرض نافذة المحادثة
            this.openChatWindow(conversation);
        }
    }
    
    openChatWindow(conversation) {
        // تحديث رأس المحادثة
        const chatHeader = document.querySelector('.chat-header-main');
        if (chatHeader) {
            chatHeader.innerHTML = `
                <div class="chat-user-info-main">
                    <div class="user-avatar">
                        <img src="${conversation.avatar}" alt="${conversation.name}">
                        <span class="online-status ${conversation.online ? 'online' : 'offline'}"></span>
                    </div>
                    <div class="user-details">
                        <h3>${conversation.name}</h3>
                        <span class="user-status">${conversation.online ? 'متصل الآن' : 'غير متصل'}</span>
                        ${conversation.projectId ? `<span class="project-info">مشروع: #${conversation.projectId}</span>` : ''}
                    </div>
                </div>
                <div class="chat-actions-main">
                    <button class="chat-action-btn" onclick="app.startVoiceCall('${conversation.id}')">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="chat-action-btn" onclick="app.startVideoCall('${conversation.id}')">
                        <i class="fas fa-video"></i>
                    </button>
                    <button class="chat-action-btn" onclick="app.showConversationInfo('${conversation.id}')">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            `;
        }
        
        // تحميل رسائل المحادثة
        this.loadConversationMessages(conversation.id);
        
        // فتح نافذة المحادثة
        this.toggleChat();
    }
    
    async loadConversationMessages(conversationId) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        // تحميل الرسائل من localStorage
        const messages = this.storage.getItem('chatMessages') || '[]';
        const messagesList = JSON.parse(messages);
        const conversationMessages = messagesList.filter(m => m.conversationId === conversationId);
        
        // عرض الرسائل
        chatMessages.innerHTML = '';
        conversationMessages.forEach(message => {
            this.displayMessage(message);
        });
        
        // التمرير للأسفل
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // ===== الوظائف المساعدة =====
    
    formatDate(dateString) {
        if (!dateString) return 'غير محدد';
        
        try {
            const date = new Date(dateString);
            const options = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                timeZone: 'Asia/Riyadh'
            };
            return date.toLocaleDateString('ar-SA', options);
        } catch (error) {
            return 'تاريخ غير صالح';
        }
    }
    
    formatTime(date) {
        if (!date) return '';
        
        try {
            const now = new Date();
            const messageDate = new Date(date);
            const diff = now - messageDate;
            
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            if (minutes < 1) return 'الآن';
            if (minutes < 60) return `قبل ${minutes} دقيقة`;
            if (hours < 24) return `قبل ${hours} ساعة`;
            if (days < 7) return `قبل ${days} يوم`;
            
            return this.formatDate(date);
        } catch (error) {
            return '';
        }
    }
    
    showSuccess(title, message) {
        Toastify({
            text: `${title}: ${message}`,
            duration: 3000,
            gravity: "top",
            position: "left",
            backgroundColor: "linear-gradient(135deg, #2a9d8f, #4ecdc4)",
            stopOnFocus: true,
            className: "toast-success"
        }).showToast();
    }
    
    showError(title, message) {
        Toastify({
            text: `${title}: ${message}`,
            duration: 5000,
            gravity: "top",
            position: "left",
            backgroundColor: "linear-gradient(135deg, #e76f51, #f28482)",
            stopOnFocus: true,
            className: "toast-error"
        }).showToast();
    }
    
    showInfo(title, message) {
        Toastify({
            text: `${title}: ${message}`,
            duration: 3000,
            gravity: "top",
            position: "left",
            backgroundColor: "linear-gradient(135deg, #0a9396, #005f73)",
            stopOnFocus: true,
            className: "toast-info"
        }).showToast();
    }
    
    showLoading(message) {
        // يمكن إضافة شاشة تحميل هنا
        console.log('جاري:', message);
    }
    
    addTransaction(transactionData) {
        const transaction = {
            id: Date.now(),
            userId: this.currentUser?.id,
            date: new Date().toISOString(),
            ...transactionData
        };
        
        // إضافة المعاملة إلى القائمة
        this.transactions.unshift(transaction);
        
        // حفظ في localStorage
        const transactions = this.storage.getItem('transactions') || '[]';
        const transactionsList = JSON.parse(transactions);
        transactionsList.push(transaction);
        this.storage.setItem('transactions', JSON.stringify(transactionsList));
        
        // تحديث الرصيد
        if (this.currentUser && transaction.amount) {
            this.currentUser.balance = (this.currentUser.balance || 0) + transaction.amount;
            this.storage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateUserInfo();
        }
    }
    
    addNotification(notificationData) {
        const notification = {
            id: Date.now(),
            time: new Date().toISOString(),
            read: false,
            ...notificationData
        };
        
        // إضافة الإشعار إلى القائمة
        this.notifications.unshift(notification);
        
        // حفظ في localStorage
        const notifications = this.storage.getItem('notifications') || '[]';
        const notificationsList = JSON.parse(notifications);
        notificationsList.push(notification);
        this.storage.setItem('notifications', JSON.stringify(notificationsList));
        
        // تحديث العد
        this.updateNotificationCount();
    }
    
    // ===== الوظائف العامة التي يمكن استدعاؤها من HTML =====
    
    likeDesign(designId) {
        const designs = this.storage.getItem('designs') || '[]';
        let designsList = JSON.parse(designs);
        designsList = designsList.map(d => {
            if (d.id === designId) {
                return { ...d, likes: (d.likes || 0) + 1 };
            }
            return d;
        });
        this.storage.setItem('designs', JSON.stringify(designsList));
        
        this.showSuccess('تم الإعجاب', 'تمت إضافة إعجابك للتصميم');
    }
    
    purchaseDesign(designId) {
        const designs = this.storage.getItem('designs') || '[]';
        const designsList = JSON.parse(designs);
        const design = designsList.find(d => d.id === designId);
        
        if (!design) {
            this.showError('خطأ', 'التصميم غير موجود');
            return;
        }
        
        if (this.currentUser?.balance < design.price) {
            this.showError('رصيد غير كاف', 'يرجى شحن رصيدك لشراء هذا التصميم');
            return;
        }
        
        // خصم المبلغ
        this.currentUser.balance -= design.price;
        this.storage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // إضافة معاملة
        this.addTransaction({
            type: 'payment',
            amount: -design.price,
            description: `شراء تصميم: ${design.title}`,
            status: 'completed'
        });
        
        // زيادة عدد المشتريات
        designsList.forEach(d => {
            if (d.id === designId) {
                d.purchases = (d.purchases || 0) + 1;
            }
        });
        this.storage.setItem('designs', JSON.stringify(designsList));
        
        this.showSuccess('تم الشراء', 'تم شراء التصميم بنجاح');
        this.closeModal('designViewModal');
    }
    
    downloadDesign(designId) {
        this.showSuccess('تم التنزيل', 'جاري تحميل التصميم...');
        // محاكاة التنزيل
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = 'https://images.unsplash.com/photo-1567446537710-0c5ff5a6ac32?w=800&h=600&fit=crop';
            link.download = 'تصميم-بيكسل-آرت.jpg';
            link.click();
        }, 1000);
    }
    
    downloadProjectFiles(projectId) {
        this.showSuccess('تم التنزيل', 'جاري تحميل ملفات المشروع...');
        // محاكاة التنزيل
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = '#';
            link.download = `مشروع-${projectId}.zip`;
            link.click();
        }, 1000);
    }
    
    previewFile(fileId) {
        const files = this.storage.getItem('uploadedFiles') || '[]';
        const filesList = JSON.parse(files);
        const file = filesList.find(f => f.id === fileId);
        
        if (file) {
            window.open(file.url, '_blank');
        }
    }
    
    downloadFile(fileId) {
        const files = this.storage.getItem('uploadedFiles') || '[]';
        const filesList = JSON.parse(files);
        const file = filesList.find(f => f.id === fileId);
        
        if (file) {
            const link = document.createElement('a');
            link.href = file.url;
            link.download = file.name;
            link.click();
        }
    }
    
    deleteFile(fileId) {
        if (confirm('هل أنت متأكد من رغبتك في حذف هذا الملف؟')) {
            const files = this.storage.getItem('uploadedFiles') || '[]';
            let filesList = JSON.parse(files);
            filesList = filesList.filter(f => f.id !== fileId);
            this.storage.setItem('uploadedFiles', JSON.stringify(filesList));
            
            // تحديث العرض
            const uploadedFiles = document.getElementById('uploadedFiles');
            if (uploadedFiles) {
                uploadedFiles.innerHTML = '';
                filesList.forEach(file => {
                    this.displayUploadedFile(file);
                });
            }
            
            this.showSuccess('تم الحذف', 'تم حذف الملف بنجاح');
        }
    }
    
    // ===== وظائف الإيداع والسحب =====
    
    openDepositModal() {
        const modalContent = `
            <div class="modal-header">
                <h3>إيداع رصيد</h3>
                <button class="modal-close" onclick="app.closeModal('depositModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="depositForm">
                    <div class="form-group">
                        <label>المبلغ (ريال) *</label>
                        <input type="number" id="depositAmount" min="10" max="10000" value="100" required>
                        <small>الحد الأدنى: 10 ريال | الحد الأقصى: 10,000 ريال</small>
                    </div>
                    <div class="form-group">
                        <label>طريقة الدفع *</label>
                        <select id="depositMethod" required>
                            <option value="visa">بطاقة Visa/Mastercard</option>
                            <option value="mada">مدى</option>
                            <option value="apple-pay">Apple Pay</option>
                            <option value="stc-pay">STC Pay</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="savePaymentMethod">
                            <span>حفظ طريقة الدفع للمستقبل</span>
                        </label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="action-btn outline" onclick="app.closeModal('depositModal')">
                    إلغاء
                </button>
                <button class="action-btn" type="submit" form="depositForm">
                    <i class="fas fa-credit-card"></i>
                    تأكيد الإيداع
                </button>
            </div>
        `;
        
        this.createModal('depositModal', modalContent);
        
        setTimeout(() => {
            const form = document.getElementById('depositForm');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.processDeposit();
                });
            }
        }, 100);
        
        this.openModal('depositModal');
    }
    
    async processDeposit() {
        try {
            const amount = parseInt(document.getElementById('depositAmount')?.value);
            const method = document.getElementById('depositMethod')?.value;
            
            if (!amount || amount < 10 || amount > 10000) {
                throw new Error('المبلغ يجب أن يكون بين 10 و 10,000 ريال');
            }
            
            this.showLoading('جاري معالجة الدفع...');
            
            // محاكاة عملية الدفع
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // زيادة الرصيد
            if (this.currentUser) {
                this.currentUser.balance = (this.currentUser.balance || 0) + amount;
                this.storage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.updateUserInfo();
            }
            
            // إضافة معاملة
            this.addTransaction({
                type: 'deposit',
                amount: amount,
                description: `إيداع عبر ${this.getPaymentMethodName(method)}`,
                status: 'completed'
            });
            
            this.closeModal('depositModal');
            this.showSuccess('تم الإيداع', `تم إضافة ${amount} ريال إلى رصيدك`);
            
        } catch (error) {
            this.showError('فشل الإيداع', error.message);
        }
    }
    
    getPaymentMethodName(method) {
        const methods = {
            'visa': 'بطاقة Visa/Mastercard',
            'mada': 'مدى',
            'apple-pay': 'Apple Pay',
            'stc-pay': 'STC Pay'
        };
        return methods[method] || method;
    }
    
    openWithdrawModal() {
        if (!this.currentUser || this.currentUser.balance < 50) {
            this.showError('رصيد غير كاف', 'الحد الأدنى للسحب هو 50 ريال');
            return;
        }
        
        const modalContent = `
            <div class="modal-header">
                <h3>سحب رصيد</h3>
                <button class="modal-close" onclick="app.closeModal('withdrawModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="withdrawForm">
                    <div class="form-group">
                        <label>المبلغ (ريال) *</label>
                        <input type="number" id="withdrawAmount" min="50" max="${this.currentUser?.balance || 0}" value="50" required>
                        <small>الحد الأدنى: 50 ريال | الرصيد المتاح: ${this.currentUser?.balance || 0} ريال</small>
                    </div>
                    <div class="form-group">
                        <label>طريقة السحب *</label>
                        <select id="withdrawMethod" required>
                            <option value="bank">حساب بنكي</option>
                            <option value="stc-pay">STC Pay</option>
                        </select>
                    </div>
                    <div class="bank-details" id="bankDetails">
                        <div class="form-group">
                            <label>اسم البنك *</label>
                            <input type="text" id="bankName" placeholder="أدخل اسم البنك">
                        </div>
                        <div class="form-group">
                            <label>رقم الحساب *</label>
                            <input type="text" id="accountNumber" placeholder="أدخل رقم الحساب">
                        </div>
                    </div>
                    <div class="stc-details" id="stcDetails" style="display: none;">
                        <div class="form-group">
                            <label>رقم الجوال *</label>
                            <input type="tel" id="stcNumber" placeholder="أدخل رقم STC Pay">
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="action-btn outline" onclick="app.closeModal('withdrawModal')">
                    إلغاء
                </button>
                <button class="action-btn" type="submit" form="withdrawForm">
                    <i class="fas fa-paper-plane"></i>
                    تأكيد السحب
                </button>
            </div>
        `;
        
        this.createModal('withdrawModal', modalContent);
        
        setTimeout(() => {
            const form = document.getElementById('withdrawForm');
            const methodSelect = document.getElementById('withdrawMethod');
            const bankDetails = document.getElementById('bankDetails');
            const stcDetails = document.getElementById('stcDetails');
            
            if (form && methodSelect && bankDetails && stcDetails) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.processWithdraw();
                });
                
                methodSelect.addEventListener('change', (e) => {
                    if (e.target.value === 'bank') {
                        bankDetails.style.display = 'block';
                        stcDetails.style.display = 'none';
                    } else {
                        bankDetails.style.display = 'none';
                        stcDetails.style.display = 'block';
                    }
                });
            }
        }, 100);
        
        this.openModal('withdrawModal');
    }
    
    async processWithdraw() {
        try {
            const amount = parseInt(document.getElementById('withdrawAmount')?.value);
            const method = document.getElementById('withdrawMethod')?.value;
            
            if (!amount || amount < 50 || amount > (this.currentUser?.balance || 0)) {
                throw new Error('المبلغ غير صالح');
            }
            
            this.showLoading('جاري معالجة طلب السحب...');
            
            // محاكاة عملية السحب
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // خصم المبلغ
            if (this.currentUser) {
                this.currentUser.balance -= amount;
                this.storage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.updateUserInfo();
            }
            
            // إضافة معاملة
            this.addTransaction({
                type: 'withdrawal',
                amount: -amount,
                description: `سحب عبر ${method === 'bank' ? 'حساب بنكي' : 'STC Pay'}`,
                status: 'pending' // السحب يحتاج إلى موافقة
            });
            
            this.closeModal('withdrawModal');
            this.showSuccess('تم تقديم الطلب', 'سيتم معالجة طلب السحب خلال 24-48 ساعة');
            
        } catch (error) {
            this.showError('فشل السحب', error.message);
        }
    }
    
    openAddPaymentMethodModal() {
        const modalContent = `
            <div class="modal-header">
                <h3>إضافة طريقة دفع</h3>
                <button class="modal-close" onclick="app.closeModal('addPaymentMethodModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="addPaymentMethodForm">
                    <div class="form-group">
                        <label>نوع طريقة الدفع *</label>
                        <select id="paymentMethodType" required>
                            <option value="">اختر النوع</option>
                            <option value="visa">بطاقة Visa/Mastercard</option>
                            <option value="bank">حساب بنكي</option>
                        </select>
                    </div>
                    <div class="visa-details" id="visaDetails" style="display: none;">
                        <div class="form-group">
                            <label>رقم البطاقة *</label>
                            <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>تاريخ الانتهاء *</label>
                                <input type="text" id="cardExpiry" placeholder="MM/YY" maxlength="5">
                            </div>
                            <div class="form-group">
                                <label>رمز الأمان (CVV) *</label>
                                <input type="text" id="cardCvv" placeholder="123" maxlength="3">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>اسم حامل البطاقة *</label>
                            <input type="text" id="cardHolder" placeholder="أدخل الاسم كما هو على البطاقة">
                        </div>
                    </div>
                    <div class="bank-details" id="bankMethodDetails" style="display: none;">
                        <div class="form-group">
                            <label>اسم البنك *</label>
                            <input type="text" id="methodBankName" placeholder="أدخل اسم البنك">
                        </div>
                        <div class="form-group">
                            <label>رقم الحساب *</label>
                            <input type="text" id="methodAccountNumber" placeholder="أدخل رقم الحساب">
                        </div>
                        <div class="form-group">
                            <label>رقم الآيبان (اختياري)</label>
                            <input type="text" id="ibanNumber" placeholder="SAXX XXXX XXXX XXXX XXXX">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="setAsDefault">
                            <span>تعيين كطريقة دفع افتراضية</span>
                        </label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="action-btn outline" onclick="app.closeModal('addPaymentMethodModal')">
                    إلغاء
                </button>
                <button class="action-btn" type="submit" form="addPaymentMethodForm">
                    <i class="fas fa-plus"></i>
                    إضافة
                </button>
            </div>
        `;
        
        this.createModal('addPaymentMethodModal', modalContent);
        
        setTimeout(() => {
            const form = document.getElementById('addPaymentMethodForm');
            const typeSelect = document.getElementById('paymentMethodType');
            const visaDetails = document.getElementById('visaDetails');
            const bankDetails = document.getElementById('bankMethodDetails');
            
            if (form && typeSelect && visaDetails && bankDetails) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.savePaymentMethod();
                });
                
                typeSelect.addEventListener('change', (e) => {
                    if (e.target.value === 'visa') {
                        visaDetails.style.display = 'block';
                        bankDetails.style.display = 'none';
                    } else if (e.target.value === 'bank') {
                        visaDetails.style.display = 'none';
                        bankDetails.style.display = 'block';
                    } else {
                        visaDetails.style.display = 'none';
                        bankDetails.style.display = 'none';
                    }
                });
                
                // تنسيق رقم البطاقة
                const cardNumber = document.getElementById('cardNumber');
                if (cardNumber) {
                    cardNumber.addEventListener('input', (e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        value = value.replace(/(\d{4})/g, '$1 ').trim();
                        e.target.value = value.substring(0, 19);
                    });
                }
                
                // تنسيق تاريخ الانتهاء
                const cardExpiry = document.getElementById('cardExpiry');
                if (cardExpiry) {
                    cardExpiry.addEventListener('input', (e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                        }
                        e.target.value = value.substring(0, 5);
                    });
                }
            }
        }, 100);
        
        this.openModal('addPaymentMethodModal');
    }
    
    async savePaymentMethod() {
        try {
            const type = document.getElementById('paymentMethodType')?.value;
            const isDefault = document.getElementById('setAsDefault')?.checked;
            
            if (!type) {
                throw new Error('يرجى اختيار نوع طريقة الدفع');
            }
            
            let paymentMethod;
            
            if (type === 'visa') {
                const cardNumber = document.getElementById('cardNumber')?.value;
                const cardExpiry = document.getElementById('cardExpiry')?.value;
                const cardCvv = document.getElementById('cardCvv')?.value;
                const cardHolder = document.getElementById('cardHolder')?.value;
                
                if (!cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
                    throw new Error('يرجى ملء جميع بيانات البطاقة');
                }
                
                paymentMethod = {
                    id: Date.now(),
                    type: 'visa',
                    name: 'بطاقة Visa',
                    number: cardNumber.replace(/\d(?=\d{4})/g, '*'),
                    expiry: cardExpiry,
                    isDefault: isDefault || false
                };
            } else if (type === 'bank') {
                const bankName = document.getElementById('methodBankName')?.value;
                const accountNumber = document.getElementById('methodAccountNumber')?.value;
                
                if (!bankName || !accountNumber) {
                    throw new Error('يرجى ملء جميع بيانات الحساب البنكي');
                }
                
                paymentMethod = {
                    id: Date.now(),
                    type: 'bank',
                    name: bankName,
                    number: accountNumber.replace(/\d(?=\d{4})/g, '*'),
                    expiry: null,
                    isDefault: isDefault || false
                };
            }
            
            // تحميل طرق الدفع الحالية
            const paymentMethods = this.storage.getItem('paymentMethods') || '[]';
            let paymentMethodsList = JSON.parse(paymentMethods);
            
            // إذا كانت الطريقة الجديدة افتراضية، إلغاء افتراضية الطرق الأخرى
            if (isDefault) {
                paymentMethodsList = paymentMethodsList.map(method => ({
                    ...method,
                    isDefault: false
                }));
            }
            
            // إضافة الطريقة الجديدة
            paymentMethodsList.push(paymentMethod);
            this.storage.setItem('paymentMethods', JSON.stringify(paymentMethodsList));
            
            this.closeModal('addPaymentMethodModal');
            this.showSuccess('تم الإضافة', 'تم إضافة طريقة الدفع بنجاح');
            
            // تحديث العرض
            if (this.currentPage === 'wallet') {
                this.displayPaymentMethods();
            }
            
        } catch (error) {
            this.showError('فشل الإضافة', error.message);
        }
    }
    
    editPaymentMethod(methodId) {
        // تحميل طريقة الدفع
        const paymentMethods = this.storage.getItem('paymentMethods') || '[]';
        const paymentMethodsList = JSON.parse(paymentMethods);
        const method = paymentMethodsList.find(m => m.id === methodId);
        
        if (!method) {
            this.showError('خطأ', 'طريقة الدفع غير موجودة');
            return;
        }
        
        this.showInfo('قريباً', 'تعديل طريقة الدفع قيد التطوير');
    }
    
    deletePaymentMethod(methodId) {
        if (confirm('هل أنت متأكد من رغبتك في حذف طريقة الدفع هذه؟')) {
            const paymentMethods = this.storage.getItem('paymentMethods') || '[]';
            let paymentMethodsList = JSON.parse(paymentMethods);
            paymentMethodsList = paymentMethodsList.filter(m => m.id !== methodId);
            this.storage.setItem('paymentMethods', JSON.stringify(paymentMethodsList));
            
            this.showSuccess('تم الحذف', 'تم حذف طريقة الدفع بنجاح');
            
            // تحديث العرض
            if (this.currentPage === 'wallet') {
                this.displayPaymentMethods();
            }
        }
    }
    
    openNewMessageModal() {
        this.showInfo('قريباً', 'إرسال رسالة جديدة قيد التطوير');
    }
    
    searchChat() {
        const searchInput = document.querySelector('.conversations-search input');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    loadMoreDesigns() {
        // محاكاة تحميل المزيد من التصاميم
        this.showLoading('جاري تحميل المزيد من التصاميم...');
        
        setTimeout(() => {
            // في تطبيق حقيقي، هنا سيتم جلب المزيد من البيانات من الخادم
            this.showSuccess('تم التحميل', 'تم تحميل المزيد من التصاميم');
        }, 1500);
    }
    
    changeProjectsView(view) {
        const projectsGrid = document.getElementById('projectsGrid');
        const viewOptions = document.querySelectorAll('.view-option');
        
        if (projectsGrid && viewOptions) {
            // تحديث الأزرار النشطة
            viewOptions.forEach(option => {
                option.classList.remove('active');
                if (option.dataset.view === view) {
                    option.classList.add('active');
                }
            });
            
            // تغيير نمط العرض
            if (view === 'list') {
                projectsGrid.classList.add('list-view');
            } else {
                projectsGrid.classList.remove('list-view');
            }
        }
    }
    
    filterProjects(filter) {
        const filterTabs = document.querySelectorAll('.filter-tab');
        const projects = document.querySelectorAll('.project-card');
        
        if (filterTabs && projects) {
            // تحديث التبويبات النشطة
            filterTabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.filter === filter) {
                    tab.classList.add('active');
                }
            });
            
            // تصفية المشاريع
            projects.forEach(project => {
                if (filter === 'all' || project.classList.contains(filter)) {
                    project.style.display = 'block';
                } else {
                    project.style.display = 'none';
                }
            });
        }
    }
    
    startVoiceCall(conversationId) {
        this.showInfo('قريباً', 'المكالمات الصوتية قيد التطوير');
    }
    
    startVideoCall(conversationId) {
        this.showInfo('قريباً', 'المكالمات المرئية قيد التطوير');
    }
    
    showConversationInfo(conversationId) {
        this.showInfo('معلومات المحادثة', 'تفاصيل المحادثة قيد التطوير');
    }
    
    // ===== التنظيف عند إغلاق التطبيق =====
    
    cleanup() {
        // إيقاف جميع الفواصل الزمنية
        if (this.updateCheckInterval) clearInterval(this.updateCheckInterval);
        if (this.dataSyncInterval) clearInterval(this.dataSyncInterval);
        if (this.notificationCheckInterval) clearInterval(this.notificationCheckInterval);
        if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
        if (this.progressInterval) clearInterval(this.progressInterval);
        
        // حفظ آخر نشاط
        if (this.currentUser) {
            this.currentUser.lastActive = new Date().toISOString();
            this.storage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
        
        console.log('تم تنظيف التطبيق');
    }
}

// ===== فئة التخزين باستخدام localStorage =====

class PixelArtStorage {
    constructor() {
        this.prefix = 'pixelArt_';
        this.init();
    }
    
    init() {
        // التحقق من دعم localStorage
        if (!this.isSupported()) {
            console.error('localStorage غير مدعوم في هذا المتصفح');
            return;
        }
        
        // تهيئة البيانات الافتراضية إذا لزم الأمر
        this.initDefaultData();
    }
    
    isSupported() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    initDefaultData() {
        // تهيئة البيانات الافتراضية إذا كانت غير موجودة
        if (!this.getItem('initialized')) {
            console.log('تهيئة بيانات التطبيق...');
            
            // بيانات المستخدمين
            this.setItem('users', JSON.stringify([]));
            
            // بيانات التصاميم
            this.setItem('designs', JSON.stringify([]));
            
            // بيانات المصممين
            this.setItem('designers', JSON.stringify([]));
            
            // بيانات المشاريع
            this.setItem('projects', JSON.stringify([]));
            
            // بيانات طلبات التصميم
            this.setItem('designRequests', JSON.stringify([]));
            
            // بيانات طلبات التوظيف
            this.setItem('hireRequests', JSON.stringify([]));
            
            // بيانات المعاملات
            this.setItem('transactions', JSON.stringify([]));
            
            // بيانات الإشعارات
            this.setItem('notifications', JSON.stringify([]));
            
            // بيانات الرسائل
            this.setItem('chatMessages', JSON.stringify([]));
            
            // بيانات المحادثات
            this.setItem('conversations', JSON.stringify([]));
            
            // بيانات الفئات
            this.setItem('categories', JSON.stringify([]));
            
            // بيانات أنواع التصميم
            this.setItem('designTypes', JSON.stringify([]));
            
            // بيانات طرق الدفع
            this.setItem('paymentMethods', JSON.stringify([]));
            
            // بيانات الملفات المرفوعة
            this.setItem('uploadedFiles', JSON.stringify([]));
            
            // بيانات الإعدادات
            this.setItem('settings', JSON.stringify({
                language: 'ar',
                currency: 'SAR',
                notifications: true,
                sound: true,
                autoSave: true,
                offlineMode: true,
                fontSize: 'medium',
                animationSpeed: 'normal'
            }));
            
            // وضع علامة على التهيئة
            this.setItem('initialized', 'true');
            
            console.log('تمت تهيئة بيانات التطبيق');
        }
    }
    
    getItem(key) {
        try {
            return localStorage.getItem(this.prefix + key);
        } catch (error) {
            console.error(`فشل قراءة ${key} من localStorage:`, error);
            return null;
        }
    }
    
    setItem(key, value) {
        try {
            localStorage.setItem(this.prefix + key, value);
            return true;
        } catch (error) {
            console.error(`فشل حفظ ${key} في localStorage:`, error);
            
            // محاولة تنظيف localStorage إذا كان ممتلئاً
            if (error.name === 'QuotaExceededError') {
                this.cleanupStorage();
                try {
                    localStorage.setItem(this.prefix + key, value);
                    return true;
                } catch (retryError) {
                    console.error('فشل بعد محاولة التنظيف:', retryError);
                }
            }
            
            return false;
        }
    }
    
    removeItem(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error(`فشل حذف ${key} من localStorage:`, error);
            return false;
        }
    }
    
    clear() {
        try {
            // حذف جميع بيانات التطبيق فقط
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log('تم مسح جميع بيانات التطبيق');
            return true;
        } catch (error) {
            console.error('فشل مسح بيانات التطبيق:', error);
            return false;
        }
    }
    
    cleanupStorage() {
        try {
            console.log('جاري تنظيف localStorage...');
            
            // حذف البيانات القديمة
            const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            
            // الملفات المؤقتة
            const uploadedFiles = this.getItem('uploadedFiles');
            if (uploadedFiles) {
                const files = JSON.parse(uploadedFiles);
                const filteredFiles = files.filter(file => {
                    const fileDate = new Date(file.uploadDate).getTime();
                    return fileDate > oneWeekAgo;
                });
                this.setItem('uploadedFiles', JSON.stringify(filteredFiles));
            }
            
            // الإشعارات القديمة
            const notifications = this.getItem('notifications');
            if (notifications) {
                const notifs = JSON.parse(notifications);
                const filteredNotifs = notifs.filter(notification => {
                    const notifDate = new Date(notification.time).getTime();
                    return notifDate > oneWeekAgo;
                });
                this.setItem('notifications', JSON.stringify(filteredNotifs));
            }
            
            // الرسائل القديمة
            const messages = this.getItem('chatMessages');
            if (messages) {
                const msgs = JSON.parse(messages);
                const filteredMsgs = msgs.filter(message => {
                    const msgDate = new Date(message.time).getTime();
                    return msgDate > oneWeekAgo;
                });
                this.setItem('chatMessages', JSON.stringify(filteredMsgs));
            }
            
            console.log('تم تنظيف localStorage');
        } catch (error) {
            console.error('فشل تنظيف localStorage:', error);
        }
    }
    
    getAllKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        }
        return keys;
    }
    
    getUsage() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                const value = localStorage.getItem(key);
                total += key.length + (value ? value.length : 0);
            }
        }
        return total;
    }
}

// ===== تهيئة التطبيق =====

let app;

document.addEventListener('DOMContentLoaded', () => {
    try {
        app = new PixelArtApp();
        window.app = app; // جعل التطبيق متاحاً عالمياً
        
        console.log('تم تحميل تطبيق بيكسل آرت بنجاح');
    } catch (error) {
        console.error('فشل تحميل التطبيق:', error);
        alert('حدث خطأ في تحميل التطبيق. يرجى تحديث الصفحة.');
    }
});

// ===== معالجة إغلاق التطبيق =====

window.addEventListener('beforeunload', () => {
    if (app) {
        app.cleanup();
    }
});

window.addEventListener('pagehide', () => {
    if (app) {
        app.cleanup();
    }
});

// ===== دعم وضع عدم الاتصال =====

window.addEventListener('online', () => {
    console.log('تم استعادة الاتصال بالإنترنت');
    if (app) {
        app.isOnline = true;
        app.showSuccess('تم استعادة الاتصال', 'أنت الآن متصل بالإنترنت');
        app.syncPendingData();
    }
});

window.addEventListener('offline', () => {
    console.log('فقد الاتصال بالإنترنت');
    if (app) {
        app.isOnline = false;
        app.showError('فقد الاتصال', 'أنت غير متصل بالإنترنت');
    }
});

// ===== دعم PWA =====

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    const installPrompt = e;
    
    // عرض زر التثبيت بعد 5 ثواني
    setTimeout(() => {
        if (!localStorage.getItem('pixelArt_installPromptShown')) {
            const installBtn = document.createElement('button');
            installBtn.textContent = 'تثبيت التطبيق';
            installBtn.className = 'install-prompt-btn';
            installBtn.style.cssText = `
                position: fixed;
                bottom: 100px;
                right: 20px;
                background: linear-gradient(135deg, #0a9396, #005f73);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                z-index: 10000;
                box-shadow: 0 4px 14px 0 rgba(10, 147, 150, 0.4);
                font-family: 'Cairo', sans-serif;
                font-weight: 600;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
                animation: fadeInUp 0.5s ease;
            `;
            
            installBtn.innerHTML = `
                <i class="fas fa-download"></i>
                <span>تثبيت التطبيق</span>
            `;
            
            installBtn.addEventListener('click', () => {
                installPrompt.prompt();
                installPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('تم قبول تثبيت التطبيق');
                        localStorage.setItem('pixelArt_appInstalled', 'true');
                    } else {
                        console.log('تم رفض تثبيت التطبيق');
                    }
                    installBtn.remove();
                    localStorage.setItem('pixelArt_installPromptShown', 'true');
                });
            });
            
            document.body.appendChild(installBtn);
            
            // إزالة الزر تلقائياً بعد 30 ثانية
            setTimeout(() => {
                if (installBtn.parentNode) {
                    installBtn.remove();
                }
            }, 30000);
        }
    }, 5000);
});

window.addEventListener('appinstalled', () => {
    console.log('تم تثبيت التطبيق بنجاح');
    localStorage.setItem('pixelArt_appInstalled', 'true');
    
    if (app) {
        app.showSuccess('تم التثبيت', 'تم تثبيت التطبيق بنجاح على جهازك');
    }
});

// ===== تحسينات الأداء =====

// تحميل متأخر للصور
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// التخزين المؤقت للبيانات
const cache = {};

function getCachedData(key) {
    if (cache[key] && cache[key].expiry > Date.now()) {
        return cache[key].data;
    }
    return null;
}

function setCachedData(key, data, ttl = 300000) { // 5 دقائق افتراضياً
    cache[key] = {
        data: data,
        expiry: Date.now() + ttl
    };
}

// ===== مساعدات عامة =====

// نسخ النص إلى الحافظة
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        if (app) {
            app.showSuccess('تم النسخ', 'تم نسخ النص إلى الحافظة');
        }
    }).catch(err => {
        console.error('فشل النسخ:', err);
        if (app) {
            app.showError('فشل النسخ', 'تعذر نسخ النص');
        }
    });
}

// مشاركة المحتوى
function shareContent(title, text, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        }).then(() => {
            console.log('تمت المشاركة بنجاح');
        }).catch(err => {
            console.error('فشل المشاركة:', err);
        });
    } else {
        // نسخ الرابط إذا لم تكن المشاركة مدعومة
        copyToClipboard(url);
    }
}

// تحويل التاريخ إلى تنسيق نسبي
function timeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diff = now - past;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `قبل ${days} يوم${days > 1 ? 'ات' : ''}`;
    } else if (hours > 0) {
        return `قبل ${hours} ساعة${hours > 1 ? 'ات' : ''}`;
    } else if (minutes > 0) {
        return `قبل ${minutes} دقيقة${minutes > 1 ? 'ات' : ''}`;
    } else {
        return 'الآن';
    }
}

// إنشاء معرف فريد
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// التحقق من صحة البريد الإلكتروني
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// التحقق من صحة رقم الهاتف (تنسيق سعودي)
function isValidSaudiPhone(phone) {
    const regex = /^(009665|9665|\+9665|05)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/;
    return regex.test(phone);
}

// تنسيق الأرقام
function formatNumber(num) {
    return new Intl.NumberFormat('ar-SA').format(num);
}

// تنسيق العملة
function formatCurrency(amount, currency = 'SAR') {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// إضافة الأنيميشن لـ CSS
function addGlobalStyles() {
    const styles = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
        }
        
        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
        
        .bounce {
            animation: bounce 0.5s ease;
        }
        
        .pulse {
            animation: pulse 2s infinite;
        }
        
        .spin {
            animation: spin 1s linear infinite;
        }
        
        .fade-in-up {
            animation: fadeInUp 0.5s ease;
        }
        
        .toast-success {
            font-family: 'Cairo', sans-serif;
            border-radius: 8px;
        }
        
        .toast-error {
            font-family: 'Cairo', sans-serif;
            border-radius: 8px;
        }
        
        .toast-info {
            font-family: 'Cairo', sans-serif;
            border-radius: 8px;
        }
        
        .install-prompt-btn {
            animation: fadeInUp 0.5s ease;
        }
        
        @media (max-width: 768px) {
            .install-prompt-btn {
                bottom: 80px;
                right: 50%;
                transform: translateX(50%);
                font-size: 12px;
                padding: 10px 20px;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// إضافة الأنماط العالمية عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addGlobalStyles);
} else {
    addGlobalStyles();
}

// ===== التصدير للاستخدام العالمي =====

window.PixelArtApp = PixelArtApp;
window.PixelArtStorage = PixelArtStorage;
window.copyToClipboard = copyToClipboard;
window.shareContent = shareContent;
window.timeAgo = timeAgo;
window.generateId = generateId;
window.isValidEmail = isValidEmail;
window.isValidSaudiPhone = isValidSaudiPhone;
window.formatNumber = formatNumber;
window.formatCurrency = formatCurrency;

console.log('تم تحميل مكتبة بيكسل آرت المتقدمة');