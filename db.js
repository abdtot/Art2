// قاعدة البيانات المحسنة لبيكسل آرت

class FixedPixelArtDB {
    constructor() {
        this.dbName = 'PixelArtDB_Fixed';
        this.dbVersion = 1;
        this.db = null;
        this.initialized = false;
    }
    
    async init() {
        try {
            if (this.initialized) return this.db;
            
            console.log('محاولة تهيئة قاعدة البيانات...');
            
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion);
                
                request.onerror = (event) => {
                    console.error('حدث خطأ أثناء فتح قاعدة البيانات:', event.target.error);
                    this.fallbackToLocalStorage();
                    resolve(this.db); // لا نرفض، نستخدم LocalStorage كبديل
                };
                
                request.onsuccess = (event) => {
                    console.log('تم فتح قاعدة البيانات بنجاح');
                    this.db = event.target.result;
                    this.initialized = true;
                    
                    // إضافة معالج للأخطاء العامة
                    this.db.onerror = (event) => {
                        console.error('خطأ في قاعدة البيانات:', event.target.error);
                    };
                    
                    resolve(this.db);
                };
                
                request.onupgradeneeded = (event) => {
                    console.log('تحديث قاعدة البيانات مطلوب');
                    this.createStores(event.target.result);
                };
                
                request.onblocked = () => {
                    console.warn('قاعدة البيانات محظورة. تأكد من إغلاق جميع النوافذ المفتوحة للتطبيق.');
                };
            });
            
        } catch (error) {
            console.error('فشل تهيئة قاعدة البيانات:', error);
            this.fallbackToLocalStorage();
            return this.db;
        }
    }
    
    createStores(db) {
        console.log('إنشاء الهياكل الأساسية...');
        
        // جدول المستخدمين (مخزن رئيسي)
        if (!db.objectStoreNames.contains('users')) {
            console.log('إنشاء جدول المستخدمين...');
            const userStore = db.createObjectStore('users', { keyPath: 'id' });
            userStore.createIndex('email', 'email', { unique: true });
            userStore.createIndex('role', 'role', { unique: false });
        }
        
        // جدول التصاميم
        if (!db.objectStoreNames.contains('designs')) {
            console.log('إنشاء جدول التصاميم...');
            const designStore = db.createObjectStore('designs', { keyPath: 'id', autoIncrement: true });
            designStore.createIndex('category', 'category', { unique: false });
            designStore.createIndex('designerId', 'designerId', { unique: false });
        }
        
        // جدول المشاريع
        if (!db.objectStoreNames.contains('projects')) {
            console.log('إنشاء جدول المشاريع...');
            const projectStore = db.createObjectStore('projects', { keyPath: 'id', autoIncrement: true });
            projectStore.createIndex('clientId', 'clientId', { unique: false });
            projectStore.createIndex('status', 'status', { unique: false });
        }
        
        // جدول الرسائل
        if (!db.objectStoreNames.contains('messages')) {
            console.log('إنشاء جدول الرسائل...');
            const messageStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
            messageStore.createIndex('senderId', 'senderId', { unique: false });
            messageStore.createIndex('receiverId', 'receiverId', { unique: false });
        }
        
        // جدول الإشعارات
        if (!db.objectStoreNames.contains('notifications')) {
            console.log('إنشاء جدول الإشعارات...');
            const notificationStore = db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
            notificationStore.createIndex('userId', 'userId', { unique: false });
            notificationStore.createIndex('read', 'read', { unique: false });
        }
        
        console.log('اكتمل إنشاء هياكل قاعدة البيانات');
    }
    
    fallbackToLocalStorage() {
        console.log('الانتقال إلى LocalStorage كبديل...');
        
        // محاكاة IndexedDB باستخدام LocalStorage
        this.db = {
            type: 'localStorage',
            transaction: (storeNames, mode) => {
                return {
                    objectStore: (storeName) => {
                        return {
                            get: (key) => {
                                return new Promise((resolve) => {
                                    const data = localStorage.getItem(`${storeName}_${key}`);
                                    resolve(data ? JSON.parse(data) : undefined);
                                });
                            },
                            put: (value) => {
                                return new Promise((resolve) => {
                                    const key = value.id || Date.now();
                                    localStorage.setItem(`${storeName}_${key}`, JSON.stringify({...value, id: key}));
                                    resolve(key);
                                });
                            },
                            getAll: () => {
                                return new Promise((resolve) => {
                                    const items = [];
                                    for (let i = 0; i < localStorage.length; i++) {
                                        const key = localStorage.key(i);
                                        if (key.startsWith(`${storeName}_`)) {
                                            items.push(JSON.parse(localStorage.getItem(key)));
                                        }
                                    }
                                    resolve(items);
                                });
                            },
                            delete: (key) => {
                                return new Promise((resolve) => {
                                    localStorage.removeItem(`${storeName}_${key}`);
                                    resolve();
                                });
                            },
                            clear: () => {
                                return new Promise((resolve) => {
                                    const keysToRemove = [];
                                    for (let i = 0; i < localStorage.length; i++) {
                                        const key = localStorage.key(i);
                                        if (key.startsWith(`${storeName}_`)) {
                                            keysToRemove.push(key);
                                        }
                                    }
                                    keysToRemove.forEach(key => localStorage.removeItem(key));
                                    resolve();
                                });
                            }
                        };
                    }
                };
            }
        };
        
        this.initialized = true;
        console.log('تم تهيئة LocalStorage بنجاح كبديل');
    }
    
    // ==== الوظائف الأساسية ====
    
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
        if (!this.initialized) await this.init();
        
        if (this.db.type === 'localStorage') {
            const users = await this.executeTransaction('users', 'readonly', (store) => {
                return store.getAll();
            });
            return users.find(user => user.email === email);
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const index = store.index('email');
            const request = index.get(email);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getAllDesigns() {
        return this.executeTransaction('designs', 'readonly', (store) => {
            return store.getAll();
        });
    }
    
    async saveDesign(design) {
        return this.executeTransaction('designs', 'readwrite', (store) => {
            return store.put(design);
        });
    }
    
    async getAllProjects() {
        return this.executeTransaction('projects', 'readonly', (store) => {
            return store.getAll();
        });
    }
    
    async saveProject(project) {
        return this.executeTransaction('projects', 'readwrite', (store) => {
            return store.put(project);
        });
    }
    
    async deleteProject(id) {
        return this.executeTransaction('projects', 'readwrite', (store) => {
            return store.delete(id);
        });
    }
    
    async saveMessage(message) {
        return this.executeTransaction('messages', 'readwrite', (store) => {
            return store.put(message);
        });
    }
    
    async saveNotification(notification) {
        return this.executeTransaction('notifications', 'readwrite', (store) => {
            return store.put(notification);
        });
    }
    
    async getNotificationsByUser(userId, unreadOnly = false) {
        const notifications = await this.executeTransaction('notifications', 'readonly', (store) => {
            return store.getAll();
        });
        
        let filtered = notifications.filter(n => n.userId === userId);
        if (unreadOnly) {
            filtered = filtered.filter(n => !n.read);
        }
        
        return filtered;
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
        
        for (const notification of notifications) {
            await this.executeTransaction('notifications', 'readwrite', (store) => {
                return store.delete(notification.id);
            });
        }
        
        return notifications.length;
    }
    
    async updateNotification(notification) {
        return this.saveNotification(notification);
    }
    
    // ==== الوظائف المساعدة ====
    
    async executeTransaction(storeName, mode, operation) {
        if (!this.initialized) {
            await this.init();
        }
        
        if (this.db.type === 'localStorage') {
            return operation(this.db.transaction([storeName], mode).objectStore(storeName));
        }
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], mode);
                const store = transaction.objectStore(storeName);
                
                const request = operation(store);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => {
                    console.error(`خطأ في معاملة ${storeName}:`, request.error);
                    reject(request.error);
                };
                
                transaction.onerror = (event) => {
                    console.error(`خطأ في المعاملة:`, event.target.error);
                    reject(event.target.error);
                };
                
            } catch (error) {
                console.error(`خطأ في تنفيذ المعاملة:`, error);
                reject(error);
            }
        });
    }
    
    async clearDatabase() {
        if (!this.initialized) await this.init();
        
        if (this.db.type === 'localStorage') {
            localStorage.clear();
            return { success: true, message: 'تم مسح جميع البيانات' };
        }
        
        const stores = Array.from(this.db.objectStoreNames);
        
        for (const storeName of stores) {
            await this.executeTransaction(storeName, 'readwrite', (store) => {
                return store.clear();
            });
        }
        
        return { success: true, message: 'تم مسح قاعدة البيانات' };
    }
    
    async getDatabaseInfo() {
        if (!this.initialized) await this.init();
        
        if (this.db.type === 'localStorage') {
            return {
                type: 'localStorage',
                size: localStorage.length,
                stores: ['users', 'designs', 'projects', 'messages', 'notifications']
            };
        }
        
        return {
            type: 'indexedDB',
            name: this.db.name,
            version: this.db.version,
            stores: Array.from(this.db.objectStoreNames)
        };
    }
    
    // ==== تحميل البيانات الأولية ====
    
    async loadSampleData() {
        try {
            console.log('تحميل البيانات الأولية...');
            
            // تحقق مما إذا كانت البيانات موجودة بالفعل
            const users = await this.executeTransaction('users', 'readonly', (store) => {
                return store.getAll();
            });
            
            if (users.length === 0) {
                // إضافة بيانات تجريبية
                const sampleUsers = [
                    {
                        id: 1,
                        email: 'client@example.com',
                        name: 'عميل تجريبي',
                        role: 'client',
                        avatar: 'https://ui-avatars.com/api/?name=عميل&background=0a9396&color=fff',
                        balance: 1250,
                        phone: '+966500000001',
                        joinDate: new Date().toISOString()
                    },
                    {
                        id: 2,
                        email: 'designer@example.com',
                        name: 'مصمم تجريبي',
                        role: 'designer',
                        avatar: 'https://ui-avatars.com/api/?name=مصمم&background=005f73&color=fff',
                        rating: 4.8,
                        specialty: ['graphic', 'logo'],
                        hourlyRate: 100,
                        phone: '+966500000002',
                        joinDate: new Date().toISOString()
                    }
                ];
                
                for (const user of sampleUsers) {
                    await this.saveUser(user);
                }
                
                // إضافة تصاميم تجريبية
                const sampleDesigns = [
                    {
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
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ];
                
                for (const design of sampleDesigns) {
                    await this.saveDesign(design);
                }
                
                console.log('تم تحميل البيانات الأولية بنجاح');
            } else {
                console.log('الموجود بالفعل، تخطي تحميل البيانات الأولية');
            }
            
        } catch (error) {
            console.error('فشل تحميل البيانات الأولية:', error);
        }
    }
}

