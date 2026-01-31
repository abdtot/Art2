// ============================================
// نظام الملف الشخصي والإعدادات
// ============================================

class ProfileManager {
    constructor() {
        this.userProfile = null;
        this.settings = {};
        this.init();
    }

    init() {
        this.loadProfile();
        this.bindEvents();
        this.updateProfileDisplay();
    }

    loadProfile() {
        const user = localStorage.getItem('pixelArtUser');
        this.userProfile = user ? JSON.parse(user) : this.getDefaultProfile();
        
        const settings = localStorage.getItem('pixelArtSettings');
        this.settings = settings ? JSON.parse(settings) : this.getDefaultSettings();
    }

    saveProfile() {
        localStorage.setItem('pixelArtUser', JSON.stringify(this.userProfile));
        localStorage.setItem('pixelArtSettings', JSON.stringify(this.settings));
    }

    bindEvents() {
        // تحديث الملف الشخصي
        this.bindProfileEvents();
        
        // الإعدادات
        this.bindSettingsEvents();
        
        // الأمان
        this.bindSecurityEvents();
        
        // التوافق مع الإجراءات السريعة
        this.bindQuickActionsEvents();
    }

    bindProfileEvents() {
        // تعديل الملف الشخصي
        const editProfileBtn = document.querySelector('.edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.showEditProfileModal());
        }
        
        // تغيير الصورة
        const profileImage = document.querySelector('.profile-image');
        if (profileImage) {
            profileImage.addEventListener('click', () => this.changeProfileImage());
        }
    }

