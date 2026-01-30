/**
 * ملف التطبيق الرئيسي - بيكسل آرت
 * إدارة واجهة المستخدم، التنقل، والحالات العامة للتطبيق
 * @version 1.0.0
 */

// ===== الثوابت والتكوين =====
const APP_CONFIG = {
    DEBUG: true,
    APP_NAME: 'بيكسل آرت',
    VERSION: '1.0.0',
    THEME_KEY: 'pixelart_theme',
    LANGUAGE_KEY: 'pixelart_language',
    SIDEBAR_STATE_KEY: 'pixelart_sidebar_state',
    NOTIFICATIONS_KEY: 'pixelart_notifications',
    USER_PREFERENCES_KEY: 'pixelart_user_prefs'
};

// ===== حالة التطبيق =====
let appState = {
    currentSection: 'dashboard',
    sidebarOpen: false,
    darkMode: false,
    language: 'ar',
    quickActionsVisible: false,
    chatWindowVisible: false,
    notificationsVisible: false,
    musicPlaying: false,
    isMobile: window.innerWidth <= 768,
    isLoading: false,
    notifications: [],
    unreadNotifications: 0,
    unreadMessages: 0,
    activeChat: null,
    featuredDesigns: [],
    recentActivities: [],
    userStats: {}
};

// ===== عناصر DOM الرئيسية =====
const DOM = {
    // العناصر الرئيسية
    appContainer: document.getElementById('appContainer'),
    mainContent: document.getElementById('mainContent'),
    sidebar: document.getElementById('sidebar'),
    menuToggle: document.getElementById('menuToggle'),
    
    // الأقسام
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
    
    // عناصر التنقل
    navItems: document.querySelectorAll('.nav-item'),
    mobileNavItems: document.querySelectorAll('.mobile-nav-item'),
    
    // الشريط العلوي
    globalSearch: document.getElementById('globalSearch'),
    searchFilter: document.getElementById('searchFilter'),
    notificationBtn: document.getElementById('notificationBtn'),
    notificationCount: document.getElementById('notificationCount'),
    chatBtn: document.getElementById('chatBtn'),
    unreadMessages: document.getElementById('unreadMessages'),
    userProfile: document.getElementById('userProfile'),
    
    // الإجراءات السريعة
    quickActionBtn: document.getElementById('quickActionBtn'),
    quickActionsMenu: document.getElementById('quickActionsMenu'),
    closeActions: document.getElementById('closeActions'),
    quickActions: document.querySelectorAll('.quick-action'),
    
    // النوافذ العائمة
    chatWindow: document.getElementById('chatWindow'),
    minimizeChat: document.getElementById('minimizeChat'),
    closeChat: document.getElementById('closeChat'),
    notificationsPanel: document.getElementById('notificationsPanel'),
    markAllRead: document.getElementById('markAllRead'),
    clearNotifications: document.getElementById('clearNotifications'),
    musicPlayer: document.getElementById('musicPlayer'),
    playPause: document.getElementById('playPause'),
    playerClose: document.getElementById('playerClose'),
    
    // لوحة التحكم
    activeProjects: document.getElementById('activeProjects'),
    walletBalance: document.getElementById('walletBalance'),
    pendingProjects: document.getElementById('pendingProjects'),
    userRating: document.getElementById('userRating'),
    featuredSlider: document.getElementById('featuredSlider'),
    projectsTable: document.getElementById('projectsTable'),
    activityTimeline: document.getElementById('activityTimeline'),
    quickDesignBtn: document.getElementById('quickDesignBtn'),
    refreshDashboard: document.getElementById('refreshDashboard'),
    createProjectBtn: document.getElementById('createProjectBtn'),
    
    // استكشاف التصاميم
    exploreSearch: document.querySelector('.explore-search'),
    filterExplore: document.getElementById('filterExplore'),
    categoryCards: document.querySelectorAll('.category-card'),
    loadMoreDesigns: document.getElementById('loadMoreDesigns'),
    
    // المصممون
    designersSearch: document.querySelector('.designers-search'),
    sortDesigners: document.getElementById('sortDesigners'),
    filterTags: document.querySelectorAll('.filter-tag'),
    
    // المشاريع
    newProjectBtn: document.getElementById('newProjectBtn'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    viewOptions: document.querySelectorAll('.view-option'),
    projectsGrid: document.getElementById('projectsGrid'),
    
    // طلب التصميم
    designRequestForm: document.getElementById('designRequestForm'),
    designTypeCards: document.querySelectorAll('.design-type-card'),
    stepperSteps: document.querySelectorAll('.stepper-step'),
    projectDescription: document.getElementById('projectDescription'),
    charCount: document.getElementById('charCount'),
    projectFiles: document.getElementById('projectFiles'),
    uploadedFiles: document.getElementById('uploadedFiles'),
    projectBudget: document.getElementById('projectBudget'),
    currentBudget: document.getElementById('currentBudget'),
    deliveryOptions: document.querySelectorAll('.delivery-option'),
    designerOptions: document.querySelectorAll('input[name="designerOption"]'),
    nextStepButtons: document.querySelectorAll('.next-step'),
    prevStepButtons: document.querySelectorAll('.prev-step'),
    submitRequest: document.querySelector('.submit-request'),
    
    // أدوات التصميم
    toolButtons: document.querySelectorAll('.tool-btn'),
    toolContents: document.querySelectorAll('[data-tool-content]'),
    designCanvas: document.getElementById('designCanvas'),
    
    // المحفظة
    depositBtn: document.getElementById('depositBtn'),
    withdrawBtn: document.getElementById('withdrawBtn'),
    transactionFilter: document.getElementById('transactionFilter'),
    addPaymentMethod: document.getElementById('addPaymentMethod'),
    
    // الدردشة
    newMessageBtn: document.getElementById('newMessageBtn'),
    chatSearchBtn: document.getElementById('chatSearchBtn'),
    conversationItems: document.querySelectorAll('.conversation-item'),
    chatMessages: document.getElementById('chatMessages'),
    sendMessageBtn: document.querySelector('.send-btn'),
    messageInput: document.querySelector('textarea'),
    
    // الشريط السفلي للموبايل
    mobileBottomNav: document.querySelector('.mobile-bottom-nav'),
    mobileNavCenter: document.querySelector('.mobile-nav-center')
};

// ===== تهيئة التطبيق =====
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    setupEventListeners();
    loadInitialData();
});

