function Inventory( {setView}){
    return (<>
        <h1>Inventory</h1>
        <button class = 'button' id = 'managerbtn' onClick={() => setView('manager')}> Return to Manager Portal Home</button>
    </>)
}

export default Inventory