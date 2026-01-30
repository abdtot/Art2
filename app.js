
// تطبيق بيكسل آرت - الإصدار المتقدم (المتوافق مع IndexedDB المحدث)

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
        
        // نبدأ بالتهيئة
        this.init();
    }
    
    async init() {
        try {
            // 1. تهيئة قاعدة البيانات أولاً وقبل كل شيء
            await this.initDatabase();
            
            // 2. التحقق من الهوية (Auth)
            await this.checkAuthStatus();
            
            // 3. تهيئة الواجهة والأحداث
            this.initializeEvents();
            this.initTheme();
            
            // 4. تحميل البيانات الأولية من IndexedDB
            await this.loadInitialData();
            
            // 5. تحديث الواجهة وبدء الخدمات
            this.updateUI();
            this.startBackgroundServices();
            
            // إخفاء شاشة التحميل بعد استقرار كل شيء
            setTimeout(() => this.hideLoadingScreen(), 1000);
            
        } catch (error) {
            console.error('فشل بدء التطبيق:', error);
            this.showError('خطأ حرج', 'فشل تحميل التطبيق، يرجى تحديث الصفحة.');
        }
    }
    
    // التعديل الجوهري لربط قاعدة البيانات
    async initDatabase() {
        try {
            if (!window.db) {
                throw new Error('ملف قاعدة البيانات غير محمل!');
            }
            // إظهار شاشة التحميل يدوياً هنا لأن الـ init يُستدعى فوراً
            this.showLoadingScreen();
            
            // تهيئة IndexedDB والانتظار حتى تكتمل
            await window.db.init();
            console.log('✅ تم اتصال IndexedDB بنجاح');
            return true;
        } catch (error) {
            console.error('❌ فشل تهيئة قاعدة البيانات:', error);
            this.showError('فشل قاعدة البيانات', error.message);
            throw error;
        }
    }

    // جلب البيانات الفعلية من IndexedDB بدلاً من الـ Mock Data
    async loadInitialData() {
        try {
            if (!this.currentUser) return;
            
            // تحميل البيانات بالتوازي لسرعة الأداء
            const [projects, designs, designers] = await Promise.all([
                window.getAllProjects(),
                window.getAllDesigns(),
                window.getAllDesigners()
            ]);
            
            this.projects = projects || [];
            this.designs = designs || [];
            this.designers = designers || [];
            
            // تحديث القوائم في الواجهة
            await this.loadDashboardData();
            await this.loadNotifications();
            
        } catch (error) {
            console.error('فشل تحميل البيانات الأولية من DB:', error);
        }
    }

    async checkAuthStatus() {
        const userData = localStorage.getItem('pixelArtUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.showApp();
            return true;
        }
        this.showAuthScreen();
        return false;
    }

    // تحديث لوحة التحكم ببيانات حقيقية
    async loadDashboardData() {
        try {
            // تحديث الإحصائيات بناءً على المصفوفات المحملة من DB
            const activeCount = this.projects.filter(p => p.status === 'in-progress').length;
            const pendingCount = this.projects.filter(p => p.status === 'pending').length;
            
            document.getElementById('activeProjects').textContent = activeCount;
            document.getElementById('walletBalance').textContent = `${this.currentUser?.balance || 0} ريال`;
            document.getElementById('pendingProjects').textContent = pendingCount;
            
            // تحميل القوائم المرئية
            this.renderRecentProjects();
            this.loadFeaturedDesigns();
        } catch (error) {
            console.error('خطأ في تحديث لوحة التحكم:', error);
        }
    }

    // دالة الرسم (Render) للمشاريع
    renderRecentProjects() {
        const tableBody = document.getElementById('projectsTable');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        if (this.projects.length === 0) {
            tableBody.innerHTML = '<div class="no-data">لا توجد مشاريع حالياً</div>';
            return;
        }

        this.projects.slice(0, 5).forEach(project => {
            const row = document.createElement('div');
            row.className = 'project-row';
            row.innerHTML = `
                <div class="project-info">
                    <div class="project-icon"><i class="fas fa-palette"></i></div>
                    <div class="project-details">
                        <h4>${project.name || project.title}</h4>
                        <span>${project.price} ريال</span>
                    </div>
                </div>
                <div class="status-badge ${project.status}">${this.translateStatus(project.status)}</div>
                <div class="project-actions">
                    <button class="action-icon-btn" onclick="app.viewProject(${project.id})"><i class="fas fa-eye"></i></button>
                    <button class="action-icon-btn" onclick="app.deleteProject(${project.id})"><i class="fas fa-trash"></i></button>
                </div>
            `;
            tableBody.appendChild(row);
        });
    }

    translateStatus(status) {
        const map = { 'pending': 'قيد الانتظار', 'in-progress': 'قيد التنفيذ', 'completed': 'مكتمل' };
        return map[status] || status;
    }

    // حفظ الرسائل في IndexedDB
    async saveMessage(message) {
        try {
            await window.saveMessage({
                ...message,
                userId: this.currentUser?.id,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('فشل حفظ الرسالة في DB:', error);
        }
    }

    // --- بقية وظائف UI (تم الإبقاء عليها مع التأكد من ربطها بـ window.db) ---

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) loadingScreen.style.display = 'flex';
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.style.display = 'none', 500);
        }
    }

    showAuthScreen() {
        document.getElementById('authScreen').style.display = 'block';
        document.getElementById('appContainer').style.display = 'none';
    }

    showApp() {
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
        this.loadUserData();
    }

    loadUserData() {
        if (!this.currentUser) return;
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userRole').textContent = this.currentUser.role === 'designer' ? 'مصمم' : 'عميل';
        const profileImage = document.querySelector('.profile-image');
        if (profileImage && this.currentUser.avatar) profileImage.src = this.currentUser.avatar;
    }

    async handleLogin(email, password, rememberMe) {
        try {
            this.showLoadingScreen();
            // محاكاة سريعة للتحقق (يمكنك ربطها بـ window.db.getUserByEmail لاحقاً)
            await new Promise(r => setTimeout(r, 1000));
            
            this.currentUser = {
                id: 1,
                email,
                name: 'مستخدم بيكسل',
                role: 'client',
                balance: 1250,
                avatar: `https://ui-avatars.com/api/?name=Pixel&background=0a9396&color=fff`
            };
            
            localStorage.setItem('pixelArtUser', JSON.stringify(this.currentUser));
            this.showApp();
            await this.loadInitialData();
            this.showSuccess('مرحباً بك', 'تم تسجيل الدخول بنجاح');
        } catch (e) {
            this.showError('خطأ', 'فشل تسجيل الدخول');
        } finally {
            this.hideLoadingScreen();
        }
    }

    // تهيئة الأحداث (Navigation, Tabs, etc.)
    initializeEvents() {
        // التنقل بين الصفحات
        document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('href').substring(1);
                this.navigateTo(page);
            });
        });

        // زر القائمة الجانبية
        document.getElementById('menuToggle')?.addEventListener('click', () => this.toggleSidebar());

        // تسجيل الدخول
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin('test@test.com', '123', true);
        });

        // الوضع الداكن
        document.getElementById('darkModeToggle')?.addEventListener('click', () => this.toggleDarkMode());
    }

    navigateTo(page) {
        document.querySelectorAll('.dashboard-section, .explore-section, .projects-section').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(page);
        if (target) {
            target.classList.add('active');
            this.currentPage = page;
        }
        if (window.innerWidth < 768) this.closeSidebar();
    }

    toggleSidebar() {
        const sb = document.getElementById('sidebar');
        sb.classList.toggle('open');
        this.isSidebarOpen = sb.classList.contains('open');
    }

    closeSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        this.isSidebarOpen = false;
    }

    initTheme() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) document.body.classList.add('dark-mode');
    }

    toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDark);
    }

    showSuccess(title, msg) {
        Toastify({ text: `${title}: ${msg}`, backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)" }).showToast();
    }

    showError(title, msg) {
        Toastify({ text: `${title}: ${msg}`, backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)" }).showToast();
    }

    startBackgroundServices() {
        // تحديث الإشعارات كل دقيقة
        setInterval(() => this.loadNotifications(), 60000);
    }

    async loadNotifications() {
        if (!this.currentUser) return;
        try {
            const list = document.getElementById('notificationsList');
            if (!list) return;
            // جلب حقيقي من DB
            const notifications = await window.db.executeTransaction('notifications', 'readonly', s => s.getAll());
            const unread = notifications.filter(n => n.userId === this.currentUser.id && !n.read);
            document.getElementById('notificationCount').textContent = unread.length;
        } catch (e) { console.log("Notification load error"); }
    }
}

// تشغيل التطبيق
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PixelArtApp();
    window.app = app;
});
