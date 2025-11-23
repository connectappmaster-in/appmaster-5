import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Eye, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface TicketTableViewProps {
  tickets: any[];
  selectedIds: number[];
  onSelectTicket: (id: number) => void;
  onSelectAll: (checked: boolean) => void;
}

export const TicketTableView = ({ 
  tickets, 
  selectedIds, 
  onSelectTicket, 
  onSelectAll 
}: TicketTableViewProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'on_hold': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'high': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'low': return 'bg-green-500 hover:bg-green-600 text-white';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === tickets.length && tickets.length > 0}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Ticket #</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(ticket.id)}
                  onCheckedChange={() => onSelectTicket(ticket.id)}
                />
              </TableCell>
              <TableCell onClick={() => navigate(`/helpdesk/tickets/${ticket.id}`)}>
                <Badge variant="outline" className="font-mono">
                  {ticket.ticket_number}
                </Badge>
              </TableCell>
              <TableCell onClick={() => navigate(`/helpdesk/tickets/${ticket.id}`)}>
                <div className="max-w-xs">
                  <div className="font-medium truncate">{ticket.title}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {ticket.description}
                  </div>
                </div>
              </TableCell>
              <TableCell onClick={() => navigate(`/helpdesk/tickets/${ticket.id}`)}>
                <Badge variant="outline" className={getStatusColor(ticket.status)}>
                  {ticket.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell onClick={() => navigate(`/helpdesk/tickets/${ticket.id}`)}>
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </TableCell>
              <TableCell onClick={() => navigate(`/helpdesk/tickets/${ticket.id}`)}>
                {ticket.assignee?.name || (
                  <span className="text-muted-foreground italic">Unassigned</span>
                )}
              </TableCell>
              <TableCell onClick={() => navigate(`/helpdesk/tickets/${ticket.id}`)}>
                {ticket.category?.name || '-'}
              </TableCell>
              <TableCell onClick={() => navigate(`/helpdesk/tickets/${ticket.id}`)}>
                <div className="text-sm">
                  {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                </div>
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/helpdesk/tickets/${ticket.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
