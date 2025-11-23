import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, BookOpen, FileText, Folder, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function KnowledgeBaseModule() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: 1, name: "Getting Started", articles: 12, icon: "📚" },
    { id: 2, name: "Account Management", articles: 8, icon: "👤" },
    { id: 3, name: "Troubleshooting", articles: 24, icon: "🔧" },
    { id: 4, name: "Integrations", articles: 15, icon: "🔗" }
  ];

  const articles = [
    { id: 1, title: "How to Create Your First Ticket", category: "Getting Started", views: 1234, helpful: 45 },
    { id: 2, title: "Setting Up SLA Policies", category: "Getting Started", views: 892, helpful: 38 }
  ];

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-end mb-6">
        <Button><Plus className="h-4 w-4 mr-2" />New Article</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12 text-lg" />
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Folder className="h-5 w-5" />Browse by Category
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{category.articles} articles</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />Popular Articles
        </h3>
        <div className="space-y-3">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="outline">{article.category}</Badge>
                  <span>👁 {article.views} views</span>
                  <span className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" />{article.helpful}</span>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}