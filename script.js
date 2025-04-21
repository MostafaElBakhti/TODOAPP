// DOM Elements
const myInput = document.getElementById("myInput");
const button = document.getElementById("button");
const add = document.getElementById("add");
const prioritySelect = document.getElementById("priority-select");
const totalTasksEl = document.getElementById("total-tasks");
const completedTasksEl = document.getElementById("completed-tasks");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clear-completed");
const clearAllBtn = document.getElementById("clear-all");

// App State
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

// Priority weights for sorting
const priorityWeight = {
    "high": 3,
    "medium": 2,
    "low": 1
};

// Initialize the app
function init() {
    renderTasks();
    updateStats();
    
    // Add event listeners
    button.addEventListener("click", addTask);
    myInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") addTask();
    });
    
    clearCompletedBtn.addEventListener("click", clearCompleted);
    clearAllBtn.addEventListener("click", clearAll);
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            filterButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            currentFilter = this.dataset.filter;
            renderTasks();
        });
    });
}

// Check if input is valid
function checkInput() {
    if (myInput.value.trim() === "") {
        myInput.focus();
        myInput.style.border = "1px solid red";
        return false;
    } else {
        myInput.style.border = "1px solid var(--border-color)";
        return true;
    }
}

// Add a new task
function addTask() {
    if (!checkInput()) return;
    
    const newTask = {
        id: Date.now(),
        text: myInput.value.trim(),
        completed: false,
        priority: prioritySelect.value,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(newTask); // Add to beginning of array
    sortTasks(); // Sort tasks by priority
    saveTasks();
    renderTasks();
    
    myInput.value = "";
    myInput.focus();
}

// Sort tasks by priority (high → medium → low)
function sortTasks() {
    tasks.sort((a, b) => {
        // First sort by completion status (active tasks first)
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        
        // Then sort by priority
        if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
            return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        
        // Finally sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateStats();
}

// Update task statistics
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    
    totalTasksEl.textContent = `${totalTasks} tasks`;
    completedTasksEl.textContent = `${completedTasks} completed`;
}

// Render tasks based on current filter
function renderTasks() {
    add.innerHTML = "";
    
    let filteredTasks = tasks;
    
    if (currentFilter === "active") {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === "completed") {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent = currentFilter === "all" 
            ? "No tasks yet. Add a task to get started!" 
            : `No ${currentFilter} tasks found.`;
        emptyMessage.style.textAlign = "center";
        emptyMessage.style.padding = "20px";
        emptyMessage.style.color = "#888";
        add.appendChild(emptyMessage);
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        add.appendChild(taskElement);
    });
}

// Create a task element
function createTaskElement(task) {
    // Create main div
    const myDiv = document.createElement("div");
    myDiv.classList.add("myDiv", `priority-${task.priority}`);
    myDiv.dataset.id = task.id;
    
    if (task.completed) {
        myDiv.classList.add("completed");
    }
    
    // Create task content container
    const taskContent = document.createElement("div");
    taskContent.classList.add("task-content");
    
    // Create task text
    const taskText = document.createElement("div");
    taskText.classList.add("task-text");
    taskText.textContent = task.text;
    taskContent.appendChild(taskText);
    
    // Create task metadata
    const taskMeta = document.createElement("div");
    taskMeta.classList.add("task-meta");
    
    // Priority badge
    const priorityBadge = document.createElement("span");
    priorityBadge.classList.add("priority-badge", task.priority);
    priorityBadge.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    taskMeta.appendChild(priorityBadge);
    
    // Created date
    const createdDate = document.createElement("span");
    createdDate.textContent = `Created: ${formatDate(task.createdAt)}`;
    taskMeta.appendChild(createdDate);
    
    taskContent.appendChild(taskMeta);
    myDiv.appendChild(taskContent);
    
    // Create buttons container
    const right = document.createElement("div");
    right.classList.add("right");
    
    // Edit button
    const editBtn = document.createElement("button");
    editBtn.classList.add("task-btn", "edit-btn");
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.title = "Edit task";
    editBtn.addEventListener("click", () => editTask(task.id));
    right.appendChild(editBtn);
    
    // Done button
    const doneBtn = document.createElement("button");
    doneBtn.classList.add("task-btn", "done-btn");
    doneBtn.innerHTML = task.completed ? 
        '<i class="fas fa-undo"></i>' : 
        '<i class="fas fa-check"></i>';
    doneBtn.title = task.completed ? "Mark as undone" : "Mark as done";
    doneBtn.addEventListener("click", () => toggleTaskStatus(task.id));
    right.appendChild(doneBtn);
    
    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.classList.add("task-btn", "remove-btn");
    removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
    removeBtn.title = "Remove task";
    removeBtn.addEventListener("click", () => removeTask(task.id));
    right.appendChild(removeBtn);
    
    myDiv.appendChild(right);
    
    return myDiv;
}

// Toggle task completion status
function toggleTaskStatus(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    sortTasks(); // Re-sort after status change
    saveTasks();
    renderTasks();
}

// Edit a task - without confirmation dialog
function editTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;
    
    // Create an input field for editing
    const taskElement = document.querySelector(`.myDiv[data-id="${id}"]`);
    const taskTextElement = taskElement.querySelector('.task-text');
    const currentText = taskTextElement.textContent;
    
    // Replace text with input field
    taskTextElement.innerHTML = '';
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = currentText;
    inputField.style.width = '100%';
    inputField.style.padding = '5px';
    inputField.style.border = '1px solid var(--primary-color)';
    inputField.style.borderRadius = '4px';
    inputField.style.fontSize = '16px';
    
    taskTextElement.appendChild(inputField);
    inputField.focus();
    
    // Handle saving on enter or blur
    const saveEdit = () => {
        const newText = inputField.value.trim();
        if (newText !== '') {
            tasks = tasks.map(t => {
                if (t.id === id) {
                    return { ...t, text: newText };
                }
                return t;
            });
            saveTasks();
            renderTasks();
        } else {
            // If empty, just revert to original
            taskTextElement.textContent = currentText;
        }
    };
    
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });
    
    inputField.addEventListener('blur', saveEdit);
}