    bindSettingsEvents() {
        // تبديل الوضع الداكن
        const darkModeToggle = document.querySelector('.dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => this.toggleDarkMode(e.target.checked));
        }
        
        // إعدادات الإشعارات
        document.querySelectorAll('.notification-setting').forEach(setting => {
            setting.addEventListener('change', (e) => this.updateNotificationSettings(e.target));
        });
        
        // لغة التطبيق
        const languageSelect = document.querySelector('.language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
        }
        
        // حفظ الإعدادات
        const saveSettingsBtn = document.querySelector('.save-settings-btn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }
    }

    bindSecurityEvents() {
        // تغيير كلمة المرور
        const changePasswordBtn = document.querySelector('.change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.showChangePasswordModal());
        }
        
        // تسجيل الخروج من جميع الأجهزة
        const logoutAllBtn = document.querySelector('.logout-all-btn');
        if (logoutAllBtn) {
            logoutAllBtn.addEventListener('click', () => this.logoutAllDevices());
        }
        
        // حذف الحساب
        const deleteAccountBtn = document.querySelector('.delete-account-btn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => this.deleteAccount());
        }
    }

    bindQuickActionsEvents() {
        // الإجراءات السريعة في القائمة
        const quickActions = document.querySelectorAll('.quick-action');
        quickActions.forEach(action => {
            action.addEventListener('click', (e) => this.handleQuickAction(e));
        });
        
        // الإجراءات السريعة في شريط الموبايل
        const quickActionBtn = document.getElementById('quickActionBtn');
        if (quickActionBtn) {
            quickActionBtn.addEventListener('click', () => this.toggleQuickActionsMenu());
        }
        
        // إغلاق قائمة الإجراءات
        const closeActions = document.getElementById('closeActions');
        if (closeActions) {
            closeActions.addEventListener('click', () => this.closeQuickActionsMenu());
        }
    }

    updateProfileDisplay() {
        // تحديث الصورة الشخصية
        const profileImages = document.querySelectorAll('.profile-image');
        profileImages.forEach(img => {
            img.src = this.userProfile.avatar || this.getDefaultAvatar();
            img.alt = this.userProfile.name;
        });
        
        // تحديث الاسم
        const profileNames = document.querySelectorAll('.profile-name');
        profileNames.forEach(name => {
            name.textContent = this.userProfile.name;
        });
        
        // تحديث البريد الإلكتروني
        const emailElement = document.getElementById('profileEmail');
        if (emailElement) {
            emailElement.textContent = this.userProfile.email;
        }
        
        // تحديث رقم الهاتف
        const phoneElement = document.getElementById('profilePhone');
        if (phoneElement) {
            phoneElement.textContent = this.userProfile.phone;
        }
        
        // تحديث نوع الحساب
        const roleElement = document.getElementById('userRole');
        if (roleElement) {
            roleElement.textContent = this.userProfile.role === 'designer' ? 'مصمم' : 'عميل';
        }
        
        // تحديث تاريخ الانضمام
        const joinDateElement = document.getElementById('joinDate');
        if (joinDateElement) {
            joinDateElement.textContent = this.formatDate(this.userProfile.createdAt);
        }
        
        // تحديث الإحصائيات
        this.updateProfileStats();
        
        // تطبيق الإعدادات
        this.applySettings();
    }

    updateProfileStats() {
        // إحصائيات المشاريع
        const projectStats = {
            total: 15,
            completed: 8,
            active: 5,
            pending: 2
        };
        
        // إحصائيات التصاميم
        const designStats = {
            total: 45,
            published: 32,
            drafts: 13,
            likes: 256
        };
        
        // إحصائيات المالية
        const financialStats = {
            spent: 4850,
            earned: 1250,
            balance: 1850
        };
        
        // تحديث عناصر الإحصائيات
        document.querySelectorAll('.stat-card').forEach(card => {
            const type = card.dataset.stat;
            switch(type) {
                case 'projects':
                    card.querySelector('.stat-value').textContent = projectStats.total;
                    break;
                case 'designs':
                    card.querySelector('.stat-value').textContent = designStats.total;
                    break;
                case 'spent':
                    card.querySelector('.stat-value').textContent = `${financialStats.spent} ريال`;
                    break;
                case 'earned':
                    card.querySelector('.stat-value').textContent = `${financialStats.earned} ريال`;
                    break;
            }
        });
    }

    applySettings() {
        // تطبيق الوضع الداكن
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // تحديث toggle الوضع الداكن
        const darkModeToggle = document.querySelector('.dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.checked = this.settings.darkMode;
        }
        
        // تطبيق إعدادات الإشعارات
        document.querySelectorAll('.notification-setting').forEach(setting => {
            const key = setting.dataset.setting;
            setting.checked = this.settings.notifications[key] !== false;
        });
        
        // تطبيق لغة التطبيق
        const languageSelect = document.querySelector('.language-select');
        if (languageSelect) {
            languageSelect.value = this.settings.language || 'ar';
        }
    }

    showEditProfileModal() {
        const modalContent = document.createElement('div');
        modalContent.className = 'edit-profile-modal';
        modalContent.innerHTML = `
            <h3>تعديل الملف الشخصي</h3>
            <form id="editProfileForm">
                <div class="form-group">
                    <label>الاسم الكامل</label>
                    <input type="text" id="editName" value="${this.userProfile.name}" required>
                </div>
                <div class="form-group">
                    <label>البريد الإلكتروني</label>
                    <input type="email" id="editEmail" value="${this.userProfile.email}" required>
                </div>
                <div class="form-group">
                    <label>رقم الهاتف</label>
                    <input type="tel" id="editPhone" value="${this.userProfile.phone}">
                </div>
                <div class="form-group">
                    <label>عنوان السكن</label>
                    <textarea id="editAddress" rows="3">${this.userProfile.address || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>نبذة عنك</label>
                    <textarea id="editBio" rows="4" maxlength="500">${this.userProfile.bio || ''}</textarea>
                    <div class="char-count">${(this.userProfile.bio || '').length}/500</div>
                </div>
                <div class="form-group">
                    <label>المهارات (مصممين فقط)</label>
                    <div class="skills-input">
                        <input type="text" id="skillInput" placeholder="أضف مهارة...">
                        <button type="button" class="add-skill-btn">+</button>
                    </div>
                    <div class="skills-list" id="skillsList">
                        ${(this.userProfile.skills || []).map(skill => `
                            <span class="skill-tag">
                                ${skill}
                                <button type="button" class="remove-skill">&times;</button>
                            </span>
                        `).join('')}
                    </div>
                </div>
            </form>
            <div class="modal-actions">
                <button class="action-btn outline cancel-edit">إلغاء</button>
                <button class="action-btn save-edit">حفظ التغييرات</button>
            </div>
        `;
        
        this.showModal('تعديل الملف الشخصي', modalContent);
        
        // عدّاد الأحرف للنبذة
        const bioTextarea = modalContent.querySelector('#editBio');
        const charCount = modalContent.querySelector('.char-count');
        
        bioTextarea.addEventListener('input', (e) => {
            charCount.textContent = `${e.target.value.length}/500`;
        });
        
        // إدارة المهارات
        const skillInput = modalContent.querySelector('#skillInput');
        const addSkillBtn = modalContent.querySelector('.add-skill-btn');
        const skillsList = modalContent.querySelector('#skillsList');
        
        const addSkill = () => {
            const skill = skillInput.value.trim();
            if (skill && !this.userProfile.skills?.includes(skill)) {
                const skillTag = document.createElement('span');
                skillTag.className = 'skill-tag';
                skillTag.innerHTML = `
                    ${skill}
                    <button type="button" class="remove-skill">&times;</button>
                `;
                
                skillTag.querySelector('.remove-skill').addEventListener('click', () => {
                    skillTag.remove();
                });
                
                skillsList.appendChild(skillTag);
                skillInput.value = '';
            }
        };
        
        addSkillBtn.addEventListener('click', addSkill);
        skillInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
            }
        });
        
        // إلغاء
        modalContent.querySelector('.cancel-edit').addEventListener('click', () => {
            this.closeModal();
        });
        
        // حفظ
        modalContent.querySelector('.save-edit').addEventListener('click', () => {
            this.saveProfileChanges(modalContent);
        });
    }

    saveProfileChanges(modalContent) {
        const form = modalContent.querySelector('#editProfileForm');
        
        // جمع البيانات
        const updatedProfile = {
            ...this.userProfile,
            name: form.querySelector('#editName').value,
            email: form.querySelector('#editEmail').value,
            phone: form.querySelector('#editPhone').value,
            address: form.querySelector('#editAddress').value,
            bio: form.querySelector('#editBio').value,
            skills: Array.from(modalContent.querySelectorAll('.skill-tag'))
                .map(tag => tag.textContent.replace('×', '').trim())
        };
        
        // التحقق من صحة البيانات
        if (!this.validateProfileData(updatedProfile)) {
            return;
        }
        
        // تحديث الملف الشخصي
        this.userProfile = updatedProfile;
        this.saveProfile();
        
        // تحديث الواجهة
        this.updateProfileDisplay();
        
        // إغلاق النافذة
        this.closeModal();
        
        // إشعار
        this.showSuccess('تم تحديث الملف الشخصي بنجاح');
    }

    validateProfileData(profile) {
        if (!profile.name.trim()) {
            this.showError('الاسم مطلوب');
            return false;
        }
        
        if (!profile.email.trim() || !this.validateEmail(profile.email)) {
            this.showError('البريد الإلكتروني غير صالح');
            return false;
        }
        
        if (profile.phone && !this.validatePhone(profile.phone)) {
            this.showError('رقم الهاتف غير صالح');
            return false;
        }
        
        return true;
    }

    changeProfileImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // التحقق من حجم الصورة
            if (file.size > 2 * 1024 * 1024) { // 2MB
                this.showError('حجم الصورة يجب أن يكون أقل من 2MB');
                return;
            }
            
            // قراءة الصورة وتحديثها
            const reader = new FileReader();
            reader.onload = (e) => {
                this.userProfile.avatar = e.target.result;
                this.saveProfile();
                this.updateProfileDisplay();
                this.showSuccess('تم تغيير الصورة بنجاح');
            };
            reader.readAsDataURL(file);
        };
        
        input.click();
    }

    toggleDarkMode(enabled) {
        this.settings.darkMode = enabled;
        
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        this.showSuccess(`تم ${enabled ? 'تفعيل' : 'إلغاء'} الوضع الداكن`);
        this.saveProfile();
    }

    updateNotificationSettings(settingElement) {
        const key = settingElement.dataset.setting;
        const enabled = settingElement.checked;
        
        if (!this.settings.notifications) {
            this.settings.notifications = {};
        }
        
        this.settings.notifications[key] = enabled;
        this.saveProfile();
        
        this.showInfo(`تم ${enabled ? 'تفعيل' : 'إيقاف'} إشعارات ${this.getNotificationLabel(key)}`);
    }

    getNotificationLabel(key) {
        const labels = {
            messages: 'الرسائل',
            projects: 'المشاريع',
            payments: 'المدفوعات',
            promotions: 'العروض'
        };
        
        return labels[key] || key;
    }

    changeLanguage(lang) {
        this.settings.language = lang;
        this.saveProfile();
        
        // في التطبيق الحقيقي، هنا سيتم تغيير لغة الواجهة
        this.showInfo('سيتم تطبيق تغيير اللغة بعد إعادة تحميل الصفحة');
    }

    saveSettings() {
        this.saveProfile();
        this.showSuccess('تم حفظ الإعدادات بنجاح');
    }

    showChangePasswordModal() {
        const modalContent = document.createElement('div');
        modalContent.className = 'change-password-modal';
        modalContent.innerHTML = `
            <h3>تغيير كلمة المرور</h3>
            <form id="changePasswordForm">
                <div class="form-group">
                    <label>كلمة المرور الحالية</label>
                    <div class="input-with-icon">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="currentPassword" required>
                        <button type="button" class="password-toggle">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label>كلمة المرور الجديدة</label>
                    <div class="input-with-icon">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="newPassword" required minlength="8">
                        <button type="button" class="password-toggle">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <div class="password-strength">
                        <div class="strength-meter">
                            <div class="strength-bar"></div>
                        </div>
                        <span id="strengthText">قوة كلمة المرور: ضعيفة</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>تأكيد كلمة المرور الجديدة</label>
                    <div class="input-with-icon">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="confirmPassword" required>
                    </div>
                </div>
            </form>
            <div class="modal-actions">
                <button class="action-btn outline cancel-change">إلغاء</button>
                <button class="action-btn confirm-change">تغيير كلمة المرور</button>
            </div>
        `;
        
        this.showModal('تغيير كلمة المرور', modalContent);
        
        // تبديل عرض كلمة المرور
        modalContent.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const input = toggle.parentElement.querySelector('input');
                const icon = toggle.querySelector('i');
                
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
        const newPasswordInput = modalContent.querySelector('#newPassword');
        const strengthBar = modalContent.querySelector('.strength-bar');
        const strengthText = modalContent.querySelector('#strengthText');
        
        newPasswordInput.addEventListener('input', (e) => {
            const strength = this.calculatePasswordStrength(e.target.value);
            strengthBar.style.width = `${strength.score * 25}%`;
            strengthBar.style.backgroundColor = strength.color;
            strengthText.textContent = `قوة كلمة المرور: ${strength.text}`;
            strengthText.style.color = strength.color;
        });
        
        // إلغاء
        modalContent.querySelector('.cancel-change').addEventListener('click', () => {
            this.closeModal();
        });
        
        // تأكيد
        modalContent.querySelector('.confirm-change').addEventListener('click', () => {
            this.changePassword(modalContent);
        });
    }

    async changePassword(modalContent) {
        const form = modalContent.querySelector('#changePasswordForm');
        const currentPassword = form.querySelector('#currentPassword').value;
        const newPassword = form.querySelector('#newPassword').value;
        const confirmPassword = form.querySelector('#confirmPassword').value;
        
        // التحقق من صحة المدخلات
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showError('يرجى ملء جميع الحقول');
            return;
        }
        
        if (newPassword.length < 8) {
            this.showError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showError('كلمات المرور غير متطابقة');
            return;
        }
        
        // في الحقيقي، هنا ستكون عملية التحقق من كلمة المرور الحالية مع الخادم
        const isCurrentPasswordValid = await this.verifyCurrentPassword(currentPassword);
        
        if (!isCurrentPasswordValid) {
            this.showError('كلمة المرور الحالية غير صحيحة');
            return;
        }
        
        // محاكاة تغيير كلمة المرور
        this.showInfo('جاري تغيير كلمة المرور...');
        
        setTimeout(() => {
            // في الحقيقي، هنا ستكون عملية تغيير كلمة المرور في الخادم
            this.userProfile.password = newPassword; // في الحقيقي، يجب تشفير كلمة المرور
            this.saveProfile();
            
            this.closeModal();
            this.showSuccess('تم تغيير كلمة المرور بنجاح');
        }, 2000);
    }

    async verifyCurrentPassword(password) {
        // في الحقيقي، هنا ستكون عملية التحقق مع الخادم
        // للمحاكاة، سنتحقق من localStorage
        const users = JSON.parse(localStorage.getItem('pixelArtUsers') || '[]');
        const user = users.find(u => u.email === this.userProfile.email);
        
        return user && user.password === password;
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        const strengths = [
            { text: 'ضعيفة', color: '#e76f51' },
            { text: 'متوسطة', color: '#e9c46a' },
            { text: 'جيدة', color: '#2a9d8f' },
            { text: 'قوية جداً', color: '#0a9396' }
        ];
        
        return {
            score,
            ...strengths[score - 1] || strengths[0]
        };
    }

    logoutAllDevices() {
        if (confirm('هل أنت متأكد من تسجيل الخروج من جميع الأجهزة؟')) {
            // حذف جميع الجلسات
            localStorage.removeItem('pixelArtUser');
            sessionStorage.removeItem('pixelArtUser');
            
            // إعادة التوجيه لصفحة تسجيل الدخول
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
            
            this.showSuccess('تم تسجيل الخروج من جميع الأجهزة');
        }
    }

    deleteAccount() {
        const modalContent = document.createElement('div');
        modalContent.className = 'delete-account-modal';
        modalContent.innerHTML = `
            <h3>حذف الحساب</h3>
            <div class="warning-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك بشكل دائم.</p>
            </div>
            <div class="form-group">
                <label>أدخل كلمة المرور للتأكيد</label>
                <input type="password" id="deletePassword" placeholder="كلمة المرور الحالية">
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="confirmDelete">
                    <span>أوافق على حذف حسابي بشكل دائم</span>
                </label>
            </div>
            <div class="modal-actions">
                <button class="action-btn outline cancel-delete">إلغاء</button>
                <button class="action-btn danger confirm-delete">حذف الحساب</button>
            </div>
        `;
        
        this.showModal('حذف الحساب', modalContent);
        
        // إلغاء
        modalContent.querySelector('.cancel-delete').addEventListener('click', () => {
            this.closeModal();
        });
        
        // تأكيد الحذف
        modalContent.querySelector('.confirm-delete').addEventListener('click', () => {
            this.confirmDeleteAccount(modalContent);
        });
    }

    async confirmDeleteAccount(modalContent) {
        const password = modalContent.querySelector('#deletePassword').value;
        const confirmed = modalContent.querySelector('#confirmDelete').checked;
        
        if (!confirmed) {
            this.showError('يجب الموافقة على حذف الحساب');
            return;
        }
        
        if (!password) {
            this.showError('يرجى إدخال كلمة المرور');
            return;
        }
        
        // التحقق من كلمة المرور
        const isPasswordValid = await this.verifyCurrentPassword(password);
        if (!isPasswordValid) {
            this.showError('كلمة المرور غير صحيحة');
            return;
        }
        
        // محاكاة حذف الحساب
        this.showInfo('جاري حذف الحساب...');
        
        setTimeout(() => {
            // حذف البيانات من localStorage
            localStorage.removeItem('pixelArtUser');
            localStorage.removeItem('pixelArtSettings');
            localStorage.removeItem('pixelArtUsers');
            localStorage.removeItem('pixelArtDesigns');
            localStorage.removeItem('pixelArtProjects');
            localStorage.removeItem('pixelArtConversations');
            localStorage.removeItem('pixelArtWalletBalance');
            localStorage.removeItem('pixelArtTransactions');
            localStorage.removeItem('pixelArtPaymentMethods');
            localStorage.removeItem('pixelArtSubscription');
            localStorage.removeItem('pixelArtAnalytics');
            localStorage.removeItem('pixelArtReports');
            
            sessionStorage.clear();
            
            // إعادة التوجيه للصفحة الرئيسية
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
            
            this.showSuccess('تم حذف الحساب بنجاح');
            this.closeModal();
        }, 3000);
    }

    // === الإجراءات السريعة ===
    
    toggleQuickActionsMenu() {
        const menu = document.getElementById('quickActionsMenu');
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        
        if (menu.style.display === 'block') {
            this.positionQuickActionsMenu();
        }
    }

    positionQuickActionsMenu() {
        const menu = document.getElementById('quickActionsMenu');
        const button = document.getElementById('quickActionBtn');
        
        if (!menu || !button) return;
        
        const buttonRect = button.getBoundingClientRect();
        menu.style.bottom = `${window.innerHeight - buttonRect.top + 20}px`;
        menu.style.right = `${buttonRect.left + (buttonRect.width / 2) - (menu.offsetWidth / 2)}px`;
    }

    closeQuickActionsMenu() {
        const menu = document.getElementById('quickActionsMenu');
        menu.style.display = 'none';
    }

    handleQuickAction(e) {
        const actionButton = e.currentTarget;
        const action = actionButton.dataset.action;
        
        this.closeQuickActionsMenu();
        
        switch(action) {
            case 'new-design':
                this.openDesignRequest();
                break;
            case 'hire-designer':
                this.openHiringPage();
                break;
            case 'ai-design':
                this.openAITools();
                break;
            case 'upload-design':
                this.uploadDesign();
                break;
            case 'create-invoice':
                this.createInvoice();
                break;
            case 'schedule-meeting':
                this.scheduleMeeting();
                break;
        }
    }

    openDesignRequest() {
        // الانتقال لقسم طلب التصميم
        window.pixelArtApp.switchSection('design-request');
        this.showInfo('تم فتح صفحة طلب التصميم');
    }

    openHiringPage() {
        // الانتقال لقسم المصممين
        window.pixelArtApp.switchSection('designers');
        this.showInfo('تم فتح صفحة المصممين');
    }

    openAITools() {
        // الانتقال لأدوات الذكاء الاصطناعي
        window.pixelArtApp.switchSection('design-tools');
        
        // تفعيل تبويب الذكاء الاصطناعي
        setTimeout(() => {
            const aiToolBtn = document.querySelector('.tool-btn[data-tool="ai"]');
            if (aiToolBtn) {
                aiToolBtn.click();
            }
        }, 100);
        
        this.showInfo('تم فتح أدوات الذكاء الاصطناعي');
    }

    async uploadDesign() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.psd,.ai,.pdf';
        input.multiple = true;
        
        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            
            if (files.length === 0) return;
            
            this.showInfo(`جاري رفع ${files.length} ملف...`);
            
            // محاكاة رفع الملفات
            for (const file of files) {
                await this.simulateFileUpload(file);
            }
            
            this.showSuccess('تم رفع الملفات بنجاح');
            
            // الانتقال لصفحة التصاميم
            setTimeout(() => {
                window.pixelArtApp.switchSection('explore');
            }, 1000);
        };
        
        input.click();
    }

    async simulateFileUpload(file) {
        return new Promise(resolve => {
            setTimeout(() => {
                // حفظ الملف في localStorage (محاكاة)
                const reader = new FileReader();
                reader.onload = (e) => {
                    const designs = JSON.parse(localStorage.getItem('pixelArtDesigns') || '[]');
                    designs.push({
                        id: Date.now(),
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        url: e.target.result,
                        uploadedAt: new Date().toISOString()
                    });
                    
                    localStorage.setItem('pixelArtDesigns', JSON.stringify(designs));
                    resolve();
                };
                reader.readAsDataURL(file);
            }, 500);
        });
    }

    createInvoice() {
        const modalContent = document.createElement('div');
        modalContent.className = 'invoice-modal';
        modalContent.innerHTML = `
            <h3>إنشاء فاتورة جديدة</h3>
            <form id="invoiceForm">
                <div class="form-group">
                    <label>العميل</label>
                    <input type="text" id="invoiceClient" placeholder="اسم العميل" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>رقم الفاتورة</label>
                        <input type="text" id="invoiceNumber" value="INV-${Date.now().toString().slice(-6)}" readonly>
                    </div>
                    <div class="form-group">
                        <label>تاريخ الفاتورة</label>
                        <input type="date" id="invoiceDate" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                </div>
                <div class="invoice-items">
                    <h4>عناصر الفاتورة</h4>
                    <div class="invoice-item">
                        <input type="text" placeholder="وصف الخدمة" class="item-description">
                        <input type="number" placeholder="الكمية" class="item-quantity" value="1" min="1">
                        <input type="number" placeholder="السعر" class="item-price" min="0">
                        <span class="item-total">0 ريال</span>
                        <button type="button" class="remove-item"><i class="fas fa-times"></i></button>
                    </div>
                    <button type="button" class="action-btn small add-item">
                        <i class="fas fa-plus"></i> إضافة عنصر
                    </button>
                </div>
                <div class="invoice-summary">
                    <div class="summary-item">
                        <span>المجموع:</span>
                        <span id="subtotal">0 ريال</span>
                    </div>
                    <div class="summary-item">
                        <span>الضريبة (15%):</span>
                        <span id="tax">0 ريال</span>
                    </div>
                    <div class="summary-item total">
                        <span>الإجمالي:</span>
                        <span id="total">0 ريال</span>
                    </div>
                </div>
            </form>
            <div class="modal-actions">
                <button class="action-btn outline cancel-invoice">إلغاء</button>
                <button class="action-btn save-invoice">حفظ الفاتورة</button>
                <button class="action-btn download-invoice">تحميل PDF</button>
            </div>
        `;
        
        this.showModal('إنشاء فاتورة', modalContent);
        
        // إدارة عناصر الفاتورة
        this.setupInvoiceItems(modalContent);
        
        // إلغاء
        modalContent.querySelector('.cancel-invoice').addEventListener('click', () => {
            this.closeModal();
        });
        
        // حفظ
        modalContent.querySelector('.save-invoice').addEventListener('click', () => {
            this.saveInvoice(modalContent);
        });
        
        // تحميل
        modalContent.querySelector('.download-invoice').addEventListener('click', () => {
            this.downloadInvoice(modalContent);
        });
    }

    setupInvoiceItems(modalContent) {
        const itemsContainer = modalContent.querySelector('.invoice-items');
        const addItemBtn = modalContent.querySelector('.add-item');
        
        const updateTotals = () => {
            let subtotal = 0;
            
            modalContent.querySelectorAll('.invoice-item').forEach(item => {
                const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
                const price = parseFloat(item.querySelector('.item-price').value) || 0;
                const total = quantity * price;
                
                item.querySelector('.item-total').textContent = `${total} ريال`;
                subtotal += total;
            });
            
            const tax = subtotal * 0.15;
            const total = subtotal + tax;
            
            modalContent.querySelector('#subtotal').textContent = `${subtotal} ريال`;
            modalContent.querySelector('#tax').textContent = `${tax} ريال`;
            modalContent.querySelector('#total').textContent = `${total} ريال`;
        };
        
        const addItem = () => {
            const item = document.createElement('div');
            item.className = 'invoice-item';
            item.innerHTML = `
                <input type="text" placeholder="وصف الخدمة" class="item-description">
                <input type="number" placeholder="الكمية" class="item-quantity" value="1" min="1">
                <input type="number" placeholder="السعر" class="item-price" min="0">
                <span class="item-total">0 ريال</span>
                <button type="button" class="remove-item"><i class="fas fa-times"></i></button>
            `;
            
            item.querySelector('.remove-item').addEventListener('click', () => {
                item.remove();
                updateTotals();
            });
            
            item.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', updateTotals);
            });
            
            itemsContainer.insertBefore(item, addItemBtn);
        };
        
        addItemBtn.addEventListener('click', addItem);
        
        // تحديث الإجماليات عند تغيير القيم
        modalContent.querySelectorAll('.invoice-item input').forEach(input => {
            input.addEventListener('input', updateTotals);
        });
        
        updateTotals();
    }

    saveInvoice(modalContent) {
        const form = modalContent.querySelector('#invoiceForm');
        const client = form.querySelector('#invoiceClient').value;
        const invoiceNumber = form.querySelector('#invoiceNumber').value;
        const date = form.querySelector('#invoiceDate').value;
        
        if (!client) {
            this.showError('يرجى إدخال اسم العميل');
            return;
        }
        
        const items = Array.from(modalContent.querySelectorAll('.invoice-item')).map(item => ({
            description: item.querySelector('.item-description').value,
            quantity: parseFloat(item.querySelector('.item-quantity').value) || 0,
            price: parseFloat(item.querySelector('.item-price').value) || 0,
            total: parseFloat(item.querySelector('.item-total').textContent) || 0
        }));
        
        const subtotal = parseFloat(modalContent.querySelector('#subtotal').textContent) || 0;
        const tax = parseFloat(modalContent.querySelector('#tax').textContent) || 0;
        const total = parseFloat(modalContent.querySelector('#total').textContent) || 0;
        
        const invoice = {
            id: Date.now(),
            number: invoiceNumber,
            client,
            date,
            items,
            subtotal,
            tax,
            total,
            createdAt: new Date().toISOString()
        };
        
        // حفظ في localStorage
        const invoices = JSON.parse(localStorage.getItem('pixelArtInvoices') || '[]');
        invoices.push(invoice);
        localStorage.setItem('pixelArtInvoices', JSON.stringify(invoices));
        
        this.closeModal();
        this.showSuccess('تم حفظ الفاتورة بنجاح');
    }

    downloadInvoice(modalContent) {
        this.showInfo('جاري إنشاء ملف PDF...');
        
        setTimeout(() => {
            // محاكاة إنشاء PDF
            const link = document.createElement('a');
            link.download = `فاتورة-${modalContent.querySelector('#invoiceNumber').value}.pdf`;
            link.href = '#';
            link.click();
            
            this.showSuccess('تم تحميل الفاتورة بنجاح');
        }, 2000);
    }

    scheduleMeeting() {
        const modalContent = document.createElement('div');
        modalContent.className = 'meeting-modal';
        modalContent.innerHTML = `
            <h3>جدولة اجتماع</h3>
            <form id="meetingForm">
                <div class="form-group">
                    <label>عنوان الاجتماع</label>
                    <input type="text" id="meetingTitle" placeholder="عنوان الاجتماع" required>
                </div>
                <div class="form-group">
                    <label>الوصف</label>
                    <textarea id="meetingDescription" rows="3" placeholder="وصف الاجتماع"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>التاريخ</label>
                        <input type="date" id="meetingDate" required>
                    </div>
                    <div class="form-group">
                        <label>الوقت</label>
                        <input type="time" id="meetingTime" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>المدة (دقائق)</label>
                    <select id="meetingDuration">
                        <option value="30">30 دقيقة</option>
                        <option value="60" selected>60 دقيقة</option>
                        <option value="90">90 دقيقة</option>
                        <option value="120">120 دقيقة</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>المشاركون</label>
                    <div class="participants-input">
                        <input type="email" id="participantEmail" placeholder="بريد المشارك">
                        <button type="button" class="add-participant">+</button>
                    </div>
                    <div class="participants-list" id="participantsList"></div>
                </div>
            </form>
            <div class="modal-actions">
                <button class="action-btn outline cancel-meeting">إلغاء</button>
                <button class="action-btn schedule-meeting">جدولة</button>
            </div>
        `;
        
        this.showModal('جدولة اجتماع', modalContent);
        
        // تعيين التاريخ الحالي كحد أدنى
        const dateInput = modalContent.querySelector('#meetingDate');
        dateInput.min = new Date().toISOString().split('T')[0];
        dateInput.value = new Date().toISOString().split('T')[0];
        
        // إضافة المشاركين
        const emailInput = modalContent.querySelector('#participantEmail');
        const addParticipantBtn = modalContent.querySelector('.add-participant');
        const participantsList = modalContent.querySelector('#participantsList');
        
        const addParticipant = () => {
            const email = emailInput.value.trim();
            if (email && this.validateEmail(email)) {
                const participant = document.createElement('div');
                participant.className = 'participant';
                participant.innerHTML = `
                    <span>${email}</span>
                    <button type="button" class="remove-participant">&times;</button>
                `;
                
                participant.querySelector('.remove-participant').addEventListener('click', () => {
                    participant.remove();
                });
                
                participantsList.appendChild(participant);
                emailInput.value = '';
            } else {
                this.showError('البريد الإلكتروني غير صالح');
            }
        };
        
        addParticipantBtn.addEventListener('click', addParticipant);
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addParticipant();
            }
        });
        
        // إلغاء
        modalContent.querySelector('.cancel-meeting').addEventListener('click', () => {
            this.closeModal();
        });
        
        // جدولة
        modalContent.querySelector('.schedule-meeting').addEventListener('click', () => {
            this.scheduleNewMeeting(modalContent);
        });
    }

    scheduleNewMeeting(modalContent) {
        const form = modalContent.querySelector('#meetingForm');
        const title = form.querySelector('#meetingTitle').value;
        const date = form.querySelector('#meetingDate').value;
        const time = form.querySelector('#meetingTime').value;
        
        if (!title) {
            this.showError('عنوان الاجتماع مطلوب');
            return;
        }
        
        const participants = Array.from(modalContent.querySelectorAll('.participant span'))
            .map(span => span.textContent);
        
        const meeting = {
            id: Date.now(),
            title,
            description: form.querySelector('#meetingDescription').value,
            date,
            time,
            duration: form.querySelector('#meetingDuration').value,
            participants,
            createdAt: new Date().toISOString()
        };
        
        // حفظ في localStorage
        const meetings = JSON.parse(localStorage.getItem('pixelArtMeetings') || '[]');
        meetings.push(meeting);
        localStorage.setItem('pixelArtMeetings', JSON.stringify(meetings));
        
        this.closeModal();
        this.showSuccess('تم جدولة الاجتماع بنجاح');
        
        // إضافة لإشعار التقويم
        setTimeout(() => {
            if (window.chatManager) {
                window.chatManager.showNotification(
                    'اجتماع مجدول',
                    `اجتماع "${title}" في ${date} الساعة ${time}`
                );
            }
        }, 1000);
    }

    // === وظائف مساعدة ===
    
    getDefaultProfile() {
        return {
            id: Date.now(),
            name: 'مستخدم جديد',
            email: 'user@example.com',
            phone: '+966500000000',
            role: 'client',
            avatar: this.getDefaultAvatar(),
            createdAt: new Date().toISOString(),
            bio: '',
            address: '',
            skills: []
        };
    }

    getDefaultSettings() {
        return {
            darkMode: false,
            language: 'ar',
            notifications: {
                messages: true,
                projects: true,
                payments: true,
                promotions: true
            }
        };
    }

    getDefaultAvatar() {
        return 'https://ui-avatars.com/api/?name=مستخدم&background=0a9396&color=fff';
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return re.test(phone);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">${content.outerHTML || content}</div>
        `;
        
        document.body.appendChild(modal);
        document.getElementById('modalOverlay').style.display = 'block';
        
        modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
    }

    closeModal() {
        const modal = document.querySelector('.modal:last-child');
        if (modal) {
            modal.remove();
        }
        document.getElementById('modalOverlay').style.display = 'none';
    }

    showError(message) {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "left",
            backgroundColor: "#e76f51",
            stopOnFocus: true
        }).showToast();
    }

    showSuccess(message) {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "left",
            backgroundColor: "#2a9d8f",
            stopOnFocus: true
        }).showToast();
    }

    showInfo(message) {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "left",
            backgroundColor: "#0a9396",
            stopOnFocus: true
        }).showToast();
    }
}

// تهيئة مدير الملف الشخصي
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});
