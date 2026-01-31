// ============================================
// نظام الدفع والمعاملات المالية
// ============================================

class PaymentManager {
    constructor() {
        this.walletBalance = 0;
        this.transactions = [];
        this.paymentMethods = [];
        this.subscription = null;
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.updateWalletDisplay();
    }

    loadData() {
        // تحميل البيانات من localStorage
        const storedBalance = localStorage.getItem('pixelArtWalletBalance');
        this.walletBalance = storedBalance ? parseFloat(storedBalance) : 1250;
        
        const storedTransactions = localStorage.getItem('pixelArtTransactions');
        this.transactions = storedTransactions ? JSON.parse(storedTransactions) : this.getSampleTransactions();
        
        const storedMethods = localStorage.getItem('pixelArtPaymentMethods');
        this.paymentMethods = storedMethods ? JSON.parse(storedMethods) : this.getSamplePaymentMethods();
        
        const storedSubscription = localStorage.getItem('pixelArtSubscription');
        this.subscription = storedSubscription ? JSON.parse(storedSubscription) : this.getSampleSubscription();
    }

    saveData() {
        localStorage.setItem('pixelArtWalletBalance', this.walletBalance.toString());
        localStorage.setItem('pixelArtTransactions', JSON.stringify(this.transactions));
        localStorage.setItem('pixelArtPaymentMethods', JSON.stringify(this.paymentMethods));
        localStorage.setItem('pixelArtSubscription', JSON.stringify(this.subscription));
    }

    bindEvents() {
        // إيداع الأموال
        const depositBtn = document.getElementById('depositBtn');
        if (depositBtn) {
            depositBtn.addEventListener('click', () => this.showDepositModal());
        }
        
        // سحب الأموال
        const withdrawBtn = document.getElementById('withdrawBtn');
        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', () => this.showWithdrawModal());
        }
        
        // إضافة طريقة دفع
        const addPaymentMethodBtn = document.getElementById('addPaymentMethod');
        if (addPaymentMethodBtn) {
            addPaymentMethodBtn.addEventListener('click', () => this.showAddPaymentMethodModal());
        }
        
        // فلترة المعاملات
        const transactionFilter = document.getElementById('transactionFilter');
        if (transactionFilter) {
            transactionFilter.addEventListener('change', (e) => this.filterTransactions(e.target.value));
        }
        
        // ترقية الباقة
        const upgradeBtn = document.querySelector('.upgrade-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => this.upgradeSubscription());
        }
        
