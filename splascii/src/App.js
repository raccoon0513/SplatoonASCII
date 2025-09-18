import './App.css';

function App() {
   const board = Array(64).fill(null);

  const renderBoard = board.map((_, index) => {
    return(
      <div className={index}>
        <p>testtest</p>
      </div>
    )
  });
  return (
    <div className="App">
      {renderBoard}
    </div>
  );
  
}

export default App;
