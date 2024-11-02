import { useState, useEffect } from 'react';
import Navbar from './Components/Navbar';
import { v4 as uuidv4 } from 'uuid';
import { CiEdit } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";
import { IoAddCircleSharp } from "react-icons/io5";
import { IoTimer } from "react-icons/io5";

function App() {
  const [todo, setTodo] = useState('');
  const [todos, setTodos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [time, setTime] = useState({}); // To store time for each task
  const [startTime, setStartTime] = useState({}); // To store the start time for each task


useEffect(() => {
  let todoString = localStorage.getItem("todos")

  if(todoString){
    let todos = JSON.parse(localStorage.getItem("todos"))
    setTodos(todos)
  }



}, [])


const saveToLs = (params) => {
  localStorage.setItem("todos", JSON.stringify(todos))
}

  const HandleChange = (e) => {
    setTodo(e.target.value);
  };

  const HandleAdd = () => {
    if (todo.trim() === '') return; // Prevent adding empty tasks
    const id = uuidv4();
    setTodos([...todos, { id, todo, isCompleted: false }]);
    setTodo('');
    saveToLs()
    // Initialize time and start time for the new task
    setTime((prev) => ({ ...prev, [id]: null })); // Initially set time to null
    setStartTime((prev) => ({ ...prev, [id]: null })); // Initially set start time to null
  };

  const HandleTime = (e) => {
    const id = e.target.name; // Get the ID of the task to set time
    const timeInput = prompt("How much time (in minutes) do you want to set for this task?");
    
    if (timeInput) {
      const minutes = parseInt(timeInput);
      if (!isNaN(minutes) && minutes > 0) {
        // Store time in milliseconds
        const totalTime = minutes * 60 * 1000; // Convert minutes to milliseconds
        setTime((prev) => ({ ...prev, [id]: totalTime }));
        setStartTime((prev) => ({ ...prev, [id]: Date.now() }));
      } else {
        alert("Please enter a valid time in minutes.");
      }
    }
  };

  const HandleCheckbox = (e) => {
    const id = e.target.name;
    const updatedTodos = todos.map(item => 
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    );
    setTodos(updatedTodos);
    saveToLs()
  };

  const HandleDel = (e) => {
    const id = e.target.name;
    const isConfirmed = window.confirm(`Are you sure you want to delete this Task?`);

    if (isConfirmed) {
      const newTodos = todos.filter(item => item.id !== id);
      setTodos(newTodos);
      saveToLs()
      // Also delete the corresponding time and start time entry
      const { [id]: _, ...newTime } = time;
      const { [id]: __, ...newStartTime } = startTime;
      setTime(newTime);
      setStartTime(newStartTime);
    }
  };

  const HandleEdit = (e) => {
    const id = e.target.name; // Get the ID of the task to edit
    const taskToEdit = todos.find(item => item.id === id);
    
    if (taskToEdit) {
      setTodo(taskToEdit.todo); // Set the current todo text to edit
      setIsEditing(true); // Set editing mode to true
      setEditingId(id); // Set the ID of the task being edited
    }
  };

  const HandleUpdate = () => {
    if (todo.trim() === '') return; // Prevent updating with empty tasks

    const updatedTodos = todos.map(item => {
      if (item.id === editingId) {
        return { ...item, todo }; // Update the specific task
      }
      return item; // Return the original item if it's not the one being edited
    });
saveToLs()
    setTodos(updatedTodos);
    setIsEditing(false); // Reset editing state
    setEditingId(null); // Reset editing ID
    setTodo(''); // Clear the input after editing
  };

  // Effect to check for expired tasks every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTodos((prevTodos) => {
        return prevTodos.map(item => {
          const remainingTime = time[item.id];
          const start = startTime[item.id];
          if (remainingTime && start) {
            const elapsed = Date.now() - start;
            const newRemainingTime = remainingTime - elapsed;

            if (newRemainingTime <= 0) {
              // Task time has expired
              return { ...item, remainingTime: 'time out' }; // Set remaining time to 'time out'
            }
          }
          return { ...item, remainingTime: remainingTime !== null ? Math.ceil((remainingTime - (Date.now() - start)) / 1000 / 60) + ' minutes left' : null }; // Show remaining time
        });
      });
    }, 1000); // Check every second

    return () => clearInterval(intervalId); // Clean up interval on unmount
  }, [todos, time, startTime]);

  return (
    <>
      <Navbar />

      <div className='container mx-auto my-5 rounded-xl p-5 bg-violet-300 min-h-96'>
      <h1 className='text-blue-900 font-bold text-3xl text-center my-4 animate-bounce '>Task Manager</h1>
        <div className='add text-lg font-bold underline mb-2 text-blue-700'>
          <h1>{isEditing ? 'Edit Task' : 'Add Task'}</h1>
        </div>
        <div className='flex '>
          <input
            onChange={HandleChange}
            value={todo}
            type='text'
            className='rounded-lg border border-blue-500 w-2/3  '
          />
          
          {isEditing ? (
            <button onClick={HandleUpdate} className='bg-sky-500 rounded-md mx-1 p-2 text-white'>
              Update
            </button>
          ) : (
            <button onClick={HandleAdd} className='bg-green-600 hover:bg-green-900 rounded-md mx-1 p-2 w-28 text-white flex justify-center items-center gap-2 '>
             <IoAddCircleSharp/> <span>Add</span>
            </button>
          )}
          
        </div>

        <div className="todos mt-4">
  <h1 className="text-xl font-bold underline mt-2 text-blue-700">Your Tasks</h1>
  {todos.length === 0 && <div className="text-green-600">No Tasks Pending</div>}
  
  {todos.map((item) => {
    const remainingTimeText = item.remainingTime === "time out"
      ? "time out"
      : item.remainingTime !== null
      ? `${item.remainingTime}`
      : "No time set";

    return (
      <div
        key={item.id}
        className="flex flex-col sm:flex-row items-center text-white my-3 bg-blue-600 p-3 rounded-lg"
      >
        <div className={item.isCompleted ? "line-through w-full sm:w-1/2" : "w-full sm:w-1/2 flex justify-between"}>
          <input
            onChange={HandleCheckbox}
            value={item.isCompleted}
            name={item.id}
            type="checkbox"
            className="mr-4"
          />
          {item.todo} <span className="text-gray-300 text-sm">({remainingTimeText})</span>
        </div>

        <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-auto">
          <button
            onClick={HandleDel}
            name={item.id}
            className="bg-red-600  shadow-xl hover:bg-red-900 rounded-md p-2 text-white flex justify-center items-center gap-2 sm:p-1 sm:mx-1"
          >
            <MdDeleteForever /> Del
          </button>
          <button
            onClick={HandleEdit}
            name={item.id}
            className="bg-blue-900 hover:bg-blue-950 shadow-xl rounded-md p-2 text-white flex justify-center items-center gap-2 sm:p-1 sm:mx-1"
          >
            <CiEdit /> Edit
          </button>
          <button
            onClick={HandleTime}
            name={item.id}
            className="bg-gray-400 hover:bg-gray-600 shadow-xl  rounded-md p-2 text-white flex justify-center items-center gap-2 sm:p-1 sm:mx-1"
          >
            <IoTimer /> Set Timer
          </button>
        </div>
      </div>
    );
  })}
</div>
{/* im adding comment */ }
      </div>
    </>
  );
}

export default App;
