import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Eye, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface ProblemTableViewProps {
  problems: any[];
  selectedIds: number[];
  onSelectProblem: (id: number) => void;
  onSelectAll: (checked: boolean) => void;
  onEditProblem?: (problem: any) => void;
  onAssignProblem?: (problem: any) => void;
}

export const ProblemTableView = ({ 
  problems, 
  selectedIds, 
  onSelectProblem, 
  onSelectAll,
  onEditProblem,
  onAssignProblem
}: ProblemTableViewProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'known_error': return 'bg-red-100 text-red-800 border-red-300';
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
    <div className="border rounded-lg overflow-hidden text-[0.85rem]">
      <Table>
        <TableHeader>
          <TableRow className="h-9">
            <TableHead className="w-10 py-2">
              <Checkbox
                checked={selectedIds.length === problems.length && problems.length > 0}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead className="py-2">Problem #</TableHead>
            <TableHead className="py-2">Title</TableHead>
            <TableHead className="py-2">Status</TableHead>
            <TableHead className="py-2">Priority</TableHead>
            <TableHead className="py-2">Assignee</TableHead>
            <TableHead className="py-2">Created By</TableHead>
            <TableHead className="py-2">Category</TableHead>
            <TableHead className="py-2">Created</TableHead>
            <TableHead className="text-right py-2">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.map((problem) => (
            <TableRow key={problem.id} className="cursor-pointer hover:bg-muted/50 h-11">
              <TableCell onClick={(e) => e.stopPropagation()} className="py-1.5">
                <Checkbox
                  checked={selectedIds.includes(problem.id)}
                  onCheckedChange={() => onSelectProblem(problem.id)}
                />
              </TableCell>
              <TableCell onClick={() => navigate(`/helpdesk/problems/${problem.id}`)} className="py-1.5">
                <span className="font-mono text-[0.85rem]">
                  {problem.problem_number}
                </span>
              </TableCell>
              <TableCell onClick={() => navigate(`/helpdesk/problems/${problem.id}`)} className="py-1.5">
                <div className="max-w-sm">
                  <div className="font-medium truncate text-[0.85rem]">{problem.title}</div>
                  <div className="text-[0.75rem] text-muted-foreground truncate">
                    {problem.description}
                  </div>
                </div>
              </TableCell>
              <TableCell onClick={() => navigate(`/helpdesk/problems/${problem.id}`)} className="py-1.5">
                <Badge variant="outline" className={`${getStatusColor(problem.status)} text-[0.75rem] px-1.5 py-0.5`}>
                  {problem.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell onClick={() => navigate(`/helpdesk/problems/${problem.id}`)} className="py-1.5">
                <Badge className={`${getPriorityColor(problem.priority)} text-[0.75rem] px-1.5 py-0.5`}>
                  {problem.priority}
                </Badge>
              </TableCell>
              <TableCell onClick={() => navigate(`/helpdesk/problems/${problem.id}`)} className="py-1.5">
                {problem.assigned_to_user ? (
                  <span className="text-[0.85rem]">
                    {problem.assigned_to_user.name || problem.assigned_to_user.email}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic text-[0.8rem]">Unassigned</span>
                )}
              </TableCell>
              <TableCell onClick={() => navigate(`/helpdesk/problems/${problem.id}`)} className="py-1.5">
                {problem.created_by_user ? (
                  <span className="text-[0.85rem]">
                    {problem.created_by_user.name || problem.created_by_user.email}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic text-[0.8rem]">Unknown</span>
                )}
              </TableCell>
              <TableCell onClick={() => navigate(`/helpdesk/problems/${problem.id}`)} className="py-1.5">
                {problem.category?.name || '-'}
              </TableCell>
              <TableCell onClick={() => navigate(`/helpdesk/problems/${problem.id}`)} className="py-1.5">
                <div className="text-[0.8rem]">
                  {format(new Date(problem.created_at), 'MMM dd, yyyy')}
                </div>
              </TableCell>
              <TableCell className="text-right py-1.5" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => navigate(`/helpdesk/problems/${problem.id}`)}
                    title="View"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProblem?.(problem);
                    }}
                    title="Edit"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssignProblem?.(problem);
                    }}
                    title="Assign"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
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
