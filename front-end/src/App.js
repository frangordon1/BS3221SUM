import React, { useState } from 'react';

function App() {
  // State to control the visibility of the map
  const [showMap, setShowMap] = useState(false);

  const handleClick = () => {
    setShowMap(true); // Show the map when the button is clicked
  };

  return (
    <div>
      <h1>Warden Tracker</h1>
      <p>FML I hope this works</p>

      {/* Button that toggles the map visibility */}
      <button 
        onClick={handleClick} 
        style={{
          backgroundColor: 'red',
          color: 'white',
          padding: '10px 20px',
          fontSize: '16px',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '5px'
        }}
      >
        Click Me Plz
      </button>

      {/* Conditionally render the iframe map */}
      {showMap && (
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8752239.762187598!2d6.91945926331598!3d-74.46786661555944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xb09dff882a7809e1%3A0xb08d0a385dc8c7c7!2sAntarctica!5e0!3m2!1sen!2suk!4v1742426398979!5m2!1sen!2suk"
          width="600"
          height="450"
          style={{ border: '0' }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Map - Antarctica"
        ></iframe>
      )}
    </div>
  );
}

export default App;




