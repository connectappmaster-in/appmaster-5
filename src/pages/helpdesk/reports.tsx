import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Filter, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ReportsModule() {
  const reports = [
    { id: 1, title: "Ticket Volume Report", description: "Weekly ticket creation and resolution trends", period: "Last 7 days", trend: "up", value: "+12%" },
    { id: 2, title: "Agent Performance", description: "Response times and resolution rates", period: "This month", trend: "up", value: "+8%" },
    { id: 3, title: "SLA Compliance", description: "Service level agreement adherence", period: "This month", trend: "down", value: "-3%" },
    { id: 4, title: "Customer Satisfaction", description: "Average CSAT scores", period: "Last 30 days", trend: "up", value: "+5%" }
  ];

  const stats = [
    { label: "Total Tickets", value: "1,234", change: "+12%" },
    { label: "Avg Response Time", value: "2.4h", change: "-8%" },
    { label: "Resolution Rate", value: "94%", change: "+3%" },
    { label: "CSAT Score", value: "4.6/5", change: "+0.2" }
  ];

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-end gap-2 mb-6">
        <Button variant="outline"><Calendar className="h-4 w-4 mr-2" />Date Range</Button>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filter</Button>
        <Button><Download className="h-4 w-4 mr-2" />Export</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">{stat.value}</div>
                <Badge variant={stat.change.startsWith('+') ? "default" : "secondary"}>{stat.change}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-2">{report.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>
                {report.trend === 'up' ? <TrendingUp className="h-5 w-5 text-green-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{report.period}</span>
                <Badge variant={report.trend === 'up' ? "default" : "secondary"}>{report.value}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Ticket Trends</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Chart visualization coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}