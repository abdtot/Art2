/**
 * ملف المصادقة والتوثيق - بيكسل آرت
 * نظام متكامل للتسجيل، تسجيل الدخول، وإدارة المستخدمين
 * @version 1.0.0
 */

// ===== الثوابت والتكوين =====
const AUTH_CONFIG = {
    API_BASE_URL: 'https://api.pixelart.design/v1',
    TOKEN_KEY: 'pixelart_auth_token',
    USER_KEY: 'pixelart_user_data',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 ساعة
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// ===== حالة التطبيق =====
let authState = {
    isAuthenticated: false,
    user: null,
    token: null,
    userType: 'client',
    sessionExpiry: null
};

// ===== عناصر DOM الرئيسية =====
const DOM_ELEMENTS = {
    loadingScreen: document.getElementById('loadingScreen'),
    authScreen: document.getElementById('authScreen'),
    appContainer: document.getElementById('appContainer'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginBtn: document.getElementById('loginBtn'),
    registerBtn: document.getElementById('registerBtn'),
    authTabs: document.querySelectorAll('.auth-tab'),
    accountTypes: document.querySelectorAll('.account-type'),
    userTypeInput: document.getElementById('userType'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    registerEmail: document.getElementById('registerEmail'),
    registerPhone: document.getElementById('registerPhone'),
    registerPassword: document.getElementById('registerPassword'),
    confirmPassword: document.getElementById('confirmPassword'),
    strengthBar: document.getElementById('strengthBar'),
    strengthText: document.getElementById('strengthText'),
    rememberMe: document.getElementById('rememberMe'),
    termsAgreement: document.getElementById('termsAgreement'),
    passwordToggles: document.querySelectorAll('.password-toggle'),
    socialButtons: document.querySelectorAll('.social-btn'),
    forgotPassword: document.querySelector('.forgot-password'),
    progressFill: document.getElementById('progressFill'),
    loadingText: document.getElementById('loadingText'),
    userName: document.getElementById('userName'),
    userRole: document.getElementById('userRole'),
    userBalance: document.getElementById('userBalance')
};

// ===== أحداث DOM عند التحميل =====
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupEventListeners();
    simulateLoading();
});

// ===== تهيئة نظام المصادقة =====
function initializeAuth() {
    // التحقق من وجود بيانات المصادقة المحفوظة
    const savedToken = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    const savedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    
    if (savedToken && savedUser) {
        try {
            const userData = JSON.parse(savedUser);
            const tokenData = JSON.parse(savedToken);
            
            // التحقق من صلاحية الجلسة
            if (tokenData.expiry && new Date(tokenData.expiry) > new Date()) {
                authState = {
                    isAuthenticated: true,
                    user: userData,
                    token: tokenData.token,
                    userType: userData.type || 'client',
                    sessionExpiry: new Date(tokenData.expiry)
                };
                
                updateUIForUser(userData);
                showApp();
                startSessionTimer();
            } else {
                // الجلسة منتهية الصلاحية
                clearAuthData();
                showAuth();
            }
        } catch (error) {
            console.error('Error parsing auth data:', error);
            clearAuthData();
            showAuth();
        }
    } else {
        showAuth();
    }
}

// ===== إعداد مستمعي الأحداث =====
function setupEventListeners() {
    // تبديل بين تسجيل الدخول والتسجيل
    DOM_ELEMENTS.authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchAuthTab(tabId);
        });
    });
    
    // اختيار نوع الحساب
    DOM_ELEMENTS.accountTypes.forEach(type => {
        type.addEventListener('click', function() {
            const accountType = this.getAttribute('data-type');
            selectAccountType(accountType);
        });
    });
    
    // إرسال نموذج تسجيل الدخول
    DOM_ELEMENTS.loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // إرسال نموذج التسجيل
    DOM_ELEMENTS.registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegister();
    });
    
    // تفعيل إظهار/إخفاء كلمة المرور
    DOM_ELEMENTS.passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            togglePasswordVisibility(this);
        });
    });
    
    // التحقق من قوة كلمة المرور أثناء الكتابة
    DOM_ELEMENTS.registerPassword.addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });
    
    // تسجيل الدخول عبر وسائل التواصل الاجتماعي
    DOM_ELEMENTS.socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('google') ? 'google' : 'twitter';
            handleSocialLogin(provider);
        });
    });
    
    // نسيان كلمة المرور
    DOM_ELEMENTS.forgotPassword.addEventListener('click', function(e) {
        e.preventDefault();
        showForgotPasswordModal();
    });
    
    // متابعة الكتابة في حقلي التأكيد
    DOM_ELEMENTS.confirmPassword.addEventListener('input', function() {
        validatePasswordConfirmation();
    });
}

