// Task Manager with Categories
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.categoryColors = {
            courses: '#667eea',
            work: '#f093fb',
            career: '#4facfe',
            research: '#43e97b',
            fun: '#fa709a'
        };
        this.init();
    }

    init() {
        this.renderTasks();
        this.attachEventListeners();
    }

    attachEventListeners() {
        const form = document.getElementById('task-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Category selector - show subcategory for courses
        const categorySelect = document.getElementById('task-category');
        categorySelect.addEventListener('change', (e) => {
            const subcategoryRow = document.getElementById('subcategory-row');
            if (e.target.value === 'courses') {
                subcategoryRow.style.display = 'flex';
            } else {
                subcategoryRow.style.display = 'none';
            }
        });

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Category buttons
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setCategory(e.target.dataset.category);
                categoryButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    addTask() {
        const taskInput = document.getElementById('task-input');
        const dateInput = document.getElementById('task-date');
        const timeInput = document.getElementById('task-time');
        const categoryInput = document.getElementById('task-category');
        const subcategoryInput = document.getElementById('task-subcategory');
        const notesInput = document.getElementById('task-notes');

        const task = {
            id: Date.now(),
            name: taskInput.value,
            date: dateInput.value,
            time: timeInput.value,
            category: categoryInput.value,
            subcategory: categoryInput.value === 'courses' ? subcategoryInput.value : null,
            notes: notesInput.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();

        // Reset form
        taskInput.value = '';
        dateInput.value = '';
        timeInput.value = '';
        categoryInput.value = '';
        subcategoryInput.value = '';
        notesInput.value = '';
        document.getElementById('subcategory-row').style.display = 'none';
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderTasks();
    }

    toggleComplete(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.renderTasks();
    }

    setCategory(category) {
        this.currentCategory = category;
        this.renderTasks();
    }

    getFilteredTasks() {
        const today = new Date().toISOString().split('T')[0];
        let filtered = this.tasks;

        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(task => task.category === this.currentCategory);
        }

        // Filter by time/completion
        switch (this.currentFilter) {
            case 'today':
                filtered = filtered.filter(task => task.date === today && !task.completed);
                break;
            case 'upcoming':
                filtered = filtered.filter(task => task.date > today && !task.completed);
                break;
            case 'completed':
                filtered = filtered.filter(task => task.completed);
                break;
        }

        return filtered;
    }

    renderTasks() {
        const container = document.getElementById('task-categories-container');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            container.innerHTML = '<div class="empty-state">No tasks to display</div>';
            return;
        }

        // Group tasks by category
        const grouped = {};
        filteredTasks.forEach(task => {
            if (!grouped[task.category]) {
                grouped[task.category] = {};
            }

            if (task.category === 'courses' && task.subcategory) {
                if (!grouped[task.category][task.subcategory]) {
                    grouped[task.category][task.subcategory] = [];
                }
                grouped[task.category][task.subcategory].push(task);
            } else {
                if (!grouped[task.category]['_main']) {
                    grouped[task.category]['_main'] = [];
                }
                grouped[task.category]['_main'].push(task);
            }
        });

        // Render grouped tasks
        let html = '';
        const categories = ['courses', 'work', 'career', 'research', 'fun'];

        categories.forEach(category => {
            if (!grouped[category]) return;

            const categoryTasks = Object.values(grouped[category]).flat();
            const color = this.categoryColors[category];

            html += `
                <div class="category-section">
                    <div class="category-header" style="background: ${color}">
                        <div class="category-title">
                            ${this.getCategoryIcon(category)} ${this.capitalize(category)}
                        </div>
                        <div class="category-count">${categoryTasks.length}</div>
                    </div>
            `;

            if (category === 'courses') {
                // Render subcategories for courses
                Object.keys(grouped[category]).sort().forEach(subcategory => {
                    if (subcategory === '_main') {
                        html += this.renderTaskList(grouped[category][subcategory]);
                    } else {
                        html += `
                            <div class="subcategory-group">
                                <div class="subcategory-header">${subcategory}</div>
                                ${this.renderTaskList(grouped[category][subcategory])}
                            </div>
                        `;
                    }
                });
            } else {
                html += this.renderTaskList(grouped[category]['_main']);
            }

            html += '</div>';
        });

        container.innerHTML = html;
        this.attachTaskEventListeners();
    }

    renderTaskList(tasks) {
        if (!tasks || tasks.length === 0) return '';

        const sortedTasks = tasks.sort((a, b) => {
            if (a.date && b.date) {
                return new Date(a.date + ' ' + (a.time || '00:00')) -
                       new Date(b.date + ' ' + (b.time || '00:00'));
            }
            return 0;
        });

        return `
            <ul class="task-list">
                ${sortedTasks.map(task => this.createTaskElement(task)).join('')}
            </ul>
        `;
    }

    createTaskElement(task) {
        const dateTime = this.formatDateTime(task.date, task.time);
        const color = this.categoryColors[task.category];

        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}" style="border-left-color: ${color}">
                <div class="task-content">
                    <div class="task-name">
                        ${task.name}
                    </div>
                    ${dateTime ? `<div class="task-datetime">${dateTime}</div>` : ''}
                    ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
                </div>
                <div class="task-actions">
                    <button class="complete-btn" data-action="complete">
                        ${task.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button class="delete-btn" data-action="delete">Delete</button>
                </div>
            </li>
        `;
    }

    formatDateTime(date, time) {
        if (!date) return '';

        const dateObj = new Date(date);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        let formatted = dateObj.toLocaleDateString('en-US', options);

        if (time) {
            formatted += ` at ${time}`;
        }

        return formatted;
    }

    getCategoryIcon(category) {
        const icons = {
            courses: '📚',
            work: '💼',
            career: '🎯',
            research: '🔬',
            fun: '🎉'
        };
        return icons[category] || '';
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    attachTaskEventListeners() {
        const taskItems = document.querySelectorAll('.task-item');

        taskItems.forEach(item => {
            const id = parseInt(item.dataset.id);

            const completeBtn = item.querySelector('[data-action="complete"]');
            const deleteBtn = item.querySelector('[data-action="delete"]');

            completeBtn.addEventListener('click', () => this.toggleComplete(id));
            deleteBtn.addEventListener('click', () => this.deleteTask(id));
        });
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});
