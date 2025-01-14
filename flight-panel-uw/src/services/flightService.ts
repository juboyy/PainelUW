import axios from 'axios';
import { Flight } from '../types/flightTypes';

const API_KEY = 's2NNDar9HUSM5MaOqHllc98OxRbK5mx5tRw1H7LD/ws=';
const API_URL = '/public/api/flights';
const DEFAULT_AIRLINE = 'Universal Weather';

interface ApiResponse {
  flights: {
    departure: string;
    destination: string;
    aircraftRegistration: string;
    filingStatus: string;
    departureTime: string;
    arrivalTime: string;
    callSign: string;
  }[];
  warnings: any[];
}

export class FlightService {
  private api = axios.create({
    baseURL: API_URL,
    headers: {
      'x-api-key': API_KEY,
      'Accept': 'application/json'
    }
  });

  private formatFlightTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${hours}:${minutes} ${month}/${day}`;
  }

  async getAllFlights(): Promise<Flight[]> {
    try {
      const response = await this.api.get<ApiResponse>('/flights');
      
      if (!response.data || !response.data.flights) {
        return this.getMockFlights();
      }

      const now = new Date().getTime();

      return response.data.flights
        .map((flight, index) => {
          const departureDate = new Date(flight.departureTime);
          const arrivalDate = new Date(flight.arrivalTime);
          const timeDifference = departureDate.getTime() - now;
          
          return {
            id: index + 1,
            airline: String(index + 1),
            flight: flight.callSign || 'N/A',
            origin: flight.departure || '',
            destination: flight.destination || '',
            aircraft: flight.aircraftRegistration || '',
            status: this.getFlightStatus(flight.filingStatus, new Date(flight.departureTime), new Date()),
            time1: this.formatFlightTime(departureDate),
            time2: this.formatFlightTime(arrivalDate),
            departureTime: departureDate.getTime(),
            timeDifference
          };
        })
        .sort((a, b) => {
          // Future flights first, sorted by closest to now
          if (a.timeDifference >= 0 && b.timeDifference >= 0) {
            return a.timeDifference - b.timeDifference;
          }
          // Past flights last, sorted by most recent
          if (a.timeDifference < 0 && b.timeDifference < 0) {
            return b.timeDifference - a.timeDifference;
          }
          // Future flights before past flights
          return a.timeDifference < 0 ? 1 : -1;
        });
    } catch (error: any) {
      console.error('Detailed API Error:', error);
      return this.getMockFlights();
    }
  }

  private getFlightStatus(filingStatus: string, departureTime: Date, now: Date): string {
    const timeDiff = departureTime.getTime() - now.getTime();
    const hoursUntilDeparture = timeDiff / (1000 * 60 * 60);

    if (filingStatus === 'None') {
      if (hoursUntilDeparture < 0) {
        return 'Completed';
      } else if (hoursUntilDeparture <= 1) {
        return 'Boarding';
      } else if (hoursUntilDeparture <= 2) {
        return 'Scheduled';
      }
    }
    
    return filingStatus;
  }

  private getMockFlights(): Flight[] {
    return [
      {
        id: 1,
        airline: DEFAULT_AIRLINE,
        flight: 'UCG321',
        origin: 'SEGU',
        destination: 'MPTO',
        aircraft: 'HP1939',
        status: 'None',
        time1: '2025-01-19T03:00:00Z',
        time2: '2025-01-19T04:47:57Z'
      },
      {
        id: 2,
        airline: DEFAULT_AIRLINE,
        flight: 'UVW456',
        origin: 'KIAH',
        destination: 'KMIA',
        aircraft: 'N456UV',
        status: 'Scheduled',
        time1: new Date().toISOString(),
        time2: new Date(Date.now() + 7200000).toISOString()
      }
    ];
  }
}

export default FlightService;