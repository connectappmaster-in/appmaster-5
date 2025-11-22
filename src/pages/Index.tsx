import { Calculator } from "@/components/Calculator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Calculator
          </h1>
          <p className="text-muted-foreground">Simple & elegant calculations</p>
        </div>
        <Calculator />
      </div>
    </div>
  );
};

export default Index;