// تهيئة ونشر نسخة واحدة عالمية
const fixedDB = new FixedPixelArtDB();
window.fixedDB = fixedDB;

// تصدير الوظائف للاستخدام
window.initDB = () => fixedDB.init();
window.saveUser = (user) => fixedDB.saveUser(user);
window.getUser = (id) => fixedDB.getUser(id);
window.getUserByEmail = (email) => fixedDB.getUserByEmail(email);
window.getAllDesigns = () => fixedDB.getAllDesigns();
window.saveDesign = (design) => fixedDB.saveDesign(design);
window.getAllProjects = () => fixedDB.getAllProjects();
window.saveProject = (project) => fixedDB.saveProject(project);
window.deleteProject = (id) => fixedDB.deleteProject(id);
window.saveMessage = (message) => fixedDB.saveMessage(message);
window.saveNotification = (notification) => fixedDB.saveNotification(notification);
window.getNotificationsByUser = (userId, unreadOnly) => fixedDB.getNotificationsByUser(userId, unreadOnly);
window.markAllNotificationsAsRead = () => fixedDB.markAllNotificationsAsRead(window.auth?.currentUser?.id);
window.clearAllNotifications = () => fixedDB.clearAllNotifications(window.auth?.currentUser?.id);
window.updateNotification = (notification) => fixedDB.updateNotification(notification);
window.saveAnalyticsEvent = (event) => fixedDB.saveNotification({ ...event, type: 'analytics' });

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('بدء تهيئة قاعدة البيانات...');
        await fixedDB.init();
        await fixedDB.loadSampleData();
        console.log('تم تهيئة قاعدة البيانات بنجاح');
    } catch (error) {
        console.error('حدث خطأ أثناء تهيئة قاعدة البيانات:', error);
    }
});

export default fixedDB;
