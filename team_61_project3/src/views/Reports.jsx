import { useState } from 'react';
import ProfileIcon from './ProfileIcon';
import './Report.css';

function Report({ setView, profile }) {
    const [zReportRun, setZReportRun] = useState(false);

    const [puStartDate, setPuStartDate] = useState('');
    const [puStartTime, setPuStartTime] = useState('');
    const [puEndDate, setPuEndDate] = useState('');
    const [puEndTime, setPuEndTime] = useState('');
    const [puRows, setPuRows] = useState([]);

    //X-Report 
    const [xRows, setXRows] = useState([]);

    // Z-Report
    const [zRow, setZRow] = useState(null);

    //Sales Report
    const [srStartDate, setSrStartDate] = useState('');
    const [srStartTime, setSrStartTime] = useState('');
    const [srEndDate, setSrEndDate] = useState('');
    const [srEndTime, setSrEndTime] = useState('');
    const [srRows, setSrRows] = useState([]);

    // Which accordion section is open
    const [openSection, setOpenSection] = useState(null);

    function toggleSection(name) {
        setOpenSection(openSection === name ? null : name);
    }

    async function genProductUsage() {
        try {
            const res = await fetch('/api/reports/product-usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate: puStartDate,
                    startTime: puStartTime,
                    endDate: puEndDate,
                    endTime: puEndTime
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPuRows(data);
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    async function genXReport() {
        try {
            const res = await fetch('/api/reports/x-report');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setXRows(data);
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    async function genZReport() {
        if (zReportRun) {
            alert('Z-Report has already been generated for today.');
            return;
        }
        try {
            const res = await fetch('/api/reports/z-report');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setZRow(data);
            setZReportRun(true);
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    async function genSalesReport() {
        try {
            const res = await fetch('/api/reports/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate: srStartDate,
                    startTime: srStartTime,
                    endDate: srEndDate,
                    endTime: srEndTime
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSrRows(data);
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    return (
        <>
            <ProfileIcon profile={profile} setView={setView} />
            <h1>Reports</h1>

            {/* Product Usage */}
            <div className='accordion-item'>
                <div className='accordion-header' onClick={() => toggleSection('pu')}>
                    Product Usage Chart {openSection === 'pu' ? '▲' : '▼'}
                </div>
                {openSection === 'pu' && (
                    <div className='accordion-body'>
                        <input placeholder='Start Date (yyyy-mm-dd)' value={puStartDate} onChange={e => setPuStartDate(e.target.value)} />
                        <input placeholder='Start Time (hh:mm:ss)' value={puStartTime} onChange={e => setPuStartTime(e.target.value)} />
                        <input placeholder='End Date (yyyy-mm-dd)' value={puEndDate} onChange={e => setPuEndDate(e.target.value)} />
                        <input placeholder='End Time (hh:mm:ss)' value={puEndTime} onChange={e => setPuEndTime(e.target.value)} />
                        <button className='employeebutton' onClick={genProductUsage}>Generate Report</button>

                        <table className='data-table'>
                            <thead>
                                <tr>
                                    <th className='tableheader'>Name</th>
                                    <th className='tableheader'>Item ID</th>
                                    <th className='tableheader'>Total Used</th>
                                </tr>
                            </thead>
                            <tbody>
                                {puRows.map((r, i) => (
                                    <tr key={i}>
                                        <td className='odd'>{r.inventory_name}</td>
                                        <td className='even'>{r.item_id}</td>
                                        <td className='odd'>{r.total_used}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* X-Report */}
            <div className='accordion-item'>
                <div className='accordion-header' onClick={() => toggleSection('x')}>
                    X-Report (Sales per Hour Today) {openSection === 'x' ? '▲' : '▼'}
                </div>
                {openSection === 'x' && (
                    <div className='accordion-body'>
                        <button className='employeebutton' onClick={genXReport}>Generate Report</button>
                        <table className='data-table'>
                            <thead>
                                <tr>
                                    <th className='tableheader'>Hour</th>
                                    <th className='tableheader'>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {xRows.map((r, i) => (
                                    <tr key={i}>
                                        <td className='odd'>{r.order_hour}:00</td>
                                        <td className='even'>${parseFloat(r.revenue).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Z-Report */}
            <div className='accordion-item'>
                <div className='accordion-header' onClick={() => toggleSection('z')}>
                    Z-Report (Daily Totals — Once Per Day) {openSection === 'z' ? '▲' : '▼'}
                </div>
                {openSection === 'z' && (
                    <div className='accordion-body'>
                        <button className='employeebutton' onClick={genZReport} disabled={zReportRun}>
                            Generate Report
                        </button>
                        {zRow && (
                            <table className='data-table'>
                                <thead>
                                    <tr>
                                        <th className='tableheader'>Total Sales</th>
                                        <th className='tableheader'>Total Orders</th>
                                        <th className='tableheader'>Total Items</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className='odd'>${parseFloat(zRow.total_sales).toFixed(2)}</td>
                                        <td className='even'>{zRow.total_orders}</td>
                                        <td className='odd'>{zRow.total_items}</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Sales Report */}
            <div className='accordion-item'>
                <div className='accordion-header' onClick={() => toggleSection('sr')}>
                    Sales Report {openSection === 'sr' ? '▲' : '▼'}
                </div>
                {openSection === 'sr' && (
                    <div className='accordion-body'>
                        <input placeholder='Start Date (yyyy-mm-dd)' value={srStartDate} onChange={e => setSrStartDate(e.target.value)} />
                        <input placeholder='Start Time (hh:mm:ss)' value={srStartTime} onChange={e => setSrStartTime(e.target.value)} />
                        <input placeholder='End Date (yyyy-mm-dd)' value={srEndDate} onChange={e => setSrEndDate(e.target.value)} />
                        <input placeholder='End Time (hh:mm:ss)' value={srEndTime} onChange={e => setSrEndTime(e.target.value)} />
                        <button className='employeebutton' onClick={genSalesReport}>Generate Report</button>

                        <table className='data-table'>
                            <thead>
                                <tr>
                                    <th className='tableheader'>Name</th>
                                    <th className='tableheader'>Item ID</th>
                                    <th className='tableheader'>Total Sold</th>
                                    <th className='tableheader'>Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {srRows.map((r, i) => (
                                    <tr key={i}>
                                        <td className='odd'>{r.name}</td>
                                        <td className='even'>{r.itemId}</td>
                                        <td className='odd'>{r.total}</td>
                                        <td className='even'>${parseFloat(r.total_revenue).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <button className='employeebutton' onClick={() => setView('manager')}>
                Return to Manager Portal Home
            </button>
        </>
    );
}

export default Report;