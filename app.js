// تطبيق بيكسل آرت - الإصدار المتقدم

class PixelArtApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.notifications = [];
        this.messages = [];
        this.projects = [];
        this.designs = [];
        this.designers = [];
        this.isSidebarOpen = false;
        this.isChatOpen = false;
        this.isNotificationsOpen = false;
        this.isDarkMode = false;
        this.isMusicPlaying = false;
        
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
        
        // تهيئة قاعدة البيانات
        await this.initDatabase();
        
        // تهيئة الثيم
        this.initTheme();
        
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
                loadingText.textContent = 'جاري تهيئة قاعدة البيانات...';
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
        const userData = localStorage.getItem('pixelArtUser');
        
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.showApp();
            return true;
        }
        
        // عرض شاشة تسجيل الدخول
        this.showAuthScreen();
        return false;
    }
    
    showAuthScreen() {
        const authScreen = document.getElementById('authScreen');
        authScreen.style.display = 'block';
    }
    
    showApp() {
        const authScreen = document.getElementById('authScreen');
        const appContainer = document.getElementById('appContainer');
        
        authScreen.style.display = 'none';
        appContainer.style.display = 'block';
    }
    
    // السطر 146 في app.js - التعديل المطلوب:
async initDatabase() {
    try {
        // تهيئة IndexedDB
        // الصحيح: استدعاء init من الكائن database
        await window.db.init();
        console.log('تم تهيئة قاعدة البيانات بنجاح');
    } catch (error) {
        console.error('فشل تهيئة قاعدة البيانات:', error);
        this.showError('فشل تهيئة قاعدة البيانات', error.message);
    }
}
    
    initTheme() {
        // التحقق من الوضع الداكن
        const darkMode = localStorage.getItem('darkMode') === 'true';
        
        if (darkMode) {
            this.enableDarkMode();
        } else {
            this.disableDarkMode();
        }
        
        // التحقق من تفضيل النظام
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            if (!localStorage.getItem('darkMode')) {
                this.enableDarkMode();
            }
        }
    }
    
    enableDarkMode() {
        document.body.classList.add('dark-mode');
        this.isDarkMode = true;
        localStorage.setItem('darkMode', 'true');
    }
    
    disableDarkMode() {
        document.body.classList.remove('dark-mode');
        this.isDarkMode = false;
        localStorage.setItem('darkMode', 'false');
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
                const icon = e.target.querySelector('i');
                
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
        document.getElementById('registerPassword').addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });
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
            
            // التحقق من البيانات (في تطبيق حقيقي، سيكون هناك اتصال بالخادم)
            if (email && password) {
                // حفظ بيانات المستخدم
                this.currentUser = {
                    id: Date.now(),
                    email,
                    name: 'مستخدم تجريبي',
                    role: 'client',
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=0a9396&color=fff`,
                    balance: 1250,
                    joinDate: new Date().toISOString()
                };
                
                localStorage.setItem('pixelArtUser', JSON.stringify(this.currentUser));
                
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                // عرض رسالة نجاح
                this.showSuccess('تم تسجيل الدخول بنجاح', 'مرحباً بك في بيكسل آرت');
                
                // الانتقال للتطبيق
                this.showApp();
                
                // تحميل بيانات المستخدم
                await this.loadUserData();
                
                // إعادة تعيين النموذج
                document.getElementById('loginForm').reset();
            } else {
                throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
            }
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
            
            // عرض حالة التحميل
            const registerBtn = document.getElementById('registerBtn');
            const originalText = registerBtn.innerHTML;
            registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
            registerBtn.disabled = true;
            
            // محاكاة API
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // حفظ بيانات المستخدم
            this.currentUser = {
                id: Date.now(),
                ...userData,
                name: `${userData.firstName} ${userData.lastName}`,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.firstName + ' ' + userData.lastName)}&background=0a9396&color=fff`,
                balance: 0,
                rating: 0,
                joinDate: new Date().toISOString()
            };
            
            localStorage.setItem('pixelArtUser', JSON.stringify(this.currentUser));
            
            // حفظ في قاعدة البيانات
            await this.saveUserToDatabase(this.currentUser);
            
            // عرض رسالة نجاح
            this.showSuccess('تم إنشاء الحساب بنجاح', 'مرحباً بك في مجتمع بيكسل آرت');
            
            // الانتقال للتطبيق
            this.showApp();
            
            // تحميل بيانات المستخدم
            await this.loadUserData();
            
            // إرسال بريد ترحيبي (محاكاة)
            this.sendWelcomeEmail(userData);
            
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
        // التحقق من صحة البيانات
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
    
    initNavigationEvents() {
        // التنقل في القائمة الجانبية
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.getAttribute('href').substring(1);
                this.navigateTo(page);
            });
        });
        
        // التنقل في الشريط السفلي للأجهزة المحمولة
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.getAttribute('href').substring(1);
                this.navigateTo(page);
                
                // تحديث العناصر النشطة
                document.querySelectorAll('.mobile-nav-item').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
            });
        });
        
        // زر الإجراء السريع
        document.getElementById('quickActionBtn').addEventListener('click', () => {
            this.toggleQuickActions();
        });
        
        // الإجراءات السريعة
        document.querySelectorAll('.quick-action').forEach(action => {
            action.addEventListener('click', (e) => {
                const actionType = e.currentTarget.dataset.action;
                this.handleQuickAction(actionType);
            });
        });
        
        // زر التصميم السريع
        document.getElementById('quickDesignBtn').addEventListener('click', () => {
            this.openDesignRequestModal();
        });
        
        // زر إنشاء مشروع جديد
        document.getElementById('createProjectBtn').addEventListener('click', () => {
            this.openNewProjectModal();
        });
        
        // زر تحديث لوحة التحكم
        document.getElementById('refreshDashboard').addEventListener('click', () => {
            this.refreshDashboard();
        });
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
        }
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
            document.getElementById('activeProjects').textContent = stats.activeProjects || 0;
            document.getElementById('walletBalance').textContent = `${stats.walletBalance || 0} ريال`;
            document.getElementById('pendingProjects').textContent = stats.pendingProjects || 0;
            document.getElementById('userRating').textContent = stats.userRating || '0.0';
            
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
        // محاكاة جلب البيانات من قاعدة البيانات
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    activeProjects: 5,
                    walletBalance: 1250,
                    pendingProjects: 3,
                    userRating: 4.8
                });
            }, 500);
        });
    }
    
    async loadFeaturedDesigns() {
        const slider = document.getElementById('featuredSlider');
        
        // بيانات وهمية للتصاميم المميزة
        const featuredDesigns = [
            {
                id: 1,
                title: "تصميم هوية متكاملة",
                description: "هوية بصرية متكاملة لعلامة تجارية ناشئة",
                category: "هوية بصرية",
                designer: "أحمد المصمم",
                rating: 4.9,
                price: 1500,
                image: "https://via.placeholder.com/600x400/0a9396/ffffff?text=Design+1"
            },
            {
                id: 2,
                title: "تصميم تطبيق جوال",
                description: "واجهة مستخدم لتطبيق توصيل طعام",
                category: "UI/UX",
                designer: "سارة المصممة",
                rating: 4.8,
                price: 2500,
                image: "https://via.placeholder.com/600x400/005f73/ffffff?text=Design+2"
            },
            {
                id: 3,
                title: "تصميم موقع إلكتروني",
                description: "موقع متكامل للتجارة الإلكترونية",
                category: "Web Design",
                designer: "محمد المصمم",
                rating: 4.7,
                price: 3500,
                image: "https://via.placeholder.com/600x400/ee9b00/ffffff?text=Design+3"
            }
        ];
        
        // إنشاء الشرائح
        slider.innerHTML = '';
        featuredDesigns.forEach(design => {
            const slide = document.createElement('div');
            slide.className = 'featured-slide';
            slide.style.backgroundImage = `url(${design.image})`;
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
    
    initFeaturedSlider() {
        const slider = document.getElementById('featuredSlider');
        const slides = slider.querySelectorAll('.featured-slide');
        let currentSlide = 0;
        
        // وظيفة عرض الشريحة
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.style.transform = `translateX(${100 * (i - index)}%)`;
            });
        }
        
        // التبديل التلقائي
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }, 5000);
        
        // العرض الأولي
        showSlide(0);
    }
    
    async loadRecentProjects() {
        const tableBody = document.getElementById('projectsTable');
        
        // بيانات وهمية للمشاريع
        const projects = [
            {
                id: 1,
                name: "هوية بصرية لمطعم",
                designer: "أحمد المصمم",
                status: "in-progress",
                date: "2024-03-15",
                price: 1500
            },
            {
                id: 2,
                name: "تصميم موقع شركة",
                designer: "سارة المصممة",
                status: "pending",
                date: "2024-03-10",
                price: 3000
            },
            {
                id: 3,
                name: "شعار لعلامة تجارية",
                designer: "محمد المصمم",
                status: "completed",
                date: "2024-03-05",
                price: 800
            }
        ];
        
        // إنشاء صفوف الجدول
        tableBody.innerHTML = '';
        projects.forEach(project => {
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
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(project.designer)}&background=005f73&color=fff" 
                         alt="${project.designer}" class="designer-avatar">
                    <span>${project.designer}</span>
                </div>
                <div class="status-badge ${statusClass}">${statusText}</div>
                <div>${this.formatDate(project.date)}</div>
                <div class="project-actions">
                    <button class="action-icon-btn" onclick="app.viewProject(${project.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-icon-btn" onclick="app.editProject(${project.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-icon-btn" onclick="app.deleteProject(${project.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    async loadRecentActivity() {
        const timeline = document.getElementById('activityTimeline');
        
        // بيانات وهمية للنشاط
        const activities = [
            {
                id: 1,
                time: "قبل 5 دقائق",
                title: "تم إنشاء مشروع جديد",
                description: "تم إنشاء مشروع 'هوية بصرية لمطعم'"
            },
            {
                id: 2,
                time: "قبل ساعة",
                title: "تم استلام الدفعة",
                description: "تم استلام دفعة بقيمة 1500 ريال للمشروع #123"
            },
            {
                id: 3,
                time: "قبل 3 ساعات",
                title: "تم إكمال التصميم",
                description: "تم تسليم التصميم النهائي للمشروع #122"
            },
            {
                id: 4,
                time: "أمس",
                title: "تمت إضافة تقييم جديد",
                description: "أضاف أحمد المصمم تقييماً جديداً لعملك"
            }
        ];
        
        // إنشاء خط الزمن
        timeline.innerHTML = '';
        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            item.innerHTML = `
                <div class="activity-dot"></div>
                <div class="activity-time">${activity.time}</div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                </div>
            `;
            
            timeline.appendChild(item);
        });
    }
    
    initSidebarEvents() {
        // زر فتح/إغلاق القائمة
        document.getElementById('menuToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menuToggle');
            
            if (this.isSidebarOpen && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                this.closeSidebar();
            }
        });
        
        // زر الترقية
        document.querySelector('.upgrade-btn').addEventListener('click', () => {
            this.openUpgradeModal();
        });
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');
        this.isSidebarOpen = sidebar.classList.contains('open');
    }
    
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('open');
        this.isSidebarOpen = false;
    }
    
    initSearchEvents() {
        const searchInput = document.getElementById('globalSearch');
        const searchFilter = document.getElementById('searchFilter');
        
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
        
        // زر الفلتر
        searchFilter.addEventListener('click', () => {
            this.openSearchFilterModal();
        });
    }
    
    async performSearch(query) {
        if (!query.trim()) return;
        
        try {
            // البحث في قاعدة البيانات
            const results = await this.searchDatabase(query);
            
            // عرض النتائج
            this.displaySearchResults(results);
            
        } catch (error) {
            console.error('فشل البحث:', error);
        }
    }
    
    async searchDatabase(query) {
        // محاكاة البحث في قاعدة البيانات
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    designs: [
                        { id: 1, name: `تصميم ${query}`, type: 'logo' },
                        { id: 2, name: `تصميم ${query} احترافي`, type: 'branding' }
                    ],
                    designers: [
                        { id: 1, name: `مصمم ${query}`, specialty: 'graphic' },
                        { id: 2, name: `مصممة ${query}`, specialty: 'ui/ux' }
                    ],
                    projects: [
                        { id: 1, name: `مشروع ${query}`, status: 'active' }
                    ]
                });
            }, 300);
        });
    }
    
    displaySearchResults(results) {
        // عرض النتائج في مودال
        this.showSearchResultsModal(results);
    }
    
    initNotificationEvents() {
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationsPanel = document.getElementById('notificationsPanel');
        
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleNotifications();
        });
        
        // إغلاق عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (this.isNotificationsOpen && 
                !notificationsPanel.contains(e.target) && 
                !notificationBtn.contains(e.target)) {
                this.closeNotifications();
            }
        });
        
        // تعيين الكل كمقروء
        document.getElementById('markAllRead').addEventListener('click', () => {
            this.markAllNotificationsAsRead();
        });
        
        // حذف الكل
        document.getElementById('clearNotifications').addEventListener('click', () => {
            this.clearAllNotifications();
        });
    }
    
    toggleNotifications() {
        const panel = document.getElementById('notificationsPanel');
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
        this.isNotificationsOpen = panel.style.display === 'block';
        
        if (this.isNotificationsOpen) {
            this.loadNotifications();
        }
    }
    
    closeNotifications() {
        const panel = document.getElementById('notificationsPanel');
        panel.style.display = 'none';
        this.isNotificationsOpen = false;
    }
    
    async loadNotifications() {
        const list = document.getElementById('notificationsList');
        
        // تحميل الإشعارات من قاعدة البيانات
        const notifications = await this.fetchNotifications();
        
        // تحديث العد
        const unreadCount = notifications.filter(n => !n.read).length;
        document.getElementById('notificationCount').textContent = unreadCount;
        
        // عرض الإشعارات
        list.innerHTML = '';
        notifications.forEach(notification => {
            const item = document.createElement('div');
            item.className = `notification-item ${notification.read ? '' : 'unread'}`;
            item.onclick = () => this.handleNotificationClick(notification);
            
            item.innerHTML = `
                <div class="notification-header">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-time">${this.formatTime(notification.time)}</div>
                </div>
                <div class="notification-content">${notification.message}</div>
                <div class="notification-actions">
                    ${!notification.read ? `<button class="action-link" onclick="app.markNotificationAsRead(${notification.id})">تعيين كمقروء</button>` : ''}
                </div>
            `;
            
            list.appendChild(item);
        });
    }
    
    async fetchNotifications() {
        // محاكاة جلب الإشعارات
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        title: "مشروع جديد",
                        message: "تم تعيينك كمصمم للمشروع #123",
                        time: new Date(Date.now() - 300000), // قبل 5 دقائق
                        read: false,
                        type: "project",
                        data: { projectId: 123 }
                    },
                    {
                        id: 2,
                        title: "رسالة جديدة",
                        message: "لديك رسالة جديدة من أحمد المصمم",
                        time: new Date(Date.now() - 1800000), // قبل 30 دقيقة
                        read: false,
                        type: "message",
                        data: { chatId: 456 }
                    },
                    {
                        id: 3,
                        title: "تمت الموافقة على التصميم",
                        message: "تمت الموافقة على تصميم شعار المشروع #122",
                        time: new Date(Date.now() - 86400000), // قبل يوم
                        read: true,
                        type: "approval",
                        data: { projectId: 122 }
                    }
                ]);
            }, 500);
        });
    }
    
    initChatEvents() {
        const chatBtn = document.getElementById('chatBtn');
        const chatWindow = document.getElementById('chatWindow');
        const minimizeChat = document.getElementById('minimizeChat');
        const closeChat = document.getElementById('closeChat');
        const sendMessageBtn = document.getElementById('sendMessageBtn');
        const chatInput = document.getElementById('chatInput');
        
        chatBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleChat();
        });
        
        minimizeChat.addEventListener('click', () => {
            this.minimizeChatWindow();
        });
        
        closeChat.addEventListener('click', () => {
            this.closeChat();
        });
        
        sendMessageBtn.addEventListener('click', () => {
            this.sendMessage();
        });
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // إغلاق عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (this.isChatOpen && 
                !chatWindow.contains(e.target) && 
                !chatBtn.contains(e.target)) {
                this.closeChat();
            }
        });
    }
    
    toggleChat() {
        const window = document.getElementById('chatWindow');
        window.style.display = window.style.display === 'flex' ? 'none' : 'flex';
        this.isChatOpen = window.style.display === 'flex';
        
        if (this.isChatOpen) {
            this.loadChatMessages();
            document.getElementById('chatInput').focus();
        }
    }
    
    minimizeChatWindow() {
        const window = document.getElementById('chatWindow');
        const body = document.getElementById('chatBody');
        const footer = document.querySelector('.chat-footer');
        
        if (window.classList.contains('minimized')) {
            window.classList.remove('minimized');
            body.style.display = 'block';
            footer.style.display = 'flex';
            window.style.height = '500px';
        } else {
            window.classList.add('minimized');
            body.style.display = 'none';
            footer.style.display = 'none';
            window.style.height = 'auto';
        }
    }
    
    closeChat() {
        const window = document.getElementById('chatWindow');
        window.style.display = 'none';
        this.isChatOpen = false;
    }
    
    async loadChatMessages() {
        const chatBody = document.getElementById('chatBody');
        
        // تحميل الرسائل من قاعدة البيانات
        const messages = await this.fetchChatMessages();
        
        // عرض الرسائل
        chatBody.innerHTML = '';
        messages.forEach(message => {
            this.displayMessage(message);
        });
        
        // التمرير للأسفل
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    
    async fetchChatMessages() {
        // محاكاة جلب الرسائل
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        sender: 'designer',
                        message: 'مرحباً، كيف يمكنني مساعدتك اليوم؟',
                        time: new Date(Date.now() - 3600000),
                        read: true
                    },
                    {
                        id: 2,
                        sender: 'user',
                        message: 'أحتاج إلى تعديلات على التصميم الذي قدمته',
                        time: new Date(Date.now() - 1800000),
                        read: true
                    },
                    {
                        id: 3,
                        sender: 'designer',
                        message: 'أي تعديلات بالضبط تريدها؟',
                        time: new Date(Date.now() - 600000),
                        read: true
                    }
                ]);
            }, 300);
        });
    }
    
    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        try {
            // إضافة الرسالة إلى الواجهة
            const newMessage = {
                id: Date.now(),
                sender: 'user',
                message,
                time: new Date(),
                read: false
            };
            
            this.displayMessage(newMessage);
            
            // إرسال الرسالة (محاكاة)
            await this.sendMessageToServer(newMessage);
            
            // محاكاة رد المصمم
            setTimeout(async () => {
                const response = {
                    id: Date.now() + 1,
                    sender: 'designer',
                    message: 'تم استلام رسالتك، سأقوم بالتعديلات المطلوبة',
                    time: new Date(),
                    read: false
                };
                
                this.displayMessage(response);
                await this.saveMessage(response);
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
        const messageElement = document.createElement('div');
        
        messageElement.className = `message ${message.sender === 'user' ? 'sent' : 'received'}`;
        messageElement.innerHTML = `
            <div class="message-text">${message.message}</div>
            <div class="message-time">${this.formatTime(message.time)}</div>
        `;
        
        chatBody.appendChild(messageElement);
        
        // التمرير للأسفل
        chatBody.scrollTop = chatBody.scrollHeight;
        
        // تحديث عد الرسائل غير المقروءة
        if (message.sender !== 'user' && !message.read) {
            this.updateUnreadMessagesCount();
        }
    }
    
    async sendMessageToServer(message) {
        // محاكاة إرسال الرسالة للخادم
        return new Promise(resolve => {
            setTimeout(() => {
                // حفظ في قاعدة البيانات
                this.saveMessage(message);
                resolve();
            }, 300);
        });
    }
    
    async saveMessage(message) {
        // حفظ الرسالة في قاعدة البيانات
        try {
            await window.saveMessage(message);
        } catch (error) {
            console.error('فشل حفظ الرسالة:', error);
        }
    }
    
    initMusicEvents() {
        const playPause = document.getElementById('playPause');
        const prevTrack = document.getElementById('prevTrack');
        const nextTrack = document.getElementById('nextTrack');
        const progressSlider = document.getElementById('progressSlider');
        const playerSettings = document.getElementById('playerSettings');
        const playerClose = document.getElementById('playerClose');
        
        playPause.addEventListener('click', () => {
            this.toggleMusic();
        });
        
        prevTrack.addEventListener('click', () => {
            this.previousTrack();
        });
        
        nextTrack.addEventListener('click', () => {
            this.nextTrack();
        });
        
        progressSlider.addEventListener('input', (e) => {
            this.seekMusic(e.target.value);
        });
        
        playerSettings.addEventListener('click', () => {
            this.openMusicSettings();
        });
        
        playerClose.addEventListener('click', () => {
            this.closeMusicPlayer();
        });
    }
    
    toggleMusic() {
        const playPause = document.getElementById('playPause');
        const icon = playPause.querySelector('i');
        
        if (this.isMusicPlaying) {
            // إيقاف الموسيقى
            this.pauseMusic();
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        } else {
            // تشغيل الموسيقى
            this.playMusic();
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        }
        
        this.isMusicPlaying = !this.isMusicPlaying;
    }
    
    playMusic() {
        // محاكاة تشغيل الموسيقى
        console.log('تشغيل الموسيقى...');
        
        // تحديث شريط التقدم
        this.startProgressUpdate();
    }
    
    pauseMusic() {
        // محاكاة إيقاف الموسيقى
        console.log('إيقاف الموسيقى...');
        
        // إيقاف تحديث شريط التقدم
        this.stopProgressUpdate();
    }
    
    startProgressUpdate() {
        // محاكاة تحديث شريط التقدم
        this.progressInterval = setInterval(() => {
            const slider = document.getElementById('progressSlider');
            let value = parseInt(slider.value);
            
            if (value < 100) {
                slider.value = value + 1;
            } else {
                this.nextTrack();
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
        // إعادة تعيين شريط التقدم
        document.getElementById('progressSlider').value = 0;
    }
    
    nextTrack() {
        console.log('الانتقال إلى المقطع التالي');
        // إعادة تعيين شريط التقدم
        document.getElementById('progressSlider').value = 0;
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
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            modal.style.display = 'block';
            overlay.style.display = 'block';
            
            // منع التمرير خلف المودال
            document.body.style.overflow = 'hidden';
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
        if (openModals.length === 0) {
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        document.getElementById('modalOverlay').style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    initDragAndDropEvents() {
        // سحب وإفلات الملفات
        const dropZones = document.querySelectorAll('.file-drop-zone');
        
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
                this.handleDroppedFiles(files, zone.dataset.target);
            });
        });
    }
    
    async handleDroppedFiles(files, target) {
        try {
            for (let file of files) {
                await this.uploadFile(file, target);
            }
            
            this.showSuccess('تم رفع الملفات', `تم رفع ${files.length} ملف بنجاح`);
        } catch (error) {
            this.showError('فشل رفع الملفات', error.message);
        }
    }
    
    async uploadFile(file, target) {
        // محاكاة رفع الملف
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (file.size > 10 * 1024 * 1024) { // 10MB
                    reject(new Error('الملف كبير جداً'));
                } else {
                    // حفظ الملف في قاعدة البيانات
                    const fileData = {
                        id: Date.now(),
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        url: URL.createObjectURL(file),
                        uploadDate: new Date().toISOString()
                    };
                    
                    window.saveFile(fileData).then(resolve).catch(reject);
                }
            }, 1000);
        });
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
                document.getElementById('globalSearch').focus();
            }
            
            // Ctrl + D للوضع الداكن
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleDarkMode();
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
            
            // سحب من الحافة اليمنى لفتح القائمة الجانبية
            if (touchStartX > window.innerWidth - 50 && diffX < -100) {
                this.openSidebar();
            }
            
            // سحب من الحافة اليسرى لإغلاق القائمة الجانبية
            if (touchStartX < 50 && diffX > 100) {
                this.closeSidebar();
            }
            
            // سحب لأعلى من الأسفل لقائمة الإجراءات السريعة
            if (touchStartY > window.innerHeight - 100 && diffY > 100) {
                this.showQuickActions();
            }
        });
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
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }
    
    showQuickActions() {
        const menu = document.getElementById('quickActionsMenu');
        menu.style.display = 'block';
    }
    
    hideQuickActions() {
        const menu = document.getElementById('quickActionsMenu');
        menu.style.display = 'none';
    }
    
    handleQuickAction(action) {
        this.hideQuickActions();
        
        switch (action) {
            case 'new-design':
                this.openDesignRequestModal();
                break;
            case 'hire-designer':
                this.openHireDesignerModal();
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
        this.openModal('designRequestModal');
    }
    
    openHireDesignerModal() {
        this.navigateTo('designers');
    }
    
    openAIDesignModal() {
        this.openModal('aiDesignModal');
    }
    
    openUploadDesignModal() {
        this.openModal('uploadDesignModal');
    }
    
    openCreateInvoiceModal() {
        this.openModal('createInvoiceModal');
    }
    
    openScheduleMeetingModal() {
        this.openModal('scheduleMeetingModal');
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
            
        } catch (error) {
            console.error('فشل تحميل البيانات الأولية:', error);
        }
    }
    
    async loadUserData() {
        if (!this.currentUser) return;
        
        try {
            // تحديث واجهة المستخدم
            document.getElementById('userName').textContent = this.currentUser.name;
            document.getElementById('userRole').textContent = this.currentUser.role === 'designer' ? 'مصمم' : 'عميل';
            document.getElementById('userBalance').textContent = `${this.currentUser.balance || 0} ريال`;
            
            // تحديث الصورة الشخصية
            const profileImage = document.querySelector('.profile-image');
            if (profileImage && this.currentUser.avatar) {
                profileImage.src = this.currentUser.avatar;
            }
            
        } catch (error) {
            console.error('فشل تحميل بيانات المستخدم:', error);
        }
    }
    
    async loadProjects() {
        try {
            this.projects = await window.getAllProjects();
        } catch (error) {
            console.error('فشل تحميل المشاريع:', error);
        }
    }
    
    async loadDesigns() {
        try {
            this.designs = await window.getAllDesigns();
        } catch (error) {
            console.error('فشل تحميل التصاميم:', error);
        }
    }
    
    async loadDesigners() {
        try {
            this.designers = await window.getAllDesigners();
        } catch (error) {
            console.error('فشل تحميل المصممين:', error);
        }
    }
    
    async saveUserToDatabase(user) {
        try {
            await window.saveUser(user);
        } catch (error) {
            console.error('فشل حفظ المستخدم في قاعدة البيانات:', error);
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
    }
    
    startUpdateCheck() {
        // التحقق من التحديثات كل ساعة
        setInterval(async () => {
            try {
                await this.checkForUpdates();
            } catch (error) {
                console.error('فشل التحقق من التحديثات:', error);
            }
        }, 3600000); // كل ساعة
    }
    
    startDataSync() {
        // مزامنة البيانات كل 5 دقائق
        setInterval(async () => {
            try {
                await this.syncData();
            } catch (error) {
                console.error('فشل مزامنة البيانات:', error);
            }
        }, 300000); // كل 5 دقائق
    }
    
    startNotificationCheck() {
        // التحقق من الإشعارات الجديدة كل دقيقة
        setInterval(async () => {
            try {
                await this.checkNewNotifications();
            } catch (error) {
                console.error('فشل التحقق من الإشعارات:', error);
            }
        }, 60000); // كل دقيقة
    }
    
    async checkForUpdates() {
        // التحقق من وجود تحديثات للتطبيق
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            await registration.update();
        }
    }
    
    async syncData() {
        // مزامنة البيانات مع الخادم (محاكاة)
        console.log('مزامنة البيانات...');
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
                    resolve([
                        {
                            id: Date.now(),
                            title: "تذكير",
                            message: "لديك مشروع ينتهي غداً",
                            time: new Date(),
                            read: false,
                            type: "reminder"
                        }
                    ]);
                } else {
                    resolve([]);
                }
            }, 500);
        });
    }
    
    updateNotificationCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const countElement = document.getElementById('notificationCount');
        
        countElement.textContent = unreadCount;
        
        if (unreadCount > 0) {
            countElement.style.display = 'flex';
            
            // تأثير اهتزاز
            countElement.classList.add('bounce');
            setTimeout(() => {
                countElement.classList.remove('bounce');
            }, 1000);
        } else {
            countElement.style.display = 'none';
        }
    }
    
    updateUnreadMessagesCount() {
        const unreadCount = this.messages.filter(m => !m.read && m.sender !== 'user').length;
        const countElement = document.getElementById('unreadMessages');
        
        countElement.textContent = unreadCount;
        
        if (unreadCount > 0) {
            countElement.style.display = 'flex';
        } else {
            countElement.style.display = 'none';
        }
    }
    
    showPushNotifications(notifications) {
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
    
    handleNotificationClick(notification) {
        // معالجة النقر على الإشعار
        switch (notification.type) {
            case 'project':
                this.viewProject(notification.data.projectId);
                break;
            case 'message':
                this.openChat();
                break;
            case 'approval':
                this.viewProject(notification.data.projectId);
                break;
            case 'reminder':
                this.navigateTo('projects');
                break;
        }
        
        // تعيين الإشعار كمقروء
        this.markNotificationAsRead(notification.id);
    }
    
    async markNotificationAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            await window.updateNotification(notification);
            this.updateNotificationCount();
        }
    }
    
    async markAllNotificationsAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        
        await window.markAllNotificationsAsRead();
        this.updateNotificationCount();
        this.loadNotifications();
    }
    
    async clearAllNotifications() {
        this.notifications = [];
        await window.clearAllNotifications();
        this.updateNotificationCount();
        this.loadNotifications();
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
        // تحميل بيانات التصميم
        this.loadDesignDetails(designId);
    }
    
    viewProject(projectId) {
        this.openModal('projectViewModal');
        // تحميل بيانات المشروع
        this.loadProjectDetails(projectId);
    }
    
    editProject(projectId) {
        this.openModal('projectEditModal');
        // تحميل بيانات المشروع للتعديل
        this.loadProjectForEdit(projectId);
    }
    
    async deleteProject(projectId) {
        if (confirm('هل أنت متأكد من رغبتك في حذف هذا المشروع؟')) {
            try {
                await window.deleteProject(projectId);
                this.showSuccess('تم الحذف', 'تم حذف المشروع بنجاح');
                this.loadRecentProjects();
            } catch (error) {
                this.showError('فشل الحذف', error.message);
            }
        }
    }
    
    saveCurrentProject() {
        // حفظ المشروع الحالي
        console.log('حفظ المشروع...');
        this.showSuccess('تم الحفظ', 'تم حفظ المشروع بنجاح');
    }
    
    sendWelcomeEmail(userData) {
        // محاكاة إرسال بريد ترحيبي
        console.log('إرسال بريد ترحيبي إلى:', userData.email);
    }
    
    openSearchFilterModal() {
        this.openModal('searchFilterModal');
    }
    
    openUpgradeModal() {
        this.openModal('upgradeModal');
    }
    
    openNewProjectModal() {
        this.openModal('newProjectModal');
    }
    
    openMusicSettings() {
        this.openModal('musicSettingsModal');
    }
    
    closeMusicPlayer() {
        const player = document.getElementById('musicPlayer');
        player.style.display = 'none';
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('ar-SA', options);
    }
    
    formatTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `قبل ${minutes} دقيقة`;
        if (hours < 24) return `قبل ${hours} ساعة`;
        if (days < 7) return `قبل ${days} يوم`;
        
        return this.formatDate(date);
    }
    
    showSuccess(title, message) {
        Toastify({
            text: `${title}: ${message}`,
            duration: 3000,
            gravity: "top",
            position: "left",
            backgroundColor: "linear-gradient(135deg, #2a9d8f, #4ecdc4)",
            stopOnFocus: true
        }).showToast();
    }
    
    showError(title, message) {
        Toastify({
            text: `${title}: ${message}`,
            duration: 5000,
            gravity: "top",
            position: "left",
            backgroundColor: "linear-gradient(135deg, #e76f51, #f28482)",
            stopOnFocus: true
        }).showToast();
    }
}

