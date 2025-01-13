import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import FlightBoard from './FlightBoard';
import AddFlightPage from './AddFlightPage';


function App() {
  const [flights, setFlights] = useState([
    { id: 1, flightNumber: 'AB123', origin: 'São Paulo', destination: 'Rio de Janeiro', aircraft:'HB578', status: 'Boarding', time: '10:30' },
    { id: 2, flightNumber: 'CD456', origin: 'Brasília', destination: 'Salvador', status: 'Scheduled', time: '11:45' },
    { id: 3, flightNumber: 'EF789', origin: 'Curitiba', destination: 'Fortaleza', status: 'Cancelled', time: '12:15' }
  ]);

  const handleAddFlight = (newFlight) => {
    const flightToAdd = {
      ...newFlight,
      id: flights.length + 1
    };
    setFlights([...flights, flightToAdd]);
  };

  const handleEditFlight = (editedFlight) => {
    setFlights(flights.map(flight => 
      flight.id === editedFlight.id ? editedFlight : flight
    ));
  };

  const handleDeleteFlight = (flightId) => {
    setFlights(flights.filter(flight => flight.id !== flightId));
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route 
            path="/home" 
            element={
              <FlightBoard 
                flights={flights} 
                onEditFlight={handleEditFlight}
                onDeleteFlight={handleDeleteFlight}
              />
            } 
          />
        
          <Route 
            path="/form" 
            element={
              <AddFlightPage 
                onAddFlight={handleAddFlight} 
              />
            } 
          />
          <Route 
            path="/edit/:id" 
            element={
              <AddFlightPage 
                onAddFlight={handleEditFlight}
                isEdit={true}
                flights={flights}
              />
            } 
          />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
