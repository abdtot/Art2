// ============================================
// بيكسل آرت - التطبيق الرئيسي
// ============================================

class PixelArtApp {
    constructor() {
        this.initialize();
    }

    initialize() {
        // حالة التطبيق
        this.state = {
            user: null,
            isAuthenticated: false,
            darkMode: false,
            currentSection: 'dashboard',
            notifications: [],
            messages: [],
            projects: [],
            designs: [],
            designers: [],
            transactions: [],
            currentProject: null,
            currentChat: null,
            musicPlaying: false,
            isMobile: window.innerWidth < 768
        };

        // المتغيرات العامة
        this.elements = {};
        this.modals = {};
        this.audio = null;
        this.currentTrack = 0;

        // تهيئة التطبيق
        this.initDOM();
        this.initEventListeners();
        this.initState();
        this.initServiceWorker();
        this.startLoadingAnimation();
    }

    // تهيئة عناصر DOM
    initDOM() {
        this.elements = {
            // الشاشات
            loadingScreen: document.getElementById('loadingScreen'),
            authScreen: document.getElementById('authScreen'),
            appContainer: document.getElementById('appContainer'),
            
            // الشريط العلوي
            menuToggle: document.getElementById('menuToggle'),
            sidebar: document.getElementById('sidebar'),
            userProfile: document.getElementById('userProfile'),
            notificationBtn: document.getElementById('notificationBtn'),
            chatBtn: document.getElementById('chatBtn'),
            globalSearch: document.getElementById('globalSearch'),
            
            // التنقل
            navItems: document.querySelectorAll('.nav-item'),
            mobileNavItems: document.querySelectorAll('.mobile-nav-item'),
            
            // المحتوى الرئيسي
            mainContent: document.getElementById('mainContent'),
            sections: {
                dashboard: document.getElementById('dashboard'),
                explore: document.getElementById('explore'),
                designers: document.getElementById('designers'),
                projects: document.getElementById('projects'),
                'design-request': document.getElementById('design-request'),
                'design-tools': document.getElementById('design-tools'),
                wallet: document.getElementById('wallet'),
                messages: document.getElementById('messages')
            },
            
            // الأقسام
            progressFill: document.getElementById('progressFill'),
            loadingText: document.getElementById('loadingText'),
            
            // المحادثات والإشعارات
            chatWindow: document.getElementById('chatWindow'),
            notificationsPanel: document.getElementById('notificationsPanel'),
            quickActionsMenu: document.getElementById('quickActionsMenu'),
            quickActionBtn: document.getElementById('quickActionBtn'),
            
            // الموسيقى
            musicPlayer: document.getElementById('musicPlayer'),
            playPause: document.getElementById('playPause'),
            progressSlider: document.getElementById('progressSlider'),
            playerClose: document.getElementById('playerClose'),
            
            // المودالات
            modalOverlay: document.getElementById('modalOverlay')
        };

        // جمع المودالات
        this.modals = {
            designRequest: document.getElementById('designRequestModal'),
            payment: document.getElementById('paymentModal'),
            analytics: document.getElementById('analyticsModal')
        };
    }

