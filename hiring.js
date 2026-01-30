// نظام إدارة التوظيف المتقدم لبيكسل آرت

class HiringManager {
    constructor() {
        this.currentJob = null;
        this.applications = [];
        this.designers = [];
        this.interviews = [];
        this.categories = [
            { id: 'graphic', name: 'تصميم جرافيك', icon: 'fas fa-paint-brush' },
            { id: 'uiux', name: 'تصميم واجهات', icon: 'fas fa-laptop' },
            { id: 'motion', name: 'موشن جرافيك', icon: 'fas fa-film' },
            { id: 'illustration', name: 'رسم توضيحي', icon: 'fas fa-pencil-alt' },
            { id: 'branding', name: 'هوية بصرية', icon: 'fas fa-trademark' },
            { id: 'print', name: 'تصميم مطبوعات', icon: 'fas fa-print' },
            { id: 'web', name: 'تصميم ويب', icon: 'fas fa-globe' },
            { id: 'social', name: 'تصاميم وسائل تواصل', icon: 'fas fa-share-alt' }
        ];
        
        this.experienceLevels = [
            { id: 'junior', name: 'مبتدئ (0-2 سنة)', min: 0, max: 2 },
            { id: 'mid', name: 'متوسط (2-5 سنوات)', min: 2, max: 5 },
            { id: 'senior', name: 'محترف (5+ سنوات)', min: 5, max: 20 },
            { id: 'expert', name: 'خبير (10+ سنوات)', min: 10, max: 30 }
        ];
        
        this.salaryRanges = [
            { id: 'range1', name: '3,000 - 6,000 ريال', min: 3000, max: 6000 },
            { id: 'range2', name: '6,000 - 10,000 ريال', min: 6000, max: 10000 },
            { id: 'range3', name: '10,000 - 15,000 ريال', min: 10000, max: 15000 },
            { id: 'range4', name: '15,000 - 25,000 ريال', min: 15000, max: 25000 },
            { id: 'range5', name: '25,000+ ريال', min: 25000, max: 100000 }
        ];
    }
    
    async init() {
        // تحميل المصممين المتاحين
        await this.loadDesigners();
        
        // تحميل طلبات التوظيف
        await this.loadJobRequests();
        
        // تحميل التقديمات
        await this.loadApplications();
        
        // تحميل المقابلات
        await this.loadInterviews();
        
        // تهيئة الأحداث
        this.initEvents();
        
        // بدء التحديث التلقائي
        this.startAutoUpdate();
    }
    
    async loadDesigners() {
        try {
            const users = await window.db.getUsersByRole('designer');
            
            this.designers = users.map(user => ({
                ...user,
                rating: user.rating || 0,
                completedProjects: Math.floor(Math.random() * 50) + 5,
                hourlyRate: user.hourlyRate || Math.floor(Math.random() * 100) + 50,
                availability: Math.random() > 0.5 ? 'available' : 'busy',
                skills: ['graphic', 'logo', 'branding'].slice(0, Math.floor(Math.random() * 3) + 1)
            }));
            
            this.displayDesigners();
            
        } catch (error) {
            console.error('فشل تحميل المصممين:', error);
        }
    }
    
    displayDesigners(filter = {}) {
        const container = document.getElementById('designersContainer');
        if (!container) return;
        
        let filteredDesigners = this.designers;
        
        // تطبيق الفلاتر
        if (filter.category) {
            filteredDesigners = filteredDesigners.filter(designer => 
                designer.skills?.includes(filter.category)
            );
        }
        
        if (filter.experience) {
            const level = this.experienceLevels.find(l => l.id === filter.experience);
            if (level) {
                filteredDesigners = filteredDesigners.filter(designer => {
                    const exp = designer.experience || 0;
                    return exp >= level.min && exp <= level.max;
                });
            }
        }
        
        if (filter.rating) {
            filteredDesigners = filteredDesigners.filter(designer => 
                designer.rating >= parseFloat(filter.rating)
            );
        }
        
        if (filter.availability) {
            filteredDesigners = filteredDesigners.filter(designer => 
                designer.availability === filter.availability
            );
        }
        
        if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            filteredDesigners = filteredDesigners.filter(designer => 
                designer.name?.toLowerCase().includes(searchTerm) ||
                designer.email?.toLowerCase().includes(searchTerm) ||
                designer.skills?.some(skill => skill.toLowerCase().includes(searchTerm))
            );
        }
        
        // الفرز
        if (filter.sort) {
            switch (filter.sort) {
                case 'rating':
                    filteredDesigners.sort((a, b) => b.rating - a.rating);
                    break;
                case 'experience':
                    filteredDesigners.sort((a, b) => (b.experience || 0) - (a.experience || 0));
                    break;
                case 'rate':
                    filteredDesigners.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
                    break;
                case 'projects':
                    filteredDesigners.sort((a, b) => (b.completedProjects || 0) - (a.completedProjects || 0));
                    break;
            }
        }
        
        let html = '';
        