// ===== محاكاة التحميل =====
function simulateLoading() {
    let progress = 0;
    const loadingMessages = [
        "جاري تهيئة النظام...",
        "تحميل الواجهات...",
        "جاري إعداد قاعدة البيانات...",
        "تهيئة أدوات التصميم...",
        "جاري التحقق من الاتصال...",
        "جاري تحميل التطبيق..."
    ];
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        DOM_ELEMENTS.progressFill.style.width = `${progress}%`;
        
        // تغيير رسالة التحميل
        const messageIndex = Math.floor(progress / 20);
        if (messageIndex < loadingMessages.length) {
            DOM_ELEMENTS.loadingText.textContent = loadingMessages[messageIndex];
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                if (!authState.isAuthenticated) {
                    DOM_ELEMENTS.loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        DOM_ELEMENTS.loadingScreen.style.display = 'none';
                        DOM_ELEMENTS.authScreen.style.display = 'block';
                        setTimeout(() => {
                            DOM_ELEMENTS.authScreen.style.opacity = '1';
                        }, 50);
                    }, 500);
                }
            }, 500);
        }
    }, 200);
}

// ===== وظائف المصادقة الرئيسية =====

/**
 * معالجة تسجيل الدخول
 */
async function handleLogin() {
    const email = DOM_ELEMENTS.loginEmail.value.trim();
    const password = DOM_ELEMENTS.loginPassword.value;
    const remember = DOM_ELEMENTS.rememberMe.checked;
    
    // التحقق من صحة البيانات
    if (!validateEmail(email)) {
        showToast('البريد الإلكتروني غير صحيح', 'error');
        return;
    }
    
    if (!password) {
        showToast('يرجى إدخال كلمة المرور', 'error');
        return;
    }
    
    // عرض حالة التحميل
    setButtonLoading(DOM_ELEMENTS.loginBtn, true);
    
    try {
        // محاكاة API حقيقي
        const response = await fakeLoginAPI(email, password);
        
        if (response.success) {
            // حفظ بيانات المصادقة
            saveAuthData(response.data, remember);
            
            // تحديث حالة التطبيق
            authState = {
                isAuthenticated: true,
                user: response.data.user,
                token: response.data.token,
                userType: response.data.user.type || 'client',
                sessionExpiry: new Date(Date.now() + AUTH_CONFIG.SESSION_TIMEOUT)
            };
            
            // تحديث واجهة المستخدم
            updateUIForUser(response.data.user);
            
            // الانتقال إلى التطبيق
            showApp();
            
            // بدء مؤقت الجلسة
            startSessionTimer();
            
            showToast('تم تسجيل الدخول بنجاح', 'success');
        } else {
            showToast(response.message || 'حدث خطأ أثناء تسجيل الدخول', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('حدث خطأ في الاتصال بالخادم', 'error');
    } finally {
        setButtonLoading(DOM_ELEMENTS.loginBtn, false);
    }
}

/**
 * معالجة التسجيل
 */
async function handleRegister() {
    const firstName = DOM_ELEMENTS.firstName.value.trim();
    const lastName = DOM_ELEMENTS.lastName.value.trim();
    const email = DOM_ELEMENTS.registerEmail.value.trim();
    const phone = DOM_ELEMENTS.registerPhone.value.trim();
    const password = DOM_ELEMENTS.registerPassword.value;
    const confirmPassword = DOM_ELEMENTS.confirmPassword.value;
    const userType = DOM_ELEMENTS.userTypeInput.value;
    const termsAgreed = DOM_ELEMENTS.termsAgreement.checked;
    
    // التحقق من صحة البيانات
    if (!firstName || !lastName) {
        showToast('يرجى إدخال الاسم الكامل', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('البريد الإلكتروني غير صحيح', 'error');
        return;
    }
    
    if (!validatePhone(phone)) {
        showToast('رقم الهاتف غير صحيح', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showToast('كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل وتشمل أحرف كبيرة وصغيرة وأرقام ورموز', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('كلمة المرور غير متطابقة', 'error');
        return;
    }
    
    if (!termsAgreed) {
        showToast('يجب الموافقة على الشروط والأحكام', 'error');
        return;
    }
    
    // عرض حالة التحميل
    setButtonLoading(DOM_ELEMENTS.registerBtn, true);
    
    try {
        // محاكاة API حقيقي
        const response = await fakeRegisterAPI({
            firstName,
            lastName,
            email,
            phone,
            password,
            userType
        });
        
        if (response.success) {
            // حفظ بيانات المصادقة
            saveAuthData(response.data, true);
            
            // تحديث حالة التطبيق
            authState = {
                isAuthenticated: true,
                user: response.data.user,
                token: response.data.token,
                userType: userType,
                sessionExpiry: new Date(Date.now() + AUTH_CONFIG.SESSION_TIMEOUT)
            };
            
            // تحديث واجهة المستخدم
            updateUIForUser(response.data.user);
            
            // الانتقال إلى التطبيق
            showApp();
            
            // بدء مؤقت الجلسة
            startSessionTimer();
            
            showToast('تم إنشاء الحساب بنجاح', 'success');
        } else {
            showToast(response.message || 'حدث خطأ أثناء إنشاء الحساب', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('حدث خطأ في الاتصال بالخادم', 'error');
    } finally {
        setButtonLoading(DOM_ELEMENTS.registerBtn, false);
    }
}

/**
 * معالجة تسجيل الدخول عبر وسائل التواصل الاجتماعي
 */
async function handleSocialLogin(provider) {
    showToast(`جاري تسجيل الدخول باستخدام ${provider}...`, 'info');
    
    try {
        // محاكاة API حقيقي للوسائط الاجتماعية
        const response = await fakeSocialLoginAPI(provider);
        
        if (response.success) {
            // حفظ بيانات المصادقة
            saveAuthData(response.data, true);
            
            // تحديث حالة التطبيق
            authState = {
                isAuthenticated: true,
                user: response.data.user,
                token: response.data.token,
                userType: response.data.user.type || 'client',
                sessionExpiry: new Date(Date.now() + AUTH_CONFIG.SESSION_TIMEOUT)
            };
            
            // تحديث واجهة المستخدم
            updateUIForUser(response.data.user);
            
            // الانتقال إلى التطبيق
            showApp();
            
            // بدء مؤقت الجلسة
            startSessionTimer();
            
            showToast('تم تسجيل الدخول بنجاح', 'success');
        } else {
            showToast(response.message || 'حدث خطأ أثناء تسجيل الدخول', 'error');
        }
    } catch (error) {
        console.error('Social login error:', error);
        showToast('حدث خطأ في تسجيل الدخول', 'error');
    }
}

// ===== وظائف المساعدة =====

/**
 * تبديل بين تبويبات المصادقة
 */
function switchAuthTab(tabId) {
    // تحديث التبويبات النشطة
    DOM_ELEMENTS.authTabs.forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
    });
    
    // تحديث النماذج النشطة
    DOM_ELEMENTS.loginForm.classList.toggle('active', tabId === 'login');
    DOM_ELEMENTS.registerForm.classList.toggle('active', tabId === 'register');
    
    // إعادة تعيين النماذج
    if (tabId === 'login') {
        DOM_ELEMENTS.loginForm.reset();
    } else {
        DOM_ELEMENTS.registerForm.reset();
        checkPasswordStrength('');
    }
}

/**
 * اختيار نوع الحساب
 */
function selectAccountType(type) {
    DOM_ELEMENTS.accountTypes.forEach(accountType => {
        accountType.classList.toggle('selected', accountType.getAttribute('data-type') === type);
    });
    DOM_ELEMENTS.userTypeInput.value = type;
}

/**
 * تبديل إظهار/إخفاء كلمة المرور
 */
function togglePasswordVisibility(toggleButton) {
    const input = toggleButton.closest('.input-with-icon').querySelector('input');
    const icon = toggleButton.querySelector('i');
    
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

/**
 * التحقق من قوة كلمة المرور
 */
function checkPasswordStrength(password) {
    if (!password) {
        DOM_ELEMENTS.strengthBar.style.width = '0%';
        DOM_ELEMENTS.strengthBar.style.backgroundColor = '';
        DOM_ELEMENTS.strengthText.textContent = 'قوة كلمة المرور: -';
        return;
    }
    
    let strength = 0;
    let feedback = '';
    let color = '';
    
    // التحقق من الطول
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    
    // التحقق من التعقيد
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    // تقييم القوة
    if (strength < 30) {
        feedback = 'ضعيفة';
        color = 'var(--danger-color)';
    } else if (strength < 60) {
        feedback = 'متوسطة';
        color = 'var(--warning-color)';
    } else if (strength < 80) {
        feedback = 'جيدة';
        color = 'var(--success-color)';
    } else {
        feedback = 'قوية جداً';
        color = 'var(--primary-color)';
    }
    
    // تحديث العرض
    DOM_ELEMENTS.strengthBar.style.width = `${strength}%`;
    DOM_ELEMENTS.strengthBar.style.backgroundColor = color;
    DOM_ELEMENTS.strengthText.textContent = `قوة كلمة المرور: ${feedback}`;
    
    return strength;
}

/**
 * التحقق من تأكيد كلمة المرور
 */
function validatePasswordConfirmation() {
    const password = DOM_ELEMENTS.registerPassword.value;
    const confirmPassword = DOM_ELEMENTS.confirmPassword.value;
    const inputContainer = DOM_ELEMENTS.confirmPassword.closest('.input-with-icon');
    
    if (!confirmPassword) {
        inputContainer.classList.remove('valid', 'invalid');
        return false;
    }
    
    if (password === confirmPassword) {
        inputContainer.classList.add('valid');
        inputContainer.classList.remove('invalid');
        return true;
    } else {
        inputContainer.classList.add('invalid');
        inputContainer.classList.remove('valid');
        return false;
    }
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * التحقق من صحة رقم الهاتف
 */
function validatePhone(phone) {
    // دعم للأرقام العربية والدولية
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone);
}

/**
 * التحقق من صحة كلمة المرور
 */
function validatePassword(password) {
    return AUTH_CONFIG.PASSWORD_REGEX.test(password);
}

/**
 * حفظ بيانات المصادقة
 */
function saveAuthData(data, remember) {
    const userData = {
        ...data.user,
        lastLogin: new Date().toISOString()
    };
    
    const tokenData = {
        token: data.token,
        expiry: remember ? new Date(Date.now() + AUTH_CONFIG.SESSION_TIMEOUT).toISOString() : null
    };
    
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(userData));
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, JSON.stringify(tokenData));
    
    // حفظ في sessionStorage للجلسات المؤقتة
    if (!remember) {
        sessionStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(userData));
        sessionStorage.setItem(AUTH_CONFIG.TOKEN_KEY, JSON.stringify(tokenData));
    }
}

/**
 * مسح بيانات المصادقة
 */
function clearAuthData() {
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    sessionStorage.removeItem(AUTH_CONFIG.USER_KEY);
    sessionStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
}

/**
 * تحديث واجهة المستخدم بناءً على بيانات المستخدم
 */
function updateUIForUser(user) {
    // تحديث الاسم
    if (DOM_ELEMENTS.userName) {
        DOM_ELEMENTS.userName.textContent = `${user.firstName} ${user.lastName}`;
    }
    
    // تحديث الدور
    if (DOM_ELEMENTS.userRole) {
        const roleText = user.type === 'designer' ? 'مصمم' : 'عميل';
        DOM_ELEMENTS.userRole.textContent = roleText;
    }
    
    // تحديث الرصيد
    if (DOM_ELEMENTS.userBalance) {
        DOM_ELEMENTS.userBalance.textContent = `${user.balance?.toLocaleString() || '0'} ريال`;
    }
    
    // تحديث الصورة الشخصية إذا كانت موجودة
    const profileImage = document.querySelector('.profile-image');
    if (profileImage && user.avatar) {
        profileImage.src = user.avatar;
    } else if (profileImage) {
        // إنشاء صورة افتراضية باستخدام الاسم
        const name = `${user.firstName}+${user.lastName}`;
        const bgColor = user.type === 'designer' ? '005f73' : '0a9396';
        profileImage.src = `https://ui-avatars.com/api/?name=${name}&background=${bgColor}&color=fff`;
    }
}

/**
 * إظهار التطبيق الرئيسي
 */
function showApp() {
    DOM_ELEMENTS.authScreen.style.opacity = '0';
    setTimeout(() => {
        DOM_ELEMENTS.authScreen.style.display = 'none';
        DOM_ELEMENTS.appContainer.style.display = 'block';
        setTimeout(() => {
            DOM_ELEMENTS.appContainer.style.opacity = '1';
        }, 50);
    }, 300);
}

/**
 * إظهار شاشة المصادقة
 */
function showAuth() {
    DOM_ELEMENTS.appContainer.style.opacity = '0';
    setTimeout(() => {
        DOM_ELEMENTS.appContainer.style.display = 'none';
        DOM_ELEMENTS.authScreen.style.display = 'flex';
        setTimeout(() => {
            DOM_ELEMENTS.authScreen.style.opacity = '1';
        }, 50);
    }, 300);
}

/**
 * بدء مؤقت الجلسة
 */
function startSessionTimer() {
    if (authState.sessionExpiry) {
        const timeUntilExpiry = authState.sessionExpiry.getTime() - Date.now();
        
        if (timeUntilExpiry > 0) {
            setTimeout(() => {
                handleSessionExpiry();
            }, timeUntilExpiry);
        } else {
            handleSessionExpiry();
        }
    }
}

/**
 * التعامل مع انتهاء الجلسة
 */
function handleSessionExpiry() {
    showToast('انتهت جلستك، يرجى تسجيل الدخول مرة أخرى', 'warning');
    logout();
}

/**
 * تسجيل الخروج
 */
function logout() {
    clearAuthData();
    authState = {
        isAuthenticated: false,
        user: null,
        token: null,
        userType: 'client',
        sessionExpiry: null
    };
    
    showAuth();
    DOM_ELEMENTS.loginForm.reset();
    switchAuthTab('login');
}

/**
 * إظهار مودال نسيان كلمة المرور
 */
function showForgotPasswordModal() {
    const modalHTML = `
        <div class="modal" id="forgotPasswordModal">
            <div class="modal-header">
                <h3>استعادة كلمة المرور</h3>
                <button class="modal-close" id="closeForgotPassword">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="resetEmail">البريد الإلكتروني</label>
                    <div class="input-with-icon">
                        <i class="fas fa-envelope"></i>
                        <input type="email" id="resetEmail" placeholder="أدخل بريدك الإلكتروني">
                    </div>
                    <p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.5rem;">
                        سنرسل إليك رابطاً لإعادة تعيين كلمة المرور
                    </p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="action-btn outline" id="cancelReset">إلغاء</button>
                <button class="action-btn" id="sendResetLink">إرسال الرابط</button>
            </div>
        </div>
    `;
    
    showModal(modalHTML);
    
    // إضافة مستمعي الأحداث
    setTimeout(() => {
        const closeBtn = document.getElementById('closeForgotPassword');
        const cancelBtn = document.getElementById('cancelReset');
        const sendBtn = document.getElementById('sendResetLink');
        const resetEmail = document.getElementById('resetEmail');
        
        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);
        
        sendBtn?.addEventListener('click', async () => {
            const email = resetEmail.value.trim();
            
            if (!validateEmail(email)) {
                showToast('يرجى إدخال بريد إلكتروني صحيح', 'error');
                return;
            }
            
            setButtonLoading(sendBtn, true);
            
            try {
                const response = await fakeResetPasswordAPI(email);
                
                if (response.success) {
                    showToast('تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني', 'success');
                    closeModal();
                } else {
                    showToast(response.message || 'حدث خطأ أثناء إرسال الرابط', 'error');
                }
            } catch (error) {
                showToast('حدث خطأ في الاتصال بالخادم', 'error');
            } finally {
                setButtonLoading(sendBtn, false);
            }
        });
    }, 100);
}

// ===== وظائف المساعدة العامة =====

/**
 * تعيين حالة التحميل للأزرار
 */
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `
            <span class="spinner"></span>
            <span>جاري المعالجة...</span>
        `;
        button.classList.add('loading');
    } else {
        button.disabled = false;
        if (button.id === 'loginBtn') {
            button.innerHTML = `
                <span>تسجيل الدخول</span>
                <i class="fas fa-sign-in-alt"></i>
            `;
        } else if (button.id === 'registerBtn') {
            button.innerHTML = `
                <span>إنشاء حساب</span>
                <i class="fas fa-user-plus"></i>
            `;
        } else {
            button.innerHTML = button.getAttribute('data-original-text') || button.textContent;
        }
        button.classList.remove('loading');
    }
}

