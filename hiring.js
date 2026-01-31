// ============================================
// نظام التوظيف وإدارة المصممين
// ============================================

class HiringManager {
    constructor() {
        this.designers = [];
        this.hiringRequests = [];
        this.contracts = [];
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.updateDesignersList();
    }

    loadData() {
        const storedDesigners = localStorage.getItem('pixelArtHiringDesigners');
        this.designers = storedDesigners ? JSON.parse(storedDesigners) : this.getSampleDesigners();
        
        const storedRequests = localStorage.getItem('pixelArtHiringRequests');
        this.hiringRequests = storedRequests ? JSON.parse(storedRequests) : [];
        
        const storedContracts = localStorage.getItem('pixelArtContracts');
        this.contracts = storedContracts ? JSON.parse(storedContracts) : [];
    }

    saveData() {
        localStorage.setItem('pixelArtHiringDesigners', JSON.stringify(this.designers));
        localStorage.setItem('pixelArtHiringRequests', JSON.stringify(this.hiringRequests));
        localStorage.setItem('pixelArtContracts', JSON.stringify(this.contracts));
    }

    bindEvents() {
        // البحث عن مصممين
        const searchInput = document.querySelector('.designers-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchDesigners(e.target.value));
        }
        
        // فرز المصممين
        const sortSelect = document.getElementById('sortDesigners');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.sortDesigners(e.target.value));
        }
        
        // فلترة المصممين
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.addEventListener('click', (e) => this.filterDesigners(e));
        });
        
        // توظيف مصمم
        document.addEventListener('click', (e) => {
            const hireBtn = e.target.closest('.hire-btn');
            if (hireBtn) {
                const designerId = parseInt(hireBtn.dataset.id || hireBtn.closest('.designer-card').dataset.id);
                this.hireDesigner(designerId);
            }
        });
    }

    updateDesignersList() {
        const designersGrid = document.querySelector('.designers-grid');
        if (!designersGrid) return;
        
        designersGrid.innerHTML = this.designers.map(designer => `
            <div class="designer-card" data-id="${designer.id}">
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
                                ${this.generateStars(designer.rating)}
                            </div>
                            <span class="rating-value">${designer.rating} (${designer.reviews} تقييم)</span>
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
                    ${designer.skills.map(skill => `
                        <span class="skill-tag">${skill}</span>
                    `).join('')}
                </div>
                <div class="designer-footer">
                    <div class="price-range">
                        <span>يبدأ من</span>
                        <span class="price">${designer.price} ريال</span>
                    </div>
                    <button class="action-btn small hire-btn" data-id="${designer.id}">
                        <i class="fas fa-briefcase"></i>
                        توظيف
                    </button>
                </div>
            </div>
        `).join('');
    }

    searchDesigners(query) {
        if (!query.trim()) {
            this.updateDesignersList();
            return;
        }
        
        const filtered = this.designers.filter(designer => 
            designer.name.includes(query) || 
            designer.title.includes(query) ||
            designer.skills.some(skill => skill.includes(query))
        );
        
        this.displayFilteredDesigners(filtered);
    }

    sortDesigners(criteria) {
        let sortedDesigners = [...this.designers];
        
        switch(criteria) {
            case 'rating':
                sortedDesigners.sort((a, b) => b.rating - a.rating);
                break;
            case 'projects':
                sortedDesigners.sort((a, b) => b.projects - a.projects);
                break;
            case 'price':
                sortedDesigners.sort((a, b) => a.price - b.price);
                break;
            case 'recent':
                sortedDesigners.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
                break;
        }
        
        this.displayFilteredDesigners(sortedDesigners);
    }

    filterDesigners(e) {
        const tag = e.currentTarget;
        const filter = tag.textContent;
        
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        
        if (filter === 'الجميع') {
            this.updateDesignersList();
            return;
        }
        
        const filtered = this.designers.filter(designer => 
            designer.skills.some(skill => 
                skill.toLowerCase().includes(filter.toLowerCase())
            ) || designer.title.includes(filter)
        );
        
        this.displayFilteredDesigners(filtered);
    }

    displayFilteredDesigners(designers) {
        const designersGrid = document.querySelector('.designers-grid');
        if (!designersGrid) return;
        
        if (designers.length === 0) {
            designersGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>لا توجد نتائج</h3>
                    <p>لم يتم العثور على مصممين مطابقين للبحث</p>
                </div>
            `;
            return;
        }
        
        designersGrid.innerHTML = designers.map(designer => `
            <div class="designer-card" data-id="${designer.id}">
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
                                ${this.generateStars(designer.rating)}
                            </div>
                            <span class="rating-value">${designer.rating} (${designer.reviews} تقييم)</span>
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
                    ${designer.skills.slice(0, 4).map(skill => `
                        <span class="skill-tag">${skill}</span>
                    `).join('')}
                </div>
                <div class="designer-footer">
                    <div class="price-range">
                        <span>يبدأ من</span>
                        <span class="price">${designer.price} ريال</span>
                    </div>
                    <button class="action-btn small hire-btn" data-id="${designer.id}">
                        <i class="fas fa-briefcase"></i>
                        توظيف
                    </button>
                </div>
            </div>
        `).join('');
    }

    async hireDesigner(designerId) {
        const designer = this.designers.find(d => d.id === designerId);
        if (!designer) return;
        
        // عرض نموذج التوظيف
        const modalContent = document.createElement('div');
        modalContent.className = 'hire-modal';
        modalContent.innerHTML = `
            <h3>توظيف ${designer.name}</h3>
            <div class="designer-preview">
                <img src="${designer.avatar}" alt="${designer.name}">
                <div class="designer-info">
                    <h4>${designer.name}</h4>
                    <span>${designer.title}</span>
                    <div class="rating">${designer.rating} ⭐</div>
                </div>
            </div>
            <form id="hireForm">
                <div class="form-group">
                    <label>نوع المشروع</label>
                    <select id="projectType">
                        <option value="logo">تصميم شعار</option>
                        <option value="ad">تصميم إعلان</option>
                        <option value="brochure">بروشور</option>
                        <option value="branding">هوية بصرية</option>
                        <option value="website">تصميم موقع</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>مدة المشروع (أيام)</label>
                    <input type="number" id="projectDuration" min="1" max="90" value="7">
                </div>
                <div class="form-group">
                    <label>الميزانية المقترحة</label>
                    <div class="budget-range">
                        <input type="range" id="budgetSlider" 
                               min="${designer.price}" 
                               max="${designer.price * 5}" 
                               step="100" 
                               value="${designer.price * 2}">
                        <div class="range-labels">
                            <span>${designer.price} ريال</span>
                            <span id="currentBudget">${designer.price * 2} ريال</span>
                            <span>${designer.price * 5} ريال</span>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>تفاصيل المشروع</label>
                    <textarea id="projectDetails" rows="4" placeholder="صف مشروعك بالتفصيل..."></textarea>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="agreement" required>
                        <span>أوافق على <a href="#">شروط التوظيف</a></span>
                    </label>
                </div>
            </form>
            <div class="hire-summary">
                <div class="summary-item">
                    <span>سعر المصمم:</span>
                    <span>${designer.price} ريال</span>
                </div>
                <div class="summary-item">
                    <span>رسوم المنصة:</span>
                    <span id="platformFee">50 ريال</span>
                </div>
                <div class="summary-item total">
                    <span>المجموع:</span>
                    <span id="totalCost">${designer.price + 50} ريال</span>
                </div>
            </div>
            <div class="modal-actions">
                <button class="action-btn outline cancel-hire">إلغاء</button>
                <button class="action-btn confirm-hire">تأكيد التوظيف</button>
            </div>
        `;
        
        this.showModal(`توظيف ${designer.name}`, modalContent);
        
        // تحديث السعر
        const budgetSlider = modalContent.querySelector('#budgetSlider');
        const currentBudget = modalContent.querySelector('#currentBudget');
        const totalCost = modalContent.querySelector('#totalCost');
        
        budgetSlider.addEventListener('input', (e) => {
            const budget = parseInt(e.target.value);
            currentBudget.textContent = `${budget} ريال`;
            
            const platformFee = 50;
            totalCost.textContent = `${budget + platformFee} ريال`;
        });
        
        // إلغاء
        modalContent.querySelector('.cancel-hire').addEventListener('click', () => {
            this.closeModal();
        });
        
        // تأكيد التوظيف
        modalContent.querySelector('.confirm-hire').addEventListener('click', () => {
            this.processHiring(designer, modalContent);
        });
    }

    async processHiring(designer, modalContent) {
        const form = modalContent.querySelector('#hireForm');
        const projectType = form.querySelector('#projectType').value;
        const duration = form.querySelector('#projectDuration').value;
        const budget = parseInt(form.querySelector('#budgetSlider').value);
        const details = form.querySelector('#projectDetails').value;
        const agreement = form.querySelector('#agreement').checked;
        
        if (!agreement) {
            this.showError('يجب الموافقة على شروط التوظيف');
            return;
        }
        
        if (!details.trim()) {
            this.showError('يرجى إضافة تفاصيل المشروع');
            return;
        }
        
        // التحقق من الرصيد
        if (window.paymentManager) {
            const totalCost = budget + 50; // الميزانية + رسوم المنصة
            
            if (window.paymentManager.walletBalance < totalCost) {
                this.showError('رصيدك غير كافٍ لتوظيف المصمم');
                return;
            }
        }
        
        // محاكاة عملية التوظيف
        this.showInfo('جاري إرسال طلب التوظيف...');
        
        setTimeout(() => {
            this.completeHiring(designer, {
                projectType,
                duration,
                budget,
                details
            });
            
            this.closeModal();
        }, 2000);
    }

    completeHiring(designer, projectData) {
        // إنشاء طلب توظيف
        const hiringRequest = {
            id: Date.now(),
            designerId: designer.id,
            designerName: designer.name,
            ...projectData,
            status: 'pending',
            date: new Date().toISOString()
        };
        
        this.hiringRequests.unshift(hiringRequest);
        
        // خصم المبلغ من المحفظة
        if (window.paymentManager) {
            const totalCost = projectData.budget + 50;
            
            // معاملة الدفع
            const transaction = {
                id: Date.now(),
                type: 'payment',
                amount: -totalCost,
                description: `توظيف ${designer.name} - ${projectData.projectType}`,
                date: new Date().toISOString(),
                status: 'completed'
            };
            
            window.paymentManager.transactions.unshift(transaction);
            window.paymentManager.walletBalance -= totalCost;
            window.paymentManager.saveData();
            window.paymentManager.updateWalletDisplay();
        }
        
        // إنشاء عقد
        const contract = {
            id: Date.now(),
            ...hiringRequest,
            contractDate: new Date().toISOString(),
            endDate: new Date(Date.now() + projectData.duration * 24 * 60 * 60 * 1000).toISOString()
        };
        
        this.contracts.push(contract);
        this.saveData();
        
        // إشعار
        this.showSuccess(`تم توظيف ${designer.name} بنجاح!`);
        
        // إشعار للمصمم (محاكاة)
        if (window.chatManager) {
            window.chatManager.showNotification(
                'طلب توظيف جديد',
                `تم توظيفك من قبل عميل جديد: ${projectData.projectType}`
            );
        }
        
        // تحديث عدد مشاريع المصمم
        const designerIndex = this.designers.findIndex(d => d.id === designer.id);
        if (designerIndex !== -1) {
            this.designers[designerIndex].projects += 1;
            this.saveData();
            this.updateDesignersList();
        }
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (halfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

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
                online: true,
                avatar: 'https://ui-avatars.com/api/?name=أحمد+علي&background=005f73&color=fff&size=100',
                joinedDate: '2021-05-15'
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
                online: false,
                avatar: 'https://ui-avatars.com/api/?name=سارة+محمد&background=9a031e&color=fff&size=100',
                joinedDate: '2022-07-20'
            },
            {
                id: 3,
                name: 'خالد سعيد',
                title: 'مصمم ومونتير فيديو',
                rating: 5.0,
                reviews: 203,
                projects: 312,
                satisfaction: 99,
                experience: 5,
                skills: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Motion Graphics'],
                price: 500,
                online: true,
                avatar: 'https://ui-avatars.com/api/?name=خالد+سعيد&background=bb3e03&color=fff&size=100',
                joinedDate: '2019-03-10'
            },
            {
                id: 4,
                name: 'نور أحمد',
                title: 'مصممة أزياء وملابس',
                rating: 4.7,
                reviews: 156,
                projects: 189,
                satisfaction: 97,
                experience: 4,
                skills: ['Clo3D', 'Illustrator', 'Photoshop', 'Pattern Making'],
                price: 300,
                online: true,
                avatar: 'https://ui-avatars.com/api/?name=نور+أحمد&background=ae2012&color=fff&size=100',
                joinedDate: '2020-09-05'
            }
        ];
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

// تهيئة مدير التوظيف
document.addEventListener('DOMContentLoaded', () => {
    window.hiringManager = new HiringManager();
});
