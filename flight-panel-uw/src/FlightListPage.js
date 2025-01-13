import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import logouw from './logos/logouw.png';
import './logoUW.css';
import './statusColors.css';

const FlightListPage = ({ flights, getStatusColor, onAddClick, onEditFlight, onDeleteFlight }) => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [hoveredRow, setHoveredRow] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formattedTime = currentTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const handleEdit = (flight) => {
        navigate(`/edit/${flight.id}`);
    };

    const handleDelete = (flightId) => {
        if (window.confirm('Are you sure you want to delete this flight?')) {
            onDeleteFlight(flightId);
        }
    };

    return (
        <div className="container py-4">
            <div className="row gx-4">
                <div className="col-12 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="h2 text-white">Flights</h1>
                        <div className="d-flex align-items-center">
                            <span className="text-white">{formattedTime}</span>
                        </div>
                    </div>

                    <div className="table-responsive" >
                        <table className="table table-striped table-dark">
                            <thead>
                                <tr>
                                    <th>Ariline</th>
                                    <th>Flight</th>
                                    <th>Origin</th>
                                    <th>Destination</th>
                                    <th>Aircraft</th>
                                    <th>Status</th>
                                    <th>Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {flights.slice().reverse().map((flight) => (
                                    <tr
                                        key={flight.id}
                                        onMouseEnter={() => setHoveredRow(flight.id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        className="position-relative"
                                    >
                                        <td>
                                            <img
                                                src={logouw}
                                                alt="Logouw"
                                                className="cia-logo img-fluid"
                                                style={{ maxWidth: '50px' }}
                                            />
                                        </td>
                                        <td>{flight.flightNumber}</td>
                                        <td>{flight.origin}</td>
                                        <td>{flight.destination}</td>
                                        <td>{flight.aircraft}</td>
                                        <td>
                                            <span className={getStatusColor(flight.status)}>
                                                {flight.status}
                                            </span>
                                        </td>
                                        <td>{flight.time}</td>
                                        <td>
                                            {hoveredRow === flight.id && (
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className="btn btn-link p-0 text-primary"
                                                        onClick={() => handleEdit(flight)}
                                                        title="Edit flight"
                                                    >
                                                        <i className="bi bi-pencil-square"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-link p-0 text-danger"
                                                        onClick={() => handleDelete(flight.id)}
                                                        title="Delete flight"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='mt-3'>
                        <div className="d-flex align-items-center">
                            <Button
                                variant="primary"
                                onClick={onAddClick}
                                className="me-3"
                            >
                                New Flight
                            </Button>
                        </div>
                    </div>
                </div> 
            </div> 
        </div> 
    );
};

export default FlightListPage;
