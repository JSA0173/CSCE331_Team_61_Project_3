import { useState, useEffect } from 'react';
import './Employee.css'

function Employee({ setView }) {
    const [employees, setEmployees] = useState([]);

    function loadEmployees() {
        fetch('/api/employees')
            .then(res => res.json())
            .then(data => setEmployees(data))
            .catch(err => console.error(err));
    }

    useEffect(() => {
        loadEmployees();
    }, []);

    async function addEmployee() {
        const employeeId = prompt('Employee ID:');
        if (!employeeId) return;
        const name = prompt('Name:');
        if (!name) return;
        const salary = prompt('Salary:');
        if (!salary) return;
        const job_title = prompt('Job Title:');
        if (!job_title) return;
        const date_hired = prompt('Hire Date (yyyy-mm-dd):');
        if (!date_hired) return;
        const username = prompt('Login Username:');
        if (!username) return;
        const password = prompt('Login Password:');
        if (!password) return;
        const view = prompt('Cashier or Manager:');
        if (!view) return;

        try {
            const res = await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: parseInt(employeeId),
                    name,
                    salary: parseFloat(salary),
                    date_hired,
                    job_title,
                    username,
                    password,
                    view
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert('Employee added!');
            loadEmployees();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    async function editEmployee() {
        const id = prompt('Employee ID to edit:');
        if (!id) return;
        const name = prompt('New Name (leave blank to skip):');
        const salary = prompt('New Salary (leave blank to skip):');
        const job_title = prompt('New Job Title (leave blank to skip):');
        const date_hired = prompt('New Hire Date (leave blank to skip):');
        const username = prompt('New Username (leave blank to skip):');
        const password = prompt('New Password (leave blank to skip):');
        const view = prompt('New View - Cashier or Manager (leave blank to skip):');

        const body = {};
        if (name) body.name = name;
        if (salary) body.salary = parseFloat(salary);
        if (job_title) body.job_title = job_title;
        if (date_hired) body.date_hired = date_hired;
        if (username) body.username = username;
        if (password) body.password = password;
        if (view) body.view = view;

        try {
            const res = await fetch(`/api/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert('Employee updated!');
            loadEmployees();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    async function deleteEmployee() {
        const id = prompt('Employee ID to delete:');
        if (!id) return;
        if (!confirm(`Are you sure you want to delete employee ${id}?`)) return;

        try {
            const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert('Employee deleted!');
            loadEmployees();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    return (
        <>
            <h1>Employees</h1>
            <table className='data-table'>
                <thead>
                    <tr>
                        <th className='tableheader'>ID</th>
                        <th className='tableheader'>Name</th>
                        <th className='tableheader'>Salary</th>
                        <th className='tableheader'>Job Title</th>
                        <th className='tableheader'>Date Hired</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(emp => (
                        <tr key={emp.employeeId}>
                            <td className='odd'>{emp.employeeId}</td>
                            <td className='even'>{emp.name}</td>
                            <td className='odd'>${parseFloat(emp.salary).toFixed(2)}</td>
                            <td className='even'>{emp.job_title}</td>
                            <td className='odd'>{emp.date_hired ? emp.date_hired.split('T')[0] : ''}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="employeebutton" id='back' onClick={() => setView('manager')}>Return to Manager Portal Home</button>
            <button className="employeebutton" id='addemp' onClick={addEmployee}>Add Employee</button>
            <button className="employeebutton" id='editemp' onClick={editEmployee}>Edit Employee</button>
            <button className="employeebutton" id='deleteemp' onClick={deleteEmployee}>Delete Employee</button>
        </>
    );
}

export default Employee;
