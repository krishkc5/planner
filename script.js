// Planner Manager - Tennis 8-bit Theme
class PlannerManager {
    constructor() {
        this.data = this.loadData();
        this.currentCourseId = null;
        this.currentWorkId = null;
        this.currentSimpleType = null;
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
        this.updateStats();
        this.renderCourses();
        this.renderWork();
        this.renderResearch();
        this.renderSocial();
        this.renderInternshipTasks();
        this.updateJobAppsDisplay();
        this.attachEventListeners();
    }

    loadData() {
        const saved = localStorage.getItem('plannerData');
        return saved ? JSON.parse(saved) : {
            courses: [],
            workRoles: [],
            courseTasks: [],
            workTasks: [],
            researchTasks: [],
            socialTasks: [],
            internshipTasks: [],
            jobAppsCount: 0,
            lastJobAppsReset: new Date().toDateString()
        };
    }

    saveData() {
        localStorage.setItem('plannerData', JSON.stringify(this.data));
    }

    updateDateTime() {
        const now = new Date();
        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', dateOptions);
        document.getElementById('current-time').textContent = timeString;
    }

    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        const allTasks = [
            ...this.data.courseTasks,
            ...this.data.workTasks,
            ...this.data.researchTasks,
            ...this.data.socialTasks,
            ...this.data.internshipTasks
        ];

        const tasksToday = allTasks.filter(t => t.dueDate === today && !t.completed).length;
        const tasksCompleted = allTasks.filter(t => t.completed).length;
        const tasksTotal = allTasks.length;

