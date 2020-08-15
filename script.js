// Variables
const addTaskForm = document.querySelector('[data-add-task-form]')
const addTaskInput = document.querySelector('[data-add-task-input]')
const taskTemplate = document.getElementById('task-template')
const taskItemContainer = document.querySelector('[data-task-item-container]')
const deleteCompletedTasks = document.querySelector('[data-delete-completed-tasks]')

const LOCAL_STORAGE_LIST_KEY = 'task.list'

let tasks = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || []

// Event Listeners
addTaskForm.addEventListener('submit', e =>{
    e.preventDefault()
    const taskName = addTaskInput.value
    if (taskName == null || taskName === '') return
    const task = createTask(taskName)
    addTaskInput.value = null
    tasks.push(task)
    saveAndRender()
})

taskItemContainer.addEventListener('click', e => {
    if(e.target.tagName.toLowerCase() === 'i') {
        const selectedTaskContainer = e.target.closest('[data-task]')
        const selectedTaskId = selectedTaskContainer.querySelector('input').id
        tasks = tasks.filter(task => task.id !== selectedTaskId)
        saveAndRender()
    }
    if(e.target.tagName.toLowerCase() === 'input') {
        const selectedTask = tasks.find(task => task.id === e.target.id)
        selectedTask.completed = e.target.checked
        saveAndRender()
    }
})

deleteCompletedTasks.addEventListener('click', () => {
    tasks = tasks.filter(task => task.completed === false)
    saveAndRender()
})

// Functions
function createTask(taskName) {
    return {name: taskName, id: Date.now().toString(), completed: false}
}

function saveAndRender() {
    save()
    render()
}

function render(){
    taskItemContainer.innerHTML = '';
    tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true)
        const checkbox = taskElement.querySelector('input')
        checkbox.id = task.id
        checkbox.checked = task.completed 
        const label = taskElement.querySelector('label')    
        label.htmlFor = task.id
        label.innerText = task.name  
        taskItemContainer.appendChild(taskElement)
    });    
    addDragEventListners()
}

function save(){
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(tasks))
}

render()

// Draggalble thing
function addDragEventListners(){
   const draggableTasks = document.querySelectorAll('[data-drag]')
    let initialIndex = null;
    let afterIndex = null;
    draggableTasks.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging')
            initialIndex = Array.prototype.indexOf.call(taskItemContainer.children, draggable)
        })

        draggable.addEventListener('dragend', () => {
            afterIndex = Array.prototype.indexOf.call(taskItemContainer.children, draggable)
            updateArray(initialIndex, afterIndex)
            draggable.classList.remove('dragging')
        })
    })

    taskItemContainer.addEventListener('dragover', e => {
        e.preventDefault()
        const afterElement = getDragAfterElement(taskItemContainer, e.clientY)
        const draggable = document.querySelector('.dragging')
        if (afterElement == null) {
            taskItemContainer.appendChild(draggable)
        } else {
            taskItemContainer.insertBefore(draggable, afterElement)
        }
    })
} 

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('[data-drag]:not(.dragging)')]

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element
}


function updateArray(initialIndex, afterIndex){
    if(initialIndex === afterIndex) return

    const draggedTask = tasks[initialIndex];

    if(initialIndex < afterIndex)
        for(let i=initialIndex; i<afterIndex; i++)
            tasks[i] = tasks[i+1]

    if(initialIndex > afterIndex)
        for(let i=initialIndex; i>afterIndex; i--)
            tasks[i] = tasks[i-1]

    tasks[afterIndex] = draggedTask;
}