/**
 * إظهار الإشعارات
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
 * الحصول على لون الإشعار حسب النوع
 */
function getToastColor(type) {
    switch (type) {
        case 'success': return 'var(--success-color)';
        case 'error': return 'var(--danger-color)';
        case 'warning': return 'var(--warning-color)';
        default: return 'var(--info-color)';
    }
}

/**
 * إظهار نافذة منبثقة
 */
function showModal(content) {
    const overlay = document.getElementById('modalOverlay');
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = content;
    
    overlay.appendChild(modalContainer);
    overlay.style.display = 'block';
    
    setTimeout(() => {
        modalContainer.style.opacity = '1';
        modalContainer.style.transform = 'translate(-50%, -50%)';
    }, 10);
}

/**
 * إغلاق النافذة المنبثقة
 */
function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.style.display = 'none';
    overlay.innerHTML = '';
}

// ===== محاكاة APIs (يتم استبدالها بـ APIs حقيقية في الإنتاج) =====

async function fakeLoginAPI(email, password) {
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // بيانات وهمية للمستخدمين
    const users = {
        'client@example.com': {
            password: 'Client@123',
            user: {
                id: 'user_001',
                firstName: 'محمد',
                lastName: 'أحمد',
                email: 'client@example.com',
                phone: '+966501234567',
                type: 'client',
                balance: 1250,
                avatar: null,
                createdAt: '2024-01-01',
                lastLogin: new Date().toISOString()
            }
        },
        'designer@example.com': {
            password: 'Designer@123',
            user: {
                id: 'user_002',
                firstName: 'أحمد',
                lastName: 'المصمم',
                email: 'designer@example.com',
                phone: '+966502345678',
                type: 'designer',
                balance: 5800,
                avatar: 'https://ui-avatars.com/api/?name=أحمد+المصمم&background=005f73&color=fff',
                rating: 4.8,
                skills: ['فوتوشوب', 'Illustrator', 'Figma'],
                createdAt: '2023-11-15',
                lastLogin: new Date().toISOString()
            }
        }
    };
    
    if (users[email] && users[email].password === password) {
        return {
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            data: {
                user: users[email].user,
                token: 'fake_jwt_token_' + Math.random().toString(36).substr(2),
                expiresIn: AUTH_CONFIG.SESSION_TIMEOUT
            }
        };
    }
    
    return {
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
    };
}

