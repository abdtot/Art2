// قاعدة البيانات المتقدمة باستخدام IndexedDB

class PixelArtDatabase {
    constructor() {
        this.dbName = 'PixelArtDB_Advanced';
        this.dbVersion = 3;
        this.db = null;
        this.initialized = false;
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = (event) => {
                console.error('فشل فتح قاعدة البيانات:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.initialized = true;
                console.log('تم فتح قاعدة البيانات بنجاح');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.createStores(db);
                this.initializeData(db);
            };
        });
    }
    
        createStores(db) {
        // جدول المستخدمين
        if (!db.objectStoreNames.contains('users')) {
            const userStore = db.createObjectStore('users', { keyPath: 'id' });
            userStore.createIndex('email', 'email', { unique: true });
            userStore.createIndex('role', 'role', { unique: false });
            userStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        // جدول التصاميم
        if (!db.objectStoreNames.contains('designs')) {
            const designStore = db.createObjectStore('designs', { keyPath: 'id', autoIncrement: true });
            designStore.createIndex('category', 'category', { unique: false });
            designStore.createIndex('designerId', 'designerId', { unique: false });
            designStore.createIndex('status', 'status', { unique: false });
            designStore.createIndex('createdAt', 'createdAt', { unique: false });
            designStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }
        
        // جدول المشاريع
        if (!db.objectStoreNames.contains('projects')) {
            const projectStore = db.createObjectStore('projects', { keyPath: 'id', autoIncrement: true });
            projectStore.createIndex('clientId', 'clientId', { unique: false });
            projectStore.createIndex('designerId', 'designerId', { unique: false });
            projectStore.createIndex('status', 'status', { unique: false });
            projectStore.createIndex('deadline', 'deadline', { unique: false });
            projectStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        // جدول الطلبات
        if (!db.objectStoreNames.contains('orders')) {
            const orderStore = db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
            orderStore.createIndex('clientId', 'clientId', { unique: false });
            orderStore.createIndex('designerId', 'designerId', { unique: false });
            orderStore.createIndex('status', 'status', { unique: false });
            orderStore.createIndex('createdAt', 'createdAt', { unique: false });
            orderStore.createIndex('projectId', 'projectId', { unique: false });
        }
        
        // جدول الرسائل
        if (!db.objectStoreNames.contains('messages')) {
            const messageStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
            messageStore.createIndex('conversationId', 'conversationId', { unique: false });
            messageStore.createIndex('senderId', 'senderId', { unique: false });
            messageStore.createIndex('receiverId', 'receiverId', { unique: false });
            messageStore.createIndex('timestamp', 'timestamp', { unique: false });
            messageStore.createIndex('read', 'read', { unique: false });
        }
        
        // جدول المحادثات
        if (!db.objectStoreNames.contains('conversations')) {
            const conversationStore = db.createObjectStore('conversations', { keyPath: 'id', autoIncrement: true });
            conversationStore.createIndex('participants', 'participants', { unique: false, multiEntry: true });
            conversationStore.createIndex('lastMessageAt', 'lastMessageAt', { unique: false });
            conversationStore.createIndex('unreadCount', 'unreadCount', { unique: false });
        }
        
        // جدول الإشعارات
        if (!db.objectStoreNames.contains('notifications')) {
            const notificationStore = db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
            notificationStore.createIndex('userId', 'userId', { unique: false });
            notificationStore.createIndex('type', 'type', { unique: false });
            notificationStore.createIndex('read', 'read', { unique: false });
            notificationStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        // جدول المعاملات المالية
        if (!db.objectStoreNames.contains('transactions')) {
            const transactionStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
            transactionStore.createIndex('userId', 'userId', { unique: false });
            transactionStore.createIndex('type', 'type', { unique: false });
            transactionStore.createIndex('status', 'status', { unique: false });
            transactionStore.createIndex('date', 'date', { unique: false });
            transactionStore.createIndex('amount', 'amount', { unique: false });
        }
        
        // جدول الفواتير
        if (!db.objectStoreNames.contains('invoices')) {
            const invoiceStore = db.createObjectStore('invoices', { keyPath: 'id', autoIncrement: true });
            invoiceStore.createIndex('clientId', 'clientId', { unique: false });
            invoiceStore.createIndex('designerId', 'designerId', { unique: false });
            invoiceStore.createIndex('status', 'status', { unique: false });
            invoiceStore.createIndex('dueDate', 'dueDate', { unique: false });
            invoiceStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        // جدول التقييمات
        if (!db.objectStoreNames.contains('reviews')) {
            const reviewStore = db.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true });
            reviewStore.createIndex('designerId', 'designerId', { unique: false });
            reviewStore.createIndex('clientId', 'clientId', { unique: false });
            reviewStore.createIndex('projectId', 'projectId', { unique: false });
            reviewStore.createIndex('rating', 'rating', { unique: false });
            reviewStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        // جدول المحفظة
        if (!db.objectStoreNames.contains('wallets')) {
            const walletStore = db.createObjectStore('wallets', { keyPath: 'userId' });
            walletStore.createIndex('balance', 'balance', { unique: false });
            walletStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        
        // جدول القوالب
        if (!db.objectStoreNames.contains('templates')) {
            const templateStore = db.createObjectStore('templates', { keyPath: 'id', autoIncrement: true });
            templateStore.createIndex('category', 'category', { unique: false });
            templateStore.createIndex('premium', 'premium', { unique: false });
            templateStore.createIndex('downloads', 'downloads', { unique: false });
            templateStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        // جدول التحليلات
        if (!db.objectStoreNames.contains('analytics')) {
            const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id', autoIncrement: true });
            analyticsStore.createIndex('event', 'event', { unique: false });
            analyticsStore.createIndex('userId', 'userId', { unique: false });
            analyticsStore.createIndex('timestamp', 'timestamp', { unique: false });
            analyticsStore.createIndex('page', 'page', { unique: false });
        }
        
        // جدول الإعدادات
        if (!db.objectStoreNames.contains('settings')) {
            const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
        }
        
        // جدول الملفات
        if (!db.objectStoreNames.contains('files')) {
            const filesStore = db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
            filesStore.createIndex('userId', 'userId', { unique: false });
            filesStore.createIndex('projectId', 'projectId', { unique: false });
            filesStore.createIndex('type', 'type', { unique: false });
            filesStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
        }
        
        // جدول النسخ الاحتياطي
        if (!db.objectStoreNames.contains('backups')) {
            const backupStore = db.createObjectStore('backups', { keyPath: 'id', autoIncrement: true });
            backupStore.createIndex('createdAt', 'createdAt', { unique: false });
            backupStore.createIndex('type', 'type', { unique: false });
        }
    }
    
    initializeData(db) {
        // إضافة بيانات تجريبية أولية
        this.addSampleData(db);
    }
    
    addSampleData(db) {
        const transaction = db.transaction(['users', 'designs', 'templates'], 'readwrite');
        
        // بيانات تجريبية للمستخدمين
        const users = [
            {
                id: 1,
                email: 'client@example.com',
                name: 'عميل تجريبي',
                role: 'client',
                avatar: 'https://ui-avatars.com/api/?name=عميل&background=0a9396&color=fff',
                balance: 1250,
                phone: '+966500000001',
                joinDate: new Date().toISOString(),
                settings: {
                    notifications: true,
                    darkMode: false,
                    language: 'ar'
                }
            },
            {
                id: 2,
                email: 'designer@example.com',
                name: 'مصمم تجريبي',
                role: 'designer',
                avatar: 'https://ui-avatars.com/api/?name=مصمم&background=005f73&color=fff',
                rating: 4.8,
                specialty: ['graphic', 'logo'],
                portfolio: [],
                hourlyRate: 100,
                phone: '+966500000002',
                joinDate: new Date().toISOString(),
                settings: {
                    notifications: true,
                    darkMode: false,
                    language: 'ar'
                }
            }
        ];
        
        users.forEach(user => {
            transaction.objectStore('users').put(user);
        });
        
        // بيانات تجريبية للتصاميم
        const designs = [
            {
                id: 1,
                title: 'شعار عصري لشركة تقنية',
                description: 'تصميم شعار حديث يعبر عن الابتكار والتقنية',
                category: 'logo',
                designerId: 2,
                designerName: 'مصمم تجريبي',
                tags: ['شعار', 'تقني', 'عصري'],
                price: 800,
                rating: 4.9,
                downloads: 150,
                views: 1200,
                status: 'published',
                files: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'هوية بصرية لمطعم',
                description: 'هوية بصرية متكاملة لمطعم وجبات سريعة',
                category: 'branding',
                designerId: 2,
                designerName: 'مصمم تجريبي',
                tags: ['هوية', 'مطعم', 'وجبات سريعة'],
                price: 2500,
                rating: 4.7,
                downloads: 85,
                views: 950,
                status: 'published',
                files: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        designs.forEach(design => {
            transaction.objectStore('designs').put(design);
        });
        
        // بيانات تجريبية للقوالب
        const templates = [
            {
                id: 1,
                name: 'قالب شعار احترافي',
                category: 'logo',
                description: 'قالب جاهز لتصميم الشعارات',
                premium: false,
                downloads: 320,
                rating: 4.5,
                price: 0,
                files: [],
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'قالب بروشور مميز',
                category: 'print',
                description: 'قالب احترافي للبروشورات',
                premium: true,
                downloads: 150,
                rating: 4.8,
                price: 50,
                files: [],
                createdAt: new Date().toISOString()
            }
        ];
        
        templates.forEach(template => {
            transaction.objectStore('templates').put(template);
        });
        
        transaction.oncomplete = () => {
            console.log('تم إضافة البيانات التجريبية بنجاح');
        };
    }
    
    // ===== عمليات المستخدمين =====
    
    async saveUser(user) {
        return this.executeTransaction('users', 'readwrite', (store) => {
            return store.put(user);
        });
    }
    
    async getUser(id) {
        return this.executeTransaction('users', 'readonly', (store) => {
            return store.get(id);
        });
    }
    
    async getUserByEmail(email) {
        return this.executeTransaction('users', 'readonly', (store, transaction) => {
            const index = store.index('email');
            return index.get(email);
        });
    }
    
    async updateUser(id, updates) {
        const user = await this.getUser(id);
        if (user) {
            const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
            return this.saveUser(updatedUser);
        }
        return null;
    }
    
    async getAllUsers() {
        return this.executeTransaction('users', 'readonly', (store) => {
            return store.getAll();
        });
    }
    
    async getUsersByRole(role) {
        return this.executeTransaction('users', 'readonly', (store, transaction) => {
            const index = store.index('role');
            return index.getAll(role);
        });
    }
    
    // ===== عمليات التصاميم =====
    
    async saveDesign(design) {
        design.createdAt = design.createdAt || new Date().toISOString();
        design.updatedAt = new Date().toISOString();
        
        return this.executeTransaction('designs', 'readwrite', (store) => {
            return store.put(design);
        });
    }
    
    async getDesign(id) {
        return this.executeTransaction('designs', 'readonly', (store) => {
            return store.get(id);
        });
    }
    
    async getAllDesigns() {
        return this.executeTransaction('designs', 'readonly', (store) => {
            return store.getAll();
        });
    }
    
    async getDesignsByCategory(category) {
        return this.executeTransaction('designs', 'readonly', (store, transaction) => {
            const index = store.index('category');
            return index.getAll(category);
        });
    }
    
    async getDesignsByDesigner(designerId) {
        return this.executeTransaction('designs', 'readonly', (store, transaction) => {
            const index = store.index('designerId');
            return index.getAll(designerId);
        });
    }
    
    async searchDesigns(query) {
        const designs = await this.getAllDesigns();
        const searchTerm = query.toLowerCase();
        
        return designs.filter(design => 
            design.title?.toLowerCase().includes(searchTerm) ||
            design.description?.toLowerCase().includes(searchTerm) ||
            design.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    async updateDesign(id, updates) {
        const design = await this.getDesign(id);
        if (design) {
            const updatedDesign = { ...design, ...updates, updatedAt: new Date().toISOString() };
            return this.saveDesign(updatedDesign);
        }
        return null;
    }
    
    async deleteDesign(id) {
        return this.executeTransaction('designs', 'readwrite', (store) => {
            return store.delete(id);
        });
    }
    
    // ===== عمليات المشاريع =====
    
    async saveProject(project) {
        project.createdAt = project.createdAt || new Date().toISOString();
        project.updatedAt = new Date().toISOString();
        
        return this.executeTransaction('projects', 'readwrite', (store) => {
            return store.put(project);
        });
    }
    
    async getProject(id) {
        return this.executeTransaction('projects', 'readonly', (store) => {
            return store.get(id);
        });
    }
    
    async getAllProjects() {
        return this.executeTransaction('projects', 'readonly', (store) => {
            return store.getAll();
        });
    }
    
    async getProjectsByClient(clientId) {
        return this.executeTransaction('projects', 'readonly', (store, transaction) => {
            const index = store.index('clientId');
            return index.getAll(clientId);
        });
    }
    
    async getProjectsByDesigner(designerId) {
        return this.executeTransaction('projects', 'readonly', (store, transaction) => {
            const index = store.index('designerId');
            return index.getAll(designerId);
        });
    }
    
    async getProjectsByStatus(status) {
        return this.executeTransaction('projects', 'readonly', (store, transaction) => {
            const index = store.index('status');
            return index.getAll(status);
        });
    }
    
    async updateProject(id, updates) {
        const project = await this.getProject(id);
        if (project) {
            const updatedProject = { ...project, ...updates, updatedAt: new Date().toISOString() };
            return this.saveProject(updatedProject);
        }
        return null;
    }
    
    async deleteProject(id) {
        return this.executeTransaction('projects', 'readwrite', (store) => {
            return store.delete(id);
        });
    }
    
    // ===== عمليات الرسائل =====
    
    async saveMessage(message) {
        message.timestamp = message.timestamp || new Date().toISOString();
        message.read = message.read || false;
        
        return this.executeTransaction('messages', 'readwrite', (store) => {
            return store.put(message);
        });
    }
    
    async getMessagesByConversation(conversationId) {
        return this.executeTransaction('messages', 'readonly', (store, transaction) => {
            const index = store.index('conversationId');
            return index.getAll(conversationId);
        });
    }
    
    async getUnreadMessagesCount(userId) {
        const messages = await this.executeTransaction('messages', 'readonly', (store) => {
            return store.getAll();
        });
        
        return messages.filter(msg => 
            msg.receiverId === userId && !msg.read
        ).length;
    }
    
    async markMessageAsRead(id) {
        const message = await this.executeTransaction('messages', 'readwrite', async (store) => {
            const msg = await store.get(id);
            if (msg) {
                msg.read = true;
                await store.put(msg);
            }
            return msg;
        });
        return message;
    }
    
    // ===== عمليات المحادثات =====
    
    async saveConversation(conversation) {
        conversation.lastMessageAt = conversation.lastMessageAt || new Date().toISOString();
        conversation.unreadCount = conversation.unreadCount || 0;
        
        return this.executeTransaction('conversations', 'readwrite', (store) => {
            return store.put(conversation);
        });
    }
    
    async getConversation(id) {
        return this.executeTransaction('conversations', 'readonly', (store) => {
            return store.get(id);
        });
    }
    
    async getConversationsByUser(userId) {
        const conversations = await this.executeTransaction('conversations', 'readonly', (store) => {
            return store.getAll();
        });
        
        return conversations.filter(conv => 
            conv.participants?.includes(userId)
        );
    }
    
    // ===== عمليات الإشعارات =====
    
    async saveNotification(notification) {
        notification.createdAt = notification.createdAt || new Date().toISOString();
        notification.read = notification.read || false;
        
        return this.executeTransaction('notifications', 'readwrite', (store) => {
            return store.put(notification);
        });
    }
    
    async getNotificationsByUser(userId, unreadOnly = false) {
        const notifications = await this.executeTransaction('notifications', 'readonly', (store, transaction) => {
            const index = store.index('userId');
            return index.getAll(userId);
        });
        
        if (unreadOnly) {
            return notifications.filter(notification => !notification.read);
        }
        return notifications;
    }
    
    async markNotificationAsRead(id) {
        return this.executeTransaction('notifications', 'readwrite', async (store) => {
            const notification = await store.get(id);
            if (notification) {
                notification.read = true;
                await store.put(notification);
            }
            return notification;
        });
    }
    
    async markAllNotificationsAsRead(userId) {
        const notifications = await this.getNotificationsByUser(userId, true);
        
        for (const notification of notifications) {
            notification.read = true;
            await this.saveNotification(notification);
        }
        
        return notifications.length;
    }
    
    async clearAllNotifications(userId) {
        const notifications = await this.getNotificationsByUser(userId);
        
        return this.executeTransaction('notifications', 'readwrite', async (store) => {
            for (const notification of notifications) {
                await store.delete(notification.id);
            }
            return notifications.length;
        });
    }
    
    // ===== عمليات المعاملات المالية =====
    
    async saveTransaction(transaction) {
        transaction.date = transaction.date || new Date().toISOString();
        transaction.status = transaction.status || 'pending';
        
        return this.executeTransaction('transactions', 'readwrite', (store) => {
            return store.put(transaction);
        });
    }
    
    async getTransactionsByUser(userId) {
        return this.executeTransaction('transactions', 'readonly', (store, transaction) => {
            const index = store.index('userId');
            return index.getAll(userId);
        });
    }
    
    async getTransaction(id) {
        return this.executeTransaction('transactions', 'readonly', (store) => {
            return store.get(id);
        });
    }
    
    // ===== عمليات المحفظة =====
    
    async getWallet(userId) {
        return this.executeTransaction('wallets', 'readonly', (store) => {
            return store.get(userId);
        });
    }
    
    async updateWallet(userId, amount, type = 'deposit') {
        return this.executeTransaction('wallets', 'readwrite', async (store) => {
            let wallet = await store.get(userId);
            
            if (!wallet) {
                wallet = {
                    userId,
                    balance: 0,
                    currency: 'SAR',
                    transactions: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
            
            if (type === 'deposit') {
                wallet.balance += amount;
            } else if (type === 'withdraw') {
                if (wallet.balance >= amount) {
                    wallet.balance -= amount;
                } else {
                    throw new Error('الرصيد غير كافي');
                }
            }
            
            wallet.updatedAt = new Date().toISOString();
            wallet.transactions.push({
                type,
                amount,
                date: new Date().toISOString(),
                balanceAfter: wallet.balance
            });
            
            await store.put(wallet);
            return wallet;
        });
    }
    
    // ===== عمليات الفواتير =====
    
    async saveInvoice(invoice) {
        invoice.createdAt = invoice.createdAt || new Date().toISOString();
        invoice.status = invoice.status || 'pending';
        
        return this.executeTransaction('invoices', 'readwrite', (store) => {
            return store.put(invoice);
        });
    }
    
    async getInvoicesByUser(userId, role = 'client') {
        const invoices = await this.executeTransaction('invoices', 'readonly', (store) => {
            return store.getAll();
        });
        
        if (role === 'client') {
            return invoices.filter(invoice => invoice.clientId === userId);
        } else {
            return invoices.filter(invoice => invoice.designerId === userId);
        }
    }
    
    // ===== عمليات التقييمات =====
    
    async saveReview(review) {
        review.createdAt = review.createdAt || new Date().toISOString();
        
        return this.executeTransaction('reviews', 'readwrite', (store) => {
            return store.put(review);
        });
    }
    
    async getReviewsByDesigner(designerId) {
        return this.executeTransaction('reviews', 'readonly', (store, transaction) => {
            const index = store.index('designerId');
            return index.getAll(designerId);
        });
    }
    
    async getAverageRating(designerId) {
        const reviews = await this.getReviewsByDesigner(designerId);
        
        if (reviews.length === 0) return 0;
        
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        return total / reviews.length;
    }
    
    // ===== عمليات القوالب =====
    
    async saveTemplate(template) {
        template.createdAt = template.createdAt || new Date().toISOString();
        template.downloads = template.downloads || 0;
        
        return this.executeTransaction('templates', 'readwrite', (store) => {
            return store.put(template);
        });
    }
    
    async getTemplate(id) {
        return this.executeTransaction('templates', 'readonly', (store) => {
            return store.get(id);
        });
    }
    
    async getAllTemplates() {
        return this.executeTransaction('templates', 'readonly', (store) => {
            return store.getAll();
        });
    }
    
    async getTemplatesByCategory(category) {
        return this.executeTransaction('templates', 'readonly', (store, transaction) => {
            const index = store.index('category');
            return index.getAll(category);
        });
    }
    
    async incrementTemplateDownloads(id) {
        const template = await this.getTemplate(id);
        if (template) {
            template.downloads = (template.downloads || 0) + 1;
            await this.saveTemplate(template);
        }
        return template;
    }
    
    // ===== عمليات التحليلات =====
    
    async saveAnalyticsEvent(event) {
        event.timestamp = event.timestamp || new Date().toISOString();
        
        return this.executeTransaction('analytics', 'readwrite', (store) => {
            return store.put(event);
        });
    }
    
    async getAnalyticsEvents(userId = null, eventType = null) {
        const events = await this.executeTransaction('analytics', 'readonly', (store) => {
            return store.getAll();
        });
        
        let filteredEvents = events;
        
        if (userId) {
            filteredEvents = filteredEvents.filter(event => event.userId === userId);
        }
        
        if (eventType) {
            filteredEvents = filteredEvents.filter(event => event.event === eventType);
        }
        
        return filteredEvents;
    }
    
    // ===== عمليات الإعدادات =====
    
    async saveSetting(key, value) {
        return this.executeTransaction('settings', 'readwrite', (store) => {
            return store.put({ key, value, updatedAt: new Date().toISOString() });
        });
    }
    
    async getSetting(key) {
        const setting = await this.executeTransaction('settings', 'readonly', (store) => {
            return store.get(key);
        });
        return setting?.value;
    }
    
    // ===== عمليات الملفات =====
    
    async saveFile(file) {
        file.uploadedAt = file.uploadedAt || new Date().toISOString();
        
        return this.executeTransaction('files', 'readwrite', (store) => {
            return store.put(file);
        });
    }
    
    async getFilesByProject(projectId) {
        return this.executeTransaction('files', 'readonly', (store, transaction) => {
            const index = store.index('projectId');
            return index.getAll(projectId);
        });
    }
    
    async deleteFile(id) {
        return this.executeTransaction('files', 'readwrite', (store) => {
            return store.delete(id);
        });
    }
    
    // ===== عمليات النسخ الاحتياطي =====
    
    async createBackup(type = 'full') {
        const backupData = {};
        
        // جمع البيانات من جميع الجداول
        const stores = Array.from(this.db.objectStoreNames);
        
        for (const storeName of stores) {
            backupData[storeName] = await this.executeTransaction(storeName, 'readonly', (store) => {
                return store.getAll();
            });
        }
        
        const backup = {
            type,
            data: backupData,
            createdAt: new Date().toISOString(),
            size: JSON.stringify(backupData).length
        };
        
        return this.executeTransaction('backups', 'readwrite', (store) => {
            return store.put(backup);
        });
    }
    
    async restoreBackup(backupId) {
        const backup = await this.executeTransaction('backups', 'readonly', (store) => {
            return store.get(backupId);
        });
        
        if (!backup) {
            throw new Error('النسخة الاحتياطية غير موجودة');
        }
        
        // مسح البيانات الحالية
        const stores = Array.from(this.db.objectStoreNames);
        
        for (const storeName of stores) {
            if (storeName !== 'backups') {
                await this.executeTransaction(storeName, 'readwrite', (store) => {
                    store.clear();
                });
            }
        }
        
        // استعادة البيانات
        for (const [storeName, data] of Object.entries(backup.data)) {
            if (storeName !== 'backups' && this.db.objectStoreNames.contains(storeName)) {
                await this.executeTransaction(storeName, 'readwrite', (store) => {
                    if (Array.isArray(data)) {
                        data.forEach(item => store.put(item));
                    }
                });
            }
        }
        
        return { success: true, message: 'تم استعادة النسخة الاحتياطية بنجاح' };
    }
    
    // ===== العمليات العامة =====
    
    async executeTransaction(storeName, mode, operation) {
        if (!this.initialized) {
            await this.init();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], mode);
            const store = transaction.objectStore(storeName);
            
            const request = operation(store, transaction);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            
            transaction.oncomplete = () => {
                // يمكن إضافة عمليات إضافية بعد اكتمال المعاملة
            };
            
            transaction.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async clearDatabase() {
        const stores = Array.from(this.db.objectStoreNames);
        
        for (const storeName of stores) {
            await this.executeTransaction(storeName, 'readwrite', (store) => {
                return store.clear();
            });
        }
        
        return { success: true, message: 'تم مسح قاعدة البيانات بالكامل' };
    }
    
    async getDatabaseStats() {
        const stats = {
            totalSize: 0,
            stores: {}
        };
        
        const stores = Array.from(this.db.objectStoreNames);
        
        for (const storeName of stores) {
            const count = await this.executeTransaction(storeName, 'readonly', (store) => {
                return store.count();
            });
            
            stats.stores[storeName] = count;
            stats.totalSize += count;
        }
        
        return stats;
    }
    
    async exportData() {
        const data = {};
        const stores = Array.from(this.db.objectStoreNames);
        
        for (const storeName of stores) {
            data[storeName] = await this.executeTransaction(storeName, 'readonly', (store) => {
                return store.getAll();
            });
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        return {
            data,
            url,
            size: JSON.stringify(data).length,
            stores: stores.length
        };
    }
    
    async importData(jsonData) {
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        
        for (const [storeName, items] of Object.entries(data)) {
            if (this.db.objectStoreNames.contains(storeName) && Array.isArray(items)) {
                await this.executeTransaction(storeName, 'readwrite', (store) => {
                    items.forEach(item => store.put(item));
                });
            }
        }
        
        return { success: true, message: 'تم استيراد البيانات بنجاح' };
    }
    
    // ===== دعم الوضع غير المتصل =====
    
    async syncWithServer() {
        try {
            // التحقق من الاتصال بالإنترنت
            if (!navigator.onLine) {
                throw new Error('لا يوجد اتصال بالإنترنت');
            }
            
            // جمع البيانات المحلية غير المتزامنة
            const pendingOperations = await this.getSetting('pending_operations') || [];
            
            if (pendingOperations.length > 0) {
                console.log(`جاري مزامنة ${pendingOperations.length} عملية...`);
                
                for (const operation of pendingOperations) {
                    try {
                        // محاكاة إرسال البيانات للخادم
                        await this.sendToServer(operation);
                        
                        // حذف العملية بعد نجاح المزامنة
                        pendingOperations.splice(pendingOperations.indexOf(operation), 1);
                        await this.saveSetting('pending_operations', pendingOperations);
                        
                    } catch (error) {
                        console.error('فشل مزامنة العملية:', operation, error);
                    }
                }
            }
            
            return { success: true, synced: pendingOperations.length };
            
        } catch (error) {
            console.error('فشل المزامنة:', error);
            return { success: false, error: error.message };
        }
    }
    
    async queueOperation(operation) {
        const pendingOperations = await this.getSetting('pending_operations') || [];
        pendingOperations.push({
            ...operation,
            timestamp: new Date().toISOString(),
            id: Date.now()
        });
        
        await this.saveSetting('pending_operations', pendingOperations);
        return pendingOperations.length;
    }
    
    async sendToServer(operation) {
        // محاكاة إرسال البيانات للخادم
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // في تطبيق حقيقي، هنا يكون اتصال بالخادم
                if (Math.random() < 0.1) { // 10% فرصة للفشل (للاختبار)
                    reject(new Error('فشل الاتصال بالخادم'));
                } else {
                    resolve({ success: true });
                }
            }, 500);
        });
    }
    
    // ===== أدوات المساعدة =====
    
    async searchAcrossStores(query) {
        const results = {
            designs: [],
            users: [],
            projects: [],
            templates: []
        };
        
        const searchTerm = query.toLowerCase();
        
        // البحث في التصاميم
        results.designs = await this.searchDesigns(query);
        
        // البحث في المستخدمين
        const users = await this.getAllUsers();
        results.users = users.filter(user => 
            user.name?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm)
        );
        
        // البحث في المشاريع
        const projects = await this.getAllProjects();
        results.projects = projects.filter(project => 
            project.title?.toLowerCase().includes(searchTerm) ||
            project.description?.toLowerCase().includes(searchTerm)
        );
        
        // البحث في القوالب
        const templates = await this.getAllTemplates();
        results.templates = templates.filter(template => 
            template.name?.toLowerCase().includes(searchTerm) ||
            template.description?.toLowerCase().includes(searchTerm)
        );
        
        return results;
    }
    
    async getDashboardStats(userId, role) {
        const stats = {};
        
        if (role === 'client') {
            stats.projects = await this.getProjectsByClient(userId);
            stats.activeProjects = stats.projects.filter(p => p.status === 'active').length;
            stats.completedProjects = stats.projects.filter(p => p.status === 'completed').length;
            stats.pendingProjects = stats.projects.filter(p => p.status === 'pending').length;
            
            const invoices = await this.getInvoicesByUser(userId, 'client');
            stats.totalSpent = invoices
                .filter(inv => inv.status === 'paid')
                .reduce((sum, inv) => sum + inv.amount, 0);
                
        } else if (role === 'designer') {
            stats.projects = await this.getProjectsByDesigner(userId);
            stats.activeProjects = stats.projects.filter(p => p.status === 'active').length;
            stats.completedProjects = stats.projects.filter(p => p.status === 'completed').length;
            
            stats.designs = await this.getDesignsByDesigner(userId);
            stats.publishedDesigns = stats.designs.filter(d => d.status === 'published').length;
            
            const reviews = await this.getReviewsByDesigner(userId);
            stats.averageRating = reviews.length > 0 
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;
                
            const invoices = await this.getInvoicesByUser(userId, 'designer');
            stats.totalEarned = invoices
                .filter(inv => inv.status === 'paid')
                .reduce((sum, inv) => sum + inv.amount, 0);
        }
        
        const notifications = await this.getNotificationsByUser(userId, true);
        stats.unreadNotifications = notifications.length;
        
        const messages = await this.getUnreadMessagesCount(userId);
        stats.unreadMessages = messages;
        
        return stats;
    }
}

// تهيئة قاعدة البيانات وتصديرها
const database = new PixelArtDatabase();
window.db = database;

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await database.init();
        console.log('تم تهيئة قاعدة البيانات المتقدمة بنجاح');
    } catch (error) {
        console.error('فشل تهيئة قاعدة البيانات:', error);
    }
});

// دعم المزامنة التلقائية
window.addEventListener('online', async () => {
    console.log('تم استعادة الاتصال بالإنترنت، جاري المزامنة...');
    try {
        const result = await database.syncWithServer();
        if (result.success) {
            console.log(`تمت المزامنة بنجاح: ${result.synced} عملية`);
        }
    } catch (error) {
        console.error('فشل المزامنة:', error);
    }
});

// وظائف مساعدة للاستخدام السهل
window.saveUser = (user) => database.saveUser(user);
window.getUser = (id) => database.getUser(id);
window.getAllDesigns = () => database.getAllDesigns();
window.saveDesign = (design) => database.saveDesign(design);
window.getAllProjects = () => database.getAllProjects();
window.saveProject = (project) => database.saveProject(project);
window.deleteProject = (id) => database.deleteProject(id);
window.saveMessage = (message) => database.saveMessage(message);
window.saveNotification = (notification) => database.saveNotification(notification);
window.markAllNotificationsAsRead = () => database.markAllNotificationsAsRead(window.auth?.currentUser?.id);
window.clearAllNotifications = () => database.clearAllNotifications(window.auth?.currentUser?.id);
window.saveAnalyticsEvent = (event) => database.saveAnalyticsEvent(event);
window.saveFile = (file) => database.saveFile(file);
window.saveTemplate = (template) => database.saveTemplate(template);
window.saveReview = (review) => database.saveReview(review);
window.updateNotification = (notification) => database.saveNotification(notification);

// التصدير للاستخدام في الملفات الأخرى
export default database;