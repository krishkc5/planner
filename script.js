// Task Manager
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
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

        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    addTask() {
        const taskInput = document.getElementById('task-input');
        const dateInput = document.getElementById('task-date');
        const timeInput = document.getElementById('task-time');

        const task = {
            id: Date.now(),
            name: taskInput.value,
            date: dateInput.value,
            time: timeInput.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();

        taskInput.value = '';
        dateInput.value = '';
        timeInput.value = '';
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

    getFilteredTasks() {
        const today = new Date().toISOString().split('T')[0];

        switch (this.currentFilter) {
            case 'today':
                return this.tasks.filter(task => task.date === today && !task.completed);
            case 'upcoming':
                return this.tasks.filter(task => task.date > today && !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const taskList = document.getElementById('task-list');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<div class="empty-state">No tasks to display</div>';
            return;
        }

        taskList.innerHTML = filteredTasks
            .sort((a, b) => {
                if (a.date && b.date) {
                    return new Date(a.date + ' ' + (a.time || '00:00')) -
                           new Date(b.date + ' ' + (b.time || '00:00'));
                }
                return 0;
            })
            .map(task => this.createTaskElement(task))
            .join('');

        this.attachTaskEventListeners();
    }

    createTaskElement(task) {
        const dateTime = this.formatDateTime(task.date, task.time);

        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-content">
                    <div class="task-name">${task.name}</div>
                    ${dateTime ? `<div class="task-datetime">${dateTime}</div>` : ''}
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
    new TaskManager();
});
