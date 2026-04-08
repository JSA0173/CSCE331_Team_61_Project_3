import './Price.jsx'
function Price( {setView}){
    return (<>
        <h1>Prices</h1>
        <button class = 'employeebutton' onClick={() => setView('manager')}> Return to Manager Portal Home</button>
        <button class = 'employeebutton'> Add Item</button>
        <button class = 'employeebutton'> Update Price</button>
        <button class = 'employeebutton'> Toggle Enabled</button>
    </>)
}

export default Price