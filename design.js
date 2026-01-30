// نظام إدارة التصاميم المتقدم لبيكسل آرت

class DesignManager {
    constructor() {
        this.currentDesign = null;
        this.designTools = [];
        this.activeTool = null;
        this.canvas = null;
        this.context = null;
        this.history = [];
        this.historyIndex = -1;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.selectedColor = '#0a9396';
        this.brushSize = 5;
        this.brushType = 'round';
        this.layers = [];
        this.activeLayer = null;
        this.gridEnabled = false;
        this.snapToGrid = false;
        this.gridSize = 20;
        this.zoomLevel = 1;
    }
    
    async init() {
        // تهيئة أدوات التصميم
        this.initDesignTools();
        
        // تهيئة لوحة الرسم
        await this.initCanvas();
        
        // تحميل القوالب الجاهزة
        await this.loadTemplates();
        
        // تحميل تصاميم المستخدم
        await this.loadUserDesigns();
        
        // تهيئة الأحداث
        this.initEvents();
        
        // بدء تحديث تلقائي للحفظ
        this.startAutoSave();
    }
    
    initDesignTools() {
        this.designTools = [
            {
                id: 'brush',
                name: 'فرشاة',
                icon: 'fas fa-paint-brush',
                description: 'أداة الرسم الأساسية',
                category: 'drawing',
                settings: {
                    size: { min: 1, max: 50, step: 1, value: 5 },
                    opacity: { min: 0.1, max: 1, step: 0.1, value: 1 },
                    type: { options: ['round', 'square', 'triangle'], value: 'round' }
                }
            },
            {
                id: 'shape',
                name: 'أشكال',
                icon: 'fas fa-shapes',
                description: 'إضافة أشكال هندسية',
                category: 'drawing',
                settings: {
                    type: { options: ['rectangle', 'circle', 'triangle', 'line'], value: 'rectangle' },
                    fill: { type: 'color', value: '#0a9396' },
                    stroke: { type: 'color', value: '#000000' },
                    strokeWidth: { min: 1, max: 20, step: 1, value: 2 }
                }
            },
            {
                id: 'text',
                name: 'نص',
                icon: 'fas fa-font',
                description: 'إضافة نص إلى التصميم',
                category: 'text',
                settings: {
                    fontFamily: { 
                        options: ['Arial', 'Times New Roman', 'Cairo', 'Tajawal'], 
                        value: 'Cairo' 
                    },
                    fontSize: { min: 8, max: 72, step: 1, value: 24 },
                    color: { type: 'color', value: '#000000' },
                    alignment: { options: ['right', 'center', 'left'], value: 'right' },
                    bold: { type: 'boolean', value: false },
                    italic: { type: 'boolean', value: false }
                }
            },
            {
                id: 'eraser',
                name: 'ممحاة',
                icon: 'fas fa-eraser',
                description: 'مسح أجزاء من التصميم',
                category: 'drawing',
                settings: {
                    size: { min: 5, max: 100, step: 5, value: 20 },
                    opacity: { min: 0.1, max: 1, step: 0.1, value: 1 }
                }
            },
            {
                id: 'select',
                name: 'تحديد',
                icon: 'fas fa-mouse-pointer',
                description: 'تحديد وتحريك العناصر',
                category: 'selection',
                settings: {
                    mode: { options: ['rectangle', 'lasso', 'magic'], value: 'rectangle' }
                }
            },
            {
                id: 'fill',
                name: 'ملء',
                icon: 'fas fa-fill-drip',
                description: 'ملء المساحة بلون',
                category: 'drawing',
                settings: {
                    tolerance: { min: 0, max: 255, step: 1, value: 10 }
                }
            },
            {
                id: 'gradient',
                name: 'تدرج لوني',
                icon: 'fas fa-sliders-h',
                description: 'إنشاء تدرجات لونية',
                category: 'effects',
                settings: {
                    type: { options: ['linear', 'radial'], value: 'linear' },
                    colors: { type: 'color-list', value: ['#0a9396', '#94d2bd'] },
                    angle: { min: 0, max: 360, step: 1, value: 45 }
                }
            },
            {
                id: 'filter',
                name: 'مرشحات',
                icon: 'fas fa-sliders-h',
                description: 'تطبيق مرشحات على الصورة',
                category: 'effects',
                settings: {
                    type: { 
                        options: ['blur', 'brightness', 'contrast', 'grayscale', 'sepia'],
                        value: 'brightness'
                    },
                    intensity: { min: 0, max: 100, step: 1, value: 50 }
                }
            },
            {
                id: 'crop',
                name: 'قص',
                icon: 'fas fa-crop',
                description: 'قص الصورة',
                category: 'transform',
                settings: {
                    ratio: { 
                        options: ['free', '1:1', '4:3', '16:9', 'custom'],
                        value: 'free'
                    }
                }
            },
            {
                id: 'layers',
                name: 'طبقات',
                icon: 'fas fa-layer-group',
                description: 'إدارة طبقات التصميم',
                category: 'organization',
                settings: {}
            }
        ];
    }
    
