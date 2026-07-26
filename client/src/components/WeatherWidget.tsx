/**
 * PhytoPathometric — WeatherWidget
 * Shows current weather conditions relevant to plant disease risk
 */
import { useState, useEffect } from 'react';
import { Cloud, Droplets, Thermometer, Wind, Sun, CloudRain, CloudSnow, Zap } from 'lucide-react';

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  description: string;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  diseaseRisk: 'low' | 'medium' | 'high';
  riskReason: string;
  city: string;
}

function getDiseaseRisk(humidity: number, temp: number): { risk: WeatherData['diseaseRisk']; reason: string } {
  if (humidity >= 80 && temp >= 18 && temp <= 30) {
    return { risk: 'high', reason: 'Alta umidade + temperatura ideal para fungos' };
  }
  if (humidity >= 65 && temp >= 15) {
    return { risk: 'medium', reason: 'Condições moderadas para doenças foliares' };
  }
  return { risk: 'low', reason: 'Baixo risco de infecção foliar' };
}

function getCondition(desc: string): WeatherData['condition'] {
  const d = desc.toLowerCase();
  if (d.includes('thunder') || d.includes('storm')) return 'stormy';
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower')) return 'rainy';
  if (d.includes('snow')) return 'snowy';
  if (d.includes('cloud') || d.includes('overcast') || d.includes('mist') || d.includes('fog')) return 'cloudy';
  return 'sunny';
}

const CONDITION_ICON = {
  sunny:  { icon: Sun,       color: '#F59E0B' },
  cloudy: { icon: Cloud,     color: '#94A3B8' },
  rainy:  { icon: CloudRain, color: '#3B82F6' },
  stormy: { icon: Zap,       color: '#7C3AED' },
  snowy:  { icon: CloudSnow, color: '#BAE6FD' },
};

const RISK_CONFIG = {
  low:    { label: 'Baixo Risco',   color: '#22C55E', bg: '#F0FDF4', border: '#BBF7D0' },
  medium: { label: 'Risco Médio',   color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
  high:   { label: 'Alto Risco',    color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
};

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      // Fallback: Brasília default
      const fallback: WeatherData = {
        temp: 24, humidity: 65, windSpeed: 12,
        description: 'Partly cloudy', condition: 'cloudy',
        city: 'Brasília', ...(() => { const r = getDiseaseRisk(65, 24); return { diseaseRisk: r.risk, riskReason: r.reason }; })(),
      };
      setWeather(fallback);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
          );
          if (!res.ok) throw new Error();
          const data = await res.json();
          const cur = data.current;
          const temp = Math.round(cur.temperature_2m);
          const humidity = cur.relative_humidity_2m;
          const windSpeed = Math.round(cur.wind_speed_10m);
          const code = cur.weather_code;

          let description = 'Parcialmente nublado';
          if (code === 0) description = 'Céu limpo';
          else if (code <= 3) description = 'Nublado';
          else if (code <= 67) description = 'Chuva';
          else if (code <= 77) description = 'Neve';
          else if (code <= 99) description = 'Tempestade';

          const { risk, reason } = getDiseaseRisk(humidity, temp);

          // Reverse geocode city name
          let city = 'Local';
          try {
            const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const geoData = await geo.json();
            city = geoData.address?.city || geoData.address?.town || geoData.address?.state || 'Local';
          } catch { /* ignore */ }

          setWeather({
            temp, humidity, windSpeed, description,
            condition: getCondition(description),
            diseaseRisk: risk, riskReason: reason, city,
          });
        } catch {
          setError(true);
        } finally {
          setLoading(false);
        }
      },
      () => {
        const fallback: WeatherData = {
          temp: 24, humidity: 65, windSpeed: 12,
          description: 'Parcialmente nublado', condition: 'cloudy',
          city: 'Brasília', ...(() => { const r = getDiseaseRisk(65, 24); return { diseaseRisk: r.risk, riskReason: r.reason }; })(),
        };
        setWeather(fallback);
        setLoading(false);
      },
      { timeout: 5000 }
    );
  }, []);

  if (loading) {
    return (
      <div className="card-phyto flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-secondary" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-secondary rounded w-1/2" />
          <div className="h-2 bg-secondary rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="card-phyto text-center py-4">
        <p className="text-xs text-muted-foreground">Dados climáticos indisponíveis</p>
      </div>
    );
  }

  const cond = CONDITION_ICON[weather.condition];
  const risk = RISK_CONFIG[weather.diseaseRisk];
  const CondIcon = cond.icon;

  return (
    <div className="card-phyto space-y-3">
      {/* Top row */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: cond.color + '20' }}>
          <CondIcon size={24} style={{ color: cond.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-2xl text-foreground">{weather.temp}°C</span>
            <span className="text-xs text-muted-foreground truncate">{weather.city}</span>
          </div>
          <p className="text-xs text-muted-foreground">{weather.description}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-secondary">
          <Droplets size={12} className="text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">{weather.humidity}%</p>
            <p className="text-[10px] text-muted-foreground">Umidade</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-secondary">
          <Wind size={12} className="text-slate-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">{weather.windSpeed}</p>
            <p className="text-[10px] text-muted-foreground">km/h</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-secondary">
          <Thermometer size={12} className="text-orange-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">{weather.temp}°</p>
            <p className="text-[10px] text-muted-foreground">Temp</p>
          </div>
        </div>
      </div>

      {/* Disease risk */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
        style={{ background: risk.bg, borderColor: risk.border }}>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: risk.color }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold" style={{ color: risk.color }}>{risk.label}</p>
          <p className="text-[10px] text-muted-foreground truncate">{weather.riskReason}</p>
        </div>
      </div>
    </div>
  );
}