/**
 * تهيئة التطبيق
 */
function initApp() {
    // تحميل التفضيلات المحفوظة
    loadPreferences();
    
    // تعيين الوضع الداكن
    setDarkMode(appState.darkMode);
    
    // تحديث حالة الشاشة
    updateScreenState();
    
    // التحقق من حالة المصادقة
    if (typeof AuthManager !== 'undefined' && !AuthManager.isAuthenticated()) {
        return;
    }
    
    // إعداد الواجهة
    setupUI();
    
    // تحديث الإحصائيات
    updateDashboardStats();
    
    // تحميل الإشعارات
    loadNotifications();
    
    // بدء الخدمات في الخلفية
    startBackgroundServices();
    
    log('التطبيق جاهز', 'success');
}

/**
 * إعداد مستمعي الأحداث
 */
function setupEventListeners() {
    // ===== التنقل الرئيسي =====
    
    // تبديل القائمة الجانبية
    DOM.menuToggle?.addEventListener('click', toggleSidebar);
    
    // التنقل بين الأقسام
    DOM.navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            navigateToSection(sectionId);
            if (appState.isMobile) {
                DOM.sidebar?.classList.remove('open');
            }
        });
    });
    
    // التنقل في الموبايل
    DOM.mobileNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            if (target === '#profile') {
                showProfileModal();
            } else {
                const sectionId = target.substring(1);
                navigateToSection(sectionId);
            }
        });
    });
    
    // ===== البحث =====
    
    // البحث العام
    DOM.globalSearch?.addEventListener('input', debounce(function(e) {
        performGlobalSearch(e.target.value);
    }, 500));
    
    DOM.searchFilter?.addEventListener('click', showSearchFilters);
    
    // ===== الإشعارات والدردشة =====
    
    DOM.notificationBtn?.addEventListener('click', toggleNotifications);
    DOM.chatBtn?.addEventListener('click', toggleChatWindow);
    
    DOM.markAllRead?.addEventListener('click', markAllNotificationsAsRead);
    DOM.clearNotifications?.addEventListener('click', clearAllNotifications);
    
    DOM.minimizeChat?.addEventListener('click', minimizeChatWindow);
    DOM.closeChat?.addEventListener('click', closeChatWindow);
    
    // ===== الإجراءات السريعة =====
    
    DOM.quickActionBtn?.addEventListener('click', toggleQuickActions);
    DOM.closeActions?.addEventListener('click', closeQuickActions);
    
    DOM.quickActions.forEach(action => {
        action.addEventListener('click', function() {
            const actionType = this.getAttribute('data-action');
            handleQuickAction(actionType);
        });
    });
    
    // ===== لوحة التحكم =====
    
    DOM.quickDesignBtn?.addEventListener('click', showQuickDesignModal);
    DOM.refreshDashboard?.addEventListener('click', refreshDashboardData);
    DOM.createProjectBtn?.addEventListener('click', navigateToSection.bind(null, 'design-request'));
    
    // ===== استكشاف التصاميم =====
    
    DOM.categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            filterDesignsByCategory(this);
        });
    });
    
    DOM.filterExplore?.addEventListener('click', showExploreFilters);
    DOM.loadMoreDesigns?.addEventListener('click', loadMoreDesigns);
    
    // ===== المصممون =====
    
    DOM.sortDesigners?.addEventListener('change', sortDesigners);
    
    DOM.filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            filterDesignersByTag(this);
        });
    });
    
    // ===== المشاريع =====
    
    DOM.filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterProjects(this);
        });
    });
    
    DOM.viewOptions.forEach(option => {
        option.addEventListener('click', function() {
            changeProjectsView(this);
        });
    });
    
    DOM.newProjectBtn?.addEventListener('click', navigateToSection.bind(null, 'design-request'));
    
    // ===== طلب التصميم =====
    
    if (DOM.designRequestForm) {
        setupDesignRequestForm();
    }
    
    // ===== أدوات التصميم =====
    
    DOM.toolButtons.forEach(button => {
        button.addEventListener('click', function() {
            switchTool(this);
        });
    });
    
    // ===== المحفظة =====
    
    DOM.depositBtn?.addEventListener('click', showDepositModal);
    DOM.withdrawBtn?.addEventListener('click', showWithdrawModal);
    DOM.addPaymentMethod?.addEventListener('click', showAddPaymentMethodModal);
    
    // ===== الدردشة =====
    
    DOM.conversationItems.forEach(item => {
        item.addEventListener('click', function() {
            selectConversation(this);
        });
    });
    
    DOM.sendMessageBtn?.addEventListener('click', sendMessage);
    DOM.messageInput?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // ===== الموسيقى =====
    
    DOM.playPause?.addEventListener('click', toggleMusic);
    DOM.playerClose?.addEventListener('click', closeMusicPlayer);
    
    // ===== أحداث النافذة =====
    
    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeydown);
    
    // ===== ملفات التطبيق الأخرى =====
    
    // ربط مع ملف auth.js
    if (typeof AuthManager !== 'undefined') {
        window.logout = AuthManager.logout;
    }
}

