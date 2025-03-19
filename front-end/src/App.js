import React, { useEffect, useState } from 'react';
import { getWardens } from './api';

function App() {
  const [wardens, setWardens] = useState([]);

  useEffect(() => {
    getWardens().then(setWardens);
  }, []);

    return (
        <div>
            <h1>Warden Tracker</h1>
            <p>FML I hope this works</p>
        </div>
    );
}

export default App;

