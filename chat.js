// ============================================
// نظام الدردشة والرسائل الفورية
// ============================================

class ChatManager {
    constructor() {
        this.conversations = [];
        this.currentChat = null;
        this.messages = new Map();
        this.typingUsers = new Set();
        this.unreadCounts = new Map();
        this.init();
    }

    init() {
        this.loadConversations();
        this.bindEvents();
        this.initWebSocket();
        this.updateUnreadCounts();
    }

    loadConversations() {
        const stored = localStorage.getItem('pixelArtConversations');
        this.conversations = stored ? JSON.parse(stored) : this.getSampleConversations();
        
        // تحميل الرسائل لكل محادثة
        this.conversations.forEach(conv => {
            const messages = localStorage.getItem(`chatMessages_${conv.id}`);
            this.messages.set(conv.id, messages ? JSON.parse(messages) : []);
        });
    }

    saveConversations() {
        localStorage.setItem('pixelArtConversations', JSON.stringify(this.conversations));
        
        // حفظ الرسائل لكل محادثة
        this.messages.forEach((msgs, id) => {
            localStorage.setItem(`chatMessages_${id}`, JSON.stringify(msgs));
        });
    }

    bindEvents() {
        // قائمة المحادثات
        this.bindConversationEvents();
        
        // نافذة الدردشة
        this.bindChatWindowEvents();
        
        // البحث في المحادثات
        const searchInput = document.querySelector('.conversations-search input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchConversations(e.target.value));
        }
        
        // فلترة المحادثات
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterConversations(e));
        });
        
        // إرسال رسالة
        const sendBtn = document.querySelector('.send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // إدخال الرسالة
        const messageInput = document.querySelector('.message-input-wrapper textarea');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            messageInput.addEventListener('input', (e) => this.handleTyping(e.target.value));
        }
        
        // المرفقات
        const attachBtn = document.querySelector('.input-action-btn .fa-paperclip')?.closest('.input-action-btn');
        if (attachBtn) {
            attachBtn.addEventListener('click', () => this.attachFile());
        }
    }

    bindConversationEvents() {
        document.addEventListener('click', (e) => {
            const conversationItem = e.target.closest('.conversation-item');
            if (conversationItem) {
                e.preventDefault();
                const conversationId = parseInt(conversationItem.dataset.id || conversationItem.querySelector('.project-tag')?.textContent.replace('#PRJ-', ''));
                this.openConversation(conversationId);
            }
            
            const closeActions = e.target.closest('.close-actions');
            if (closeActions) {
                this.closeQuickActions();
            }
        });
    }

    bindChatWindowEvents() {
        // مكالمة صوتية
        const voiceCallBtn = document.querySelector('.chat-action-btn .fa-phone')?.closest('.chat-action-btn');
        if (voiceCallBtn) {
            voiceCallBtn.addEventListener('click', () => this.startVoiceCall());
        }
        
        // مكالمة فيديو
        const videoCallBtn = document.querySelector('.chat-action-btn .fa-video')?.closest('.chat-action-btn');
        if (videoCallBtn) {
            videoCallBtn.addEventListener('click', () => this.startVideoCall());
        }
        
        // معلومات المحادثة
        const infoBtn = document.querySelector('.chat-action-btn .fa-info-circle')?.closest('.chat-action-btn');
        if (infoBtn) {
            infoBtn.addEventListener('click', () => this.showChatInfo());
        }
        
        // تحميل الملفات
        const downloadAllBtn = document.querySelector('.action-btn.outline .fa-download')?.closest('.action-btn');
        if (downloadAllBtn) {
            downloadAllBtn.addEventListener('click', () => this.downloadAllFiles());
        }
    }

    initWebSocket() {
        // محاكاة WebSocket للدردشة الفورية
        // في التطبيق الحقيقي، ستكون هناك اتصال WebSocket فعلي
        this.simulateWebSocket();
    }

    simulateWebSocket() {
        // محاكاة اتصال WebSocket
        setInterval(() => {
            if (this.currentChat && Math.random() > 0.7) {
                this.simulateIncomingMessage();
            }
        }, 10000);
    }

    openConversation(conversationId) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (!conversation) return;
        
        this.currentChat = conversation;
        
        // تحديث واجهة المحادثة
        this.updateChatWindow(conversation);
        
        // تحميل الرسائل
        this.loadMessages(conversationId);
        
        // تعيين كمقروء
        this.markAsRead(conversationId);
        
        // تحديث قائمة المحادثات
        this.updateConversationList();
        
        // إظهار نافذة الدردشة
        document.querySelector('.chat-window-main').style.display = 'flex';
    }

    updateChatWindow(conversation) {
        // تحديث معلومات المستخدم
        const userAvatar = document.querySelector('.user-avatar img');
        const userName = document.querySelector('.user-details h3');
        const userStatus = document.querySelector('.user-status');
        const projectInfo = document.querySelector('.project-info');
        
        if (userAvatar) userAvatar.src = conversation.avatar;
        if (userName) userName.textContent = conversation.name;
        if (userStatus) {
            userStatus.textContent = conversation.online ? 'متصل الآن' : 'غير متصل';
            userStatus.className = `user-status ${conversation.online ? 'online' : 'offline'}`;
        }
        if (projectInfo && conversation.project) {
            projectInfo.textContent = `مشروع: ${conversation.project}`;
        }
        
        // تحديث معلومات المشروع في الشريط الجانبي
        this.updateProjectSidebar(conversation);
    }

    updateProjectSidebar(conversation) {
        const projectInfo = document.querySelector('.project-info-card');
        if (!projectInfo || !conversation.project) return;
        
        // تحديث تفاصيل المشروع
        const projectDetails = {
            id: conversation.projectId || 'PRJ-001',
            type: 'تصميم شعار',
            status: 'نشط',
            budget: '1,200 ريال',
            deadline: '20 فبراير 2024',
            progress: 60
        };
        
        projectInfo.querySelectorAll('.detail-item').forEach(item => {
            const label = item.querySelector('.detail-label').textContent;
            const value = item.querySelector('.detail-value');
            
            switch(label) {
                case 'رقم المشروع':
                    value.textContent = `#${projectDetails.id}`;
                    break;
                case 'النوع':
                    value.textContent = projectDetails.type;
                    break;
                case 'الحالة':
                    value.textContent = projectDetails.status;
                    value.className = `detail-value status-${projectDetails.status === 'نشط' ? 'active' : 'inactive'}`;
                    break;
                case 'الميزانية':
                    value.textContent = projectDetails.budget;
                    break;
                case 'موعد التسليم':
                    value.textContent = projectDetails.deadline;
                    break;
            }
        });
        
        // تحديث شريط التقدم
        const progressFill = projectInfo.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${projectDetails.progress}%`;
        }
    }

    loadMessages(conversationId) {
        const messages = this.messages.get(conversationId) || [];
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        // تجميع الرسائل حسب التاريخ
        const groupedMessages = this.groupMessagesByDate(messages);
        
        chatMessages.innerHTML = Object.entries(groupedMessages).map(([date, msgs]) => `
            <div class="message-day">
                <span class="day-label">${this.formatMessageDate(date)}</span>
            </div>
            ${msgs.map(msg => this.createMessageHTML(msg)).join('')}
        `).join('');
        
        // التمرير للأسفل
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    groupMessagesByDate(messages) {
        const groups = {};
        
        messages.forEach(msg => {
            const date = new Date(msg.timestamp).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
        });
        
        return groups;
    }

    createMessageHTML(message) {
        const isCurrentUser = message.senderId === 'current';
        const time = new Date(message.timestamp).toLocaleTimeString('ar-SA', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `
            <div class="message ${isCurrentUser ? 'sent' : 'received'}">
                ${!isCurrentUser ? `
                    <div class="message-avatar">
                        <img src="${message.avatar || 'https://ui-avatars.com/api/?name=مستخدم&background=005f73&color=fff'}" 
                             alt="${message.senderName}">
                    </div>
                ` : ''}
                <div class="message-content">
                    ${!isCurrentUser ? `
                        <div class="message-header">
                            <span class="sender-name">${message.senderName}</span>
                            <span class="message-time">${time}</span>
                        </div>
                    ` : ''}
                    <div class="message-body">
                        <p>${message.text}</p>
                        ${message.attachments ? this.createAttachmentsHTML(message.attachments) : ''}
                        ${isCurrentUser ? `<div class="message-time">${time}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    createAttachmentsHTML(attachments) {
        return attachments.map(attachment => `
            <div class="message-attachment">
                <div class="attachment-preview">
                    ${attachment.type.startsWith('image/') ? `
                        <img src="${attachment.url}" alt="${attachment.name}">
                    ` : `
                        <div class="file-icon">
                            <i class="fas fa-file-${attachment.type.includes('pdf') ? 'pdf' : 'image'}"></i>
                        </div>
                    `}
                    <div class="attachment-overlay">
                        <button class="attachment-btn" onclick="chatManager.downloadAttachment('${attachment.url}', '${attachment.name}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="attachment-btn" onclick="chatManager.previewAttachment('${attachment.url}')">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
                <span class="attachment-name">${attachment.name}</span>
                <span class="attachment-size">${this.formatFileSize(attachment.size)}</span>
            </div>
        `).join('');
    }

    async sendMessage() {
        const input = document.querySelector('.message-input-wrapper textarea');
        const text = input?.value.trim();
        
        if (!text || !this.currentChat) return;
        
        // إنشاء رسالة جديدة
        const newMessage = {
            id: Date.now(),
            text,
            senderId: 'current',
            senderName: 'أنت',
            timestamp: new Date().toISOString(),
            status: 'sending'
        };
        
        // إضافة الرسالة للواجهة
        this.addMessageToChat(newMessage);
        
        // مسح الحقل
        if (input) input.value = '';
        
        // حفظ الرسالة
        const messages = this.messages.get(this.currentChat.id) || [];
        messages.push(newMessage);
        this.messages.set(this.currentChat.id, messages);
        
        // تحديث آخر رسالة في المحادثة
        this.updateConversationLastMessage(this.currentChat.id, text);
        
        // محاكاة إرسال واستلام رد
        setTimeout(() => {
            this.simulateReply(newMessage);
        }, 1000);
        
        // حفظ المحادثات
        this.saveConversations();
    }

    addMessageToChat(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageElement = this.createMessageHTML(message);
        const lastDay = chatMessages.querySelector('.message-day:last-child');
        
        if (lastDay && this.isSameDay(new Date(message.timestamp), new Date())) {
            lastDay.insertAdjacentHTML('afterend', messageElement);
        } else {
            const dayElement = `
                <div class="message-day">
                    <span class="day-label">اليوم</span>
                </div>
                ${messageElement}
            `;
            chatMessages.insertAdjacentHTML('beforeend', dayElement);
        }
        
        // تحديث حالة الرسالة بعد إرسالها
        setTimeout(() => {
            const msgElement = chatMessages.querySelector(`[data-message-id="${message.id}"]`);
            if (msgElement) {
                msgElement.querySelector('.message-status').innerHTML = '<i class="fas fa-check"></i>';
            }
        }, 1500);
        
        // التمرير للأسفل
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    simulateReply(originalMessage) {
        if (!this.currentChat) return;
        
        const replies = [
            "شكراً على رسالتك، سأراجع طلبك قريباً.",
            "هل يمكنك إرسال المزيد من التفاصيل؟",
            "تم استلام طلبك، سأبدأ العمل عليه فوراً.",
            "هل تريد أي تعديلات على التصميم الحالي؟",
            "سأرسل لك النسخة الأولى خلال 24 ساعة."
        ];
        
        const reply = {
            id: Date.now(),
            text: replies[Math.floor(Math.random() * replies.length)],
            senderId: this.currentChat.id,
            senderName: this.currentChat.name,
            avatar: this.currentChat.avatar,
            timestamp: new Date().toISOString()
        };
        
        // إضافة الرد
        this.addMessageToChat(reply);
        
        // تحديث الرسائل
        const messages = this.messages.get(this.currentChat.id) || [];
        messages.push(reply);
        this.messages.set(this.currentChat.id, messages);
        
        // إشعار
        this.showNotification('رسالة جديدة', `${this.currentChat.name}: ${reply.text}`);
    }

    simulateIncomingMessage() {
        if (!this.currentChat || Math.random() > 0.3) return;
        
        const messages = [
            "هل رأيت النسخة الجديدة من التصميم؟",
            "لدي سؤال بخصوص المتطلبات",
            "يمكنني تسليم العمل غداً",
            "هل تحتاج إلى أي تعديلات؟",
            "تم تحديث الملفات في المشروع"
        ];
        
        const incomingMessage = {
            id: Date.now(),
            text: messages[Math.floor(Math.random() * messages.length)],
            senderId: this.currentChat.id,
            senderName: this.currentChat.name,
            avatar: this.currentChat.avatar,
            timestamp: new Date().toISOString()
        };
        
        // إضافة الرسالة
        this.addMessageToChat(incomingMessage);
        
        // تحديث الرسائل
        const chatMessages = this.messages.get(this.currentChat.id) || [];
        chatMessages.push(incomingMessage);
        this.messages.set(this.currentChat.id, chatMessages);
        
        // إشعار
        if (!document.hasFocus()) {
            this.showNotification('رسالة جديدة', `${this.currentChat.name}: ${incomingMessage.text}`);
        }
    }

    handleTyping(text) {
        if (!this.currentChat || !text) return;
        
        // محاكاة كتابة المستخدم الآخر
        if (text.length > 3 && Math.random() > 0.7) {
            this.showTypingIndicator();
        }
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        // إزالة مؤشر الكتابة السابق
        const existingIndicator = chatMessages.querySelector('.typing-indicator');
        if (existingIndicator) existingIndicator.remove();
        
        // إضافة مؤشر جديد
        const indicator = `
            <div class="message received typing-indicator">
                <div class="message-avatar">
                    <img src="${this.currentChat.avatar}" alt="${this.currentChat.name}">
                </div>
                <div class="message-content">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        chatMessages.insertAdjacentHTML('beforeend', indicator);
        
        // التمرير للأسفل
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // إزالة المؤشر بعد 3 ثوان
        setTimeout(() => {
            const indicator = chatMessages.querySelector('.typing-indicator');
            if (indicator) indicator.remove();
        }, 3000);
    }

    async attachFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*,.pdf,.psd,.ai,.doc,.docx';
        
        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            
            for (const file of files) {
                await this.uploadFile(file);
            }
        };
        
        input.click();
    }

    async uploadFile(file) {
        if (!this.currentChat) return;
        
        // التحقق من حجم الملف
        if (file.size > 10 * 1024 * 1024) { // 10MB
            this.showError('حجم الملف يجب أن يكون أقل من 10MB');
            return;
        }
        
        // محاكاة رفع الملف
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const attachment = {
                id: Date.now(),
                name: file.name,
                type: file.type,
                size: file.size,
                url: e.target.result
            };
            
            // إنشاء رسالة بالمرفق
            const message = {
                id: Date.now(),
                text: 'تم إرفاق ملف',
                senderId: 'current',
                senderName: 'أنت',
                timestamp: new Date().toISOString(),
                attachments: [attachment]
            };
            
            // إضافة الرسالة
            this.addMessageToChat(message);
            
            // حفظ الرسالة
            const messages = this.messages.get(this.currentChat.id) || [];
            messages.push(message);
            this.messages.set(this.currentChat.id, messages);
            
            this.saveConversations();
        };
        
        reader.readAsDataURL(file);
    }

    downloadAttachment(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    previewAttachment(url) {
        const modal = document.createElement('div');
        modal.className = 'preview-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-preview"><i class="fas fa-times"></i></button>
                <img src="${url}" alt="معاينة الملف">
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-preview').addEventListener('click', () => {
            modal.remove();
        });
    }

    downloadAllFiles() {
        const messages = this.messages.get(this.currentChat?.id) || [];
        const attachments = messages.flatMap(msg => msg.attachments || []);
        
        if (attachments.length === 0) {
            this.showInfo('لا توجد ملفات للتحميل');
            return;
        }
        
        // محاكاة تحميل الملفات
        attachments.forEach((attachment, index) => {
            setTimeout(() => {
                this.downloadAttachment(attachment.url, attachment.name);
            }, index * 500);
        });
        
        this.showSuccess(`جاري تحميل ${attachments.length} ملف`);
    }

    searchConversations(query) {
        const conversationItems = document.querySelectorAll('.conversation-item');
        
        conversationItems.forEach(item => {
            const name = item.querySelector('h4').textContent;
            const preview = item.querySelector('.conversation-preview').textContent;
            
            const matches = name.includes(query) || preview.includes(query);
            item.style.display = matches ? 'flex' : 'none';
        });
    }

    filterConversations(e) {
        const button = e.currentTarget;
        const filter = button.textContent;
        
        // تحديث الأزرار النشطة
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // تطبيق الفلتر
        let filteredConversations = this.conversations;
        
        switch(filter) {
            case 'غير المقروء':
                filteredConversations = this.conversations.filter(conv => 
                    this.unreadCounts.get(conv.id) > 0
                );
                break;
            case 'المهمة':
                filteredConversations = this.conversations.filter(conv => conv.important);
                break;
        }
        
        // تحديث القائمة
        this.updateConversationList(filteredConversations);
    }

    updateConversationList(conversations = this.conversations) {
        const conversationsContainer = document.querySelector('.conversations');
        if (!conversationsContainer) return;
        
        conversationsContainer.innerHTML = conversations.map(conv => {
            const unreadCount = this.unreadCounts.get(conv.id) || 0;
            const lastMessage = this.getLastMessage(conv.id);
            
            return `
                <div class="conversation-item ${this.currentChat?.id === conv.id ? 'active' : ''}" 
                     data-id="${conv.id}">
                    <div class="conversation-avatar">
                        <img src="${conv.avatar}" alt="${conv.name}">
                        <span class="online-status ${conv.online ? 'online' : 'offline'}"></span>
                    </div>
                    <div class="conversation-details">
                        <div class="conversation-header">
                            <h4>${conv.name}</h4>
                            <span class="conversation-time">${this.formatTime(conv.lastActivity)}</span>
                        </div>
                        <p class="conversation-preview">${lastMessage?.text || 'لا توجد رسائل'}</p>
                        <div class="conversation-meta">
                            ${conv.project ? `<span class="project-tag">${conv.project}</span>` : ''}
                            ${unreadCount > 0 ? `<span class="unread-count">${unreadCount}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getLastMessage(conversationId) {
        const messages = this.messages.get(conversationId) || [];
        return messages[messages.length - 1];
    }

    markAsRead(conversationId) {
        this.unreadCounts.set(conversationId, 0);
        this.updateUnreadCounts();
    }

    updateUnreadCounts() {
        // حساب الرسائل غير المقروءة لكل محادثة
        this.conversations.forEach(conv => {
            const messages = this.messages.get(conv.id) || [];
            const unread = messages.filter(msg => 
                msg.senderId !== 'current' && !msg.read
            ).length;
            
            this.unreadCounts.set(conv.id, unread);
        });
        
        // تحديث العداد في الشريط العلوي
        const totalUnread = Array.from(this.unreadCounts.values()).reduce((a, b) => a + b, 0);
        const unreadBadge = document.getElementById('unreadMessages');
        if (unreadBadge) {
            unreadBadge.textContent = totalUnread > 0 ? totalUnread : '';
        }
    }

    updateConversationLastMessage(conversationId, text) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (conversation) {
            conversation.lastActivity = new Date().toISOString();
            this.saveConversations();
        }
    }

    async startVoiceCall() {
        if (!this.currentChat) return;
        
        this.showInfo('جاري الاتصال...');
        
        // محاكاة اتصال صوتي
        setTimeout(() => {
            const callConfirmed = Math.random() > 0.3;
            
            if (callConfirmed) {
                this.showCallInterface('voice');
            } else {
                this.showError('المستخدم غير متاح');
            }
        }, 2000);
    }

    async startVideoCall() {
        if (!this.currentChat) return;
        
        this.showInfo('جاري الاتصال...');
        
        // محاكاة اتصال فيديو
        setTimeout(() => {
            const callConfirmed = Math.random() > 0.4;
            
            if (callConfirmed) {
                this.showCallInterface('video');
            } else {
                this.showError('المستخدم غير متاح');
            }
        }, 3000);
    }

    showCallInterface(type) {
        const modal = document.createElement('div');
        modal.className = 'call-modal';
        modal.innerHTML = `
            <div class="call-container">
                <div class="call-header">
                    <h3>${type === 'voice' ? 'مكالمة صوتية' : 'مكالمة فيديو'}</h3>
                    <button class="end-call"><i class="fas fa-times"></i></button>
                </div>
                <div class="call-body">
                    <div class="call-user">
                        <img src="${this.currentChat.avatar}" alt="${this.currentChat.name}">
                        <h4>${this.currentChat.name}</h4>
                        <span class="call-status">متصل</span>
                    </div>
                    <div class="call-controls">
                        <button class="call-control mute">
                            <i class="fas fa-microphone"></i>
                        </button>
                        <button class="call-control speaker">
                            <i class="fas fa-volume-up"></i>
                        </button>
                        <button class="call-control end-call-btn">
                            <i class="fas fa-phone-slash"></i>
                        </button>
                        ${type === 'video' ? `
                            <button class="call-control camera">
                                <i class="fas fa-video"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="call-timer">00:00</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        let timer = 0;
        const timerElement = modal.querySelector('.call-timer');
        
        // بدء المؤقت
        const timerInterval = setInterval(() => {
            timer++;
            const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
            const seconds = (timer % 60).toString().padStart(2, '0');
            timerElement.textContent = `${minutes}:${seconds}`;
        }, 1000);
        
        // إضافة مستمعي الأحداث
        const endCall = () => {
            clearInterval(timerInterval);
            modal.remove();
            this.showSuccess('تم إنهاء المكالمة');
        };
        
        modal.querySelectorAll('.end-call, .end-call-btn').forEach(btn => {
            btn.addEventListener('click', endCall);
        });
        
        // التحكم في المكالمة
        modal.querySelectorAll('.call-control').forEach(control => {
            control.addEventListener('click', (e) => {
                e.currentTarget.classList.toggle('active');
            });
        });
    }

    showChatInfo() {
        if (!this.currentChat) return;
        
        const modal = document.createElement('div');
        modal.className = 'info-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="info-header">
                    <img src="${this.currentChat.avatar}" alt="${this.currentChat.name}">
                    <h3>${this.currentChat.name}</h3>
                    <span class="user-status ${this.currentChat.online ? 'online' : 'offline'}">
                        ${this.currentChat.online ? 'متصل الآن' : 'غير متصل'}
                    </span>
                </div>
                <div class="info-details">
                    <div class="info-item">
                        <span class="info-label">البريد الإلكتروني</span>
                        <span class="info-value">${this.currentChat.email || 'غير متوفر'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">رقم الهاتف</span>
                        <span class="info-value">${this.currentChat.phone || 'غير متوفر'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">تاريخ الانضمام</span>
                        <span class="info-value">${this.formatDate(this.currentChat.joinedDate)}</span>
                    </div>
                    ${this.currentChat.project ? `
                        <div class="info-item">
                            <span class="info-label">المشروع</span>
                            <span class="info-value">${this.currentChat.project}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="info-actions">
                    <button class="action-btn outline block-user">حظر المستخدم</button>
                    <button class="action-btn report-user">الإبلاغ</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.block-user').addEventListener('click', () => {
            this.blockUser(this.currentChat.id);
            modal.remove();
        });
        
        modal.querySelector('.report-user').addEventListener('click', () => {
            this.reportUser(this.currentChat.id);
            modal.remove();
        });
        
        // إغلاق بالنقر خارج المحتوى
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    blockUser(userId) {
        const conversation = this.conversations.find(c => c.id === userId);
        if (conversation) {
            conversation.blocked = true;
            this.saveConversations();
            this.showSuccess(`تم حظر ${conversation.name}`);
        }
    }

    reportUser(userId) {
        this.showInfo('تم الإبلاغ عن المستخدم للدعم الفني');
    }

    getSampleConversations() {
        return [
            {
                id: 1,
                name: 'أحمد المصمم',
                avatar: 'https://ui-avatars.com/api/?name=أحمد+المصمم&background=005f73&color=fff',
                online: true,
                project: 'مشروع #PRJ-001',
                projectId: 'PRJ-001',
                lastActivity: '2024-02-18T10:30:00Z',
                email: 'ahmed@designer.com',
                phone: '+966500000001',
                joinedDate: '2023-05-15'
            },
            {
                id: 2,
                name: 'سارة المصممة',
                avatar: 'https://ui-avatars.com/api/?name=سارة+المصممة&background=9a031e&color=fff',
                online: false,
                project: 'مشروع #PRJ-002',
                projectId: 'PRJ-002',
                lastActivity: '2024-02-17T14:45:00Z',
                email: 'sara@designer.com',
                phone: '+966500000002',
                joinedDate: '2023-07-20'
            },
            {
                id: 3,
                name: 'فريق الدعم الفني',
                avatar: 'https://ui-avatars.com/api/?name=فريق+الدعم&background=0a9396&color=fff',
                online: true,
                lastActivity: '2024-02-15T09:20:00Z',
                email: 'support@pixelart.com',
                phone: '+966800000000',
                joinedDate: '2023-01-01'
            },
            {
                id: 4,
                name: 'خالد المصمم',
                avatar: 'https://ui-avatars.com/api/?name=خالد+المصمم&background=bb3e03&color=fff',
                online: true,
                project: 'مشروع #PRJ-003',
                projectId: 'PRJ-003',
                lastActivity: '2024-02-14T16:30:00Z',
                email: 'khaled@designer.com',
                phone: '+966500000003',
                joinedDate: '2023-03-10'
            }
        ];
    }

    // === وظائف مساعدة ===
    
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    formatMessageDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (this.isSameDay(date, today)) {
            return 'اليوم';
        } else if (this.isSameDay(date, yesterday)) {
            return 'أمس';
        } else {
            return date.toLocaleDateString('ar-SA');
        }
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = (now - date) / (1000 * 60 * 60);
        
        if (diffHours < 1) {
            const diffMinutes = Math.floor(diffHours * 60);
            return `منذ ${diffMinutes} دقيقة`;
        } else if (diffHours < 24) {
            return `منذ ${Math.floor(diffHours)} ساعة`;
        } else if (diffHours < 48) {
            return 'أمس';
        } else {
            return date.toLocaleDateString('ar-SA');
        }
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ar-SA');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(title, body) {
        // تحقق من دعم الإشعارات
        if (!("Notification" in window)) return;
        
        // طلب الإذن
        if (Notification.permission === "granted") {
            new Notification(title, { body });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(title, { body });
                }
            });
        }
        
        // إشعار Toastify كبديل
        Toastify({
            text: `${title}: ${body}`,
            duration: 5000,
            gravity: "top",
            position: "left",
            backgroundColor: "#0a9396"
        }).showToast();
    }

    showError(message) {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "left",
            backgroundColor: "#e76f51"
        }).showToast();
    }

    showSuccess(message) {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "left",
            backgroundColor: "#2a9d8f"
        }).showToast();
    }

    showInfo(message) {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "left",
            backgroundColor: "#0a9396"
        }).showToast();
    }

    closeQuickActions() {
        const menu = document.getElementById('quickActionsMenu');
        if (menu) menu.style.display = 'none';
    }
}

// تهيئة مدير الدردشة
document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
});
