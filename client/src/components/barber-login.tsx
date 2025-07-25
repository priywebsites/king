import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scissors, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

interface LoginResponse {
  success: boolean;
  sessionId: string;
  barberName: string;
}

export default function BarberLogin() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    barberName: "Alex"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/barber/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: LoginResponse = await response.json();

      if (data.success) {
        // Store session in localStorage
        localStorage.setItem("barberSession", data.sessionId);
        localStorage.setItem("barberName", data.barberName);
        
        // Redirect to barber dashboard
        setLocation("/barber-panel");
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-dark-gray border-border-gray">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
              className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-white to-light-gray rounded-full flex items-center justify-center"
            >
              <Scissors className="w-8 h-8 text-black" />
            </motion.div>
            <CardTitle className="text-2xl font-montserrat font-bold text-white">
              Barber Login
            </CardTitle>
            <CardDescription className="text-light-gray">
              Access your barber dashboard to manage your schedule
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Username</label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="bg-medium-gray border-border-gray text-white placeholder-light-gray"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-medium-gray border-border-gray text-white placeholder-light-gray"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Select Your Name</label>
                <Select 
                  value={formData.barberName} 
                  onValueChange={(value) => setFormData({ ...formData, barberName: value })}
                >
                  <SelectTrigger className="bg-medium-gray border-border-gray text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-medium-gray border-border-gray">
                    <SelectItem value="Alex">Alex</SelectItem>
                    <SelectItem value="Yazan">Yazan</SelectItem>
                    <SelectItem value="Murad">Murad</SelectItem>
                    <SelectItem value="Moe">Moe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert className="border-red-500 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-500">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black hover:bg-light-gray font-semibold py-2 px-4 rounded-lg transition-all duration-300"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-light-gray">
                Use credentials: <br />
                <span className="font-mono text-white">testing123 / testing123</span>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                className="text-light-gray hover:text-white"
              >
                ← Back to Website
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}