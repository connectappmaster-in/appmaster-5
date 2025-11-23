import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { CreateTicketForm } from "./components/CreateTicketForm";
import { KBSuggestions } from "./components/KBSuggestions";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/helpdesk/tickets")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create New Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <CreateTicketForm 
                  onSearchChange={(query) => {
                    setSearchQuery(query);
                    setShowSuggestions(query.length > 3);
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {showSuggestions && searchQuery && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-4 w-4" />
                    Self-Service Solutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <KBSuggestions searchQuery={searchQuery} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Provide a clear, specific title</p>
                <p>• Include relevant details in the description</p>
                <p>• Select the correct category</p>
                <p>• Set appropriate priority</p>
                <p>• Attach screenshots if helpful</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