/**
 * إعداد نموذج طلب التصميم
 */
function setupDesignRequestForm() {
    // اختيار نوع التصميم
    DOM.designTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            selectDesignType(this);
        });
    });
    
    // عداد الأحرف
    DOM.projectDescription?.addEventListener('input', function() {
        const count = this.value.length;
        DOM.charCount.textContent = `${count} / 1000 حرف`;
    });
    
    // رفع الملفات
    const fileUploadArea = document.querySelector('.file-upload-area');
    if (fileUploadArea) {
        fileUploadArea.addEventListener('click', () => DOM.projectFiles.click());
        fileUploadArea.addEventListener('dragover', handleDragOver);
        fileUploadArea.addEventListener('drop', handleFileDrop);
    }
    
    DOM.projectFiles?.addEventListener('change', handleFileUpload);
    
    // السلايدر الخاص بالميزانية
    DOM.projectBudget?.addEventListener('input', function() {
        const value = parseInt(this.value);
        DOM.currentBudget.textContent = `${value.toLocaleString()} ريال`;
        updateReviewSummary();
    });
    
    // خيارات التسليم
    DOM.deliveryOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectDeliveryOption(this);
        });
    });
    
    // التنقل بين الخطوات
    DOM.nextStepButtons.forEach(button => {
        button.addEventListener('click', function() {
            const nextStep = this.getAttribute('data-next');
            goToStep(nextStep);
        });
    });
    
    DOM.prevStepButtons.forEach(button => {
        button.addEventListener('click', function() {
            const prevStep = this.getAttribute('data-prev');
            goToStep(prevStep);
        });
    });
    
    // إرسال الطلب
    DOM.designRequestForm.addEventListener('submit', submitDesignRequest);
}

/**
 * تحميل البيانات الأولية
 */
async function loadInitialData() {
    try {
        appState.isLoading = true;
        
        // تحميل البيانات بشكل متوازي
        await Promise.all([
            loadFeaturedDesigns(),
            loadRecentProjects(),
            loadRecentActivities(),
            loadUserStats(),
            loadConversations()
        ]);
        
        // تحديث الواجهة
        updateFeaturedSlider();
        updateProjectsTable();
        updateActivityTimeline();
        updateNotificationBadges();
        
        appState.isLoading = false;
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        showToast('حدث خطأ في تحميل البيانات', 'error');
        appState.isLoading = false;
    }
}

/**
 * تحديث حالة الشاشة
 */
function updateScreenState() {
    const width = window.innerWidth;
    appState.isMobile = width <= 768;
    
    // إظهار/إخفاء الشريط السفلي
    if (DOM.mobileBottomNav) {
        DOM.mobileBottomNav.style.display = appState.isMobile ? 'flex' : 'none';
    }
    
    // إغلاق القائمة الجانبية على الموبايل
    if (appState.isMobile && DOM.sidebar?.classList.contains('open')) {
        DOM.sidebar.classList.remove('open');
        DOM.mainContent?.classList.remove('sidebar-open');
    }
    
    // تحديث تخطيط الشاشات المختلفة
    if (width <= 480) {
        document.body.classList.add('mobile-xs');
    } else if (width <= 768) {
        document.body.classList.add('mobile');
    } else if (width <= 1024) {
        document.body.classList.add('tablet');
    } else {
        document.body.classList.add('desktop');
    }
}

/**
 * إعداد واجهة المستخدم
 */
function setupUI() {
    // إضافة تأثيرات للبطاقات
    addHoverEffects();
    
    // إعداد أزرار التأكيد
    setupActionButtons();
    
    // إعداد الأدوات
    setupTools();
    
    // إعداد المؤقتات
    setupTimers();
    
    // تحديث صورة المستخدم
    updateUserProfile();
}

// ===== وظائف التنقل =====

/**
 * التنقل إلى قسم معين
 */