    // تهيئة مستمعي الأحداث
    initEventListeners() {
        // القائمة الجانبية
        this.elements.menuToggle?.addEventListener('click', () => this.toggleSidebar());
        
        // التنقل بين الأقسام
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('href').substring(1);
                this.switchSection(section);
            });
        });

        // التنقل المحمول
        this.elements.mobileNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('href').substring(1);
                this.switchSection(section);
                
                // تحديث النشاط
                this.elements.mobileNavItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // الملف الشخصي
        this.elements.userProfile?.addEventListener('click', () => this.toggleUserMenu());

        // الإشعارات
        this.elements.notificationBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleNotifications();
        });

        // المحادثات
        this.elements.chatBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleChatWindow();
        });

        // الإجراءات السريعة
        this.elements.quickActionBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleQuickActions();
        });

        // إغلاق النوافذ عند النقر خارجها
        document.addEventListener('click', (e) => {
            this.closeAllPopups(e);
        });

        // البحث العام
        this.elements.globalSearch?.addEventListener('input', (e) => {
            this.handleGlobalSearch(e.target.value);
        });

        // الموسيقى
        this.elements.playPause?.addEventListener('click', () => this.toggleMusic());
        this.elements.progressSlider?.addEventListener('input', (e) => this.updateProgress(e.target.value));
        this.elements.playerClose?.addEventListener('click', () => this.closeMusicPlayer());

        // تغيير حجم النافذة
        window.addEventListener('resize', () => this.handleResize());
        
        // منع التمرير عند فتح النوافذ
        document.addEventListener('scroll', (e) => {
            if (this.isPopupOpen()) {
                e.preventDefault();
            }
        });

        // إضافة مستمعي الأحداث للوحة الإشعارات
        document.getElementById('markAllRead')?.addEventListener('click', () => this.markAllNotificationsAsRead());
        document.getElementById('clearNotifications')?.addEventListener('click', () => this.clearNotifications());

        // إضافة مستمعي الأحداث للدردشة
        document.getElementById('minimizeChat')?.addEventListener('click', () => this.minimizeChat());
        document.getElementById('closeChat')?.addEventListener('click', () => this.closeChat());
        document.getElementById('sendMessageBtn')?.addEventListener('click', () => this.sendMessage());
    }

    // تهيئة حالة التطبيق
    initState() {
        // تحميل البيانات من localStorage
        this.loadFromStorage();
        
        // التحقق من مصادقة المستخدم
        this.checkAuth();
        
        // تحديث الإحصائيات
        this.updateStats();
        
        // تحميل البيانات الأولية
        this.loadInitialData();
    }

    // تحميل البيانات من التخزين المحلي
    loadFromStorage() {
        try {
            const savedState = localStorage.getItem('pixelArtState');
            if (savedState) {
                const state = JSON.parse(savedState);
                Object.assign(this.state, state);
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
        }
    }

    // حفظ البيانات في التخزين المحلي
    saveToStorage() {
        try {
            // لا تحفظ البيانات الحساسة
            const stateToSave = {
                darkMode: this.state.darkMode,
                currentSection: this.state.currentSection,
                notifications: this.state.notifications,
                messages: this.state.messages,
                projects: this.state.projects,
                designs: this.state.designs,
                designers: this.state.designers,
                transactions: this.state.transactions
            };
            
            localStorage.setItem('pixelArtState', JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    // التحقق من مصادقة المستخدم
    checkAuth() {
        const user = localStorage.getItem('pixelArtUser');
        if (user) {
            this.state.user = JSON.parse(user);
            this.state.isAuthenticated = true;
            this.showApp();
        } else {
            this.showAuth();
        }
    }

    // بدء رسوميات التحميل
    startLoadingAnimation() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) {
                progress = 100;
                clearInterval(interval);
                
                // بعد التحميل، إظهار الشاشة المناسبة
                setTimeout(() => {
                    this.elements.loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        this.elements.loadingScreen.style.display = 'none';
                        
                        if (this.state.isAuthenticated) {
                            this.showApp();
                        } else {
                            this.showAuth();
                        }
                    }, 500);
                }, 300);
            }
            
            this.elements.progressFill.style.width = `${progress}%`;
            this.elements.loadingText.textContent = this.getLoadingText(progress);
        }, 100);
    }

    // نصوص التحميل
    getLoadingText(progress) {
        if (progress < 30) return 'جاري تحميل التطبيق...';
        if (progress < 60) return 'جاري تهيئة البيانات...';
        if (progress < 90) return 'جاري تحميل الواجهات...';
        return 'جاهز للبدء!';
    }

    // إظهار تطبيق
    showApp() {
        this.elements.authScreen.style.display = 'none';
        this.elements.appContainer.style.display = 'block';
        
        // تحديث واجهة المستخدم
        this.updateUI();
        
        // تشغيل الموسيقى التلقائية (اختياري)
        if (this.state.user?.settings?.autoPlayMusic) {
            this.initMusicPlayer();
        }
    }

    // إظهار شاشة المصادقة
    showAuth() {
        this.elements.authScreen.style.display = 'block';
        this.elements.appContainer.style.display = 'none';
    }

    // تبديل القائمة الجانبية
    toggleSidebar() {
        this.elements.sidebar.classList.toggle('open');
        this.elements.menuToggle.innerHTML = this.elements.sidebar.classList.contains('open') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    }

    // تبديل القسم
    switchSection(sectionId) {
        // إخفاء جميع الأقسام
        Object.values(this.elements.sections).forEach(section => {
            if (section) {
                section.classList.remove('active');
            }
        });
        
        // إزالة النشاط من جميع عناصر التنقل
        this.elements.navItems.forEach(item => item.classList.remove('active'));
        
        // إظهار القسم المطلوب
        const targetSection = this.elements.sections[sectionId];
        if (targetSection) {
            targetSection.classList.add('active');
            
            // تحديث عناصر التنقل
            const navItem = document.querySelector(`.nav-item[href="#${sectionId}"]`);
            if (navItem) navItem.classList.add('active');
            
            // تحديث حالة التطبيق
            this.state.currentSection = sectionId;
            this.saveToStorage();
            
            // تحميل بيانات القسم
            this.loadSectionData(sectionId);
            
            // إغلاق القائمة الجانبية على الهاتف
            if (this.state.isMobile) {
                this.elements.sidebar.classList.remove('open');
            }
        }
    }

    // تحميل بيانات القسم
    loadSectionData(sectionId) {
        switch(sectionId) {
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
            case 'wallet':
                this.loadWalletData();
                break;
            case 'messages':
                this.loadMessagesData();
                break;
        }
    }

    // تحميل بيانات لوحة التحكم
    loadDashboardData() {
        // تحديث الإحصائيات
        this.updateStats();
        
        // تحميل المشاريع الحديثة
        this.loadRecentProjects();
        
        // تحميل النشاط الحديث
        this.loadRecentActivity();
        
        // تحميل التصاميم المميزة
        this.loadFeaturedDesigns();
    }

    // تحديث الإحصائيات
    updateStats() {
        // هنا يمكنك جلب البيانات من API
        const stats = {
            activeProjects: 5,
            walletBalance: '1,250 ريال',
            pendingProjects: 3,
            userRating: 4.8
        };
        
        // تحديث DOM
        document.getElementById('activeProjects').textContent = stats.activeProjects;
        document.getElementById('walletBalance').textContent = stats.walletBalance;
        document.getElementById('pendingProjects').textContent = stats.pendingProjects;
        document.getElementById('userRating').textContent = stats.userRating;
    }

    // تحميل المشاريع الحديثة
    loadRecentProjects() {
        const projectsTable = document.getElementById('projectsTable');
        if (!projectsTable) return;
        
        // بيانات نموذجية
        const projects = [
            {
                name: 'تصميم شعار لمطعم',
                designer: 'أحمد المصمم',
                status: 'in-progress',
                date: '15 فبراير 2024',
                progress: 60
            },
            {
                name: 'بروشور لمؤتمر',
                designer: 'سارة المصممة',
                status: 'pending',
                date: '10 فبراير 2024',
                progress: 0
            },
            {
                name: 'هوية بصرية لشركة',
                designer: 'خالد المصمم',
                status: 'completed',
                date: '5 يناير 2024',
                progress: 100
            }
        ];
        
        projectsTable.innerHTML = projects.map(project => `
            <div class="project-row">
                <div class="project-info">
                    <div class="project-icon">
                        <i class="fas fa-project-diagram"></i>
                    </div>
                    <div class="project-details">
                        <h4>${project.name}</h4>
                        <span>${project.date}</span>
                    </div>
                </div>
                <div class="designer-info">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(project.designer)}&background=0a9396&color=fff" 
                         alt="${project.designer}" class="designer-avatar">
                    <span>${project.designer}</span>
                </div>
                <div>
                    <span class="status-badge ${project.status}">
                        ${project.status === 'in-progress' ? 'قيد التنفيذ' : 
                          project.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}
                    </span>
                </div>
                <div>${project.date}</div>
                <div class="project-actions">
                    <button class="action-icon-btn">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-icon-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // تحميل النشاط الحديث
    loadRecentActivity() {
        const activityTimeline = document.getElementById('activityTimeline');
        if (!activityTimeline) return;
        
        const activities = [
            {
                time: '10:30 ص',
                title: 'تم إرسال تصميم جديد',
                description: 'أحمد المصمم أرسل النسخة الأولى من الشعار'
            },
            {
                time: 'أمس، 2:45 م',
                title: 'تم دفع فاتورة',
                description: 'تم دفع مبلغ 800 ريال لمشروع تصميم شعار'
            },
            {
                time: '15 فبراير',
                title: 'مشروع جديد',
                description: 'تم إنشاء مشروع بروشور للمؤتمر'
            }
        ];
        
        activityTimeline.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-dot"></div>
                <div class="activity-time">${activity.time}</div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                </div>
            </div>
        `).join('');
    }

    // تحميل التصاميم المميزة
    loadFeaturedDesigns() {
        const featuredSlider = document.getElementById('featuredSlider');
        if (!featuredSlider) return;
        
        const slides = [
            {
                title: 'تصميم إعلان احترافي',
                description: 'احصل على تصميم إعلاني مميز يلفت الأنظار',
                image: 'https://via.placeholder.com/800x400/0a9396/fff?text=إعلان+مميز'
            },
            {
                title: 'هوية بصرية متكاملة',
                description: 'شعار + بطاقات عمل + تصميم الموقع',
                image: 'https://via.placeholder.com/800x400/94d2bd/000?text=هوية+بصرية'
            }
        ];
        
        const sliderContainer = featuredSlider.querySelector('.slider-container');
        if (sliderContainer) {
            sliderContainer.innerHTML = slides.map(slide => `
                <div class="featured-slide">
                    <div class="featured-slide-content">
                        <h4>${slide.title}</h4>
                        <p>${slide.description}</p>
                        <button class="action-btn">اطلب الآن</button>
                    </div>
                </div>
            `).join('');
        }
    }

    // تبديل الإشعارات
    toggleNotifications() {
        const panel = this.elements.notificationsPanel;
        panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
        
        if (panel.style.display === 'flex') {
            this.loadNotifications();
        }
    }

    // تحميل الإشعارات
    loadNotifications() {
        const list = document.getElementById('notificationsList');
        if (!list) return;
        
        const notifications = this.state.notifications.length > 0 
            ? this.state.notifications 
            : this.getSampleNotifications();
        
        list.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.unread ? 'unread' : ''}">
                <div class="notification-header">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
                <div class="notification-content">${notification.content}</div>
                <div class="notification-actions">
                    <button class="action-btn small">مشاهدة</button>
                    <button class="action-btn small outline">تجاهل</button>
                </div>
            </div>
        `).join('');
    }

    // إشعارات نموذجية
    getSampleNotifications() {
        return [
            {
                id: 1,
                title: 'مشروع جديد',
                content: 'تم قبول مشروع تصميم الشعار الخاص بك',
                time: 'منذ 5 دقائق',
                unread: true
            },
            {
                id: 2,
                title: 'رسالة جديدة',
                content: 'أحمد المصمم أرسل لك رسالة',
                time: 'منذ ساعة',
                unread: true
            },
            {
                id: 3,
                title: 'دفع مستلم',
                content: 'تم استلام دفعة بقيمة 500 ريال',
                time: 'منذ يوم',
                unread: false
            }
        ];
    }

    // تعيين جميع الإشعارات كمقروءة
    markAllNotificationsAsRead() {
        this.state.notifications = this.state.notifications.map(n => ({ ...n, unread: false }));
        this.saveToStorage();
        this.loadNotifications();
        
        // تحديث العداد
        document.getElementById('notificationCount').textContent = '0';
    }

    // مسح جميع الإشعارات
    clearNotifications() {
        this.state.notifications = [];
        this.saveToStorage();
        this.loadNotifications();
        document.getElementById('notificationCount').textContent = '0';
    }

    // تبديل نافذة الدردشة
    toggleChatWindow() {
        const chatWindow = this.elements.chatWindow;
        chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
        
        if (chatWindow.style.display === 'flex') {
            this.loadChatMessages();
        }
    }

    // تحميل رسائل الدردشة
    loadChatMessages() {
        const chatBody = document.getElementById('chatBody');
        if (!chatBody) return;
        
        const messages = this.state.messages.length > 0 
            ? this.state.messages 
            : this.getSampleMessages();
        
        chatBody.innerHTML = messages.map(msg => `
            <div class="message ${msg.sender === 'user' ? 'sent' : 'received'}">
                <div class="message-body">
                    <p>${msg.text}</p>
                    <div class="message-time">${msg.time}</div>
                </div>
            </div>
        `).join('');
        
        // التمرير للأسفل
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // رسائل نموذجية
    getSampleMessages() {
        return [
            {
                id: 1,
                text: 'مرحباً، كيف يمكنني مساعدتك اليوم؟',
                sender: 'designer',
                time: '10:15 ص'
            },
            {
                id: 2,
                text: 'أريد طلب تصميم شعار لمطعمي الجديد',
                sender: 'user',
                time: '10:20 ص'
            },
            {
                id: 3,
                text: 'ممتاز! أخبرني بالمزيد عن مطعمك',
                sender: 'designer',
                time: '10:22 ص'
            }
        ];
    }

    // إرسال رسالة
    sendMessage() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        
        if (!text) return;
        
        // إضافة الرسالة
        const newMessage = {
            id: Date.now(),
            text: text,
            sender: 'user',
            time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
        };
        
        this.state.messages.push(newMessage);
        this.saveToStorage();
        
        // تحديث الواجهة
        this.loadChatMessages();
        
        // مسح الحقل
        input.value = '';
        
        // رد تلقائي (محاكاة)
        setTimeout(() => {
            const reply = {
                id: Date.now() + 1,
                text: 'تم استلام رسالتك، سأرد عليك قريباً!',
                sender: 'designer',
                time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
            };
            
            this.state.messages.push(reply);
            this.saveToStorage();
            this.loadChatMessages();
        }, 1000);
    }

    // تصغير الدردشة
    minimizeChat() {
        this.elements.chatWindow.style.display = 'none';
    }

    // إغلاق الدردشة
    closeChat() {
        this.elements.chatWindow.style.display = 'none';
    }

    // تبديل الإجراءات السريعة
    toggleQuickActions() {
        const menu = this.elements.quickActionsMenu;
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }

    // إغلاق جميع النوافذ المنبثقة
    closeAllPopups(e) {
        // التحقق من النقر خارج النوافذ
        const chatWindow = this.elements.chatWindow;
        const notificationsPanel = this.elements.notificationsPanel;
        const quickActionsMenu = this.elements.quickActionsMenu;
        
        if (chatWindow.style.display === 'flex' && 
            !chatWindow.contains(e.target) && 
            !this.elements.chatBtn.contains(e.target)) {
            chatWindow.style.display = 'none';
        }
        
        if (notificationsPanel.style.display === 'flex' && 
            !notificationsPanel.contains(e.target) && 
            !this.elements.notificationBtn.contains(e.target)) {
            notificationsPanel.style.display = 'none';
        }
        
        if (quickActionsMenu.style.display === 'block' && 
            !quickActionsMenu.contains(e.target) && 
            !this.elements.quickActionBtn.contains(e.target)) {
            quickActionsMenu.style.display = 'none';
        }
    }

    // التحقق مما إذا كانت هناك نوافذ مفتوحة
    isPopupOpen() {
        return this.elements.chatWindow.style.display === 'flex' ||
               this.elements.notificationsPanel.style.display === 'flex' ||
               this.elements.quickActionsMenu.style.display === 'block';
    }

    // البحث العام
    handleGlobalSearch(query) {
        if (!query.trim()) return;
        
        // البحث في البيانات المحلية أولاً
        const results = this.searchInLocalData(query);
        
        // عرض النتائج
        this.showSearchResults(results);
    }

    // البحث في البيانات المحلية
    searchInLocalData(query) {
        const results = {
            designs: [],
            designers: [],
            projects: []
        };
        
        // البحث في التصاميم
        if (this.state.designs && this.state.designs.length > 0) {
            results.designs = this.state.designs.filter(design => 
                design.name.includes(query) || 
                design.description.includes(query)
            );
        }
        
        // البحث في المصممين
        if (this.state.designers && this.state.designers.length > 0) {
            results.designers = this.state.designers.filter(designer => 
                designer.name.includes(query) || 
                designer.skills.some(skill => skill.includes(query))
            );
        }
        
        // البحث في المشاريع
        if (this.state.projects && this.state.projects.length > 0) {
            results.projects = this.state.projects.filter(project => 
                project.name.includes(query) || 
                project.description.includes(query)
            );
        }
        
        return results;
    }

    // عرض نتائج البحث
    showSearchResults(results) {
        // يمكن إنشاء نافذة منبثقة لعرض النتائج
        console.log('نتائج البحث:', results);
        
        // عرض إشعار بالنتائج
        Toastify({
            text: `تم العثور على ${results.designs.length + results.designers.length + results.projects.length} نتيجة`,
            duration: 3000,
            gravity: "top",
            position: "left",
            backgroundColor: "var(--primary-color)"
        }).showToast();
    }

    // تهيئة مشغل الموسيقى
    initMusicPlayer() {
        this.audio = new Audio();
        this.audio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        this.audio.loop = true;
        
        // تحديث شريط التقدم
        this.audio.addEventListener('timeupdate', () => {
            if (this.audio.duration) {
                const progress = (this.audio.currentTime / this.audio.duration) * 100;
                this.elements.progressSlider.value = progress;
            }
        });
        
        // عند انتهاء الموسيقى
        this.audio.addEventListener('ended', () => {
            this.state.musicPlaying = false;
            this.elements.playPause.innerHTML = '<i class="fas fa-play"></i>';
        });
    }

    // تبديل الموسيقى
    toggleMusic() {
        if (!this.audio) {
            this.initMusicPlayer();
        }
        
        if (this.state.musicPlaying) {
            this.audio.pause();
            this.elements.playPause.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            this.audio.play();
            this.elements.playPause.innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        this.state.musicPlaying = !this.state.musicPlaying;
    }

    // تحديث تقدم الموسيقى
    updateProgress(value) {
        if (this.audio && this.audio.duration) {
            this.audio.currentTime = (value / 100) * this.audio.duration;
        }
    }

    // إغلاق مشغل الموسيقى
    closeMusicPlayer() {
        if (this.audio) {
            this.audio.pause();
        }
        this.elements.musicPlayer.style.display = 'none';
    }

    // التعامل مع تغيير حجم النافذة
    handleResize() {
        const isMobile = window.innerWidth < 768;
        if (this.state.isMobile !== isMobile) {
            this.state.isMobile = isMobile;
            
            // إغلاق القائمة الجانبية على الهاتف
            if (isMobile) {
                this.elements.sidebar.classList.remove('open');
            }
        }
    }

    // تحميل البيانات الأولية
    loadInitialData() {
        // بيانات نموذجية للتصاميم
        this.state.designs = this.getSampleDesigns();
        
        // بيانات نموذجية للمصممين
        this.state.designers = this.getSampleDesigners();
        
        // بيانات نموذجية للمشاريع
        this.state.projects = this.getSampleProjects();
        
        // بيانات نموذجية للمعاملات
        this.state.transactions = this.getSampleTransactions();
        
        // حفظ البيانات
        this.saveToStorage();
    }

    // بيانات تصاميم نموذجية
    getSampleDesigns() {
        return [
            {
                id: 1,
                name: 'تصميم إعلان لمطعم',
                description: 'تصميم إعلاني احترافي لمطعم متخصص في المأكولات العربية',
                price: 450,
                designer: 'أحمد المصمم',
                category: 'إعلانات',
                likes: 125,
                views: 2500
            },
            {
                id: 2,
                name: 'هوية بصرية لشركة تقنية',
                description: 'تصميم شعار وبطاقات عمل لشركة ناشئة في مجال التكنولوجيا',
                price: 850,
                designer: 'سارة المصممة',
                category: 'هويات بصرية',
                likes: 89,
                views: 1800
            }
        ];
    }

    // بيانات مصممين نموذجية
    getSampleDesigners() {
        return [
            {
                id: 1,
                name: 'أحمد علي',
                title: 'مصمم جرافيك محترف',
                rating: 4.8,
                reviews: 127,
                projects: 245,
                satisfaction: 98,
                experience: 3,
                skills: ['فوتوشوب', 'Illustrator', 'After Effects', 'Figma'],
                price: 250,
                online: true
            },
            {
                id: 2,
                name: 'سارة محمد',
                title: 'مصممة UI/UX',
                rating: 4.5,
                reviews: 89,
                projects: 187,
                satisfaction: 96,
                experience: 2,
                skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
                price: 350,
                online: false
            }
        ];
    }

    // بيانات مشاريع نموذجية
    getSampleProjects() {
        return [
            {
                id: 1,
                name: 'تصميم شعار لمطعم',
                status: 'active',
                progress: 60,
                budget: 1200,
                designer: 'أحمد المصمم',
                startDate: '15 فبراير 2024',
                deadline: '20 فبراير 2024'
            },
            {
                id: 2,
                name: 'بروشور لمؤتمر',
                status: 'pending',
                progress: 0,
                budget: 800,
                designer: 'سارة المصممة',
                startDate: '10 فبراير 2024',
                deadline: '24 فبراير 2024'
            }
        ];
    }

    // بيانات معاملات نموذجية
    getSampleTransactions() {
        return [
            {
                id: 1,
                type: 'deposit',
                amount: 500,
                description: 'إيداع من بطاقة ائتمان',
                date: 'اليوم، 10:30 ص',
                status: 'completed'
            },
            {
                id: 2,
                type: 'payment',
                amount: -800,
                description: 'دفع لمشروع تصميم شعار',
                date: 'أمس، 2:45 م',
                status: 'completed'
            }
        ];
    }

    // تبديل وضع المستخدم
    toggleUserMenu() {
        // يمكن إضافة قائمة منسدلة هنا
        console.log('فتح قائمة المستخدم');
    }

    // تحديث واجهة المستخدم
    updateUI() {
        // تحديث اسم المستخدم
        if (this.state.user) {
            document.getElementById('userName').textContent = this.state.user.name || 'مستخدم';
            document.getElementById('userRole').textContent = this.state.user.role === 'designer' ? 'مصمم' : 'عميل';
        }
        
        // تحديث الوضع الداكن
        if (this.state.darkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    // تسجيل Service Worker
    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        }
    }

    // تحميل بيانات قسم الاستكشاف
    loadExploreData() {
        console.log('تحميل بيانات الاستكشاف...');
        // سيتم تنفيذها في ملف design.js
    }

    // تحميل بيانات قسم المصممين
    loadDesignersData() {
        console.log('تحميل بيانات المصممين...');
        // سيتم تنفيذها في ملف hiring.js
    }

    // تحميل بيانات قسم المشاريع
    loadProjectsData() {
        console.log('تحميل بيانات المشاريع...');
        // سيتم تنفيذها في ملف design.js
    }

    // تحميل بيانات قسم المحفظة
    loadWalletData() {
        console.log('تحميل بيانات المحفظة...');
        // سيتم تنفيذها في ملف payment.js
    }

    // تحميل بيانات قسم الرسائل
    loadMessagesData() {
        console.log('تحميل بيانات الرسائل...');
        // سيتم تنفيذها في ملف chat.js
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.pixelArtApp = new PixelArtApp();
});

// تصدير الفئة للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PixelArtApp;
}
