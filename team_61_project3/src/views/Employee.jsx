function Employee( {setView}){
    return (<>
        <h1>Employees</h1>
        <button class = 'button' id = 'managerbtn' onClick={() => setView('manager')}> Return to Manager Portal Home</button>
    </>)
}

export default Employee