'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { OrgNode } from '@/types/org-chart';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Users } from 'lucide-react';

interface OrgChartNodeProps {
  data: OrgNode;
}

function OrgChartNode({ data }: OrgChartNodeProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getBadgeColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-purple-500';
      case 2: return 'bg-blue-500';
      case 3: return 'bg-green-500';
      case 4: return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative">
      {/* Top Handle for parent connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ top: -6 }}
      />
      
      <Card className="w-64 shadow-lg hover:shadow-xl transition-shadow duration-200 border-2 border-gray-200 hover:border-blue-300">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={data.profileImage || ''} />
              <AvatarFallback className="text-sm font-semibold">
                {getInitials(data.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm text-gray-900 truncate">
                  {data.name}
                </h3>
                {data.isManager && (
                  <Users className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {data.position}
              </p>
              
              <div className="flex items-center justify-between">
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-1 text-white ${getBadgeColor(data.level)}`}
                >
                  {data.department}
                </Badge>
                
                {data.email && (
                  <Mail className="h-3 w-3 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Handle for child connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ bottom: -6 }}
      />
    </div>
  );
}

export default memo(OrgChartNode);