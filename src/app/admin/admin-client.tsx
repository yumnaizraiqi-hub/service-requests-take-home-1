"use client";

import { api } from "~/trpc/react";
import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Select } from "~/components/ui/select";
import { Loader2, Search, Filter, Inbox, ChevronRight, CheckCircle2, AlertCircle, XCircle, Clock } from "lucide-react";

type ServiceRequest = {
  id: string;
  reference: string;
  type: string;
  description: string;
  status: string;
  priority: string;
  createdAt: Date;
};

type Status = "in_progress" | "resolved" | "rejected" | "closed" | "submitted";

const statusColors: Record<string, "secondary" | "warning" | "success" | "destructive" | "default"> = {
  submitted: "secondary",
  in_progress: "warning",
  resolved: "success",
  rejected: "destructive",
  closed: "default",
};

const priorityColors: Record<string, "success" | "warning" | "destructive" | "default"> = {
  low: "success",
  medium: "warning",
  high: "destructive",
};

export default function AdminClient() {
  const utils = api.useUtils();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data, isLoading } = api.serviceRequests.listAll.useQuery({});

  const updateStatus = api.serviceRequests.updateStatus.useMutation({
    onMutate: ({ id }) => {
      setLoadingId(id);
    },
    onSettled: () => {
      setLoadingId(null);
    },
    onSuccess: async () => {
      await utils.serviceRequests.listAll.invalidate();
    },
    onError: (error) => {
      console.error("Status update failed:", error.message);
      alert(`Failed to update status: ${error.message}`);
    }
  });

  const handleStatus = (id: string, status: Status) => {
    updateStatus.mutate({ id, status });
  };

  const filteredData = data?.filter((req: ServiceRequest) => {
    if (filterStatus === "all") return true;
    return req.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Request Queue</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and respond to customer service requests.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto bg-white p-2 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2 pl-2 text-slate-500">
            <Filter size={16} />
            <span className="text-sm font-medium">Status:</span>
          </div>
          <Select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-[140px] h-8 border-none focus:ring-0 shadow-none bg-slate-50"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-24 border border-slate-200 rounded-xl bg-white shadow-sm">
          <Loader2 size={32} className="text-cyan-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading request queue...</p>
        </div>
      ) : !filteredData || filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 border border-slate-200 rounded-xl bg-white shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Inbox size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Queue is empty</h3>
          <p className="text-slate-500">No requests match the current filters.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredData.map((req: ServiceRequest) => {
            const isUpdating = loadingId === req.id;
            return (
            <Card key={req.id} className="overflow-hidden transition-shadow hover:shadow-md border-l-4 border-l-cyan-500">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Left: Info */}
                  <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-mono font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        #{req.reference}
                      </span>
                      <Badge variant={priorityColors[req.priority] || "default"} className="capitalize">
                        {req.priority}
                      </Badge>
                      <Badge variant={statusColors[req.status] || "default"} className="capitalize">
                        {req.status.replace("_", " ")}
                      </Badge>
                      <span className="text-sm text-slate-500 ml-auto flex items-center gap-1.5" suppressHydrationWarning>
                        <Clock size={14} />
                        {format(new Date(req.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 capitalize">
                      {req.type.replace("_", " ")}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {req.description}
                    </p>
                    
                    <Button variant="outline" size="sm" className="text-cyan-700 border-cyan-200 hover:bg-cyan-50">
                      View Details
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                  
                  {/* Right: Actions */}
                  <div className="p-6 w-full md:w-[280px] bg-slate-50 flex flex-col justify-center gap-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Quick Actions</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={req.status !== "submitted" || isUpdating}
                        className="w-full text-xs justify-start"
                        onClick={() => handleStatus(req.id, "in_progress")}
                      >
                        {isUpdating && req.status === "submitted" ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Clock size={14} className="mr-1.5 text-blue-500" />}
                        In Progress
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={req.status !== "in_progress" || isUpdating}
                        className="w-full text-xs justify-start"
                        onClick={() => handleStatus(req.id, "resolved")}
                      >
                        {isUpdating && req.status === "in_progress" ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <CheckCircle2 size={14} className="mr-1.5 text-green-500" />}
                        Resolve
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={(req.status !== "submitted" && req.status !== "in_progress") || isUpdating}
                        className="w-full text-xs justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleStatus(req.id, "rejected")}
                      >
                        {isUpdating && (req.status === "submitted" || req.status === "in_progress") ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <XCircle size={14} className="mr-1.5" />}
                        Reject
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={req.status !== "resolved" || isUpdating}
                        className="w-full text-xs justify-start"
                        onClick={() => handleStatus(req.id, "closed")}
                      >
                        {isUpdating && req.status === "resolved" ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <AlertCircle size={14} className="mr-1.5 text-slate-500" />}
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}