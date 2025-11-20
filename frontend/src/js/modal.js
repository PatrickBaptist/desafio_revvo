class Modal {
    constructor() {
        this.modal = null;
        this.cookieName = 'revvo_modal_seen';
        this.cookieExpiry = 30;
        this.init();
    }

    init() {
        if (this.hasSeenModal()) {
            return;
        }

        this.createModal();
        this.bindEvents();
        this.showModal();
    }

    createModal() {
        const modalHTML = `
            <div class="modal-overlay" id="welcomeModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Bem-vindo à Revvo!</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Aenean lacinia bibendum nulla sed consectetur. 
                           Sociis natoque penatibus et magnis dis parturient montes, 
                           nascetur ridiculus mus.</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                           Vestibulum id ligula porta felis euismod semper.</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" id="modalAccept">Entendi</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('welcomeModal');
    }

    bindEvents() {
        const closeBtn = this.modal.querySelector('.modal-close');
        const acceptBtn = this.modal.querySelector('#modalAccept');
        const overlay = this.modal;

        closeBtn.addEventListener('click', () => this.closeModal());
        acceptBtn.addEventListener('click', () => this.closeModal());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.closeModal();
            }
        });
    }

    showModal() {
        setTimeout(() => {
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }, 1000);
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.setModalSeen();
    }

    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }

    deleteCookie(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    hasSeenModal() {
        return this.getCookie(this.cookieName) === 'true';
    }

    setModalSeen() {
        this.setCookie(this.cookieName, 'true', this.cookieExpiry);
    }

    resetModal() {
        this.deleteCookie(this.cookieName);
    }
}

class SlideManager {
    constructor() {
        this.modal = null;
        this.form = null;
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
    }

    createModal() {
        const modalHTML = `
            <div class="modal-overlay slide-modal" id="slideModal" style="display: none;">
                <div class="modal-content slide-modal-content">
                    <div class="modal-header">
                        <h2>Adicionar Novo Slide</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="slideForm" class="slide-form" enctype="multipart/form-data">
                            <div class="form-group">
                                <label for="slideImage">Imagem do Slide *</label>
                                <input type="file" id="slideImage" name="image" accept="image/*" required>
                                <div class="image-preview" id="imagePreview"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="slideTitle">Título *</label>
                                <input type="text" id="slideTitle" name="title" placeholder="Digite o título do slide" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="slideDescription">Descrição *</label>
                                <textarea id="slideDescription" name="description" placeholder="Digite a descrição do slide" rows="4" required></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="slideLink">Link do Botão</label>
                                <input type="url" id="slideLink" name="button_link" placeholder="https://exemplo.com">
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-cancel">Cancelar</button>
                                <button type="submit" class="btn btn-primary" id="submitSlide">
                                    <span class="btn-text">Adicionar Slide</span>
                                    <span class="btn-loading" style="display: none;">Enviando...</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('slideModal');
        this.form = document.getElementById('slideForm');
    }

    bindEvents() {
        document.getElementById('addSlideBtn').addEventListener('click', () => {
            this.showModal();
        });

        this.modal.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal();
        });

        this.modal.querySelector('.btn-cancel').addEventListener('click', () => {
            this.hideModal();
        });

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        document.getElementById('slideImage').addEventListener('change', (e) => {
            this.previewImage(e.target.files[0]);
        });

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });
    }

    showModal() {
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resetForm();
    }

    previewImage(file) {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = '';

        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione apenas arquivos de imagem.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `
                    <div class="preview-container">
                        <img src="${e.target.result}" alt="Preview">
                        <span>${file.name}</span>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    }

    async submitForm() {
        const formData = new FormData(this.form);
        const submitBtn = document.getElementById('submitSlide');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        const imageFile = formData.get('image');
        const title = formData.get('title');
        const description = formData.get('description');
        const button_link = formData.get('button_link');

        if (!imageFile || imageFile.size === 0) {
            alert('Por favor, selecione uma imagem.');
            return;
        }

        if (!title || !description) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled = true;

        try {
            console.log('Fazendo upload da imagem...');
            
            const uploadFormData = new FormData();
            uploadFormData.append('image', imageFile);
            
            const uploadResponse = await fetch('http://localhost:8000/api/upload.php', {
                method: 'POST',
                body: uploadFormData
            });

            if (!uploadResponse.ok) {
                throw new Error(`Erro no upload da imagem: ${uploadResponse.status}`);
            }

            const uploadResult = await uploadResponse.json();
            console.log('Upload da imagem:', uploadResult);

            if (!uploadResult.success) {
                throw new Error(uploadResult.message || 'Erro no upload da imagem');
            }

            console.log('Criando slide...');
            const slideData = {
                image: uploadResult.url.replace('/uploads/', ''), // Só o nome do arquivo
                title: title,
                description: description,
                button_link: button_link
            };

            console.log('Dados do slide:', slideData);

            const slideResponse = await fetch('http://localhost:8000/api/slideshow.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(slideData)
            });

            if (!slideResponse.ok) {
                throw new Error(`Erro ao criar slide: ${slideResponse.status}`);
            }

            const slideResult = await slideResponse.json();
            console.log('Slide criado com sucesso:', slideResult);

            alert('Slide adicionado com sucesso!');
            this.hideModal();

            window.location.reload();

        } catch (error) {
            console.error('Erro completo ao adicionar slide:', error);
            alert('Erro ao adicionar slide: ' + error.message);
        } finally {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    resetForm() {
        this.form.reset();
        document.getElementById('imagePreview').innerHTML = '';
    }
}

class CourseManager {
    constructor() {
        this.modal = null;
        this.form = null;
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
    }

    createModal() {
        const modalHTML = `
            <div class="modal-overlay course-modal" id="courseModal" style="display: none;">
                <div class="modal-content course-modal-content">
                    <div class="modal-header">
                        <h2>Adicionar Novo Curso</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="courseForm" class="course-form">
                            <div class="form-group">
                                <label for="courseTitle">Título do Curso *</label>
                                <input type="text" id="courseTitle" name="title" placeholder="Digite o título do curso" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="courseDescription">Descrição do Curso *</label>
                                <textarea id="courseDescription" name="description" placeholder="Digite a descrição do curso" rows="4" required></textarea>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-cancel">Cancelar</button>
                                <button type="submit" class="btn btn-primary" id="submitCourse">
                                    <span class="btn-text">Adicionar Curso</span>
                                    <span class="btn-loading" style="display: none;">Enviando...</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('courseModal');
        this.form = document.getElementById('courseForm');
    }

    bindEvents() {
        document.getElementById('addCourseBtn').addEventListener('click', () => {
            this.showModal();
        });

        this.modal.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal();
        });

        this.modal.querySelector('.btn-cancel').addEventListener('click', () => {
            this.hideModal();
        });

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });
    }

    showModal() {
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resetForm();
    }

    async submitForm() {
        const formData = new FormData(this.form);
        const submitBtn = document.getElementById('submitCourse');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        const title = formData.get('title');
        const description = formData.get('description');

        if (!title || !description) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled = true;

        try {
            console.log('Criando curso...');
            const courseData = {
                title: title,
                description: description
            };

            console.log('Dados do curso:', courseData);

            const response = await fetch('http://localhost:8000/api/courses.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData)
            });

            if (!response.ok) {
                throw new Error(`Erro ao criar curso: ${response.status}`);
            }

            const result = await response.json();
            console.log('Curso criado com sucesso:', result);

            alert('Curso adicionado com sucesso!');
            this.hideModal();

            window.location.reload();

        } catch (error) {
            console.error('Erro completo ao adicionar curso:', error);
            alert('Erro ao adicionar curso: ' + error.message);
        } finally {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    resetForm() {
        this.form.reset();
    }
}

