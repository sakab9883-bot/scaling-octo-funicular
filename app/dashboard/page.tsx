"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, CreditCard, FolderOpen, Upload, TrendingUp } from "lucide-react";

interface DashboardData {
  totalClients: number;
  totalPayments: number;
  totalCategories: number;
  totalFiles: number;
  recentPayments: Array<{
    id: string;
    amount: number;
    status: string;
    description: string;
    created_at: string;
    clients: { name: string } | null;
  }>;
  recentClients: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    created_at: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalClients: 0,
    totalPayments: 0,
    totalCategories: 0,
    totalFiles: 0,
    recentPayments: [],
    recentClients: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      const [
        clientsRes,
        paymentsRes,
        categoriesRes,
        filesRes,
        recentPaymentsRes,
        recentClientsRes,
      ] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact" }),
        supabase.from("payments").select("id", { count: "exact" }),
        supabase.from("categories").select("id", { count: "exact" }),
        supabase.from("files").select("id", { count: "exact" }),
        supabase
          .from("payments")
          .select("id, amount, status, description, created_at, clients(name)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("clients")
          .select("id, name, email, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setData({
        totalClients: clientsRes.count || 0,
        totalPayments: paymentsRes.count || 0,
        totalCategories: categoriesRes.count || 0,
        totalFiles: filesRes.count || 0,
        recentPayments: recentPaymentsRes.data || [],
        recentClients: recentClientsRes.data || [],
      });
      setLoading(false);
    };

    fetchData();
  }, []);

  const statusColors: Record<string, "default" | "success" | "warning" | "destructive"> = {
    paid: "success",
    active: "success",
    pending: "warning",
    inactive: "secondary" as "default",
    failed: "destructive",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your business.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Clients"
          value={loading ? "-" : data.totalClients}
          description="from last month"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Payments"
          value={loading ? "-" : data.totalPayments}
          description="from last month"
          icon={CreditCard}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Categories"
          value={loading ? "-" : data.totalCategories}
          description="total categories"
          icon={FolderOpen}
        />
        <StatsCard
          title="Files Uploaded"
          value={loading ? "-" : data.totalFiles}
          description="from last month"
          icon={Upload}
          trend={{ value: 24, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Payments
            </CardTitle>
            <CardDescription>Latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : data.recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments yet</p>
            ) : (
              <div className="space-y-4">
                {data.recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {payment.clients?.name || "Unknown Client"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.description || "No description"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(payment.amount)}
                      </p>
                      <Badge variant={statusColors[payment.status] || "default"}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Clients
            </CardTitle>
            <CardDescription>Newly added clients</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : data.recentClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clients yet</p>
            ) : (
              <div className="space-y-4">
                {data.recentClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={statusColors[client.status] || "default"}>
                        {client.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(client.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
