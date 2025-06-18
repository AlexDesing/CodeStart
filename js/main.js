// Utilidad para cargar datos de módulos desde JSON externo
async function fetchModuleData(moduleNumber) {
    const response = await fetch(`contenido/modulo${moduleNumber}.json`);
    if (!response.ok) throw new Error('No se pudo cargar el módulo');
    return await response.json();
}

// --- INICIO APP ---
document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const mainContent = document.getElementById('main-content');
    const lessonPage = document.getElementById('lesson-page');
    const backToCourseButton = document.getElementById('back-to-course');
    const lessonContentArea = document.getElementById('lesson-content-area');
    const moduleModal = document.getElementById('module-modal');
    const moduleModalContent = document.getElementById('modal-content-module');
    const modalTitle = document.getElementById('modal-title');
    const modalIntro = document.getElementById('modal-intro');
    const modalTopics = document.getElementById('modal-topics');
    const closeModalModuleButton = document.getElementById('close-modal-module');
    const goToLessonButton = document.getElementById('go-to-lesson');
    const moduleCards = document.querySelectorAll('.module-card');
    const exerciseModal = document.getElementById('exercise-modal');
    const exerciseModalContentEl = document.getElementById('modal-content-exercise');
    const exerciseModalTitle = document.getElementById('exercise-modal-title');
    const exerciseModalContent = document.getElementById('exercise-modal-content');
    const closeModalExerciseButton = document.getElementById('close-modal-exercise');
    const solutionButtons = document.querySelectorAll('.solution-button');
    const runCodeButton = document.getElementById('run-code-button');
    const codeEditor = document.getElementById('code-editor');
    const languageSelector = document.getElementById('language-selector');
    const browserModal = document.getElementById('browser-modal');
    const browserModalContent = document.getElementById('modal-content-browser');
    const closeBrowserModalButton = document.getElementById('close-browser-modal');
    const browserIframe = document.getElementById('browser-iframe');
    const consoleModal = document.getElementById('console-modal');
    const consoleModalContent = document.getElementById('modal-content-console');
    const closeConsoleModalButton = document.getElementById('close-console-modal');
    const consoleOutput = document.getElementById('console-output');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const header = document.getElementById('header');
    const feedbackForm = document.getElementById('feedback-form');

    // --- GENERIC MODAL FUNCTIONS ---
    function openModal(modal, content) {
        modal.classList.remove('invisible', 'opacity-0');
        content.classList.remove('scale-95');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal, content) {
        modal.classList.add('opacity-0');
        content.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('invisible');
            const isAnyModalVisible = !moduleModal.classList.contains('invisible') || 
                                      !exerciseModal.classList.contains('invisible') || 
                                      !browserModal.classList.contains('invisible') || 
                                      !consoleModal.classList.contains('invisible');
            if (!isAnyModalVisible) {
               document.body.style.overflow = 'auto';
            }
        }, 300);
    }

    // --- SPECIFIC MODAL FUNCTIONS ---
    function openModuleModal(moduleNumber) {
        fetchModuleData(moduleNumber).then(data => {
            modalTitle.textContent = data.title;
            modalIntro.textContent = data.intro;
            modalTopics.innerHTML = data.topics.map(topic => 
                `<div class="flex items-start space-x-3"><svg class="h-6 w-6 text-cyan-400 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p class="text-slate-300">${topic}</p></div>`
            ).join('');
            goToLessonButton.dataset.module = moduleNumber;
            openModal(moduleModal, moduleModalContent);
        });
    }

    function closeModuleModal() {
        closeModal(moduleModal, moduleModalContent);
    }
    
    function openExerciseModal(exerciseNumber) {
        const data = exerciseData[exerciseNumber];
        if (!data) return;
        exerciseModalTitle.textContent = data.title;
        exerciseModalContent.innerHTML = data.solution;
        openModal(exerciseModal, exerciseModalContentEl);
    }
    
    function closeExerciseModal() {
        closeModal(exerciseModal, exerciseModalContentEl);
    }

    // --- LESSON PAGE FUNCTIONS ---
    function showLesson(moduleNumber) {
        fetchModuleData(moduleNumber).then(data => {
            if (!data || !data.lesson) return;
            const lesson = data.lesson;
            let objectivesHtml = lesson.objectives.map(obj => 
                `<li class="flex items-start gap-3"><svg class="h-5 w-5 text-purple-400 flex-shrink-0 mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg><span>${obj}</span></li>`
            ).join('');
            lessonContentArea.innerHTML = `
                <h2 class="text-3xl md:text-4xl font-bold text-white">${lesson.title}</h2>
                <div class="glass-effect p-6 rounded-lg">
                    <h3 class="text-xl font-bold text-purple-400 mb-3">🎯 ¿Qué aprenderás en esta lección?</h3>
                    <ul class="space-y-2 text-slate-300">${objectivesHtml}</ul>
                </div>
                <hr class="border-slate-700 my-8"/>
                ${lesson.content}
            `;
            closeModuleModal();
            mainContent.classList.add('hidden');
            lessonPage.classList.remove('hidden');
            window.scrollTo(0, 0);
        });
    }

    function hideLesson() {
        lessonPage.classList.add('hidden');
        mainContent.classList.remove('hidden');
        const cursoSection = document.getElementById('curso');
        if (cursoSection) {
            cursoSection.scrollIntoView();
        }
    }
    
    // --- PLAYGROUND EXECUTION LOGIC ---
    function runCode() {
        const lang = languageSelector.value;
        const code = codeEditor.value;

        switch (lang) {
            case 'html':
                browserIframe.srcdoc = code;
                openModal(browserModal, browserModalContent);
                break;
            case 'javascript':
                const jsLogs = [];
                const customConsole = { log: (...args) => { jsLogs.push({ msg: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ') }); }};
                try {
                    new Function('console', code)(customConsole);
                } catch (e) {
                    jsLogs.push({ msg: e.message, isError: true });
                }
                consoleOutput.innerHTML = jsLogs.map(line => `<div class="${line.isError ? 'log-line error' : 'log-line'}">${line.msg}</div>`).join('');
                openModal(consoleModal, consoleModalContent);
                break;
            case 'python':
                const pyLogs = [];
                const lines = code.split('\n');
                const printRegex = /print\s*\(\s*(['"])(.*?)\1\s*\)/;
                lines.forEach(line => {
                    const match = line.match(printRegex);
                    if (match && match[2] !== undefined) { pyLogs.push({ msg: match[2] }); }
                });
                if (pyLogs.length === 0) { pyLogs.push({ msg: "No se encontraron sentencias print() para mostrar. Esta es una simulación.", isError: true}); }
                consoleOutput.innerHTML = pyLogs.map(line => `<div class="${line.isError ? 'log-line error' : 'log-line'}">${line.msg}</div>`).join('');
                openModal(consoleModal, consoleModalContent);
                break;
        }
    }

    // --- EVENT LISTENERS ---
    if(runCodeButton) runCodeButton.addEventListener('click', runCode);
    if(closeBrowserModalButton) closeBrowserModalButton.addEventListener('click', () => closeModal(browserModal, browserModalContent));
    if(browserModal) browserModal.addEventListener('click', (e) => e.target === browserModal && closeModal(browserModal, browserModalContent));
    if(closeConsoleModalButton) closeConsoleModalButton.addEventListener('click', () => closeModal(consoleModal, consoleModalContent));
    if(consoleModal) consoleModal.addEventListener('click', (e) => e.target === consoleModal && closeModal(consoleModal, consoleModalContent));

    moduleCards.forEach(card => card.addEventListener('click', () => openModuleModal(card.dataset.module)));
    if(goToLessonButton) goToLessonButton.addEventListener('click', (e) => showLesson(e.currentTarget.dataset.module));
    if(backToCourseButton) backToCourseButton.addEventListener('click', hideLesson);
    if(closeModalModuleButton) closeModalModuleButton.addEventListener('click', closeModuleModal);
    if(moduleModal) moduleModal.addEventListener('click', (e) => e.target === moduleModal && closeModuleModal());
    
    solutionButtons.forEach(button => button.addEventListener('click', () => openExerciseModal(button.dataset.exercise)));
    if(closeModalExerciseButton) closeModalExerciseButton.addEventListener('click', closeExerciseModal);
    if(exerciseModal) exerciseModal.addEventListener('click', (e) => e.target === exerciseModal && closeExerciseModal());

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            if (!moduleModal.classList.contains('invisible')) closeModuleModal();
            if (!exerciseModal.classList.contains('invisible')) closeExerciseModal();
            if (!browserModal.classList.contains('invisible')) closeModal(browserModal, browserModalContent);
            if (!consoleModal.classList.contains('invisible')) closeModal(consoleModal, consoleModalContent);
        }
    });
    
    if(mobileMenuButton) mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    document.querySelectorAll('#mobile-menu a').forEach(link => link.addEventListener('click', () => mobileMenu.classList.add('hidden')));

    window.addEventListener('scroll', () => {
        if(header) {
            header.classList.toggle('py-2', window.scrollY > 50);
            header.classList.toggle('py-4', window.scrollY <= 50);
        }
    });

    if(languageSelector) {
        const placeholders = {
            html: `<!-- Escribe tu HTML y CSS aquí -->\n<style>\n  h1 { color: #2dd4bf; }\n</style>\n<h1>¡Hola CodeStart!</h1>`,
            javascript: `// Escribe tu JavaScript aquí\nconsole.log('¡Bienvenido a la consola!');\nconsole.log(2 + 2);`,
            python: `# Escribe tu Python aquí\nprint("¡Hola desde la simulación de Python!")`
        };
        function updateEditorPlaceholder() {
            if(codeEditor) {
                const selectedLanguage = languageSelector.value;
                codeEditor.value = placeholders[selectedLanguage];
            }
        }
        languageSelector.addEventListener('change', updateEditorPlaceholder);
        updateEditorPlaceholder();
    }

    if(feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            feedbackForm.innerHTML = `<div class="text-center p-8"><h3 class="text-2xl font-bold text-cyan-400">¡Gracias!</h3><p class="text-slate-300 mt-2">Hemos recibido tu mensaje. Tus ideas nos ayudan a crecer.</p></div>`;
        });
    }
});

