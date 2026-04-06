import { useState, useEffect } from 'react';
import './Employee.css'
function Employee({ setView }) {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        fetch('/api/employees')
            .then(res => res.json())
            .then(data => setEmployees(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <>
            <h1>Employees</h1>
            <table class = 'data-table'>
                <thead>
                    <tr>
                        <th class = 'tableheader'>ID</th>
                        <th class = 'tableheader'>Name</th>
                        <th class = 'tableheader'>Salary</th>
                        <th class = 'tableheader'>Job Title</th>
                        <th class = 'tableheader'>Date Hired</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(emp => (
                        <tr key={emp.employeeId}>
                            <td class = 'odd'>{emp.employeeId}</td>
                            <td class = 'even'>{emp.name}</td>
                            <td class = 'odd'>${parseFloat(emp.salary).toFixed(2)}</td>
                            <td class = 'even'>{emp.job_title}</td>
                            <td class = 'odd'>{emp.date_hired ? emp.date_hired.split('T')[0] : ''}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button class = "employeebutton" id = 'back' onClick={() => setView('manager')}>Return to Manager Portal Home</button>
            <button class = "employeebutton" id = 'addemp'>Add Employee</button>
            <button class = "employeebutton" id = 'editemp'>Edit Employee</button>
            <button class = "employeebutton" id = 'deleteemp'>Delete Employee</button>
        </>
    );
}

export default Employee;