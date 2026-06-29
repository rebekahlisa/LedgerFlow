import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Styling configuration mapping a modern dark navy theme
const styles = {
  container: { backgroundColor: '#0a192f', color: '#e6f1ff', minHeight: '100vh', padding: '2rem', fontFamily: 'Segoe UI, sans-serif' },
  header: { borderBottom: '2px solid #172a45', paddingBottom: '1rem', marginBottom: '2rem' },
  title: { color: '#64ffda', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' },
  card: { backgroundColor: '#112240', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' },
  sectionTitle: { color: '#cbd5e1', marginTop: 0, borderBottom: '1px solid #233554', paddingBottom: '0.5rem' },
  formGroup: { marginBottom: '1.2rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#8892b0' },
  input: { width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #233554', backgroundColor: '#0a192f', color: '#fff', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#64ffda', color: '#0a192f', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' },
  sponsorRow: { backgroundColor: '#172a45', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' },
  badge: { display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: '#0a192f', color: '#64ffda' },
  checklist: { marginTop: '1rem', paddingLeft: '1rem' },
  checkItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.9rem' }
};

function App() {
  const [clubId, setClubId] = useState('club_alpha');
  const [eventId, setEventId] = useState('1');
  const [sponsors, setSponsors] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    company_name: '', bracket_type: '', payment_mode: '', amount_pledged: '',
    assigned_member: '', negotiation_notes: '', email_id: '', phone_number: ''
  });

  // Global Axios Configuration applying the selected dynamic workspace header
  const api = axios.create({
    headers: { 'x-club-id': clubId }
  });

  // Fetch data matching the active configuration
  const fetchSponsors = async () => {
    try {
      if (!eventId) return;
      const response = await api.get(`/events/${eventId}/sponsors`);
      setSponsors(response.data);
    } catch (err) {
      console.error("Error fetching CRM records:", err);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, [clubId, eventId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        event_id: parseInt(eventId),
        company_name: formData.company_name,
        bracket_type: formData.bracket_type,
        payment_mode: formData.payment_mode,
        amount_pledged: parseFloat(formData.amount_pledged),
        assigned_member: formData.assigned_member,
        negotiation_notes: formData.negotiation_notes || 'N/A',
        email_id: formData.email_id || 'N/A',
        phone_number: formData.phone_number || 'N/A',
        custom_deliverables: []
      };

      await api.post('/sponsors', payload);
      fetchSponsors(); // Refresh layout view data
      setFormData({ company_name: '', bracket_type: '', payment_mode: '', amount_pledged: '', assigned_member: '', negotiation_notes: '', email_id: '', phone_number: '' });
    } catch (err) {
      alert(err.response?.data?.detail || "Validation Error Encountered");
    }
  };

  const handleToggleDeliverable = async (deliverableId) => {
    try {
      await api.patch(`/deliverables/${deliverableId}/toggle`);
      fetchSponsors(); // Refresh layout view to trigger automatic pipeline update
    } catch (err) {
      console.error("Error toggling task execution state:", err);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>LedgerFlow CRM Portal</h1>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label style={styles.label}>Active Club Workspace ID</label>
            <input style={styles.input} value={clubId} onChange={(e) => setClubId(e.target.value)} />
          </div>
          <div>
            <label style={styles.label}>Target Event ID</label>
            <input style={styles.input} value={eventId} onChange={(e) => setEventId(e.target.value)} />
          </div>
        </div>
      </header>

      <main style={styles.grid}>
        {/* Onboarding Panel */}
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Sponsor Onboarding</h2>
          <form onSubmit={handleFormSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Company Name</label>
              <input style={styles.input} name="company_name" value={formData.company_name} onChange={handleInputChange} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Bracket Type</label>
              <input style={styles.input} name="bracket_type" value={formData.bracket_type} onChange={handleInputChange} placeholder="e.g., Title, Gold" required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Amount Pledged</label>
              <input style={styles.input} type="number" name="amount_pledged" value={formData.amount_pledged} onChange={handleInputChange} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Payment Mode</label>
              <input style={styles.input} name="payment_mode" value={formData.payment_mode} onChange={handleInputChange} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Assigned Member</label>
              <input style={styles.input} name="assigned_member" value={formData.assigned_member} onChange={handleInputChange} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input style={styles.input} name="phone_number" value={formData.phone_number} onChange={handleInputChange} />
            </div>
            <button type="submit" style={styles.button}>Register Sponsor Record</button>
          </form>
        </section>

        {/* Live Tracking View */}
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Live Sponsor Pipelines</h2>
          {sponsors.length === 0 ? (
            <p style={{ color: '#8892b0' }}>No active corporate accounts registered for this event profile.</p>
          ) : (
            sponsors.map((sponsor) => (
              <div key={sponsor.sponsor_id} style={styles.sponsorRow}>
                <div style={{ display: 'flex', justifyContent: 'bwtween', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, color: '#64ffda' }}>{sponsor.company_name}</h3>
                  <span style={styles.badge}>{sponsor.pipeline_status}</span>
                </div>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#8892b0' }}>
                  Tier: {sponsor.bracket_type} | Pledged: {sponsor.amount_pledged} | Lead: {sponsor.assigned_member}
                </p>
                
                <div style={styles.checklist}>
                  <strong style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Deliverables Checklist:</strong>
                  {sponsor.deliverables?.map((task) => (
                    <label key={task.deliv_id} style={styles.checkItem}>
                      <input 
                        type="checkbox" 
                        checked={task.is_executed} 
                        onChange={() => handleToggleDeliverable(task.deliv_id)} 
                      />
                      <span style={{ textDecoration: task.is_executed ? 'line-through' : 'none', color: task.is_executed ? '#8892b0' : '#e6f1ff' }}>
                        {task.task_name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default App;