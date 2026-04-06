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
                            <td>{emp.employeeId}</td>
                            <td>{emp.name}</td>
                            <td>${parseFloat(emp.salary).toFixed(2)}</td>
                            <td>{emp.job_title}</td>
                            <td>{emp.date_hired ? emp.date_hired.split('T')[0] : ''}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button class = "employeebutton" onClick={() => setView('manager')}>Return to Manager Portal Home</button>
        </>
    );
}

export default Employee;