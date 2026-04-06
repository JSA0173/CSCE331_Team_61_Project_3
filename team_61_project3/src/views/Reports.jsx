function Report( {setView}){
    return (<>
        <h1>Reports</h1>
        <button class = 'button' id = 'managerbtn' onClick={() => setView('manager')}> Return to Manager Portal Home</button>
    </>)
}

export default Report