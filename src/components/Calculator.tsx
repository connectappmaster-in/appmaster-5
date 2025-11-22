import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Operation = "+" | "-" | "*" | "/" | null;

export const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay("0.");
      setNewNumber(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleOperation = (op: Operation) => {
    const current = parseFloat(display);
    
    if (previousValue !== null && operation && !newNumber) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    } else {
      setPreviousValue(current);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: Operation): number => {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return a / b;
      default:
        return b;
    }
  };

  const handleEquals = () => {
    if (previousValue !== null && operation) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handlePercent = () => {
    const current = parseFloat(display);
    setDisplay(String(current / 100));
  };

  const handleToggleSign = () => {
    const current = parseFloat(display);
    setDisplay(String(current * -1));
  };

  return (
    <Card className="w-full max-w-sm mx-auto p-6 bg-card shadow-[var(--shadow-medium)] border-border">
      <div className="bg-calculator-display rounded-2xl p-6 mb-6 min-h-[120px] flex items-end justify-end shadow-inner">
        <div className="text-calculator-display-text text-5xl font-mono font-light tracking-tight break-all text-right">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {/* Row 1 */}
        <Button
          variant="secondary"
          className="h-16 text-lg font-semibold bg-calculator-button hover:bg-calculator-button-hover text-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={handleClear}
        >
          AC
        </Button>
        <Button
          variant="secondary"
          className="h-16 text-lg font-semibold bg-calculator-button hover:bg-calculator-button-hover text-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={handleToggleSign}
        >
          +/-
        </Button>
        <Button
          variant="secondary"
          className="h-16 text-lg font-semibold bg-calculator-button hover:bg-calculator-button-hover text-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={handlePercent}
        >
          %
        </Button>
        <Button
          variant="default"
          className="h-16 text-2xl font-semibold bg-calculator-operator hover:bg-calculator-operator-hover text-primary-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={() => handleOperation("/")}
        >
          ÷
        </Button>

        {/* Row 2 */}
        <Button
          variant="outline"
          className="h-16 text-xl font-semibold bg-calculator-button hover:bg-calculator-button-hover text-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={() => handleNumber("7")}
        >
          7
        </Button>
        <Button
          variant="outline"
          className="h-16 text-xl font-semibold bg-calculator-button hover:bg-calculator-button-hover text-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={() => handleNumber("8")}
        >
          8
        </Button>
        <Button
          variant="outline"
          className="h-16 text-xl font-semibold bg-calculator-button hover:bg-calculator-button-hover text-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={() => handleNumber("9")}
        >
          9
        </Button>
        <Button
          variant="default"
          className="h-16 text-2xl font-semibold bg-calculator-operator hover:bg-calculator-operator-hover text-primary-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={() => handleOperation("*")}
        >
          ×
        </Button>

        {/* Row 3 */}
        <Button
          variant="outline"
          className="h-16 text-xl font-semibold bg-calculator-button hover:bg-calculator-button-hover text-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={() => handleNumber("4")}
        >
          4
        </Button>
        <Button
          variant="outline"
          className="h-16 text-xl font-semibold bg-calculator-button hover:bg-calculator-button-hover text-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={() => handleNumber("5")}
        >
          5
        </Button>
        <Button
          variant="outline"
          className="h-16 text-xl font-semibold bg-calculator-button hover:bg-calculator-button-hover text-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={() => handleNumber("6")}
        >
          6
        </Button>
        <Button
          variant="default"
          className="h-16 text-2xl font-semibold bg-calculator-operator hover:bg-calculator-operator-hover text-primary-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={() => handleOperation("-")}
        >
          −
        </Button>

        {/* Row 4 */}
        <Button
          variant="outline"
          className="h-16 text-xl font-semibold bg-calculator-button hover:bg-calculator-button-hover text-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={() => handleNumber("1")}
        >
          1
        </Button>
        <Button
          variant="outline"
          className="h-16 text-xl font-semibold bg-calculator-button hover:bg-calculator-button-hover text-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={() => handleNumber("2")}
        >
          2
        </Button>
        <Button
          variant="outline"
          className="h-16 text-xl font-semibold bg-calculator-button hover:bg-calculator-button-hover text-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={() => handleNumber("3")}
        >
          3
        </Button>
        <Button
          variant="default"
          className="h-16 text-2xl font-semibold bg-calculator-operator hover:bg-calculator-operator-hover text-primary-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={() => handleOperation("+")}
        >
          +
        </Button>

        {/* Row 5 */}
        <Button
          variant="outline"
          className="h-16 col-span-2 text-xl font-semibold bg-calculator-button hover:bg-calculator-button-hover text-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={() => handleNumber("0")}
        >
          0
        </Button>
        <Button
          variant="outline"
          className="h-16 text-xl font-semibold bg-calculator-button hover:bg-calculator-button-hover text-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={handleDecimal}
        >
          .
        </Button>
        <Button
          variant="default"
          className="h-16 text-2xl font-semibold bg-calculator-equals hover:bg-calculator-equals-hover text-secondary-foreground transition-[var(--transition-smooth)] active:scale-95"
          onClick={handleEquals}
        >
          =
        </Button>
      </div>
    </Card>
  );
};
