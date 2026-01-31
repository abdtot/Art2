// ============================================
// نظام إدارة التصاميم والمشاريع
// ============================================

class DesignManager {
    constructor() {
        this.designs = [];
        this.projects = [];
        this.categories = [];
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.initDesignEditor();
    }

    loadData() {
        // تحميل التصاميم من localStorage أو إنشاء بيانات نموذجية
        const storedDesigns = localStorage.getItem('pixelArtDesigns');
        this.designs = storedDesigns ? JSON.parse(storedDesigns) : this.getSampleDesigns();
        
        const storedProjects = localStorage.getItem('pixelArtProjects');
        this.projects = storedProjects ? JSON.parse(storedProjects) : this.getSampleProjects();
        
        this.categories = this.getCategories();
    }

    saveData() {
        localStorage.setItem('pixelArtDesigns', JSON.stringify(this.designs));
        localStorage.setItem('pixelArtProjects', JSON.stringify(this.projects));
    }

    bindEvents() {
        // استكشاف التصاميم
        this.bindExploreEvents();
        
        // طلب التصميم
        this.bindDesignRequestEvents();
        
        // أدوات التصميم
        this.bindDesignToolsEvents();
        
        // المشاريع
        this.bindProjectsEvents();
    }

    bindExploreEvents() {
        // فئات التصميم
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => this.filterByCategory(e));
        });
        
        // بحث الاستكشاف
        const exploreSearch = document.querySelector('.explore-search');
        if (exploreSearch) {
            exploreSearch.addEventListener('input', (e) => this.searchDesigns(e.target.value));
        }
        
        // زر التحميل المزيد
        const loadMoreBtn = document.getElementById('loadMoreDesigns');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreDesigns());
        }
        
        // زر الفلترة
        const filterBtn = document.getElementById('filterExplore');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.showFiltersModal());
        }
        
        // زر الإعجاب
        document.addEventListener('click', (e) => {
            if (e.target.closest('.like-btn')) {
                this.handleLike(e.target.closest('.like-btn'));
            }
        });
    }

    bindDesignRequestEvents() {
        // Stepper التنقل
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', (e) => this.nextStep(e));
        });
        
        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', (e) => this.prevStep(e));
        });
        
        // اختيار نوع التصميم
        document.querySelectorAll('.design-type-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectDesignType(e));
        });
        
        // حساب عدد الأحرف
        const description = document.getElementById('projectDescription');
        if (description) {
            description.addEventListener('input', (e) => this.updateCharCount(e.target.value));
        }
        
        // رفع الملفات
        const fileUpload = document.querySelector('.file-upload-area');
        if (fileUpload) {
            fileUpload.addEventListener('click', () => document.getElementById('projectFiles').click());
            fileUpload.addEventListener('dragover', (e) => this.handleDragOver(e));
            fileUpload.addEventListener('drop', (e) => this.handleFileDrop(e));
        }
        
        // السليدر
        const budgetSlider = document.getElementById('projectBudget');
        if (budgetSlider) {
            budgetSlider.addEventListener('input', (e) => this.updateBudgetValue(e.target.value));
        }
        
        // خيارات التسليم
        document.querySelectorAll('.delivery-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectDeliveryOption(e));
        });
        
        // تقديم الطلب
        const requestForm = document.getElementById('designRequestForm');
        if (requestForm) {
            requestForm.addEventListener('submit', (e) => this.submitDesignRequest(e));
        }
    }

    bindDesignToolsEvents() {
        // أدوات المحرر
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTool(e));
        });
        
        // أدوات الرسم
        document.querySelectorAll('.tool-icon').forEach(icon => {
            icon.addEventListener('click', (e) => this.selectDrawingTool(e));
        });
        
        // حفظ التصميم
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.saveDesign(e));
        });
        
        // أدوات الذكاء الاصطناعي
        document.querySelectorAll('.ai-tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.useAITool(e));
        });
    }

    bindProjectsEvents() {
        // فلترة المشاريع
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.filterProjects(e));
        });
        
        // تبديل العرض
        document.querySelectorAll('.view-option').forEach(option => {
            option.addEventListener('click', (e) => this.switchView(e));
        });
        
        // زر المشروع الجديد
        const newProjectBtn = document.getElementById('newProjectBtn');
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => this.createNewProject());
        }
    }

    // === استكشاف التصاميم ===
    
    filterByCategory(e) {
        const card = e.currentTarget;
        const category = card.querySelector('span').textContent;
        
        // تحديث المظهر
        document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        // تصفية التصاميم
        this.displayDesignsByCategory(category);
    }

    displayDesignsByCategory(category) {
        const designsGrid = document.querySelector('.designs-grid');
        if (!designsGrid) return;
        
        let filteredDesigns = this.designs;
        if (category !== 'جميع التصاميم') {
            filteredDesigns = this.designs.filter(design => design.category === category);
        }
        
        designsGrid.innerHTML = this.generateDesignsHTML(filteredDesigns);
    }

    searchDesigns(query) {
        const designsGrid = document.querySelector('.designs-grid');
        if (!designsGrid) return;
        
        if (!query.trim()) {
            designsGrid.innerHTML = this.generateDesignsHTML(this.designs);
            return;
        }
        
        const filtered = this.designs.filter(design => 
            design.name.includes(query) || 
            design.description.includes(query) ||
            design.tags?.some(tag => tag.includes(query))
        );
        
        designsGrid.innerHTML = this.generateDesignsHTML(filtered);
    }

    loadMoreDesigns() {
        // محاكاة تحميل المزيد من التصاميم
        const newDesigns = this.generateMoreDesigns();
        this.designs = [...this.designs, ...newDesigns];
        
        // تحديث العرض
        const designsGrid = document.querySelector('.designs-grid');
        if (designsGrid) {
            designsGrid.innerHTML = this.generateDesignsHTML(this.designs);
        }
        
        // إشعار
        Toastify({
            text: `تم تحميل ${newDesigns.length} تصميم إضافي`,
            duration: 3000,
            gravity: "top",
            position: "left",
            backgroundColor: "#0a9396"
        }).showToast();
    }

    handleLike(button) {
        const designCard = button.closest('.design-card');
        const likeCount = button.querySelector('span');
        const icon = button.querySelector('i');
        
        // تبديل حالة الإعجاب
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            likeCount.textContent = parseInt(likeCount.textContent) + 1;
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            likeCount.textContent = parseInt(likeCount.textContent) - 1;
        }
    }

    // === طلب التصميم ===
    
    nextStep(e) {
        const currentStep = e.currentTarget.closest('.form-step');
        const nextStepNumber = e.currentTarget.dataset.next;
        
        // التحقق من صحة الخطوة الحالية
        if (!this.validateStep(currentStep)) {
            return;
        }
        
        // تحديث stepper
        this.updateStepper(currentStep.dataset.step, nextStepNumber);
        
        // الانتقال للخطوة التالية
        currentStep.classList.remove('active');
        document.querySelector(`.form-step[data-step="${nextStepNumber}"]`).classList.add('active');
        
        // تحديث ملخص المراجعة إذا كانت الخطوة الرابعة
        if (nextStepNumber === '4') {
            this.updateReviewSummary();
        }
    }

    prevStep(e) {
        const currentStep = e.currentTarget.closest('.form-step');
        const prevStepNumber = e.currentTarget.dataset.prev;
        
        // تحديث stepper
        this.updateStepper(currentStep.dataset.step, prevStepNumber, false);
        
        // الانتقال للخطوة السابقة
        currentStep.classList.remove('active');
        document.querySelector(`.form-step[data-step="${prevStepNumber}"]`).classList.add('active');
    }

    validateStep(stepElement) {
        const stepNumber = stepElement.dataset.step;
        
        switch(stepNumber) {
            case '1':
                return this.validateStep1();
            case '2':
                return this.validateStep2();
            case '3':
                return this.validateStep3();
            default:
                return true;
        }
    }

    validateStep1() {
        const selectedType = document.querySelector('.design-type-card.selected');
        if (!selectedType) {
            this.showError('الرجاء اختيار نوع التصميم');
            return false;
        }
        return true;
    }

    validateStep2() {
        const title = document.getElementById('projectTitle').value;
        const description = document.getElementById('projectDescription').value;
        
        if (!title.trim()) {
            this.showError('عنوان المشروع مطلوب');
            return false;
        }
        
        if (!description.trim()) {
            this.showError('وصف المشروع مطلوب');
            return false;
        }
        
        if (description.length < 50) {
            this.showError('وصف المشروع يجب أن يكون 50 حرف على الأقل');
            return false;
        }
        
        return true;
    }

    validateStep3() {
        const budget = document.getElementById('projectBudget').value;
        
        if (!budget || budget < 100) {
            this.showError('الميزانية يجب أن تكون 100 ريال على الأقل');
            return false;
        }
        
        return true;
    }

    updateStepper(currentStep, nextStep, forward = true) {
        const currentStepElement = document.querySelector(`.stepper-step:nth-child(${currentStep})`);
        const nextStepElement = document.querySelector(`.stepper-step:nth-child(${nextStep})`);
        
        if (forward) {
            currentStepElement.classList.add('completed');
            nextStepElement.classList.add('active');
        } else {
            currentStepElement.classList.remove('active');
            nextStepElement.classList.add('active');
        }
    }

    selectDesignType(e) {
        const card = e.currentTarget;
        
        document.querySelectorAll('.design-type-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
    }

    updateCharCount(text) {
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = text.length;
            
            // تغيير اللون إذا تجاوز الحد
            if (text.length > 1000) {
                charCount.style.color = '#e76f51';
            } else {
                charCount.style.color = 'var(--text-light)';
            }
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = '#0a9396';
        e.currentTarget.style.backgroundColor = 'rgba(10, 147, 150, 0.1)';
    }

    handleFileDrop(e) {
        e.preventDefault();
        const files = e.dataTransfer.files;
        this.handleFiles(files);
    }

    handleFiles(files) {
        const uploadedFiles = document.getElementById('uploadedFiles');
        
        Array.from(files).forEach(file => {
            if (!this.validateFile(file)) {
                return;
            }
            
            const fileElement = this.createFileElement(file);
            uploadedFiles.appendChild(fileElement);
        });
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/psd', 'application/ai'];
        
        if (file.size > maxSize) {
            this.showError(`الملف ${file.name} يتجاوز 10MB`);
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            this.showError(`نوع الملف ${file.name} غير مدعوم`);
            return false;
        }
        
        return true;
    }

    createFileElement(file) {
        const div = document.createElement('div');
        div.className = 'uploaded-file';
        div.innerHTML = `
            <i class="fas fa-file"></i>
            <span>${file.name}</span>
            <small>${this.formatFileSize(file.size)}</small>
            <button class="remove-file">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        div.querySelector('.remove-file').addEventListener('click', () => div.remove());
        
        return div;
    }

    updateBudgetValue(value) {
        const currentBudget = document.getElementById('currentBudget');
        if (currentBudget) {
            currentBudget.textContent = `${parseInt(value).toLocaleString()} ريال`;
        }
    }

    selectDeliveryOption(e) {
        const option = e.currentTarget;
        
        document.querySelectorAll('.delivery-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
    }

    async submitDesignRequest(e) {
        e.preventDefault();
        
        // جمع البيانات
        const requestData = this.collectRequestData();
        
        // التحقق النهائي
        if (!this.validateRequestData(requestData)) {
            return;
        }
        
        // عرض حالة التحميل
        const submitBtn = e.target.querySelector('.submit-request');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إرسال الطلب...';
        submitBtn.disabled = true;
        
        try {
            // محاكاة إرسال الطلب
            await this.simulateRequestSubmission(requestData);
            
            // النجاح
            this.showSuccess('تم إرسال طلب التصميم بنجاح!');
            
            // إعادة تعيين النموذج
            setTimeout(() => {
                this.resetRequestForm();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
            
        } catch (error) {
            this.showError(error.message);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    collectRequestData() {
        return {
            type: document.querySelector('.design-type-card.selected h4').textContent,
            title: document.getElementById('projectTitle').value,
            description: document.getElementById('projectDescription').value,
            style: document.getElementById('projectStyle').value,
            budget: document.getElementById('projectBudget').value,
            delivery: document.querySelector('.delivery-option.selected span').textContent,
            designerOption: document.querySelector('input[name="designerOption"]:checked').value,
            files: this.getUploadedFiles(),
            timestamp: new Date().toISOString()
        };
    }

    validateRequestData(data) {
        if (!data.type || !data.title || !data.description || !data.budget) {
            this.showError('الرجاء ملء جميع الحقول المطلوبة');
            return false;
        }
        
        if (!document.getElementById('confirmTerms').checked) {
            this.showError('يجب الموافقة على الشروط والأحكام');
            return false;
        }
        
        return true;
    }

    async simulateRequestSubmission(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // حفظ الطلب محلياً
                const requests = JSON.parse(localStorage.getItem('pixelArtRequests') || '[]');
                const newRequest = {
                    id: Date.now(),
                    ...data,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                
                requests.push(newRequest);
                localStorage.setItem('pixelArtRequests', JSON.stringify(requests));
                
                // إنشاء مشروع جديد
                const newProject = {
                    id: Date.now(),
                    name: data.title,
                    description: data.description,
                    type: data.type,
                    budget: data.budget,
                    status: 'pending',
                    progress: 0,
                    createdAt: new Date().toISOString()
                };
                
                this.projects.push(newProject);
                this.saveData();
                
                resolve(newRequest);
            }, 2500);
        });
    }

    resetRequestForm() {
        // إعادة تعيين النموذج
        document.getElementById('projectTitle').value = '';
        document.getElementById('projectDescription').value = '';
        document.getElementById('uploadedFiles').innerHTML = '';
        document.getElementById('confirmTerms').checked = false;
        
        // إعادة stepper للخطوة الأولى
        document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
        document.querySelector('.form-step[data-step="1"]').classList.add('active');
        
        document.querySelectorAll('.stepper-step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index === 0) step.classList.add('active');
        });
    }

    // === أدوات التصميم ===
    
    initDesignEditor() {
        const canvas = document.getElementById('designCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.ctx = ctx;
        this.drawing = false;
        this.currentTool = 'select';
        this.currentColor = '#0a9396';
        this.currentSize = 5;
        
        this.initCanvasEvents();
        this.clearCanvas();
    }

    initCanvasEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // للأجهزة التي تعمل باللمس
        this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e.touches[0]));
        this.canvas.addEventListener('touchmove', (e) => this.draw(e.touches[0]));
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
    }

    startDrawing(e) {
        if (this.currentTool === 'select') return;
        
        this.drawing = true;
        this.ctx.beginPath();
        this.ctx.moveTo(e.offsetX, e.offsetY);
    }

    draw(e) {
        if (!this.drawing) return;
        
        this.ctx.lineTo(e.offsetX, e.offsetY);
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
    }

    stopDrawing() {
        this.drawing = false;
        this.ctx.closePath();
    }

    clearCanvas() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    switchTool(e) {
        const button = e.currentTarget;
        const tool = button.dataset.tool;
        
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        document.querySelectorAll('[data-tool-content]').forEach(content => content.classList.remove('active'));
        document.querySelector(`[data-tool-content="${tool}"]`).classList.add('active');
    }

    selectDrawingTool(e) {
        const icon = e.currentTarget;
        const tool = icon.querySelector('span').textContent;
        
        document.querySelectorAll('.tool-icon').forEach(i => i.classList.remove('active'));
        icon.classList.add('active');
        
        this.currentTool = this.getToolName(tool);
    }

    getToolName(toolName) {
        const tools = {
            'اختيار': 'select',
            'مستطيل': 'rectangle',
            'دائرة': 'circle',
            'نص': 'text',
            'قلم': 'pen',
            'محو': 'eraser'
        };
        
        return tools[toolName] || 'pen';
    }

    async saveDesign(e) {
        const button = e.currentTarget;
        const format = button.textContent.includes('PNG') ? 'png' : 
                      button.textContent.includes('PDF') ? 'pdf' : 'draft';
        
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
        
        try {
            if (format === 'png') {
                await this.saveAsPNG();
            } else if (format === 'pdf') {
                await this.saveAsPDF();
            } else {
                await this.saveAsDraft();
            }
            
            this.showSuccess(`تم حفظ التصميم كـ ${format.toUpperCase()} بنجاح`);
            button.innerHTML = originalText;
            
        } catch (error) {
            this.showError('حدث خطأ أثناء الحفظ');
            button.innerHTML = originalText;
        }
    }

    async saveAsPNG() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const link = document.createElement('a');
                link.download = `تصميم-${Date.now()}.png`;
                link.href = this.canvas.toDataURL('image/png');
                link.click();
                resolve();
            }, 1000);
        });
    }

    async saveAsPDF() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.showInfo('ميزة حفظ PDF قيد التطوير');
                resolve();
            }, 1000);
        });
    }

    async saveAsDraft() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const draft = {
                    id: Date.now(),
                    image: this.canvas.toDataURL('image/png'),
                    timestamp: new Date().toISOString(),
                    tool: this.currentTool,
                    color: this.currentColor,
                    size: this.currentSize
                };
                
                const drafts = JSON.parse(localStorage.getItem('pixelArtDrafts') || '[]');
                drafts.push(draft);
                localStorage.setItem('pixelArtDrafts', JSON.stringify(drafts));
                resolve();
            }, 1000);
        });
    }

    async useAITool(e) {
        const button = e.currentTarget;
        const tool = button.closest('.ai-tool-card').querySelector('h3').textContent;
        
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري المعالجة...';
        
        try {
            await this.simulateAIProcessing(tool);
            this.showSuccess(`تم استخدام ${tool} بنجاح`);
            button.innerHTML = originalText;
            
        } catch (error) {
            this.showError('حدث خطأ أثناء المعالجة');
            button.innerHTML = originalText;
        }
    }

    async simulateAIProcessing(tool) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // محاكاة معالجة الذكاء الاصطناعي
                switch(tool) {
                    case 'تحويل النص إلى صورة':
                        this.generateTextToImage();
                        break;
                    case 'توليد ألوان':
                        this.generateColorPalette();
                        break;
                    case 'اختيار الخطوط':
                        this.suggestFonts();
                        break;
                    case 'تحسين التصميم':
                        this.enhanceDesign();
                        break;
                }
                resolve();
            }, 3000);
        });
    }

    generateTextToImage() {
        // محاكاة توليد صورة من نص
        this.clearCanvas();
        this.ctx.fillStyle = '#0a9396';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('صورة مولدة بالذكاء الاصطناعي', 
                         this.canvas.width / 2, 
                         this.canvas.height / 2);
    }

    generateColorPalette() {
        const palette = document.querySelector('.color-palette');
        if (!palette) return;
        
        const colors = [
            '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0',
            '#118AB2', '#073B4C', '#EF476F', '#7209B7'
        ];
        
        palette.innerHTML = '';
        
        for (let i = 0; i < colors.length; i += 4) {
            const row = document.createElement('div');
            row.className = 'color-row';
            
            for (let j = 0; j < 4 && i + j < colors.length; j++) {
                const color = colors[i + j];
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.backgroundColor = color;
                swatch.title = color;
                swatch.addEventListener('click', () => {
                    this.currentColor = color;
                    document.querySelector('.color-preview').style.backgroundColor = color;
                });
                row.appendChild(swatch);
            }
            
            palette.appendChild(row);
        }
    }

    suggestFonts() {
        const fonts = ['Almarai', 'Cairo', 'Tajawal', 'Arial', 'Tahoma', 'Helvetica'];
        const fontList = document.createElement('div');
        fontList.className = 'font-suggestions';
        
        fonts.forEach(font => {
            const item = document.createElement('div');
            item.className = 'font-suggestion';
            item.style.fontFamily = font;
            item.textContent = font;
            item.addEventListener('click', () => {
                this.ctx.font = `30px ${font}`;
                this.showSuccess(`تم اختيار خط ${font}`);
            });
            fontList.appendChild(item);
        });
        
        // عرض الاقتراحات
        this.showModal('اقتراحات الخطوط', fontList);
    }

    enhanceDesign() {
        // محاكاة تحسين التصميم
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // زيادة السطوع
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] + 20);     // R
            data[i + 1] = Math.min(255, data[i + 1] + 20); // G
            data[i + 2] = Math.min(255, data[i + 2] + 20); // B
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    // === إدارة المشاريع ===
    
    filterProjects(e) {
        const tab = e.currentTarget;
        const filter = tab.dataset.filter;
        
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        this.displayFilteredProjects(filter);
    }

    displayFilteredProjects(filter) {
        const projectsGrid = document.getElementById('projectsGrid');
        if (!projectsGrid) return;
        
        let filteredProjects = this.projects;
        
        if (filter !== 'all') {
            filteredProjects = this.projects.filter(project => project.status === filter);
        }
        
        projectsGrid.innerHTML = this.generateProjectsHTML(filteredProjects);
    }

    switchView(e) {
        const option = e.currentTarget;
        const view = option.dataset.view;
        
        document.querySelectorAll('.view-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        
        const projectsGrid = document.getElementById('projectsGrid');
        if (!projectsGrid) return;
        
        projectsGrid.className = view === 'grid' ? 'projects-grid' : 'projects-list';
    }

    createNewProject() {
        this.showModal('مشروع جديد', this.getProjectForm());
    }

    getProjectForm() {
        const form = document.createElement('form');
        form.className = 'project-form';
        form.innerHTML = `
            <div class="form-group">
                <label>اسم المشروع</label>
                <input type="text" class="project-name-input" required>
            </div>
            <div class="form-group">
                <label>وصف المشروع</label>
                <textarea class="project-description-input" rows="4" required></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>الميزانية</label>
                    <input type="number" class="project-budget-input" min="100" required>
                </div>
                <div class="form-group">
                    <label>المهلة (أيام)</label>
                    <input type="number" class="project-deadline-input" min="1" required>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="action-btn outline cancel-project">إلغاء</button>
                <button type="submit" class="action-btn create-project">إنشاء</button>
            </div>
        `;
        
        form.querySelector('.cancel-project').addEventListener('click', () => this.closeModal());
        form.addEventListener('submit', (e) => this.handleCreateProject(e));
        
        return form;
    }

    async handleCreateProject(e) {
        e.preventDefault();
        
        const form = e.target;
        const name = form.querySelector('.project-name-input').value;
        const description = form.querySelector('.project-description-input').value;
        const budget = form.querySelector('.project-budget-input').value;
        const deadline = form.querySelector('.project-deadline-input').value;
        
        const newProject = {
            id: Date.now(),
            name,
            description,
            budget: parseInt(budget),
            deadline: parseInt(deadline),
            status: 'pending',
            progress: 0,
            createdAt: new Date().toISOString()
        };
        
        this.projects.push(newProject);
        this.saveData();
        
        this.showSuccess('تم إنشاء المشروع بنجاح');
        this.closeModal();
        this.displayFilteredProjects('all');
    }

    // === وظائف مساعدة ===
    
    generateDesignsHTML(designs) {
        return designs.map(design => `
            <div class="design-card" data-id="${design.id}">
                <div class="design-image">
                    <img src="https://via.placeholder.com/300x200/0a9396/fff?text=${encodeURIComponent(design.name)}" 
                         alt="${design.name}">
                    <div class="design-overlay">
                        <button class="overlay-btn like-btn">
                            <i class="far fa-heart"></i>
                            <span>${design.likes || 0}</span>
                        </button>
                        <button class="overlay-btn view-btn">
                            <i class="fas fa-eye"></i>
                            <span>${design.views || 0}</span>
                        </button>
                    </div>
                </div>
                <div class="design-info">
                    <h3 class="design-title">${design.name}</h3>
                    <p class="design-description">${design.description}</p>
                    <div class="design-meta">
                        <div class="designer-info">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(design.designer)}&background=0a9396&color=fff" 
                                 alt="${design.designer}" class="designer-avatar">
                            <span class="designer-name">${design.designer}</span>
                        </div>
                        <div class="design-price">${design.price} ريال</div>
                    </div>
                    <div class="design-tags">
                        <span class="tag">${design.category}</span>
                        <span class="tag">${design.tags?.[0] || 'تصميم'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    generateProjectsHTML(projects) {
        return projects.map(project => `
            <div class="project-card ${project.status}">
                <div class="project-header">
                    <div class="project-title">
                        <h3>${project.name}</h3>
                        <span class="project-id">#PRJ-${project.id.toString().slice(-3)}</span>
                    </div>
                    <div class="project-status ${project.status}">
                        <i class="fas fa-circle"></i>
                        ${this.getStatusText(project.status)}
                    </div>
                </div>
                <div class="project-description">
                    <p>${project.description}</p>
                </div>
                <div class="project-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${this.formatDate(project.createdAt)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${project.deadline} أيام</span>
                    </div>
                </div>
                <div class="project-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                    <span class="progress-text">${project.progress}% مكتمل</span>
                </div>
                <div class="project-footer">
                    <div class="project-budget">
                        <span class="budget-label">الميزانية</span>
                        <span class="budget-value">${project.budget} ريال</span>
                    </div>
                    <div class="project-actions">
                        <button class="action-btn small outline view-project" data-id="${project.id}">
                            <i class="fas fa-eye"></i>
                            عرض
                        </button>
                        <button class="action-btn small chat-project" data-id="${project.id}">
                            <i class="fas fa-comment"></i>
                            محادثة
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getCategories() {
        return [
            { id: 1, name: 'جميع التصاميم', icon: 'fa-palette' },
            { id: 2, name: 'إعلانات', icon: 'fa-bullhorn' },
            { id: 3, name: 'بروشورات', icon: 'fa-book' },
            { id: 4, name: 'ملابس', icon: 'fa-tshirt' },
            { id: 5, name: 'تطبيقات', icon: 'fa-mobile-alt' },
            { id: 6, name: 'هويات بصرية', icon: 'fa-building' },
            { id: 7, name: 'فيديو', icon: 'fa-video' },
            { id: 8, name: 'تصوير', icon: 'fa-camera' }
        ];
    }

    getSampleDesigns() {
        return [
            {
                id: 1,
                name: 'تصميم إعلان لمطعم',
                description: 'تصميم إعلاني احترافي لمطعم متخصص في المأكولات العربية',
                price: 450,
                designer: 'أحمد المصمم',
                category: 'إعلانات',
                tags: ['إعلان', 'طعام', 'ألوان زاهية'],
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
                tags: ['شعار', 'تقنية', 'عصري'],
                likes: 89,
                views: 1800
            },
            {
                id: 3,
                name: 'بروشور لمؤتمر تعليمي',
                description: 'تصميم بروشور ثلاثي الطيات لمؤتمر التعليم الإلكتروني',
                price: 350,
                designer: 'خالد المصمم',
                category: 'بروشورات',
                tags: ['بروشور', 'تعليم', 'مهني'],
                likes: 67,
                views: 1200
            },
            {
                id: 4,
                name: 'تصميم قميص رياضي',
                description: 'تصميم جرافيكي لقميص رياضي لفريق كرة سلة',
                price: 280,
                designer: 'نور المصممة',
                category: 'ملابس',
                tags: ['ملابس', 'رياضة', 'جرافيك'],
                likes: 210,
                views: 3400
            }
        ];
    }

    getSampleProjects() {
        return [
            {
                id: 1001,
                name: 'تصميم شعار لمطعم',
                description: 'تصميم شعار عصري لمطعم متخصص في المأكولات البحرية',
                budget: 1200,
                deadline: 5,
                status: 'active',
                progress: 60,
                createdAt: '2024-02-15T10:30:00Z'
            },
            {
                id: 1002,
                name: 'بروشور لمؤتمر',
                description: 'تصميم بروشور ثلاثي الطيات لمؤتمر التعليم الإلكتروني',
                budget: 800,
                deadline: 14,
                status: 'pending',
                progress: 0,
                createdAt: '2024-02-10T14:45:00Z'
            },
            {
                id: 1003,
                name: 'هوية بصرية لشركة',
                description: 'تصميم هوية بصرية كاملة لشركة تقنية ناشئة',
                budget: 2500,
                deadline: 30,
                status: 'completed',
                progress: 100,
                createdAt: '2024-01-05T09:00:00Z'
            }
        ];
    }

    generateMoreDesigns() {
        // إنشاء تصاميم إضافية
        const newDesigns = [];
        const categories = ['إعلانات', 'بروشورات', 'ملابس', 'هويات بصرية'];
        const designers = ['أحمد المصمم', 'سارة المصممة', 'خالد المصمم', 'نور المصممة'];
        
        for (let i = 0; i < 4; i++) {
            newDesigns.push({
                id: Date.now() + i,
                name: `تصميم جديد ${i + 1}`,
                description: 'وصف للتصميم الجديد',
                price: Math.floor(Math.random() * 500) + 100,
                designer: designers[Math.floor(Math.random() * designers.length)],
                category: categories[Math.floor(Math.random() * categories.length)],
                likes: Math.floor(Math.random() * 100),
                views: Math.floor(Math.random() * 2000)
            });
        }
        
        return newDesigns;
    }

    getUploadedFiles() {
        const files = [];
        document.querySelectorAll('.uploaded-file').forEach(file => {
            const name = file.querySelector('span').textContent;
            const size = file.querySelector('small').textContent;
            files.push({ name, size });
        });
        return files;
    }

    updateReviewSummary() {
        // تحديث عنوان المشروع
        const title = document.getElementById('projectTitle').value;
        if (title) {
            document.getElementById('reviewTitle').textContent = title;
        }
        
        // تحديث الوصف
        const description = document.getElementById('projectDescription').value;
        if (description) {
            document.getElementById('reviewDescription').textContent = description;
        }
        
        // تحديث الميزانية
        const budget = document.getElementById('projectBudget').value;
        if (budget) {
            document.getElementById('reviewBudget').textContent = `${parseInt(budget).toLocaleString()} ريال`;
        }
        
        // تحديث موعد التسليم
        const delivery = document.querySelector('.delivery-option.selected span');
        if (delivery) {
            document.getElementById('reviewDelivery').textContent = delivery.textContent;
        }
    }

    getStatusText(status) {
        const statusMap = {
            active: 'نشط',
            pending: 'قيد الانتظار',
            completed: 'مكتمل',
            revision: 'تحت المراجعة'
        };
        
        return statusMap[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showFiltersModal() {
        const modalContent = document.createElement('div');
        modalContent.className = 'filters-modal';
        modalContent.innerHTML = `
            <h3>فلترة التصاميم</h3>
            <div class="filter-options">
                <div class="filter-group">
                    <label>السعر</label>
                    <input type="range" id="priceRange" min="0" max="5000" step="100" value="5000">
                    <div class="range-labels">
                        <span>0 ريال</span>
                        <span id="maxPrice">5000 ريال</span>
                    </div>
                </div>
                <div class="filter-group">
                    <label>التقييم</label>
                    <select id="ratingFilter">
                        <option value="0">جميع التقييمات</option>
                        <option value="4">4 نجوم فأكثر</option>
                        <option value="3">3 نجوم فأكثر</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>تاريخ النشر</label>
                    <select id="dateFilter">
                        <option value="all">الكل</option>
                        <option value="today">اليوم</option>
                        <option value="week">هذا الأسبوع</option>
                        <option value="month">هذا الشهر</option>
                    </select>
                </div>
            </div>
            <div class="filter-actions">
                <button class="action-btn outline" id="resetFilters">إعادة تعيين</button>
                <button class="action-btn" id="applyFilters">تطبيق الفلترة</button>
            </div>
        `;
        
        this.showModal('فلترة التصاميم', modalContent);
        
        // إضافة مستمعي الأحداث
        const priceRange = modalContent.querySelector('#priceRange');
        const maxPrice = modalContent.querySelector('#maxPrice');
        
        priceRange.addEventListener('input', (e) => {
            maxPrice.textContent = `${e.target.value} ريال`;
        });
        
        modalContent.querySelector('#resetFilters').addEventListener('click', () => {
            priceRange.value = 5000;
            maxPrice.textContent = '5000 ريال';
        });
        
        modalContent.querySelector('#applyFilters').addEventListener('click', () => {
            this.applyFilters({
                maxPrice: priceRange.value,
                minRating: modalContent.querySelector('#ratingFilter').value,
                dateFilter: modalContent.querySelector('#dateFilter').value
            });
            this.closeModal();
        });
    }

    applyFilters(filters) {
        let filtered = this.designs;
        
        // فلترة بالسعر
        if (filters.maxPrice < 5000) {
            filtered = filtered.filter(design => design.price <= filters.maxPrice);
        }
        
        // فلترة بالتقييم
        if (filters.minRating > 0) {
            // في الحقيقي، ستكون هناك بيانات تقييم
            filtered = filtered.filter(design => design.rating >= filters.minRating);
        }
        
        // تطبيق الفلترة
        const designsGrid = document.querySelector('.designs-grid');
        if (designsGrid) {
            designsGrid.innerHTML = this.generateDesignsHTML(filtered);
        }
        
        this.showSuccess('تم تطبيق الفلترة');
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

// تهيئة مدير التصاميم
document.addEventListener('DOMContentLoaded', () => {
    window.designManager = new DesignManager();
});
