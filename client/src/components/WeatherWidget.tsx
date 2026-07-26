/**
 * PhytoPathometric — Premium WeatherWidget
 * Glassmorphism card with animated weather display
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Droplets, Thermometer, Wind, Sun, CloudRain, CloudSnow, Zap, MapPin } from 'lucide-react';

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
  if (humidity >= 80 && temp >= 18 && temp <= 30)
    return { risk: 'high', reason: 'Alta umidade + temperatura ideal para fungos' };
  if (humidity >= 65 && temp >= 15)
    return { risk: 'medium', reason: 'Condições moderadas para doenças foliares' };
  return { risk: 'low', reason: 'Baixo risco de infecção foliar' };
}

function getCondition(desc: string): WeatherData['condition'] {
  const d = desc.toLowerCase();
  if (d.includes('thunder') || d.includes('storm')) return 'stormy';
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower') || d.includes('chuva')) return 'rainy';
  if (d.includes('snow') || d.includes('neve')) return 'snowy';
  if (d.includes('cloud') || d.includes('overcast') || d.includes('mist') || d.includes('fog') || d.includes('nublado')) return 'cloudy';
  return 'sunny';
}

const CONDITION_CONFIG = {
  sunny:  { icon: Sun,       color: '#f59e0b', bg: '#fffbeb', emoji: '☀️' },
  cloudy: { icon: Cloud,     color: '#64748b', bg: '#f8fafc', emoji: '⛅' },
  rainy:  { icon: CloudRain, color: '#3b82f6', bg: '#eff6ff', emoji: '🌧️' },
  stormy: { icon: Zap,       color: '#7c3aed', bg: '#f5f3ff', emoji: '⛈️' },
  snowy:  { icon: CloudSnow, color: '#06b6d4', bg: '#ecfeff', emoji: '🌨️' },
};

const RISK_CONFIG = {
  low:    { label: 'Baixo Risco',  color: '#16a34a', bg: 'oklch(0.56 0.22 143 / 0.08)', border: 'oklch(0.56 0.22 143 / 0.20)', dot: '#22c55e' },
  medium: { label: 'Risco Médio',  color: '#b45309', bg: 'oklch(0.75 0.16 65 / 0.08)',  border: 'oklch(0.75 0.16 65 / 0.20)', dot: '#f59e0b' },
  high:   { label: 'Alto Risco',   color: '#dc2626', bg: 'oklch(0.57 0.24 27 / 0.08)',  border: 'oklch(0.57 0.24 27 / 0.20)', dot: '#ef4444' },
};

function StatPill({ icon: Icon, value, label, color }: { icon: React.ElementType; value: string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl flex-1"
      style={{ background: 'oklch(0.94 0.015 140 / 0.6)', border: '1px solid oklch(0.88 0.02 140 / 0.5)' }}>
      <Icon size={13} style={{ color, flexShrink: 0 }} />
      <div>
        <p className="text-xs font-bold text-foreground leading-none">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">{label}</p>
      </div>
    </div>
  );
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getFallback = (): WeatherData => {
      const { risk, reason } = getDiseaseRisk(65, 24);
      return { temp: 24, humidity: 65, windSpeed: 12, description: 'Parcialmente nublado', condition: 'cloudy', city: 'Brasília', diseaseRisk: risk, riskReason: reason };
    };

    if (!navigator.geolocation) {
      setWeather(getFallback()); setLoading(false); return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`);
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

          let city = 'Local';
          try {
            const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const geoData = await geo.json();
            city = geoData.address?.city || geoData.address?.town || geoData.address?.state || 'Local';
          } catch { /* ignore */ }

          setWeather({ temp, humidity, windSpeed, description, condition: getCondition(description), diseaseRisk: risk, riskReason: reason, city });
        } catch {
          setWeather(getFallback());
        } finally {
          setLoading(false);
        }
      },
      () => { setWeather(getFallback()); setLoading(false); },
      { timeout: 5000 }
    );
  }, []);

  if (loading) {
    return (
      <div className="glass-card animate-pulse">
        <div className="flex items-center gap-3">
          <div className="skeleton w-12 h-12 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-5 w-20 rounded-lg" />
            <div className="skeleton h-3 w-32 rounded" />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton flex-1 h-10 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="glass-card text-center py-6">
        <p className="text-xs text-muted-foreground">Dados climáticos indisponíveis</p>
      </div>
    );
  }

  const cond = CONDITION_CONFIG[weather.condition];
  const risk = RISK_CONFIG[weather.diseaseRisk];
  const CondIcon = cond.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card space-y-3"
    >
      {/* Top row */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: cond.color + '18', border: `1px solid ${cond.color}25` }}>
          <CondIcon size={22} style={{ color: cond.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-2xl text-foreground">{weather.temp}°C</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={10} />
              <span className="truncate">{weather.city}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{weather.description}</p>
        </div>
        <div className="text-2xl">{cond.emoji}</div>
      </div>

      {/* Stats row */}
      <div className="flex gap-2">
        <StatPill icon={Droplets}    value={`${weather.humidity}%`}       label="Umidade"  color="#3b82f6" />
        <StatPill icon={Wind}        value={`${weather.windSpeed} km/h`}  label="Vento"    color="#64748b" />
        <StatPill icon={Thermometer} value={`${weather.temp}°`}           label="Temp."    color="#f97316" />
      </div>

      {/* Disease risk */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl"
        style={{ background: risk.bg, border: `1px solid ${risk.border}` }}>
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: risk.dot }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold" style={{ color: risk.color }}>{risk.label}</p>
          <p className="text-[10px] text-muted-foreground truncate">{weather.riskReason}</p>
        </div>
      </div>
    </motion.div>
  );
}
