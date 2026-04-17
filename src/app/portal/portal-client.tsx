"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Select } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle2, Clock, FileText, Loader2, Plus } from "lucide-react";

type RequestType = "outage" | "billing" | "start_service" | "stop_service" | "other";
type Priority = "low" | "medium" | "high";

const typeLabels: Record<RequestType, string> = {
  outage: "Outage Report",
  billing: "Billing Issue",
  start_service: "Start Service",
  stop_service: "Stop Service",
  other: "Other Inquiry",
};

const priorityColors: Record<string, "success" | "warning" | "destructive" | "default"> = {
  low: "success",
  medium: "warning",
  high: "destructive",
};

const statusColors: Record<string, "secondary" | "warning" | "success" | "destructive" | "default"> = {
  submitted: "secondary",
  in_progress: "warning",
  resolved: "success",
  rejected: "destructive",
  closed: "default",
};

export default function PortalClient(): React.ReactElement {
  const utils = api.useUtils();

  const [type, setType] = useState<RequestType>("outage");
  const [priority, setPriority] = useState<Priority>("low");
  const [description, setDescription] = useState("");

  const { data: requests, isLoading } = api.serviceRequests.listMine.useQuery();

  const createRequest = api.serviceRequests.create.useMutation({
    onSuccess: () => {
      void utils.serviceRequests.listMine.invalidate();
      setType("outage");
      setPriority("low");
      setDescription("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest.mutate({ type, priority, description });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Create Request Form */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus size={20} className="text-indigo-600" />
              New Request
            </CardTitle>
            <CardDescription>Submit a new service request to our support team.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Request Type</Label>
                <Select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as RequestType)}
                >
                  <option value="outage">Outage Report</option>
                  <option value="billing">Billing Issue</option>
                  <option value="start_service">Start Service</option>
                  <option value="stop_service">Stop Service</option>
                  <option value="other">Other Inquiry</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide details about your request (10-2000 characters)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  minLength={10}
                  maxLength={2000}
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={createRequest.isPending || description.length < 10}
                className="w-full"
              >
                {createRequest.isPending ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Requests List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText size={22} className="text-slate-500" />
            My Requests
          </h2>
          <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
            {requests?.length || 0} Total
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Loader2 size={32} className="text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading your requests...</p>
          </div>
        ) : !requests || requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">All caught up!</h3>
            <p className="text-slate-500 max-w-sm">You haven't submitted any service requests yet. Use the form to create your first one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="overflow-hidden transition-all hover:shadow-md border-l-4 border-l-indigo-500">
                <CardContent className="p-0">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {typeLabels[request.type as RequestType] || request.type}
                          </h3>
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            #{request.reference}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500" suppressHydrationWarning>
                          <Clock size={14} />
                          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={priorityColors[request.priority] || "default"} className="capitalize shadow-none">
                          {request.priority} Priority
                        </Badge>
                        <Badge variant={statusColors[request.status] || "default"} className="capitalize shadow-none">
                          {request.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap">
                      {request.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}