        document.getElementById('tasks-today').textContent = tasksToday;
        document.getElementById('tasks-completed').textContent = tasksCompleted;
        document.getElementById('tasks-total').textContent = tasksTotal;
    }

    attachEventListeners() {
        // Manage Courses
        document.getElementById('manage-courses-btn').addEventListener('click', () => {
            this.openCoursesModal();
        });

        document.getElementById('add-course-btn').addEventListener('click', () => {
            this.addCourse();
        });

        // Manage Work
        document.getElementById('manage-work-btn').addEventListener('click', () => {
            this.openWorkModal();
        });

        document.getElementById('add-work-btn').addEventListener('click', () => {
            this.addWorkRole();
        });

        // Add buttons for Research and Social
        document.getElementById('add-research-btn').addEventListener('click', () => {
            this.openSimpleModal('research');
        });

        document.getElementById('add-social-btn').addEventListener('click', () => {
            this.openSimpleModal('social');
        });

        document.getElementById('add-internship-task-btn').addEventListener('click', () => {
            this.openSimpleModal('internship');
        });

        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Save task buttons
        document.getElementById('save-task-courses').addEventListener('click', () => {
            this.saveTaskCourses();
        });

        document.getElementById('save-task-work').addEventListener('click', () => {
            this.saveTaskWork();
        });

        document.getElementById('save-task-simple').addEventListener('click', () => {
            this.saveTaskSimple();
        });

        // Priority selectors
        document.querySelectorAll('.tennis-balls .ball, .tennis-balls .ball-group').forEach(ball => {
            ball.addEventListener('click', (e) => {
                const target = e.target.closest('.ball, .ball-group');
                target.closest('.tennis-balls').querySelectorAll('.ball, .ball-group').forEach(b => {
                    b.classList.remove('selected');
                });
                target.classList.add('selected');
            });
        });

        // Job apps buttons
        document.getElementById('add-app-btn').addEventListener('click', () => {
            this.incrementJobApps();
        });

        document.getElementById('reset-apps-btn').addEventListener('click', () => {
            this.resetJobApps();
        });

        // Quick filters
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.quick-filter-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.applyFilter();
            });
        });

        // Enter key support for inputs
        document.getElementById('new-course-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCourse();
        });

        document.getElementById('new-work-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addWorkRole();
        });
    }

    // === COURSES ===
    openCoursesModal() {
        const modal = document.getElementById('courses-modal');
        modal.classList.add('active');
        this.renderCoursesList();
    }

    addCourse() {
        const input = document.getElementById('new-course-input');
        const name = input.value.trim();

        if (name) {
            this.data.courses.push({
                id: Date.now(),
                name: name,
                expanded: true
            });
            this.saveData();
            input.value = '';
            this.renderCoursesList();
            this.renderCourses();
        }
    }

    deleteCourse(id) {
        this.data.courses = this.data.courses.filter(c => c.id !== id);
        this.data.courseTasks = this.data.courseTasks.filter(t => t.courseId !== id);
        this.saveData();
        this.renderCoursesList();
        this.renderCourses();
        this.updateStats();
    }

    renderCoursesList() {
        const container = document.getElementById('course-list-manage');

        if (this.data.courses.length === 0) {
            container.innerHTML = '<div class="empty-state">no courses yet</div>';
            return;
        }

        container.innerHTML = this.data.courses.map(course => `
            <div class="manage-list-item">
                <span>${course.name}</span>
                <button onclick="planner.deleteCourse(${course.id})">delete</button>
            </div>
        `).join('');
    }

    renderCourses() {
        const container = document.getElementById('courses-container');

        if (this.data.courses.length === 0) {
            container.innerHTML = '<div class="empty-state">click manage to add courses</div>';
            return;
        }

        container.innerHTML = this.data.courses.map(course => {
            const courseTasks = this.data.courseTasks.filter(t => t.courseId === course.id);

            return `
                <div class="course-section">
                    <div class="course-header" onclick="planner.toggleCourseExpand(${course.id})">
                        <span class="course-name">${course.name}</span>
                        <span>${course.expanded ? '▼' : '▶'}</span>
                    </div>
                    <div class="course-tasks" style="display: ${course.expanded ? 'block' : 'none'}">
                        ${this.renderTaskList(courseTasks, 'course')}
                        <button class="add-task-btn" onclick="planner.openCourseTaskModal(${course.id})">+ add task</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    toggleCourseExpand(id) {
        const course = this.data.courses.find(c => c.id === id);
        if (course) {
            course.expanded = !course.expanded;
            this.saveData();
            this.renderCourses();
        }
    }

    openCourseTaskModal(courseId) {
        this.currentCourseId = courseId;
        const modal = document.getElementById('task-modal-courses');
        modal.classList.add('active');

        // Reset form
        document.getElementById('task-name-courses').value = '';
        document.getElementById('task-date-courses').value = '';
        document.getElementById('task-type-courses').value = '';
        document.getElementById('task-notes-courses').value = '';
        document.querySelectorAll('#task-modal-courses .ball').forEach(b => b.classList.remove('selected'));
        document.querySelector('#task-modal-courses .ball[data-priority="1"]').classList.add('selected');
    }

    saveTaskCourses() {
        const name = document.getElementById('task-name-courses').value.trim();
        const dueDate = document.getElementById('task-date-courses').value;
        const type = document.getElementById('task-type-courses').value;
        const notes = document.getElementById('task-notes-courses').value.trim();
        const priority = document.querySelector('#task-modal-courses .ball.selected')?.dataset.priority || '1';

        if (!name) {
            alert('Please enter a task name');
            return;
        }

        this.data.courseTasks.push({
            id: Date.now(),
            courseId: this.currentCourseId,
            name: name,
            dueDate: dueDate,
            type: type,
            notes: notes,
            priority: parseInt(priority),
            completed: false
        });

        this.saveData();
        this.renderCourses();
        this.updateStats();
        document.getElementById('task-modal-courses').classList.remove('active');
    }

    // === WORK ===
    openWorkModal() {
        const modal = document.getElementById('work-modal');
        modal.classList.add('active');
        this.renderWorkList();
    }

    addWorkRole() {
        const input = document.getElementById('new-work-input');
        const name = input.value.trim();

        if (name) {
            this.data.workRoles.push({
                id: Date.now(),
                name: name,
                expanded: true
            });
            this.saveData();
            input.value = '';
            this.renderWorkList();
            this.renderWork();
        }
    }

    deleteWorkRole(id) {
        this.data.workRoles = this.data.workRoles.filter(w => w.id !== id);
        this.data.workTasks = this.data.workTasks.filter(t => t.workId !== id);
        this.saveData();
        this.renderWorkList();
        this.renderWork();
        this.updateStats();
    }

    renderWorkList() {
        const container = document.getElementById('work-list-manage');

        if (this.data.workRoles.length === 0) {
            container.innerHTML = '<div class="empty-state">no work roles yet</div>';
            return;
        }

        container.innerHTML = this.data.workRoles.map(work => `
            <div class="manage-list-item">
                <span>${work.name}</span>
                <button onclick="planner.deleteWorkRole(${work.id})">delete</button>
            </div>
        `).join('');
    }

    renderWork() {
        const container = document.getElementById('work-container');

        if (this.data.workRoles.length === 0) {
            container.innerHTML = '<div class="empty-state">click manage to add work roles</div>';
            return;
        }

        container.innerHTML = this.data.workRoles.map(work => {
            const workTasks = this.data.workTasks.filter(t => t.workId === work.id);

            return `
                <div class="work-section">
                    <div class="work-header" onclick="planner.toggleWorkExpand(${work.id})">
                        <span class="work-name">${work.name}</span>
                        <span>${work.expanded ? '▼' : '▶'}</span>
                    </div>
                    <div class="work-tasks" style="display: ${work.expanded ? 'block' : 'none'}">
                        ${this.renderTaskList(workTasks, 'work')}
                        <button class="add-task-btn" onclick="planner.openWorkTaskModal(${work.id})">+ add task</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    toggleWorkExpand(id) {
        const work = this.data.workRoles.find(w => w.id === id);
        if (work) {
            work.expanded = !work.expanded;
            this.saveData();
            this.renderWork();
        }
    }

    openWorkTaskModal(workId) {
        this.currentWorkId = workId;
        const modal = document.getElementById('task-modal-work');
        modal.classList.add('active');

        // Reset form
        document.getElementById('task-name-work').value = '';
        document.getElementById('task-date-work').value = '';
        document.getElementById('task-type-work').value = '';
        document.getElementById('task-notes-work').value = '';
        document.querySelectorAll('#task-modal-work .ball').forEach(b => b.classList.remove('selected'));
        document.querySelector('#task-modal-work .ball[data-priority="1"]').classList.add('selected');
    }

    saveTaskWork() {
        const name = document.getElementById('task-name-work').value.trim();
        const dueDate = document.getElementById('task-date-work').value;
        const type = document.getElementById('task-type-work').value;
        const notes = document.getElementById('task-notes-work').value.trim();
        const priority = document.querySelector('#task-modal-work .ball.selected')?.dataset.priority || '1';

        if (!name) {
            alert('Please enter a task name');
            return;
        }

        this.data.workTasks.push({
            id: Date.now(),
            workId: this.currentWorkId,
            name: name,
            dueDate: dueDate,
            type: type,
            notes: notes,
            priority: parseInt(priority),
            completed: false
        });

        this.saveData();
        this.renderWork();
        this.updateStats();
        document.getElementById('task-modal-work').classList.remove('active');
    }

    // === RESEARCH & SOCIAL ===
    openSimpleModal(type) {
        this.currentSimpleType = type;
        const modal = document.getElementById('task-modal-simple');
        document.getElementById('simple-modal-title').textContent = `add ${type} task`;
        modal.classList.add('active');

        // Reset form
        document.getElementById('task-name-simple').value = '';
        document.getElementById('task-date-simple').value = '';
        document.getElementById('task-notes-simple').value = '';
    }

    saveTaskSimple() {
        const name = document.getElementById('task-name-simple').value.trim();
        const dueDate = document.getElementById('task-date-simple').value;
        const notes = document.getElementById('task-notes-simple').value.trim();

        if (!name) {
            alert('Please enter a task name');
            return;
        }

        const task = {
            id: Date.now(),
            name: name,
            dueDate: dueDate,
            notes: notes,
            completed: false
        };

        if (this.currentSimpleType === 'research') {
            this.data.researchTasks.push(task);
            this.renderResearch();
        } else if (this.currentSimpleType === 'social') {
            this.data.socialTasks.push(task);
            this.renderSocial();
        } else if (this.currentSimpleType === 'internship') {
            this.data.internshipTasks.push(task);
            this.renderInternshipTasks();
        }

        this.saveData();
        this.updateStats();
        document.getElementById('task-modal-simple').classList.remove('active');
    }

    renderResearch() {
        const container = document.getElementById('research-container');

        if (this.data.researchTasks.length === 0) {
            container.innerHTML = '<div class="empty-state">click + to add research tasks</div>';
            return;
        }

        container.innerHTML = this.renderTaskList(this.data.researchTasks, 'research');
    }

    renderSocial() {
        const container = document.getElementById('social-container');

        if (this.data.socialTasks.length === 0) {
            container.innerHTML = '<div class="empty-state">click + to add social tasks</div>';
            return;
        }

        container.innerHTML = this.renderTaskList(this.data.socialTasks, 'social');
    }

    renderInternshipTasks() {
        const container = document.getElementById('internship-tasks-container');

        if (this.data.internshipTasks.length === 0) {
            container.innerHTML = '<div class="empty-state">add job app tasks</div>';
            return;
        }

        container.innerHTML = this.renderTaskList(this.data.internshipTasks, 'internship');
    }

    // === TASK RENDERING ===
    renderTaskList(tasks, type) {
        if (!tasks || tasks.length === 0) {
            return '<div class="empty-state">no tasks yet</div>';
        }

        // Sort by date, then priority
        const sorted = tasks.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (a.dueDate && b.dueDate) {
                const dateCompare = new Date(a.dueDate) - new Date(b.dueDate);
                if (dateCompare !== 0) return dateCompare;
            }
            if (a.priority && b.priority) return b.priority - a.priority;
            return 0;
        });

        return sorted.map(task => {
            const priorityBallsHTML = task.priority ? '<div class="ball-8bit"></div>'.repeat(task.priority) : '';
            const dateStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
            const typeStr = task.type ? ` • ${task.type}` : '';

            return `
                <div class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority || 1}">
                    <div class="task-content-left">
                        <div class="task-text">${task.name}</div>
                        <div class="task-meta">
                            ${dateStr}${typeStr}
                            ${task.notes ? '<br>' + task.notes : ''}
                        </div>
                        ${priorityBallsHTML ? `<div class="priority-display">${priorityBallsHTML}</div>` : ''}
                    </div>
                    <div class="task-actions-compact">
                        <button class="task-btn complete-btn" onclick="planner.toggleTask('${type}', ${task.id})">
                            ${task.completed ? '↺' : '✓'}
                        </button>
                        <button class="task-btn delete-btn" onclick="planner.deleteTask('${type}', ${task.id})">✕</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    toggleTask(type, id) {
        let tasks;
        switch(type) {
            case 'course': tasks = this.data.courseTasks; break;
            case 'work': tasks = this.data.workTasks; break;
            case 'research': tasks = this.data.researchTasks; break;
            case 'social': tasks = this.data.socialTasks; break;
            case 'internship': tasks = this.data.internshipTasks; break;
        }

        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveData();
            this.renderAll();
            this.updateStats();
        }
    }

    deleteTask(type, id) {
        switch(type) {
            case 'course':
                this.data.courseTasks = this.data.courseTasks.filter(t => t.id !== id);
                break;
            case 'work':
                this.data.workTasks = this.data.workTasks.filter(t => t.id !== id);
                break;
            case 'research':
                this.data.researchTasks = this.data.researchTasks.filter(t => t.id !== id);
                break;
            case 'social':
                this.data.socialTasks = this.data.socialTasks.filter(t => t.id !== id);
                break;
            case 'internship':
                this.data.internshipTasks = this.data.internshipTasks.filter(t => t.id !== id);
                break;
        }

        this.saveData();
        this.renderAll();
        this.updateStats();
    }

    renderAll() {
        this.renderCourses();
        this.renderWork();
        this.renderResearch();
        this.renderSocial();
        this.renderInternshipTasks();
    }

    // === JOB APPS TRACKER ===
    incrementJobApps() {
        this.checkJobAppsReset();

        if (this.data.jobAppsCount < 10) {
            this.data.jobAppsCount++;
            this.saveData();
            this.updateJobAppsDisplay();
        }
    }

    resetJobApps() {
        this.data.jobAppsCount = 0;
        this.data.lastJobAppsReset = new Date().toDateString();
        this.saveData();
        this.updateJobAppsDisplay();
    }

    checkJobAppsReset() {
        const today = new Date().toDateString();
        if (this.data.lastJobAppsReset !== today) {
            this.data.jobAppsCount = 0;
            this.data.lastJobAppsReset = today;
            this.saveData();
        }
    }

    updateJobAppsDisplay() {
        this.checkJobAppsReset();
        const count = this.data.jobAppsCount;
        const percentage = (count / 10) * 100;

        document.getElementById('apps-count').textContent = count;
        document.getElementById('dollar-fill').style.height = percentage + '%';
    }

    // === FILTERS ===
    applyFilter() {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const allTaskElements = document.querySelectorAll('.task-item');

        allTaskElements.forEach(taskEl => {
            const taskText = taskEl.querySelector('.task-text').textContent;
            const metaText = taskEl.querySelector('.task-meta').textContent;

            // Extract date from task (this is a simplified approach)
            const dateMatch = metaText.match(/\w{3} \d+/);
            let taskDate = null;

            if (dateMatch) {
                const taskDateObj = new Date(dateMatch[0] + ', ' + new Date().getFullYear());
                taskDate = taskDateObj.toISOString().split('T')[0];
            }

            let show = true;

            switch(this.currentFilter) {
                case 'today':
                    show = taskDate === today;
                    break;
                case 'upcoming':
                    show = taskDate && taskDate > today;
                    break;
                case 'all':
                default:
                    show = true;
            }

            taskEl.style.display = show ? 'flex' : 'none';
        });
    }
}

// Initialize
let planner;
document.addEventListener('DOMContentLoaded', () => {
    planner = new PlannerManager();
});
