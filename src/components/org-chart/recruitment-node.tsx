import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { OrgNode } from '@/types/org-chart';

interface RecruitmentNodeProps {
  data: OrgNode;
  isConnectable: boolean;
}

export default function RecruitmentNode({ data, isConnectable }: RecruitmentNodeProps) {
  if (!data.recruitmentData) {
    return null;
  }

  const { recruitmentData } = data;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'outline';
      case 'APPROVED': return 'default';
      case 'IN_PROGRESS': return 'default';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PLANNED': return '計画中';
      case 'APPROVED': return '承認済み';
      case 'IN_PROGRESS': return '進行中';
      default: return status;
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'LOW': return '低';
      case 'MEDIUM': return '中';
      case 'HIGH': return '高';
      case 'CRITICAL': return '緊急';
      default: return urgency;
    }
  };

  return (
    <div className="recruitment-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ borderRadius: 0 }}
      />
      
      <Card className="w-64 border-2 border-dashed border-blue-300 bg-blue-50 shadow-lg">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* ヘッダー */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-blue-900 leading-tight">
                  {data.name}
                </h3>
                <p className="text-xs text-blue-700 mt-1">
                  {data.department}
                </p>
              </div>
              <Badge variant={getUrgencyColor(recruitmentData.urgency)} className="text-xs">
                {getUrgencyText(recruitmentData.urgency)}
              </Badge>
            </div>

            {/* ステータス */}
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-blue-600" />
              <Badge variant={getStatusColor(recruitmentData.status)} className="text-xs">
                {getStatusText(recruitmentData.status)}
              </Badge>
            </div>

            {/* 採用予定日 */}
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(recruitmentData.target_hire_date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* 想定年収 */}
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <DollarSign className="h-3 w-3" />
              <span>{(recruitmentData.estimated_salary / 10000).toFixed(0)}万円</span>
            </div>

            {/* 必要スキル */}
            {recruitmentData.required_skills.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-blue-700">
                  <Users className="h-3 w-3" />
                  <span>スキル</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {recruitmentData.required_skills.slice(0, 3).map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs px-1 py-0 h-4"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {recruitmentData.required_skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                      +{recruitmentData.required_skills.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* 採用予定マーク */}
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                採用予定
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ borderRadius: 0 }}
      />
    </div>
  );
}