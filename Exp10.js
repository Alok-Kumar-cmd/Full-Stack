// main.js

const readline = require('readline');

// Set up the readline interface to get input from the command line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Our in-memory "database" - an array of employee objects
// Pre-populated with some data to match the example output
let employees = [
  { name: 'Alice', id: 'E101' },
  { name: 'Bob', id: 'E102' },
  { name: 'Charlie', id: 'E103' },
];

/**
 * Displays the main menu and prompts the user for a choice.
 */
function showMenu() {
  console.log('\n--- Employee Management System ---');
  console.log('1. Add Employee');
  console.log('2. List Employees');
  console.log('3. Remove Employee');
  console.log('4. Exit');

  rl.question('Enter your choice: ', (choice) => {
    switch (choice.trim()) {
      case '1':
        addEmployee();
        break;
      case '2':
        listEmployees();
        break;
      case '3':
        removeEmployee();
        break;
      case '4':
        console.log('Exiting application. Goodbye!');
        rl.close(); // Closes the readline interface and allows the program to exit
        break;
      default:
        console.log('Invalid choice. Please enter a number between 1 and 4.');
        showMenu(); // Show the menu again
        break;
    }
  });
}

/**
 * Lists all employees currently in the array.
 */
function listEmployees() {
  console.log('\n--- Employee List ---');
  if (employees.length === 0) {
    console.log('No employees found.');
  } else {
    employees.forEach((employee, index) => {
      console.log(`${index + 1}. Name: ${employee.name}, ID: ${employee.id}`);
    });
  }
  showMenu(); // Go back to the main menu
}

/**
 * Prompts the user for a new employee's name and ID and adds them to the array.
 */
function addEmployee() {
  rl.question('Enter employee name: ', (name) => {
    rl.question('Enter employee ID: ', (id) => {
      // Add the new employee object to the array
      employees.push({ name, id });
      console.log(`Employee ${name} (ID: ${id}) added successfully.`);
      showMenu(); // Go back to the main menu
    });
  });
}

/**
 * Prompts the user for an employee ID to remove and removes them from the array.
 */
function removeEmployee() {
  rl.question('Enter employee ID to remove: ', (idToRemove) => {
    // Find the index of the employee with the matching ID
    const indexToRemove = employees.findIndex(emp => emp.id === idToRemove);

    if (indexToRemove === -1) {
      console.log(`Employee with ID ${idToRemove} not found.`);
    } else {
      // Use splice to remove the employee from the array
      const removedEmployee = employees.splice(indexToRemove, 1)[0];
      console.log(`Employee ${removedEmployee.name} (ID: ${removedEmployee.id}) removed successfully.`);
    }
    showMenu(); // Go back to the main menu
  });
}

// Initial call to start the application
console.log('Welcome to the Employee Management System!');
showMenu();