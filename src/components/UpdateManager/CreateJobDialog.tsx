import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCreateRolloutJob, RolloutJob } from "@/hooks/useUpdateManager";

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateJobDialog = ({ open, onOpenChange }: CreateJobDialogProps) => {
  const createJob = useCreateRolloutJob();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    job_type: "standard" as RolloutJob["job_type"],
    target_type: "all" as RolloutJob["target_type"],
    scheduled_date: undefined as Date | undefined,
    scheduled_time: "02:00",
    maintenance_window_start: "",
    maintenance_window_end: "",
    auto_reboot: false,
    max_retries: 3,
    rollback_on_failure: false,
    requires_approval: false,
  });

  const handleCreate = () => {
    const scheduledAt = formData.scheduled_date
      ? new Date(`${format(formData.scheduled_date, "yyyy-MM-dd")}T${formData.scheduled_time}:00`)
      : undefined;

    createJob.mutate(
      {
        name: formData.name,
        description: formData.description,
        job_type: formData.job_type,
        target_type: formData.target_type,
        scheduled_at: scheduledAt?.toISOString(),
        maintenance_window_start: formData.maintenance_window_start || null,
        maintenance_window_end: formData.maintenance_window_end || null,
        auto_reboot: formData.auto_reboot,
        max_retries: formData.max_retries,
        rollback_on_failure: formData.rollback_on_failure,
        requires_approval: formData.requires_approval,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: "",
      description: "",
      job_type: "standard",
      target_type: "all",
      scheduled_date: undefined,
      scheduled_time: "02:00",
      maintenance_window_start: "",
      maintenance_window_end: "",
      auto_reboot: false,
      max_retries: 3,
      rollback_on_failure: false,
      requires_approval: false,
    });
  };

  const canProceedStep1 = formData.name.trim().length > 0;
  const canProceedStep2 = true;

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) resetForm(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Rollout Job</DialogTitle>
          <DialogDescription>
            Step {step} of 3 — {step === 1 ? "Basic Info" : step === 2 ? "Targeting" : "Schedule & Options"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Job Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., December Security Updates"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this rollout includes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={formData.job_type}
                  onValueChange={(val) => setFormData({ ...formData, job_type: val as RolloutJob["job_type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard — Regular update rollout</SelectItem>
                    <SelectItem value="staged">Staged — Gradual deployment in waves</SelectItem>
                    <SelectItem value="emergency">Emergency — Critical security patch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Target Devices</Label>
                <Select
                  value={formData.target_type}
                  onValueChange={(val) => setFormData({ ...formData, target_type: val as RolloutJob["target_type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    <SelectItem value="selected">Selected Devices</SelectItem>
                    <SelectItem value="department">By Department</SelectItem>
                    <SelectItem value="location">By Location</SelectItem>
                    <SelectItem value="group">By Device Type</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.target_type === "all" && "This job will target all synced devices."}
                  {formData.target_type === "selected" && "You can select specific devices after creation."}
                  {formData.target_type === "department" && "Target devices in specific departments."}
                  {formData.target_type === "location" && "Target devices at specific locations."}
                  {formData.target_type === "group" && "Target laptops, desktops, or servers."}
                </p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label>Schedule</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !formData.scheduled_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scheduled_date ? format(formData.scheduled_date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.scheduled_date}
                        onSelect={(date) => setFormData({ ...formData, scheduled_date: date })}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    className="w-32"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to save as draft
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Reboot</Label>
                    <p className="text-xs text-muted-foreground">Automatically restart devices after updates</p>
                  </div>
                  <Switch
                    checked={formData.auto_reboot}
                    onCheckedChange={(val) => setFormData({ ...formData, auto_reboot: val })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rollback on Failure</Label>
                    <p className="text-xs text-muted-foreground">Revert changes if updates fail</p>
                  </div>
                  <Switch
                    checked={formData.rollback_on_failure}
                    onCheckedChange={(val) => setFormData({ ...formData, rollback_on_failure: val })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Requires Approval</Label>
                    <p className="text-xs text-muted-foreground">Job must be approved before running</p>
                  </div>
                  <Switch
                    checked={formData.requires_approval}
                    onCheckedChange={(val) => setFormData({ ...formData, requires_approval: val })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Retries</Label>
                  <Select
                    value={formData.max_retries.toString()}
                    onValueChange={(val) => setFormData({ ...formData, max_retries: parseInt(val) })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={createJob.isPending}>
              {createJob.isPending ? "Creating..." : "Create Job"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
