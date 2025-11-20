class RevvoApp {
    constructor() {
        this.courses = [];
        this.slideshowData = [];
        this.currentSlide = 0;
        this.init();
    }

    async init() {
        console.log('Iniciando Revvo App...');
        await this.loadSlideshow();
        await this.loadCourses();

        this.renderSlideshow();
        this.renderCourses();
        this.bindEvents();
    }

    async loadSlideshow() {
        try {
            console.log('Carregando slideshow...');
            const response = await fetch('http://localhost:8000/api/slideshow.php');

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('Dados do slideshow:', data);
            
            this.slideshowData = Array.isArray(data) ? data : [data];
        } catch (error) {
            console.error('Erro ao carregar slideshow:', error);
            this.slideshowData = [];
        }
    }

    async loadCourses() {
        try {
            console.log('Carregando cursos...');
            const response = await fetch('http://localhost:8000/api/courses.php');
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Dados dos cursos:', data);
            
            this.courses = Array.isArray(data) ? data : [data];
        } catch (error) {
            console.error('Erro ao carregar cursos:', error);
            this.courses = [];
        }
    }

    renderSlideshow() {
        const heroSection = document.querySelector('.hero');
        
        if (this.slideshowData.length > 0) {
            heroSection.innerHTML = `
                <div class="slideshow-container">
                    ${this.slideshowData.map((slide, index) => `
                        <div class="slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                            <div class="slide-background"></div>
                            <div class="container">
                                <div class="slide-content">
                                    <h2>${slide.title || 'Título do Slide'}</h2>
                                    <p>${slide.description || 'Descrição do slide'}</p>
                                    <a href="${slide.button_link || '#'}" class="btn btn-primary" target="_blank">VER CURSO</a>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    
                    ${this.slideshowData.length > 1 ? `
                        <button class="slide-nav slide-prev" aria-label="Slide anterior">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 18l-6-6 6-6"/>
                            </svg>
                        </button>
                        <button class="slide-nav slide-next" aria-label="Próximo slide">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </button>
                        
                        <div class="slide-dots">
                            ${this.slideshowData.map((_, index) => `
                                <button class="slide-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Ir para slide ${index + 1}"></button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;

            this.slideshowData.forEach((slide, index) => {
                const slideElement = heroSection.querySelector(`.slide[data-index="${index}"] .slide-background`);
                if (slide.image) {
                    slideElement.style.backgroundImage = `url('http://localhost:8000/uploads/${slide.image}')`;
                }
            });
        }
    }

    renderCourses() {
        const coursesGrid = document.querySelector('.courses-grid');

        if (!coursesGrid) {
            console.warn('Elemento .courses-grid não encontrado');
            return;
        }
        
        const loadingElement = coursesGrid.querySelector('.courses-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
        
        if (this.courses.length === 0) {
            coursesGrid.innerHTML = `
                <div class="no-courses">
                    <div class="empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h3>Nenhum curso disponível</h3>
                    <p>Ainda não há cursos cadastrados no momento.</p>
                </div>
            `;
            
            return;
        }

        const coursesHTML = this.courses.map(course => 
            this.getCourseCardHTML(course)
        ).join('');
        
        coursesGrid.innerHTML = coursesHTML;
        

        console.log(`${this.courses.length} curso(s) renderizado(s)`);
    }

    getCourseCardHTML(course) {
        const isNew = this.isNewCourse(course.created_at);
        
        const imageUrl = course.image 
            ? `http://localhost:8000/uploads/${course.image}`
            : this.getDefaultImage();

        return `
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-image">
                    <img src="${imageUrl}" alt="${this.escapeHtml(course.title)}" loading="lazy">
                    ${isNew ? '<span class="course-badge">NOVO</span>' : ''}
                </div>
                <div class="course-content">
                    <h3 class="course-title">${this.escapeHtml(course.title)}</h3>
                    <p class="course-description">${this.escapeHtml(course.description)}</p>
                    <a href="#" class="btn" data-course-id="${course.id}">VER CURSO</a>
                </div>
            </div>
        `;
    }

    isNewCourse(createdAt) {
        if (!createdAt) return false;
        
        const courseDate = new Date(createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        return courseDate > thirtyDaysAgo;
    }

    getDefaultImage() {
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23667eea;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23764ba2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23grad)" width="400" height="300"/%3E%3Ctext fill="white" font-size="20" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ECurso%3C/text%3E%3C/svg%3E';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    openCourse(courseId) {
        console.log('Abrindo curso:', courseId);
        
        const course = this.courses.find(c => c.id == courseId);
        if (course) {
            console.log('Detalhes do curso:', course);
            alert(`Curso: ${course.title}\n\n${course.description}`);
        }
    }

    nextSlide() {
        if (this.slideshowData.length <= 1) return;
        
        this.currentSlide = (this.currentSlide + 1) % this.slideshowData.length;
        this.showSlide(this.currentSlide);
    }

    prevSlide() {
        if (this.slideshowData.length <= 1) return;
        
        this.currentSlide = (this.currentSlide - 1 + this.slideshowData.length) % this.slideshowData.length;
        this.showSlide(this.currentSlide);
    }

    goToSlide(index) {
        if (this.slideshowData.length <= 1) return;
        
        this.currentSlide = index;
        this.showSlide(this.currentSlide);
    }

    showSlide(index) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.slide-dot');
        
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        if (slides[index] && dots[index]) {
            slides[index].classList.add('active');
            dots[index].classList.add('active');
        }
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.slide-prev')) {
                this.prevSlide();
            }

            if (e.target.closest('.slide-next')) {
                this.nextSlide();
            }

            if (e.target.closest('.slide-dot')) {
                const index = parseInt(e.target.closest('.slide-dot').dataset.index);
                this.goToSlide(index);
            }

            const courseBtn = e.target.closest('.course-card .btn');
            if (courseBtn) {
                e.preventDefault();
                const courseId = courseBtn.dataset.courseId;
                this.openCourse(courseId);
            }
            
        });

        console.log('Revvo App inicializado com sucesso!');
        console.log('Slideshow carregado:', this.slideshowData.length, 'slide(s)');
        console.log('Cursos carregados:', this.courses.length, 'curso(s)');
    }

    async reloadCourses() {
        await this.loadCourses();
        this.renderCourses();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.revvoApp = new RevvoApp();
});