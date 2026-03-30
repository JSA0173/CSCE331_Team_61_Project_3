import './Manager.css'
function ManagerPortal(){
    return(
        <>
            <h1>Manager Portal</h1>
            <div class = 'toprow'>
                <button class = 'button' id = 'employeebtn'>Employees</button>
                <button id = 'reportbtn'>Reports</button>
            </div>
            <div class = 'bottomrow'>
                <button id = 'inventorybtn'>Inventory</button>
                <button id = 'pricebtn'>Prices</button>
            </div>
        </>
    )
    
}

export default ManagerPortal