import React, { useState, useMemo } from 'react';
import { useLeads } from '../contexts/LeadContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Phone,
  Building2,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const LeadsPage = () => {
  const { leads, updateLeadStatus, assignLead, addNote, addLead } = useLeads();
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [addOpen, setAddOpen] = useState(false);

const [newLead, setNewLead] = useState({
  name: '',
  email: '',
  phone: '',
  company: '',
  service: '',
  source: 'Manual',
  notes: '',
});
const handleCreateLead = () => {
  if (!newLead.name.trim()) {
    toast.error('Name is required');
    return;
  }

  addLead(newLead);

  setNewLead({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    source: 'Manual',
    notes: '',
  });

  setAddOpen(false);
};


  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Dialog states
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const sources = useMemo(() => {
    return [...new Set(leads.map(lead => lead.source))];
  }, [leads]);

  const statuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
  const teamMembers = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Brown', 'Unassigned'];

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      
      return matchesSearch && matchesSource && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
  
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [leads, searchTerm, sourceFilter, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredLeads.slice(start, end);
  }, [filteredLeads, currentPage]);

  // Export functions
  const exportToExcel = () => {
    const exportData = filteredLeads.map(lead => ({
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone,
      Company: lead.company,
      Service: lead.service,
      Source: lead.source,
      Campaign: lead.campaign,
      Status: lead.status,
      'Assigned To': lead.assignedTo,
      Value: lead.value,
      'Created At': new Date(lead.createdAt).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel file downloaded successfully');
  };

  // const exportToPDF = () => {
  //   const doc = new jsPDF();
    
  //   doc.setFontSize(18);
  //   doc.text('Lead Report', 14, 22);
  //   doc.setFontSize(11);
  //   doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30);
    
  //   const tableData = filteredLeads.map(lead => [
  //     lead.name,
  //     lead.email,
  //     lead.source,
  //     lead.status,
  //     lead.assignedTo,
  //     `$${lead.value.toLocaleString()}`,
  //   ]);

  //   doc.autoTable({
  //     head: [['Name', 'Email', 'Source', 'Status', 'Assigned To', 'Value']],
  //     body: tableData,
  //     startY: 35,
  //     styles: { fontSize: 8 },
  //     headStyles: { fillColor: [33, 93, 199] },
  //   });

  //   doc.save(`leads_${new Date().toISOString().split('T')[0]}.pdf`);
  //   toast.success('PDF file downloaded successfully');
  // };

const exportToPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Lead Report", 14, 22);

  doc.setFontSize(11);
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    14,
    30
  );

  const tableData = filteredLeads.map(lead => [
    lead.name,
    lead.email,
    lead.source,
    lead.status,
    lead.assignedTo || "Unassigned",
    `$${lead.value?.toLocaleString() || 0}`,
  ]);

  autoTable(doc, {
    head: [['Name', 'Email', 'Source', 'Status', 'Assigned To', 'Value']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [33, 93, 199] },
  });

  doc.save(`leads_${new Date().toISOString().split("T")[0]}.pdf`);
  toast.success("PDF file downloaded successfully");
};
  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-info text-info-foreground';
      case 'Contacted':
        return 'bg-warning text-warning-foreground';
      case 'Qualified':
        return 'bg-accent text-accent-foreground';
      case 'Converted':
        return 'bg-success text-success-foreground';
      case 'Lost':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const handleStatusChange = (leadId, newStatus) => {
    updateLeadStatus(leadId, newStatus);
  };

  const handleAssign = (leadId, assignee) => {
    assignLead(leadId, assignee);
  };

  const handleViewDetails = (lead) => {
    setSelectedLead(lead);
    setDetailsOpen(true);
  };

  const handleAddNote = () => {
    if (noteText.trim() && selectedLead) {
      addNote(selectedLead.id, noteText);
      setNoteText('');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Leads Management</h1>
          <p className="text-muted-foreground">
            Showing {filteredLeads.length} of {leads.length} leads
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button onClick={() => setAddOpen(true)}>
  + Add Lead
</Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-md-custom border-border">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="shadow-md-custom border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th 
                    className="text-left p-4 font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('name')}
                  >
                    Name
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Contact</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Company</th>
                  <th 
                    className="text-left p-4 font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('source')}
                  >
                    Source
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Assigned To</th>
                  <th 
                    className="text-left p-4 font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('createdAt')}
                  >
                    Date
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map(lead => (
                  <tr 
                    key={lead.id} 
                    className="border-b border-border hover:bg-muted/50 transition-smooth"
                  >
                    <td className="p-4">
                      <div className="font-medium text-foreground">{lead.name}</div>
                      <div className="text-sm text-muted-foreground">{lead.service}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-foreground">
                          <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                          {lead.email}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {lead.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-foreground">
                        <Building2 className="h-3 w-3 mr-1 text-muted-foreground" />
                        {lead.company}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-foreground">{lead.source}</div>
                      <div className="text-xs text-muted-foreground">{lead.campaign}</div>
                    </td>
                    <td className="p-4">
                      <Select 
                        value={lead.status} 
                        onValueChange={(value) => handleStatusChange(lead.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4">
                      <Select 
                        value={lead.assignedTo} 
                        onValueChange={(value) => handleAssign(lead.id, value)}
                      >
                        <SelectTrigger className="w-36">
                          <div className="flex items-center text-sm">
                            <User className="h-3 w-3 mr-1" />
                            {lead.assignedTo}
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map(member => (
                            <SelectItem key={member} value={member}>{member}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(lead)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLeads.length)} of {filteredLeads.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lead Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              View and manage lead information
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Company</Label>
                  <p className="font-medium">{selectedLead.company}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedLead.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Source</Label>
                  <p className="font-medium">{selectedLead.source}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Campaign</Label>
                  <p className="font-medium">{selectedLead.campaign}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Service</Label>
                  <p className="font-medium">{selectedLead.service}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Value</Label>
                  <p className="font-medium">${selectedLead.value.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedLead.status)}>
                    {selectedLead.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Assigned To</Label>
                  <p className="font-medium">{selectedLead.assignedTo}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="font-medium">{new Date(selectedLead.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p className="font-medium">{new Date(selectedLead.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground mb-2 block">Notes</Label>
                <div className="bg-muted rounded-lg p-4 mb-3 max-h-32 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">{selectedLead.notes}</p>
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a new note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={handleAddNote} disabled={!noteText.trim()}>
                    Add Note
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Add New Lead</DialogTitle>
      <DialogDescription>
        Enter lead details
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-3">
      <Input
        placeholder="Name *"
        value={newLead.name}
        onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
      />

      <Input
        placeholder="Email"
        value={newLead.email}
        onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
      />

      <Input
        placeholder="Phone"
        value={newLead.phone}
        onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
      />

      <Input
        placeholder="Company"
        value={newLead.company}
        onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
      />

      <Input
        placeholder="Service"
        value={newLead.service}
        onChange={(e) => setNewLead({ ...newLead, service: e.target.value })}
      />

      <Textarea
        placeholder="Notes"
        value={newLead.notes}
        onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
      />

      <div className="flex gap-2 pt-4">
        <Button onClick={handleCreateLead}>Create Lead</Button>
        <Button variant="outline" onClick={() => setAddOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

    </div>
  );
};

export default LeadsPage;