// --- DATA DE EJERCICIOS ---
const exerciseData = {
    1: {
        title: "Solución: Tu Primera Página Web",
        solution: `<div class="solution-code-block"><pre class="font-mono text-sm text-cyan-300"><code>&lt;!DOCTYPE html&gt;\n&lt;html&gt;\n  &lt;head&gt;\n    &lt;title&gt;Mi Hobby&lt;/title&gt;\n  &lt;/head&gt;\n  &lt;body&gt;\n    &lt;h1&gt;Juan Pérez&lt;/h1&gt;\n    &lt;p&gt;Uno de mis hobbies favoritos es leer novelas de ciencia ficción.&lt;/p&gt;\n  &lt;/body&gt;\n&lt;/html&gt;</code></pre></div>`
    },
    2: {
        title: "Solución: Estiliza tu Botón",
        solution: `<p class="text-slate-300 mb-4">Primero, el HTML para el botón:</p><div class="solution-code-block"><pre class="font-mono text-sm text-cyan-300"><code>&lt;button class=\"mi-boton\"&gt;Púlsame&lt;/button&gt;</code></pre></div><p class="text-slate-300 mb-4">Ahora, el CSS:</p><div class="solution-code-block"><pre class="font-mono text-sm text-cyan-300"><code>.mi-boton {\n  background-color: #8B5CF6; /* Púrpura */\n  color: white;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 8px; /* Esquinas redondeadas */\n  cursor: pointer;\n  transition: background-color 0.3s;\n}\n\n.mi-boton:hover {\n  background-color: #7C3AED;\n}</code></pre></div>`
    },
    3: {
        title: "Solución: Saludo Interactivo",
        solution: `<p class="text-slate-300 mb-4">El HTML para el botón:</p><div class="solution-code-block"><pre class="font-mono text-sm text-cyan-300"><code>&lt;button id=\"saludoBtn\"&gt;Di Hola&lt;/button&gt;</code></pre></div><p class="text-slate-300 mb-4">Y el JavaScript:</p><div class="solution-code-block"><pre class="font-mono text-sm text-cyan-300"><code>const boton = document.getElementById('saludoBtn');\n\nboton.addEventListener('click', () => {\n  console.log('¡Hola, Programador!');\n});</code></pre></div><p class="text-slate-300 mt-4">Para ver el resultado, abre la consola de desarrollador de tu navegador (usualmente con F12 o Click Derecho > Inspeccionar).</p>`
    }
};