// Inicializar ambos os gerenciadores
document.addEventListener('DOMContentLoaded', () => {
    new SlideManager();
    new CourseManager();
});

const modalStyles = `
    .modal-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1000;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s ease;
    }

    .modal-content {
        background: white;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
    }

    .modal-header {
        padding: 24px 24px 16px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, #2c3e50, #3498db);
        color: white;
        border-radius: 12px 12px 0 0;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
    }

    .modal-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .modal-body {
        padding: 24px;
        line-height: 1.6;
    }

    .modal-body p {
        margin-bottom: 16px;
        color: #555;
    }

    .modal-body p:last-child {
        margin-bottom: 0;
    }

    .modal-footer {
        padding: 16px 24px 24px;
        border-top: 1px solid #e0e0e0;
        text-align: right;
        background: #f9f9f9;
        border-radius: 0 0 12px 12px;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideIn {
        from { 
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
        }
        to { 
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    /* Responsividade do Modal */
    @media (max-width: 768px) {
        .modal-content {
            width: 95%;
            margin: 20px;
        }

        .modal-header {
            padding: 20px 20px 12px;
        }

        .modal-header h2 {
            font-size: 1.3rem;
        }

        .modal-body {
            padding: 20px;
        }

        .modal-footer {
            padding: 12px 20px 20px;
        }
    }

    @media (max-width: 480px) {
        .modal-content {
            width: 100%;
            margin: 10px;
            border-radius: 8px;
        }

        .modal-header {
            padding: 16px 16px 12px;
        }

        .modal-header h2 {
            font-size: 1.2rem;
        }

        .modal-body {
            padding: 16px;
        }

        .modal-footer {
            padding: 12px 16px 16px;
        }
    }
`;

document.head.insertAdjacentHTML('beforeend', `<style>${modalStyles}</style>`);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Modal;
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        new Modal();
    }, 500);
});