        // حذف طرق الدفع
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.action-icon.danger');
            if (deleteBtn) {
                const methodCard = deleteBtn.closest('.payment-method-card');
                const methodId = methodCard.dataset.id;
                this.deletePaymentMethod(methodId);
            }
        });
    }

    updateWalletDisplay() {
        // تحديث رصيد المحفظة
        const balanceElement = document.querySelector('.balance-amount .amount');
        if (balanceElement) {
            balanceElement.textContent = `${this.formatCurrency(this.walletBalance)}`;
        }
        
        const userBalanceElement = document.getElementById('userBalance');
        if (userBalanceElement) {
            userBalanceElement.textContent = `${this.formatCurrency(this.walletBalance)}`;
        }
        
        // تحديث الإحصائيات
        this.updateWalletStats();
        
        // تحديث قائمة المعاملات
        this.updateTransactionsList();
        
        // تحديث طرق الدفع
        this.updatePaymentMethods();
    }

    updateWalletStats() {
        const stats = this.calculateWalletStats();
        
        // تحديث إحصائيات المحفظة
        document.querySelectorAll('.wallet-stats-grid .stat-value').forEach((element, index) => {
            switch(index) {
                case 0: // الإيرادات
                    element.textContent = `${this.formatCurrency(stats.revenue)}`;
                    break;
                case 1: // المصروفات
                    element.textContent = `${this.formatCurrency(stats.expenses)}`;
                    break;
                case 2: // قيد الانتظار
                    element.textContent = `${this.formatCurrency(stats.pending)}`;
                    break;
            }
        });
        
        // تحديث إحصائيات الرصيد
        const balanceStats = document.querySelector('.balance-stats');
        if (balanceStats) {
            balanceStats.querySelectorAll('.stat-value').forEach((element, index) => {
                switch(index) {
                    case 0: // المدخرات
                        element.textContent = `${this.formatCurrency(stats.savings)}`;
                        break;
                    case 1: // المصاريف
                        element.textContent = `${this.formatCurrency(stats.expenses)}`;
                        break;
                }
            });
        }
    }

    calculateWalletStats() {
        const today = new Date();
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();
        
        const monthlyTransactions = this.transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        });
        
        const revenue = monthlyTransactions
            .filter(t => t.type === 'deposit' || t.amount > 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const expenses = monthlyTransactions
            .filter(t => t.type === 'payment' || t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const pending = this.transactions
            .filter(t => t.status === 'pending')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        return {
            revenue,
            expenses,
            pending,
            savings: this.walletBalance
        };
    }

    updateTransactionsList(filter = 'all') {
        const transactionsList = document.querySelector('.transactions-list');
        if (!transactionsList) return;
        
        let filteredTransactions = this.transactions;
        
        if (filter !== 'all') {
            filteredTransactions = this.transactions.filter(t => {
                if (filter === 'deposit') return t.amount > 0;
                if (filter === 'withdrawal') return t.type === 'withdrawal';
                if (filter === 'payment') return t.type === 'payment';
                if (filter === 'refund') return t.type === 'refund';
                return true;
            });
        }
        
        // عرض آخر 10 معاملات
        const recentTransactions = filteredTransactions.slice(0, 10);
        
        transactionsList.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item ${transaction.type}">
                <div class="transaction-icon">
                    <i class="fas ${this.getTransactionIcon(transaction.type)}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description}</h4>
                    <span class="transaction-date">${this.formatTransactionDate(transaction.date)}</span>
                </div>
                <div class="transaction-amount">
                    <span class="amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                        ${transaction.amount > 0 ? '+' : ''}${this.formatCurrency(Math.abs(transaction.amount))}
                    </span>
                    <span class="status ${transaction.status}">
                        ${this.getStatusText(transaction.status)}
                    </span>
                </div>
            </div>
        `).join('');
    }

    updatePaymentMethods() {
        const methodsList = document.querySelector('.payment-methods-list');
        if (!methodsList) return;
        
        methodsList.innerHTML = this.paymentMethods.map(method => `
            <div class="payment-method-card ${method.primary ? 'primary' : ''}" data-id="${method.id}">
                <div class="method-header">
                    <div class="method-icon">
                        <i class="${this.getPaymentMethodIcon(method.type)}"></i>
                    </div>
                    <span class="method-type">${this.getPaymentMethodName(method.type)}</span>
                    ${method.primary ? '<span class="badge primary">الافتراضية</span>' : ''}
                </div>
                <div class="method-details">
                    ${method.type === 'card' ? `
                        <span class="card-number">${this.maskCardNumber(method.cardNumber)}</span>
                        <span class="card-expiry">تنتهي في ${method.expiryDate}</span>
                    ` : ''}
                    ${method.type === 'bank' ? `
                        <span class="bank-name">${method.bankName}</span>
                        <span class="account-number">${this.maskAccountNumber(method.accountNumber)}</span>
                    ` : ''}
                </div>
                <div class="method-actions">
                    <button class="action-icon" onclick="paymentManager.setPrimaryMethod('${method.id}')">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="action-icon danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    showDepositModal() {
        const modalContent = document.createElement('div');
        modalContent.className = 'deposit-modal';
        modalContent.innerHTML = `
            <h3>إيداع أموال</h3>
            <div class="deposit-options">
                <div class="deposit-option selected" data-amount="100">
                    <span>100 ريال</span>
                </div>
                <div class="deposit-option" data-amount="250">
                    <span>250 ريال</span>
                </div>
                <div class="deposit-option" data-amount="500">
                    <span>500 ريال</span>
                </div>
                <div class="deposit-option" data-amount="1000">
                    <span>1,000 ريال</span>
                </div>
                <div class="deposit-option custom">
                    <input type="number" placeholder="مبلغ آخر" min="50" max="5000">
                </div>
            </div>
            <div class="payment-methods-deposit">
                <h4>اختر طريقة الدفع</h4>
                ${this.generatePaymentMethodsHTML()}
            </div>
            <div class="deposit-summary">
                <div class="summary-item">
                    <span>المبلغ:</span>
                    <span id="depositAmount">100 ريال</span>
                </div>
                <div class="summary-item">
                    <span>رسوم المعالجة:</span>
                    <span id="processingFee">0 ريال</span>
                </div>
                <div class="summary-item total">
                    <span>المجموع:</span>
                    <span id="depositTotal">100 ريال</span>
                </div>
            </div>
            <div class="modal-actions">
                <button class="action-btn outline cancel-deposit">إلغاء</button>
                <button class="action-btn confirm-deposit">تأكيد الإيداع</button>
            </div>
        `;
        
        this.showModal('إيداع أموال', modalContent);
        
        // إضافة مستمعي الأحداث
        const depositOptions = modalContent.querySelectorAll('.deposit-option');
        let selectedAmount = 100;
        
        depositOptions.forEach(option => {
            option.addEventListener('click', () => {
                depositOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                if (option.classList.contains('custom')) {
                    const input = option.querySelector('input');
                    selectedAmount = parseFloat(input.value) || 0;
                    input.focus();
                } else {
                    selectedAmount = parseFloat(option.dataset.amount);
                }
                
                this.updateDepositSummary(selectedAmount);
            });
        });
        
        // تحديث المبلغ المخصص
        const customInput = modalContent.querySelector('.custom input');
        if (customInput) {
            customInput.addEventListener('input', (e) => {
                selectedAmount = parseFloat(e.target.value) || 0;
                this.updateDepositSummary(selectedAmount);
            });
        }
        
        // إلغاء
        modalContent.querySelector('.cancel-deposit').addEventListener('click', () => {
            this.closeModal();
        });
        
        // تأكيد الإيداع
        modalContent.querySelector('.confirm-deposit').addEventListener('click', () => {
            this.processDeposit(selectedAmount);
        });
    }

    updateDepositSummary(amount) {
        const modal = document.querySelector('.deposit-modal');
        if (!modal) return;
        
        const processingFee = amount * 0.02; // 2% رسوم معالجة
        const total = amount + processingFee;
        
        modal.querySelector('#depositAmount').textContent = `${this.formatCurrency(amount)}`;
        modal.querySelector('#processingFee').textContent = `${this.formatCurrency(processingFee)}`;
        modal.querySelector('#depositTotal').textContent = `${this.formatCurrency(total)}`;
    }

    async processDeposit(amount) {
        if (amount < 50) {
            this.showError('الحد الأدنى للإيداع هو 50 ريال');
            return;
        }
        
        if (amount > 5000) {
            this.showError('الحد الأقصى للإيداع هو 5000 ريال');
            return;
        }
        
        const processingFee = amount * 0.02;
        const total = amount + processingFee;
        
        // محاكاة عملية الدفع
        this.showInfo('جاري معالجة الدفع...');
        
        setTimeout(() => {
            // في الحقيقي، هنا ستكون عملية دفع فعلية
            const success = Math.random() > 0.1; // 90% نجاح
            
            if (success) {
                this.completeDeposit(amount);
                this.closeModal();
            } else {
                this.showError('فشل عملية الدفع، يرجى المحاولة مرة أخرى');
            }
        }, 2000);
    }

    completeDeposit(amount) {
        // إضافة للمحفظة
        this.walletBalance += amount;
        
        // إضافة معاملة
        const transaction = {
            id: Date.now(),
            type: 'deposit',
            amount: amount,
            description: 'إيداع من بطاقة ائتمان',
            date: new Date().toISOString(),
            status: 'completed'
        };
        
        this.transactions.unshift(transaction);
        this.saveData();
        
        // تحديث الواجهة
        this.updateWalletDisplay();
        
        // إشعار
        this.showSuccess(`تم إيداع ${this.formatCurrency(amount)} بنجاح`);
        
        // إشعار للمستخدم
        if (window.chatManager) {
            window.chatManager.showNotification('إيداع ناجح', `تم إضافة ${this.formatCurrency(amount)} إلى محفظتك`);
        }
    }

    showWithdrawModal() {
        const maxWithdraw = this.walletBalance;
        
        const modalContent = document.createElement('div');
        modalContent.className = 'withdraw-modal';
        modalContent.innerHTML = `
            <h3>سحب أموال</h3>
            <div class="withdraw-info">
                <p>الرصيد المتاح للسحب: <strong>${this.formatCurrency(maxWithdraw)}</strong></p>
            </div>
            <div class="form-group">
                <label>المبلغ المطلوب</label>
                <input type="number" id="withdrawAmount" 
                       min="50" max="${maxWithdraw}" 
                       value="${Math.min(500, maxWithdraw)}"
                       placeholder="أدخل المبلغ">
            </div>
            <div class="withdraw-methods">
                <h4>اختر طريقة الاستلام</h4>
                <div class="method-option selected" data-method="bank">
                    <i class="fas fa-university"></i>
                    <span>حساب بنكي</span>
                </div>
                <div class="method-option" data-method="wallet">
                    <i class="fas fa-wallet"></i>
                    <span>محفظة إلكترونية</span>
                </div>
            </div>
            <div class="withdraw-summary">
                <div class="summary-item">
                    <span>المبلغ:</span>
                    <span id="withdrawAmountDisplay">${this.formatCurrency(Math.min(500, maxWithdraw))}</span>
                </div>
                <div class="summary-item">
                    <span>رسوم السحب:</span>
                    <span id="withdrawFee">${this.formatCurrency(5)}</span>
                </div>
                <div class="summary-item total">
                    <span>المستلم:</span>
                    <span id="withdrawNet">${this.formatCurrency(Math.min(500, maxWithdraw) - 5)}</span>
                </div>
            </div>
            <div class="modal-actions">
                <button class="action-btn outline cancel-withdraw">إلغاء</button>
                <button class="action-btn confirm-withdraw">تأكيد السحب</button>
            </div>
        `;
        
        this.showModal('سحب أموال', modalContent);
        
        // إضافة مستمعي الأحداث
        const amountInput = modalContent.querySelector('#withdrawAmount');
        const methodOptions = modalContent.querySelectorAll('.method-option');
        let selectedMethod = 'bank';
        
        amountInput.addEventListener('input', (e) => {
            const amount = parseFloat(e.target.value) || 0;
            this.updateWithdrawSummary(amount);
        });
        
        methodOptions.forEach(option => {
            option.addEventListener('click', () => {
                methodOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedMethod = option.dataset.method;
            });
        });
        
        // إلغاء
        modalContent.querySelector('.cancel-withdraw').addEventListener('click', () => {
            this.closeModal();
        });
        
        // تأكيد السحب
        modalContent.querySelector('.confirm-withdraw').addEventListener('click', () => {
            const amount = parseFloat(amountInput.value) || 0;
            this.processWithdrawal(amount, selectedMethod);
        });
    }

    updateWithdrawSummary(amount) {
        const modal = document.querySelector('.withdraw-modal');
        if (!modal) return;
        
        const fee = 5; // رسوم ثابتة
        const net = amount - fee;
        
        modal.querySelector('#withdrawAmountDisplay').textContent = `${this.formatCurrency(amount)}`;
        modal.querySelector('#withdrawFee').textContent = `${this.formatCurrency(fee)}`;
        modal.querySelector('#withdrawNet').textContent = `${this.formatCurrency(net)}`;
    }

    async processWithdrawal(amount, method) {
        if (amount < 50) {
            this.showError('الحد الأدنى للسحب هو 50 ريال');
            return;
        }
        
        if (amount > this.walletBalance) {
            this.showError('المبلغ المطلوب يتجاوز رصيدك');
            return;
        }
        
        // محاكاة عملية السحب
        this.showInfo('جاري معالجة طلب السحب...');
        
        setTimeout(() => {
            // في الحقيقي، هنا ستكون عملية سحب فعلية
            const success = Math.random() > 0.05; // 95% نجاح
            
            if (success) {
                this.completeWithdrawal(amount, method);
                this.closeModal();
            } else {
                this.showError('فشل عملية السحب، يرجى المحاولة مرة أخرى');
            }
        }, 3000);
    }

    completeWithdrawal(amount, method) {
        // خصم من المحفظة
        this.walletBalance -= amount;
        
        // إضافة معاملة
        const transaction = {
            id: Date.now(),
            type: 'withdrawal',
            amount: -amount,
            description: `سحب إلى ${method === 'bank' ? 'الحساب البنكي' : 'المحفظة الإلكترونية'}`,
            date: new Date().toISOString(),
            status: 'pending' // قيد المعالجة
        };
        
        this.transactions.unshift(transaction);
        this.saveData();
        
        // تحديث الواجهة
        this.updateWalletDisplay();
        
        // إشعار
        this.showSuccess(`تم تقديم طلب سحب ${this.formatCurrency(amount)} بنجاح`);
        this.showInfo('سوف يتم تحويل المبلغ خلال 1-3 أيام عمل');
    }

    showAddPaymentMethodModal() {
        const modalContent = document.createElement('div');
        modalContent.className = 'add-method-modal';
        modalContent.innerHTML = `
            <h3>إضافة طريقة دفع جديدة</h3>
            <div class="method-types">
                <div class="method-type selected" data-type="card">
                    <i class="fab fa-cc-visa"></i>
                    <span>بطاقة ائتمان</span>
                </div>
                <div class="method-type" data-type="bank">
                    <i class="fas fa-university"></i>
                    <span>حساب بنكي</span>
                </div>
            </div>
            <form id="paymentMethodForm">
                <div class="form-group card-fields">
                    <label>رقم البطاقة</label>
                    <input type="text" placeholder="1234 5678 9012 3456" maxlength="19">
                </div>
                <div class="form-row">
                    <div class="form-group card-fields">
                        <label>تاريخ الانتهاء</label>
                        <input type="text" placeholder="MM/YY" maxlength="5">
                    </div>
                    <div class="form-group card-fields">
                        <label>رمز CVV</label>
                        <input type="text" placeholder="123" maxlength="3">
                    </div>
                </div>
                <div class="form-group bank-fields" style="display: none;">
                    <label>اسم البنك</label>
                    <input type="text" placeholder="البنك الأهلي السعودي">
                </div>
                <div class="form-group bank-fields" style="display: none;">
                    <label>رقم الحساب</label>
                    <input type="text" placeholder="1234567890">
                </div>
                <div class="form-group bank-fields" style="display: none;">
                    <label>رقم الآيبان</label>
                    <input type="text" placeholder="SA12345678901234567890">
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="setAsPrimary">
                        <span>تعيين كطريقة دفع افتراضية</span>
                    </label>
                </div>
            </form>
            <div class="modal-actions">
                <button class="action-btn outline cancel-add">إلغاء</button>
                <button class="action-btn confirm-add">إضافة</button>
            </div>
        `;
        
        this.showModal('إضافة طريقة دفع', modalContent);
        
        // تبديل نوع طريقة الدفع
        const methodTypes = modalContent.querySelectorAll('.method-type');
        let selectedType = 'card';
        
        methodTypes.forEach(type => {
            type.addEventListener('click', () => {
                methodTypes.forEach(t => t.classList.remove('selected'));
                type.classList.add('selected');
                selectedType = type.dataset.type;
                
                // إظهار/إخفاء الحقول المناسبة
                modalContent.querySelectorAll('.card-fields, .bank-fields').forEach(field => {
                    field.style.display = 'none';
                });
                
                if (selectedType === 'card') {
                    modalContent.querySelectorAll('.card-fields').forEach(field => {
                        field.style.display = 'block';
                    });
                } else {
                    modalContent.querySelectorAll('.bank-fields').forEach(field => {
                        field.style.display = 'block';
                    });
                }
            });
        });
        
        // تنسيق رقم البطاقة
        const cardNumberInput = modalContent.querySelector('input[placeholder*="بطاقة"]');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                let formatted = '';
                
                for (let i = 0; i < value.length; i++) {
                    if (i > 0 && i % 4 === 0) {
                        formatted += ' ';
                    }
                    formatted += value[i];
                }
                
                e.target.value = formatted.substring(0, 19);
            });
        }
        
        // تنسيق تاريخ الانتهاء
        const expiryInput = modalContent.querySelector('input[placeholder="MM/YY"]');
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                
                e.target.value = value.substring(0, 5);
            });
        }
        
        // إلغاء
        modalContent.querySelector('.cancel-add').addEventListener('click', () => {
            this.closeModal();
        });
        
        // تأكيد الإضافة
        modalContent.querySelector('.confirm-add').addEventListener('click', () => {
            this.addPaymentMethod(selectedType);
        });
    }

    async addPaymentMethod(type) {
        const modal = document.querySelector('.add-method-modal');
        const form = modal?.querySelector('#paymentMethodForm');
        
        if (!form) return;
        
        let methodData;
        
        if (type === 'card') {
            const cardNumber = form.querySelector('input[placeholder*="بطاقة"]').value;
            const expiry = form.querySelector('input[placeholder="MM/YY"]').value;
            const cvv = form.querySelector('input[placeholder="123"]').value;
            
            if (!this.validateCard(cardNumber, expiry, cvv)) {
                return;
            }
            
            methodData = {
                type: 'card',
                cardNumber: cardNumber.replace(/\s/g, ''),
                expiryDate: expiry,
                cardType: this.detectCardType(cardNumber)
            };
        } else {
            const bankName = form.querySelector('input[placeholder*="بنك"]').value;
            const accountNumber = form.querySelector('input[placeholder*="حساب"]').value;
            const iban = form.querySelector('input[placeholder*="آيبان"]').value;
            
            if (!bankName || !accountNumber) {
                this.showError('يرجى ملء جميع الحقول المطلوبة');
                return;
            }
            
            methodData = {
                type: 'bank',
                bankName,
                accountNumber,
                iban: iban || null
            };
        }
        
        const setAsPrimary = form.querySelector('#setAsPrimary').checked;
        
        // إضافة طريقة الدفع
        const newMethod = {
            id: Date.now(),
            ...methodData,
            primary: setAsPrimary || this.paymentMethods.length === 0,
            addedDate: new Date().toISOString()
        };
        
        // إذا تم تعيينها كافتراضية، إلغاء افتراضية الآخرين
        if (newMethod.primary) {
            this.paymentMethods.forEach(method => {
                method.primary = false;
            });
        }
        
        this.paymentMethods.push(newMethod);
        this.saveData();
        
        // إغلاق النافذة
        this.closeModal();
        
        // تحديث الواجهة
        this.updatePaymentMethods();
        
        // إشعار
        this.showSuccess('تمت إضافة طريقة الدفع بنجاح');
    }

    validateCard(cardNumber, expiry, cvv) {
        // التحقق من رقم البطاقة
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        if (cleanCardNumber.length < 16) {
            this.showError('رقم البطاقة غير صالح');
            return false;
        }
        
        // التحقق من تاريخ الانتهاء
        const [month, year] = expiry.split('/');
        if (!month || !year || month.length !== 2 || year.length !== 2) {
            this.showError('تاريخ الانتهاء غير صالح');
            return false;
        }
        
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        
        if (parseInt(year) < currentYear || 
            (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            this.showError('البطاقة منتهية الصلاحية');
            return false;
        }
        
        // التحقق من CVV
        if (cvv.length !== 3) {
            this.showError('رمز CVV غير صالح');
            return false;
        }
        
        return true;
    }

    detectCardType(cardNumber) {
        const cleanNumber = cardNumber.replace(/\s/g, '');
        
        if (/^4/.test(cleanNumber)) return 'visa';
        if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
        if (/^3[47]/.test(cleanNumber)) return 'amex';
        
        return 'unknown';
    }

    setPrimaryMethod(methodId) {
        this.paymentMethods.forEach(method => {
            method.primary = method.id === parseInt(methodId);
        });
        
        this.saveData();
        this.updatePaymentMethods();
        this.showSuccess('تم تحديث طريقة الدفع الافتراضية');
    }

    deletePaymentMethod(methodId) {
        const method = this.paymentMethods.find(m => m.id === parseInt(methodId));
        if (!method) return;
        
        if (method.primary && this.paymentMethods.length > 1) {
            this.showError('لا يمكن حذف طريقة الدفع الافتراضية');
            return;
        }
        
        if (confirm('هل أنت متأكد من حذف طريقة الدفع هذه؟')) {
            this.paymentMethods = this.paymentMethods.filter(m => m.id !== parseInt(methodId));
            this.saveData();
            this.updatePaymentMethods();
            this.showSuccess('تم حذف طريقة الدفع');
        }
    }

    async upgradeSubscription() {
        const modalContent = document.createElement('div');
        modalContent.className = 'upgrade-modal';
        modalContent.innerHTML = `
            <h3>ترقية إلى الباقة المميزة</h3>
            <div class="subscription-plans">
                <div class="plan selected" data-plan="monthly">
                    <div class="plan-header">
                        <h4>شهري</h4>
                        <div class="plan-price">
                            <span class="amount">49 ريال</span>
                            <span class="period">/شهر</span>
                        </div>
                    </div>
                    <ul class="plan-features">
                        <li><i class="fas fa-check"></i> تصميمات غير محدودة</li>
                        <li><i class="fas fa-check"></i> أدوات متقدمة</li>
                        <li><i class="fas fa-check"></i> دعم فني مميز</li>
                        <li><i class="fas fa-check"></i> خصم 20% على جميع المشاريع</li>
                    </ul>
                </div>
                <div class="plan" data-plan="yearly">
                    <div class="plan-header">
                        <h4>سنوي</h4>
                        <div class="plan-price">
                            <span class="amount">490 ريال</span>
                            <span class="period">/سنة</span>
                        </div>
                        <span class="badge">وفر 20%</span>
                    </div>
                    <ul class="plan-features">
                        <li><i class="fas fa-check"></i> جميع مزايا الباقة الشهرية</li>
                        <li><i class="fas fa-check"></i> شهرين مجاناً</li>
                        <li><i class="fas fa-check"></i> أولوية في الدعم</li>
                        <li><i class="fas fa-check"></i> هدايا حصرية</li>
                    </ul>
                </div>
            </div>
            <div class="upgrade-summary">
                <div class="summary-item">
                    <span>الباقة المختارة:</span>
                    <span id="selectedPlan">شهري</span>
                </div>
                <div class="summary-item">
                    <span>السعر:</span>
                    <span id="planPrice">49 ريال</span>
                </div>
                <div class="summary-item total">
                    <span>المجموع:</span>
                    <span id="planTotal">49 ريال</span>
                </div>
            </div>
            <div class="modal-actions">
                <button class="action-btn outline cancel-upgrade">إلغاء</button>
                <button class="action-btn confirm-upgrade">ترقية الآن</button>
            </div>
        `;
        
        this.showModal('ترقية الباقة', modalContent);
        
        // اختيار الباقة
        const plans = modalContent.querySelectorAll('.plan');
        let selectedPlan = 'monthly';
        let selectedPrice = 49;
        
        plans.forEach(plan => {
            plan.addEventListener('click', () => {
                plans.forEach(p => p.classList.remove('selected'));
                plan.classList.add('selected');
                
                selectedPlan = plan.dataset.plan;
                selectedPrice = plan.dataset.plan === 'monthly' ? 49 : 490;
                
                modalContent.querySelector('#selectedPlan').textContent = 
                    selectedPlan === 'monthly' ? 'شهري' : 'سنوي';
                modalContent.querySelector('#planPrice').textContent = 
                    `${this.formatCurrency(selectedPrice)}`;
                modalContent.querySelector('#planTotal').textContent = 
                    `${this.formatCurrency(selectedPrice)}`;
            });
        });
        
        // إلغاء
        modalContent.querySelector('.cancel-upgrade').addEventListener('click', () => {
            this.closeModal();
        });
        
        // تأكيد الترقية
        modalContent.querySelector('.confirm-upgrade').addEventListener('click', () => {
            this.processSubscriptionUpgrade(selectedPlan, selectedPrice);
        });
    }

    async processSubscriptionUpgrade(plan, price) {
        if (this.walletBalance < price) {
            this.showError('رصيدك غير كافٍ للترقية');
            return;
        }
        
        // محاكاة عملية الشراء
        this.showInfo('جاري معالجة الترقية...');
        
        setTimeout(() => {
            this.completeSubscriptionUpgrade(plan, price);
            this.closeModal();
        }, 2000);
    }

    completeSubscriptionUpgrade(plan, price) {
        // خصم السعر من المحفظة
        this.walletBalance -= price;
        
        // تحديث الباقة
        this.subscription = {
            plan,
            price,
            startDate: new Date().toISOString(),
            endDate: plan === 'monthly' 
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active'
        };
        
        // إضافة معاملة
        const transaction = {
            id: Date.now(),
            type: 'subscription',
            amount: -price,
            description: `ترقية إلى الباقة ${plan === 'monthly' ? 'الشهرية' : 'السنوية'}`,
            date: new Date().toISOString(),
            status: 'completed'
        };
        
        this.transactions.unshift(transaction);
        this.saveData();
        
        // تحديث الواجهة
        this.updateWalletDisplay();
        
        // تحديث الواجهة للباقة المميزة
        this.updatePremiumFeatures();
        
        // إشعار
        this.showSuccess('تمت الترقية بنجاح!');
        
        // إشعار للمستخدم
        if (window.chatManager) {
            window.chatManager.showNotification(
                'ترقية ناجحة', 
                `تم تفعيل الباقة ${plan === 'monthly' ? 'الشهرية' : 'السنوية'} المميزة`
            );
        }
    }

    updatePremiumFeatures() {
        // إضافة شارة Pro
        const upgradeBtn = document.querySelector('.upgrade-btn');
        if (upgradeBtn) {
            upgradeBtn.textContent = 'الباقة المميزة مفعلة';
            upgradeBtn.disabled = true;
        }
        
        // تحديث القائمة الجانبية
        const premiumBadges = document.querySelectorAll('.nav-badge.premium');
        premiumBadges.forEach(badge => {
            badge.textContent = 'Pro';
            badge.style.backgroundColor = '#ee9b00';
        });
    }

    filterTransactions(filter) {
        this.updateTransactionsList(filter);
    }

    generatePaymentMethodsHTML() {
        return this.paymentMethods.map(method => `
            <div class="payment-option ${method.primary ? 'selected' : ''}" data-id="${method.id}">
                <i class="${this.getPaymentMethodIcon(method.type)}"></i>
                <span>${this.getPaymentMethodName(method.type)}</span>
                ${method.primary ? '<small>الافتراضية</small>' : ''}
            </div>
        `).join('');
    }

    getPaymentMethodIcon(type) {
        const icons = {
            card: 'fab fa-cc-visa',
            bank: 'fas fa-university',
            wallet: 'fas fa-wallet'
        };
        return icons[type] || 'fas fa-credit-card';
    }

    getPaymentMethodName(type) {
        const names = {
            card: 'بطاقة ائتمان',
            bank: 'حساب بنكي',
            wallet: 'محفظة إلكترونية'
        };
        return names[type] || type;
    }

    getTransactionIcon(type) {
        const icons = {
            deposit: 'fa-arrow-down',
            withdrawal: 'fa-arrow-up',
            payment: 'fa-shopping-cart',
            refund: 'fa-undo',
            subscription: 'fa-crown'
        };
        return icons[type] || 'fa-exchange-alt';
    }

    getStatusText(status) {
        const statusMap = {
            completed: 'مكتمل',
            pending: 'قيد المعالجة',
            failed: 'فشل',
            refunded: 'تم الاسترداد'
        };
        return statusMap[status] || status;
    }

    formatTransactionDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = (now - date) / (1000 * 60 * 60);
        
        if (diffHours < 1) {
            const diffMinutes = Math.floor(diffHours * 60);
            return `منذ ${diffMinutes} دقيقة`;
        } else if (diffHours < 24) {
            return `منذ ${Math.floor(diffHours)} ساعة`;
        } else {
            return date.toLocaleDateString('ar-SA');
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    maskCardNumber(cardNumber) {
        return '•••• •••• •••• ' + cardNumber.slice(-4);
    }

    maskAccountNumber(accountNumber) {
        return '•••• ' + accountNumber.slice(-4);
    }

    getSampleTransactions() {
        return [
            {
                id: 1,
                type: 'deposit',
                amount: 500,
                description: 'إيداع من بطاقة ائتمان',
                date: '2024-02-18T10:30:00Z',
                status: 'completed'
            },
            {
                id: 2,
                type: 'payment',
                amount: -800,
                description: 'دفع لمشروع تصميم شعار',
                date: '2024-02-17T14:45:00Z',
                status: 'completed'
            },
            {
                id: 3,
                type: 'refund',
                amount: 450,
                description: 'استرداد مبلغ مشروع ملغى',
                date: '2024-02-15T11:20:00Z',
                status: 'completed'
            },
            {
                id: 4,
                type: 'withdrawal',
                amount: -1000,
                description: 'سحب مبلغ إلى الحساب البنكي',
                date: '2024-02-14T15:15:00Z',
                status: 'pending'
            },
            {
                id: 5,
                type: 'deposit',
                amount: 100,
                description: 'مكافأة ولاء العميل',
                date: '2024-02-12T09:00:00Z',
                status: 'completed'
            }
        ];
    }

    getSamplePaymentMethods() {
        return [
            {
                id: 1,
                type: 'card',
                cardNumber: '4242424242424242',
                expiryDate: '06/2025',
                cardType: 'visa',
                primary: true,
                addedDate: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                type: 'bank',
                bankName: 'البنك الأهلي السعودي',
                accountNumber: '1234567890',
                iban: 'SA12345678901234567890',
                primary: false,
                addedDate: '2024-02-01T14:20:00Z'
            }
        ];
    }

    getSampleSubscription() {
        return {
            plan: 'free',
            price: 0,
            startDate: null,
            endDate: null,
            status: 'inactive'
        };
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

// تهيئة مدير الدفع
document.addEventListener('DOMContentLoaded', () => {
    window.paymentManager = new PaymentManager();
});