    async initCanvas() {
        // إنشاء عنصر canvas إذا لم يكن موجوداً
        let canvas = document.getElementById('designCanvas');
        
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'designCanvas';
            canvas.width = 800;
            canvas.height = 600;
            canvas.style.border = '1px solid #ddd';
            canvas.style.backgroundColor = 'white';
            
            const container = document.querySelector('.design-tools-section') || document.body;
            container.appendChild(canvas);
        }
        
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        
        // تهيئة الطبقة الأولى
        this.addLayer('الخلفية', true);
        
        // تحسين جودة الرسم
        this.context.imageSmoothingEnabled = true;
        this.context.imageSmoothingQuality = 'high';
        
        // تعيين خلفية بيضاء
        this.clearCanvas();
    }
    
    initEvents() {
        if (!this.canvas) return;
        
        // أحداث الماوس
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // أحداث اللمس
        this.canvas.addEventListener('touchstart', (e) => this.startDrawing(this.getTouchPosition(e)));
        this.canvas.addEventListener('touchmove', (e) => this.draw(this.getTouchPosition(e)));
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
        
        // أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // حدث تغيير الحجم
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    getTouchPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        
        return {
            offsetX: touch.clientX - rect.left,
            offsetY: touch.clientY - rect.top,
            clientX: touch.clientX,
            clientY: touch.clientY
        };
    }
    
    startDrawing(e) {
        if (!this.activeTool) return;
        
        this.isDrawing = true;
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
        
        // حفظ حالة الحالية في التاريخ
        this.saveState();
        
        // تطبيق الأداة النشطة
        this.applyTool('start', e);
    }
    
    draw(e) {
        if (!this.isDrawing || !this.activeTool) return;
        
        // تطبيق الأداة النشطة
        this.applyTool('draw', e);
        
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    }
    
    stopDrawing() {
        this.isDrawing = false;
        this.applyTool('stop');
    }
    
    applyTool(action, e) {
        if (!this.activeTool) return;
        
        switch (this.activeTool.id) {
            case 'brush':
                this.useBrush(action, e);
                break;
            case 'eraser':
                this.useEraser(action, e);
                break;
            case 'shape':
                if (action === 'start') this.startShape(e);
                break;
            case 'text':
                if (action === 'start') this.addText(e);
                break;
            case 'fill':
                if (action === 'start') this.fillArea(e);
                break;
        }
    }
    
    useBrush(action, e) {
        if (action === 'start') {
            this.context.beginPath();
            this.context.moveTo(this.lastX, this.lastY);
        } else if (action === 'draw') {
            this.context.lineCap = this.brushType;
            this.context.lineJoin = 'round';
            this.context.lineWidth = this.brushSize;
            this.context.strokeStyle = this.selectedColor;
            
            this.context.lineTo(e.offsetX, e.offsetY);
            this.context.stroke();
            this.context.beginPath();
            this.context.moveTo(e.offsetX, e.offsetY);
        }
    }
    
    useEraser(action, e) {
        if (action === 'start') {
            this.context.beginPath();
            this.context.globalCompositeOperation = 'destination-out';
        } else if (action === 'draw') {
            this.context.lineWidth = this.brushSize * 2;
            this.context.lineTo(e.offsetX, e.offsetY);
            this.context.stroke();
            this.context.beginPath();
            this.context.moveTo(e.offsetX, e.offsetY);
        } else if (action === 'stop') {
            this.context.globalCompositeOperation = 'source-over';
        }
    }
    
    startShape(e) {
        const shape = this.activeTool.settings.type.value;
        const fill = this.activeTool.settings.fill.value;
        const stroke = this.activeTool.settings.stroke.value;
        const strokeWidth = this.activeTool.settings.strokeWidth.value;
        
        const startX = e.offsetX;
        const startY = e.offsetY;
        
        const drawShape = (endX, endY) => {
            const width = endX - startX;
            const height = endY - startY;
            
            this.context.beginPath();
            
            switch (shape) {
                case 'rectangle':
                    this.context.rect(startX, startY, width, height);
                    break;
                case 'circle':
                    const radius = Math.sqrt(width * width + height * height) / 2;
                    this.context.arc(startX, startY, radius, 0, Math.PI * 2);
                    break;
                case 'triangle':
                    this.context.moveTo(startX, startY);
                    this.context.lineTo(endX, endY);
                    this.context.lineTo(startX * 2 - endX, endY);
                    this.context.closePath();
                    break;
                case 'line':
                    this.context.moveTo(startX, startY);
                    this.context.lineTo(endX, endY);
                    break;
            }
            
            if (fill && shape !== 'line') {
                this.context.fillStyle = fill;
                this.context.fill();
            }
            
            if (stroke) {
                this.context.strokeStyle = stroke;
                this.context.lineWidth = strokeWidth;
                this.context.stroke();
            }
        };
        
        // رسم مؤقت أثناء السحب
        const tempDraw = (moveEvent) => {
            this.restoreState();
            drawShape(moveEvent.offsetX, moveEvent.offsetY);
        };
        
        // رسم نهائي عند تحرير الماوس
        const finalDraw = (upEvent) => {
            this.saveState();
            drawShape(upEvent.offsetX, upEvent.offsetY);
            this.canvas.removeEventListener('mousemove', tempDraw);
            this.canvas.removeEventListener('mouseup', finalDraw);
        };
        
        this.canvas.addEventListener('mousemove', tempDraw);
        this.canvas.addEventListener('mouseup', finalDraw);
    }
    
    addText(e) {
        const text = prompt('أدخل النص:', 'نص تجريبي');
        if (!text) return;
        
        const fontFamily = this.activeTool.settings.fontFamily.value;
        const fontSize = this.activeTool.settings.fontSize.value;
        const color = this.activeTool.settings.color.value;
        const alignment = this.activeTool.settings.alignment.value;
        const bold = this.activeTool.settings.bold.value ? 'bold ' : '';
        const italic = this.activeTool.settings.italic.value ? 'italic ' : '';
        
        this.context.font = `${bold}${italic}${fontSize}px ${fontFamily}`;
        this.context.fillStyle = color;
        this.context.textAlign = alignment;
        this.context.textBaseline = 'middle';
        
        this.saveState();
        this.context.fillText(text, e.offsetX, e.offsetY);
    }
    
    fillArea(e) {
        // هذا مثال مبسط، في التطبيق الحقيقي تحتاج إلى خوارزمية Flood Fill
        this.context.fillStyle = this.selectedColor;
        this.context.fillRect(e.offsetX - 25, e.offsetY - 25, 50, 50);
    }
    
    setActiveTool(toolId) {
        const tool = this.designTools.find(t => t.id === toolId);
        if (tool) {
            this.activeTool = tool;
            this.updateToolUI();
        }
    }
    
    updateToolUI() {
        // تحديث واجهة إعدادات الأداة النشطة
        const settingsPanel = document.getElementById('toolSettings');
        if (!settingsPanel || !this.activeTool) return;
        
        let html = `<h4>${this.activeTool.name}</h4>`;
        
        for (const [key, setting] of Object.entries(this.activeTool.settings)) {
            html += this.createSettingControl(key, setting);
        }
        
        settingsPanel.innerHTML = html;
        
        // إضافة أحداث للضوابط
        this.bindSettingEvents();
    }
    
    createSettingControl(key, setting) {
        let control = '';
        
        if (setting.type === 'color') {
            control = `
                <div class="setting-group">
                    <label>${key}</label>
                    <input type="color" value="${setting.value}" data-setting="${key}">
                </div>
            `;
        } else if (setting.type === 'color-list') {
            const colors = setting.value.map((color, index) => `
                <input type="color" value="${color}" data-setting="${key}" data-index="${index}">
            `).join('');
            
            control = `
                <div class="setting-group">
                    <label>${key}</label>
                    <div class="color-list">${colors}</div>
                </div>
            `;
        } else if (setting.type === 'boolean') {
            control = `
                <div class="setting-group">
                    <label>
                        <input type="checkbox" ${setting.value ? 'checked' : ''} data-setting="${key}">
                        ${key}
                    </label>
                </div>
            `;
        } else if (setting.options) {
            const options = setting.options.map(opt => 
                `<option value="${opt}" ${opt === setting.value ? 'selected' : ''}>${opt}</option>`
            ).join('');
            
            control = `
                <div class="setting-group">
                    <label>${key}</label>
                    <select data-setting="${key}">${options}</select>
                </div>
            `;
        } else {
            // نطاق رقمية
            control = `
                <div class="setting-group">
                    <label>${key}</label>
                    <input type="range" min="${setting.min}" max="${setting.max}" 
                           step="${setting.step}" value="${setting.value}" 
                           data-setting="${key}">
                    <span class="value-display">${setting.value}</span>
                </div>
            `;
        }
        
        return control;
    }
    
    bindSettingEvents() {
        const settingsPanel = document.getElementById('toolSettings');
        if (!settingsPanel) return;
        
        // أحداث ألوان
        settingsPanel.querySelectorAll('input[type="color"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const key = e.target.dataset.setting;
                const index = e.target.dataset.index;
                
                if (index !== undefined) {
                    this.activeTool.settings[key].value[index] = e.target.value;
                } else {
                    this.activeTool.settings[key].value = e.target.value;
                    
                    if (key === 'color') {
                        this.selectedColor = e.target.value;
                    }
                }
            });
        });
        
        // أحداث التحديد
        settingsPanel.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', (e) => {
                const key = e.target.dataset.setting;
                this.activeTool.settings[key].value = e.target.value;
            });
        });
        
        // أحداث النطاق
        settingsPanel.querySelectorAll('input[type="range"]').forEach(range => {
            range.addEventListener('input', (e) => {
                const key = e.target.dataset.setting;
                const value = parseFloat(e.target.value);
                this.activeTool.settings[key].value = value;
                
                // تحديث العرض
                const display = e.target.nextElementSibling;
                if (display && display.classList.contains('value-display')) {
                    display.textContent = value;
                }
                
                // تحديث حجم الفرشاة إذا كان الإعداد
                if (key === 'size') {
                    this.brushSize = value;
                }
            });
        });
        
        // أحداث التبديل
        settingsPanel.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const key = e.target.dataset.setting;
                this.activeTool.settings[key].value = e.target.checked;
            });
        });
    }
    
    // ===== إدارة الطبقات =====
    
    addLayer(name = `طبقة ${this.layers.length + 1}`, active = false) {
        const layer = {
            id: Date.now(),
            name,
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'normal',
            data: null,
            createdAt: new Date().toISOString()
        };
        
        this.layers.push(layer);
        
        if (active) {
            this.setActiveLayer(layer.id);
        }
        
        this.updateLayersUI();
        return layer;
    }
    
    setActiveLayer(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            this.activeLayer = layer;
            this.updateLayersUI();
        }
    }
    
    updateLayersUI() {
        const layersPanel = document.getElementById('layersPanel');
        if (!layersPanel) return;
        
        let html = `
            <div class="layers-header">
                <h4>الطبقات</h4>
                <button class="btn btn-sm" onclick="designManager.addLayer()">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="layers-list">
        `;
        
        this.layers.reverse().forEach(layer => {
            const isActive = this.activeLayer?.id === layer.id;
            
            html += `
                <div class="layer-item ${isActive ? 'active' : ''}" data-layer-id="${layer.id}">
                    <div class="layer-info">
                        <input type="checkbox" ${layer.visible ? 'checked' : ''} 
                               onchange="designManager.toggleLayerVisibility(${layer.id}, this.checked)">
                        <span class="layer-name">${layer.name}</span>
                    </div>
                    <div class="layer-actions">
                        <button class="btn btn-sm" onclick="designManager.setActiveLayer(${layer.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm" onclick="designManager.deleteLayer(${layer.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        layersPanel.innerHTML = html;
    }
    
    toggleLayerVisibility(layerId, visible) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.visible = visible;
            this.redrawLayers();
        }
    }
    
    deleteLayer(layerId) {
        if (this.layers.length <= 1) {
            alert('لا يمكن حذف الطبقة الأخيرة');
            return;
        }
        
        const index = this.layers.findIndex(l => l.id === layerId);
        if (index !== -1) {
            this.layers.splice(index, 1);
            
            if (this.activeLayer?.id === layerId) {
                this.activeLayer = this.layers[0];
            }
            
            this.updateLayersUI();
            this.redrawLayers();
        }
    }
    
    redrawLayers() {
        this.clearCanvas();
        
        // رسم الطبقات المرئية
        this.layers.forEach(layer => {
            if (layer.visible && layer.data) {
                // في تطبيق حقيقي، هنا يتم استعادة بيانات الطبقة
                // هذا مثال مبسط
                this.context.globalAlpha = layer.opacity;
                this.context.globalCompositeOperation = layer.blendMode;
                
                // رسم بيانات الطبقة
                if (layer.data instanceof ImageData) {
                    this.context.putImageData(layer.data, 0, 0);
                }
            }
        });
        
        this.context.globalAlpha = 1;
        this.context.globalCompositeOperation = 'source-over';
    }
    
    // ===== إدارة التاريخ =====
    
    saveState() {
        // حفظ الحالة الحالية في التاريخ
        const state = this.canvas.toDataURL();
        
        // إزالة الحالات بعد المؤشر الحالي
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(state);
        this.historyIndex++;
        
        // تحديد الحد الأقصى للتاريخ
        const maxHistory = 50;
        if (this.history.length > maxHistory) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    restoreState() {
        if (this.historyIndex >= 0) {
            const img = new Image();
            img.onload = () => {
                this.clearCanvas();
                this.context.drawImage(img, 0, 0);
            };
            img.src = this.history[this.historyIndex];
        } else {
            this.clearCanvas();
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState();
            return true;
        }
        return false;
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState();
            return true;
        }
        return false;
    }
    
    clearCanvas() {
        if (!this.canvas || !this.context) return;
        
        this.context.fillStyle = 'white';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // ===== تحميل وحفظ التصاميم =====
    
    async loadTemplates() {
        try {
            const templates = await window.db.getAllTemplates();
            this.displayTemplates(templates);
        } catch (error) {
            console.error('فشل تحميل القوالب:', error);
        }
    }
    
    displayTemplates(templates) {
        const container = document.getElementById('templatesContainer');
        if (!container) return;
        
        let html = '';
        
        templates.forEach(template => {
            html += `
                <div class="template-card" data-template-id="${template.id}">
                    <div class="template-preview">
                        <i class="fas fa-image"></i>
                    </div>
                    <div class="template-info">
                        <h5>${template.name}</h5>
                        <p>${template.description}</p>
                        <div class="template-meta">
                            <span class="category">${template.category}</span>
                            ${template.premium ? '<span class="premium-badge">Pro</span>' : ''}
                        </div>
                        <button class="btn btn-sm" onclick="designManager.useTemplate(${template.id})">
                            استخدام القالب
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    async useTemplate(templateId) {
        try {
            const template = await window.db.getTemplate(templateId);
            
            if (template) {
                // تطبيق القالب على لوحة الرسم
                this.clearCanvas();
                
                // في تطبيق حقيقي، هنا يتم تحميل ملفات القالب
                alert(`تم تحميل قالب: ${template.name}`);
                
                // زيادة عدد مرات التحميل
                await window.db.incrementTemplateDownloads(templateId);
            }
        } catch (error) {
            console.error('فشل استخدام القالب:', error);
        }
    }
    
    async loadUserDesigns() {
        try {
            const user = window.auth?.currentUser;
            if (!user) return;
            
            let designs;
            
            if (user.role === 'designer') {
                designs = await window.db.getDesignsByDesigner(user.id);
            } else {
                designs = await window.db.getAllDesigns();
            }
            
            this.displayUserDesigns(designs);
        } catch (error) {
            console.error('فشل تحميل تصاميم المستخدم:', error);
        }
    }
    
    displayUserDesigns(designs) {
        const container = document.getElementById('userDesignsContainer');
        if (!container) return;
        
        let html = '';
        
        designs.forEach(design => {
            html += `
                <div class="design-card" data-design-id="${design.id}">
                    <div class="design-preview">
                        <i class="fas fa-palette"></i>
                    </div>
                    <div class="design-info">
                        <h5>${design.title}</h5>
                        <p>${design.description}</p>
                        <div class="design-meta">
                            <span class="category">${design.category}</span>
                            <span class="rating">⭐ ${design.rating || 0}</span>
                        </div>
                        <div class="design-actions">
                            <button class="btn btn-sm" onclick="designManager.openDesign(${design.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm" onclick="designManager.exportDesign(${design.id})">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    async openDesign(designId) {
        try {
            const design = await window.db.getDesign(designId);
            
            if (design) {
                this.currentDesign = design;
                
                // تحميل بيانات التصميم على لوحة الرسم
                // هذا مثال مبسط
                if (design.files && design.files.length > 0) {
                    this.loadDesignFromFiles(design.files);
                }
                
                // تحديث واجهة التصميم
                this.updateDesignUI();
                
                alert(`تم فتح التصميم: ${design.title}`);
            }
        } catch (error) {
            console.error('فشل فتح التصميم:', error);
        }
    }
    
    async saveDesign() {
        try {
            const user = window.auth?.currentUser;
            if (!user) {
                throw new Error('يجب تسجيل الدخول لحفظ التصميم');
            }
            
            const designName = prompt('أدخل اسم التصميم:', 'تصميم جديد');
            if (!designName) return;
            
            // الحصول على بيانات الصورة
            const imageData = this.canvas.toDataURL('image/png');
            
            const design = {
                title: designName,
                description: 'تصميم تم إنشاؤه في بيكسل آرت',
                category: 'custom',
                designerId: user.id,
                designerName: user.name,
                tags: ['مخصص', 'بيكسل آرت'],
                price: 0,
                rating: 0,
                downloads: 0,
                views: 0,
                status: 'draft',
                files: [{
                    type: 'image',
                    url: imageData,
                    size: imageData.length,
                    uploadedAt: new Date().toISOString()
                }],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            await window.db.saveDesign(design);
            
            // إضافة إلى قائمة تصاميم المستخدم
            await this.loadUserDesigns();
            
            alert('تم حفظ التصميم بنجاح');
            
        } catch (error) {
            console.error('فشل حفظ التصميم:', error);
            alert(`فشل حفظ التصميم: ${error.message}`);
        }
    }
    
    async exportDesign(designId = null) {
        try {
            let imageData;
            
            if (designId) {
                // تصدير تصميم محفوظ
                const design = await window.db.getDesign(designId);
                if (design && design.files && design.files[0]) {
                    imageData = design.files[0].url;
                }
            } else {
                // تصدير التصميم الحالي
                imageData = this.canvas.toDataURL('image/png');
            }
            
            if (!imageData) {
                throw new Error('لا توجد بيانات للتصدير');
            }
            
            // إنشاء رابط للتحميل
            const link = document.createElement('a');
            link.href = imageData;
            link.download = `design-${Date.now()}.png`;
            link.click();
            
            // تسجيل حدث التصدير
            await window.db.saveAnalyticsEvent({
                event: 'design_exported',
                userId: window.auth?.currentUser?.id,
                designId,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('فشل تصدير التصميم:', error);
            alert(`فشل تصدير التصميم: ${error.message}`);
        }
    }
    
    // ===== الذكاء الاصطناعي للتصميم =====
    
    async generateAIDesign(prompt) {
        try {
            // محاكاة توليد تصميم بالذكاء الاصطناعي
            alert('جاري توليد التصميم باستخدام الذكاء الاصطناعي...');
            
            // في تطبيق حقيقي، هنا يكون اتصال بخدمة الذكاء الاصطناعي
            const mockDesign = await this.mockAIDesignGeneration(prompt);
            
            // تطبيق التصميم على لوحة الرسم
            this.applyAIDesign(mockDesign);
            
        } catch (error) {
            console.error('فشل توليد التصميم:', error);
            alert(`فشل توليد التصميم: ${error.message}`);
        }
    }
    
    async mockAIDesignGeneration(prompt) {
        return new Promise(resolve => {
            setTimeout(() => {
                // إنشاء تصميم عشوائي مبني على النص
                const colors = [
                    '#0a9396', '#005f73', '#94d2bd', '#ee9b00', 
                    '#ca6702', '#9b2226', '#264653', '#2a9d8f'
                ];
                
                const shapes = ['circle', 'rectangle', 'triangle', 'line'];
                
                const design = {
                    elements: [],
                    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                    prompt: prompt
                };
                
                // إنشاء 5-10 عناصر عشوائية
                const elementCount = Math.floor(Math.random() * 6) + 5;
                
                for (let i = 0; i < elementCount; i++) {
                    design.elements.push({
                        type: shapes[Math.floor(Math.random() * shapes.length)],
                        color: colors[Math.floor(Math.random() * colors.length)],
                        x: Math.random() * 700 + 50,
                        y: Math.random() * 500 + 50,
                        width: Math.random() * 100 + 50,
                        height: Math.random() * 100 + 50,
                        rotation: Math.random() * 360
                    });
                }
                
                resolve(design);
            }, 2000);
        });
    }
    
    applyAIDesign(design) {
        this.clearCanvas();
        
        // تعيين الخلفية
        this.context.fillStyle = design.backgroundColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // رسم العناصر
        design.elements.forEach(element => {
            this.context.save();
            this.context.translate(element.x, element.y);
            this.context.rotate(element.rotation * Math.PI / 180);
            
            this.context.fillStyle = element.color;
            
            switch (element.type) {
                case 'circle':
                    this.context.beginPath();
                    this.context.arc(0, 0, element.width / 2, 0, Math.PI * 2);
                    this.context.fill();
                    break;
                    
                case 'rectangle':
                    this.context.fillRect(-element.width / 2, -element.height / 2, element.width, element.height);
                    break;
                    
                case 'triangle':
                    this.context.beginPath();
                    this.context.moveTo(0, -element.height / 2);
                    this.context.lineTo(element.width / 2, element.height / 2);
                    this.context.lineTo(-element.width / 2, element.height / 2);
                    this.context.closePath();
                    this.context.fill();
                    break;
                    
                case 'line':
                    this.context.strokeStyle = element.color;
                    this.context.lineWidth = 5;
                    this.context.beginPath();
                    this.context.moveTo(-element.width / 2, 0);
                    this.context.lineTo(element.width / 2, 0);
                    this.context.stroke();
                    break;
            }
            
            this.context.restore();
        });
        
        this.saveState();
    }
    
    // ===== أدوات متقدمة =====
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        if (!container) return;
        
        // الحفاظ على نسبة الأبعاد
        const aspectRatio = this.canvas.width / this.canvas.height;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        let newWidth = containerWidth;
        let newHeight = containerWidth / aspectRatio;
        
        if (newHeight > containerHeight) {
            newHeight = containerHeight;
            newWidth = containerHeight * aspectRatio;
        }
        
        this.canvas.style.width = `${newWidth}px`;
        this.canvas.style.height = `${newHeight}px`;
    }
    
    handleKeyboard(e) {
        // اختصارات لوحة المفاتيح
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            this.undo();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            this.redo();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveDesign();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            this.clearSelection();
        }
    }
    
    clearSelection() {
        // مسح المنطقة المحددة
        // هذا مثال مبسط
        this.clearCanvas();
        this.saveState();
    }
    
    startAutoSave() {
        // الحفظ التلقائي كل 30 ثانية
        setInterval(() => {
            if (this.currentDesign && this.history.length > 0) {
                this.autoSave();
            }
        }, 30000);
    }
    
    async autoSave() {
        try {
            if (!this.currentDesign) return;
            
            const imageData = this.canvas.toDataURL('image/png');
            
            this.currentDesign.files = [{
                type: 'image',
                url: imageData,
                size: imageData.length,
                uploadedAt: new Date().toISOString()
            }];
            
            this.currentDesign.updatedAt = new Date().toISOString();
            
            await window.db.saveDesign(this.currentDesign);
            
            console.log('تم الحفظ التلقائي للتصميم');
            
        } catch (error) {
            console.error('فشل الحفظ التلقائي:', error);
        }
    }
    
    updateDesignUI() {
        if (!this.currentDesign) return;
        
        // تحديث واجهة معلومات التصميم
        const infoPanel = document.getElementById('designInfo');
        if (infoPanel) {
            infoPanel.innerHTML = `
                <h4>${this.currentDesign.title}</h4>
                <p>${this.currentDesign.description}</p>
                <div class="design-meta">
                    <span>الفئة: ${this.currentDesign.category}</span>
                    <span>آخر تحديث: ${new Date(this.currentDesign.updatedAt).toLocaleString('ar-SA')}</span>
                </div>
            `;
        }
    }
    
    loadDesignFromFiles(files) {
        // تحميل التصميم من الملفات
        // هذا مثال مبسط
        const imageFile = files.find(f => f.type === 'image');
        
        if (imageFile) {
            const img = new Image();
            img.onload = () => {
                this.context.drawImage(img, 0, 0);
                this.saveState();
            };
            img.src = imageFile.url;
        }
    }
    
    // ===== أدوات التصدير والاستيراد =====
    
    async importImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.clearCanvas();
                    
                    // احتواء الصورة داخل اللوحة
                    const ratio = Math.min(
                        this.canvas.width / img.width,
                        this.canvas.height / img.height
                    );
                    
                    const width = img.width * ratio;
                    const height = img.height * ratio;
                    const x = (this.canvas.width - width) / 2;
                    const y = (this.canvas.height - height) / 2;
                    
                    this.context.drawImage(img, x, y, width, height);
                    this.saveState();
                    
                    resolve();
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    async exportToPDF() {
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            const imageData = this.canvas.toDataURL('image/png');
            const imgWidth = 190; // A4 width in mm
            const imgHeight = (this.canvas.height * imgWidth) / this.canvas.width;
            
            pdf.addImage(imageData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save(`design-${Date.now()}.pdf`);
            
        } catch (error) {
            console.error('فشل التصدير إلى PDF:', error);
            alert('فشل التصدير إلى PDF. تأكد من تحميل مكتبة jsPDF.');
        }
    }
    
    async printDesign() {
        const printWindow = window.open('', '_blank');
        const imageData = this.canvas.toDataURL('image/png');
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>طباعة التصميم</title>
                    <style>
                        body { margin: 0; padding: 20px; text-align: center; }
                        img { max-width: 100%; height: auto; }
                        .print-info { margin-bottom: 20px; text-align: right; }
                    </style>
                </head>
                <body>
                    <div class="print-info">
                        <h3>بيكسل آرت - ${this.currentDesign?.title || 'تصميم'}</h3>
                        <p>تاريخ الطباعة: ${new Date().toLocaleString('ar-SA')}</p>
                    </div>
                    <img src="${imageData}" alt="التصميم">
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
}

// تهيئة مدير التصاميم
const designManager = new DesignManager();
window.designManager = designManager;

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await designManager.init();
        console.log('تم تهيئة نظام إدارة التصاميم بنجاح');
    } catch (error) {
        console.error('فشل تهيئة نظام إدارة التصاميم:', error);
    }
});

// تصدير للاستخدام في الملفات الأخرى
export default designManager;