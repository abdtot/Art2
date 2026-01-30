// قاعدة البيانات المتقدمة باستخدام IndexedDB - الإصدار المحدث
class PixelArtDatabase {
    constructor() {
        this.dbName = 'PixelArtDB_Advanced';
        this.dbVersion = 3;
        this.db = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return this.db;

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
        const stores = [
            { name: 'users', options: { keyPath: 'id' }, indexes: [['email', 'email', { unique: true }], ['role', 'role', { unique: false }]] },
            { name: 'designs', options: { keyPath: 'id', autoIncrement: true }, indexes: [['category', 'category'], ['designerId', 'designerId'], ['status', 'status']] },
            { name: 'projects', options: { keyPath: 'id', autoIncrement: true }, indexes: [['clientId', 'clientId'], ['designerId', 'designerId'], ['status', 'status']] },
            { name: 'messages', options: { keyPath: 'id', autoIncrement: true }, indexes: [['conversationId', 'conversationId'], ['timestamp', 'timestamp']] },
            { name: 'notifications', options: { keyPath: 'id', autoIncrement: true }, indexes: [['userId', 'userId'], ['read', 'read']] },
            { name: 'wallets', options: { keyPath: 'userId' }, indexes: [] },
            { name: 'files', options: { keyPath: 'id', autoIncrement: true }, indexes: [['projectId', 'projectId']] },
            { name: 'settings', options: { keyPath: 'key' }, indexes: [] },
            { name: 'templates', options: { keyPath: 'id', autoIncrement: true }, indexes: [['category', 'category']] },
            { name: 'reviews', options: { keyPath: 'id', autoIncrement: true }, indexes: [['designerId', 'designerId']] }
        ];

        stores.forEach(s => {
            if (!db.objectStoreNames.contains(s.name)) {
                const store = db.createObjectStore(s.name, s.options);
                s.indexes.forEach(idx => store.createIndex(idx[0], idx[1], idx[2] || { unique: false }));
            }
        });
    }

    initializeData(db) {
        this.addSampleData(db);
    }

    addSampleData(db) {
        const transaction = db.transaction(['users', 'designs', 'templates'], 'readwrite');
        
        const users = [
            { id: 1, email: 'client@example.com', name: 'عميل تجريبي', role: 'client', balance: 1250, joinDate: new Date().toISOString() },
            { id: 2, email: 'designer@example.com', name: 'مصمم تجريبي', role: 'designer', rating: 4.8, balance: 0, joinDate: new Date().toISOString() }
        ];
        
        users.forEach(user => transaction.objectStore('users').put(user));
        
        transaction.oncomplete = () => console.log('تم إضافة البيانات التجريبية بنجاح');
    }

    // ===== العمليات العامة للنظام =====

    async executeTransaction(storeName, mode, operation) {
        if (!this.initialized) await this.init();
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], mode);
                const store = transaction.objectStore(storeName);
                const request = operation(store, transaction);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            } catch (err) {
                reject(err);
            }
        });
    }

    // ===== واجهات المساعدة لملف app.js =====

    async saveUser(user) { return this.executeTransaction('users', 'readwrite', s => s.put(user)); }
    async getUser(id) { return this.executeTransaction('users', 'readonly', s => s.get(id)); }
    async getAllUsers() { return this.executeTransaction('users', 'readonly', s => s.getAll()); }
    
    async getUsersByRole(role) {
        const users = await this.getAllUsers();
        return users.filter(u => u.role === role);
    }

    async saveDesign(design) { return this.executeTransaction('designs', 'readwrite', s => s.put(design)); }
    async getAllDesigns() { return this.executeTransaction('designs', 'readonly', s => s.getAll()); }
    
    async saveProject(project) { return this.executeTransaction('projects', 'readwrite', s => s.put(project)); }
    async getAllProjects() { return this.executeTransaction('projects', 'readonly', s => s.getAll()); }
    async deleteProject(id) { return this.executeTransaction('projects', 'readwrite', s => s.delete(id)); }

    async saveMessage(msg) { return this.executeTransaction('messages', 'readwrite', s => s.put(msg)); }
    async saveFile(file) { return this.executeTransaction('files', 'readwrite', s => s.put(file)); }
    
    async saveNotification(notif) { return this.executeTransaction('notifications', 'readwrite', s => s.put(notif)); }
    async markAllNotificationsAsRead(userId) {
        const store = 'notifications';
        const all = await this.executeTransaction(store, 'readonly', s => s.getAll());
        for (const n of all) {
            if (n.userId === userId && !n.read) {
                n.read = true;
                await this.executeTransaction(store, 'readwrite', s => s.put(n));
            }
        }
    }

    async clearAllNotifications(userId) {
        const all = await this.executeTransaction('notifications', 'readonly', s => s.getAll());
        for (const n of all) {
            if (n.userId === userId) {
                await this.executeTransaction('notifications', 'readwrite', s => s.delete(n.id));
            }
        }
    }
}

// تصدير الكائن للنافذة العالمية ليكون متاحاً لـ app.js
const database = new PixelArtDatabase();
window.db = database;

// تعريف الوظائف المساعدة في نافذة الـ Window لتسهيل الاستدعاء
window.saveUser = (user) => database.saveUser(user);
window.getUser = (id) => database.getUser(id);
window.getAllDesigns = () => database.getAllDesigns();
window.saveDesign = (design) => database.saveDesign(design);
window.getAllProjects = () => database.getAllProjects();
window.getAllDesigners = () => database.getUsersByRole('designer');
window.saveProject = (project) => database.saveProject(project);
window.deleteProject = (id) => database.deleteProject(id);
window.saveMessage = (message) => database.saveMessage(message);
window.saveNotification = (notification) => database.saveNotification(notification);
window.updateNotification = (notification) => database.saveNotification(notification);
window.markAllNotificationsAsRead = (userId) => database.markAllNotificationsAsRead(userId);
window.clearAllNotifications = (userId) => database.clearAllNotifications(userId);
window.saveFile = (file) => database.saveFile(file);

console.log('تم تحميل ملف قاعدة البيانات بنجاح.');