async function fakeRegisterAPI(userData) {
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // التحقق من وجود المستخدم مسبقاً
    const existingUsers = ['client@example.com', 'designer@example.com'];
    if (existingUsers.includes(userData.email)) {
        return {
            success: false,
            message: 'البريد الإلكتروني مستخدم مسبقاً'
        };
    }
    
    // إنشاء مستخدم جديد
    const newUser = {
        id: 'user_' + Date.now(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        type: userData.userType,
        balance: userData.userType === 'designer' ? 0 : 500, // هدية ترحيبية
        avatar: null,
        rating: 0,
        skills: [],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };
    
    return {
        success: true,
        message: 'تم إنشاء الحساب بنجاح',
        data: {
            user: newUser,
            token: 'fake_jwt_token_' + Math.random().toString(36).substr(2),
            expiresIn: AUTH_CONFIG.SESSION_TIMEOUT
        }
    };
}

async function fakeSocialLoginAPI(provider) {
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // بيانات مستخدم وهمي من وسائل التواصل الاجتماعي
    const socialUser = {
        id: 'social_' + Date.now(),
        firstName: provider === 'google' ? 'سارة' : 'خالد',
        lastName: provider === 'google' ? 'محمد' : 'سعيد',
        email: `${provider}_user@example.com`,
        type: 'client',
        balance: 250,
        avatar: `https://ui-avatars.com/api/?name=${provider === 'google' ? 'سارة+محمد' : 'خالد+سعيد'}&background=0a9396&color=fff`,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };
    
    return {
        success: true,
        message: `تم تسجيل الدخول باستخدام ${provider === 'google' ? 'Google' : 'Twitter'}`,
        data: {
            user: socialUser,
            token: 'fake_social_token_' + Math.random().toString(36).substr(2),
            expiresIn: AUTH_CONFIG.SESSION_TIMEOUT
        }
    };
}

async function fakeResetPasswordAPI(email) {
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // التحقق من وجود المستخدم
    const existingUsers = ['client@example.com', 'designer@example.com'];
    if (!existingUsers.includes(email)) {
        return {
            success: false,
            message: 'البريد الإلكتروني غير مسجل'
        };
    }
    
    return {
        success: true,
        message: 'تم إرسال رابط إعادة التعيين',
        data: {
            resetToken: 'fake_reset_token_' + Math.random().toString(36).substr(2),
            expiresAt: new Date(Date.now() + 3600000).toISOString() // ساعة واحدة
        }
    };
}

// ===== تصدير الوظائف للاستخدام في ملفات أخرى =====
window.AuthManager = {
    logout,
    getUser: () => authState.user,
    getToken: () => authState.token,
    isAuthenticated: () => authState.isAuthenticated,
    getUserType: () => authState.userType,
    updateUserBalance: (amount) => {
        if (authState.user) {
            authState.user.balance = amount;
            updateUIForUser(authState.user);
            
            // تحديث في التخزين المحلي
            const savedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY);
            if (savedUser) {
                const userData = JSON.parse(savedUser);
                userData.balance = amount;
                localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(userData));
            }
        }
    }
};

// ===== إضافة أنماط CSS للدوران =====
const style = document.createElement('style');
style.textContent = `
    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
        margin-right: 8px;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .auth-btn.loading {
        opacity: 0.8;
        cursor: not-allowed;
    }
    
    .input-with-icon.valid input {
        border-color: var(--success-color) !important;
    }
    
    .input-with-icon.invalid input {
        border-color: var(--danger-color) !important;
    }
    
    .modal {
        opacity: 0;
        transform: translate(-50%, -40%);
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);