// Remove a task - without confirmation
function removeTask(id) {
    // Add a fade-out animation
    const taskElement = document.querySelector(`.myDiv[data-id="${id}"]`);
    taskElement.style.transition = 'opacity 0.3s, transform 0.3s';
    taskElement.style.opacity = '0';
    taskElement.style.transform = 'translateX(20px)';
    
    // Remove after animation completes
    setTimeout(() => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }, 300);
}

// Clear completed tasks
function clearCompleted() {
    const completedCount = tasks.filter(task => task.completed).length;
    
    if (completedCount > 0) {
        // Add fade-out animation to completed tasks
        document.querySelectorAll('.myDiv.completed').forEach(el => {
            el.style.transition = 'opacity 0.3s, transform 0.3s';
            el.style.opacity = '0';
            el.style.transform = 'translateX(20px)';
        });
        
        // Remove after animation completes
        setTimeout(() => {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
        }, 300);
    }
}

// Clear all tasks
function clearAll() {
    if (tasks.length > 0) {
        // Add fade-out animation to all tasks
        document.querySelectorAll('.myDiv').forEach(el => {
            el.style.transition = 'opacity 0.3s, transform 0.3s';
            el.style.opacity = '0';
            el.style.transform = 'translateY(10px)';
        });
        
        // Remove after animation completes
        setTimeout(() => {
            tasks = [];
            saveTasks();
            renderTasks();
        }, 300);
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Sort existing tasks when the app loads
function initializeTaskSorting() {
    if (tasks.length > 0) {
        sortTasks();
        saveTasks();
    }
}

// Initialize the app when the page loads
window.addEventListener("DOMContentLoaded", () => {
    initializeTaskSorting();
    init();
});