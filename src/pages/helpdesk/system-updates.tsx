import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, Info } from "lucide-react";

export default function SystemUpdates() {
  const updates = [
    {
      id: 1,
      title: "New Ticket Automation Features",
      description: "Auto-assignment and SLA tracking now available",
      version: "v2.5.0",
      type: "feature",
      date: "2024-01-15"
    },
    {
      id: 2,
      title: "Security Patch Applied",
      description: "Important security updates have been deployed",
      version: "v2.4.1",
      type: "security",
      date: "2024-01-10"
    },
    {
      id: 3,
      title: "Performance Improvements",
      description: "Dashboard loading time reduced by 40%",
      version: "v2.4.0",
      type: "improvement",
      date: "2024-01-05"
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-blue-500';
      case 'security': return 'bg-red-500';
      case 'improvement': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return Bell;
      case 'security': return Info;
      case 'improvement': return CheckCircle2;
      default: return Info;
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-4">
        {updates.map((update) => {
          const Icon = getTypeIcon(update.type);
          
          return (
            <Card key={update.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getTypeColor(update.type)}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{update.title}</CardTitle>
                        <Badge variant="outline">{update.version}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{update.description}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{update.date}</span>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}