// تهيئة التطبيق
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new PixelArtApp();
    window.app = app; // جعل التطبيق متاحاً عالمياً
});

// دعم وضع عدم الاتصال
window.addEventListener('online', () => {
    console.log('تم استعادة الاتصال بالإنترنت');
    if (app) {
        app.showSuccess('تم استعادة الاتصال', 'جاري مزامنة البيانات...');
        app.syncData();
    }
});

window.addEventListener('offline', () => {
    console.log('فقد الاتصال بالإنترنت');
    if (app) {
        app.showError('فقد الاتصال', 'أنت غير متصل بالإنترنت');
    }
});

// دعم PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    const installPrompt = e;
    
    // عرض زر التثبيت
    const installBtn = document.createElement('button');
    installBtn.textContent = 'تثبيت التطبيق';
    installBtn.className = 'install-btn';
    installBtn.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        background: var(--primary-gradient);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        z-index: 1000;
        box-shadow: var(--shadow-lg);
    `;
    
    installBtn.addEventListener('click', () => {
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('تم قبول تثبيت التطبيق');
            } else {
                console.log('تم رفض تثبيت التطبيق');
            }
            installBtn.remove();
        });
    });
    
    document.body.appendChild(installBtn);
});

// دعم دورة حياة PWA
window.addEventListener('appinstalled', () => {
    console.log('تم تثبيت التطبيق بنجاح');
});

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