        filteredDesigners.forEach(designer => {
            const skills = designer.skills?.map(skill => 
                `<span class="skill-badge">${this.getCategoryName(skill)}</span>`
            ).join('');
            
            html += `
                <div class="designer-card" data-designer-id="${designer.id}">
                    <div class="designer-header">
                        <img src="${designer.avatar}" alt="${designer.name}" class="designer-avatar">
                        <div class="designer-info">
                            <h5>${designer.name}</h5>
                            <div class="designer-rating">
                                <span class="stars">${this.generateStars(designer.rating)}</span>
                                <span class="rating-value">${designer.rating.toFixed(1)}</span>
                                <span class="projects-count">(${designer.completedProjects} مشروع)</span>
                            </div>
                            <div class="designer-status ${designer.availability}">
                                <i class="fas fa-circle"></i>
                                ${designer.availability === 'available' ? 'متاح للعمل' : 'مشغول حالياً'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="designer-skills">
                        ${skills}
                    </div>
                    
                    <div class="designer-details">
                        <div class="detail-item">
                            <i class="fas fa-briefcase"></i>
                            <span>${designer.experience || 0} سنة خبرة</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span>${designer.hourlyRate || 0} ريال/ساعة</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-check-circle"></i>
                            <span>${Math.floor(Math.random() * 20) + 10} مشروع مكتمل</span>
                        </div>
                    </div>
                    
                    <div class="designer-actions">
                        <button class="btn btn-primary" onclick="hiringManager.viewPortfolio(${designer.id})">
                            <i class="fas fa-eye"></i>
                            المعرض
                        </button>
                        <button class="btn btn-outline" onclick="hiringManager.inviteToJob(${designer.id})">
                            <i class="fas fa-envelope"></i>
                            توظيف
                        </button>
                        <button class="btn btn-success" onclick="hiringManager.startChat(${designer.id})">
                            <i class="fas fa-comment"></i>
                            محادثة
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<p class="no-results">لا توجد نتائج</p>';
    }
    
    getCategoryName(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }
    
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        let stars = '';
        
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
    
    async loadJobRequests() {
        try {
            const user = window.auth?.currentUser;
            if (!user) return;
            
            let jobs;
            
            if (user.role === 'client') {
                jobs = await window.db.getAllProjects();
            } else {
                jobs = await window.db.getAllProjects();
            }
            
            this.displayJobRequests(jobs);
            
        } catch (error) {
            console.error('فشل تحميل طلبات التوظيف:', error);
        }
    }
    
    displayJobRequests(jobs) {
        const container = document.getElementById('jobRequestsContainer');
        if (!container) return;
        
        let html = '';
        
        jobs.forEach(job => {
            const statusClass = {
                pending: 'warning',
                active: 'success',
                completed: 'info',
                cancelled: 'danger'
            }[job.status] || 'secondary';
            
            html += `
                <div class="job-card" data-job-id="${job.id}">
                    <div class="job-header">
                        <h5>${job.title || 'طلب تصميم'}</h5>
                        <span class="job-status badge-${statusClass}">
                            ${this.getJobStatusText(job.status)}
                        </span>
                    </div>
                    
                    <div class="job-description">
                        <p>${job.description || 'لا يوجد وصف'}</p>
                    </div>
                    
                    <div class="job-details">
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span>${new Date(job.createdAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>${job.budget || 'غير محدد'} ريال</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span>${job.deadline ? new Date(job.deadline).toLocaleDateString('ar-SA') : 'غير محدد'}</span>
                        </div>
                    </div>
                    
                    <div class="job-skills">
                        ${(job.categories || []).map(cat => 
                            `<span class="skill-badge">${this.getCategoryName(cat)}</span>`
                        ).join('')}
                    </div>
                    
                    <div class="job-actions">
                        <button class="btn btn-sm" onclick="hiringManager.viewJobDetails(${job.id})">
                            <i class="fas fa-eye"></i>
                            التفاصيل
                        </button>
                        ${job.status === 'pending' ? `
                            <button class="btn btn-sm btn-primary" onclick="hiringManager.applyToJob(${job.id})">
                                <i class="fas fa-paper-plane"></i>
                                التقديم
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<p class="no-results">لا توجد طلبات توظيف متاحة</p>';
    }
    
    getJobStatusText(status) {
        const statusTexts = {
            pending: 'قيد الانتظار',
            active: 'نشط',
            completed: 'مكتمل',
            cancelled: 'ملغي',
            reviewing: 'قيد المراجعة'
        };
        
        return statusTexts[status] || status;
    }
    
    async loadApplications() {
        try {
            const user = window.auth?.currentUser;
            if (!user) return;
            
            if (user.role === 'designer') {
                // تحميل تقديمات المصمم
                this.applications = await this.getDesignerApplications(user.id);
            } else {
                // تحميل تقديمات لطلبات العميل
                this.applications = await this.getClientApplications(user.id);
            }
            
            this.displayApplications();
            
        } catch (error) {
            console.error('فشل تحميل التقديمات:', error);
        }
    }
    
    async getDesignerApplications(designerId) {
        // محاكاة جلب تقديمات المصمم
        return [
            {
                id: 1,
                jobId: 101,
                jobTitle: 'تصميم شعار لشركة تقنية',
                designerId: designerId,
                coverLetter: 'لدي خبرة 5 سنوات في تصميم الشعارات...',
                portfolioUrl: 'https://example.com/portfolio',
                status: 'pending',
                appliedAt: new Date().toISOString(),
                attachments: []
            },
            {
                id: 2,
                jobId: 102,
                jobTitle: 'هوية بصرية لمطعم',
                designerId: designerId,
                coverLetter: 'متخصص في تصميم الهويات البصرية للمطاعم...',
                portfolioUrl: 'https://example.com/portfolio2',
                status: 'accepted',
                appliedAt: new Date(Date.now() - 86400000).toISOString(),
                attachments: []
            }
        ];
    }
    
    async getClientApplications(clientId) {
        // محاكاة جلب تقديمات لطلبات العميل
        return [
            {
                id: 1,
                jobId: 101,
                jobTitle: 'تصميم شعار لشركة تقنية',
                designerId: 2,
                designerName: 'أحمد المصمم',
                coverLetter: 'لدي خبرة 5 سنوات في تصميم الشعارات...',
                portfolioUrl: 'https://example.com/portfolio',
                status: 'pending',
                appliedAt: new Date().toISOString(),
                attachments: []
            }
        ];
    }
    
    displayApplications() {
        const container = document.getElementById('applicationsContainer');
        if (!container) return;
        
        let html = '';
        
        this.applications.forEach(application => {
            const statusClass = {
                pending: 'warning',
                accepted: 'success',
                rejected: 'danger',
                reviewed: 'info'
            }[application.status] || 'secondary';
            
            html += `
                <div class="application-card" data-application-id="${application.id}">
                    <div class="application-header">
                        <h5>${application.jobTitle}</h5>
                        <span class="application-status badge-${statusClass}">
                            ${this.getApplicationStatusText(application.status)}
                        </span>
                    </div>
                    
                    ${application.designerName ? `
                        <div class="applicant-info">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(application.designerName)}&background=005f73&color=fff" 
                                 alt="${application.designerName}" class="applicant-avatar">
                            <span>${application.designerName}</span>
                        </div>
                    ` : ''}
                    
                    <div class="application-content">
                        <p class="cover-letter">${application.coverLetter}</p>
                        
                        ${application.portfolioUrl ? `
                            <div class="portfolio-link">
                                <i class="fas fa-link"></i>
                                <a href="${application.portfolioUrl}" target="_blank">معرض الأعمال</a>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="application-meta">
                        <span><i class="fas fa-calendar"></i> ${new Date(application.appliedAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                    
                    <div class="application-actions">
                        <button class="btn btn-sm" onclick="hiringManager.viewApplication(${application.id})">
                            <i class="fas fa-eye"></i>
                            التفاصيل
                        </button>
                        
                        ${application.status === 'pending' ? `
                            <button class="btn btn-sm btn-success" onclick="hiringManager.acceptApplication(${application.id})">
                                <i class="fas fa-check"></i>
                                قبول
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="hiringManager.rejectApplication(${application.id})">
                                <i class="fas fa-times"></i>
                                رفض
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<p class="no-results">لا توجد تقديمات</p>';
    }
    
    getApplicationStatusText(status) {
        const statusTexts = {
            pending: 'قيد المراجعة',
            accepted: 'مقبول',
            rejected: 'مرفوض',
            reviewed: 'تمت المراجعة'
        };
        
        return statusTexts[status] || status;
    }
    
    async loadInterviews() {
        try {
            const user = window.auth?.currentUser;
            if (!user) return;
            
            this.interviews = await this.getUserInterviews(user.id);
            this.displayInterviews();
            
        } catch (error) {
            console.error('فشل تحميل المقابلات:', error);
        }
    }
    
    async getUserInterviews(userId) {
        // محاكاة جلب المقابلات
        return [
            {
                id: 1,
                jobId: 101,
                jobTitle: 'تصميم شعار لشركة تقنية',
                participantId: 2,
                participantName: 'أحمد المصمم',
                type: 'video',
                scheduledAt: new Date(Date.now() + 86400000).toISOString(),
                duration: 30,
                status: 'scheduled',
                meetingUrl: 'https://meet.example.com/123',
                notes: 'مناقشة تفاصيل المشروع والمتطلبات'
            },
            {
                id: 2,
                jobId: 102,
                jobTitle: 'هوية بصرية لمطعم',
                participantId: 1,
                participantName: 'عميل تجريبي',
                type: 'voice',
                scheduledAt: new Date(Date.now() + 172800000).toISOString(),
                duration: 45,
                status: 'scheduled',
                meetingUrl: 'https://meet.example.com/456',
                notes: 'مراجعة التصاميم الأولية'
            }
        ];
    }
    
    displayInterviews() {
        const container = document.getElementById('interviewsContainer');
        if (!container) return;
        
        let html = '';
        
        this.interviews.forEach(interview => {
            const timeLeft = new Date(interview.scheduledAt) - new Date();
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            let timeText = '';
            if (days > 0) {
                timeText = `بعد ${days} يوم${days > 1 ? 'ين' : ''}`;
            } else if (hours > 0) {
                timeText = `بعد ${hours} ساعة${hours > 1 ? 'ات' : ''}`;
            } else {
                timeText = 'قريباً';
            }
            
            html += `
                <div class="interview-card" data-interview-id="${interview.id}">
                    <div class="interview-header">
                        <h5>${interview.jobTitle}</h5>
                        <span class="interview-time">${timeText}</span>
                    </div>
                    
                    <div class="interview-participant">
                        <i class="fas fa-user"></i>
                        <span>${interview.participantName}</span>
                    </div>
                    
                    <div class="interview-details">
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span>${new Date(interview.scheduledAt).toLocaleString('ar-SA')}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span>${interview.duration} دقيقة</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-video"></i>
                            <span>${interview.type === 'video' ? 'مقابلة مرئية' : 'مقابلة صوتية'}</span>
                        </div>
                    </div>
                    
                    <div class="interview-notes">
                        <p><strong>ملاحظات:</strong> ${interview.notes}</p>
                    </div>
                    
                    <div class="interview-actions">
                        ${interview.meetingUrl ? `
                            <button class="btn btn-primary" onclick="hiringManager.joinInterview('${interview.meetingUrl}')">
                                <i class="fas fa-video"></i>
                                انضم للمقابلة
                            </button>
                        ` : ''}
                        
                        <button class="btn btn-outline" onclick="hiringManager.rescheduleInterview(${interview.id})">
                            <i class="fas fa-calendar-alt"></i>
                            إعادة الجدولة
                        </button>
                        
                        <button class="btn btn-danger" onclick="hiringManager.cancelInterview(${interview.id})">
                            <i class="fas fa-times"></i>
                            إلغاء
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<p class="no-results">لا توجد مقابلات مجدولة</p>';
    }
    
    initEvents() {
        // أحداث البحث والتصفية
        this.initSearchAndFilter();
        
        // أحداث النماذج
        this.initForms();
        
        // أحداث الاشعارات
        this.initNotificationEvents();
    }
    
    initSearchAndFilter() {
        const searchInput = document.getElementById('designerSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        const experienceFilter = document.getElementById('experienceFilter');
        const ratingFilter = document.getElementById('ratingFilter');
        const availabilityFilter = document.getElementById('availabilityFilter');
        const sortSelect = document.getElementById('sortDesigners');
        const filterBtn = document.getElementById('applyFilters');
        const resetBtn = document.getElementById('resetFilters');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterDesigners({ search: e.target.value });
            });
        }
        
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                const filters = {
                    category: categoryFilter?.value,
                    experience: experienceFilter?.value,
                    rating: ratingFilter?.value,
                    availability: availabilityFilter?.value,
                    sort: sortSelect?.value
                };
                
                this.filterDesigners(filters);
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (categoryFilter) categoryFilter.value = '';
                if (experienceFilter) experienceFilter.value = '';
                if (ratingFilter) ratingFilter.value = '';
                if (availabilityFilter) availabilityFilter.value = '';
                if (sortSelect) sortSelect.value = '';
                if (searchInput) searchInput.value = '';
                
                this.displayDesigners();
            });
        }
    }
    
    filterDesigners(filters) {
        this.displayDesigners(filters);
    }
    
    initForms() {
        // نموذج نشر وظيفة
        const jobForm = document.getElementById('postJobForm');
        if (jobForm) {
            jobForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handlePostJob(jobForm);
            });
        }
        
        // نموذج التقديم للوظيفة
        const applicationForm = document.getElementById('applyJobForm');
        if (applicationForm) {
            applicationForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSubmitApplication(applicationForm);
            });
        }
        
        // نموذج جدولة مقابلة
        const interviewForm = document.getElementById('scheduleInterviewForm');
        if (interviewForm) {
            interviewForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleScheduleInterview(interviewForm);
            });
        }
    }
    
    async handlePostJob(form) {
        try {
            const user = window.auth?.currentUser;
            if (!user || user.role !== 'client') {
                throw new Error('يجب أن تكون عميلاً لنشر وظيفة');
            }
            
            const formData = new FormData(form);
            const jobData = {
                title: formData.get('jobTitle'),
                description: formData.get('jobDescription'),
                category: formData.get('jobCategory'),
                budget: parseFloat(formData.get('jobBudget')),
                deadline: formData.get('jobDeadline'),
                skills: formData.getAll('jobSkills'),
                clientId: user.id,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // التحقق من البيانات
            if (!jobData.title || !jobData.description || !jobData.category) {
                throw new Error('يرجى ملء جميع الحقول المطلوبة');
            }
            
            // حفظ الوظيفة في قاعدة البيانات
            const jobId = await this.saveJob(jobData);
            
            // إرسال اشعارات للمصممين المناسبين
            await this.notifyDesignersAboutJob(jobData);
            
            // إعادة تعيين النموذج
            form.reset();
            
            // عرض رسالة نجاح
            this.showSuccess('تم نشر الوظيفة بنجاح', 'سيتم مراجعة طلبك وإرسال إشعارات للمصممين المناسبين');
            
            // تحديث قائمة الوظائف
            await this.loadJobRequests();
            
            return jobId;
            
        } catch (error) {
            console.error('فشل نشر الوظيفة:', error);
            this.showError('فشل نشر الوظيفة', error.message);
        }
    }
    
    async saveJob(jobData) {
        // محاكاة حفظ الوظيفة
        return new Promise((resolve) => {
            setTimeout(() => {
                const jobId = Date.now();
                resolve(jobId);
            }, 1000);
        });
    }
    
    async notifyDesignersAboutJob(jobData) {
        const matchingDesigners = this.designers.filter(designer => {
            // تطابق المهارات
            const hasMatchingSkills = designer.skills?.some(skill => 
                jobData.skills?.includes(skill)
            );
            
            // التصنيف المناسب
            const hasMatchingCategory = designer.skills?.includes(jobData.category);
            
            return hasMatchingSkills || hasMatchingCategory;
        });
        
        // إرسال اشعارات للمصممين المطابقين
        matchingDesigners.forEach(async designer => {
            await this.sendJobNotification(designer.id, jobData);
        });
        
        console.log(`تم إرسال إشعارات إلى ${matchingDesigners.length} مصمم`);
    }
    
    async sendJobNotification(designerId, jobData) {
        const notification = {
            userId: designerId,
            type: 'job_opportunity',
            title: 'فرصة عمل جديدة',
            message: `وظيفة جديدة: ${jobData.title}`,
            data: { jobId: jobData.id },
            read: false,
            createdAt: new Date().toISOString()
        };
        
        await window.db.saveNotification(notification);
    }
    
    async handleSubmitApplication(form) {
        try {
            const user = window.auth?.currentUser;
            if (!user || user.role !== 'designer') {
                throw new Error('يجب أن تكون مصمماً للتقديم على الوظائف');
            }
            
            const formData = new FormData(form);
            const applicationData = {
                jobId: parseInt(formData.get('jobId')),
                designerId: user.id,
                coverLetter: formData.get('coverLetter'),
                portfolioUrl: formData.get('portfolioUrl'),
                hourlyRate: parseFloat(formData.get('hourlyRate')),
                estimatedTime: formData.get('estimatedTime'),
                attachments: [],
                status: 'pending',
                appliedAt: new Date().toISOString()
            };
            
            // معالجة الملفات المرفقة
            const files = formData.getAll('attachments');
            for (const file of files) {
                if (file.size > 0) {
                    const fileData = await this.uploadAttachment(file);
                    applicationData.attachments.push(fileData);
                }
            }
            
            // التحقق من البيانات
            if (!applicationData.coverLetter || !applicationData.portfolioUrl) {
                throw new Error('يرجى ملء جميع الحقول المطلوبة');
            }
            
            // حفظ التقديم
            await this.saveApplication(applicationData);
            
            // إرسال اشعار للعميل
            await this.notifyClientAboutApplication(applicationData);
            
            // إعادة تعيين النموذج
            form.reset();
            
            // عرض رسالة نجاح
            this.showSuccess('تم تقديم طلبك بنجاح', 'سيتم مراجعة طلبك والرد عليك خلال 48 ساعة');
            
            // تحديث قائمة التقديمات
            await this.loadApplications();
            
        } catch (error) {
            console.error('فشل تقديم الطلب:', error);
            this.showError('فشل تقديم الطلب', error.message);
        }
    }
    
    async uploadAttachment(file) {
        // محاكاة رفع الملف
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: e.target.result,
                    uploadedAt: new Date().toISOString()
                });
            };
            reader.readAsDataURL(file);
        });
    }
    
    async saveApplication(applicationData) {
        // محاكاة حفظ التقديم
        return new Promise((resolve) => {
            setTimeout(() => {
                const appId = Date.now();
                applicationData.id = appId;
                this.applications.push(applicationData);
                resolve(appId);
            }, 1000);
        });
    }
    
    async notifyClientAboutApplication(applicationData) {
        const job = await this.getJob(applicationData.jobId);
        if (!job) return;
        
        const notification = {
            userId: job.clientId,
            type: 'new_application',
            title: 'طلب جديد لوظيفتك',
            message: `تم تقديم طلب جديد للوظيفة: ${job.title}`,
            data: { 
                jobId: applicationData.jobId,
                applicationId: applicationData.id,
                designerId: applicationData.designerId 
            },
            read: false,
            createdAt: new Date().toISOString()
        };
        
        await window.db.saveNotification(notification);
    }
    
    async getJob(jobId) {
        // محاكاة جلب بيانات الوظيفة
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: jobId,
                    title: 'وظيفة تجريبية',
                    clientId: 1
                });
            }, 300);
        });
    }
    
    async handleScheduleInterview(form) {
        try {
            const formData = new FormData(form);
            const interviewData = {
                jobId: parseInt(formData.get('interviewJobId')),
                participantId: parseInt(formData.get('participantId')),
                type: formData.get('interviewType'),
                scheduledAt: formData.get('interviewDate') + 'T' + formData.get('interviewTime'),
                duration: parseInt(formData.get('interviewDuration')),
                notes: formData.get('interviewNotes'),
                status: 'scheduled',
                createdAt: new Date().toISOString()
            };
            
            // التحقق من البيانات
            if (!interviewData.scheduledAt || !interviewData.duration) {
                throw new Error('يرجى تحديد تاريخ ووقت المقابلة');
            }
            
            // إنشاء رابط الاجتماع
            interviewData.meetingUrl = await this.createMeetingLink(interviewData);
            
            // حفظ المقابلة
            await this.saveInterview(interviewData);
            
            // إرسال اشعار للمشارك
            await this.notifyParticipantAboutInterview(interviewData);
            
            // إرسال اشعار للمضيف
            await this.notifyHostAboutInterview(interviewData);
            
            // إعادة تعيين النموذج
            form.reset();
            
            // عرض رسالة نجاح
            this.showSuccess('تم جدولة المقابلة بنجاح', 'تم إرسال الدعوة إلى المشارك');
            
            // تحديث قائمة المقابلات
            await this.loadInterviews();
            
        } catch (error) {
            console.error('فشل جدولة المقابلة:', error);
            this.showError('فشل جدولة المقابلة', error.message);
        }
    }
    
    async createMeetingLink(interviewData) {
        // محاكاة إنشاء رابط اجتماع
        const meetingId = Math.random().toString(36).substring(7);
        return `https://meet.example.com/${meetingId}`;
    }
    
    async saveInterview(interviewData) {
        // محاكاة حفظ المقابلة
        return new Promise((resolve) => {
            setTimeout(() => {
                const interviewId = Date.now();
                interviewData.id = interviewId;
                this.interviews.push(interviewData);
                resolve(interviewId);
            }, 1000);
        });
    }
    
    async notifyParticipantAboutInterview(interviewData) {
        const notification = {
            userId: interviewData.participantId,
            type: 'interview_invitation',
            title: 'دعوة لمقابلة',
            message: `لديك مقابلة مجدولة في ${new Date(interviewData.scheduledAt).toLocaleString('ar-SA')}`,
            data: { 
                interviewId: interviewData.id,
                meetingUrl: interviewData.meetingUrl 
            },
            read: false,
            createdAt: new Date().toISOString()
        };
        
        await window.db.saveNotification(notification);
    }
    
    async notifyHostAboutInterview(interviewData) {
        const user = window.auth?.currentUser;
        if (!user) return;
        
        const notification = {
            userId: user.id,
            type: 'interview_scheduled',
            title: 'تم جدولة مقابلة',
            message: `لقد قمت بجدولة مقابلة في ${new Date(interviewData.scheduledAt).toLocaleString('ar-SA')}`,
            data: { 
                interviewId: interviewData.id,
                meetingUrl: interviewData.meetingUrl 
            },
            read: false,
            createdAt: new Date().toISOString()
        };
        
        await window.db.saveNotification(notification);
    }
    
    initNotificationEvents() {
        // التحقق من الإشعارات الجديدة كل دقيقة
        setInterval(() => {
            this.checkNewNotifications();
        }, 60000);
    }
    
    async checkNewNotifications() {
        try {
            const user = window.auth?.currentUser;
            if (!user) return;
            
            const notifications = await window.db.getNotificationsByUser(user.id, true);
            
            // إشعارات التوظيف
            const hiringNotifications = notifications.filter(n => 
                n.type.includes('job') || n.type.includes('application') || n.type.includes('interview')
            );
            
            if (hiringNotifications.length > 0) {
                this.showHiringNotifications(hiringNotifications);
            }
            
        } catch (error) {
            console.error('فشل التحقق من الإشعارات:', error);
        }
    }
    
    showHiringNotifications(notifications) {
        notifications.forEach(notification => {
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
            
            // تعيين كمقروء
            window.db.markNotificationAsRead(notification.id);
        });
    }
    
    handleNotificationClick(notification) {
        switch (notification.type) {
            case 'job_opportunity':
                this.viewJobDetails(notification.data.jobId);
                break;
            case 'new_application':
                this.viewApplication(notification.data.applicationId);
                break;
            case 'interview_invitation':
                this.viewInterview(notification.data.interviewId);
                break;
        }
    }
    
    // ===== الوظائف العامة =====
    
    viewPortfolio(designerId) {
        this.openModal('portfolioModal');
        this.loadPortfolio(designerId);
    }
    
    async loadPortfolio(designerId) {
        try {
            const designer = this.designers.find(d => d.id === designerId);
            if (!designer) return;
            
            const designs = await window.db.getDesignsByDesigner(designerId);
            
            const container = document.getElementById('portfolioContent');
            if (container) {
                let html = `
                    <div class="portfolio-header">
                        <img src="${designer.avatar}" alt="${designer.name}" class="portfolio-avatar">
                        <div class="portfolio-info">
                            <h4>${designer.name}</h4>
                            <div class="portfolio-stats">
                                <span>${designs.length} تصميم</span>
                                <span>⭐ ${designer.rating.toFixed(1)}</span>
                                <span>${designer.experience || 0} سنة خبرة</span>
                            </div>
                        </div>
                    </div>
                    <div class="portfolio-grid">
                `;
                
                designs.forEach(design => {
                    html += `
                        <div class="portfolio-item">
                            <div class="portfolio-image">
                                <i class="fas fa-palette"></i>
                            </div>
                            <div class="portfolio-item-info">
                                <h6>${design.title}</h6>
                                <span class="category">${this.getCategoryName(design.category)}</span>
                                <span class="rating">⭐ ${design.rating || 0}</span>
                            </div>
                        </div>
                    `;
                });
                
                html += '</div>';
                container.innerHTML = html;
            }
            
        } catch (error) {
            console.error('فشل تحميل المعرض:', error);
        }
    }
    
    inviteToJob(designerId) {
        this.openModal('inviteModal');
        document.getElementById('inviteDesignerId').value = designerId;
    }
    
    startChat(designerId) {
        const designer = this.designers.find(d => d.id === designerId);
        if (designer && window.app) {
            window.app.openChatWithDesigner(designer);
        }
    }
    
    viewJobDetails(jobId) {
        this.openModal('jobDetailsModal');
        this.loadJobDetails(jobId);
    }
    
    async loadJobDetails(jobId) {
        // محاكاة تحميل تفاصيل الوظيفة
        const job = {
            id: jobId,
            title: 'تصميم شعار لشركة تقنية',
            description: 'نحتاج إلى تصميم شعار عصري لشركتنا الناشئة في مجال التقنية...',
            category: 'logo',
            budget: 3000,
            deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
            skills: ['logo', 'branding', 'modern'],
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        const container = document.getElementById('jobDetailsContent');
        if (container) {
            container.innerHTML = `
                <h4>${job.title}</h4>
                <div class="job-meta">
                    <span class="budget">${job.budget} ريال</span>
                    <span class="deadline">الموعد النهائي: ${new Date(job.deadline).toLocaleDateString('ar-SA')}</span>
                    <span class="category">${this.getCategoryName(job.category)}</span>
                </div>
                <div class="job-description">
                    <p>${job.description}</p>
                </div>
                <div class="job-skills">
                    ${job.skills.map(skill => `<span class="skill-badge">${this.getCategoryName(skill)}</span>`).join('')}
                </div>
                <div class="job-actions">
                    <button class="btn btn-primary" onclick="hiringManager.applyToJob(${jobId})">
                        <i class="fas fa-paper-plane"></i>
                        التقديم للوظيفة
                    </button>
                </div>
            `;
        }
    }
    
    applyToJob(jobId) {
        this.openModal('applyJobModal');
        document.getElementById('applyJobId').value = jobId;
    }
    
    viewApplication(applicationId) {
        this.openModal('applicationDetailsModal');
        this.loadApplicationDetails(applicationId);
    }
    
    async loadApplicationDetails(applicationId) {
        const application = this.applications.find(a => a.id === applicationId);
        if (!application) return;
        
        const container = document.getElementById('applicationDetailsContent');
        if (container) {
            container.innerHTML = `
                <h4>التقديم على: ${application.jobTitle}</h4>
                <div class="application-status">
                    الحالة: <span class="badge-${application.status === 'accepted' ? 'success' : application.status === 'rejected' ? 'danger' : 'warning'}">
                        ${this.getApplicationStatusText(application.status)}
                    </span>
                </div>
                <div class="cover-letter-section">
                    <h5>رسالة التقديم:</h5>
                    <p>${application.coverLetter}</p>
                </div>
                ${application.portfolioUrl ? `
                    <div class="portfolio-section">
                        <h5>معرض الأعمال:</h5>
                        <a href="${application.portfolioUrl}" target="_blank">${application.portfolioUrl}</a>
                    </div>
                ` : ''}
                ${application.attachments?.length > 0 ? `
                    <div class="attachments-section">
                        <h5>المرفقات:</h5>
                        <div class="attachments-list">
                            ${application.attachments.map(att => `
                                <div class="attachment-item">
                                    <i class="fas fa-file"></i>
                                    <span>${att.name}</span>
                                    <a href="${att.url}" download class="btn btn-sm">تحميل</a>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            `;
        }
    }
    
    async acceptApplication(applicationId) {
        if (confirm('هل أنت متأكد من قبول هذا التقديم؟')) {
            try {
                const application = this.applications.find(a => a.id === applicationId);
                if (application) {
                    application.status = 'accepted';
                    
                    // إرسال اشعار للمصمم
                    await this.notifyDesignerAboutApplicationStatus(application, 'accepted');
                    
                    // إنشاء مشروع جديد
                    await this.createProjectFromApplication(application);
                    
                    this.showSuccess('تم القبول', 'تم قبول التقديم وإنشاء مشروع جديد');
                    await this.loadApplications();
                }
            } catch (error) {
                console.error('فشل قبول التقديم:', error);
                this.showError('فشل القبول', error.message);
            }
        }
    }
    
    async rejectApplication(applicationId) {
        if (confirm('هل أنت متأكد من رفض هذا التقديم؟')) {
            try {
                const application = this.applications.find(a => a.id === applicationId);
                if (application) {
                    application.status = 'rejected';
                    
                    // إرسال اشعار للمصمم
                    await this.notifyDesignerAboutApplicationStatus(application, 'rejected');
                    
                    this.showSuccess('تم الرفض', 'تم رفض التقديم');
                    await this.loadApplications();
                }
            } catch (error) {
                console.error('فشل رفض التقديم:', error);
                this.showError('فشل الرفض', error.message);
            }
        }
    }
    
    async notifyDesignerAboutApplicationStatus(application, status) {
        const notification = {
            userId: application.designerId,
            type: 'application_status',
            title: `تم ${status === 'accepted' ? 'قبول' : 'رفض'} طلبك`,
            message: `تم ${status === 'accepted' ? 'قبول' : 'رفض'} طلبك للوظيفة: ${application.jobTitle}`,
            data: { 
                applicationId: application.id,
                status: status
            },
            read: false,
            createdAt: new Date().toISOString()
        };
        
        await window.db.saveNotification(notification);
    }
    
    async createProjectFromApplication(application) {
        const project = {
            title: application.jobTitle,
            description: `مشروع تم إنشاؤه من التقديم: ${application.coverLetter.substring(0, 100)}...`,
            clientId: window.auth?.currentUser?.id,
            designerId: application.designerId,
            budget: application.hourlyRate * (parseInt(application.estimatedTime) || 10),
            deadline: new Date(Date.now() + 86400000 * 14).toISOString(),
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        await window.db.saveProject(project);
    }
    
    viewInterview(interviewId) {
        this.openModal('interviewDetailsModal');
        this.loadInterviewDetails(interviewId);
    }
    
    loadInterviewDetails(interviewId) {
        const interview = this.interviews.find(i => i.id === interviewId);
        if (!interview) return;
        
        const container = document.getElementById('interviewDetailsContent');
        if (container) {
            container.innerHTML = `
                <h4>${interview.jobTitle}</h4>
                <div class="interview-meta">
                    <div class="meta-item">
                        <i class="fas fa-user"></i>
                        <span>${interview.participantName}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${new Date(interview.scheduledAt).toLocaleString('ar-SA')}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${interview.duration} دقيقة</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-video"></i>
                        <span>${interview.type === 'video' ? 'مقابلة مرئية' : 'مقابلة صوتية'}</span>
                    </div>
                </div>
                <div class="interview-notes">
                    <h5>ملاحظات:</h5>
                    <p>${interview.notes}</p>
                </div>
                ${interview.meetingUrl ? `
                    <div class="meeting-link">
                        <h5>رابط الاجتماع:</h5>
                        <a href="${interview.meetingUrl}" target="_blank" class="btn btn-primary">
                            <i class="fas fa-video"></i>
                            انضم للمقابلة
                        </a>
                    </div>
                ` : ''}
            `;
        }
    }
    
    joinInterview(meetingUrl) {
        window.open(meetingUrl, '_blank');
    }
    
    rescheduleInterview(interviewId) {
        this.openModal('rescheduleInterviewModal');
        document.getElementById('rescheduleInterviewId').value = interviewId;
    }
    
    async cancelInterview(interviewId) {
        if (confirm('هل أنت متأكد من إلغاء هذه المقابلة؟')) {
            try {
                const interview = this.interviews.find(i => i.id === interviewId);
                if (interview) {
                    interview.status = 'cancelled';
                    
                    // إرسال اشعار للمشارك
                    await this.notifyParticipantAboutInterviewCancellation(interview);
                    
                    this.showSuccess('تم الإلغاء', 'تم إلغاء المقابلة');
                    await this.loadInterviews();
                }
            } catch (error) {
                console.error('فشل إلغاء المقابلة:', error);
                this.showError('فشل الإلغاء', error.message);
            }
        }
    }
    
    async notifyParticipantAboutInterviewCancellation(interview) {
        const notification = {
            userId: interview.participantId,
            type: 'interview_cancelled',
            title: 'تم إلغاء المقابلة',
            message: `تم إلغاء المقابلة المجدولة في ${new Date(interview.scheduledAt).toLocaleString('ar-SA')}`,
            data: { 
                interviewId: interview.id,
                jobTitle: interview.jobTitle
            },
            read: false,
            createdAt: new Date().toISOString()
        };
        
        await window.db.saveNotification(notification);
    }
    
    startAutoUpdate() {
        // تحديث البيانات كل 30 ثانية
        setInterval(async () => {
            await this.loadDesigners();
            await this.loadJobRequests();
            await this.loadApplications();
            await this.loadInterviews();
        }, 30000);
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.getElementById('modalOverlay').style.display = 'block';
        }
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

// تهيئة مدير التوظيف
const hiringManager = new HiringManager();
window.hiringManager = hiringManager;

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await hiringManager.init();
        console.log('تم تهيئة نظام إدارة التوظيف بنجاح');
    } catch (error) {
        console.error('فشل تهيئة نظام إدارة التوظيف:', error);
    }
});

// تصدير للاستخدام في الملفات الأخرى
export default hiringManager;