function navigateToSection(sectionId) {
    // التحقق من صلاحية القسم
    if (!DOM.sections[sectionId]) {
        log(`القسم ${sectionId} غير موجود`, 'error');
        return;
    }
    
    // إخفاء جميع الأقسام
    Object.values(DOM.sections).forEach(section => {
        section?.classList.remove('active');
    });
    
    // إزالة النشاط من عناصر التنقل
    DOM.navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    DOM.mobileNavItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // إظهار القسم المطلوب
    DOM.sections[sectionId].classList.add('active');
    
    // تحديث عناصر التنقل النشطة
    const activeNavItem = document.querySelector(`.nav-item[href="#${sectionId}"]`);
    const activeMobileNavItem = document.querySelector(`.mobile-nav-item[href="#${sectionId}"]`);
    
    if (activeNavItem) activeNavItem.classList.add('active');
    if (activeMobileNavItem) activeMobileNavItem.classList.add('active');
    
    // تحديث حالة التطبيق
    appState.currentSection = sectionId;
    
    // حفظ آخر قسم تم زيارته
    savePreference('last_section', sectionId);
    
    // تحميل بيانات القسم إذا لزم الأمر
    loadSectionData(sectionId);
    
    // إغلاق القائمة الجانبية على الموبايل
    if (appState.isMobile) {
        DOM.sidebar?.classList.remove('open');
    }
    
    log(`تم التنقل إلى قسم: ${sectionId}`);
    
    // إرجاع الصفحة للأعلى
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * تحميل بيانات القسم
 */
function loadSectionData(sectionId) {
    switch (sectionId) {
        case 'dashboard':
            refreshDashboardData();
            break;
        case 'explore':
            loadExploreDesigns();
            break;
        case 'designers':
            loadDesigners();
            break;
        case 'projects':
            loadProjects();
            break;
        case 'wallet':
            loadWalletData();
            break;
        case 'messages':
            loadChatData();
            break;
    }
}

/**
 * تبديل القائمة الجانبية
 */
function toggleSidebar() {
    if (!DOM.sidebar) return;
    
    const isOpen = DOM.sidebar.classList.toggle('open');
    appState.sidebarOpen = isOpen;
    
    // تحديث المحتوى الرئيسي
    if (DOM.mainContent) {
        DOM.mainContent.classList.toggle('sidebar-open', isOpen);
    }
    
    // حفظ حالة القائمة
    savePreference('sidebar_open', isOpen);
    
    // إضافة تأثيرات
    if (isOpen) {
        animateSidebarIn();
    }
}

/**
 * تحريك القائمة الجانبية
 */
function animateSidebarIn() {
    const navItems = DOM.sidebar.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.05}s`;
        item.classList.add('animate-in');
    });
}

// ===== وظائف البحث =====

/**
 * البحث العام
 */
function performGlobalSearch(query) {
    if (!query || query.length < 2) {
        clearSearchResults();
        return;
    }
    
    showSearchResults(query);
}

/**
 * عرض نتائج البحث
 */
function showSearchResults(query) {
    // في الإصدار الحقيقي، هنا يكون اتصال API
    const results = fakeSearchAPI(query);
    
    // عرض النتائج
    displaySearchResults(results);
}

/**
 * إظهار مرشحات البحث
 */
function showSearchFilters() {
    const filters = {
        type: ['تصاميم', 'مصممون', 'مشاريع', 'خدمات'],
        category: ['جرافيك', 'UI/UX', 'فيديو', 'تصوير'],
        price: ['منخفض', 'متوسط', 'مرتفع'],
        rating: ['4+ نجوم', '4.5+ نجوم', '5 نجوم'],
        date: ['آخر يوم', 'آخر أسبوع', 'آخر شهر']
    };
    
    showFilterModal(filters);
}

// ===== وظائف لوحة التحكم =====

/**
 * تحديث إحصائيات لوحة التحكم
 */
async function updateDashboardStats() {
    try {
        const stats = await fetchDashboardStats();
        
        if (stats) {
            // تحديث DOM
            if (DOM.activeProjects) {
                DOM.activeProjects.textContent = stats.activeProjects || '0';
            }
            
            if (DOM.walletBalance) {
                DOM.walletBalance.textContent = `${stats.walletBalance?.toLocaleString() || '0'} ريال`;
            }
            
            if (DOM.pendingProjects) {
                DOM.pendingProjects.textContent = stats.pendingProjects || '0';
            }
            
            if (DOM.userRating) {
                DOM.userRating.textContent = stats.userRating || '0';
            }
            
            // تحديث الحالة
            appState.userStats = stats;
        }
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

/**
 * تحديث المنزلق المميز
 */
function updateFeaturedSlider() {
    if (!DOM.featuredSlider || appState.featuredDesigns.length === 0) return;
    
    const slidesHTML = appState.featuredDesigns.map((design, index) => `
        <div class="featured-slide" data-index="${index}">
            <div class="featured-slide-content">
                <h4>${design.title}</h4>
                <p>${design.description}</p>
                <button class="action-btn" onclick="viewDesign('${design.id}')">
                    <i class="fas fa-eye"></i>
                    عرض التصميم
                </button>
            </div>
        </div>
    `).join('');
    
    DOM.featuredSlider.innerHTML = `
        <div class="slider-container">${slidesHTML}</div>
        <div class="slider-controls">
            <button class="slider-control prev-slide">
                <i class="fas fa-chevron-right"></i>
            </button>
            <button class="slider-control next-slide">
                <i class="fas fa-chevron-left"></i>
            </button>
        </div>
    `;
    
    // إضافة مستمعي الأحداث
    setupSliderControls();
}

/**
 * تحديث جدول المشاريع
 */
function updateProjectsTable() {
    if (!DOM.projectsTable) return;
    
    const projects = appState.recentProjects || [];
    
    const rowsHTML = projects.map(project => `
        <div class="project-row">
            <div class="project-info">
                <div class="project-icon">
                    <i class="${getProjectIcon(project.type)}"></i>
                </div>
                <div class="project-details">
                    <h4>${project.title}</h4>
                    <span>${project.category}</span>
                </div>
            </div>
            <div class="designer-info">
                <img src="${project.designerAvatar}" 
                     alt="${project.designerName}" 
                     class="designer-avatar">
                <span>${project.designerName}</span>
            </div>
            <div class="status-badge ${project.status}">
                ${getStatusText(project.status)}
            </div>
            <div class="project-date">${formatDate(project.date)}</div>
            <div class="project-actions">
                <button class="action-icon-btn" onclick="viewProject('${project.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-icon-btn" onclick="messageDesigner('${project.designerId}')">
                    <i class="fas fa-comment"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    DOM.projectsTable.innerHTML = rowsHTML;
}

