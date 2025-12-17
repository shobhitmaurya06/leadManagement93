import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
const LeadContext = createContext(null);
export const useLeads = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};
// Mock lead data generator
const generateMockLeads = (count = 50) => {
  const sources = ['Website', 'Meta Ads', 'Google Ads', 'LinkedIn', 'Referral'];
  const statuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
  const services = ['Web Development', 'Mobile App', 'SEO Services', 'Digital Marketing', 'Consulting'];
  const campaigns = ['Summer Sale', 'Product Launch', 'Brand Awareness', 'Lead Generation', 'Retargeting'];
  const teamMembers = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Brown', 'Unassigned'];

  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  const leads = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const createdDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    
    leads.push({
      id: `lead-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      company: `${lastName} ${['Corp', 'Inc', 'LLC', 'Group', 'Industries'][Math.floor(Math.random() * 5)]}`,
      service: services[Math.floor(Math.random() * sources.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      assignedTo: teamMembers[Math.floor(Math.random() * teamMembers.length)],
      notes: `Interested in ${services[Math.floor(Math.random() * services.length)]}.`,
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
      value: Math.floor(Math.random() * 50000) + 5000
    });
  }
  
  return leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const LeadProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const addLead = (leadData) => {
  const newLead = {
    id: `lead-${Date.now()}`,
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    company: leadData.company || 'N/A',
    service: leadData.service || 'General',
    source: leadData.source || 'Manual',
    campaign: leadData.campaign || 'Direct',
    status: 'New',
    assignedTo: 'Unassigned',
    notes: leadData.notes || '',
    value: leadData.value || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  setLeads((prev) => [newLead, ...prev]);
  toast.success('Lead added successfully');
};


  useEffect(() => {
    // Initialize with mock data
    const mockLeads = generateMockLeads(50);
    setLeads(mockLeads);
    setLoading(false);

    // Simulate real-time lead updates
    const interval = setInterval(() => {
      const shouldAddLead = Math.random() > 0.7; // 30% chance
      if (shouldAddLead) {
        const newLeads = generateMockLeads(1);
        setLeads(prev => [newLeads[0], ...prev]);
        toast.success('New Lead Received!', {
          description: `${newLeads[0].name} from ${newLeads[0].source}`
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const updateLeadStatus = (leadId, newStatus) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() }
        : lead
    ));
    toast.success('Lead status updated successfully');
  };

  const assignLead = (leadId, assignee) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, assignedTo: assignee, updatedAt: new Date().toISOString() }
        : lead
    ));
    toast.success(`Lead assigned to ${assignee}`);
  };
  const addNote = (leadId, note) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, notes: lead.notes + '\n' + note, updatedAt: new Date().toISOString() }
        : lead
    ));
    toast.success('Note added successfully');
  };
  const value = {
    leads,
    loading,
    updateLeadStatus,
    assignLead,
    addNote,
    addLead
  };
  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>;
};
