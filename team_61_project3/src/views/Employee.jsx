import { useState, useEffect } from 'react';

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
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Salary</th>
                        <th>Job Title</th>
                        <th>Date Hired</th>
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
            <button onClick={() => setView('manager')}>Return to Manager Portal Home</button>
        </>
    );
}

export default Employee;