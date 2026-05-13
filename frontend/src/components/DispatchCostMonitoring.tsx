import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, Fuel, Clock, MapPin } from 'lucide-react';
import type { CostSummary } from '../types';
import { dispatchApi } from '../services/api';

export default function DispatchCostMonitoring() {
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [technicianCosts, setTechnicianCosts] = useState<any[]>([]);
  const [repeatVisits, setRepeatVisits] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, techCostsRes, repeatRes] = await Promise.all([
        dispatchApi.getSummary(),
        dispatchApi.getByTechnician(),
        dispatchApi.getRepeatVisits(),
      ]);
      setSummary(summaryRes.data);
      setTechnicianCosts(techCostsRes.data);
      setRepeatVisits(repeatRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dispatch costs:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading cost data...</div>;
  }

  if (!summary) {
    return <div style={{ padding: '2rem' }}>No cost data available</div>;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '1.5rem', 
        background: 'var(--bg-primary)', 
        borderBottom: '1px solid var(--border-color)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <DollarSign size={24} color="var(--primary-red)" />
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Dispatch Cost Monitoring</h2>
        </div>
        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Track operational costs, fuel expenses, and efficiency metrics
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {/* Total Cost */}
          <div className="card" style={{ background: 'var(--primary-red)', color: 'white' }}>
            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', opacity: 0.9 }}>
              Total Cost
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {formatCurrency(summary.totalCost)}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              {summary.recordCount} dispatch records
            </div>
          </div>

          {/* Fuel Cost */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Fuel size={16} color="var(--primary-red)" />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Fuel Cost</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {formatCurrency(summary.totalFuelCost)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {summary.totalTravelDistance.toFixed(1)} km traveled
            </div>
          </div>

          {/* Overtime Cost */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Clock size={16} color="var(--primary-red)" />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Overtime Cost</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {formatCurrency(summary.totalOvertimeCost)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {Math.round(summary.totalTravelTime / 60)} hours total
            </div>
          </div>

          {/* Repair Cost */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <TrendingUp size={16} color="var(--primary-red)" />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Repair Cost</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {formatCurrency(summary.totalRepairCost)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Materials & parts
            </div>
          </div>
        </div>

        {/* Repeat Visits Alert */}
        {repeatVisits && repeatVisits.totalRepeatVisits > 0 && (
          <div style={{
            padding: '1rem',
            background: 'var(--primary-red-light)',
            border: '1px solid var(--primary-red)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <AlertCircle size={24} color="var(--primary-red)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--primary-red)', marginBottom: '0.25rem' }}>
                {repeatVisits.totalRepeatVisits} Repeat Visits Detected
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Additional cost: {formatCurrency(repeatVisits.totalRepeatCost)} • Review service quality
              </div>
            </div>
          </div>
        )}

        {/* Technician Cost Breakdown */}
        <div className="card">
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>
            Cost by Technician
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600 }}>Technician</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 600 }}>Jobs</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 600 }}>Distance</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 600 }}>Fuel</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 600 }}>Overtime</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 600 }}>Repairs</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 600 }}>Repeat</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 600 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {technicianCosts
                  .sort((a, b) => {
                    const totalA = a.totalFuelCost + a.totalOvertimeCost + a.totalRepairCost;
                    const totalB = b.totalFuelCost + b.totalOvertimeCost + b.totalRepairCost;
                    return totalB - totalA;
                  })
                  .map((tech, index) => {
                    const total = tech.totalFuelCost + tech.totalOvertimeCost + tech.totalRepairCost;
                    return (
                      <tr 
                        key={tech.technicianId}
                        style={{ 
                          borderBottom: '1px solid var(--border-color)',
                          background: index % 2 === 0 ? 'transparent' : 'var(--bg-secondary)'
                        }}
                      >
                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{tech.technicianId}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>{tech.jobCount}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>{tech.totalDistance.toFixed(1)} km</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>{formatCurrency(tech.totalFuelCost)}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>{formatCurrency(tech.totalOvertimeCost)}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>{formatCurrency(tech.totalRepairCost)}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          {tech.repeatVisits > 0 && (
                            <span style={{ color: 'var(--primary-red)', fontWeight: 600 }}>
                              {tech.repeatVisits}
                            </span>
                          )}
                          {tech.repeatVisits === 0 && '-'}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>
                          {formatCurrency(total)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost Breakdown Chart (Simple Bar Representation) */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>
            Cost Distribution
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Fuel */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>Fuel Cost</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(summary.totalFuelCost)}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-tertiary)', position: 'relative' }}>
                <div style={{
                  height: '100%',
                  width: `${(summary.totalFuelCost / summary.totalCost) * 100}%`,
                  background: 'var(--primary-red)',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            {/* Overtime */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>Overtime Cost</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(summary.totalOvertimeCost)}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-tertiary)', position: 'relative' }}>
                <div style={{
                  height: '100%',
                  width: `${(summary.totalOvertimeCost / summary.totalCost) * 100}%`,
                  background: '#f59e0b',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            {/* Repair */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>Repair Cost</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(summary.totalRepairCost)}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-tertiary)', position: 'relative' }}>
                <div style={{
                  height: '100%',
                  width: `${(summary.totalRepairCost / summary.totalCost) * 100}%`,
                  background: '#3b82f6',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
