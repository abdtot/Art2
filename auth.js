// ============================================
// نظام المصادقة والتحكم في المستخدمين
// ============================================

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkSession();
    }

    bindEvents() {
        // تبديل علامات التسجيل/تسجيل الدخول
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchAuthTab(e));
        });

        // تسجيل الدخول
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // إنشاء حساب
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // تبديل كلمة المرور
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });

        // اختيار نوع الحساب
        document.querySelectorAll('.account-type').forEach(type => {
            type.addEventListener('click', (e) => this.selectAccountType(e));
        });

        // قوة كلمة المرور
        const passwordInput = document.getElementById('registerPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        }

        // تسجيل الدخول الاجتماعي
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSocialLogin(e));
        });
    }

    switchAuthTab(e) {
        const tab = e.target;
        const tabId = tab.dataset.tab;
        
        // تحديث التبويبات النشطة
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // إظهار النموذج المناسب
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${tabId}Form`).classList.add('active');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // التحقق من المدخلات
        if (!this.validateEmail(email)) {
            this.showError('البريد الإلكتروني غير صالح');
            return;
        }
        
        if (password.length < 6) {
            this.showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }
        
        // عرض حالة التحميل
        const loginBtn = document.getElementById('loginBtn');
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
        loginBtn.disabled = true;
        
        try {
            // محاكاة تسجيل الدخول (في الحقيقي سيكون هناك طلب إلى API)
            await this.simulateLogin({ email, password, rememberMe });
            
            // النجاح
            this.showSuccess('تم تسجيل الدخول بنجاح!');
            
            // تحديث واجهة المستخدم
            setTimeout(() => {
                window.location.reload();
            }, 1500);
            
        } catch (error) {
            this.showError(error.message);
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const userType = document.getElementById('userType').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsAgreement = document.getElementById('termsAgreement').checked;
        
        // التحقق من المدخلات
        if (!this.validateRegistration({
            firstName, lastName, email, phone, userType, password, confirmPassword, termsAgreement
        })) {
            return;
        }
        
        // عرض حالة التحميل
        const registerBtn = document.getElementById('registerBtn');
        const originalText = registerBtn.innerHTML;
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
        registerBtn.disabled = true;
        
        try {
            // محاكاة إنشاء حساب
            const userData = {
                firstName,
                lastName,
                email,
                phone,
                userType,
                password
            };
            
            await this.simulateRegister(userData);
            
            // النجاح
            this.showSuccess('تم إنشاء الحساب بنجاح! يتم تسجيل الدخول تلقائياً...');
            
            // تحديث واجهة المستخدم
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            this.showError(error.message);
            registerBtn.innerHTML = originalText;
            registerBtn.disabled = false;
        }
    }

    validateRegistration(data) {
        const { firstName, lastName, email, phone, password, confirmPassword, termsAgreement } = data;
        
        if (!firstName || !lastName) {
            this.showError('الاسم الأول والاسم الأخير مطلوبان');
            return false;
        }
        
        if (!this.validateEmail(email)) {
            this.showError('البريد الإلكتروني غير صالح');
            return false;
        }
        
        if (!this.validatePhone(phone)) {
            this.showError('رقم الهاتف غير صالح');
            return false;
        }
        
        if (password.length < 8) {
            this.showError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return false;
        }
        
        if (password !== confirmPassword) {
            this.showError('كلمات المرور غير متطابقة');
            return false;
        }
        
        if (!termsAgreement) {
            this.showError('يجب الموافقة على شروط الخدمة');
            return false;
        }
        
        return true;
    }

    async simulateLogin(credentials) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // محاكاة التحقق
                const users = this.getStoredUsers();
                const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
                
                if (user) {
                    // حفظ الجلسة
                    this.saveSession(user, credentials.rememberMe);
                    resolve(user);
                } else {
                    reject(new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة'));
                }
            }, 1500);
        });
    }

    async simulateRegister(userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // التحقق من عدم وجود حساب بنفس البريد
                const users = this.getStoredUsers();
                if (users.some(u => u.email === userData.email)) {
                    reject(new Error('البريد الإلكتروني مسجل مسبقاً'));
                    return;
                }
                
                // إنشاء حساب جديد
                const newUser = {
                    id: Date.now(),
                    name: `${userData.firstName} ${userData.lastName}`,
                    email: userData.email,
                    phone: userData.phone,
                    role: userData.userType,
                    createdAt: new Date().toISOString(),
                    settings: {
                        notifications: true,
                        darkMode: false,
                        autoPlayMusic: false
                    },
                    // في الحقيقي، يجب تشفير كلمة المرور
                    password: userData.password
                };
                
                // حفظ المستخدم
                users.push(newUser);
                localStorage.setItem('pixelArtUsers', JSON.stringify(users));
                
                // تسجيل الدخول تلقائياً
                this.saveSession(newUser, true);
                resolve(newUser);
            }, 2000);
        });
    }

    getStoredUsers() {
        const users = localStorage.getItem('pixelArtUsers');
        return users ? JSON.parse(users) : [];
    }

    saveSession(user, rememberMe) {
        // إزالة كلمة المرور قبل الحفظ
        const { password, ...userWithoutPassword } = user;
        
        // حفظ في localStorage
        localStorage.setItem('pixelArtUser', JSON.stringify(userWithoutPassword));
        
        // حفظ في sessionStorage للجلسات المؤقتة
        if (!rememberMe) {
            sessionStorage.setItem('pixelArtUser', JSON.stringify(userWithoutPassword));
        }
    }

    checkSession() {
        const user = localStorage.getItem('pixelArtUser') || sessionStorage.getItem('pixelArtUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem('pixelArtUser');
        sessionStorage.removeItem('pixelArtUser');
        this.currentUser = null;
        window.location.reload();
    }

    togglePasswordVisibility(e) {
        const button = e.currentTarget;
        const input = button.previousElementSibling;
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    selectAccountType(e) {
        const typeElement = e.currentTarget;
        const type = typeElement.dataset.type;
        
        // تحديث المظهر
        document.querySelectorAll('.account-type').forEach(el => el.classList.remove('selected'));
        typeElement.classList.add('selected');
        
        // تحديث الحقل المخفي
        document.getElementById('userType').value = type;
    }

    checkPasswordStrength(password) {
        const strengthBar = document.getElementById('strengthBar');
        const strengthText = document.getElementById('strengthText');
        
        let strength = 0;
        let text = 'ضعيفة';
        let color = '#e76f51';
        
        // التحقق من القواعد
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // تحديد القوة
        switch(strength) {
            case 1:
                text = 'ضعيفة';
                color = '#e76f51';
                break;
            case 2:
                text = 'متوسطة';
                color = '#e9c46a';
                break;
            case 3:
                text = 'جيدة';
                color = '#2a9d8f';
                break;
            case 4:
                text = 'قوية جداً';
                color = '#0a9396';
                break;
        }
        
        // تحديث الواجهة
        if (strengthBar) {
            strengthBar.style.width = `${strength * 25}%`;
            strengthBar.style.backgroundColor = color;
        }
        
        if (strengthText) {
            strengthText.textContent = `قوة كلمة المرور: ${text}`;
            strengthText.style.color = color;
        }
    }

    handleSocialLogin(e) {
        const button = e.currentTarget;
        const provider = button.classList.contains('google') ? 'google' : 'twitter';
        
        this.showInfo(`جاري التحويل إلى ${provider} للمصادقة...`);
        
        // محاكاة تسجيل الدخول الاجتماعي
        setTimeout(() => {
            // في الحقيقي، هنا ستكون عملية OAuth
            this.showSuccess(`تم تسجيل الدخول باستخدام ${provider} بنجاح!`);
            
            // تحميل التطبيق
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }, 2000);
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return re.test(phone);
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

// تهيئة مدير المصادقة
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
