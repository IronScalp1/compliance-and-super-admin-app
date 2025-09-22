import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComplianceEngine } from '@/lib/compliance';
import { Users, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import type { ComplianceStats } from '@/types';

interface DashboardStatsProps {
  stats: ComplianceStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const scoreColor = ComplianceEngine.getScoreColor(stats.overall_score);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fellow Carer Score</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#0A0A0A]">
            <span className={scoreColor}>{stats.overall_score}%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Overall compliance rating
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Carers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#0A0A0A]">{stats.total_carers}</div>
          <div className="flex space-x-2 mt-2">
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              {stats.green_count} Green
            </Badge>
            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
              {stats.amber_count} Amber
            </Badge>
            <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
              {stats.red_count} Red
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.expiring_soon}</div>
          <p className="text-xs text-muted-foreground">
            Documents expire within 30 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          <FileText className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <p className="text-xs text-muted-foreground">
            Missing or expired documents
          </p>
        </CardContent>
      </Card>
    </div>
  );
}