/**
 * تحديث خط الزمن
 */
function updateActivityTimeline() {
    if (!DOM.activityTimeline || appState.recentActivities.length === 0) return;
    
    const activitiesHTML = appState.recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-dot"></div>
            <div class="activity-time">${formatTime(activity.timestamp)}</div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
        </div>
    `).join('');
    
    DOM.activityTimeline.innerHTML = activitiesHTML;
}

/**
 * تحديث شارات الإشعارات
 */
function updateNotificationBadges() {
    if (DOM.notificationCount) {
        DOM.notificationCount.textContent = appState.unreadNotifications;
        DOM.notificationCount.style.display = appState.unreadNotifications > 0 ? 'flex' : 'none';
    }
    
    if (DOM.unreadMessages) {
        DOM.unreadMessages.textContent = appState.unreadMessages;
        DOM.unreadMessages.style.display = appState.unreadMessages > 0 ? 'flex' : 'none';
    }
}

// ===== وظائف الإشعارات =====

/**
 * تحميل الإشعارات
 */
async function loadNotifications() {
    try {
        const notifications = await fetchNotifications();
        appState.notifications = notifications;
        appState.unreadNotifications = notifications.filter(n => !n.read).length;
        updateNotificationBadges();
        updateNotificationsPanel();
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

/**
 * تبديل عرض الإشعارات
 */
function toggleNotifications() {
    const isVisible = appState.notificationsVisible;
    
    if (isVisible) {
        closeNotifications();
    } else {
        showNotifications();
    }
}

/**
 * إظهار لوحة الإشعارات
 */
function showNotifications() {
    if (!DOM.notificationsPanel) return;
    
    DOM.notificationsPanel.style.display = 'flex';
    appState.notificationsVisible = true;
    
    // تحديث المحتوى
    updateNotificationsPanel();
    
    // إضافة تأثير
    DOM.notificationsPanel.classList.add('show');
}

/**
 * تحديث لوحة الإشعارات
 */
function updateNotificationsPanel() {
    if (!DOM.notificationsPanel) return;
    
    const listElement = DOM.notificationsPanel.querySelector('.notifications-list');
    if (!listElement) return;
    
    const notificationsHTML = appState.notifications.map(notification => `
        <div class="notification-item ${notification.read ? '' : 'unread'}" 
             data-id="${notification.id}">
            <div class="notification-header">
                <span class="notification-title">${notification.title}</span>
                <span class="notification-time">${formatRelativeTime(notification.timestamp)}</span>
            </div>
            <div class="notification-content">
                ${notification.message}
            </div>
            <div class="notification-actions">
                <button class="action-link" onclick="markNotificationAsRead('${notification.id}')">
                    ${notification.read ? 'إعادة تعيين' : 'تعيين كمقروء'}
                </button>
                <button class="action-link" onclick="deleteNotification('${notification.id}')">
                    حذف
                </button>
            </div>
        </div>
    `).join('');
    
    listElement.innerHTML = notificationsHTML;
}

/**
 * تعيين جميع الإشعارات كمقروءة
 */
function markAllNotificationsAsRead() {
    appState.notifications.forEach(notification => {
        notification.read = true;
    });
    
    appState.unreadNotifications = 0;
    updateNotificationBadges();
    updateNotificationsPanel();
    saveNotifications();
    
    showToast('تم تعيين جميع الإشعارات كمقروءة', 'success');
}

/**
 * مسح جميع الإشعارات
 */
function clearAllNotifications() {
    if (confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) {
        appState.notifications = [];
        appState.unreadNotifications = 0;
        updateNotificationBadges();
        updateNotificationsPanel();
        saveNotifications();
        
        showToast('تم حذف جميع الإشعارات', 'success');
    }
}

// ===== وظائف الدردشة =====

/**
 * تبديل نافذة الدردشة
 */
function toggleChatWindow() {
    if (appState.chatWindowVisible) {
        closeChatWindow();
    } else {
        openChatWindow();
    }
}

/**
 * فتح نافذة الدردشة
 */
function openChatWindow() {
    if (!DOM.chatWindow) return;
    
    DOM.chatWindow.style.display = 'flex';
    appState.chatWindowVisible = true;
    
    // تحميل المحادثة النشطة
    if (appState.activeChat) {
        loadChatMessages(appState.activeChat);
    }
    
    // إضافة تأثير
    setTimeout(() => {
        DOM.chatWindow.classList.add('open');
    }, 10);
}

/**
 * تصغير نافذة الدردشة
 */
function minimizeChatWindow() {
    if (!DOM.chatWindow) return;
    
    DOM.chatWindow.classList.toggle('minimized');
    
    if (DOM.chatWindow.classList.contains('minimized')) {
        DOM.chatWindow.querySelector('.chat-body').style.display = 'none';
        DOM.chatWindow.querySelector('.chat-footer').style.display = 'none';
        DOM.chatWindow.style.height = 'auto';
    } else {
        DOM.chatWindow.querySelector('.chat-body').style.display = 'flex';
        DOM.chatWindow.querySelector('.chat-footer').style.display = 'block';
        DOM.chatWindow.style.height = '500px';
    }
}

/**
 * إغلاق نافذة الدردشة
 */
function closeChatWindow() {
    if (!DOM.chatWindow) return;
    
    DOM.chatWindow.classList.remove('open');
    setTimeout(() => {
        DOM.chatWindow.style.display = 'none';
        appState.chatWindowVisible = false;
    }, 300);
}

/**
 * تحميل رسائل الدردشة
 */
async function loadChatMessages(chatId) {
    try {
        const messages = await fetchChatMessages(chatId);
        displayChatMessages(messages);
        appState.activeChat = chatId;
    } catch (error) {
        console.error('Error loading chat messages:', error);
        showToast('حدث خطأ في تحميل الرسائل', 'error');
    }
}

/**
 * إرسال رسالة
 */
async function sendMessage() {
    const input = DOM.messageInput;
    if (!input || !input.value.trim()) return;
    
    const message = input.value.trim();
    
    try {
        // محاكاة إرسال الرسالة
        const sentMessage = await fakeSendMessageAPI(appState.activeChat, message);
        
        // إضافة الرسالة إلى العرض
        addMessageToChat(sentMessage);
        
        // مسح حقل الإدخال
        input.value = '';
        
        // تحديث عدد الرسائل غير المقروءة
        updateUnreadMessagesCount();
        
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('حدث خطأ في إرسال الرسالة', 'error');
    }
}

// ===== وظائف الإجراءات السريعة =====

/**
 * تبديل قائمة الإجراءات السريعة
 */
function toggleQuickActions() {
    if (appState.quickActionsVisible) {
        closeQuickActions();
    } else {
        showQuickActions();
    }
}

/**
 * إظهار قائمة الإجراءات السريعة
 */
function showQuickActions() {
    if (!DOM.quickActionsMenu) return;
    
    DOM.quickActionsMenu.style.display = 'block';
    appState.quickActionsVisible = true;
    
    // إضافة تأثير
    setTimeout(() => {
        DOM.quickActionsMenu.classList.add('show');
    }, 10);
}

/**
 * إغلاق قائمة الإجراءات السريعة
 */
function closeQuickActions() {
    if (!DOM.quickActionsMenu) return;
    
    DOM.quickActionsMenu.classList.remove('show');
    setTimeout(() => {
        DOM.quickActionsMenu.style.display = 'none';
        appState.quickActionsVisible = false;
    }, 300);
}

/**
 * معالجة الإجراء السريع
 */
function handleQuickAction(actionType) {
    closeQuickActions();
    
    switch (actionType) {
        case 'new-design':
            navigateToSection('design-request');
            break;
        case 'hire-designer':
            navigateToSection('designers');
            break;
        case 'ai-design':
            navigateToSection('design-tools');
            setTimeout(() => {
                const aiTool = document.querySelector('[data-tool="ai"]');
                if (aiTool) aiTool.click();
            }, 300);
            break;
        case 'upload-design':
            showUploadDesignModal();
            break;
        case 'create-invoice':
            showCreateInvoiceModal();
            break;
        case 'schedule-meeting':
            showScheduleMeetingModal();
            break;
    }
}

// ===== وظائف الموسيقى =====

/**
 * تبديل تشغيل الموسيقى
 */
function toggleMusic() {
    appState.musicPlaying = !appState.musicPlaying;
    
    if (appState.musicPlaying) {
        DOM.playPause.innerHTML = '<i class="fas fa-pause"></i>';
        startMusicPlayer();
    } else {
        DOM.playPause.innerHTML = '<i class="fas fa-play"></i>';
        pauseMusicPlayer();
    }
}

/**
 * إغلاق مشغل الموسيقى
 */
function closeMusicPlayer() {
    if (!DOM.musicPlayer) return;
    
    pauseMusicPlayer();
    appState.musicPlaying = false;
    
    DOM.musicPlayer.style.opacity = '0';
    setTimeout(() => {
        DOM.musicPlayer.style.display = 'none';
    }, 300);
}

// ===== وظائف الوضع الداكن =====

/**
 * تعيين الوضع الداكن
 */
function setDarkMode(enabled) {
    appState.darkMode = enabled;
    document.body.classList.toggle('dark-mode', enabled);
    savePreference('dark_mode', enabled);
}

/**
 * تبديل الوضع الداكن
 */
function toggleDarkMode() {
    setDarkMode(!appState.darkMode);
}

// ===== وظائف المساعدة =====

/**
 * إظهار رسالة
 */
function showToast(message, type = 'info') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "left",
        backgroundColor: getToastColor(type),
        className: `toast-${type}`,
        stopOnFocus: true
    }).showToast();
}

/**
 * الحصول على لون الإشعار
 */
function getToastColor(type) {
    switch (type) {
        case 'success': return '#2a9d8f';
        case 'error': return '#e76f51';
        case 'warning': return '#e9c46a';
        default: return '#264653';
    }
}

/**
 * تسجيل رسالة (للتطوير فقط)
 */
function log(message, type = 'info') {
    if (!APP_CONFIG.DEBUG) return;
    
    const colors = {
        info: '#0a9396',
        success: '#2a9d8f',
        warning: '#ee9b00',
        error: '#e76f51',
        debug: '#94d2bd'
    };
    
    console.log(`%c[بيكسل آرت] ${message}`, `color: ${colors[type] || colors.info}; font-weight: bold;`);
}

/**
 * تأخير التنفيذ
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * تنسيق التاريخ
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

/**
 * تنسيق الوقت
 */
function formatTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * تنسيق الوقت النسبي
 */
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `قبل ${minutes} دقيقة`;
    if (hours < 24) return `قبل ${hours} ساعة`;
    if (days < 7) return `قبل ${days} يوم`;
    
    return formatDate(dateString);
}

/**
 * الحصول على أيقونة المشروع
 */
function getProjectIcon(type) {
    const icons = {
        'logo': 'fas fa-object-group',
        'graphic': 'fas fa-paint-brush',
        'uiux': 'fas fa-mobile-alt',
        'video': 'fas fa-video',
        'photo': 'fas fa-camera'
    };
    
    return icons[type] || 'fas fa-project-diagram';
}

/**
 * الحصول على نص الحالة
 */
function getStatusText(status) {
    const statuses = {
        'pending': 'قيد الانتظار',
        'in-progress': 'قيد التنفيذ',
        'completed': 'مكتمل',
        'revision': 'تحت المراجعة'
    };
    
    return statuses[status] || status;
}

// ===== إدارة التفضيلات =====

/**
 * تحميل التفضيلات
 */
function loadPreferences() {
    try {
        const prefs = localStorage.getItem(APP_CONFIG.USER_PREFERENCES_KEY);
        if (prefs) {
            const parsed = JSON.parse(prefs);
            appState.darkMode = parsed.dark_mode || false;
            appState.language = parsed.language || 'ar';
            appState.sidebarOpen = parsed.sidebar_open || false;
        }
        
        // تحميل الإشعارات
        const notifications = localStorage.getItem(APP_CONFIG.NOTIFICATIONS_KEY);
        if (notifications) {
            appState.notifications = JSON.parse(notifications);
            appState.unreadNotifications = appState.notifications.filter(n => !n.read).length;
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

/**
 * حفظ التفضيل
 */
function savePreference(key, value) {
    try {
        let prefs = {};
        const saved = localStorage.getItem(APP_CONFIG.USER_PREFERENCES_KEY);
        if (saved) {
            prefs = JSON.parse(saved);
        }
        
        prefs[key] = value;
        localStorage.setItem(APP_CONFIG.USER_PREFERENCES_KEY, JSON.stringify(prefs));
    } catch (error) {
        console.error('Error saving preference:', error);
    }
}

/**
 * حفظ الإشعارات
 */
function saveNotifications() {
    try {
        localStorage.setItem(APP_CONFIG.NOTIFICATIONS_KEY, JSON.stringify(appState.notifications));
    } catch (error) {
        console.error('Error saving notifications:', error);
    }
}

// ===== معالجة الأحداث =====

/**
 * التعامل مع تغيير حجم النافذة
 */
function handleResize() {
    updateScreenState();
    
    // إغلاق القائمة الجانبية عند التبديل من سطح المكتب إلى الموبايل
    if (appState.isMobile && appState.sidebarOpen) {
        toggleSidebar();
    }
}

/**
 * التعامل مع النقر خارج العناصر
 */
function handleOutsideClick(event) {
    // إغلاق القائمة الجانبية عند النقر خارجها
    if (DOM.sidebar && 
        !DOM.sidebar.contains(event.target) && 
        !DOM.menuToggle.contains(event.target) &&
        appState.sidebarOpen) {
        toggleSidebar();
    }
    
    // إغلاق قائمة الإجراءات السريعة
    if (DOM.quickActionsMenu &&
        !DOM.quickActionsMenu.contains(event.target) &&
        !DOM.quickActionBtn.contains(event.target) &&
        appState.quickActionsVisible) {
        closeQuickActions();
    }
    
    // إغلاق لوحة الإشعارات
    if (DOM.notificationsPanel &&
        !DOM.notificationsPanel.contains(event.target) &&
        !DOM.notificationBtn.contains(event.target) &&
        appState.notificationsVisible) {
        closeNotifications();
    }
}

/**
 * التعامل مع ضغطات المفاتيح
 */
function handleKeydown(event) {
    // الهروب يغلق جميع النوافذ
    if (event.key === 'Escape') {
        if (appState.quickActionsVisible) closeQuickActions();
        if (appState.notificationsVisible) closeNotifications();
        if (appState.chatWindowVisible) closeChatWindow();
        if (appState.sidebarOpen) toggleSidebar();
    }
    
    // البحث بالضغط على Ctrl + K
    if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        DOM.globalSearch?.focus();
    }
    
    // الوضع الداكن بالضغط على Ctrl + D
    if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        toggleDarkMode();
    }
}

// ===== خدمات الخلفية =====

/**
 * بدء خدمات الخلفية
 */
function startBackgroundServices() {
    // تحميل البيانات الجديدة كل دقيقة
    setInterval(() => {
        if (appState.currentSection === 'dashboard') {
            refreshDashboardData();
        }
        checkForNewNotifications();
        checkForNewMessages();
    }, 60000);
    
    // تحديث الوقت كل ثانية
    setInterval(updateLiveTime, 1000);
    
    // تحقق من اتصال الإنترنت
    setInterval(checkInternetConnection, 30000);
}

/**
 * التحقق من اتصال الإنترنت
 */
function checkInternetConnection() {
    const isOnline = navigator.onLine;
    document.body.classList.toggle('offline', !isOnline);
    
    if (!isOnline) {
        showToast('تم فقدان الاتصال بالإنترنت', 'warning');
    }
}

/**
 * التحقق من إشعارات جديدة
 */
async function checkForNewNotifications() {
    try {
        const hasNew = await fetchNewNotificationsCount();
        if (hasNew > appState.unreadNotifications) {
            showToast(`لديك ${hasNew - appState.unreadNotifications} إشعار جديد`, 'info');
            loadNotifications();
        }
    } catch (error) {
        // تجاهل الأخطاء في التحقق الخلفي
    }
}

/**
 * التحقق من رسائل جديدة
 */
async function checkForNewMessages() {
    try {
        const hasNew = await fetchNewMessagesCount();
        if (hasNew > appState.unreadMessages) {
            appState.unreadMessages = hasNew;
            updateNotificationBadges();
        }
    } catch (error) {
        // تجاهل الأخطاء
    }
}

// ===== واجهات API وهمية (للتنمية) =====

async function fetchDashboardStats() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                activeProjects: 5,
                walletBalance: 1250,
                pendingProjects: 3,
                userRating: 4.8,
                totalEarnings: 8250,
                totalSpent: 4550,
                pendingAmount: 1200,
                completedProjects: 12,
                favoriteDesigners: 3
            });
        }, 500);
    });
}

async function loadFeaturedDesigns() {
    return new Promise(resolve => {
        setTimeout(() => {
            appState.featuredDesigns = [
                {
                    id: 'design_001',
                    title: 'تصميم إعلان لمطعم بحري',
                    description: 'تصميم إعلاني احترافي لمطعم متخصص في المأكولات البحرية',
                    image: 'https://via.placeholder.com/800x400/0a9396/fff',
                    views: 2500,
                    likes: 125,
                    price: 450,
                    designer: 'أحمد المصمم'
                },
                {
                    id: 'design_002',
                    title: 'هوية بصرية لشركة تقنية',
                    description: 'تصميم شعار وبطاقات عمل لشركة ناشئة في مجال التكنولوجيا',
                    image: 'https://via.placeholder.com/800x400/94d2bd/000',
                    views: 1800,
                    likes: 89,
                    price: 850,
                    designer: 'سارة المصممة'
                }
            ];
            resolve();
        }, 300);
    });
}

async function loadRecentProjects() {
    return new Promise(resolve => {
        setTimeout(() => {
            appState.recentProjects = [
                {
                    id: 'project_001',
                    title: 'تصميم شعار لمطعم',
                    category: 'شعار',
                    status: 'in-progress',
                    date: '2024-02-15',
                    designerId: 'designer_001',
                    designerName: 'أحمد المصمم',
                    designerAvatar: 'https://ui-avatars.com/api/?name=أحمد&background=005f73&color=fff'
                },
                {
                    id: 'project_002',
                    title: 'بروشور لمؤتمر تعليمي',
                    category: 'بروشور',
                    status: 'pending',
                    date: '2024-02-10',
                    designerId: 'designer_002',
                    designerName: 'سارة المصممة',
                    designerAvatar: 'https://ui-avatars.com/api/?name=سارة&background=9a031e&color=fff'
                }
            ];
            resolve();
        }, 300);
    });
}

async function loadRecentActivities() {
    return new Promise(resolve => {
        setTimeout(() => {
            appState.recentActivities = [
                {
                    id: 'activity_001',
                    title: 'تم بدء مشروع جديد',
                    description: 'تم قبول طلب تصميم شعار لمطعم بحري',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    type: 'project_start'
                },
                {
                    id: 'activity_002',
                    title: 'تم إيداع مبلغ',
                    description: 'تم إيداع 500 ريال في محفظتك',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    type: 'deposit'
                }
            ];
            resolve();
        }, 300);
    });
}

async function fetchNotifications() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    id: 'notif_001',
                    title: 'مشروع جديد',
                    message: 'تم بدء مشروع تصميم شعار لمطعم',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    read: false,
                    type: 'project'
                },
                {
                    id: 'notif_002',
                    message: 'تم إيداع 500 ريال في محفظتك',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    read: true,
                    type: 'wallet'
                }
            ]);
        }, 300);
    });
}

// ===== تصدير الوظائف للاستخدام =====
window.PixelArtApp = {
    navigateToSection,
    toggleDarkMode,
    logout: () => {
        if (typeof AuthManager !== 'undefined') {
            AuthManager.logout();
        }
    },
    showToast,
    getState: () => ({ ...appState }),
    refreshData: loadInitialData
};

// ===== أنماط إضافية =====
const appStyles = document.createElement('style');
appStyles.textContent = `
    .nav-item.animate-in {
        animation: slideInRight 0.3s ease forwards;
        opacity: 0;
        transform: translateX(20px);
    }
    
    @keyframes slideInRight {
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .notifications-panel.show {
        animation: slideIn 0.3s ease;
    }
    
    .quick-actions-menu.show {
        animation: slideUp 0.3s ease;
    }
    
    .chat-window.open {
        animation: slideIn 0.3s ease;
    }
    
    .chat-window.minimized {
        height: 60px !important;
    }
    
    body.offline::before {
        content: 'لا يوجد اتصال بالإنترنت';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: var(--warning-color);
        color: white;
        text-align: center;
        padding: 8px;
        z-index: 9999;
        font-weight: bold;
    }
    
    .mobile .main-content {
        padding-bottom: 70px;
    }
    
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
    }
    
    .loading-overlay.active {
        opacity: 1;
        pointer-events: all;
    }
    
    .spinner-large {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(appStyles);

log('تم تحميل app.js بنجاح', 'success');
