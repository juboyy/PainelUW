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

  private readonly PANAMA_TIMEZONE = 'America/Panama';

  private convertUTCToPanama(utcDate: string): Date {
    // Criar data a partir da string UTC
    const date = new Date(utcDate);
    
    // Converter para horário do Panamá usando o próprio timezone do sistema
    return new Date(date.toLocaleString('en-US', {
      timeZone: this.PANAMA_TIMEZONE
    }));
  }

  private formatFlightTime(utcDate: string): string {
    // Converter diretamente para horário do Panamá usando o timezone correto
    const options: Intl.DateTimeFormatOptions = {
      timeZone: this.PANAMA_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour12: false
    };

    return new Date(utcDate).toLocaleString('en-US', options);
  }

  private getCurrentPanamaTime(): Date {
    // Obter horário atual do Panamá
    const now = new Date();
    return new Date(now.toLocaleString('en-US', {
      timeZone: this.PANAMA_TIMEZONE
    }));
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  async getAllFlights(): Promise<Flight[]> {
    try {
      const response = await this.api.get<ApiResponse>('/flights');
      
      if (!response.data || !response.data.flights) {
        return this.getMockFlights();
      }

      const nowInPanama = this.getCurrentPanamaTime();

      return response.data.flights
        .map((flight, index) => {
          const departurePanama = this.convertUTCToPanama(flight.departureTime);
          const timeDifference = departurePanama.getTime() - nowInPanama.getTime();
          
          return {
            id: index + 1,
            airline: String(index + 1),
            flight: flight.callSign || 'N/A',
            origin: flight.departure || '',
            destination: flight.destination || '',
            aircraft: flight.aircraftRegistration || '',
            status: this.getFlightStatus(flight.filingStatus, departurePanama, nowInPanama),
            time1: this.formatFlightTime(flight.departureTime),
            time2: this.formatFlightTime(flight.arrivalTime),
            departureTime: departurePanama.getTime(),
            departureDate: departurePanama,
            timeDifference
          };
        })
        .sort((a, b) => {
          // Verificar se os voos são do mesmo dia que hoje
          const isAToday = this.isSameDay(new Date(a.departureDate), nowInPanama);
          const isBToday = this.isSameDay(new Date(b.departureDate), nowInPanama);

          // Voos de hoje primeiro
          if (isAToday && !isBToday) return -1;
          if (!isAToday && isBToday) return 1;

          // Para voos do mesmo dia, ordenar por horário mais recente primeiro
          if (isAToday && isBToday) {
            return b.departureTime - a.departureTime;
          }

          // Para voos de outros dias, manter ordem cronológica reversa
          return b.departureTime - a.departureTime;
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