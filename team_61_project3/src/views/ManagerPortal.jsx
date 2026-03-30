import './Manager.css'
function ManagerPortal({setView}){
    return(
        <>
            <h1>Manager Portal</h1>
            <div class = 'toprow'>
                <button id = 'employeebtn' onClick={() => setView('employee')}>Employees</button>
                <button id = 'reportbtn' onClick={() => setView('report')}>Reports</button>
            </div>
            <div class = 'bottomrow'>
                <button id = 'inventorybtn' onClick={() => setView('inventory')}>Inventory</button>
                <button id = 'pricebtn' onClick={() => setView('price')}>Prices</button>
            </div>
        </>
    )
    
}

export default ManagerPortal