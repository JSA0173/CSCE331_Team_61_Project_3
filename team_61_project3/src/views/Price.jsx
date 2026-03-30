function Price( {setView}){
    return (<>
        <h1>Prices</h1>
        <button class = 'button' id = 'managerbtn' onClick={() => setView('manager')}> Return to Manager Portal Home</button>
    </>)
}

export default Price